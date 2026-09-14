import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Image,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import Slider from '@react-native-community/slider';
import {
  getMySettings,
  updateMySettings,
  type UserSettings,
} from '../services/settingsService';
import { AppGlassCard } from '../components/AppGlassCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';
const BORDER = '#F3F4F6';

const VOICES = [
  'Voz 1 (Masculina)',
  'Voz 2 (Feminina)',
  'Voz 3 (Masculina)',
  'Voz 4 (Feminina)',
];

const MUDO = require('../../assets/images/Luvia/luvas/mudo.png');
const SOM = require('../../assets/images/Luvia/luvas/alto.png');
const TARTARUGA = require('../../assets/images/Luvia/luvas/tartaruga.png');
const COELHO = require('../../assets/images/Luvia/luvas/coelho.png');
const CHECK = require('../../assets/images/Luvia/luvas/check.png');

function getVoiceLabel(voiceType: string) {
  return VOICES.includes(voiceType) ? voiceType : VOICES[0];
}

function getSpeechRateFromSlider(speed: number) {
  return 0.5 + (speed / 100) * 1.5;
}

function getSliderFromSpeechRate(speechRate: number) {
  return ((speechRate - 0.5) / 1.5) * 100;
}

type VoicePreferences = {
  volume: number;
  speed: number;
  selectedVoice: string;
  autoSpeak: boolean;
};

type LoadStatus = 'loading' | 'ready' | 'error';

function getVoicePreferences(settings: UserSettings): VoicePreferences {
  return {
    volume: settings.speechVolume * 100,
    speed: getSliderFromSpeechRate(settings.speechRate),
    selectedVoice: getVoiceLabel(settings.voiceType),
    autoSpeak: settings.autoSpeak,
  };
}

export default function VoiceSettingsScreen() {
  const [volume, setVolume] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const confirmedPreferencesRef = useRef<VoicePreferences | null>(null);
  const saveInFlightRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const progressAnim = useState(new Animated.Value(0))[0];

  function getFriendlyErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('refresh token') || message.includes('token expirado')) {
        return 'Sua sessão expirou. Entre novamente para continuar.';
      }

      return error.message;
    }

    return fallback;
  }

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      progressAnim.stopAnimation();
    };
  }, [progressAnim]);

  useEffect(() => {
    let isMounted = true;

    setLoadStatus('loading');
    setIsDropdownOpen(false);

    void getMySettings()
      .then((settings) => {
        if (!isMounted) {
          return;
        }

        const preferences = getVoicePreferences(settings);

        confirmedPreferencesRef.current = preferences;
        setVolume(preferences.volume);
        setSpeed(preferences.speed);
        setSelectedVoice(preferences.selectedVoice);
        setAutoSpeak(preferences.autoSpeak);
        setLoadStatus('ready');
      })
      .catch((error) => {
        if (isMounted) {
          setLoadStatus('error');
          Alert.alert(
            'Não foi possível carregar as preferências de voz',
            getFriendlyErrorMessage(error, 'Tente novamente em instantes.'),
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Tentar novamente',
                onPress: () => setLoadAttempt((attempt) => attempt + 1),
              },
            ]
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  async function handleSavePreferences() {
    if (loadStatus !== 'ready' || saveInFlightRef.current) {
      return;
    }

    saveInFlightRef.current = true;
    setIsSaving(true);
    setIsDropdownOpen(false);

    try {
      const settings = await updateMySettings({
        voiceType: selectedVoice,
        speechRate: getSpeechRateFromSlider(speed),
        speechVolume: volume / 100,
        autoSpeak,
      });

      if (!isMountedRef.current) {
        return;
      }

      const preferences = getVoicePreferences(settings);

      confirmedPreferencesRef.current = preferences;
      setVolume(preferences.volume);
      setSpeed(preferences.speed);
      setSelectedVoice(preferences.selectedVoice);
      setAutoSpeak(preferences.autoSpeak);
      setShowAlert(true);
      progressAnim.setValue(0);

      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && isMountedRef.current) {
          setShowAlert(false);
          router.back();
        }
      });
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      const confirmedPreferences = confirmedPreferencesRef.current;

      if (confirmedPreferences) {
        setVolume(confirmedPreferences.volume);
        setSpeed(confirmedPreferences.speed);
        setSelectedVoice(confirmedPreferences.selectedVoice);
        setAutoSpeak(confirmedPreferences.autoSpeak);
      }

      Alert.alert(
        'Não foi possível salvar',
        getFriendlyErrorMessage(error, 'Tente novamente em instantes.')
      );
    } finally {
      saveInFlightRef.current = false;

      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  }

  function toggleDropdown() {
    if (loadStatus !== 'ready' || isSaving) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDropdownOpen(!isDropdownOpen);
  }

  function selectVoice(voice: string) {
    setSelectedVoice(voice);
    toggleDropdown();
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonWrapper}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <GlassContainer style={StyleSheet.absoluteFill}>
              <GlassView style={styles.glassEffect} />
            </GlassContainer>
            <Feather name="chevron-left" size={28} color={BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personalizar Voz</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volume</Text>
            <View style={styles.separator} />
            <View style={styles.sliderRow}>
              <Image source={MUDO} style={styles.sliderIconImage} resizeMode="contain" />
              
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.sliderControl}
                  minimumValue={0}
                  maximumValue={100}
                  step={25}
                  value={volume}
                  onValueChange={setVolume}
                  disabled={loadStatus !== 'ready' || isSaving}
                  minimumTrackTintColor={BLUE}
                  maximumTrackTintColor={BORDER}
                  thumbTintColor={BRANCO}
                />
                <View style={styles.dotsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>
              </View>

              <Image source={SOM} style={styles.sliderIconImage} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Velocidade</Text>
            <View style={styles.separator} />
            <View style={styles.sliderRow}>
              <Image source={TARTARUGA} style={styles.sliderIconImage} resizeMode="contain" />
              
              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.sliderControl}
                  minimumValue={0}
                  maximumValue={100}
                  step={25}
                  value={speed}
                  onValueChange={setSpeed}
                  disabled={loadStatus !== 'ready' || isSaving}
                  minimumTrackTintColor={BLUE}
                  maximumTrackTintColor={BORDER}
                  thumbTintColor={BRANCO}
                />
                <View style={styles.dotsContainer}>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>
              </View>

              <Image source={COELHO} style={styles.sliderIconImage} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seleção da Voz</Text>
            <View style={styles.separator} />
            
            <AppGlassCard style={styles.dropdownCard}>

              <TouchableOpacity 
                style={styles.dropdownHeader} 
                activeOpacity={0.7} 
                onPress={toggleDropdown}
                disabled={loadStatus !== 'ready' || isSaving}
              >
                <Text style={[styles.dropdownHeaderText, isDropdownOpen && styles.dropdownHeaderTextSelected]}>
                  {selectedVoice}
                </Text>
                <Feather 
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={BLUE} 
                />
              </TouchableOpacity>

              {isDropdownOpen && (
                <View style={styles.dropdownList}>
                  {VOICES.map((voice, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.voiceItem}
                      activeOpacity={0.7}
                      onPress={() => selectVoice(voice)}
                      disabled={isSaving}
                    >
                      <Text style={[
                        styles.voiceItemText,
                        selectedVoice === voice && styles.voiceItemTextSelected
                      ]}>
                        {voice}
                      </Text>
                      {selectedVoice === voice && (
                        <Feather name="check" size={16} color={BLUE} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </AppGlassCard>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          {showAlert ? (
            <View style={styles.alertCard}>
              <View style={styles.alertContentRow}>
                <View style={styles.checkIconContainer}>
                  <Image 
                    source={CHECK}
                    style={styles.checkIcon} 
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.alertTextContainer}>
                  <Text style={styles.alertTitle}>Sucesso!</Text>
                  <Text style={styles.alertSubtitle}>Preferências de voz salvas com sucesso.</Text>
                </View>
              </View>
              <View style={styles.alertBarBackground}>
                <Animated.View style={[styles.alertBarFill, { width: progressWidth }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.mainButton,
                (loadStatus === 'loading' || isSaving) && styles.mainButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={
                loadStatus === 'error'
                  ? () => setLoadAttempt((attempt) => attempt + 1)
                  : handleSavePreferences
              }
              disabled={loadStatus === 'loading' || isSaving}
            >
              <Text style={styles.mainButtonText}>
                {loadStatus === 'loading'
                  ? 'Carregando...'
                  : loadStatus === 'error'
                    ? 'Tentar carregar novamente'
                    : isSaving
                      ? 'Salvando...'
                      : 'Salvar preferências'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRANCO,
  },
  container: {
    flex: 1,
    paddingHorizontal: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginTop: 20,
  },
  backButtonWrapper: {
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  glassEffect: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 130,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsM',
    color: MUTED,
    marginBottom: 12,
  },
  separator: {
    height: 1.5,
    backgroundColor: BORDER,
    marginBottom: 24,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderIconImage: {
    width: 32,
    height: 32,
    tintColor: MUTED,
  },
  sliderWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-start',
    marginHorizontal: 12,
    height: 50,
  },
  sliderControl: {
    width: '100%',
    height: 40,
    zIndex: 2,
  },
  dotsContainer: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    bottom: 18,
    zIndex: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  dropdownCard: {
    borderRadius: 34,
    width: '75%',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    height: 56,
    backgroundColor: 'transparent',
  },
  dropdownHeaderText: {
    fontSize: 13,
    fontFamily: 'PoppinsM',
    color: MUTED,
  },
  dropdownHeaderTextSelected: {
    color: BLUE,
  },
  dropdownList: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  voiceItemText: {
    fontSize: 13,
    fontFamily: 'PoppinsM',
    color: MUTED,
  },
  voiceItemTextSelected: {
    color: BLUE,
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 24,
    paddingTop: 20,
    backgroundColor: BRANCO,
  },
  mainButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonDisabled: {
    opacity: 0.65,
  },
  mainButtonText: {
    color: BRANCO,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'MazzardH-Medium',
  },
  alertCard: {
    width: '100%',
    backgroundColor: BLUE,
    borderRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  alertContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkIcon: {
    width: 32,
    height: 32,
    tintColor: BRANCO,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Poppins SemiBold',
    color: BRANCO,
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: BRANCO,
    opacity: 0.9,
  },
  alertBarBackground: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 0,
  },
  alertBarFill: {
    height: '100%',
    backgroundColor: '#00E676',
  },
});

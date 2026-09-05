import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Platform, 
  TouchableOpacity, 
  ScrollView,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';
const RED = '#FF3B30';
const BORDER = '#F3F4F6';

const ILUSTRACAO = require('../../assets/images/Luvia/luvas/planeta.png');
const INICIO = require('../../assets/images/Luvia/home/inicio.png'); 
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png'); 
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png'); 
const LUVAS = require('../../assets/images/Luvia/home/luvas.png'); 

const MUDO = require('../../assets/images/Luvia/luvas/mudo.png');
const SOM = require('../../assets/images/Luvia/luvas/alto.png'); 
const TARTARUGA = require('../../assets/images/Luvia/luvas/tartaruga.png');
const COELHO = require('../../assets/images/Luvia/luvas/coelho.png');

const VOICES = [
  'Voz 1 (Masculina)',
  'Voz 2 (Masculina)',
  'Voz 3 (Feminina)',
  'Voz 4 (Feminina)',
];

export default function GlovesScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();
  const [isConnected, setIsConnected] = useState(true); 
  
  const [volume, setVolume] = useState(25);
  const [speed, setSpeed] = useState(25);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  function toggleDropdown() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDropdownOpen(!isDropdownOpen);
  }

  function selectVoice(voice: string) {
    setSelectedVoice(voice);
    toggleDropdown();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
        {isConnected ? (
          <>
            <View style={styles.headerConnected}>
              <Text style={styles.headerTitleConnected}>Luvas</Text>
              <TouchableOpacity 
                style={styles.calibrationButton}
                activeOpacity={0.8}
                onPress={() => router.push('/calibration')}
              >
                <Text style={styles.calibrationButtonText}>Calibragem necessária</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ overflow: 'visible' }}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavigationContentInset }]}
              showsVerticalScrollIndicator={false}
            >
              
              <AppGlassCard style={styles.accuracyCard}>

                <View style={styles.accuracyContent}>
                  <Text style={styles.accuracySubtitle}>Suas luvas estão prontas para uso.</Text>
                  <View style={styles.accuracyRow}>
                    <Text style={styles.accuracyValue}>85%</Text>
                    <Text style={styles.accuracyLabel}> de precisão.</Text>
                  </View>
                </View>
              </AppGlassCard>

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
                  >
                    <Text style={[styles.dropdownHeaderText, isDropdownOpen && styles.dropdownHeaderTextSelected]}>
                      {selectedVoice}
                    </Text>
                    <Feather name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={20} color={BLUE} />
                  </TouchableOpacity>

                  {isDropdownOpen && (
                    <View style={styles.dropdownList}>
                      {VOICES.map((voice, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.voiceItem}
                          activeOpacity={0.7}
                          onPress={() => selectVoice(voice)}
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
          </>
        ) : (
          <View style={styles.content}>
            <Image 
              source={ILUSTRACAO} 
              style={styles.illustration} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>
              Nenhuma luva conectada ou{'\n'}encontrada.
            </Text>
            <Text style={styles.description}>
              O Luvia necessita da conexão via Bluetooth para{'\n'}
              funcionar. Se você já conectou, a página deve{'\n'}
              atualizar em instantes.
            </Text>
          </View>
        )}

      </View>

      <AppBottomNavigation activeRoute="gloves" />
    </SafeAreaView>
  );

  function NavItem({ source, label, active = false, onPress }: { source: any; label: string; active?: boolean; onPress?: () => void }) {
    return (
      <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={onPress}>
        <Image 
          source={source} 
          style={[styles.navIcon, active && styles.navIconActive]} 
          resizeMode="contain" 
        />
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRANCO,
  },
  container: {
    flex: 1,
  },
  headerConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 34,
    backgroundColor: BRANCO,
    zIndex: 20,
    marginBottom: -20,
  },
  headerTitleConnected: {
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  calibrationButton: {
    backgroundColor: RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  calibrationButtonText: {
    color: BRANCO,
    fontSize: 12,
    fontFamily: 'MazzardH-Medium',
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 130,
    paddingHorizontal: 34,
  },
  accuracyCard: {
    borderRadius: 34,
    marginBottom: 40,
    height: 140, 
    justifyContent: 'center',
  },
  liquidContainerShapeWhite34: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    overflow: 'hidden',
  },
  liquidLightOverlayWhite34: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
  },
  liquidReflectionLipWhite34: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderLeftColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
  },
  liquidBaseBlurWhite: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
  },
  accuracyContent: {
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    gap: 20,
    backgroundColor: 'transparent',
  },
  accuracySubtitle: {
    fontSize: 14,
    fontFamily: 'Mazzard',
    color: '#64748B',
    marginBottom: 8,
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  accuracyValue: {
    fontSize: 32,
    fontFamily: 'Mazzard',
    color: BLUE,
    marginRight: 4,
  },
  accuracyLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsM',
    color: '#64748B',
    marginBottom: 6,
  },
  section: {
    marginBottom: 34,
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
    backgroundColor: 'transparent',
  },
  dropdownHeaderText: {
    fontSize: 13,
    fontFamily: 'PoppinsM',
    color: '#475569',
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
    color: '#475569',
  },
  voiceItemTextSelected: {
    color: BLUE,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
    paddingBottom: 80, 
    paddingHorizontal: 34,
  },
  illustration: {
    width: 340,
    height: 340,
  },
  title: {
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8E9CAE',
    shadowOffset: { width: 0, height: -10 },
    elevation: 10,
    zIndex: 20,
    backgroundColor: BRANCO,
  },
  bottomNavInner: {
    width: '100%',
    maxWidth: 340, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  navItem: {
    alignItems: 'center',
    gap: 6,
    minWidth: 70, 
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: MUTED,
  },
  navIconActive: {
    tintColor: BLUE,
  },
  navLabel: {
    fontSize: 10,
    color: MUTED,
    fontFamily: 'Poppins',
  },
  navLabelActive: {
    color: BLUE,
    fontWeight: '600',
  },
});

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getMySettings, updateMySettings } from '../services/settingsService';
import { getMe, normalizeAvatarUrl } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';

const PERFIL = require('../../assets/images/Luvia/profile/profile.png');

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF'; 

const INICIO = require('../../assets/images/Luvia/home/inicio.png'); 
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png'); 
const LUVAS = require('../../assets/images/Luvia/home/luvas.png'); 
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png'); 
const DIREITA = require('../../assets/images/Luvia/home/direita.png');
const AZULDIREITA = require('../../assets/images/Luvia/home/direitaAzul.png'); 

export default function SettingsScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHapticEnabled, setIsHapticEnabled] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { signOut } = useAuth();

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
    let isMounted = true;

    void getMe()
      .then((user) => {
        if (!isMounted) {
          return;
        }

        setProfileName(user.name);
        setAvatarUrl(user.avatarUrl);
      })
      .catch((error) => {
        if (isMounted) {
          Alert.alert('Não foi possível carregar o perfil', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    void getMySettings()
      .then((settings) => {
        if (!isMounted) {
          return;
        }

        setIsDarkMode(settings.darkMode);
        setIsHapticEnabled(settings.hapticFeedback);
      })
      .catch((error) => {
        // Keep the screen's existing local defaults when settings cannot be loaded.
        if (isMounted) {
          Alert.alert('Não foi possível carregar as configurações', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleDarkModeChange(value: boolean) {
    setIsDarkMode(value);
    void updateMySettings({ darkMode: value }).catch((error) => {
      Alert.alert('Não foi possível salvar', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
    });
  }

  function handleHapticFeedbackChange(value: boolean) {
    setIsHapticEnabled(value);
    void updateMySettings({ hapticFeedback: value }).catch((error) => {
      Alert.alert('Não foi possível salvar', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
    });
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Não foi possível sair da conta', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" backgroundColor={BRANCO} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        <ScrollView 
          style={{ overflow: 'visible' }} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavigationContentInset }]}
        >
          
          <AppGlassCard style={styles.neumorphicCard} borderRadius={50}>

            <TouchableOpacity 
              style={styles.profileRow} 
              activeOpacity={0.7}
              onPress={() => router.push('/profile')}
            >
              <Image 
                source={avatarUrl ? { uri: normalizeAvatarUrl(avatarUrl) } : PERFIL}
                style={styles.profileAvatar} 
                resizeMode="cover" 
              />
              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.profileSubtitle}>Visualizar perfil</Text>
              </View>
              <Image source={AZULDIREITA} style={styles.arrowright} resizeMode="contain" />
            </TouchableOpacity>
          </AppGlassCard>

          <AppGlassCard style={styles.neumorphicCard}>

            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionRow} activeOpacity={0.7} onPress={() => router.push('/voice')}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Voz</Text>
                  <Text style={styles.optionSubtitle}>Altere o volume, velocidade e timbre.</Text>
                </View>
                <Image source={DIREITA} style={styles.arrowright} resizeMode="contain" />
              </TouchableOpacity>

              <View style={styles.optionSpacing} />

              <TouchableOpacity style={styles.optionRow} activeOpacity={0.7} onPress={() => router.push('/gloves')}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Luvas</Text>
                  <Text style={styles.optionSubtitle}>Verifique a calibragem, bateria e conexão.</Text>
                </View>
                <Image source={DIREITA} style={styles.arrowright} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </AppGlassCard>

          <AppGlassCard style={styles.neumorphicCard}>

            <View style={styles.optionsContainer}>
              <View style={styles.optionRow}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Modo Escuro</Text>
                  <Text style={styles.optionSubtitle}>Aparência do aplicativo no modo claro.</Text>
                </View>
                <Switch
                  trackColor={{ false: '#E5E7EB', true: BLUE }}
                  thumbColor={'#FFFFFF'}
                  ios_backgroundColor="#E5E7EB"
                  onValueChange={handleDarkModeChange}
                  value={isDarkMode}
                  style={styles.switchControl}
                />
              </View>

              <View style={styles.optionSpacing} />

              <View style={styles.optionRow}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Feedback Tátil</Text>
                  <Text style={styles.optionSubtitle}>Vibração ao interagir com o aplicativo.</Text>
                </View>
                <Switch
                  trackColor={{ false: '#E5E7EB', true: BLUE }}
                  thumbColor={'#FFFFFF'}
                  ios_backgroundColor="#E5E7EB"
                  onValueChange={handleHapticFeedbackChange}
                  value={isHapticEnabled}
                  style={styles.switchControl}
                />
              </View>
            </View>
          </AppGlassCard>

          <TouchableOpacity 
            style={styles.logoutButton} 
            activeOpacity={0.85}
            onPress={handleSignOut}
          >
            <Text style={styles.logoutButtonText}>Sair da conta</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      <AppBottomNavigation activeRoute="settings" />
    </SafeAreaView>
  );
}

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRANCO,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 110,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    height: 70,
    marginBottom: -20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: TEXT,
    fontFamily: 'PoppinsM',
  },

  neumorphicCard: {
    borderRadius: 40,
    marginBottom: 24,
  },
  
  liquidContainerShapeWhite34: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    overflow: 'hidden',
  },
  liquidLightOverlayWhite34: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  liquidReflectionLipWhite34: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },

  liquidContainerShapeWhite50: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    overflow: 'hidden',
  },
  liquidLightOverlayWhite50: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
  },
  liquidReflectionLipWhite50: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },

  liquidBaseBlurWhite: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
  },
  arrowright: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    color: TEXT,
    fontFamily: 'Poppins SemiBold',
    letterSpacing: -0.45,
    marginBottom: 1,
  },
  profileSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins',
  },
  chevronIcon: {
    marginLeft: 10,
  },
  
  optionsContainer: {
    padding: 24,
    backgroundColor: 'transparent',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    fontSize: 18,
    color: TEXT,
    fontFamily: 'Poppins SemiBold',
    letterSpacing: -0.45,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins',
    lineHeight: 16,
  },
  optionSpacing: {
    height: 24,
  },
  switchControl: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },

  logoutButton: {
    backgroundColor: BLUE,
    alignSelf: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    marginTop: 8,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutButtonText: {
    color: BRANCO,
    fontSize: 14,
    fontFamily: 'MazzardH-Medium',
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
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
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

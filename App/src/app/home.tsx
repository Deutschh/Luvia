import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  PanResponder,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF'; 

const ESSENCIAIS = require('../../assets/images/Luvia/home/essenciais.png');
const FAVORITOS = require('../../assets/images/Luvia/home/favorito.png');
const FAVORITOSAZUL = require('../../assets/images/Luvia/home/estrela.png'); 
const ESTRELA = require('../../assets/images/Luvia/home/favorito-azul.png'); 
const SOCIAIS = require('../../assets/images/Luvia/home/sociais.png');
const BEMESTAR = require('../../assets/images/Luvia/home/bem-estar.png');
const LUVAS = require('../../assets/images/Luvia/home/luvas.png'); 
const NOTIFICACAO = require('../../assets/images/Luvia/home/notificacao.png'); 
const INICIO = require('../../assets/images/Luvia/home/inicio.png'); 
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png'); 
const EDITAR = require('../../assets/images/Luvia/home/editar.png');
const CHECK = require('../../assets/images/Luvia/home/check.png');
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png'); 
const REPRODUZIR = require('../../assets/images/Luvia/home/reproduzir.png'); 

const WAVE_DATA = [
  12, 18, 10, 24, 30, 28, 14, 32, 26, 18, 14, 
  22, 28, 20, 30, 16, 24, 18, 12, 26, 14, 10, 8, 
];

export default function HomeScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasRecentPhrase, setHasRecentPhrase] = useState(false);
  const [phraseText, setPhraseText] = useState('Estou aprendendo a usar o Luvia.');
  const [inputValue, setInputValue] = useState('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 50) {
        setIsModalVisible(false);
      }
    },
  });

  const handleSavePhrase = () => {
    if (inputValue.trim().length > 0) {
      setPhraseText(inputValue);
      setHasRecentPhrase(true);
    }
    setIsModalVisible(false);
    setInputValue('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" backgroundColor={BRANCO} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/Luvia/logo-L.png')}
            style={styles.logo}
            resizeMode="contain"
          />
            <TouchableOpacity 
              style={styles.notificationButtonWrapper} 
              activeOpacity={0.75}
              onPress={() => router.push('/notification')}
            >
              <GlassContainer style={StyleSheet.absoluteFill}>
                <GlassView style={styles.glassEffect} />
              </GlassContainer>
              
              <Image
                source={NOTIFICACAO}
                style={styles.notiIcon}
                resizeMode="contain"
              />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
        </View>

        <ScrollView 
          style={{ overflow: 'visible' }}
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavigationContentInset }]}
        >
          
          <View style={styles.glovesRow}>
            <AppGlassCard style={styles.gloveCard} borderRadius={36}>

              <Text style={styles.gloveLabel}>Luva Esquerda</Text>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>66</Text>
              </View>
            </AppGlassCard>

            <AppGlassCard style={styles.gloveCard} borderRadius={36}>

              <Text style={styles.gloveLabel}>Luva Direita</Text>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>50</Text>
              </View>
            </AppGlassCard>
          </View>

          <AppGlassCard style={styles.neumorphicCard}>

            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Última frase reprod.</Text>
              <Text style={styles.cardHeaderTime}>{hasRecentPhrase ? '20:08' : '--:--'}</Text>
            </View>

            {hasRecentPhrase ? (
              <>
                <Text style={styles.phraseText}>{phraseText}</Text>

                <View style={styles.waveformContainer}>
                  {WAVE_DATA.map((height, index) => (
                    <View
                      key={index}
                      style={[
                        styles.waveBar,
                        { height },
                        index < 11 ? styles.waveBarActive : styles.waveBarInactive,
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.audioControls}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => setIsFavorite(!isFavorite)}>
                    <Image source={isFavorite ? FAVORITOSAZUL : ESTRELA} style={styles.audioIconLarge} resizeMode="contain" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.playButtonWrapper} activeOpacity={0.85}>
                    
                    <GlassContainer style={styles.liquidContainerShapePlay}>
                      <GlassView style={styles.liquidBaseBlur} />
                    </GlassContainer>

                    <LinearGradient
                      colors={[
                        'rgba(255, 255, 255, 0.75)', 
                        'rgba(0, 145, 255, 0.95)',   
                        '#0091FF',                   
                        'rgba(0, 145, 255, 0.35)'    
                      ]}
                      locations={[0, 0.25, 0.65, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.liquidLightOverlayPlay}
                    />

                    <View style={styles.liquidReflectionLipPlay} />

                    <Image source={REPRODUZIR} style={styles.playIconInside} resizeMode="contain" />
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.7} onPress={() => setIsModalVisible(true)}>
                    <Image source={EDITAR} style={styles.audioIcon} resizeMode="contain" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum registro de sinais ou frases recente.</Text>
              </View>
            )}
          </AppGlassCard>

          <AppGlassCard style={styles.neumorphicCard}>

            <View style={styles.cardHeader}>
              <Text style={styles.cardHeaderTitle}>Atalhos</Text>
              <TouchableOpacity style={styles.addButton}>
                <Feather name="plus" size={14} color={MUTED} />
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shortcutsRow}>
              <ShortcutItem
                source={FAVORITOS}
                label="Favoritos"
                onPress={() =>
                  router.push({ pathname: '/dictionary', params: { filter: 'favorites' } })
                }
              />
              <ShortcutItem
                source={ESSENCIAIS}
                label="Essenciais"
                onPress={() =>
                  router.push({ pathname: '/dictionary', params: { category: 'essenciais' } })
                }
              />
              <ShortcutItem
                source={SOCIAIS}
                label="Sociais"
                onPress={() =>
                  router.push({ pathname: '/dictionary', params: { category: 'sociais' } })
                }
              />
              <ShortcutItem
                source={BEMESTAR}
                label="Bem-estar"
                onPress={() =>
                  router.push({ pathname: '/dictionary', params: { category: 'bem-estar' } })
                }
              />
            </View>
          </AppGlassCard>

        </ScrollView>
      </View>

      <AppBottomNavigation activeRoute="home" />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent} {...panResponder.panHandlers}>
            <View style={styles.modalIndicator} />
            
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Corrigir última frase registrada</Text>
             <TouchableOpacity 
              style={styles.notificationButtonWrapper} 
              activeOpacity={0.75}
              onPress={handleSavePhrase}
            >
              <GlassContainer style={StyleSheet.absoluteFill}>
                <GlassView style={styles.glassEffect} />
              </GlassContainer>
                <Image source={CHECK} style={styles.notiIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Escreva a frase corretamente aqui..."
              placeholderTextColor={MUTED}
              multiline
              value={inputValue}
              onChangeText={setInputValue}
              autoFocus={true}
            />
          </View>
          <View style={styles.keyboardFiller} />
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function ShortcutItem({ source, label, onPress }: { source: any; label: string; onPress?: () => void }) {
  return (
    <View style={styles.shortcutItem}>
      <TouchableOpacity style={styles.shortcutIconWrapper} activeOpacity={0.8} onPress={onPress}>
        
        <GlassContainer style={styles.liquidContainerShapeShortcut}>
          <GlassView style={styles.liquidBaseBlur} />
        </GlassContainer>

        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.75)', 
            'rgba(0, 145, 255, 0.95)',   
            '#0091FF',                   
            'rgba(0, 145, 255, 0.35)'  
          ]}
          locations={[0, 0.25, 0.65, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.liquidLightOverlayShortcut}
        />

        <View style={styles.liquidReflectionLipShortcut} />

        <Image source={source} style={styles.shortcutIcon} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 70,
    marginBottom: -30,
    zIndex: 10,
  },
  logo: {
    width: 120,
    height: 60,
  },
  notificationButtonWrapper: {
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
  notiIcon: {
    width: 22,
    height: 22,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  glovesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gloveCard: {
    width: '47%',
    borderRadius: 36,
    paddingVertical: 24,
    alignItems: 'center',
  },
  
  liquidContainerShapeWhite24: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    overflow: 'hidden',
  },
  liquidLightOverlayWhite24: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  liquidReflectionLipWhite24: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
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
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },

  liquidBaseBlurWhite: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
  },

  gloveLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins',
    marginBottom: 16,
    zIndex: 10,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: BLUE,
    borderBottomColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  progressText: {
    fontSize: 36,
    letterSpacing: -1,
    color: BLUE,
    fontFamily: 'SF',
    marginTop: 2,
  },
  neumorphicCard: {
    borderRadius: 34,
    padding: 24,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  cardHeaderTitle: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Poppins',
  },
  cardHeaderTime: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins',
  },
  phraseText: {
    fontSize: 14,
    color: TEXT,
    fontFamily: 'Poppins',
    textAlign: 'center',
    marginBottom: 24,
    zIndex: 10,
  },
  emptyContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Poppins',
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 4,
    marginBottom: 32,
    zIndex: 10,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
  },
  waveBarActive: {
    backgroundColor: BLUE,
  },
  waveBarInactive: {
    backgroundColor: '#D1D5DB',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
    zIndex: 10,
  },
  audioIcon: {
    width: 28,
    height: 28,
  },
  audioIconLarge: {
    width: 32,
    height: 32,
    marginTop: -2,
    marginLeft: 0,
  },

  playButtonWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    marginBottom: -4,
    elevation: 8,
  },
  liquidContainerShapePlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
  },
  liquidLightOverlayPlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  liquidReflectionLipPlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  playIconInside: {
    width: 30,
    height: 30,
    marginLeft: 4, 
    position: 'absolute',
    zIndex: 12,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: MUTED,
    fontFamily: 'Poppins',
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shortcutItem: {
    alignItems: 'center',
    gap: 8,
  },
  shortcutIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 8,
  },
  liquidContainerShapeShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 52,
    overflow: 'hidden',
  },
  liquidLightOverlayShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 52,
  },
  liquidReflectionLipShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  liquidBaseBlur: {
    flex: 1,
    backgroundColor: 'rgba(0, 145, 255, 0.35)', 
  },

  shortcutIcon: {
    width: '48%',
    height: '48%',
    position: 'absolute',
    zIndex: 12,
  },
  shortcutLabel: {
    fontSize: 11,
    color: MUTED,
    fontFamily: 'Poppins',
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BRANCO,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 60,
    width: '100%',
  },
  keyboardFiller: {
    height: 400, 
    backgroundColor: BRANCO,
    marginBottom: -400,
    width: '100%',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins SemiBold',
    color: TEXT,
  },
  modalCheckButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: TEXT,
    height: 120,
    textAlignVertical: 'top',
  },
});

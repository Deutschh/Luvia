import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';

const ESSENCIAIS = require('../../assets/images/Luvia/home/sociais.png');
const FAVORITOS = require('../../assets/images/Luvia/home/favorito.png');
const BEMESTAR = require('../../assets/images/Luvia/home/bem-estar.png');
const INICIO = require('../../assets/images/Luvia/home/inicio.png');
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png');
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png');
const PESQUISA = require('../../assets/images/Luvia/dicionario/pesquisa.png');
const SETA = require('../../assets/images/Luvia/dicionario/seta.png');

const CATEGORIES = ['Todas', 'Favoritos', 'Saudações', 'Escola'];

const DICTIONARY_ITEMS = [
  { id: '1', title: 'Oi!', subtitle: 'Sinal para saudação matinal.', icon: ESSENCIAIS },
  { id: '2', title: 'Tchau!', subtitle: 'Sinal para despedida.', icon: ESSENCIAIS },
  { id: '3', title: 'Tô triste', subtitle: 'Estado de emoção.', icon: BEMESTAR },
  { id: '4', title: 'João Pedro', subtitle: 'Nome de uma pessoa.', icon: FAVORITOS },
  { id: '5', title: 'Guilherme', subtitle: 'Nome de uma pessoa.', icon: FAVORITOS },
];

export default function DictionaryScreen() {
  const [activeCategory, setActiveCategory] = useState('Todas');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dicionário</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={() => router.push('/add')}>
              <Feather name="plus" size={24} color={BRANCO} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.searchButtonWrapper} 
              activeOpacity={0.75}
              onPress={() => router.push('/search')}
            >
              <GlassContainer style={StyleSheet.absoluteFill}>
                <GlassView style={styles.glassEffect} />
              </GlassContainer>
              
              <Image
                source={PESQUISA}
                style={styles.searchIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ overflow: 'visible' }}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category, index) => {
              const isActive = activeCategory === category;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.85}
                  onPress={() => setActiveCategory(category)}
                  style={isActive ? styles.pillActiveWrapper : styles.pillInactiveWrapper}
                >
                  {isActive ? (
                    <View style={styles.inactiveFill} />
                  ) : (
                    <>
                      <GlassContainer style={styles.pillShape}>
                        <GlassView style={styles.glassBase} />
                      </GlassContainer>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.05)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.pillShape}
                      />
                      <View style={styles.glassReflectionLip} />
                    </>
                  )}
                  
                  <Text style={isActive ? styles.categoryTextActive : styles.categoryTextInactive}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={{ overflow: 'visible' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {DICTIONARY_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.7}>
              
              {/* FUNDO LIQUID GLASS DO CARD */}
              <GlassContainer style={styles.liquidContainerShapeWhite40}>
                <GlassView style={styles.liquidBaseBlurWhite} />
              </GlassContainer>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.liquidLightOverlayWhite40}
              />
              <View style={styles.liquidReflectionLipWhite40} />

              <View style={styles.cardIconWrapper}>
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

                <Image source={item.icon} style={styles.cardIconImage} resizeMode="contain" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Image source={SETA} style={styles.arrowIcon} resizeMode="contain" />
            </TouchableOpacity>
          ))}
        </ScrollView>

      </View>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavInner}>
          <NavItem
            source={INICIO}
            label="Início"
            onPress={() => router.push('/home')}
          />
          <NavItem
            source={DICIONARIO}
            label="Dicionário"
            active
          />
          <NavItem
            source={LUVAS}
            label="Luvas"
            onPress={() => router.push('/gloves')}
          />
          <NavItem
            source={CONFIGURACOES}
            label="Configurações"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  searchButtonWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderRadius: 22,
  },
  glassEffect: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: MUTED,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 4,
    gap: 12,
  },
  pillActiveWrapper: {
    width: 105,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pillInactiveWrapper: {
    width: 105,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    elevation: 4,
  },
  pillShape: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
  glassBase: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
  },
  glassReflectionLip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.8)',
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  inactiveFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: BLUE, 
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.75)', 
  },
  categoryTextActive: {
    fontSize: 13,
    fontFamily: 'Mazzard',
    color: BRANCO,
    zIndex: 2, 
  },
  categoryTextInactive: {
    fontSize: 13,
    fontFamily: 'Mazzard',
    color: MUTED,
    zIndex: 2,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 20,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 4,
  },

  liquidContainerShapeWhite40: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    overflow: 'hidden',
  },
  liquidBaseBlurWhite: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
  },
  liquidLightOverlayWhite40: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  liquidReflectionLipWhite40: {
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

  cardIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    borderRadius: 26,
    overflow: 'hidden',
  },
  liquidLightOverlayShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
  liquidReflectionLipShortcut: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
  liquidBaseBlur: {
    flex: 1,
    backgroundColor: 'rgba(0, 145, 255, 0.35)', 
  },
  cardIconImage: {
    width: '50%',
    height: '50%',
    position: 'absolute',
    zIndex: 12,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins SemiBold',
    color: TEXT,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Mazzard',
    color: MUTED,
  },
  arrowIcon: {
    width: 14,
    height: 14,
    marginRight: 8,
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
    shadowOpacity: 0.08,
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
    fontFamily: 'Poppins SemiBold',
  },
});
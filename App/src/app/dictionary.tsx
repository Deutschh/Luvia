import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';
import { useIsFocused } from '@react-navigation/native';
import {
  type DictionaryCategory,
  getDictionaryCategories,
  getDictionarySigns,
  getFavoriteSigns,
} from '../services/dictionaryService';

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

function mapIconByKey(iconKey?: string | null, slug?: string) {
  const normalizedKey = (iconKey || slug || '').toLowerCase();

  if (normalizedKey.includes('favorito')) {
    return FAVORITOS;
  }

  if (normalizedKey.includes('sociais') || normalizedKey.includes('saudacoes')) {
    return ESSENCIAIS;
  }

  if (normalizedKey.includes('bem') || normalizedKey.includes('estar')) {
    return BEMESTAR;
  }

  return ESSENCIAIS;
}

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function DictionaryScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();
  const params = useLocalSearchParams<{ filter?: string | string[]; category?: string | string[] }>();
  const isFocused = useIsFocused();
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<DictionaryCategory[]>([]);
  const [items, setItems] = useState<
    { id: string; title: string; subtitle: string; icon: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filterParam = getSingleParam(params.filter);
    const categoryParam = getSingleParam(params.category);

    if (filterParam === 'favorites') {
      setActiveCategory('favoritos');
      return;
    }

    if (categoryParam) {
      setActiveCategory(categoryParam);
      return;
    }

    setActiveCategory('all');
  }, [params.category, params.filter]);

  useEffect(() => {
    let isMounted = true;

    async function loadDictionary() {
      if (!isFocused) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [categoriesData, signsData] = await Promise.all([
          getDictionaryCategories(),
          activeCategory === 'favoritos'
            ? getFavoriteSigns()
            : getDictionarySigns(activeCategory === 'all' ? undefined : activeCategory),
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(categoriesData);
        setItems(
          signsData.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.description || item.example || item.category.name,
            icon: mapIconByKey(item.category.iconKey, item.category.slug),
          }))
        );
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar dicionário.');
        setItems([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadDictionary();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, isFocused]);

  const categoryOptions = [
    { id: 'all', name: 'Todas', slug: 'all' },
    ...categories,
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            {categoryOptions.map((category, index) => {
              const isActive = activeCategory === category.slug;
              return (
                <TouchableOpacity
                  key={category.id || index}
                  activeOpacity={0.85}
                  onPress={() => setActiveCategory(category.slug)}
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
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          style={{ overflow: 'visible' }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContainer, { paddingBottom: bottomNavigationContentInset }]}
        >
          {loading ? (
            <Text style={styles.cardSubtitle}>Carregando...</Text>
          ) : error ? (
            <Text style={styles.cardSubtitle}>{error}</Text>
          ) : items.length === 0 ? (
            <Text style={styles.cardSubtitle}>Nenhum sinal encontrado.</Text>
          ) : (
            items.map((item) => (
              <AppGlassCard key={item.id} style={styles.card} borderRadius={40}>
                <TouchableOpacity style={styles.cardContent} activeOpacity={0.7}>

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
              </AppGlassCard>
            ))
          )}
        </ScrollView>

      </View>

      <AppBottomNavigation activeRoute="dictionary" />
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
    borderRadius: 40,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 40,
    padding: 16,
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
    color: '#64748B',
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

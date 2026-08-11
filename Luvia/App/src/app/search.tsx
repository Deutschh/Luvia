import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { searchDictionarySigns } from '../services/dictionaryService';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';

const ESSENCIAIS = require('../../assets/images/Luvia/home/essenciais.png');
const FAVORITOS = require('../../assets/images/Luvia/home/favorito.png');
const BEMESTAR = require('../../assets/images/Luvia/home/bem-estar.png');
const INICIO = require('../../assets/images/Luvia/home/inicio.png');
const DICIONARIO = require('../../assets/images/Luvia/home/dicionario.png');
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');
const CONFIGURACOES = require('../../assets/images/Luvia/home/configuracoes.png');
const SETA = require('../../assets/images/Luvia/dicionario/seta.png');
const PESQUISA = require('../../assets/images/Luvia/dicionario/pesquisa.png');

function mapIconByKey(iconKey?: string | null, slug?: string) {
  const normalizedKey = (iconKey || slug || '').toLowerCase();

  if (normalizedKey.includes('favorito')) {
    return FAVORITOS;
  }

  if (normalizedKey.includes('bem') || normalizedKey.includes('estar')) {
    return BEMESTAR;
  }

  return ESSENCIAIS;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<
    { id: string; title: string; subtitle: string; icon: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setFilteredItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);

        try {
          const results = await searchDictionarySigns(query);

          if (cancelled) {
            return;
          }

          setFilteredItems(
            results.map((item) => ({
              id: item.id,
              title: item.title,
              subtitle: item.description || item.example || item.category.name,
              icon: mapIconByKey(item.category.iconKey, item.category.slug),
            }))
          );
        } catch (searchError) {
          if (cancelled) {
            return;
          }

          setError(searchError instanceof Error ? searchError.message : 'Erro ao buscar sinais.');
          setFilteredItems([]);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.headerTitle}>Buscar</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchBarWrapper}>
          <GlassContainer style={styles.liquidContainerShapeSearch}>
            <GlassView style={styles.liquidBaseBlurWhite} />
          </GlassContainer>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.liquidLightOverlaySearch}
          />
          <View style={styles.liquidReflectionLipSearch} />

          <Image
            source={PESQUISA}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Sinais, palavras e mais..."
            placeholderTextColor={MUTED}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton} activeOpacity={0.7}>
              <Feather name="x" size={18} color={MUTED} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contentContainer}>
          {searchQuery === '' ? (
            <View style={styles.emptyStateContainer}>
              <Image
                source={PESQUISA}
                style={styles.emptyStateIcon}
                resizeMode="contain"
              />
              <Text style={styles.emptyStateTitle}>Nenhuma busca recente</Text>
              <Text style={styles.emptyStateSubtitle}>Suas buscas recentes aparecerão aqui.</Text>
            </View>
          ) : loading ? (
            <View style={styles.emptyStateContainer}>
              <Image
                source={PESQUISA}
                style={styles.emptyStateIcon}
                resizeMode="contain"
              />
              <Text style={styles.emptyStateTitle}>Carregando...</Text>
              <Text style={styles.emptyStateSubtitle}>Buscando sinais no dicionário.</Text>
            </View>
          ) : error ? (
            <View style={styles.emptyStateContainer}>
              <Image
                source={PESQUISA}
                style={styles.emptyStateIcon}
                resizeMode="contain"
              />
              <Text style={styles.emptyStateTitle}>Não foi possível buscar.</Text>
              <Text style={styles.emptyStateSubtitle}>{error}</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Image
                source={PESQUISA}
                style={styles.emptyStateIcon}
                resizeMode="contain"
              />
              <Text style={styles.emptyStateTitle}>Nenhum resultado encontrado.</Text>
              <Text style={styles.emptyStateSubtitle}>
                {`Não foi encontrado nenhum resultado para a busca "${searchQuery}".`}
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              style={{ overflow: 'visible' }}
            >
              {filteredItems.map((item) => (
                <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.7}>
                  
                  {/* LIQUID GLASS NO CARD */}
                  <GlassContainer style={styles.liquidContainerShapeCard40}>
                    <GlassView style={styles.liquidBaseBlurWhite} />
                  </GlassContainer>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.6)', 'rgba(255, 255, 255, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.liquidLightOverlayCard40}
                  />
                  <View style={styles.liquidReflectionLipCard40} />

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
          )}
        </View>

      </View>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNavInner}>
          <NavItem
            source={INICIO}
            label="Início"
            onPress={() => router.replace('/home')}
          />
          <NavItem
            source={DICIONARIO}
            label="Dicionário"
            active
          />
          <NavItem
            source={LUVAS}
            label="Luvas"
            onPress={() => router.replace('/gloves')}
          />
          <NavItem
            source={CONFIGURACOES}
            label="Configurações"
            onPress={() => router.replace('/settings')}
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
    height: 60,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  backButtonWrapper: {
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  placeholder: {
    width: 44,
  },
  
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    marginHorizontal: 24,
    marginTop: 16,
    height: 48,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    zIndex: 10,
  },
  liquidContainerShapeSearch: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: 'hidden',
  },
  liquidLightOverlaySearch: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  liquidReflectionLipSearch: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
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

  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: MUTED,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'PoppinsM',
    color: TEXT,
    zIndex: 10,
  },
  clearButton: {
    padding: 4,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: -80,
  },
  emptyStateIcon: {
    width: 50,
    height: 50,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    fontFamily: 'Mazzard',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 16,
  },

  /* ESTILOS DO CARD LIQUID GLASS */
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
  liquidContainerShapeCard40: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    overflow: 'hidden',
  },
  liquidLightOverlayCard40: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
  },
  liquidReflectionLipCard40: {
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
    width: '48%',
    height: '48%',
    position: 'absolute',
    zIndex: 12,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
    zIndex: 10,
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
    width: 16,
    height: 16,
    marginRight: 8,
    zIndex: 10,
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
    backgroundColor: BRANCO,
    zIndex: 20,
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

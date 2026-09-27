import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { DictionarySignCard } from '../components/DictionarySignCard';
import { type DictionaryCategory, type DictionarySign, getDictionaryCategories, getDictionarySigns, getFavoriteSigns } from '../services/dictionaryService';

const BLUE = '#0A6DFF';
const TEXT = '#152341';
const MUTED = '#64748B';
const WHITE = '#FFFFFF';
const PAGE = '#F8FAFF';

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function DictionaryScreen() {
  const bottomInset = useBottomNavigationContentInset();
  const params = useLocalSearchParams<{ filter?: string | string[]; category?: string | string[] }>();
  const isFocused = useIsFocused();
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState<DictionaryCategory[]>([]);
  const [signs, setSigns] = useState<DictionarySign[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [loadingSigns, setLoadingSigns] = useState(true);
  const [signsError, setSignsError] = useState<string | null>(null);
  const [categoryRetry, setCategoryRetry] = useState(0);
  const [signRetry, setSignRetry] = useState(0);

  useEffect(() => {
    const filter = getSingleParam(params.filter);
    const category = getSingleParam(params.category);
    setActiveCategory(filter === 'favorites' ? 'favoritos' : category || 'all');
  }, [params.category, params.filter]);

  useEffect(() => {
    if (!isFocused) return;
    let active = true;
    setLoadingCategories(true);
    setCategoriesError(null);

    void getDictionaryCategories()
      .then((result) => {
        if (active) setCategories(result);
      })
      .catch((error: unknown) => {
        if (active) setCategoriesError(error instanceof Error ? error.message : 'Não foi possível carregar os filtros.');
      })
      .finally(() => {
        if (active) setLoadingCategories(false);
      });

    return () => { active = false; };
  }, [categoryRetry, isFocused]);

  const loadSigns = useCallback(() => (
    activeCategory === 'favoritos'
      ? getFavoriteSigns()
      : getDictionarySigns(activeCategory === 'all' ? undefined : activeCategory)
  ), [activeCategory]);

  useEffect(() => {
    if (!isFocused) return;
    let active = true;
    setLoadingSigns(true);
    setSignsError(null);

    void loadSigns()
      .then((result) => {
        if (active) setSigns(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setSigns([]);
          setSignsError(error instanceof Error ? error.message : 'Não foi possível carregar o dicionário.');
        }
      })
      .finally(() => {
        if (active) setLoadingSigns(false);
      });

    return () => { active = false; };
  }, [isFocused, loadSigns, signRetry]);

  const categoryOptions = [{ id: 'all', name: 'Todas', slug: 'all' }, ...categories];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.topArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} accessibilityRole="header">Dicionário</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Adicionar sinal" onPress={() => router.push('/add')}>
                <Feather name="plus" size={24} color={WHITE} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.searchButton} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Buscar sinais" onPress={() => router.push('/search')}>
                <Feather name="search" size={22} color={MUTED} />
              </TouchableOpacity>
            </View>
          </View>

          {loadingCategories && categories.length === 0 ? (
            <View style={styles.filtersLoading}>
              <ActivityIndicator color={BLUE} size="small" />
              <Text style={styles.helperText}>Carregando filtros…</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
              {categoryOptions.map((category) => {
                const selected = activeCategory === category.slug;
                return (
                  <TouchableOpacity key={category.id} style={[styles.pill, selected && styles.pillActive]} accessibilityRole="button" accessibilityState={{ selected }} activeOpacity={0.82} onPress={() => setActiveCategory(category.slug)}>
                    <Text style={[styles.pillText, selected && styles.pillTextActive]}>{category.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {categoriesError ? (
            <View style={styles.filterError}>
              <Text style={styles.filterErrorText} numberOfLines={2}>{categoriesError}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={() => setCategoryRetry((value) => value + 1)}>
                <Text style={styles.retryLink}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset }]}>
          {loadingSigns ? (
            <StatePanel icon="book-open" title="Carregando sinais…" description="Aguarde enquanto atualizamos o dicionário." loading />
          ) : signsError ? (
            <StatePanel icon="wifi-off" title="Não foi possível carregar" description={signsError} actionLabel="Tentar novamente" onAction={() => setSignRetry((value) => value + 1)} />
          ) : signs.length === 0 ? (
            <StatePanel
              icon={activeCategory === 'favoritos' ? 'star' : 'inbox'}
              title={activeCategory === 'favoritos' ? 'Nenhum favorito ainda' : 'Nenhum sinal encontrado'}
              description={activeCategory === 'favoritos' ? 'Abra um sinal e marque-o como favorito para encontrá-lo aqui.' : 'Ainda não há sinais disponíveis neste filtro.'}
            />
          ) : signs.map((sign) => (
            <DictionarySignCard key={sign.id} sign={sign} onPress={() => router.push({ pathname: '/signal', params: { id: sign.id } })} />
          ))}
        </ScrollView>
      </View>
      <AppBottomNavigation activeRoute="dictionary" />
    </SafeAreaView>
  );
}

function StatePanel({ icon, title, description, loading = false, actionLabel, onAction }: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.statePanel}>
      {loading ? <ActivityIndicator color={BLUE} size="large" /> : <Feather name={icon} size={38} color={BLUE} />}
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.retryButton} accessibilityRole="button" onPress={onAction}>
          <Feather name="refresh-cw" size={16} color={WHITE} />
          <Text style={styles.retryButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE },
  container: { flex: 1 },
  topArea: { backgroundColor: PAGE, zIndex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 18 },
  headerTitle: { fontSize: 24, fontFamily: 'PoppinsM', color: TEXT },
  headerActions: { flexDirection: 'row', gap: 12 },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  searchButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8EEF8', borderWidth: 1, borderColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  categoriesContainer: { paddingHorizontal: 24, paddingBottom: 10, gap: 10 },
  pill: { minWidth: 104, minHeight: 38, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#F1F4F9', borderWidth: 1, borderColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: BLUE, borderColor: BLUE },
  pillText: { fontSize: 12, fontFamily: 'PoppinsM', color: MUTED },
  pillTextActive: { color: WHITE },
  filtersLoading: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 24, paddingBottom: 10 },
  helperText: { color: MUTED, fontFamily: 'Poppins', fontSize: 12 },
  filterError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginHorizontal: 24, marginBottom: 10, padding: 12, borderRadius: 16, backgroundColor: '#FFF1F3' },
  filterErrorText: { flex: 1, color: '#9B354A', fontFamily: 'Poppins', fontSize: 11 },
  retryLink: { color: BLUE, fontFamily: 'PoppinsM', fontSize: 11 },
  list: { flex: 1, overflow: 'hidden' },
  listContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 18, gap: 14 },
  statePanel: { flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 10 },
  stateTitle: { color: TEXT, fontFamily: 'PoppinsM', fontSize: 18, textAlign: 'center' },
  stateDescription: { color: MUTED, fontFamily: 'Poppins', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  retryButton: { minHeight: 44, marginTop: 8, paddingHorizontal: 20, borderRadius: 22, backgroundColor: BLUE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  retryButtonText: { color: WHITE, fontFamily: 'PoppinsM', fontSize: 13 },
});

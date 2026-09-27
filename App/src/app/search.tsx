import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { DictionarySignCard } from '../components/DictionarySignCard';
import { type DictionarySign, searchDictionarySigns } from '../services/dictionaryService';

const BLUE = '#0A6DFF';
const TEXT = '#152341';
const MUTED = '#64748B';
const WHITE = '#FFFFFF';
const PAGE = '#F8FAFF';

export default function SearchScreen() {
  const bottomInset = useBottomNavigationContentInset();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DictionarySign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const normalizedQuery = query.trim();

  useEffect(() => {
    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setResults([]);
    setError(null);
    setLoading(true);

    const timeout = setTimeout(() => {
      void searchDictionarySigns(normalizedQuery)
        .then((response) => {
          if (active) setResults(response);
        })
        .catch((searchError: unknown) => {
          if (active) {
            setResults([]);
            setError(searchError instanceof Error ? searchError.message : 'Não foi possível buscar sinais.');
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [normalizedQuery, retry]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()}>
            <Feather name="chevron-left" size={26} color={BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} accessibilityRole="header">Buscar</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sinais, palavras e mais..."
            placeholderTextColor={MUTED}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity style={styles.clearButton} accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => setQuery('')}>
              <Feather name="x" size={18} color={MUTED} />
            </TouchableOpacity>
          ) : null}
        </View>

        {!normalizedQuery ? (
          <SearchState icon="search" title="Busque um sinal" description="Digite uma palavra para pesquisar por título, descrição ou exemplo." />
        ) : loading ? (
          <SearchState icon="search" title="Buscando sinais…" description={`Procurando resultados para “${normalizedQuery}”.`} loading />
        ) : error ? (
          <SearchState icon="wifi-off" title="Não foi possível buscar" description={error} actionLabel="Tentar novamente" onAction={() => setRetry((value) => value + 1)} />
        ) : results.length === 0 ? (
          <SearchState icon="inbox" title="Nenhum resultado encontrado" description={`Não encontramos sinais para “${normalizedQuery}”.`} />
        ) : (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset }]}>
            {results.map((sign) => (
              <DictionarySignCard key={sign.id} sign={sign} onPress={() => router.push({ pathname: '/signal', params: { id: sign.id } })} />
            ))}
          </ScrollView>
        )}
      </View>
      <AppBottomNavigation activeRoute="dictionary" replaceNavigation />
    </SafeAreaView>
  );
}

function SearchState({ icon, title, description, loading = false, actionLabel, onAction }: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.state}>
      {loading ? <ActivityIndicator size="large" color={BLUE} /> : <Feather name={icon} size={40} color={BLUE} />}
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.retryButton} accessibilityRole="button" onPress={onAction}>
          <Feather name="refresh-cw" size={16} color={WHITE} />
          <Text style={styles.retryText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 14 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8EEF8', borderWidth: 1, borderColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: TEXT, fontFamily: 'PoppinsM', fontSize: 21 },
  headerSpacer: { width: 44 },
  searchBar: { minHeight: 52, marginHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 18, paddingRight: 6, borderRadius: 26, borderWidth: 1, borderColor: WHITE, backgroundColor: '#F1F4F9' },
  searchInput: { flex: 1, minWidth: 0, paddingVertical: 12, color: TEXT, fontFamily: 'Poppins', fontSize: 14 },
  clearButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1, overflow: 'hidden' },
  listContent: { paddingHorizontal: 24, paddingTop: 22, gap: 14 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, paddingBottom: 80, gap: 10 },
  stateTitle: { color: TEXT, fontFamily: 'PoppinsM', fontSize: 19, textAlign: 'center' },
  stateDescription: { color: MUTED, fontFamily: 'Poppins', fontSize: 13, lineHeight: 21, textAlign: 'center' },
  retryButton: { minHeight: 44, marginTop: 8, paddingHorizontal: 20, borderRadius: 22, backgroundColor: BLUE, flexDirection: 'row', alignItems: 'center', gap: 8 },
  retryText: { color: WHITE, fontFamily: 'PoppinsM', fontSize: 13 },
});

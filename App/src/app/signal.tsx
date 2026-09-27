import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppGlassCard } from '../components/AppGlassCard';
import { getDictionaryCategoryIcon } from '../components/DictionarySignCard';
import {
  type DictionarySign,
  addFavoriteSign,
  getDictionarySignById,
  getFavoriteSigns,
  removeFavoriteSign,
} from '../services/dictionaryService';

const BLUE = '#0A6DFF';
const TEXT = '#152341';
const MUTED = '#64748B';
const WHITE = '#FFFFFF';
const PAGE = '#F1F5FF';

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SignalDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const signId = getSingleParam(params.id);
  const [sign, setSign] = useState<DictionarySign | null>(null);
  const [favorite, setFavorite] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const focused = useRef(false);
  const loadRequest = useRef(0);
  const favoriteRequest = useRef(0);
  const savingFavoriteRef = useRef(false);

  const loadDetails = useCallback(async () => {
    const request = ++loadRequest.current;
    setError(null);
    setFavoriteError(null);
    setFavorite(null);
    setLoading(true);

    if (!signId) {
      setSign(null);
      setError('O sinal solicitado não foi informado.');
      setLoading(false);
      return;
    }

    const [signResult, favoritesResult] = await Promise.allSettled([
      getDictionarySignById(signId),
      getFavoriteSigns(),
    ]);

    if (!focused.current || request !== loadRequest.current) return;

    if (signResult.status === 'rejected') {
      setSign(null);
      setError(signResult.reason instanceof Error ? signResult.reason.message : 'Não foi possível carregar este sinal.');
    } else {
      setSign(signResult.value);
    }

    if (favoritesResult.status === 'rejected') {
      setFavoriteError(favoritesResult.reason instanceof Error ? favoritesResult.reason.message : 'Não foi possível verificar seus favoritos.');
    } else {
      setFavorite(favoritesResult.value.some((item) => item.id === signId));
    }

    setLoading(false);
  }, [signId]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    savingFavoriteRef.current = false;
    setSavingFavorite(false);
    void loadDetails();

    return () => {
      focused.current = false;
      loadRequest.current += 1;
      favoriteRequest.current += 1;
      savingFavoriteRef.current = false;
    };
  }, [loadDetails]));

  async function toggleFavorite() {
    if (!signId || !sign || favorite === null || savingFavoriteRef.current) return;
    const request = ++favoriteRequest.current;
    const previousValue = favorite;
    savingFavoriteRef.current = true;
    setSavingFavorite(true);
    setFavoriteError(null);

    try {
      if (previousValue) await removeFavoriteSign(signId);
      else await addFavoriteSign(signId);

      if (focused.current && request === favoriteRequest.current) {
        setFavorite(!previousValue);
      }
    } catch (toggleError) {
      if (focused.current && request === favoriteRequest.current) {
        const message = toggleError instanceof Error ? toggleError.message : 'Não foi possível atualizar o favorito.';
        setFavoriteError(message);
        Alert.alert('Favorito não atualizado', message);
      }
    } finally {
      if (request === favoriteRequest.current) {
        savingFavoriteRef.current = false;
        if (focused.current) setSavingFavorite(false);
      }
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color={BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">Detalhes do sinal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <DetailState loading icon="book-open" title="Carregando sinal…" description="Aguarde enquanto buscamos os dados." />
      ) : error || !sign ? (
        <DetailState icon="alert-circle" title="Sinal indisponível" description={error || 'Não foi possível encontrar este sinal.'} actionLabel={signId ? 'Tentar novamente' : undefined} onAction={signId ? () => void loadDetails() : undefined} />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <AppGlassCard style={styles.heroCard} borderRadius={32}>
            <View style={styles.iconSurface}>
              <Image source={getDictionaryCategoryIcon(sign.category)} style={styles.icon} resizeMode="contain" />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.category}>{sign.category.name}</Text>
              <Text style={styles.title}>{sign.title}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                favorite === true && styles.favoriteButtonActive,
                (favorite === null || savingFavorite) && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              accessibilityState={{ disabled: favorite === null || savingFavorite, selected: favorite === true }}
              disabled={favorite === null || savingFavorite}
              onPress={() => void toggleFavorite()}
            >
              {savingFavorite ? (
                <ActivityIndicator size="small" color={BLUE} />
              ) : (
                <Feather name="star" size={24} color={favorite ? WHITE : BLUE} />
              )}
            </TouchableOpacity>
          </AppGlassCard>

          {favoriteError ? (
            <View style={styles.favoriteError}>
              <Feather name="alert-circle" size={18} color="#9B354A" />
              <View style={styles.favoriteErrorCopy}>
                <Text style={styles.favoriteErrorText}>{favoriteError}</Text>
                <TouchableOpacity accessibilityRole="button" onPress={() => void loadDetails()}>
                  <Text style={styles.retryLink}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {sign.description?.trim() ? (
            <InfoCard icon="align-left" title="Descrição" content={sign.description.trim()} />
          ) : null}
          {sign.example?.trim() ? (
            <InfoCard icon="message-circle" title="Exemplo de uso" content={sign.example.trim()} />
          ) : null}

          {!sign.description?.trim() && !sign.example?.trim() ? (
            <AppGlassCard style={styles.infoCard} borderRadius={28}>
              <Feather name="info" size={22} color={BLUE} />
              <Text style={styles.emptyInfo}>Este sinal ainda não possui descrição ou exemplo cadastrados.</Text>
            </AppGlassCard>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoCard({ icon, title, content }: { icon: keyof typeof Feather.glyphMap; title: string; content: string }) {
  return (
    <AppGlassCard style={styles.infoCard} borderRadius={28}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIcon}><Feather name={icon} size={19} color={BLUE} /></View>
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoContent}>{content}</Text>
    </AppGlassCard>
  );
}

function DetailState({ icon, title, description, loading = false, actionLabel, onAction }: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.state}>
      {loading ? <ActivityIndicator size="large" color={BLUE} /> : <Feather name={icon} size={42} color={BLUE} />}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6EEFB', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: TEXT, fontFamily: 'PoppinsM', fontSize: 20, textAlign: 'center' },
  headerSpacer: { width: 44 },
  scroll: { flex: 1 },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32, gap: 18 },
  heroCard: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 15 },
  iconSurface: { width: 64, height: 64, borderRadius: 22, backgroundColor: '#E3EEFF', borderWidth: 1, borderColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 34, height: 34, tintColor: BLUE },
  heroCopy: { flex: 1, minWidth: 0, gap: 4 },
  category: { color: BLUE, fontFamily: 'PoppinsM', fontSize: 11 },
  title: { color: TEXT, fontFamily: 'Poppins SemiBold', fontSize: 23, lineHeight: 30 },
  favoriteButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E6EEFB', borderWidth: 1, borderColor: WHITE, alignItems: 'center', justifyContent: 'center' },
  favoriteButtonActive: { backgroundColor: BLUE, borderColor: BLUE },
  disabled: { opacity: 0.5 },
  favoriteError: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: 20, backgroundColor: '#FFF1F3' },
  favoriteErrorCopy: { flex: 1, gap: 5 },
  favoriteErrorText: { color: '#9B354A', fontFamily: 'Poppins', fontSize: 12, lineHeight: 18 },
  retryLink: { color: BLUE, fontFamily: 'PoppinsM', fontSize: 12 },
  infoCard: { padding: 20, gap: 14 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  infoIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#E6EEFB', alignItems: 'center', justifyContent: 'center' },
  infoTitle: { color: TEXT, fontFamily: 'PoppinsM', fontSize: 16 },
  infoContent: { color: MUTED, fontFamily: 'Poppins', fontSize: 14, lineHeight: 23 },
  emptyInfo: { color: MUTED, fontFamily: 'Poppins', fontSize: 13, lineHeight: 21 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 10 },
  stateTitle: { color: TEXT, fontFamily: 'PoppinsM', fontSize: 20, textAlign: 'center' },
  stateDescription: { color: MUTED, fontFamily: 'Poppins', fontSize: 13, lineHeight: 21, textAlign: 'center' },
  retryButton: { minHeight: 44, marginTop: 8, borderRadius: 22, backgroundColor: BLUE, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  retryButtonText: { color: WHITE, fontFamily: 'PoppinsM', fontSize: 13 },
});

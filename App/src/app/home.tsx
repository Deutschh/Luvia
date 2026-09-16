import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';
import { useAuth } from '../contexts/AuthContext';
import { getMe, normalizeAvatarUrl } from '../services/userService';

const BLUE = '#0A6DFF';
const TEXT = '#152341';
const MUTED = '#64748B';
const WHITE = '#FFFFFF';
const PAGE = '#F1F5FF';

const LOGO = require('../../assets/images/Luvia/logo-branca.png');
const ESSENCIAIS = require('../../assets/images/Luvia/home/essenciais.png');
const FAVORITOS = require('../../assets/images/Luvia/home/favorito.png');
const SOCIAIS = require('../../assets/images/Luvia/home/sociais.png');
const BEMESTAR = require('../../assets/images/Luvia/home/bem-estar.png');
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');

export default function HomeScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    avatarUrl: user?.avatarUrl ?? null,
  });
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomNavigationContentInset = useBottomNavigationContentInset();
  // Keep text readable by stacking sections as the viewport shrinks or fonts grow.
  const readableWidth = Math.min(width - insets.left - insets.right, 680) / Math.max(fontScale, 1);
  const singleColumnGloves = readableWidth < 330;
  const compactShortcuts = readableWidth < 360;
  const wideGreeting = readableWidth >= 600;
  const wideTranslation = readableWidth >= 440;
  const name = profile.name.trim();
  const firstName = name.split(/\s+/)[0];
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => Array.from(part)[0]).join('').toUpperCase();

  useEffect(() => {
    setProfile({
      name: user?.name ?? '',
      avatarUrl: user?.avatarUrl ?? null,
    });
  }, [user?.avatarUrl, user?.id, user?.name]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void getMe()
        .then((currentUser) => {
          if (isActive) {
            setProfile({
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
            });
          }
        })
        .catch(() => {
          // Preserve the last known profile while the API is temporarily unavailable.
        });

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: bottomNavigationContentInset }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            {/* Clip only the decoration, never the cards or their shadows. */}
            <View style={styles.heroDecoration} pointerEvents="none" accessible={false}>
              <LinearGradient
                colors={['#1264EE', '#0A7EFF', '#429BFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.waveBack} />
              <View style={styles.waveFront} />
            </View>

            <View style={styles.heroContent}>
              <View style={styles.brandRow}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="Luvia" />
                <TouchableOpacity
                  style={styles.notificationButton}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir notificações"
                  onPress={() => router.push('/notification')}
                >
                  <Feather name="bell" size={24} color={WHITE} />
                </TouchableOpacity>
              </View>

              <View style={[styles.welcomeArea, wideGreeting && styles.horizontal]}>
                <View style={[styles.greetingRow, wideGreeting && styles.flexible]}>
                  <UserAvatar
                    key={`${user?.id ?? ''}:${profile.avatarUrl ?? ''}`}
                    avatarUrl={profile.avatarUrl}
                    initials={initials}
                  />
                  <View style={styles.greetingCopy}>
                    <Text style={styles.greeting}>{firstName ? `Olá, ${firstName}!` : 'Olá!'}</Text>
                    <Text style={styles.greetingSubtitle}>Ajudando a transformar comunicação em inclusão.</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.connectionPill, wideGreeting && styles.flexible]}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Luvas desconectadas. Aguardando conexão. Abrir Luvas"
                  onPress={() => router.push('/gloves')}
                >
                  <View style={styles.connectionIcon}>
                    <Feather name="bluetooth" size={22} color={WHITE} />
                  </View>
                  <View style={styles.connectionCopy}>
                    <Text style={styles.connectionTitle}>Luvas desconectadas</Text>
                    <Text style={styles.connectionSubtitle}>Aguardando conexão</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={WHITE} />
                </TouchableOpacity>
              </View>

              <View style={styles.heroHeading}>
                <Text style={styles.heroTitle} accessibilityRole="header">Vamos traduzir?</Text>
                <Text style={styles.heroSubtitle}>Conecte suas luvas e comece agora.</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <View style={[styles.glovesRow, singleColumnGloves && styles.vertical]}>
              <GloveCard label="Luva Esquerda" stacked={singleColumnGloves} />
              <GloveCard label="Luva Direita" stacked={singleColumnGloves} />
            </View>

            <AppGlassCard style={[styles.sectionCard, styles.glassSurface]} borderRadius={28}>
              <SectionTitle icon="activity" title="Traduzir" />
              <View style={[styles.translationContent, wideTranslation && styles.horizontal]}>
                <View style={[styles.translationCopy, wideTranslation && styles.flexible]}>
                  <Text style={styles.translationTitle}>Faça um sinal para começar</Text>
                  <Text style={styles.bodyText}>A tradução aparecerá aqui em texto e voz.</Text>
                  <View style={styles.lastPhrase}>
                    <Text style={styles.eyebrow}>ÚLTIMA FRASE</Text>
                    <Text style={styles.bodyText}>Nenhum registro</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.translateAction, wideTranslation && styles.translateActionWide]}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir tradução"
                  accessibilityHint="Abre a tela demonstrativa. Não inicia tradução real."
                  onPress={() => router.push('/translate')}
                >
                  <View style={styles.microphoneHalo}>
                    <View style={styles.microphoneButton}>
                      <Feather name="mic" size={30} color={WHITE} />
                    </View>
                  </View>
                  <Text style={styles.translateLabel}>Abrir tradução</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.futureNotice}>
                <Feather name="info" size={15} color={MUTED} />
                <Text style={styles.futureText}>A tradução real estará disponível em etapa futura, com as luvas conectadas.</Text>
              </View>
            </AppGlassCard>

            <AppGlassCard style={[styles.sectionCard, styles.glassSurface]} borderRadius={28}>
              <SectionTitle icon="grid" title="Atalhos" />
              <View style={styles.shortcutsRow}>
                <ShortcutItem
                  source={FAVORITOS}
                  label="Favoritos"
                  compact={compactShortcuts}
                  onPress={() => router.push({ pathname: '/dictionary', params: { filter: 'favorites' } })}
                />
                <ShortcutItem
                  source={ESSENCIAIS}
                  label="Essenciais"
                  compact={compactShortcuts}
                  onPress={() => router.push({ pathname: '/dictionary', params: { category: 'essenciais' } })}
                />
                <ShortcutItem
                  source={SOCIAIS}
                  label="Sociais"
                  compact={compactShortcuts}
                  onPress={() => router.push({ pathname: '/dictionary', params: { category: 'sociais' } })}
                />
                <ShortcutItem
                  source={BEMESTAR}
                  label="Bem-estar"
                  compact={compactShortcuts}
                  onPress={() => router.push({ pathname: '/dictionary', params: { category: 'bem-estar' } })}
                />
              </View>
            </AppGlassCard>

            <AppGlassCard style={[styles.sectionCard, styles.glassSurface]} borderRadius={28}>
              <SectionTitle icon="clock" title="Histórico recente" />
              <View style={styles.historyContent}>
                <View style={styles.historyIcon}>
                  <Feather name="file-text" size={24} color="#8595B0" />
                </View>
                <Text style={[styles.bodyText, styles.flexible]}>Nenhuma frase detectada nesta sessão.</Text>
              </View>
            </AppGlassCard>
          </View>
        </ScrollView>
      </View>

      <AppBottomNavigation activeRoute="home" />
    </SafeAreaView>
  );
}

// The key above resets a failed image when the account or avatar changes.
function UserAvatar({ avatarUrl, initials }: { avatarUrl?: string | null; initials: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={styles.avatar}>
      {avatarUrl && !imageFailed ? (
        <Image
          source={{ uri: normalizeAvatarUrl(avatarUrl) }}
          style={styles.avatarImage}
          onError={() => setImageFailed(true)}
          accessible={false}
        />
      ) : initials ? (
        <Text style={styles.avatarInitials} maxFontSizeMultiplier={1.3}>{initials}</Text>
      ) : (
        <Feather name="user" size={28} color={BLUE} />
      )}
    </View>
  );
}

function GloveCard({ label, stacked }: { label: string; stacked: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.gloveTouchable, !stacked && styles.gloveColumn]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${label}. Offline. Sensores inativos. Abrir Luvas`}
      onPress={() => router.push('/gloves')}
    >
      <AppGlassCard style={[styles.gloveCard, styles.glassSurface]} borderRadius={28}>
        <View style={styles.gloveTop}>
          <Image source={LUVAS} style={styles.gloveIcon} resizeMode="contain" />
          <View style={styles.offlineBadge}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        </View>
        <Text style={styles.gloveLabel}>{label}</Text>
        <View style={styles.sensorPlaceholder}>
          <Text style={styles.sensorValue}>—</Text>
        </View>
        <Text style={styles.sensorCaption}>Sensores inativos</Text>
      </AppGlassCard>
    </TouchableOpacity>
  );
}

function SectionTitle({ icon, title }: { icon: 'activity' | 'grid' | 'clock'; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Feather name={icon} size={22} color={BLUE} />
      <Text style={styles.sectionTitle} accessibilityRole="header">{title}</Text>
    </View>
  );
}

type ShortcutItemProps = {
  source: ImageSourcePropType;
  label: string;
  compact: boolean;
  onPress: () => void;
};

function ShortcutItem({ source, label, compact, onPress }: ShortcutItemProps) {
  return (
    <TouchableOpacity
      style={[styles.shortcutItem, compact && styles.shortcutItemCompact]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${label} no Dicionário`}
      onPress={onPress}
    >
      <View style={styles.shortcutTile}>
        <Image source={source} style={styles.shortcutIcon} resizeMode="contain" />
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1264EE' },
  page: { flex: 1, backgroundColor: PAGE },
  scroll: { flex: 1 },
  flexible: { flex: 1, minWidth: 0 },
  horizontal: { flexDirection: 'row', alignItems: 'center' },
  vertical: { flexDirection: 'column' },
  hero: { paddingBottom: 52 },
  heroDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
  },
  waveBack: {
    position: 'absolute',
    width: 420,
    height: 240,
    borderRadius: 150,
    right: -110,
    bottom: -155,
    backgroundColor: 'rgba(190, 229, 255, 0.28)',
    transform: [{ rotate: '-32deg' }],
  },
  waveFront: {
    position: 'absolute',
    width: 350,
    height: 210,
    borderRadius: 130,
    left: -45,
    bottom: -155,
    backgroundColor: 'rgba(210, 234, 255, 0.20)',
    transform: [{ rotate: '22deg' }],
  },
  heroContent: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 20 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginBottom: 22,
  },
  logo: { width: 142, height: 66 },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3C8BF5',
  },
  welcomeArea: { gap: 18 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greetingCopy: { flex: 1, minWidth: 0, gap: 4 },
  greeting: { color: WHITE, fontFamily: 'PoppinsM', fontSize: 18 },
  greetingSubtitle: { color: '#E4F0FF', fontFamily: 'Poppins', fontSize: 12, lineHeight: 19 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarInitials: { color: BLUE, fontFamily: 'PoppinsM', fontSize: 19 },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#3788F4',
  },
  connectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#5D9DF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionCopy: { flex: 1, minWidth: 0, gap: 3 },
  connectionTitle: { color: WHITE, fontFamily: 'PoppinsM', fontSize: 13 },
  connectionSubtitle: { color: '#E4F0FF', fontFamily: 'Poppins', fontSize: 11 },
  heroHeading: { marginTop: 26, gap: 8 },
  heroTitle: { color: WHITE, fontFamily: 'Poppins SemiBold', fontSize: 30 },
  heroSubtitle: { color: '#F0F6FF', fontFamily: 'Poppins', fontSize: 15, lineHeight: 23 },
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingHorizontal: 20,
    marginTop: -24,
    gap: 18,
  },
  glovesRow: { flexDirection: 'row', gap: 12 },
  gloveTouchable: { minWidth: 0 },
  gloveColumn: { flex: 1 },
  gloveCard: { flexGrow: 1, padding: 16, gap: 12 },
  glassSurface: {
    backgroundColor: Platform.select({
      android: '#EEF3F8',
      ios: 'rgba(245, 247, 250, 0.82)',
      default: '#EEF3F8',
    }),
    borderColor: 'rgba(255, 255, 255, 0.88)',
  },
  gloveTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  gloveIcon: { width: 24, height: 28, tintColor: BLUE },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FCECEF',
  },
  offlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C43D59' },
  offlineText: { color: '#A72E48', fontFamily: 'PoppinsM', fontSize: 10 },
  gloveLabel: { color: '#405273', fontFamily: 'PoppinsM', fontSize: 13 },
  sensorPlaceholder: {
    alignSelf: 'center',
    minWidth: 76,
    minHeight: 76,
    paddingHorizontal: 12,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#DEE5F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorValue: { color: '#71839F', fontFamily: 'PoppinsM', fontSize: 30 },
  sensorCaption: { color: MUTED, fontFamily: 'Poppins', fontSize: 11, textAlign: 'center' },
  sectionCard: { padding: 20, gap: 18 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { flex: 1, color: TEXT, fontFamily: 'PoppinsM', fontSize: 16 },
  translationContent: { gap: 18 },
  translationCopy: { minWidth: 0, gap: 8 },
  translationTitle: { color: TEXT, fontFamily: 'PoppinsM', fontSize: 20 },
  bodyText: { color: MUTED, fontFamily: 'Poppins', fontSize: 13, lineHeight: 21 },
  lastPhrase: { padding: 16, gap: 6, marginTop: 8, borderRadius: 18, backgroundColor: '#EAF0FC' },
  eyebrow: { color: BLUE, fontFamily: 'PoppinsM', fontSize: 10, letterSpacing: 0.6 },
  translateAction: { alignItems: 'center', gap: 8, maxWidth: '100%' },
  translateActionWide: { flex: 0.65, minWidth: 0 },
  microphoneHalo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  microphoneButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateLabel: { color: BLUE, fontFamily: 'PoppinsM', fontSize: 13, textAlign: 'center' },
  futureNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  futureText: { flex: 1, color: MUTED, fontFamily: 'Poppins', fontSize: 11, lineHeight: 18 },
  shortcutsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  shortcutItem: { width: '23%', alignItems: 'center', gap: 8 },
  shortcutItemCompact: { width: '47%' },
  shortcutTile: {
    width: '100%',
    minHeight: 60,
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#E3ECFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutIcon: { width: 30, height: 30, tintColor: BLUE },
  shortcutLabel: { color: '#52637F', fontFamily: 'Poppins', fontSize: 10, textAlign: 'center' },
  historyContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E9EEF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

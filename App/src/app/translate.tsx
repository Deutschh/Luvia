import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#64748B';
const BACKGROUND = '#F7F9FD';
const BORDER = '#DDE6F3';
const DISCONNECTED = '#EF4444';

type TranslationVisualState =
  | 'waitingGloves'
  | 'ready'
  | 'translating'
  | 'result'
  | 'stale'
  | 'reconnecting'
  | 'error';

type TranslationPresentation = {
  title: string;
  description: string;
};

const TRANSLATION_PRESENTATIONS: Record<TranslationVisualState, TranslationPresentation> = {
  waitingGloves: {
    title: 'Faça um sinal para começar',
    description: 'A tradução aparecerá aqui quando as duas luvas estiverem prontas.',
  },
  ready: {
    title: 'Pronto para traduzir',
    description: 'Faça um sinal para iniciar uma futura tradução.',
  },
  translating: {
    title: 'Traduzindo sinais',
    description: 'Aguardando um resultado do reconhecedor.',
  },
  result: {
    title: 'Tradução disponível',
    description: 'O resultado reconhecido será exibido abaixo.',
  },
  stale: {
    title: 'Sinal interrompido',
    description: 'A tradução será pausada enquanto faltarem dados das luvas.',
  },
  reconnecting: {
    title: 'Reconectando luvas',
    description: 'A tradução continuará indisponível durante a reconexão.',
  },
  error: {
    title: 'Não foi possível traduzir',
    description: 'Verifique o estado das luvas antes de tentar novamente.',
  },
};

const CURRENT_STATE: TranslationVisualState = 'waitingGloves';

const GLOVE_STATUS = [
  { side: 'Esquerda', state: 'Desconectada' },
  { side: 'Direita', state: 'Desconectada' },
] as const;

export default function TranslateScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();
  const presentation = TRANSLATION_PRESENTATIONS[CURRENT_STATE];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Traduzir</Text>
          <Text style={styles.headerSubtitle}>Transforme sinais em texto e voz</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavigationContentInset }]}
        >
          <AppGlassCard style={styles.statusCard}>
            <View style={styles.statusHeading}>
              <View style={styles.statusIcon}>
                <Feather name="bluetooth" size={24} color={BLUE} />
              </View>
              <View style={styles.statusCopy}>
                <Text style={styles.statusTitle}>Luvas aguardando conexão</Text>
                <Text style={styles.statusSubtitle}>Conecte as luvas para iniciar a tradução.</Text>
              </View>
            </View>

            <View style={styles.gloveStatusGrid}>
              {GLOVE_STATUS.map((glove) => (
                <View key={glove.side} style={styles.gloveStatusItem}>
                  <View style={styles.gloveStatusLabelRow}>
                    <Feather name="circle" size={12} color={BLUE} />
                    <Text style={styles.gloveSide}>{glove.side}</Text>
                  </View>
                  <View style={styles.disconnectedRow}>
                    <View style={styles.disconnectedDot} />
                    <Text style={styles.disconnectedText}>{glove.state}</Text>
                  </View>
                </View>
              ))}
            </View>
          </AppGlassCard>

          <AppGlassCard style={styles.translationCard}>
            <View style={styles.signalIcon}>
              <Feather name="activity" size={34} color={BLUE} />
            </View>
            <Text style={styles.translationTitle}>{presentation.title}</Text>
            <Text style={styles.translationDescription}>{presentation.description}</Text>

            <View style={styles.detectedPhrase}>
              <View style={styles.detectedHeading}>
                <Feather name="message-square" size={16} color={BLUE} />
                <Text style={styles.detectedLabel}>FRASE DETECTADA</Text>
              </View>
              <Text style={styles.detectedText}>Nenhuma frase detectada.</Text>
            </View>

            <View style={styles.confidenceRow}>
              <View style={styles.confidenceIcon}>
                <Feather name="target" size={16} color={BLUE} />
              </View>
              <Text style={styles.confidenceText}>Precisão: —</Text>
            </View>

            <View style={styles.primaryActionArea}>
              <TouchableOpacity
                style={styles.primaryActionDisabled}
                disabled
                accessibilityRole="button"
                accessibilityLabel="Iniciar tradução"
                accessibilityState={{ disabled: true }}
                accessibilityHint="Disponível quando as duas luvas estiverem prontas."
              >
                <Feather name="mic" size={25} color="#94A3B8" />
              </TouchableOpacity>
              <Text style={styles.primaryActionLabel}>Iniciar tradução</Text>
              <Text style={styles.primaryActionHint}>
                Disponível quando as duas luvas estiverem prontas.
              </Text>
            </View>
          </AppGlassCard>

          <AppGlassCard style={styles.historyCard}>
            <View style={styles.cardHeading}>
              <View style={styles.smallIconCircle}>
                <Feather name="clock" size={19} color={BLUE} />
              </View>
              <Text style={styles.cardTitle}>Histórico desta sessão</Text>
            </View>
            <View style={styles.emptyHistory}>
              <Feather name="file-text" size={20} color="#94A3B8" />
              <Text style={styles.historyEmpty}>Nenhuma frase detectada nesta sessão.</Text>
            </View>
          </AppGlassCard>

          <AppGlassCard style={styles.infoCard}>
            <View style={styles.smallIconCircle}>
              <Feather name="info" size={19} color={BLUE} />
            </View>
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>Integração futura</Text>
              <Text style={styles.infoDescription}>
                Esta tela está preparada para receber os dados das luvas e o resultado do reconhecimento em uma próxima etapa.
              </Text>
            </View>
          </AppGlassCard>
        </ScrollView>
      </View>

      <AppBottomNavigation activeRoute="translate" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: BACKGROUND,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  scroll: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 24,
    gap: 18,
  },
  statusCard: {
    padding: 18,
    gap: 16,
  },
  statusHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  statusSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  gloveStatusGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  gloveStatusItem: {
    flex: 1,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#F7FAFF',
    justifyContent: 'center',
    gap: 4,
  },
  gloveStatusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gloveSide: {
    flexShrink: 1,
    fontSize: 12,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  disconnectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disconnectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: DISCONNECTED,
  },
  disconnectedText: {
    flexShrink: 1,
    fontSize: 10,
    fontFamily: 'Poppins',
    color: DISCONNECTED,
  },
  translationCard: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 10,
  },
  signalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
    marginBottom: 4,
  },
  translationTitle: {
    fontSize: 21,
    lineHeight: 29,
    fontFamily: 'PoppinsM',
    color: TEXT,
    textAlign: 'center',
  },
  translationDescription: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
  },
  detectedPhrase: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E4F5',
    backgroundColor: '#EEF4FC',
    gap: 8,
  },
  detectedHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detectedLabel: {
    fontSize: 10,
    fontFamily: 'PoppinsM',
    color: BLUE,
    letterSpacing: 0.7,
  },
  detectedText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  confidenceRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  confidenceIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  primaryActionArea: {
    marginTop: 8,
    alignItems: 'center',
    gap: 6,
  },
  primaryActionDisabled: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#E9EEF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsM',
    color: '#94A3B8',
  },
  primaryActionHint: {
    maxWidth: 240,
    fontSize: 10,
    lineHeight: 15,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
  },
  historyCard: {
    padding: 18,
    gap: 14,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  emptyHistory: {
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyEmpty: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  infoCard: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoCopy: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  infoDescription: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins',
    color: MUTED,
  },
});

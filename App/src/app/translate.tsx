import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#64748B';
const BRANCO = '#FFFFFF';

export default function TranslateScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" backgroundColor={BRANCO} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Traduzir</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavigationContentInset }]}
        >
          <AppGlassCard style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Feather name="bluetooth" size={20} color={BLUE} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Luvas aguardando conexão</Text>
              <Text style={styles.statusSubtitle}>Conecte as luvas para iniciar a tradução.</Text>
            </View>
          </AppGlassCard>

          <AppGlassCard style={styles.translationCard}>
            <View style={styles.signalIcon}>
              <Feather name="activity" size={34} color={BLUE} />
            </View>
            <Text style={styles.translationTitle}>Faça um sinal para começar</Text>
            <Text style={styles.translationDescription}>A tradução aparecerá aqui em texto e voz.</Text>

            <View style={styles.detectedPhrase}>
              <Text style={styles.detectedLabel}>FRASE DETECTADA</Text>
              <Text style={styles.detectedText}>Aguardando seus sinais...</Text>
            </View>

            <View style={styles.confidenceRow}>
              <Feather name="target" size={16} color={BLUE} />
              <Text style={styles.confidenceText}>Precisão estimada: --%</Text>
            </View>

            <View style={styles.translationActions}>
              <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
                <Feather name="volume-2" size={20} color={BLUE} />
                <Text style={styles.secondaryActionText}>Reproduzir</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryAction} activeOpacity={0.8}>
                <Feather name="mic" size={24} color={BRANCO} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
                <Feather name="trash-2" size={20} color={BLUE} />
                <Text style={styles.secondaryActionText}>Limpar</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.primaryActionLabel}>Iniciar tradução</Text>
          </AppGlassCard>

          <AppGlassCard style={styles.historyCard}>
            <Text style={styles.cardTitle}>Histórico desta sessão</Text>
            <Text style={styles.historyEmpty}>Nenhuma frase detectada nesta sessão.</Text>
          </AppGlassCard>

          <AppGlassCard style={styles.infoCard}>
            <Feather name="info" size={20} color={BLUE} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Tradução em breve</Text>
              <Text style={styles.infoDescription}>
                A tradução em tempo real será ativada quando as luvas estiverem conectadas.
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
    backgroundColor: BRANCO,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  statusTitle: {
    fontSize: 15,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  statusSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  translationCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  signalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },
  translationTitle: {
    marginTop: 18,
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
    textAlign: 'center',
  },
  translationDescription: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
  },
  detectedPhrase: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#EEF4FC',
  },
  detectedLabel: {
    fontSize: 10,
    fontFamily: 'PoppinsM',
    color: BLUE,
    letterSpacing: 0.7,
  },
  detectedText: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  translationActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  secondaryAction: {
    width: 72,
    alignItems: 'center',
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 11,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  primaryAction: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryActionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'PoppinsM',
    color: BLUE,
  },
  historyCard: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  historyEmpty: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  infoDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins',
    color: MUTED,
  },
});

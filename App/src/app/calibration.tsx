import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppGlassCard } from '../components/AppGlassCard';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#64748B';
const WHITE = '#FFFFFF';
const BACKGROUND = '#F7F9FD';
const BORDER = '#DDE6F3';
const INACTIVE_BG = '#E9EEF6';
const INACTIVE_TEXT = '#94A3B8';

const STEPS = [
  { id: 1, letter: 'A' },
  { id: 2, letter: 'O' },
  { id: 3, letter: 'C' },
  { id: 4, letter: 'L' },
] as const;

export default function CalibrationScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isCounting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((previous) => previous - 1);
      }, 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);

      if (currentStep < STEPS.length) {
        setCurrentStep((previous) => previous + 1);
        setCountdown(5);
      } else {
        Alert.alert(
          'Demonstração concluída',
          'Nenhum sensor foi lido ou calibrado.',
          [{ text: 'Voltar', onPress: () => router.back() }],
          { cancelable: false },
        );
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, currentStep, isCounting]);

  function startDemonstrationStep() {
    setIsCounting(true);
  }

  const currentLetter = STEPS[currentStep - 1].letter;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, isCounting && styles.backButtonDisabled]}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            disabled={isCounting}
          >
            <Feather name="chevron-left" size={26} color={isCounting ? INACTIVE_TEXT : BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demonstração</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppGlassCard style={styles.introCard}>
            <View style={styles.introIcon}>
              <Feather name="target" size={24} color={BLUE} />
            </View>
            <View style={styles.introCopy}>
              <Text style={styles.cardTitle}>Demonstração de calibração</Text>
              <Text style={styles.description}>
                Esta prévia explica o fluxo visual planejado para quando as luvas estiverem conectadas.
              </Text>
            </View>
          </AppGlassCard>

          <View style={styles.noticeBox}>
            <Feather name="info" size={19} color={BLUE} />
            <Text style={styles.noticeText}>
              Nenhum sensor está conectado. As posições abaixo não são lidas, avaliadas ou persistidas.
            </Text>
          </View>

          <View style={styles.wizardContainer}>
            {STEPS.map((step, index) => (
              <View key={step.id} style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep >= step.id ? styles.activeStep : styles.inactiveStep,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      currentStep >= step.id ? styles.activeStepText : styles.inactiveStepText,
                    ]}
                  >
                    {step.id}
                  </Text>
                </View>
                {index < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      currentStep > step.id ? styles.activeLine : styles.inactiveLine,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          <AppGlassCard style={styles.demonstrationCard}>
            <View style={styles.letterCircle}>
              <Text style={styles.letter}>{currentLetter}</Text>
            </View>
            <Text style={styles.title}>
              Faça o sinal “<Text style={styles.highlight}>{currentLetter}</Text>”
            </Text>
            <Text style={styles.subtitle}>
              Para conhecer a demonstração, mantenha visualmente a letra por 5 segundos. Nenhuma pose será detectada.
            </Text>

            <View style={styles.demoState}>
              <View style={styles.neutralDot} />
              <Text style={styles.demoStateText}>Prévia sem leitura de sensores</Text>
            </View>

            <TouchableOpacity
              style={[styles.mainButton, isCounting && styles.mainButtonDisabled]}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ disabled: isCounting }}
              onPress={startDemonstrationStep}
              disabled={isCounting}
            >
              <Feather name={isCounting ? 'clock' : 'play'} size={19} color={WHITE} />
              <Text style={styles.mainButtonText}>
                {isCounting ? `${countdown}s` : `Iniciar etapa ${currentStep}`}
              </Text>
            </TouchableOpacity>
          </AppGlassCard>

          <Text style={styles.footerText}>
            A demonstração possui quatro etapas e não altera nenhuma configuração das luvas.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  container: { flex: 1 },
  header: { minHeight: 66, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: BORDER, backgroundColor: '#F2F6FC', alignItems: 'center', justifyContent: 'center' },
  backButtonDisabled: { backgroundColor: '#EEF2F7' },
  headerTitle: { flexShrink: 1, fontSize: 19, fontFamily: 'PoppinsM', color: TEXT, textAlign: 'center' },
  headerPlaceholder: { width: 44 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, gap: 18 },
  introCard: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 13 },
  introIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center' },
  introCopy: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 16, fontFamily: 'PoppinsM', color: TEXT },
  description: { fontSize: 12, lineHeight: 18, fontFamily: 'Poppins', color: MUTED },
  noticeBox: { padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#C8DCF8', backgroundColor: '#EAF2FF', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Poppins', color: '#38516F' },
  wizardContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  activeStep: { backgroundColor: BLUE },
  inactiveStep: { backgroundColor: INACTIVE_BG },
  stepText: { fontSize: 15, fontFamily: 'PoppinsM' },
  activeStepText: { color: WHITE },
  inactiveStepText: { color: INACTIVE_TEXT },
  stepLine: { width: 22, height: 2, marginHorizontal: 4 },
  activeLine: { backgroundColor: BLUE },
  inactiveLine: { backgroundColor: INACTIVE_BG },
  demonstrationCard: { paddingHorizontal: 22, paddingVertical: 24, alignItems: 'center', gap: 12 },
  letterCircle: { width: 82, height: 82, borderRadius: 41, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  letter: { fontSize: 36, fontFamily: 'PoppinsM', color: BLUE },
  title: { fontSize: 21, lineHeight: 29, fontFamily: 'PoppinsM', color: TEXT, textAlign: 'center' },
  highlight: { color: BLUE },
  subtitle: { fontSize: 13, lineHeight: 20, fontFamily: 'Poppins', color: MUTED, textAlign: 'center' },
  demoState: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 7 },
  neutralDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  demoStateText: { flexShrink: 1, fontSize: 11, fontFamily: 'Poppins', color: MUTED },
  mainButton: { width: '100%', minHeight: 54, marginTop: 8, paddingHorizontal: 20, borderRadius: 27, backgroundColor: BLUE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  mainButtonDisabled: { backgroundColor: '#4C94F8' },
  mainButtonText: { fontSize: 14, fontFamily: 'PoppinsM', color: WHITE },
  footerText: { paddingHorizontal: 16, fontSize: 11, lineHeight: 17, fontFamily: 'Poppins', color: MUTED, textAlign: 'center' },
});

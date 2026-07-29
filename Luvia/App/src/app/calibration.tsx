import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';
const BORDER = '#888E9740';
const INACTIVE_BG = '#F3F4F6';
const INACTIVE_TEXT = '#D1D5DB';

const STEPS = [
  { id: 1, letter: 'A' },
  { id: 2, letter: 'O' },
  { id: 3, letter: 'C' },
  { id: 4, letter: 'L' },
];

export default function CalibrationScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCounting && countdown === 0) {
      setIsCounting(false);
      
      if (currentStep < STEPS.length) {
        
        setCurrentStep((prev) => prev + 1);
        setCountdown(5);
      } else {
       
        alert('Calibragem concluída com sucesso!');
        router.back();
      }
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown, currentStep]);

  function startCalibration() {
    setIsCounting(true);
  }

  const currentLetter = STEPS[currentStep - 1].letter;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonWrapper}
            activeOpacity={0.75}
            onPress={() => router.back()}
            disabled={isCounting}
          >
            <GlassContainer style={StyleSheet.absoluteFill}>
              <GlassView style={styles.glassEffect} />
            </GlassContainer>
            <Feather name="chevron-left" size={28} color={BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calibragem</Text>
          <View style={styles.placeholder} />
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

        <View style={styles.content}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>
              Faça o sinal “<Text style={styles.highlightLetter}>{currentLetter}</Text>”
            </Text>
            <Text style={styles.subtitle}>
              Sinalize a letra <Text style={styles.highlightSubtitle}>{currentLetter}</Text> em Libras, mantendo-a por 5 segundos.
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.tipText}>A calibragem segue 4 etapas.</Text>
          
          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.85}
            onPress={startCalibration}
            disabled={isCounting}
          >
            <Text style={styles.mainButtonText}>
              {isCounting ? `${countdown}...` : '5...'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
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
    paddingHorizontal: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginTop: 20,
    zIndex: 10,
  },
  backButtonWrapper: {
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  
  wizardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: BLUE,
  },
  inactiveStep: {
    backgroundColor: INACTIVE_BG,
  },
  stepText: {
    fontSize: 18,
    fontFamily: 'Mazzard',
  },
  activeStepText: {
    color: BRANCO,
  },
  inactiveStepText: {
    color: INACTIVE_TEXT,
  },
  stepLine: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: BLUE,
  },
  inactiveLine: {
    backgroundColor: INACTIVE_BG,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsM',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  highlightLetter: {
    fontFamily: 'Poppins SemiBold',
    color: BLUE,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Mazzard',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  highlightSubtitle: {
    color: BLUE,
    fontFamily: 'Poppins SemiBold',
  },

  footer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 24,
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: MUTED,
    marginBottom: 20,
    textAlign: 'center',
  },
  mainButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  mainButtonText: {
    color: BRANCO,
    fontSize: 16,
    fontFamily: 'MazzardH-Medium',
  },
});
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#7A7A7A';
const LIGHT = '#F1F1F1';

const onboardingSteps = [
  {
    id: 1,
    title: 'Conecte as\nsuas Luvas.',
    description:
      'Sincronize o hardware Luvia via Bluetooth e comece a transformar seus movimentos em voz.',
    image: require('../../assets/images/Luvia/onboarding/connect-gloves.png'),
  },
  {
    id: 2,
    title: 'Sua voz,\nsua identidade.',
    description:
      'Utilize a tecnologia de voz clonada para que a tradução soe exatamente como você.',
    image: require('../../assets/images/Luvia/onboarding/voice-identity.png'),
  },
  {
    id: 3,
    title: 'Evolua seu\nvocabulário.',
    description:
      'Treine novos sinais e personalize seu dicionário para uma comunicação cada vez mais fluida.',
    image: require('../../assets/images/Luvia/onboarding/vocabulary.png'),
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);

  const isFinalStep = step >= onboardingSteps.length;

  function handleContinue() {
    if (step < onboardingSteps.length) {
      setStep((currentStep) => currentStep + 1);
    }
  }

  if (isFinalStep) {
    return <WelcomeScreen />;
  }

  const currentStep = onboardingSteps[step];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.progressWrapper}>
          {onboardingSteps.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.progressBar,
                index <= step ? styles.progressBarActive : styles.progressBarInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.textWrapper}>
          <Text style={styles.title}>{currentStep.title}</Text>

          <Text style={styles.description}>
            {currentStep.description}
          </Text>
        </View>

        <View style={styles.imageWrapper}>
          <Image
            source={currentStep.image}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.welcomeImageWrapper}>
          <Image
            source={require('../../assets/images/Luvia/onboarding/welcome.png')}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        <Image
          source={require('../../assets/images/Luvia/Logo.png')}
          style={styles.welcomeLogo}
          resizeMode="contain"
        />

        <Text style={styles.welcomeDescription}>
          Comunique-se em qualquer lugar. O Luvia traduz seus sinais de Libras
          para áudio instantaneamente.
        </Text>

        <TouchableOpacity
          style={styles.registerButton}
          activeOpacity={0.85}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerButtonText}>Cadastrar-se</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.75}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Faça Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 28,
  },

  progressWrapper: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 54,
  },

  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },

  progressBarActive: {
    backgroundColor: BLUE,
  },

  progressBarInactive: {
    backgroundColor: LIGHT,
  },

  textWrapper: {
    alignItems: 'center',
  },

  title: {
    color: BLUE,
    fontSize: 30,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
  },

  description: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 290,
  },

  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustration: {
    width: '100%',
    height: 340,
  },

  continueButton: {
    height: 56,
    borderRadius: 36,
    backgroundColor: BLUE,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'left',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 36,
    marginTop: -3,
  },

  welcomeImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcomeImage: {
    width: '100%',
    height: 330,
  },

  welcomeLogo: {
    width: 170,
    height: 80,
    alignSelf: 'center',
    marginBottom: 16,
  },

  welcomeDescription: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 26,
  },

  registerButton: {
    height: 56,
    borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  loginButtonText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '600',
  },
});
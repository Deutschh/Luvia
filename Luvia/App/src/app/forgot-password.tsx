import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#7A7A7A';
const BORDER = '#888E9740';

const CADEADO = require('../../assets/images/Luvia/login/cadeado.png');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showToast) {
      progressAnim.setValue(1);
      
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 5000,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        setShowToast(false);
        router.push('/new-password');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showToast]);

  function handleSend() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }
    setShowToast(true);
  }

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={24} color={BLUE} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Image
              source={CADEADO}
              style={styles.cadeadoIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Esqueceu a senha?</Text>
          <Text style={styles.description}>
            Não se preocupe! Insira o email associado à conta.{'\n'}
            Enviaremos instruções para reiniciá-la.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Insira seu email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.85}
            onPress={handleSend}
          >
            <Text style={styles.mainButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>

        {showToast && (
          <View style={styles.toastContainer}>
            <View style={styles.toastContent}>
              <View style={styles.toastCheckCircle}>
                <Feather name="check" size={16} color={BLUE} />
              </View>
              <View style={styles.toastTextWrapper}>
                <Text style={styles.toastTitle}>Sucesso!</Text>
                <Text style={styles.toastMessage}>O e-mail de recuperação foi enviado.</Text>
              </View>
            </View>
            <Animated.View style={[styles.toastProgressBar, { width: widthInterpolate }]} />
          </View>
        )}
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
    paddingHorizontal: 34,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    marginTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0162FF40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  cadeadoIcon: {
    width: 54,
    height: 54,
  },
  title: {
    fontSize: 24,
    fontFamily: 'MazzardH-Medium',
    color: BLUE,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    marginBottom: 40,
  },
  label: {
    color: MUTED,
    fontSize: 12,
    marginLeft: 4,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  inputWrapper: {
    height: 44,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: '100%',
    color: TEXT,
    fontSize: 13,
    fontFamily: 'Poppins',
  },
  mainButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'MazzardH-Medium',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 34,
    right: 34,
    backgroundColor: BLUE,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  toastCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    fontWeight: 800,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  toastTextWrapper: {
    flex: 1,
  },
  toastTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'MazzardH-Medium',
    marginBottom: 2,
  },
  toastMessage: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins',
  },
  toastProgressBar: {
    height: 3,
    backgroundColor: '#00E676',
  },
});
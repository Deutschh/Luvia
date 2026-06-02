import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#979797';
const BORDER = '#888E9740';

const CARTA = require('../../assets/images/Luvia/login/carta.png');

export default function VerifyEmailScreen() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(10);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function handleCodeChange(text: string, index: number) {
    const newCode = [...code];
    newCode[index] = text.slice(-1); 
    setCode(newCode);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleConfirm() {
    router.push('/verify-sms');
  }

  function handleResend() {
    if (countdown > 0) return;
    setCountdown(10);
  }

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
              source={CARTA}
              style={styles.cartaIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Verifique seu e-mail</Text>
          <Text style={styles.description}>
            Enviamos um código de 6 dígitos para{'\n'}
            <Text style={styles.emailHighlight}></Text>
            <Text>.</Text>
          </Text>

          <View style={styles.codeWrapper}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                style={[styles.codeInput, digit ? styles.codeInputActive : null]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.85}
            onPress={handleConfirm}
          >
            <Text style={styles.mainButtonText}>Confirmar</Text>
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Não recebeu o código? </Text>
            <TouchableOpacity 
              activeOpacity={countdown > 0 ? 1 : 0.7} 
              onPress={handleResend}
              disabled={countdown > 0}
            >
              <Text style={[styles.resendLink, countdown > 0 ? styles.resendLinkDisabled : null]}>
                {countdown > 0 ? `Reenviar (${countdown}s).` : 'Reenviar.'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  cartaIcon: {
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
  emailHighlight: {
    color: BLUE,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  codeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'MazzardH-Medium',
    color: TEXT,
    backgroundColor: '#FFFFFF',
  },
  codeInputActive: {
    borderColor: BLUE,
    borderWidth: 2,
  },
  mainButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'MazzardH-Medium',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  resendLink: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: BLUE,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#AEB4BE',
  },
});
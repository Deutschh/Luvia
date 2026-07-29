import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BRANCO = '#FFFFFF';

export default function CalibrationScreen() {
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isCounting && countdown === 0) {
      router.back();
    }
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  function startCalibration() {
    setIsCounting(true);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButtonWrapper}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <GlassContainer style={StyleSheet.absoluteFill}>
              <GlassView style={styles.glassEffect} />
            </GlassContainer>
            <Feather name="chevron-left" size={28} color={BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Sinal</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.textBlock}>
            <Text style={styles.title}>Faça o sinal ou palavra</Text>
            <Text style={styles.subtitle}>
              Sinalize o sinal ou palavra para o sistema fazer o reconhecimento e gravar em seu dicionário.
            </Text>
          </View>

          <View style={styles.centerContainer}>
            {/* Espaço reservado para animações ou instruções visuais futuras */}
          </View>

          <View style={styles.footer}>
            <Text style={styles.tipText}>Faça com calma para melhores resultados.</Text>
            
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
    marginBottom: -20,
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 24,
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
  subtitle: {
    fontSize: 13,
    fontFamily: 'Mazzard',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 25,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'Mazzard',
    color: MUTED,
    marginBottom: 20,
    textAlign: 'center',
  },
  mainButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  mainButtonText: {
    color: BRANCO,
    fontSize: 16,
    fontFamily: 'MazzardH-Medium',
  },
});
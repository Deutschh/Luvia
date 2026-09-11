import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#64748B';
const BRANCO = '#FFFFFF';
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');

export default function GlovesScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Luvas</Text>
          <View style={styles.statusRow}>
            <Feather name="bluetooth" size={16} color={MUTED} />
            <Text style={styles.description}>Aguardando conexão</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavigationContentInset }]}
          showsVerticalScrollIndicator={false}
        >
          {['Luva esquerda', 'Luva direita'].map((label) => (
            <AppGlassCard key={label} style={styles.card}>
              <View style={styles.cardHeading}>
                <View style={styles.iconCircle}>
                  <Image source={LUVAS} style={styles.gloveIcon} resizeMode="contain" />
                </View>
                <View style={styles.headingText}>
                  <Text style={styles.cardTitle}>{label}</Text>
                  <Text style={styles.description}>Desconectada</Text>
                </View>
              </View>
              <View style={styles.metricRow}>
                <Feather name="battery" size={18} color={MUTED} />
                <Text style={styles.metricText}>Bateria: —</Text>
              </View>
            </AppGlassCard>
          ))}

          <View style={styles.connectionSection}>
            <TouchableOpacity
              style={styles.disabledButton}
              disabled
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityHint="A conexão com as luvas estará disponível em uma etapa futura."
            >
              <Feather name="bluetooth" size={20} color={MUTED} />
              <Text style={styles.disabledButtonText}>Conectar luvas</Text>
            </TouchableOpacity>
            <Text style={styles.connectionHint}>
              A conexão com as luvas ainda não está disponível.
            </Text>
          </View>

          <AppGlassCard style={styles.card}>
            <View style={styles.cardHeading}>
              <View style={styles.iconCircle}>
                <Feather name="target" size={22} color={BLUE} />
              </View>
              <Text style={[styles.cardTitle, styles.headingText]}>Calibração</Text>
            </View>
            <Text style={styles.metricText}>Precisão: —</Text>
            <Text style={styles.description}>Sem dados de calibração.</Text>
            <Text style={styles.description}>
              A demonstração é apenas uma prévia: não lê nem calibra sensores.
            </Text>
            <TouchableOpacity
              style={styles.previewButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              onPress={() => router.push('/calibration')}
            >
              <Text style={styles.previewButtonText}>Ver demonstração de calibração</Text>
              <Feather name="chevron-right" size={20} color={BLUE} />
            </TouchableOpacity>
          </AppGlassCard>

          <AppGlassCard style={styles.card}>
            <View style={styles.cardHeading}>
              <View style={styles.iconCircle}>
                <Feather name="activity" size={22} color={BLUE} />
              </View>
              <View style={styles.headingText}>
                <Text style={styles.cardTitle}>Sensores</Text>
                <Text style={styles.description}>Sem dados</Text>
              </View>
            </View>
            <Text style={styles.description}>
              Os testes dos sensores estarão disponíveis em uma etapa futura.
            </Text>
          </AppGlassCard>
        </ScrollView>
      </View>

      <AppBottomNavigation activeRoute="gloves" />
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
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: BRANCO,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'PoppinsM',
    color: TEXT,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scroll: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: 24,
    gap: 20,
  },
  card: {
    padding: 20,
    gap: 12,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gloveIcon: {
    width: 24,
    height: 24,
    tintColor: BLUE,
  },
  headingText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  description: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 15,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  connectionSection: {
    gap: 8,
  },
  disabledButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  disabledButtonText: {
    flexShrink: 1,
    fontSize: 14,
    fontFamily: 'PoppinsM',
    color: MUTED,
  },
  connectionHint: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
  },
  previewButton: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewButtonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'PoppinsM',
    color: BLUE,
  },
});

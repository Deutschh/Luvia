import { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBottomNavigation, useBottomNavigationContentInset } from '../components/AppBottomNavigation';
import { AppGlassCard } from '../components/AppGlassCard';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#64748B';
const BACKGROUND = '#F7F9FD';
const WHITE = '#FFFFFF';
const BORDER = '#DDE6F3';
const DISCONNECTED = '#EF4444';
const LUVAS = require('../../assets/images/Luvia/home/luvas.png');

type GloveSide = 'left' | 'right';

type GloveConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'ready'
  | 'streaming'
  | 'stale'
  | 'reconnecting'
  | 'incompatible'
  | 'error';

type GlovePresentation = {
  side: GloveSide;
  label: string;
  state: GloveConnectionState;
  batteryPercent: number | null;
  sensorsAvailable: boolean | null;
  calibrated: boolean | null;
};

const GLOVES: readonly GlovePresentation[] = [
  {
    side: 'left',
    label: 'Luva Esquerda',
    state: 'disconnected',
    batteryPercent: null,
    sensorsAvailable: null,
    calibrated: null,
  },
  {
    side: 'right',
    label: 'Luva Direita',
    state: 'disconnected',
    batteryPercent: null,
    sensorsAvailable: null,
    calibrated: null,
  },
];

const FINGERS = ['Polegar', 'Indicador', 'Médio', 'Anelar', 'Mínimo'] as const;

const CONNECTION_LABELS: Record<GloveConnectionState, string> = {
  disconnected: 'Desconectada',
  connecting: 'Conectando',
  connected: 'Conectada',
  ready: 'Pronta',
  streaming: 'Transmitindo',
  stale: 'Dados interrompidos',
  reconnecting: 'Reconectando',
  incompatible: 'Incompatível',
  error: 'Erro',
};

export default function GlovesScreen() {
  const bottomNavigationContentInset = useBottomNavigationContentInset();
  const { width } = useWindowDimensions();
  const [selectedSide, setSelectedSide] = useState<GloveSide>('left');
  const stackGloveCards = width < 390;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Luvas</Text>
          <Text style={styles.headerSubtitle}>Conexão, sensores e calibração</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavigationContentInset }]}
          showsVerticalScrollIndicator={false}
        >
          <AppGlassCard style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Feather name="bluetooth" size={25} color={BLUE} />
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.sectionTitle}>Aguardando conexão</Text>
              <Text style={styles.description}>
                Conecte suas luvas para visualizar os sensores.
              </Text>
            </View>
            <View style={styles.offlinePill}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          </AppGlassCard>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minhas luvas</Text>
            <Text style={styles.sectionHint}>Estados independentes</Text>
          </View>

          <View style={styles.gloveGrid}>
            {GLOVES.map((glove) => (
              <AppGlassCard
                key={glove.side}
                style={[styles.gloveCard, stackGloveCards && styles.gloveCardStacked]}
              >
                <View style={styles.gloveHeading}>
                  <View style={styles.gloveIconCircle}>
                    <Image source={LUVAS} style={styles.gloveIcon} resizeMode="contain" />
                  </View>
                  <View style={styles.gloveHeadingCopy}>
                    <Text style={styles.gloveTitle}>{glove.label}</Text>
                    <View style={styles.disconnectedRow}>
                      <View style={styles.offlineDot} />
                      <Text style={styles.disconnectedText}>
                        {CONNECTION_LABELS[glove.state]}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metricsList}>
                  <MetricRow label="Estado" value={CONNECTION_LABELS[glove.state]} />
                  <MetricRow label="Bateria" value={formatBattery(glove.batteryPercent)} />
                  <MetricRow label="Sensores" value={formatAvailability(glove.sensorsAvailable)} />
                  <MetricRow label="Calibração" value={formatAvailability(glove.calibrated)} />
                </View>
              </AppGlassCard>
            ))}
          </View>

          <View style={styles.connectionSection}>
            <TouchableOpacity
              style={styles.disabledButton}
              disabled
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityHint="Disponível na próxima etapa de integração BLE."
            >
              <Feather name="bluetooth" size={20} color="#94A3B8" />
              <Text style={styles.disabledButtonText}>Conectar luvas</Text>
            </TouchableOpacity>
            <Text style={styles.connectionHint}>
              Disponível na próxima etapa de integração BLE.
            </Text>
          </View>

          <AppGlassCard style={styles.sectionCard}>
            <View style={styles.cardHeading}>
              <View style={styles.iconCircle}>
                <Feather name="activity" size={22} color={BLUE} />
              </View>
              <View style={styles.headingText}>
                <Text style={styles.sectionTitle}>Sensores de flexão</Text>
                <Text style={styles.description}>Selecione uma luva para visualizar seus dedos.</Text>
              </View>
            </View>

            <View style={styles.sideSelector}>
              <SideSelectorButton
                label="Esquerda"
                selected={selectedSide === 'left'}
                onPress={() => setSelectedSide('left')}
              />
              <SideSelectorButton
                label="Direita"
                selected={selectedSide === 'right'}
                onPress={() => setSelectedSide('right')}
              />
            </View>

            <View style={styles.sensorList}>
              {FINGERS.map((finger) => (
                <View key={finger} style={styles.sensorRow}>
                  <View style={styles.sensorNameRow}>
                    <View style={styles.neutralDot} />
                    <Text style={styles.sensorName}>{finger}</Text>
                  </View>
                  <Text style={styles.sensorStatus}>Aguardando dados</Text>
                </View>
              ))}
            </View>
          </AppGlassCard>

          <AppGlassCard style={styles.sectionCard}>
            <View style={styles.cardHeading}>
              <View style={styles.iconCircle}>
                <Feather name="target" size={22} color={BLUE} />
              </View>
              <View style={styles.headingText}>
                <Text style={styles.sectionTitle}>Calibração</Text>
                <Text style={styles.description}>Nenhum dado de calibração disponível.</Text>
              </View>
            </View>

            <View style={styles.noticeBox}>
              <Feather name="info" size={18} color={BLUE} />
              <Text style={styles.noticeText}>
                A próxima tela é apenas uma demonstração visual. Nenhum sensor será lido ou calibrado.
              </Text>
            </View>

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
        </ScrollView>
      </View>

      <AppBottomNavigation activeRoute="gloves" />
    </SafeAreaView>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function SideSelectorButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.sideButton, selected && styles.sideButtonSelected]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <Text style={[styles.sideButtonText, selected && styles.sideButtonTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function formatBattery(value: number | null) {
  return value === null ? '—' : `${value}%`;
}

function formatAvailability(value: boolean | null) {
  if (value === null) return '—';
  return value ? 'Disponível' : 'Indisponível';
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  container: { flex: 1 },
  header: { paddingTop: 18, paddingBottom: 14, paddingHorizontal: 24, backgroundColor: BACKGROUND },
  headerTitle: { fontSize: 28, fontFamily: 'PoppinsM', color: TEXT },
  headerSubtitle: { marginTop: 2, fontSize: 13, fontFamily: 'Poppins', color: MUTED },
  scroll: { flex: 1, overflow: 'hidden' },
  scrollContent: { paddingTop: 8, paddingHorizontal: 24, gap: 18 },
  statusCard: { padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center' },
  statusCopy: { flex: 1, gap: 2 },
  offlinePill: { minHeight: 28, paddingHorizontal: 10, borderRadius: 14, backgroundColor: '#FFF1F2', flexDirection: 'row', alignItems: 'center', gap: 6 },
  offlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: DISCONNECTED },
  offlineText: { fontSize: 11, fontFamily: 'PoppinsM', color: DISCONNECTED },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { flexShrink: 1, fontSize: 16, fontFamily: 'PoppinsM', color: TEXT },
  sectionHint: { flexShrink: 1, fontSize: 11, fontFamily: 'Poppins', color: MUTED },
  gloveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gloveCard: { width: '48%', flexGrow: 1, padding: 16, gap: 16 },
  gloveCardStacked: { width: '100%' },
  gloveHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gloveIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center' },
  gloveIcon: { width: 23, height: 23, tintColor: BLUE },
  gloveHeadingCopy: { flex: 1, minWidth: 0, gap: 3 },
  gloveTitle: { fontSize: 14, fontFamily: 'PoppinsM', color: TEXT },
  disconnectedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  disconnectedText: { flexShrink: 1, fontSize: 11, fontFamily: 'Poppins', color: DISCONNECTED },
  metricsList: { gap: 9 },
  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metricLabel: { flexShrink: 1, fontSize: 11, fontFamily: 'Poppins', color: MUTED },
  metricValue: { flexShrink: 1, fontSize: 11, fontFamily: 'PoppinsM', color: TEXT, textAlign: 'right' },
  connectionSection: { gap: 7 },
  disabledButton: { minHeight: 54, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 27, borderWidth: 1, borderColor: BORDER, backgroundColor: '#EEF2F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  disabledButtonText: { flexShrink: 1, fontSize: 14, fontFamily: 'PoppinsM', color: '#94A3B8' },
  connectionHint: { fontSize: 11, lineHeight: 17, fontFamily: 'Poppins', color: MUTED, textAlign: 'center' },
  sectionCard: { padding: 18, gap: 16 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F1FF', alignItems: 'center', justifyContent: 'center' },
  headingText: { flex: 1, gap: 2 },
  description: { flexShrink: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Poppins', color: MUTED },
  sideSelector: { flexDirection: 'row', padding: 4, borderRadius: 22, backgroundColor: '#E9EEF6', gap: 4 },
  sideButton: { flex: 1, minHeight: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  sideButtonSelected: { backgroundColor: WHITE, borderWidth: 1, borderColor: '#D8E4F5' },
  sideButtonText: { fontSize: 12, fontFamily: 'PoppinsM', color: MUTED },
  sideButtonTextSelected: { color: BLUE },
  sensorList: { gap: 2 },
  sensorRow: { minHeight: 44, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sensorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  neutralDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  sensorName: { fontSize: 13, fontFamily: 'PoppinsM', color: TEXT },
  sensorStatus: { flexShrink: 1, fontSize: 11, fontFamily: 'Poppins', color: MUTED, textAlign: 'right' },
  noticeBox: { padding: 14, borderRadius: 18, backgroundColor: '#EAF2FF', flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Poppins', color: '#38516F' },
  previewButton: { minHeight: 48, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1, borderColor: '#BBD3F8', backgroundColor: '#F7FAFF', flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewButtonText: { flex: 1, fontSize: 13, fontFamily: 'PoppinsM', color: BLUE },
});

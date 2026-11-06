import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppGlassCard } from '../components/AppGlassCard';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#64748B';
const BACKGROUND = '#F7F9FD';
const BORDER = '#DDE6F3';

type NotificationCategory =
  | 'gloveConnection'
  | 'lowBattery'
  | 'calibrationRequired'
  | 'connectionFailure'
  | 'translationEvent'
  | 'systemUpdate';

type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
};

const notifications: readonly NotificationItem[] = [];

export default function NotificationScreen() {
  const isEmpty = notifications.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={26} color={BLUE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificações</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Text style={styles.introTitle}>Acompanhe os avisos do Luvia</Text>
            <Text style={styles.introDescription}>
              Eventos importantes aparecerão aqui quando as integrações estiverem disponíveis.
            </Text>
          </View>

          {isEmpty ? (
            <AppGlassCard style={styles.emptyCard}>
              <View style={styles.emptyIconHalo}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="bell" size={34} color={BLUE} />
                </View>
              </View>

              <Text style={styles.emptyTitle}>Nenhuma notificação por enquanto</Text>
              <Text style={styles.emptyDescription}>
                Quando houver integração real, esta área mostrará alertas das luvas, da tradução e do sistema.
              </Text>

              <View style={styles.futureNotice}>
                <Feather name="info" size={18} color={BLUE} />
                <Text style={styles.futureNoticeText}>
                  Conexão, bateria, calibração e falhas serão informadas somente a partir de eventos reais.
                </Text>
              </View>
            </AppGlassCard>
          ) : (
            <View style={styles.notificationList}>
              {notifications.map((notification) => (
                <AppGlassCard key={notification.id} style={styles.notificationCard}>
                  <View style={styles.notificationIcon}>
                    <Feather name="bell" size={20} color={BLUE} />
                  </View>
                  <View style={styles.notificationCopy}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationDescription}>{notification.description}</Text>
                  </View>
                </AppGlassCard>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
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
    minHeight: 66,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#F2F6FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: TEXT,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 22,
  },
  intro: {
    gap: 5,
  },
  introTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  introDescription: {
    maxWidth: 340,
    fontSize: 12,
    lineHeight: 19,
    fontFamily: 'Poppins',
    color: MUTED,
  },
  emptyCard: {
    flex: 1,
    minHeight: 360,
    paddingHorizontal: 24,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyIconHalo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E6EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: '#C7DBFA',
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 25,
    fontFamily: 'PoppinsM',
    color: TEXT,
    textAlign: 'center',
  },
  emptyDescription: {
    maxWidth: 300,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
  },
  futureNotice: {
    width: '100%',
    marginTop: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#EAF2FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  futureNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: 'Poppins',
    color: '#38516F',
  },
  notificationList: {
    gap: 14,
  },
  notificationCard: {
    minHeight: 82,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCopy: {
    flex: 1,
    gap: 3,
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: 'PoppinsM',
    color: TEXT,
  },
  notificationDescription: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins',
    color: MUTED,
  },
});

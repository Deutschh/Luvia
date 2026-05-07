import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../components/AppButton';
import { colors } from '../theme/colors';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logo}>🤟</Text>
      </View>

      <Text style={styles.title}>Libras-Connect Pro</Text>

      <Text style={styles.subtitle}>
        Traduza sinais de Libras em voz, conecte suas luvas inteligentes e
        personalize seu próprio dicionário de comunicação.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Primeira etapa do app</Text>

        <Text style={styles.cardText}>
          Nesta versão inicial, vamos preparar a base visual, login, cadastro,
          navegação e estrutura para futuras integrações com Bluetooth, banco
          local e servidor.
        </Text>
      </View>

      <AppButton
        title="Entrar"
        onPress={() => router.push('/login')}
      />

      <AppButton
        title="Criar conta"
        variant="secondary"
        onPress={() => router.push('/register')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  logoBox: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logo: {
    fontSize: 42,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
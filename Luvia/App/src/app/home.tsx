import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from '../components/AppButton';
import { colors } from '../theme/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Olá, Guilherme 👋</Text>

      <Text style={styles.title}>Painel do Libras-Connect</Text>

      <View style={styles.statusGrid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Luva esquerda</Text>
          <Text style={styles.cardValue}>Desconectada</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Luva direita</Text>
          <Text style={styles.cardValue}>Desconectada</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Modo</Text>
          <Text style={styles.cardValue}>Offline</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Bateria</Text>
          <Text style={styles.cardValue}>--%</Text>
        </View>
      </View>

      <View style={styles.phraseBox}>
        <Text style={styles.phraseLabel}>Última frase traduzida</Text>
        <Text style={styles.phraseText}>
          Nenhuma frase traduzida ainda.
        </Text>
      </View>

      <AppButton
        title="Iniciar tradução"
        onPress={() => {}}
      />

      <AppButton
        title="Conectar luvas"
        variant="secondary"
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 64,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: 15,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  cardValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  phraseBox: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  phraseLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  phraseText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
});
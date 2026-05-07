import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  function handleLogin() {
    router.push('/home');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <Text style={styles.subtitle}>
        Acesse sua conta para sincronizar seu dicionário e gerenciar suas luvas.
      </Text>

      <AppInput
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppInput
        placeholder="Senha"
        secureTextEntry
      />

      <AppButton
        title="Entrar"
        onPress={handleLogin}
      />

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>
          Ainda não tenho conta
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>
          Voltar
        </Text>
      </TouchableOpacity>
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
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 22,
    fontWeight: '700',
  },
  back: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 18,
  },
});
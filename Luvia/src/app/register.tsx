import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors } from '../theme/colors';

export default function RegisterScreen() {
  function handleRegister() {
    router.push('/home');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>

      <Text style={styles.subtitle}>
        Crie seu perfil para salvar palavras, configurar voz e sincronizar seus
        dados com segurança.
      </Text>

      <AppInput placeholder="Nome completo" />

      <AppInput
        placeholder="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AppInput
        placeholder="Senha"
        secureTextEntry
      />

      <AppInput
        placeholder="Confirmar senha"
        secureTextEntry
      />

      <AppButton
        title="Criar conta"
        onPress={handleRegister}
      />

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>
          Já tenho uma conta
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
    marginBottom: 20,
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
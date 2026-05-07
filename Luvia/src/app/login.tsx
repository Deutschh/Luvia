import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#7A7A7A';
const BORDER = '#C9CED6';
const SOFT = '#EEF0F3';

export default function LoginScreen() {
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin() {
    router.push('/home');
  }

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/Luvia/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.tabWrapper}>
          <TouchableOpacity style={styles.tabActive} activeOpacity={0.85}>
            <Text style={styles.tabActiveText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabInactive}
            activeOpacity={0.85}
            onPress={() => router.replace('/register')}
          >
            <Text style={styles.tabInactiveText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleText}>Entrar com Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira seu email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Senha</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>▣</Text>
            <TextInput
              style={styles.input}
              placeholder="Insira sua senha"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPassword((current) => !current)}
            >
              <Text style={styles.eyeIcon}>◉</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberWrapper}
              activeOpacity={0.75}
              onPress={() => setRememberMe((current) => !current)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Text style={styles.checkText}>✓</Text>}
              </View>

              <Text style={styles.rememberText}>Lembrar-me</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.75}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.85}
            onPress={handleLogin}
          >
            <Text style={styles.mainButtonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 34,
    paddingTop: 70,
    paddingBottom: 34,
  },

  header: {
    alignItems: 'center',
    marginBottom: 34,
  },

  backButton: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  backIcon: {
    color: BLUE,
    fontSize: 38,
    lineHeight: 40,
    marginTop: -2,
  },

  logo: {
    width: 130,
    height: 58,
  },

  tabWrapper: {
    height: 50,
    borderRadius: 25,
    backgroundColor: SOFT,
    flexDirection: 'row',
    padding: 3,
    marginBottom: 76,
  },

  tabActive: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabInactive: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabActiveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  tabInactiveText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '600',
  },

  googleButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 34,
  },

  googleIcon: {
    color: '#4285F4',
    fontSize: 22,
    fontWeight: '800',
    marginRight: 18,
  },

  googleText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '500',
  },

  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 38,
  },

  divider: {
    flex: 1,
    height: 1.3,
    backgroundColor: '#AEB4BE',
  },

  dividerText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginHorizontal: 18,
  },

  form: {
    width: '100%',
  },

  label: {
    color: MUTED,
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 8,
  },

  inputWrapper: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 22,
  },

  inputIcon: {
    color: '#6B7280',
    fontSize: 17,
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },

  input: {
    flex: 1,
    height: '100%',
    color: TEXT,
    fontSize: 13,
  },

  eyeIcon: {
    color: '#6B7280',
    fontSize: 17,
    marginLeft: 8,
  },

  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -6,
  },

  rememberWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkboxActive: {
    backgroundColor: BLUE,
  },

  checkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  rememberText: {
    color: MUTED,
    fontSize: 12,
  },

  forgotText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '600',
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 80,
  },

  mainButton: {
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
  },
});
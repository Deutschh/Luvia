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
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { useAuth } from '../contexts/AuthContext';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#979797';
const BORDER = '#888E9740';
const SOFT = '#F0F2F4';

const GOOGLE = require('../../assets/images/Luvia/login/google.png');
const EMAIL = require('../../assets/images/Luvia/login/email.png');
const SENHA = require('../../assets/images/Luvia/login/senha.png');
const OLHO = require('../../assets/images/Luvia/login/olho.png');
const OLHODOIS = require('../../assets/images/Luvia/login/olho-dois.png');

export default function RegisterScreen() {
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const isFormValid = name.trim().length >= 3 && phone.replace(/\D/g, '').length >= 10 && email.includes('@') && password.length >= 6;

  async function handleRegister() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.trim().length < 3) {
      alert('Informe seu nome completo.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      alert('Informe um telefone válido.');
      return;
    }

    if (!emailRegex.test(email)) {
      alert('Por favor, insira um e-mail válido para o cadastro.');
      return;
    }

    if (password.trim().length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);

      await signUp({
        name,
        phone,
        email,
        password,
      });

      router.push('/verify-email');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível fazer o cadastro.';

      alert(message);
    } finally {
      setLoading(false);
    }
  }

  function handlePhoneChange(text: string) {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 11);
    
    let formatted = limited;
    if (limited.length > 2) {
      if (limited.length <= 6) {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
      } else if (limited.length <= 10) {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
      } else {
        formatted = `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
      }
    }
    setPhone(formatted);
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
            style={styles.backButtonWrapper}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <GlassContainer style={StyleSheet.absoluteFill}>
              <GlassView style={styles.glassEffect} />
            </GlassContainer>
            <Feather name="chevron-left" size={28} color={BLUE} />
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/Luvia/logo-L.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={styles.tabInactive}
            activeOpacity={0.85}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.tabInactiveText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabActive} activeOpacity={0.85}>
            <Text style={styles.tabActiveText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
          <Image 
            source={GOOGLE} 
            style={styles.googlePngIcon} 
            resizeMode="contain"
          />
          <Text style={styles.googleText}>Entrar com Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerWrapper}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>

          <View style={styles.inputWrapper}>
            <Image 
              source={require('../../assets/images/Luvia/login/lapis.png')} 
              style={[styles.formPngIcon, { tintColor: MUTED }]} 
              resizeMode="contain"
            />
            <TextInput
              style={styles.input}
              placeholder="Insira seu nome"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

          <Text style={styles.label}>Celular</Text>

          <View style={styles.inputWrapper}>
            <Image 
              source={require('../../assets/images/Luvia/login/telefone.png')} 
              style={[styles.formPngIcon, { tintColor: MUTED }]} 
              resizeMode="contain"
            />
            <TextInput
              style={styles.input}
              placeholder="Insira seu número de telefone"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone} 
              onChangeText={handlePhoneChange} 
            />
          </View>

          <Text style={styles.label}>Email</Text>

          <View style={styles.inputWrapper}>
            <Image 
              source={EMAIL} 
              style={styles.formPngIcon} 
              resizeMode="contain"
            />
            <TextInput
              style={styles.input}
              placeholder="Insira seu email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Senha</Text>

          <View style={styles.inputWrapper}>
            <Image 
              source={SENHA} 
              style={styles.formPngIcon} 
              resizeMode="contain"
            />
            <TextInput
              style={styles.input}
              placeholder="Insira sua senha"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPassword((current) => !current)}
            >
              <Image 
                source={showPassword ? OLHODOIS : OLHO} 
                style={styles.eyePngIcon} 
                resizeMode="contain"
              />
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
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: isFormValid ? BLUE : '#D1D5DB' }]}
            activeOpacity={isFormValid ? 0.85 : 1}
            onPress={isFormValid ? handleRegister : undefined}
            disabled={!isFormValid}
          >
            <Text style={styles.mainButtonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
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

  backButtonWrapper: {
    position: 'absolute',
    left: 0,
    top: 4,
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
    marginBottom: 36,
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
    fontFamily: 'MazzardH-Medium',
  },

  tabInactiveText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'MazzardH-Medium',
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

  googlePngIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },

  googleText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins',
  },

  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 38,
  },

  divider: {
    flex: 1,
    height: 2,
    borderRadius: 3,
    backgroundColor: '#888E9760',
  },

  dividerText: {
    color: '#888E9760',
    fontSize: 12,
    marginHorizontal: 18,
    fontFamily: 'Poppins',
  },

  form: {
    width: '100%',
  },

  label: {
    color: MUTED,
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 8,
    fontFamily: 'MazzardH-Medium',
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

  formPngIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },

  input: {
    flex: 1,
    height: '100%',
    color: TEXT,
    fontSize: 13,
    fontFamily: 'Poppins',
  },

  eyePngIcon: {
    width: 20,
    height: 20,
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
    borderWidth: 2,
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
    fontFamily: 'Poppins',
  },

  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 40,
  },

  mainButton: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'MazzardH-Medium',
  }
});
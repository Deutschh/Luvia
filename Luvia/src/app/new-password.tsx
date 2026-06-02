import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#979797';
const BORDER = '#888E9740';

const COFRE = require('../../assets/images/Luvia/login/cofre.png');
const OLHO = require('../../assets/images/Luvia/login/olho.png');
const OLHODOIS = require('../../assets/images/Luvia/login/olho-dois.png');

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleConfirm() {
    if (password.length < 8) {
      alert('A senha deve conter ao menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    alert('Senha alterada com sucesso!');
    router.replace('/login');
  }

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.innerSafeArea}>
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
              <Feather name="chevron-left" size={24} color={BLUE} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.imageWrapper}>
              <Image
                source={COFRE}
                style={styles.cofreImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Crie uma nova senha</Text>
            <Text style={styles.description}>
              Crie uma senha forte, ao menos 8 caracteres e{'\n'}
              diferente de outros aplicativos.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Nova Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Insira sua nova senha"
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

              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirme sua nova senha"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowConfirmPassword((current) => !current)}
                >
                  <Image
                    source={showConfirmPassword ? OLHODOIS : OLHO}
                    style={styles.eyePngIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.mainButton}
              activeOpacity={0.85}
              onPress={handleConfirm}
            >
              <Text style={styles.mainButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  innerSafeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 34,
    paddingBottom: 34,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    marginTop: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  cofreImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontFamily: 'MazzardH-Medium',
    color: BLUE,
    textAlign: 'center',
    marginBottom: 14,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins',
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    color: MUTED,
    fontSize: 12,
    marginLeft: 4,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  inputWrapper: {
    height: 44,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
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
  mainButton: {
    width: '100%',
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
    fontFamily: 'MazzardH-Medium',
  },
});
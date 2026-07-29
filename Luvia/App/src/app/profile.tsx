import { useState, useRef } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BORDER = '#888E9740';
const BRANCO = '#FFFFFF';

const INITIAL_NAME = 'Felipe Vivêncio';
const INITIAL_EMAIL = 'felipevivenciorodrigues@gmail.com';
const INITIAL_PHONE = '(11) 93947-0383';
const INITIAL_PASSWORD = 'senha123';

const PERFIL = require('../../assets/images/Luvia/profile/profile.png');
const EDITAR = require('../../assets/images/Luvia/home/editar.png');
const OLHO = require('../../assets/images/Luvia/login/olho.png');
const OLHODOIS = require('../../assets/images/Luvia/login/olho-dois.png');

export default function ProfileScreen() {
  const [name, setName] = useState(INITIAL_NAME);
  const [email, setEmail] = useState(INITIAL_EMAIL);
  const [phone, setPhone] = useState(INITIAL_PHONE);
  const [password, setPassword] = useState(INITIAL_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  const hasChanges = 
    name !== INITIAL_NAME || 
    email !== INITIAL_EMAIL || 
    phone !== INITIAL_PHONE || 
    password !== INITIAL_PASSWORD;

  function handleSaveChanges() {
    alert('Alterações salvas com sucesso!');
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
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

            <Text style={styles.headerTitle}>Perfil</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Image 
                  source={PERFIL} 
                  style={styles.profileAvatar} 
                  resizeMode="cover" 
                />
                <TouchableOpacity style={styles.editBadgeWrapper} activeOpacity={0.85}>
                  <GlassContainer style={StyleSheet.absoluteFill}>
                    <GlassView style={styles.miniGlassEffect} />
                  </GlassContainer>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.9)', 'rgba(245, 245, 245, 0.4)', 'rgba(255, 255, 255, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Image source={EDITAR} style={styles.miniEditIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Nome</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={MUTED}
                />
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={MUTED}
                />
              </View>

              <Text style={styles.label}>Telefone</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={MUTED}
                />
              </View>

              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={MUTED}
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

              <TouchableOpacity 
                activeOpacity={0.75} 
                onPress={() => router.push('/forgot-password')}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.mainButton, !hasChanges && styles.mainButtonDisabled]}
                activeOpacity={hasChanges ? 0.85 : 1}
                onPress={hasChanges ? handleSaveChanges : undefined}
                disabled={!hasChanges}
              >
                <Text style={styles.mainButtonText}>Salvar alterações</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    marginTop: 20,
  },
  backButtonWrapper: {
    left: 0,
    top: 0,
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'PoppinsM',
    color: '#111827',
  },
  placeholder: {
    width: 44,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editBadgeWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden', 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 3,
  },
  miniGlassEffect: {
    width: 40,
    height: 40,
    borderRadius: 18, 
    backgroundColor: 'BG',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  miniEditIcon: {
    width: 18,
    height: 18,
    tintColor: BLUE,
    position: 'absolute',
    zIndex: 12,
  },
  form: {
    width: '100%',
  },
  label: {
    color: MUTED,
    fontSize: 13,
    marginLeft: 12,
    marginBottom: 8,
    fontFamily: 'MazzardH-Medium',
  },
  inputWrapper: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    height: '100%',
    color: TEXT,
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  eyePngIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    paddingHorizontal: 4,
  },
  forgotText: {
    color: BLUE,
    fontSize: 13,
    fontFamily: 'PoppinsM',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 60,
  },
  mainButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  mainButtonText: {
    color: BRANCO,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'MazzardH-Medium',
  },
});
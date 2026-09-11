import { useEffect, useState } from 'react';
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
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { GlassView, GlassContainer } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  deleteAvatar,
  getMe,
  normalizeAvatarUrl,
  updateMe,
  updatePassword,
  uploadAvatar,
  type AvatarUploadFile,
  type UserProfile,
} from '../services/userService';

const BLUE = '#0A6DFF';
const TEXT = '#111827';
const MUTED = '#9CA3AF';
const BORDER = '#888E9740';
const BRANCO = '#FFFFFF';

const INITIAL_NAME = '';
const INITIAL_EMAIL = '';
const INITIAL_PHONE = '';
const PERFIL = require('../../assets/images/Luvia/profile/profile.png');
const EDITAR = require('../../assets/images/Luvia/home/editar.png');
const OLHO = require('../../assets/images/Luvia/login/olho.png');
const OLHODOIS = require('../../assets/images/Luvia/login/olho-dois.png');

function sanitizePhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 11);
}

function formatPhone(value: string) {
  const digits = sanitizePhone(value);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ProfileScreen() {
  const [name, setName] = useState(INITIAL_NAME);
  const [initialName, setInitialName] = useState(INITIAL_NAME);
  const [email, setEmail] = useState(INITIAL_EMAIL);
  const [phone, setPhone] = useState(INITIAL_PHONE);
  const [initialPhone, setInitialPhone] = useState(INITIAL_PHONE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(true);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const hasChanges = name !== initialName || phone !== initialPhone;

  useEffect(() => {
    let isMounted = true;

    void getMe()
      .then((user) => {
        if (!isMounted) {
          return;
        }

        applyUserProfile(user);
      })
      .catch(() => {
        // Keep the screen's existing local values if the profile cannot be loaded.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function applyUserProfile(user: UserProfile) {
    setName(user.name);
    setInitialName(user.name);
    setEmail(user.email);
    const formattedPhone = formatPhone(user.phone ?? '');
    setPhone(formattedPhone);
    setInitialPhone(formattedPhone);
    setAvatarUrl(user.avatarUrl);

    if (typeof user.hasPassword === 'boolean') {
      setHasPassword(user.hasPassword);
    }
  }

  function getFriendlyErrorMessage(error: unknown, fallback: string) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('refresh token') || message.includes('token expirado')) {
        return 'Sua sessão expirou. Entre novamente para continuar.';
      }

      return error.message;
    }

    return fallback;
  }

  function handlePhoneChange(value: string) {
    setPhone(formatPhone(value));
  }

  async function handleSaveChanges() {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const user = await updateMe({
        name: name.trim(),
        phone: phone.trim() || null,
      });
      applyUserProfile(user);
      Alert.alert('Sucesso', 'Alterações salvas com sucesso.');
      router.back();
    } catch (error) {
      Alert.alert('Não foi possível salvar', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
    } finally {
      setIsSaving(false);
    }
  }

  function getImageFileType(asset: ImagePicker.ImagePickerAsset): AvatarUploadFile['type'] | null {
    if (asset.mimeType === 'image/jpeg' || asset.mimeType === 'image/png' || asset.mimeType === 'image/webp') {
      return asset.mimeType;
    }

    const extension = asset.uri.split('?')[0].split('.').pop()?.toLowerCase();

    if (extension === 'jpg' || extension === 'jpeg') {
      return 'image/jpeg';
    }

    if (extension === 'png') {
      return 'image/png';
    }

    return extension === 'webp' ? 'image/webp' : null;
  }

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso às fotos para trocar sua imagem de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const type = getImageFileType(asset);

    if (!type) {
      Alert.alert('Imagem inválida', 'Escolha uma imagem JPEG, PNG ou WebP.');
      return;
    }

    try {
      const user = await uploadAvatar({
        uri: asset.uri,
        name: asset.fileName || `avatar.${type.split('/')[1]}`,
        type,
      });
      applyUserProfile(user);
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso.');
    } catch (error) {
      Alert.alert('Não foi possível trocar a foto', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
    }
  }

  async function handleDeleteAvatar() {
    try {
      const user = await deleteAvatar();
      applyUserProfile(user);
      Alert.alert('Sucesso', 'Foto de perfil removida.');
    } catch (error) {
      Alert.alert('Não foi possível remover a foto', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
    }
  }

  function handleAvatarPress() {
    if (!avatarUrl) {
      void handlePickAvatar();
      return;
    }

    Alert.alert('Foto de perfil', 'O que você deseja fazer?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover foto', style: 'destructive', onPress: () => void handleDeleteAvatar() },
      { text: 'Trocar foto', onPress: () => void handlePickAvatar() },
    ]);
  }

  function openPasswordModal() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsPasswordModalVisible(true);
  }

  async function handleUpdatePassword() {
    if (newPassword.length < 8) {
      Alert.alert('Senha inválida', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Senha inválida', 'A nova senha e a confirmação devem ser iguais.');
      return;
    }

    if (hasPassword && !currentPassword) {
      Alert.alert('Senha atual obrigatória', 'Informe sua senha atual para continuar.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await updatePassword({
        ...(hasPassword ? { currentPassword } : {}),
        newPassword,
      });
      setHasPassword(true);
      setIsPasswordModalVisible(false);
      Alert.alert('Sucesso', 'Senha atualizada com sucesso.');
    } catch {
      Alert.alert('Não foi possível atualizar a senha', 'Verifique os dados e tente novamente.');
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Image 
                  source={avatarUrl ? { uri: normalizeAvatarUrl(avatarUrl) } : PERFIL}
                  style={styles.profileAvatar} 
                  resizeMode="cover" 
                />
                <TouchableOpacity style={styles.editBadgeWrapper} activeOpacity={0.85} onPress={handleAvatarPress}>
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
                  editable={false}
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
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={15}
                  placeholderTextColor={MUTED}
                />
              </View>

              <Text style={styles.label}>Senha</Text>
              <TouchableOpacity style={styles.inputWrapper} activeOpacity={1} onPress={openPasswordModal}>
                <TextInput
                  style={styles.input}
                  value=""
                  editable={false}
                  pointerEvents="none"
                  placeholder="Alterar senha"
                  placeholderTextColor={MUTED}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={openPasswordModal}
                >
                  <Image 
                    source={OLHO}
                    style={styles.eyePngIcon} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </TouchableOpacity>

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

        <Modal
          visible={isPasswordModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPasswordModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 34, backgroundColor: 'rgba(17, 24, 39, 0.35)' }}>
            <View style={{ backgroundColor: BRANCO, borderRadius: 28, padding: 24 }}>
              <Text style={[styles.headerTitle, { textAlign: 'center', marginBottom: 24 }]}>Alterar senha</Text>

              {hasPassword && (
                <>
                  <Text style={styles.label}>Senha atual</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                      autoCapitalize="none"
                      placeholderTextColor={MUTED}
                    />
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowCurrentPassword((value) => !value)}>
                      <Image source={showCurrentPassword ? OLHODOIS : OLHO} style={styles.eyePngIcon} resizeMode="contain" />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <Text style={styles.label}>Nova senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  placeholderTextColor={MUTED}
                />
                <TouchableOpacity activeOpacity={0.7} onPress={() => setShowNewPassword((value) => !value)}>
                  <Image source={showNewPassword ? OLHODOIS : OLHO} style={styles.eyePngIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirmar nova senha</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry={!showConfirmNewPassword}
                  autoCapitalize="none"
                  placeholderTextColor={MUTED}
                />
                <TouchableOpacity activeOpacity={0.7} onPress={() => setShowConfirmNewPassword((value) => !value)}>
                  <Image source={showConfirmNewPassword ? OLHODOIS : OLHO} style={styles.eyePngIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{ flex: 1, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BLUE }}
                  activeOpacity={0.85}
                  onPress={() => setIsPasswordModalVisible(false)}
                  disabled={isUpdatingPassword}
                >
                  <Text style={[styles.mainButtonText, { color: BLUE }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mainButton, { flex: 1 }]}
                  activeOpacity={0.85}
                  onPress={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                >
                  <Text style={styles.mainButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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

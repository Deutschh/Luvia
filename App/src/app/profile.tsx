import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { AppGlassCard } from '../components/AppGlassCard';
import { useAuth } from '../contexts/AuthContext';
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
const TEXT = '#152341';
const MUTED = '#64748B';
const WHITE = '#FFFFFF';
const PAGE = '#F1F5FF';

type Operation = 'profile' | 'avatar' | 'password' | 'logout';
type OperationTicket = { kind: Operation };

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getFriendlyErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.toLowerCase();
  if (message.includes('refresh token') || message.includes('token expirado')) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  return error.message;
}

function getImageFileType(asset: ImagePicker.ImagePickerAsset): AvatarUploadFile['type'] | null {
  if (asset.mimeType === 'image/jpeg' || asset.mimeType === 'image/png' || asset.mimeType === 'image/webp') {
    return asset.mimeType;
  }
  const extension = asset.uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  return extension === 'webp' ? 'image/webp' : null;
}

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/settings');
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  // A different account gets fresh local state and invalidates the previous requests.
  return <ProfileContent key={user.id} initialUser={user} signOut={signOut} />;
}

function ProfileContent({ initialUser, signOut }: { initialUser: UserProfile; signOut: () => Promise<void> }) {
  const [profile, setProfile] = useState<UserProfile>(initialUser);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: initialUser.name, phone: formatPhone(initialUser.phone ?? '') });
  const [operation, setOperation] = useState<Operation | null>(null);
  const [avatarRevision, setAvatarRevision] = useState(0);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const mounted = useRef(true);
  const focused = useRef(false);
  const loadRequest = useRef(0);
  const operationRef = useRef<OperationTicket | null>(null);
  const loadInFlight = useRef(false);
  const accountId = initialUser.id;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      loadRequest.current += 1;
      operationRef.current = null;
    };
  }, []);

  const reloadProfile = useCallback(async () => {
    if (!mounted.current || !focused.current || operationRef.current || loadInFlight.current) return;
    const request = ++loadRequest.current;
    const isCurrent = () => mounted.current && focused.current && request === loadRequest.current;
    loadInFlight.current = true;
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getMe();
      if (!isCurrent() || result.id !== accountId) return;
      setProfile(result);
      setProfileLoaded(true);
      setAvatarRevision((value) => value + 1);
    } catch (error) {
      if (isCurrent()) {
        setLoadError(getFriendlyErrorMessage(error, 'Não foi possível atualizar seu perfil. Tente novamente.'));
      }
    } finally {
      if (request === loadRequest.current) {
        loadInFlight.current = false;
        if (mounted.current) setLoading(false);
      }
    }
  }, [accountId]);

  useFocusEffect(useCallback(() => {
    focused.current = true;
    void reloadProfile();
    return () => {
      focused.current = false;
      loadRequest.current += 1;
      loadInFlight.current = false;
    };
  }, [reloadProfile]));

  const busy = operation !== null || loading;
  const canEdit = profileLoaded && !busy;
  const hasChanges = draft.name !== profile.name || draft.phone !== formatPhone(profile.phone ?? '');
  const hasPassword = profile.hasPassword ?? true;

  function beginOperation(kind: Operation): OperationTicket | null {
    if (!mounted.current || !focused.current || operationRef.current) return null;
    if (kind !== 'logout' && (!profileLoaded || loadInFlight.current)) return null;
    const ticket = { kind };
    operationRef.current = ticket;
    loadRequest.current += 1;
    loadInFlight.current = false;
    setLoading(false);
    setOperation(kind);
    return ticket;
  }

  function isCurrentOperation(ticket: OperationTicket) {
    return mounted.current && operationRef.current === ticket;
  }

  function finishOperation(ticket: OperationTicket) {
    if (operationRef.current !== ticket) return;
    operationRef.current = null;
    if (mounted.current) setOperation(null);
  }

  function applyConfirmedProfile(result: UserProfile) {
    // Avatar responses update confirmed data only, never the editable draft.
    setProfile((previous) => ({ ...result, hasPassword: result.hasPassword ?? previous.hasPassword }));
    setLoadError(null);
    setAvatarRevision((value) => value + 1);
  }

  function openEditor() {
    if (!canEdit || operationRef.current) return;
    setDraft({ name: profile.name, phone: formatPhone(profile.phone ?? '') });
    setEditing(true);
  }

  function cancelEditing() {
    if (operationRef.current) return;
    setDraft({ name: profile.name, phone: formatPhone(profile.phone ?? '') });
    setEditing(false);
    Keyboard.dismiss();
  }

  async function handleSaveChanges() {
    if (!hasChanges) return;
    const ticket = beginOperation('profile');
    if (!ticket) return;
    try {
      const result = await updateMe({ name: draft.name.trim(), phone: draft.phone.trim() || null });
      if (!isCurrentOperation(ticket) || result.id !== accountId) return;
      applyConfirmedProfile(result);
      setDraft({ name: result.name, phone: formatPhone(result.phone ?? '') });
      setEditing(false);
      Keyboard.dismiss();
      if (focused.current) {
        Alert.alert('Sucesso', 'Alterações salvas com sucesso.');
        goBack();
      }
    } catch (error) {
      if (isCurrentOperation(ticket) && focused.current) {
        Alert.alert('Não foi possível salvar', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
      }
    } finally {
      finishOperation(ticket);
    }
  }

  async function pickAvatar(ticket: OperationTicket) {
    try {
      if (!isCurrentOperation(ticket)) return;
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!isCurrentOperation(ticket)) return;
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Permita o acesso às fotos para trocar sua imagem de perfil.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (!isCurrentOperation(ticket) || result.canceled) return;
      const asset = result.assets[0];
      const type = asset ? getImageFileType(asset) : null;
      if (!asset || !type) {
        Alert.alert('Imagem inválida', 'Escolha uma imagem JPEG, PNG ou WebP.');
        return;
      }
      const updated = await uploadAvatar({
        uri: asset.uri,
        name: asset.fileName || `avatar.${type.split('/')[1]}`,
        type,
      });
      if (!isCurrentOperation(ticket) || updated.id !== accountId) return;
      applyConfirmedProfile(updated);
      if (focused.current) Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso.');
    } catch (error) {
      if (isCurrentOperation(ticket) && focused.current) {
        Alert.alert('Não foi possível trocar a foto', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
      }
    } finally {
      finishOperation(ticket);
    }
  }

  async function removeAvatar(ticket: OperationTicket) {
    try {
      if (!isCurrentOperation(ticket)) return;
      const updated = await deleteAvatar();
      if (!isCurrentOperation(ticket) || updated.id !== accountId) return;
      applyConfirmedProfile(updated);
      if (focused.current) Alert.alert('Sucesso', 'Foto de perfil removida.');
    } catch (error) {
      if (isCurrentOperation(ticket) && focused.current) {
        Alert.alert('Não foi possível remover a foto', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
      }
    } finally {
      finishOperation(ticket);
    }
  }

  function handleAvatarPress() {
    const ticket = beginOperation('avatar');
    if (!ticket) return;
    if (!profile.avatarUrl) {
      void pickAvatar(ticket);
      return;
    }
    Alert.alert('Foto de perfil', 'O que você deseja fazer?', [
      { text: 'Cancelar', style: 'cancel', onPress: () => finishOperation(ticket) },
      { text: 'Remover foto', style: 'destructive', onPress: () => void removeAvatar(ticket) },
      { text: 'Trocar foto', onPress: () => void pickAvatar(ticket) },
    ], { cancelable: false });
  }

  function openPasswordModal() {
    if (!canEdit || operationRef.current) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordModalVisible(true);
  }

  function closePasswordModal() {
    if (operationRef.current) return;
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  async function handleUpdatePassword() {
    if (operationRef.current) return;
    if (newPassword.length < 8) {
      Alert.alert('Senha inválida', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Senha inválida', 'A nova senha e a confirmação devem ser iguais.');
      return;
    }
    if (hasPassword && !currentPassword) {
      Alert.alert('Senha atual obrigatória', 'Informe sua senha atual para continuar.');
      return;
    }
    const ticket = beginOperation('password');
    if (!ticket) return;
    try {
      await updatePassword({ ...(hasPassword ? { currentPassword } : {}), newPassword });
      if (!isCurrentOperation(ticket)) return;
      setProfile((previous) => ({ ...previous, hasPassword: true }));
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Keyboard.dismiss();
      if (focused.current) Alert.alert('Sucesso', 'Senha atualizada com sucesso.');
    } catch (error) {
      if (isCurrentOperation(ticket) && focused.current) {
        Alert.alert('Não foi possível atualizar a senha', getFriendlyErrorMessage(error, 'Verifique os dados e tente novamente.'));
      }
    } finally {
      finishOperation(ticket);
    }
  }

  async function handleSignOut() {
    const ticket = beginOperation('logout');
    if (!ticket) return;
    try {
      await signOut();
      // AuthContext/guard also handle leaving private routes when user becomes null.
      if (isCurrentOperation(ticket) && focused.current) router.replace('/login');
    } catch (error) {
      if (isCurrentOperation(ticket) && focused.current) {
        Alert.alert('Não foi possível sair da conta', getFriendlyErrorMessage(error, 'Tente novamente em instantes.'));
      }
    } finally {
      finishOperation(ticket);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, operation !== null && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          disabled={operation !== null}
          onPress={goBack}
        >
          <Feather name="chevron-left" size={26} color={BLUE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppGlassCard style={styles.summaryCard} borderRadius={32}>
            <View style={styles.avatarWrapper}>
              <ProfileAvatar
                key={`${accountId}:${profile.avatarUrl ?? ''}:${avatarRevision}`}
                name={profile.name}
                avatarUrl={profile.avatarUrl}
              />
              <TouchableOpacity
                style={[styles.avatarEdit, !canEdit && styles.disabled]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Alterar foto do perfil"
                disabled={!canEdit}
                onPress={handleAvatarPress}
              >
                {operation === 'avatar' ? <ActivityIndicator color={WHITE} size="small" /> : <Feather name="camera" size={19} color={WHITE} />}
              </TouchableOpacity>
            </View>
            <View style={styles.identity}>
              <Text style={styles.profileName}>{profile.name.trim() || 'Sua conta'}</Text>
              <Text style={styles.profileEmail} selectable>{profile.email}</Text>
              {profile.phone ? <Text style={styles.profilePhone}>{formatPhone(profile.phone)}</Text> : null}
            </View>
            {operation === 'avatar' ? <Text style={styles.caption} accessibilityLiveRegion="polite">Atualizando foto…</Text> : null}
            <TouchableOpacity
              style={[styles.editButton, (!canEdit || editing) && styles.disabled]}
              accessibilityRole="button"
              accessibilityState={{ expanded: editing, disabled: !canEdit || editing }}
              disabled={!canEdit || editing}
              onPress={openEditor}
            >
              <Feather name="edit-2" size={16} color={BLUE} />
              <Text style={styles.editButtonText}>Editar perfil</Text>
            </TouchableOpacity>
          </AppGlassCard>

          {loading ? (
            <View style={styles.loadingRow} accessibilityLiveRegion="polite">
              <ActivityIndicator color={BLUE} />
              <Text style={styles.caption}>Atualizando perfil…</Text>
            </View>
          ) : null}
          {loadError ? (
            <AppGlassCard style={styles.card} borderRadius={24}>
              <Text style={styles.errorText} accessibilityLiveRegion="polite">{loadError}</Text>
              <TouchableOpacity
                style={[styles.retryButton, busy && styles.disabled]}
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void reloadProfile()}
              >
                <Feather name="refresh-cw" size={16} color={BLUE} />
                <Text style={styles.editButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </AppGlassCard>
          ) : null}

          {editing ? (
            <AppGlassCard style={styles.card} borderRadius={28}>
              <Text style={styles.sectionTitle} accessibilityRole="header">Dados pessoais</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Nome"
                  value={draft.name}
                  onChangeText={(name) => setDraft((previous) => ({ ...previous, name }))}
                  editable={!busy}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>E-mail</Text>
                <Text style={[styles.input, styles.readOnly]} selectable>{profile.email}</Text>
                <Text style={styles.caption}>O e-mail não pode ser alterado aqui.</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput
                  style={styles.input}
                  accessibilityLabel="Telefone"
                  value={draft.phone}
                  onChangeText={(phone) => setDraft((previous) => ({ ...previous, phone: formatPhone(phone) }))}
                  editable={!busy}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.secondaryButton, busy && styles.disabled]}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={cancelEditing}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, (!hasChanges || busy) && styles.disabled]}
                  accessibilityRole="button"
                  disabled={!hasChanges || busy}
                  onPress={() => void handleSaveChanges()}
                >
                  <Text style={styles.primaryButtonText}>{operation === 'profile' ? 'Salvando…' : 'Salvar alterações'}</Text>
                </TouchableOpacity>
              </View>
            </AppGlassCard>
          ) : null}

          <AppGlassCard style={styles.card} borderRadius={28}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Segurança</Text>
            <ActionRow icon="lock" title="Alterar senha" description="Proteja o acesso à sua conta." disabled={!canEdit} onPress={openPasswordModal} />
          </AppGlassCard>

          <AppGlassCard style={styles.card} borderRadius={28}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Preferências e atalhos</Text>
            <ActionRow icon="volume-2" title="Personalizar Voz" description="Volume, velocidade e voz." disabled={operation !== null} onPress={() => router.push('/voice')} />
            <ActionRow icon="bell" title="Notificações" description="Acompanhe os avisos do Luvia." disabled={operation !== null} onPress={() => router.push('/notification')} />
            <ActionRow icon="settings" title="Configurações" description="Ajuste suas preferências." disabled={operation !== null} onPress={() => router.navigate('/settings')} />
            <ActionRow icon="star" title="Favoritos" description="Seus sinais salvos no Dicionário." disabled={operation !== null} onPress={() => router.push({ pathname: '/dictionary', params: { filter: 'favorites' } })} />
          </AppGlassCard>

          <TouchableOpacity
            style={[styles.logoutButton, operation !== null && styles.disabled]}
            accessibilityRole="button"
            disabled={operation !== null}
            activeOpacity={0.8}
            onPress={() => void handleSignOut()}
          >
            <Feather name="log-out" size={19} color="#B74357" />
            <Text style={styles.logoutText}>{operation === 'logout' ? 'Saindo…' : 'Sair da conta'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={passwordModalVisible} transparent animationType="fade" onRequestClose={closePasswordModal}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'bottom', 'left', 'right']}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalCard} accessibilityViewIsModal>
                <Text style={styles.sectionTitle} accessibilityRole="header">Alterar senha</Text>
                {hasPassword ? (
                  <PasswordField label="Senha atual" value={currentPassword} onChangeText={setCurrentPassword} visible={showCurrentPassword} onToggle={() => setShowCurrentPassword((value) => !value)} disabled={busy} />
                ) : null}
                <PasswordField label="Nova senha" value={newPassword} onChangeText={setNewPassword} visible={showNewPassword} onToggle={() => setShowNewPassword((value) => !value)} disabled={busy} />
                <Text style={styles.caption}>Use pelo menos 8 caracteres.</Text>
                <PasswordField label="Confirmar nova senha" value={confirmPassword} onChangeText={setConfirmPassword} visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} disabled={busy} />
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.secondaryButton, busy && styles.disabled]} accessibilityRole="button" disabled={busy} onPress={closePasswordModal}>
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryButton, busy && styles.disabled]} accessibilityRole="button" disabled={busy} onPress={() => void handleUpdatePassword()}>
                    <Text style={styles.primaryButtonText}>{operation === 'password' ? 'Salvando…' : 'Salvar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ProfileAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => Array.from(part)[0]).join('').toUpperCase();
  const uri = avatarUrl?.trim() ? normalizeAvatarUrl(avatarUrl.trim()) : null;

  return (
    <View style={styles.avatar}>
      {uri && !failed ? (
        <Image source={{ uri }} style={styles.avatarImage} resizeMode="cover" onError={() => setFailed(true)} accessibilityLabel="Foto do perfil" />
      ) : initials ? (
        <Text style={styles.avatarInitials} maxFontSizeMultiplier={1.4}>{initials}</Text>
      ) : (
        <Feather name="user" size={44} color={BLUE} />
      )}
    </View>
  );
}

type ActionRowProps = {
  icon: 'lock' | 'volume-2' | 'bell' | 'settings' | 'star';
  title: string;
  description: string;
  disabled: boolean;
  onPress: () => void;
};

function ActionRow({ icon, title, description, disabled, onPress }: ActionRowProps) {
  return (
    <TouchableOpacity style={[styles.actionRow, disabled && styles.disabled]} activeOpacity={0.8} accessibilityRole="button" disabled={disabled} onPress={onPress}>
      <View style={styles.actionIcon}><Feather name={icon} size={21} color={BLUE} /></View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.caption}>{description}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#7B8BA4" />
    </TouchableOpacity>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  disabled: boolean;
};

function PasswordField({ label, value, onChangeText, visible, onToggle, disabled }: PasswordFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordInput}>
        <TextInput
          style={styles.passwordText}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
        />
        <TouchableOpacity style={styles.eyeButton} accessibilityRole="button" accessibilityLabel={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} disabled={disabled} onPress={onToggle}>
          <Feather name={visible ? 'eye-off' : 'eye'} size={20} color={MUTED} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: PAGE },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6EEFB' },
  headerTitle: { fontFamily: 'PoppinsM', fontSize: 22, color: TEXT, textAlign: 'center', flex: 1 },
  headerSpacer: { width: 44 },
  scrollContent: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, gap: 20 },
  summaryCard: { alignItems: 'center', padding: 24, gap: 18 },
  card: { padding: 20, gap: 16 },
  avatarWrapper: { width: 120, height: 120, padding: 4 },
  avatar: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E1EBFD' },
  avatarImage: { width: 112, height: 112, borderRadius: 56 },
  avatarInitials: { fontFamily: 'PoppinsM', fontSize: 32, color: BLUE },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: '#F5F7FA', backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  identity: { alignItems: 'center', gap: 6, width: '100%' },
  profileName: { fontFamily: 'Poppins SemiBold', fontSize: 23, color: TEXT, textAlign: 'center' },
  profileEmail: { fontFamily: 'Poppins', fontSize: 13, color: MUTED, textAlign: 'center' },
  profilePhone: { fontFamily: 'Poppins', fontSize: 12, color: MUTED, textAlign: 'center' },
  editButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, backgroundColor: '#E6EEFB' },
  editButtonText: { fontFamily: 'PoppinsM', fontSize: 13, color: BLUE, flexShrink: 1 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  caption: { fontFamily: 'Poppins', fontSize: 12, lineHeight: 19, color: MUTED, flexShrink: 1 },
  errorText: { fontFamily: 'Poppins', fontSize: 13, lineHeight: 21, color: '#9B354A' },
  retryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontFamily: 'PoppinsM', fontSize: 17, color: TEXT },
  field: { gap: 8 },
  label: { fontFamily: 'PoppinsM', fontSize: 13, color: MUTED },
  input: { minHeight: 50, borderRadius: 18, borderWidth: 1, borderColor: '#D8E2F0', backgroundColor: '#EEF3FA', paddingHorizontal: 14, paddingVertical: 12, color: TEXT, fontFamily: 'Poppins', fontSize: 14 },
  readOnly: { color: MUTED },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  primaryButton: { flexGrow: 1, flexBasis: 140, minHeight: 50, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  secondaryButton: { flexGrow: 1, flexBasis: 100, minHeight: 50, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C9D9EE', backgroundColor: '#EAF0FA' },
  primaryButtonText: { color: WHITE, fontFamily: 'PoppinsM', fontSize: 13, textAlign: 'center' },
  secondaryButtonText: { color: BLUE, fontFamily: 'PoppinsM', fontSize: 13, textAlign: 'center' },
  disabled: { opacity: 0.5 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 58, paddingVertical: 6 },
  actionIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#E6EEFB', alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, minWidth: 0, gap: 4 },
  actionTitle: { fontFamily: 'PoppinsM', fontSize: 14, color: TEXT },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 52, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 26, backgroundColor: '#FBECEF', borderWidth: 1, borderColor: '#F4D9E0' },
  logoutText: { color: '#B74357', fontFamily: 'PoppinsM', fontSize: 14, flexShrink: 1 },
  modalSafeArea: { flex: 1, backgroundColor: 'rgba(21, 35, 65, 0.35)' },
  modalScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 520, alignSelf: 'center', borderRadius: 28, backgroundColor: '#F5F7FA', padding: 24, gap: 16 },
  passwordInput: { flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingLeft: 14, paddingRight: 4, borderRadius: 18, borderWidth: 1, borderColor: '#D8E2F0', backgroundColor: '#EEF3FA' },
  passwordText: { flex: 1, minWidth: 0, paddingVertical: 12, color: TEXT, fontSize: 14, fontFamily: 'Poppins' },
  eyeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});

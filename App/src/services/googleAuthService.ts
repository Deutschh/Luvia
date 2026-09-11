import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { apiFetch } from './api';
import type { AuthResponse, User } from './authService';
import { saveTokens } from './tokenStorage';

let isGoogleSigninConfigured = false;

function ensureGoogleSigninConfigured() {
  if (isGoogleSigninConfigured) {
    return;
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

  if (!webClientId) {
    throw new Error('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID não configurado no app.');
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
  });

  isGoogleSigninConfigured = true;
}

export async function authenticateWithGoogle(): Promise<User | null> {
  if (Platform.OS === 'web') {
    throw new Error('Login com Google está disponível apenas no app Android/iOS.');
  }

  ensureGoogleSigninConfigured();

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    await GoogleSignin.signOut();
    
    const signInResult = await GoogleSignin.signIn();

    if (!isSuccessResponse(signInResult)) {
      return null;
    }

    const idToken = signInResult.data.idToken;

    if (!idToken) {
      throw new Error('Não foi possível obter o idToken do Google. Tente novamente.');
    }

    const response = await apiFetch<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    await saveTokens(response.token, response.refreshToken);

    return response.user;
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          return null;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Google Play Services indisponível ou desatualizado neste dispositivo.');
        case statusCodes.IN_PROGRESS:
          throw new Error('Já existe uma tentativa de login com Google em andamento.');
        default:
          break;
      }
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Não foi possível entrar com Google.');
  }
}

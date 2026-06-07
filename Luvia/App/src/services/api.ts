import { Platform } from 'react-native';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from './tokenStorage';

const defaultLocalhost =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3333'
    : 'http://localhost:3333';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || defaultLocalhost;

type ApiRequestOptions = RequestInit & {
  useAuth?: boolean;
  retry?: boolean;
};

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token não encontrado.');
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    await clearTokens();
    throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
  }

  await saveTokens(data.token, data.refreshToken);

  return data.token as string;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { useAuth = false, retry = true, headers, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (useAuth) {
    const token = await getAccessToken();

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (response.status === 401 && useAuth && retry) {
    const newToken = await refreshAccessToken();

    const retryResponse = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...requestHeaders,
        Authorization: `Bearer ${newToken}`,
      },
    });

    const retryData = await retryResponse.json();

    if (!retryResponse.ok) {
      throw new Error(retryData.message || 'Erro na requisição.');
    }

    return retryData;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro na requisição.');
  }

  return data;
}
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

let refreshAccessTokenPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  refreshAccessTokenPromise = (async () => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      await clearTokens();
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
  })();

  try {
    return await refreshAccessTokenPromise;
  } finally {
    refreshAccessTokenPromise = null;
  }
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { useAuth = false, retry = true, headers, ...rest } = options;
  const isFormDataBody = typeof FormData !== 'undefined' && rest.body instanceof FormData;

  const requestHeaders: Record<string, string> = {
    ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
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

    const retryData = await parseResponseBody(retryResponse);

    if (!retryResponse.ok) {
      throw new Error(
        retryData && typeof retryData === 'object' && 'message' in retryData
          ? String(retryData.message)
          : 'Erro na requisição.'
      );
    }

    return retryData as T;
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(
      data && typeof data === 'object' && 'message' in data
        ? String(data.message)
        : 'Erro na requisição.'
    );
  }

  return data as T;
}

import { apiFetch } from './api';
import { clearTokens, getRefreshToken, saveTokens } from './tokenStorage';

export type User = {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  user: User;
  token: string;
  refreshToken: string;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export async function login(data: LoginData) {
  const response = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  await saveTokens(response.token, response.refreshToken);

  return response.user;
}

export async function register(data: RegisterData) {
  const response = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  await saveTokens(response.token, response.refreshToken);

  return response.user;
}

export async function getMe() {
  return apiFetch<User>('/users/me', {
    method: 'GET',
    useAuth: true,
  });
}

export async function logout() {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        useAuth: true,
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
     //se der erro no back, vai limpar o token ainda
    }
  }

  await clearTokens();
}
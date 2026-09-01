import { API_URL, apiFetch } from './api';

export type UserProfile = {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  avatarUrl: string | null;
  authProvider: 'EMAIL' | 'GOOGLE';
  role: 'USER' | 'ADMIN';
  hasPassword?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateMyProfileData = {
  name?: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type UpdatePasswordData = {
  currentPassword?: string;
  newPassword: string;
};

export type AvatarUploadFile = {
  uri: string;
  name: string;
  type: 'image/jpeg' | 'image/png' | 'image/webp';
};

export function getMe() {
  return apiFetch<UserProfile>('/users/me', {
    method: 'GET',
    useAuth: true,
  });
}

export function updateMe(data: UpdateMyProfileData) {
  return apiFetch<UserProfile>('/users/me', {
    method: 'PATCH',
    useAuth: true,
    body: JSON.stringify(data),
  });
}

export function updatePassword(data: UpdatePasswordData) {
  return apiFetch<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    useAuth: true,
    body: JSON.stringify(data),
  });
}

export function uploadAvatar(file: AvatarUploadFile) {
  const formData = new FormData();

  formData.append(
    'avatar',
    {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob
  );

  return apiFetch<UserProfile>('/users/me/avatar', {
    method: 'POST',
    useAuth: true,
    body: formData,
  });
}

export function deleteAvatar() {
  return apiFetch<UserProfile>('/users/me/avatar', {
    method: 'DELETE',
    useAuth: true,
  });
}

export function normalizeAvatarUrl(avatarUrl: string) {
  try {
    const url = new URL(avatarUrl);
    const isLocalBackend = ['localhost', '127.0.0.1', '10.0.2.2'].includes(url.hostname);

    if (isLocalBackend) {
      return `${API_URL.replace(/\/$/, '')}${url.pathname}${url.search}`;
    }
  } catch {
    return avatarUrl;
  }

  return avatarUrl;
}

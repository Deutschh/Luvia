import { apiFetch } from './api';

export type UserSettings = {
  id: string;
  userId: string;
  voiceType: string;
  speechRate: number;
  speechVolume: number;
  autoSpeak: boolean;
  hapticFeedback: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserSettingsData = Partial<
  Pick<
    UserSettings,
    | 'voiceType'
    | 'speechRate'
    | 'speechVolume'
    | 'autoSpeak'
    | 'hapticFeedback'
    | 'notificationsEnabled'
    | 'darkMode'
  >
>;

export function getMySettings() {
  return apiFetch<UserSettings>('/settings/me', {
    method: 'GET',
    useAuth: true,
  });
}

export function updateMySettings(data: UpdateUserSettingsData) {
  return apiFetch<UserSettings>('/settings/me', {
    method: 'PATCH',
    useAuth: true,
    body: JSON.stringify(data),
  });
}

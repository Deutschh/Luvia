import { apiFetch } from './api';

export type DictionaryCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DictionarySign = {
  id: string;
  title: string;
  description: string | null;
  example: string | null;
  ownerId: string | null;
  isPublic: boolean;
  source: 'SYSTEM' | 'USER' | 'MOCK' | 'IOT';
  createdAt: string;
  updatedAt: string;
  category: DictionaryCategory;
};

export type FavoriteSign = DictionarySign & {
  favoritedAt: string;
};

export type CreateDictionarySignData = {
  title: string;
  description?: string;
  example?: string;
  categoryId: string;
  isPublic?: boolean;
};

export type UpdateDictionarySignData = Partial<CreateDictionarySignData>;

function buildQueryString(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.append(key, value);
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
}

export function getDictionaryCategories() {
  return apiFetch<DictionaryCategory[]>('/dictionary/categories', {
    method: 'GET',
    useAuth: true,
  });
}

export function getDictionarySigns(category?: string) {
  const path = category
    ? `/dictionary/signs/search${buildQueryString({ category })}`
    : '/dictionary/signs';

  return apiFetch<DictionarySign[]>(path, {
    method: 'GET',
    useAuth: true,
  });
}

export function searchDictionarySigns(query: string, category?: string) {
  return apiFetch<DictionarySign[]>(
    `/dictionary/signs/search${buildQueryString({
      q: query.trim(),
      category,
    })}`,
    {
      method: 'GET',
      useAuth: true,
    }
  );
}

export function getDictionarySignById(id: string) {
  return apiFetch<DictionarySign>(`/dictionary/signs/${id}`, {
    method: 'GET',
    useAuth: true,
  });
}

export function createDictionarySign(data: CreateDictionarySignData) {
  return apiFetch<DictionarySign>('/dictionary/signs', {
    method: 'POST',
    useAuth: true,
    body: JSON.stringify(data),
  });
}

export function updateDictionarySign(id: string, data: UpdateDictionarySignData) {
  return apiFetch<DictionarySign>(`/dictionary/signs/${id}`, {
    method: 'PATCH',
    useAuth: true,
    body: JSON.stringify(data),
  });
}

export function deleteDictionarySign(id: string) {
  return apiFetch<null>(`/dictionary/signs/${id}`, {
    method: 'DELETE',
    useAuth: true,
  });
}

export function getFavoriteSigns() {
  return apiFetch<FavoriteSign[]>('/favorites/signs', {
    method: 'GET',
    useAuth: true,
  });
}

export function addFavoriteSign(signId: string) {
  return apiFetch<FavoriteSign>(`/favorites/signs/${signId}`, {
    method: 'POST',
    useAuth: true,
  });
}

export function removeFavoriteSign(signId: string) {
  return apiFetch<null>(`/favorites/signs/${signId}`, {
    method: 'DELETE',
    useAuth: true,
  });
}

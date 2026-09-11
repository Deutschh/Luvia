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

const REQUEST_TIMEOUT_MS = 30_000;
const TIMEOUT_ERROR_MESSAGE =
  'A solicitação demorou mais que o esperado. Verifique sua conexão e tente novamente.';
const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
const INVALID_RESPONSE_ERROR_MESSAGE =
  'O servidor retornou uma resposta inválida. Tente novamente.';

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'invalid-response'
  | 'http'
  | 'session-invalid';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly kind: ApiErrorKind,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type SessionInvalidationListener = () => void;

const sessionInvalidationListeners = new Set<SessionInvalidationListener>();

export function subscribeToSessionInvalidation(
  listener: SessionInvalidationListener
) {
  sessionInvalidationListeners.add(listener);

  return () => {
    sessionInvalidationListeners.delete(listener);
  };
}

export function isSessionInvalidError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.kind === 'session-invalid';
}

export function isTemporaryApiError(error: unknown): error is ApiError {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.kind === 'network' ||
    error.kind === 'timeout' ||
    error.kind === 'invalid-response' ||
    (error.kind === 'http' &&
      (error.status === 429 || Boolean(error.status && error.status >= 500)))
  );
}

async function invalidateSession(message: string, status?: number) {
  try {
    await clearTokens();
  } catch {
    // The interface must still leave the authenticated state if secure storage fails.
  }

  sessionInvalidationListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // One listener must not prevent the remaining subscribers from updating.
    }
  });

  return new ApiError(message, 'session-invalid', status);
}

type ApiRequestOptions = RequestInit & {
  useAuth?: boolean;
  retry?: boolean;
};

type ParsedResponseBody =
  | { kind: 'empty'; data: null }
  | { kind: 'json'; data: unknown }
  | { kind: 'invalid'; data: null };

type ApiResponse = {
  response: Response;
  body: ParsedResponseBody;
};

function getApiMessage(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as Record<string, unknown>;
  const message =
    typeof payload.message === 'string' && payload.message.trim()
      ? payload.message.trim()
      : null;
  const validationMessage = Array.isArray(payload.errors)
    ? payload.errors.find(
        (issue): issue is { message: string } =>
          Boolean(
            issue &&
              typeof issue === 'object' &&
              'message' in issue &&
              typeof issue.message === 'string' &&
              issue.message.trim()
          )
      )?.message.trim()
    : null;

  if (validationMessage && (!message || message === 'Dados inválidos.')) {
    return validationMessage;
  }

  return message;
}

function getHttpErrorMessage(response: Response, data: unknown) {
  const apiMessage = getApiMessage(data);

  if (apiMessage) {
    return apiMessage;
  }

  if (response.status >= 500) {
    return 'O servidor está temporariamente indisponível. Tente novamente em instantes.';
  }

  switch (response.status) {
    case 400:
      return 'Os dados enviados não foram aceitos. Revise as informações e tente novamente.';
    case 401:
      return 'Não foi possível autorizar a solicitação.';
    case 403:
      return 'Você não tem permissão para realizar esta ação.';
    case 404:
      return 'O recurso solicitado não foi encontrado.';
    case 409:
      return 'Não foi possível concluir porque os dados já existem.';
    default:
      return 'Não foi possível concluir a solicitação. Tente novamente.';
  }
}

async function parseResponseBody(response: Response): Promise<ParsedResponseBody> {
  if (response.status === 204) {
    return { kind: 'empty', data: null };
  }

  const text = await response.text();

  if (!text.trim()) {
    return { kind: 'empty', data: null };
  }

  try {
    return { kind: 'json', data: JSON.parse(text) };
  } catch {
    return { kind: 'invalid', data: null };
  }
}

async function requestWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse> {
  const controller = new AbortController();
  const callerSignal = options.signal;
  let didTimeout = false;

  const cancelFromCaller = () => controller.abort();

  if (callerSignal?.aborted) {
    controller.abort();
  } else {
    callerSignal?.addEventListener('abort', cancelFromCaller, { once: true });
  }

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const body = await parseResponseBody(response);

    return { response, body };
  } catch {
    if (didTimeout) {
      throw new ApiError(TIMEOUT_ERROR_MESSAGE, 'timeout');
    }

    if (callerSignal?.aborted) {
      const cancellationError = new ApiError(
        'A solicitação foi cancelada.',
        'cancelled'
      );
      cancellationError.name = 'AbortError';
      throw cancellationError;
    }

    throw new ApiError(NETWORK_ERROR_MESSAGE, 'network');
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', cancelFromCaller);
  }
}

function getResponseData<T>({ response, body }: ApiResponse): T {
  if (!response.ok) {
    throw new ApiError(
      getHttpErrorMessage(response, body.kind === 'json' ? body.data : null),
      'http',
      response.status
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  if (body.kind !== 'json') {
    throw new ApiError(INVALID_RESPONSE_ERROR_MESSAGE, 'invalid-response');
  }

  return body.data as T;
}

let refreshAccessTokenPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  refreshAccessTokenPromise = (async () => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      throw await invalidateSession('Refresh token não encontrado.', 401);
    }

    const refreshResponse = await requestWithTimeout(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.response.ok) {
      const message = getHttpErrorMessage(
        refreshResponse.response,
        refreshResponse.body.kind === 'json' ? refreshResponse.body.data : null
      );

      if (
        refreshResponse.response.status === 400 ||
        refreshResponse.response.status === 401
      ) {
        throw await invalidateSession(message, refreshResponse.response.status);
      }

      throw new ApiError(message, 'http', refreshResponse.response.status);
    }

    const data = getResponseData<unknown>(refreshResponse);

    if (
      !data ||
      typeof data !== 'object' ||
      !('token' in data) ||
      typeof data.token !== 'string' ||
      !('refreshToken' in data) ||
      typeof data.refreshToken !== 'string'
    ) {
      throw new ApiError(INVALID_RESPONSE_ERROR_MESSAGE, 'invalid-response');
    }

    await saveTokens(data.token, data.refreshToken);

    return data.token;
  })();

  try {
    return await refreshAccessTokenPromise;
  } finally {
    refreshAccessTokenPromise = null;
  }
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

  const apiResponse = await requestWithTimeout(`${API_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
  });

  if (apiResponse.response.status === 401 && useAuth && retry) {
    const newToken = await refreshAccessToken();

    const retryResponse = await requestWithTimeout(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...requestHeaders,
        Authorization: `Bearer ${newToken}`,
      },
    });

    if (retryResponse.response.status === 401) {
      const message = getHttpErrorMessage(
        retryResponse.response,
        retryResponse.body.kind === 'json' ? retryResponse.body.data : null
      );

      throw await invalidateSession(message, retryResponse.response.status);
    }

    return getResponseData<T>(retryResponse);
  }

  return getResponseData<T>(apiResponse);
}

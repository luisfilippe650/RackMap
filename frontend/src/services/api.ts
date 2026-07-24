type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
};

export const API_PATH_PREFIX = '/v1/rackmap';
export const DEFAULT_API_ORIGIN = import.meta.env.VITE_RACKMAP_API_ORIGIN ?? 'http://127.0.0.1:3333';
export const DEFAULT_API_BASE_URL = `${DEFAULT_API_ORIGIN.replace(/\/$/, '')}${API_PATH_PREFIX}`;
export const API_BASE_URL_STORAGE_KEY = 'rackmap.apiBaseUrl';

export function normalizeApiOrigin(value: string) {
  const trimmedUrl = value.trim();
  const normalizedUrl = trimmedUrl && !/^https?:\/\//i.test(trimmedUrl) ? `http://${trimmedUrl}` : (trimmedUrl || DEFAULT_API_ORIGIN);
  const url = new URL(normalizedUrl, window.location.origin);

  return url.origin;
}

export function getApiOrigin() {
  const storedValue = localStorage.getItem(API_BASE_URL_STORAGE_KEY)?.trim();

  if (!storedValue) {
    return DEFAULT_API_ORIGIN.replace(/\/$/, '');
  }

  return normalizeApiOrigin(storedValue);
}

export function getApiBaseUrl() {
  return `${getApiOrigin()}${API_PATH_PREFIX}`;
}

export function setApiBaseUrl(value: string) {
  const nextValue = normalizeApiOrigin(value);

  if (!value.trim() || nextValue === DEFAULT_API_ORIGIN.replace(/\/$/, '')) {
    localStorage.removeItem(API_BASE_URL_STORAGE_KEY);
    return;
  }

  localStorage.setItem(API_BASE_URL_STORAGE_KEY, nextValue);
}

export function normalizeApiBaseUrl(value: string) {
  return `${normalizeApiOrigin(value)}${API_PATH_PREFIX}`;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  const url = new URL(`${baseUrl}${path}`, window.location.origin);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, headers, body, json, ...requestOptions } = options;
  const requestHeaders = {
    ...headers,
    ...(json === undefined ? {} : { 'Content-Type': 'application/json' })
  };

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...requestOptions,
      headers: requestHeaders,
      body: json === undefined ? body : JSON.stringify(json)
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique o endereço configurado.');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

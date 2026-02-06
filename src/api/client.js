import { buildQuery } from './utils.js';

const normalizeBase = (base) => (base || '').replace(/\/+$/, '');

const defaultBase =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000');

export const API_BASE_URL = normalizeBase(defaultBase);

const defaultTimeoutMs = 15000;

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (_err) {
    console.log('Failed to parse JSON response', _err);
    return null;
  }
};

/**
 * Perform an HTTP request to the backend API with JSON handling and timeout.
 * @param {string} path
 * @param {Object} options
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method='GET']
 * @param {Object} [options.params]
 * @param {Object} [options.body]
 * @param {Object} [options.headers]
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.timeout=15000]
 */
export const request = async (path, options = {}) => {
  const {
    method = 'GET',
    params,
    body,
    headers = {},
    signal,
    timeout = defaultTimeoutMs
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const query = buildQuery(params);
  const url = `${API_BASE_URL}${path}${query}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
};

const apiClient = { request, API_BASE_URL };
export default apiClient;

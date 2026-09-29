/**
 * API client for XCRM backend.
 * Handles authentication headers and HTTP requests.
 */

import { useAuthStore } from '../store/authStore';

/**
 * Base URL for the backend API.
 * Can be overridden via VITE_API_URL environment variable.
 * Defaults to localhost:8000 for local development.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Build request headers with auth token.
 *
 * @param {Object} extra - Additional headers to merge.
 * @returns {Object} Headers object with Content-Type and Authorization.
 */
function getHeaders(extra = {}) {
  const { token } = useAuthStore.getState();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Perform a GET request to the API.
 *
 * @param {string} url - API endpoint path (e.g., '/api/clients').
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} If response status is not 2xx.
 */
export async function apiGet(url) {
  const res = await fetch(`${API_BASE}${url}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

/**
 * Perform a POST request to the API.
 *
 * @param {string} url - API endpoint path.
 * @param {Object} data - Request body to send as JSON.
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} If server returns error detail.
 */
export async function apiPost(url, data) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка' }));
    throw new Error(err.detail);
  }
  return res.json();
}

/**
 * Perform a PUT request to the API.
 *
 * @param {string} url - API endpoint path.
 * @param {Object} data - Request body to send as JSON.
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {Error} If server returns error detail.
 */
export async function apiPut(url, data) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка' }));
    throw new Error(err.detail);
  }
  return res.json();
}

/**
 * Perform a DELETE request to the API.
 *
 * @param {string} url - API endpoint path.
 * @returns {Promise<void>} Resolves on success.
 * @throws {Error} If response status is not 2xx.
 */
export async function apiDelete(url) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
}

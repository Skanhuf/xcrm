/**
 * API client for XCRM backend.
 * Handles authentication headers and HTTP requests.
 */

import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Get request headers with auth token.
 */
function getHeaders(extra = {}) {
  const { token } = useAuthStore.getState();
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiGet(url) {
  const res = await fetch(`${API_BASE}${url}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

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

export async function apiDelete(url) {
  const res = await fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
}

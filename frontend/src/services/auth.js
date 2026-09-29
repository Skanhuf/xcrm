const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Authenticate user and get JWT token.
 */
export async function login(loginVal, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: loginVal, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка авторизации' }));
    throw new Error(err.detail);
  }

  const data = await res.json();
  return data;
}

/**
 * Register new user (first user becomes admin).
 */
export async function register(name, loginVal, password, phone) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, login: loginVal, password, phone: phone || '' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка регистрации' }));
    throw new Error(err.detail);
  }

  // Get token after registration
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: loginVal, password }),
  });

  if (!loginRes.ok) {
    throw new Error('Не удалось войти после регистрации');
  }

  return loginRes.json();
}

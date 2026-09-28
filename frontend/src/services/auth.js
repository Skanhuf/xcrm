const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

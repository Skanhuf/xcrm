import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const data = await register(name, loginVal, password, phone);
        setAuth(data.access_token, { name: data.name, role: data.role });
        navigate('/');
      } else {
        const data = await login(loginVal, password);
        setAuth(data.access_token, { name: 'Администратор', role: 'admin' });
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Demo login
  const demoLogin = () => {
    setAuth('demo-token', { name: 'Администратор', role: 'admin' });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-blue-600 text-white font-bold text-4xl shadow-glow mb-4">
            X
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">XCRM</h1>
          <p className="text-slate-400">CRM для автосервиса, СТО и детейлинга</p>
        </div>

        {/* Login Form */}
        <div className="glass-strong rounded-2xl p-8 shadow-glow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  placeholder="Иван Иванов"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Логин</label>
              <input
                type="text"
                value={loginVal}
                onChange={(e) => setLoginVal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
                  placeholder="+79991234567"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Вход...' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm text-accent hover:text-white transition-colors"
            >
              {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>

          {/* Demo button */}
          {mode === 'login' && (
            <div className="mt-4 pt-4 border-t border-accent/10">
              <button
                onClick={demoLogin}
                className="w-full py-2.5 rounded-xl border border-surface/50 text-slate-400 hover:text-white hover:border-accent/30 transition-all text-sm"
              >
                Демо-режим (без сервера)
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          XCRM v1.0 — © 2024
        </p>
      </div>
    </div>
  );
}

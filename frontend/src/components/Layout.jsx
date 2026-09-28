import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { path: '/', label: 'Дашборд', icon: '📊' },
  { path: '/kanban', label: 'Заказы', icon: '🔧' },
  { path: '/clients', label: 'Клиенты', icon: '👥' },
  { path: '/cars', label: 'Автомобили', icon: '🚗' },
  { path: '/warehouse', label: 'Склад', icon: '📦' },
  { path: '/finance', label: 'Финансы', icon: '💰' },
];

export default function Layout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-accent/10 flex flex-col z-50">
        <div className="p-6 border-b border-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-glow">X</div>
            <div>
              <div className="text-lg font-bold text-white">XCRM</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">Автосервис</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-surface transition-all duration-200">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-accent/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-bg/50">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent/30 to-blue-600/30 flex items-center justify-center text-accent font-semibold text-sm">A</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Администратор</div>
              <div className="text-[10px] text-slate-500">Админ</div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors text-xs" title="Выйти">⏻</button>
          </div>
        </div>
      </aside>
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

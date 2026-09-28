import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../services/api';

// Demo data for offline mode
const DEMO_STATS = {
  today_revenue: 47500,
  today_orders: 5,
  active_orders: 4,
  revenue_month: 1245000,
  avg_check: 54130,
  completed_month: 23,
  total_clients: 156,
  total_cars: 203,
  revenue_trend: '+12%',
  orders_trend: '+8%',
};

const MONTHLY_DATA = [
  { month: 'Янв', revenue: 890000 },
  { month: 'Фев', revenue: 950000 },
  { month: 'Мар', revenue: 1020000 },
  { month: 'Апр', revenue: 1100000 },
  { month: 'Май', revenue: 1050000 },
  { month: 'Июн', revenue: 1180000 },
  { month: 'Июл', revenue: 1245000 },
];

const statusLabels = {
  new: 'Новая',
  diagnostics: 'Диагностика',
  in_progress: 'В работе',
  waiting_parts: 'Ожидает запчасти',
  ready: 'Готова',
  completed: 'Завершена',
};

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400',
  diagnostics: 'bg-amber-500/20 text-amber-400',
  in_progress: 'bg-purple-500/20 text-purple-400',
  waiting_parts: 'bg-orange-500/20 text-orange-400',
  ready: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-slate-500/20 text-slate-400',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(DEMO_STATS);
  const [monthlyData, setMonthlyData] = useState(MONTHLY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiGet('/api/health');
        // If API works, we'd fetch real stats here
        console.log('API connected:', data);
      } catch {
        // Use demo data
        console.log('Using demo data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Выручка сегодня',
      value: `${stats.today_revenue.toLocaleString('ru-RU')} ₽`,
      icon: '💰',
      trend: stats.revenue_trend,
      trendUp: true,
      gradient: 'from-emerald-500/20 to-emerald-900/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    {
      title: 'Машин в работе',
      value: stats.active_orders,
      icon: '🚗',
      trend: '+2',
      trendUp: true,
      gradient: 'from-blue-500/20 to-blue-900/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
    },
    {
      title: 'Активных заявок',
      value: stats.active_orders,
      icon: '📋',
      gradient: 'from-amber-500/20 to-amber-900/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    {
      title: 'Выручка месяц',
      value: `${(stats.revenue_month / 1000).toFixed(0)}K ₽`,
      icon: '📈',
      trend: stats.revenue_trend,
      trendUp: true,
      gradient: 'from-purple-500/20 to-purple-900/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
    },
    {
      title: 'Средний чек',
      value: `${stats.avg_check.toLocaleString('ru-RU')} ₽`,
      icon: '🧾',
      gradient: 'from-rose-500/20 to-rose-900/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
    },
    {
      title: 'Готово в этом месяце',
      value: stats.completed_month,
      icon: '✅',
      gradient: 'from-cyan-500/20 to-cyan-900/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
    },
  ];

  // Simple bar chart
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Дашборд</h1>
          <p className="text-sm text-slate-400">Обзор работы автосервиса</p>
        </div>
        <div className="glass rounded-xl px-4 py-2.5 text-sm text-slate-400">
          {new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`glass rounded-2xl p-5 border ${card.border} bg-gradient-to-br ${card.gradient} relative overflow-hidden`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-2xl">{card.icon}</span>
              {card.trend && (
                <span className={`text-xs font-semibold ${card.text} bg-white/5 px-2 py-1 rounded-lg`}>
                  {card.trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-sm text-slate-400">{card.title}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Выручка</h2>
          <span className="text-2xl font-bold text-white">
            {(stats.revenue_month / 1000000).toFixed(1)}M ₽
          </span>
        </div>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-accent to-blue-400 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                title={`${item.month}: ${item.revenue.toLocaleString('ru-RU')} ₽`}
              ></div>
              <span className="text-xs text-slate-500">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {icon: '➕', label: 'Новая заявка', color: 'from-accent to-blue-600', action: () => navigate('/order/new')},
          { icon: '🚗', label: 'Добавить авто', color: 'from-emerald-500 to-emerald-700' },
          { icon: '👤', label: 'Новый клиент', color: 'from-purple-500 to-purple-700' },
          { icon: '📅', label: 'Запись онлайн', color: 'from-amber-500 to-amber-700' },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.action}
            className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5`}
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';

const DEMO_FINANCE = [
  { id: 1, type: 'income', amount: 47500, method: 'card', date: '2026-09-28', description: 'Оплата за заказ ON-2024-00001', orderId: 1 },
  { id: 2, type: 'expense', amount: 12000, method: 'transfer', date: '2026-09-28', description: 'Закупка запчастей у поставщика', orderId: null },
  { id: 3, type: 'income', amount: 38600, method: 'cash', date: '2026-09-27', description: 'Оплата за заказ ON-2024-00002', orderId: 2 },
  { id: 4, type: 'expense', amount: 5200, method: 'card', date: '2026-09-27', description: 'Амортизатор передний', orderId: null },
  { id: 5, type: 'income', amount: 7500, method: 'card', date: '2026-09-26', description: 'Оплата за заказ ON-2024-00004', orderId: 4 },
  { id: 6, type: 'expense', amount: 8000, method: 'transfer', date: '2026-09-26', description: 'Зарплата механикам', orderId: null },
  { id: 7, type: 'income', amount: 19000, method: 'cash', date: '2026-09-25', description: 'Оплата за заказ ON-2024-00005', orderId: 5 },
  { id: 8, type: 'expense', amount: 3500, method: 'card', date: '2026-09-25', description: 'Масло ДВС 5W-30', orderId: null },
];

const methodLabels = { cash: 'Нал', card: 'Карта', transfer: 'Перевод' };

export default function Finance() {
  const [entries, setEntries] = useState(DEMO_FINANCE);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = entries.filter(e => {
    const matchFilter = filter === 'all' || e.type === filter;
    const matchSearch = !search || e.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpense;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Финансы</h1>
          <p className="text-sm text-slate-400">Учёт доходов и расходов</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl border border-accent/30 text-accent font-semibold hover:bg-accent/10 transition-all text-sm">＋ Доход</button>
          <button className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/10 transition-all text-sm">＋ Расход</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5 border border-emerald-500/20">
          <div className="text-sm text-slate-400 mb-1">Доходы</div>
          <div className="text-2xl font-bold text-emerald-400">+{totalIncome.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="glass rounded-2xl p-5 border border-red-500/20">
          <div className="text-sm text-slate-400 mb-1">Расходы</div>
          <div className="text-2xl font-bold text-red-400">-{totalExpense.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="glass rounded-2xl p-5 border border-accent/20">
          <div className="text-sm text-slate-400 mb-1">Прибыль</div>
          <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{profit.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по описанию..."
              className="w-full px-4 py-2.5 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Все' },
              { key: 'income', label: 'Доходы' },
              { key: 'expense', label: 'Расходы' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.key ? 'bg-accent text-white' : 'bg-surface/50 text-slate-400 hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-accent/10">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Тип</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Описание</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Метод</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Дата</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-accent/5 hover:bg-surface/30 transition-colors">
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${e.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {e.type === 'income' ? 'Доход' : 'Расход'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white">{e.description}</div>
                  {e.orderId && <div className="text-xs text-slate-500">Заказ #{e.orderId}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{methodLabels[e.method]}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{new Date(e.date).toLocaleDateString('ru-RU')}</td>
                <td className={`px-6 py-4 text-right text-sm font-semibold ${e.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {e.type === 'income' ? '+' : '-'}{e.amount.toLocaleString('ru-RU')} ₽
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">Ничего не найдено</div>}
      </div>
    </div>
  );
}

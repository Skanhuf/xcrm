import { useState, useEffect } from 'react';
import { apiGet } from '../services/api';

const DEMO_CLIENTS = [
  { id: 1, name: 'Смирнов Игорь', phone: '+7 (999) 111-22-33', email: 'smirnov@mail.ru', company: '', carCount: 2, orderCount: 12, totalSpent: 185000 },
  { id: 2, name: 'Кузнецова Анна', phone: '+7 (999) 222-33-44', email: 'anna.k@gmail.com', company: '', carCount: 1, orderCount: 7, totalSpent: 92000 },
  { id: 3, name: 'Попов Виктор', phone: '+7 (999) 333-44-55', email: 'popov@yandex.ru', company: 'ООО "Вектор"', carCount: 3, orderCount: 18, totalSpent: 247000 },
  { id: 4, name: 'Васильева Мария', phone: '+7 (999) 444-55-66', email: 'm.vas@mail.ru', company: '', carCount: 1, orderCount: 4, totalSpent: 56000 },
  { id: 5, name: 'Соколов Дмитрий', phone: '+7 (999) 555-66-77', email: 'sokolov@inbox.ru', company: 'ИП Соколов', carCount: 2, orderCount: 23, totalSpent: 310000 },
  { id: 6, name: 'Лебедева Ольга', phone: '+7 (999) 666-77-88', email: 'oleg.leb@mail.ru', company: '', carCount: 1, orderCount: 5, totalSpent: 78000 },
];

export default function Clients() {
  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState(DEMO_CLIENTS);

  useEffect(() => {
    if (!search) {
      setFiltered(DEMO_CLIENTS);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(
      clients.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        c.email.toLowerCase().includes(s)
      )
    );
  }, [search]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Клиенты</h1>
          <p className="text-sm text-slate-400">{clients.length} клиентов в базе</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all text-sm flex items-center gap-2">
          ＋ Добавить клиента
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону или email..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-accent/10 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 transition-all"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-accent/10">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Клиент</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Контакты</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Авто</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Заказов</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Потрачено</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client, i) => (
              <tr
                key={client.id}
                className="border-b border-accent/5 hover:bg-surface/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/30 to-blue-600/30 flex items-center justify-center text-accent font-semibold text-sm">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{client.name}</div>
                      {client.company && (
                        <div className="text-xs text-slate-500">{client.company}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-300">{client.phone}</div>
                  <div className="text-xs text-slate-500">{client.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">{client.carCount} шт.</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300">{client.orderCount}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-semibold ${client.totalSpent > 150000 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {client.totalSpent.toLocaleString('ru-RU')} ₽
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Клиенты не найдены
          </div>
        )}
      </div>
    </div>
  );
}

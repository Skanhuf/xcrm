import { useState } from 'react';

const DEMO_ORDER = {
  id: 1, number: 'ON-2024-00001', status: 'in_progress', priority: 'high',
  carInfo: 'Toyota Camry 2021 | А123БВ77', clientName: 'Смирнов Игорь',
  clientPhone: '+7 (999) 111-22-33', type: 'Диагностика',
  description: 'Стук в подвеске при проезде неровностей. Проверить рычаги и амортизаторы.',
  works: [
    { id: 1, name: 'Диагностика подвески', price: 2000, done: true },
    { id: 2, name: 'Замена переднего амортизатора', price: 8500, done: false },
    { id: 3, name: 'Развал-схождение', price: 3000, done: false },
  ],
  parts: [
    { id: 1, name: 'Амортизатор передний', qty: 1, price: 5200 },
  ],
  notes: 'Клиент просил позвонить после диагностики',
  history: [
    { time: '14:30', action: 'Иванов П. добавил работу "Замена амортизатора"', user: 'Иванов П.' },
    { time: '12:15', action: 'Статус изменён на "В работе"', user: 'Система' },
    { time: '10:00', action: 'Заказ создан', user: 'Администратор' },
  ],
};

const statusLabels = { new: 'Новая', diagnostics: 'Диагностика', in_progress: 'В работе', waiting_parts: 'Ожидает запчасти', ready: 'Готова', completed: 'Завершена' };
const priorityLabels = { high: 'Высокий', medium: 'Средний', low: 'Низкий', urgent: 'Срочный' };

export default function OrderDetail() {
  const [order, setOrder] = useState(DEMO_ORDER);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ status: order.status, notes: order.notes });

  const tw = order.works.reduce((s, w) => s + w.price, 0);
  const tp = order.parts.reduce((s, p) => s + p.price * p.qty, 0);
  const total = tw + tp;
  const done = order.works.filter(w => w.done).length;

  const handleSave = () => {
    setOrder({ ...order, status: editForm.status, notes: editForm.notes });
    setEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleWork = (id) => {
    setOrder({
      ...order,
      works: order.works.map(w => w.id === id ? { ...w, done: !w.done } : w),
    });
  };

  const addWork = () => {
    setOrder({
      ...order,
      works: [...order.works, { id: Date.now(), name: 'Новая работа', price: 0, done: false }],
    });
  };

  const removeWork = (id) => {
    setOrder({ ...order, works: order.works.filter(w => w.id !== id) });
  };

  const updateWork = (id, field, val) => {
    setOrder({
      ...order,
      works: order.works.map(w => w.id === id ? { ...w, [field]: val } : w),
    });
  };

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{order.number}</h1>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                order.status === 'in_progress' ? 'bg-purple-500/20 text-purple-400' :
                order.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400">{priorityLabels[order.priority]}</span>
          </div>
          <p className="text-sm text-slate-400">{order.carInfo}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all text-sm">
            {editing ? '💾 Сохранить' : '✏️ Редактировать'}
          </button>
          <button onClick={handlePrint} className="px-4 py-2.5 rounded-xl border border-surface/50 text-slate-400 hover:text-white transition-all text-sm">🖨 Печать</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Works & Parts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="glass rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-400">Прогресс работ</span>
              <span className="text-sm font-semibold text-white">{done}/{order.works.length}</span>
            </div>
            <div className="h-2 bg-bg rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-blue-400 rounded-full transition-all" style={{ width: `${(done / order.works.length) * 100}%` }}></div>
            </div>
          </div>

          {/* Works */}
          <div className="glass rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-white">Работы</h3>
              {editing && <button onClick={addWork} className="text-xs text-accent hover:text-accent/80">＋ Добавить</button>}
            </div>
            <div className="space-y-2">
              {order.works.map(w => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg/50">
                  <button onClick={() => toggleWork(w.id)} className="text-lg">{w.done ? '✅' : '⬜'}</button>
                  {editing ? (
                    <>
                      <input value={w.name} onChange={(e) => updateWork(w.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-card border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                      <input type="number" value={w.price} onChange={(e) => updateWork(w.id, 'price', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 rounded-lg bg-card border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                      <button onClick={() => removeWork(w.id)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 text-sm ${w.done ? 'text-slate-500 line-through' : 'text-white'}`}>{w.name}</span>
                      <span className="text-sm font-semibold text-white">{w.price.toLocaleString('ru-RU')} ₽</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Parts */}
          {order.parts.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Запчасти</h3>
              <div className="space-y-2">
                {order.parts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-bg/50">
                    <span className="text-sm text-white">{p.name} <span className="text-slate-500">x{p.qty}</span></span>
                    <span className="text-sm font-semibold text-white">{(p.price * p.qty).toLocaleString('ru-RU')} ₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Клиент</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Имя</div>
                <div className="text-sm text-white">{order.clientName}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Телефон</div>
                <div className="text-sm text-white">{order.clientPhone}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Тип работ</div>
                <div className="text-sm text-white">{order.type}</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Итого</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400"><span>Работы</span><span>{tw.toLocaleString('ru-RU')} ₽</span></div>
              <div className="flex justify-between text-slate-400"><span>Запчасти</span><span>{tp.toLocaleString('ru-RU')} ₽</span></div>
              <div className="border-t border-accent/10 pt-2 flex justify-between text-white font-bold text-lg"><span>Итого</span><span>{total.toLocaleString('ru-RU')} ₽</span></div>
            </div>
          </div>

          {editing && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Заметки</h3>
              <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3}
                className="w-full px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
            </div>
          )}

          {/* History */}
          <div className="glass rounded-2xl p-5 print:hidden">
            <h3 className="text-sm font-semibold text-white mb-3">История</h3>
            <div className="space-y-2">
              {order.history.map((h, i) => (
                <div key={i} className="text-xs border-l-2 border-accent/20 pl-3 py-1">
                  <div className="text-slate-400">{h.time} — {h.user}</div>
                  <div className="text-slate-300">{h.action}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

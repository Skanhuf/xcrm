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
};

const statusLabels = { new: 'Новая', diagnostics: 'Диагностика', in_progress: 'В работе', waiting_parts: 'Ожидает запчасти', ready: 'Готова', completed: 'Завершена' };
const priorityLabels = { high: 'Высокий', medium: 'Средний', low: 'Низкий', urgent: 'Срочный' };

export default function OrderDetail() {
  const [order] = useState(DEMO_ORDER);
  const [editing, setEditing] = useState(false);

  const tw = order.works.reduce((s, w) => s + w.price, 0);
  const tp = order.parts.reduce((s, p) => s + p.price * p.qty, 0);
  const total = tw + tp;
  const done = order.works.filter(w => w.done).length;

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">{order.number}</h1>
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400">{statusLabels[order.status]}</span>
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400">{priorityLabels[order.priority]}</span>
          </div>
          <p className="text-sm text-slate-400">{order.carInfo}</p>
        </div>
        <button onClick={() => setEditing(!editing)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all text-sm">
          {editing ? '💾 Сохранить' : '✏️ Редактировать'}
        </button>
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
            <h3 className="text-sm font-semibold text-white mb-4">Работы</h3>
            <div className="space-y-2">
              {order.works.map(w => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg/50">
                  <span className="text-lg">{w.done ? '✅' : '⬜'}</span>
                  <span className={`flex-1 text-sm ${w.done ? 'text-slate-500 line-through' : 'text-white'}`}>{w.name}</span>
                  <span className="text-sm font-semibold text-white">{w.price.toLocaleString('ru-RU')} ₽</span>
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

          {order.notes && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Заметки</h3>
              <p className="text-sm text-slate-400">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

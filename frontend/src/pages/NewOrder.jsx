import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_CLIENTS = [
  { id: 1, name: 'Смирнов Игорь' },
  { id: 2, name: 'Кузнецова Анна' },
  { id: 3, name: 'Попов Виктор' },
];

const DEMO_CARS = [
  { id: 1, brand: 'Toyota', model: 'Camry', plate: 'А123БВ77', clientId: 1 },
  { id: 2, brand: 'BMW', model: 'X5', plate: 'В456ГД77', clientId: 3 },
];

export default function NewOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '', carId: '', type: '', description: '', notes: '', priority: 'medium',
    works: [{ name: '', price: 0, hours: 0 }],
    parts: [{ name: '', qty: 1, price: 0 }],
  });

  const total = formData.works.reduce((s, w) => s + w.price, 0) + formData.parts.reduce((s, p) => s + p.price * p.qty, 0);

  const addWork = () => setFormData({ ...formData, works: [...formData.works, { name: '', price: 0, hours: 0 }] });
  const removeWork = (i) => setFormData({ ...formData, works: formData.works.filter((_, idx) => idx !== i) });
  const updateWork = (i, field, val) => {
    const w = [...formData.works]; w[i][field] = val; setFormData({ ...formData, works: w });
  };

  const addPart = () => setFormData({ ...formData, parts: [...formData.parts, { name: '', qty: 1, price: 0 }] });
  const removePart = (i) => setFormData({ ...formData, parts: formData.parts.filter((_, idx) => idx !== i) });
  const updatePart = (i, field, val) => {
    const p = [...formData.parts]; p[i][field] = val; setFormData({ ...formData, parts: p });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order submitted:', formData);
    navigate('/kanban');
  };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">← Назад</button>
        <h1 className="text-2xl font-bold text-white">Новая заявка</h1>
      </div>

      {/* Steps */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-accent' : 'bg-surface/50'}`}></div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Клиент и автомобиль</h3>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Клиент</label>
              <select value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value, carId: '' })}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white focus:outline-none focus:border-accent/30">
                <option value="">Выберите клиента</option>
                {DEMO_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Автомобиль</label>
              <select value={formData.carId} onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white focus:outline-none focus:border-accent/30" disabled={!formData.clientId}>
                <option value="">Выберите автомобиль</option>
                {DEMO_CARS.filter(c => c.clientId === parseInt(formData.clientId)).map(c => (
                  <option key={c.id} value={c.id}>{c.brand} {c.model} | {c.plate}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent/80">Далее →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Работы и запчасти</h3>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Тип работ</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white focus:outline-none focus:border-accent/30">
                <option value="">Выберите тип</option>
                <option value="ТО">ТО</option>
                <option value="Ремонт">Ремонт</option>
                <option value="Диагностика">Диагностика</option>
                <option value="Электрика">Электрика</option>
                <option value="Покраска">Покраска</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Описание проблемы</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white focus:outline-none focus:border-accent/30" placeholder="Опишите проблему..." />
            </div>

            {/* Works */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-400">Работы</label>
                <button type="button" onClick={addWork} className="text-xs text-accent hover:text-accent/80">＋ Добавить</button>
              </div>
              {formData.works.map((w, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={w.name} onChange={(e) => updateWork(i, 'name', e.target.value)} placeholder="Название работы"
                    className="flex-1 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <input type="number" value={w.price} onChange={(e) => updateWork(i, 'price', Number(e.target.value))} placeholder="Цена"
                    className="w-24 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <button type="button" onClick={() => removeWork(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                </div>
              ))}
            </div>

            {/* Parts */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-400">Запчасти</label>
                <button type="button" onClick={addPart} className="text-xs text-accent hover:text-accent/80">＋ Добавить</button>
              </div>
              {formData.parts.map((p, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input value={p.name} onChange={(e) => updatePart(i, 'name', e.target.value)} placeholder="Название"
                    className="flex-1 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <input type="number" value={p.qty} onChange={(e) => updatePart(i, 'qty', Number(e.target.value))} placeholder="Кол-во"
                    className="w-16 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <input type="number" value={p.price} onChange={(e) => updatePart(i, 'price', Number(e.target.value))} placeholder="Цена"
                    className="w-24 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <button type="button" onClick={() => removePart(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-2.5 rounded-xl border border-surface/50 text-slate-400 hover:text-white">← Назад</button>
              <button type="button" onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold hover:bg-accent/80">Далее →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Проверка и создание</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-400"><span>Работы ({formData.works.length})</span><span>{formData.works.reduce((s, w) => s + w.price, 0).toLocaleString('ru-RU')} ₽</span></div>
              <div className="flex justify-between text-slate-400"><span>Запчасти ({formData.parts.length})</span><span>{formData.parts.reduce((s, p) => s + p.price * p.qty, 0).toLocaleString('ru-RU')} ₽</span></div>
              <div className="border-t border-accent/10 pt-2 flex justify-between text-white font-bold text-xl"><span>Итого</span><span>{total.toLocaleString('ru-RU')} ₽</span></div>
            </div>
            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)} className="px-6 py-2.5 rounded-xl border border-surface/50 text-slate-400 hover:text-white">← Назад</button>
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-glow">✓ Создать заявку</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', items: [{ name: '', price: 0, hours: 0, part_name: '', part_qty: 0, part_price: 0 }] });

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const data = await apiGet('/api/templates');
      setTemplates(data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiPut(`/api/templates/${editing.id}`, form);
      } else {
        await apiPost('/api/templates', form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '', items: [{ name: '', price: 0, hours: 0, part_name: '', part_qty: 0, part_price: 0 }] });
      fetchTemplates();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить шаблон?')) return;
    try {
      await apiDelete(`/api/templates/${id}`);
      fetchTemplates();
    } catch (e) { alert(e.message); }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { name: '', price: 0, hours: 0, part_name: '', part_qty: 0, part_price: 0 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => {
    const items = [...form.items]; items[i][field] = val; setForm({ ...form, items });
  };

  const filtered = templates.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Шаблоны работ</h1>
          <p className="text-sm text-slate-400">Создавайте пресеты для быстрых заказ-нарядов</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '', items: [{ name: '', price: 0, hours: 0, part_name: '', part_qty: 0, part_price: 0 }] }); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all text-sm">＋ Новый шаблон</button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">{editing ? 'Редактировать' : 'Новый шаблон'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название шаблона" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white focus:outline-none focus:border-accent/30" required />
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white focus:outline-none focus:border-accent/30" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-400">Работы и запчасти</label>
                <button type="button" onClick={addItem} className="text-xs text-accent hover:text-accent/80">＋ Добавить</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 flex-wrap">
                  <input value={item.name} onChange={(e) => updateItem(i, 'name', e.target.value)} placeholder="Название работы" className="flex-1 min-w-48 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" required />
                  <input type="number" value={item.price} onChange={(e) => updateItem(i, 'price', Number(e.target.value))} placeholder="Цена" className="w-20 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <input type="number" value={item.hours} onChange={(e) => updateItem(i, 'hours', Number(e.target.value))} placeholder="Часы" className="w-16 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <input value={item.part_name} onChange={(e) => updateItem(i, 'part_name', e.target.value)} placeholder="Запчасть" className="flex-1 min-w-32 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <input type="number" value={item.part_qty} onChange={(e) => updateItem(i, 'part_qty', Number(e.target.value))} placeholder="Кол-во" className="w-14 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <input type="number" value={item.part_price} onChange={(e) => updateItem(i, 'part_price', Number(e.target.value))} placeholder="Цена запч." className="w-20 px-3 py-2 rounded-lg bg-bg border border-surface/50 text-white text-sm focus:outline-none focus:border-accent/30" />
                  <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow">Сохранить</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-surface/50 text-slate-400 hover:text-white">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск шаблонов..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-accent/10 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="glass rounded-2xl p-5 hover:border-accent/30 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{t.name}</h3>
                {t.description && <p className="text-sm text-slate-400">{t.description}</p>}
              </div>
              <span className="text-xs text-slate-500 bg-surface/50 px-2 py-1 rounded">{t.items.length} работ</span>
            </div>
            <div className="space-y-1 mb-4 max-h-32 overflow-y-auto">
              {t.items.slice(0, 4).map((item, i) => (
                <div key={i} className="text-xs text-slate-400 flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-white font-medium">{item.price.toLocaleString('ru-RU')} ₽</span>
                </div>
              ))}
              {t.items.length > 4 && <div className="text-xs text-accent">+{t.items.length - 4} ещё...</div>}
            </div>
            <div className="flex gap-2 pt-3 border-t border-accent/10">
              <button onClick={() => { setEditing(t); setForm({ name: t.name, description: t.description, items: t.items }); setShowForm(true); }}
                className="flex-1 py-2 rounded-lg border border-surface/50 text-slate-400 hover:text-white text-sm">✏️</button>
              <button onClick={() => handleDelete(t.id)} className="flex-1 py-2 rounded-lg border border-red-500/30 text-red-400 hover:text-red-300 text-sm">🗑</button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-slate-500">Шаблоны не найдены</div>}
    </div>
  );
}

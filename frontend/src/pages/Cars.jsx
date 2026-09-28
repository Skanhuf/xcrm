import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiDelete } from '../services/api';

const DEMO_CARS = [
  { id: 1, brand: 'Toyota', model: 'Camry', year: 2021, vin: 'XTA214024B1234567', plate: 'А123БВ77', color: 'Серебристый', mileage: 45200, clientId: 1, image: '🚗' },
  { id: 2, brand: 'BMW', model: 'X5', year: 2022, vin: 'WBAJB7C50KBW12345', plate: 'В456ГД77', color: 'Чёрный', mileage: 28000, clientId: 3, image: '🚙' },
  { id: 3, brand: 'Hyundai', model: 'Tucson', year: 2020, vin: 'TMHBF4HE5L0123456', plate: 'Е789ЖЗ77', color: 'Белый', mileage: 62000, clientId: 2, image: '🚙' },
  { id: 4, brand: 'Kia', model: 'Rio', year: 2019, vin: 'KNDJT2A68L7123456', plate: 'К012ЛМ77', color: 'Красный', mileage: 78500, clientId: 4, image: '🚗' },
  { id: 5, brand: 'Mercedes', model: 'E200', year: 2023, vin: 'WDDWF4KB9JR123456', plate: 'Н345ОП77', color: 'Серый', mileage: 12000, clientId: 5, image: '🏎️' },
  { id: 6, brand: 'Volkswagen', model: 'Tiguan', year: 2021, vin: 'WVGBV7AX8MW123456', plate: 'Р678СТ77', color: 'Синий', mileage: 35000, clientId: 6, image: '🚙' },
];

const DEMO_CLIENTS = [
  { id: 1, name: 'Смирнов Игорь' }, { id: 2, name: 'Кузнецова Анна' },
  { id: 3, name: 'Попов Виктор' }, { id: 4, name: 'Васильева Мария' },
  { id: 5, name: 'Соколов Дмитрий' }, { id: 6, name: 'Лебедева Ольга' },
];

export default function Cars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState(DEMO_CARS);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: '', brand: '', model: '', year: '', plate: '', vin: '', color: '', mileage: '' });

  const filtered = cars.filter(c => !search || c.brand.toLowerCase().includes(search.toLowerCase()) || c.plate.toLowerCase().includes(search.toLowerCase()) || c.vin.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowForm(false);
    setForm({ clientId: '', brand: '', model: '', year: '', plate: '', vin: '', color: '', mileage: '' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Автомобили</h1>
          <p className="text-sm text-slate-400">{cars.length} автомобилей в базе</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all text-sm flex items-center gap-2">＋ Добавить автомобиль</button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Новый автомобиль</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white focus:outline-none focus:border-accent/30">
              <option value="">Клиент</option>
              {DEMO_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Марка" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" required />
            <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Модель" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" required />
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Год" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
            <input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="Госномер" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
            <input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} placeholder="VIN" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Цвет" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
            <input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} placeholder="Пробег (км)" className="px-4 py-3 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow">Сохранить</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-3 rounded-xl border border-surface/50 text-slate-400 hover:text-white">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по марке, номеру или VIN..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-accent/10 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(car => (
          <div key={car.id} className="glass rounded-2xl p-5 hover:border-accent/30 transition-all cursor-pointer group" onClick={() => navigate('/kanban')}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-4xl">{car.image}</span>
              <span className="bg-bg px-3 py-1 rounded-lg text-xs font-mono text-white border border-surface/50">{car.plate}</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{car.brand} {car.model}</h3>
            <p className="text-sm text-slate-400 mb-4">{car.year} • {car.color}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs"><span className="text-slate-500">VIN</span><span className="text-slate-300 font-mono">{car.vin.slice(-6)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Пробег</span><span className="text-slate-300">{car.mileage.toLocaleString('ru-RU')} км</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Клиент</span><span className="text-slate-300">{DEMO_CLIENTS.find(c => c.id === car.clientId)?.name}</span></div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-slate-500">Автомобили не найдены</div>}
    </div>
  );
}

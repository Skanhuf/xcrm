import { useState } from 'react';

const DEMO_PARTS = [
  { id: 1, name: 'Масло ДВС 5W-30 (4л)', sku: 'OIL-5W30-4L', category: 'Масла', qty: 24, min_qty: 10, buy_price: 2800, sell_price: 3500, notes: '' },
  { id: 2, name: 'Фильтр масляный Bosch', sku: 'FLT-OIL-BOSCH', category: 'Фильтры', qty: 8, min_qty: 5, buy_price: 450, sell_price: 750, notes: '' },
  { id: 3, name: 'Фильтр воздушный', sku: 'FLT-AIR-001', category: 'Фильтры', qty: 3, min_qty: 5, buy_price: 800, sell_price: 1200, notes: 'Заканчивается' },
  { id: 4, name: 'Колодки тормозные передние', sku: 'BRK-FRONT-01', category: 'Тормоза', qty: 12, min_qty: 4, buy_price: 3200, sell_price: 4800, notes: '' },
  { id: 5, name: 'Амортизатор передний Kayaba', sku: 'SUS-KYB-FR', category: 'Подвеска', qty: 2, min_qty: 2, buy_price: 5200, sell_price: 7500, notes: 'Под заказ' },
  { id: 6, name: 'Свечи зажигания NGK (комплект)', sku: 'SPK-NGK-4', category: 'Зажигание', qty: 15, min_qty: 5, buy_price: 1200, sell_price: 1800, notes: '' },
  { id: 7, name: 'Ремень ГРМ комплект', sku: 'BT-KIT-001', category: 'Двигатель', qty: 0, min_qty: 3, buy_price: 4500, sell_price: 6500, notes: 'Нет в наличии' },
  { id: 8, name: 'Тосол красный (5л)', sku: 'COOL-R-5L', category: 'Охлаждение', qty: 10, min_qty: 5, buy_price: 900, sell_price: 1400, notes: '' },
];

const categories = ['Все', 'Масла', 'Фильтры', 'Тормоза', 'Подвеска', 'Зажигание', 'Двигатель', 'Охлаждение'];

export default function Warehouse() {
  const [parts, setParts] = useState(DEMO_PARTS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все');
  const [showLowStock, setShowLowStock] = useState(false);

  const filtered = parts.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Все' || p.category === category;
    const matchLow = !showLowStock || p.qty <= p.min_qty;
    return matchSearch && matchCat && matchLow;
  });

  const lowStockCount = parts.filter(p => p.qty <= p.min_qty).length;
  const totalValue = parts.reduce((sum, p) => sum + p.sell_price * p.qty, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Склад запчастей</h1>
          <p className="text-sm text-slate-400">{parts.length} позиций на {totalValue.toLocaleString('ru-RU')} ₽</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all text-sm flex items-center gap-2">＋ Добавить запчасть</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5 border border-accent/20">
          <div className="text-sm text-slate-400 mb-1">Стоимость склада</div>
          <div className="text-2xl font-bold text-white">{totalValue.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="glass rounded-2xl p-5 border border-amber-500/20">
          <div className="text-sm text-slate-400 mb-1">Заканчивается</div>
          <div className="text-2xl font-bold text-amber-400">{lowStockCount} позиций</div>
        </div>
        <div className="glass rounded-2xl p-5 border border-emerald-500/20">
          <div className="text-sm text-slate-400 mb-1">В наличии</div>
          <div className="text-2xl font-bold text-emerald-400">{parts.filter(p => p.qty > p.min_qty).length} позиций</div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию или артикулу..."
              className="w-full px-4 py-2.5 rounded-xl bg-bg border border-surface/50 text-white placeholder-slate-600 focus:outline-none focus:border-accent/30" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? 'bg-accent text-white' : 'bg-surface/50 text-slate-400 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={showLowStock} onChange={(e) => setShowLowStock(e.target.checked)} className="accent-accent" />
            Только заканчивается
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-accent/10">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Запчасть</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-6 py-4">Артикул</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-6 py-4">Кол-во</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">Закупка</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">Продажа</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-6 py-4">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const isLow = p.qty <= p.min_qty;
              return (
                <tr key={p.id} className="border-b border-accent/5 hover:bg-surface/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-slate-400 bg-surface/50 px-2 py-1 rounded">{p.sku}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-semibold ${isLow ? 'text-red-400' : 'text-white'}`}>{p.qty}</span>
                    {isLow && <div className="text-[10px] text-red-400">мин: {p.min_qty}</div>}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-400">{p.buy_price.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-6 py-4 text-right text-sm text-emerald-400 font-medium">{p.sell_price.toLocaleString('ru-RU')} ₽</td>
                  <td className="px-6 py-4 text-right text-sm text-white font-semibold">{(p.sell_price * p.qty).toLocaleString('ru-RU')} ₽</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">Ничего не найдено</div>}
      </div>
    </div>
  );
}

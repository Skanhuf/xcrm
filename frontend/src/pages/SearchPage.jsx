import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const DEMO_RESULTS = {
  orders: [
    { id: 1, number: 'ON-2024-00001', carInfo: 'Toyota Camry | А123БВ77', clientName: 'Смирнов Игорь', status: 'В работе' },
    { id: 2, number: 'ON-2024-00002', carInfo: 'BMW X5 | В456ГД77', clientName: 'Попов Виктор', status: 'Новая' },
  ],
  clients: [
    { id: 1, name: 'Смирнов Игорь', phone: '+7 (999) 111-22-33', company: '' },
    { id: 2, name: 'Попов Виктор', phone: '+7 (999) 333-44-55', company: 'ООО "Вектор"' },
  ],
  cars: [
    { id: 1, brand: 'Toyota', model: 'Camry', plate: 'А123БВ77', clientName: 'Смирнов Игорь' },
    { id: 2, brand: 'BMW', model: 'X5', plate: 'В456ГД77', clientName: 'Попов Виктор' },
  ],
  parts: [
    { id: 1, name: 'Масло ДВС 5W-30', sku: 'OIL-5W30-4L', qty: 24 },
    { id: 2, name: 'Фильтр масляный Bosch', sku: 'FLT-OIL-BOSCH', qty: 8 },
  ],
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(DEMO_RESULTS);

  useEffect(() => {
    // Здесь будет реальный поиск через API
    console.log('Searching for:', query);
  }, [query]);

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  const ResultItem = ({ item, type, navigateTo }) => (
    <div onClick={() => navigateTo(item.id)} className="glass rounded-xl p-4 hover:border-accent/30 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
          type === 'orders' ? 'bg-blue-500/20' :
          type === 'clients' ? 'bg-emerald-500/20' :
          type === 'cars' ? 'bg-purple-500/20' : 'bg-amber-500/20'
        }`}>
          {type === 'orders' ? '📋' : type === 'clients' ? '👤' : type === 'cars' ? '🚗' : '📦'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{item.name || item.carInfo || item.brand + ' ' + item.model || item.number}</div>
          <div className="text-xs text-slate-400 truncate">{item.phone || item.clientName || item.plate || item.status}</div>
        </div>
        <span className="text-slate-600 group-hover:text-accent transition-colors">→</span>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Результаты поиска</h1>
        <p className="text-sm text-slate-400">Найдено {totalResults} результатов по запросу "{query}"</p>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-400 text-lg">Ничего не найдено</p>
          <p className="text-slate-600 text-sm mt-2">Попробуйте изменить запрос</p>
        </div>
      ) : (
        <div className="space-y-8">
          {results.orders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Заказы ({results.orders.length})
              </h2>
              <div className="space-y-2">
                {results.orders.map(order => (
                  <ResultItem key={order.id} item={order} type="orders" navigateTo={(id) => navigate(`/order/${id}`)} />
                ))}
              </div>
            </div>
          )}

          {results.clients.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>👥</span> Клиенты ({results.clients.length})
              </h2>
              <div className="space-y-2">
                {results.clients.map(client => (
                  <ResultItem key={client.id} item={client} type="clients" navigateTo={(id) => navigate(`/clients`)} />
                ))}
              </div>
            </div>
          )}

          {results.cars.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🚗</span> Автомобили ({results.cars.length})
              </h2>
              <div className="space-y-2">
                {results.cars.map(car => (
                  <ResultItem key={car.id} item={car} type="cars" navigateTo={(id) => navigate('/cars')} />
                ))}
              </div>
            </div>
          )}

          {results.parts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📦</span> Запчасти ({results.parts.length})
              </h2>
              <div className="space-y-2">
                {results.parts.map(part => (
                  <ResultItem key={part.id} item={part} type="parts" navigateTo={(id) => navigate('/warehouse')} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

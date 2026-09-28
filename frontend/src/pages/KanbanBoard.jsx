import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_ORDERS = {
  new: [
    { id: 1, number: 'ON-2024-00001', carInfo: 'Toyota Camry | А123БВ77', clientName: 'Смирнов Игорь', type: 'Диагностика', priority: 'high', createdAt: 'Сегодня, 10:30' },
    { id: 2, number: 'ON-2024-00002', carInfo: 'Kia Rio | К789МА77', clientName: 'Васильева Мария', type: 'Новый', priority: 'medium', createdAt: 'Сегодня, 09:15' },
  ],
  diagnostics: [
    { id: 3, number: 'ON-2024-00003', carInfo: 'BMW X5 | В456ГД77', clientName: 'Попов Виктор', type: 'Диагностика', priority: 'low', createdAt: 'Сегодня, 11:20' },
  ],
  in_progress: [
    { id: 4, number: 'ON-2024-00004', carInfo: 'Toyota Camry | А123БВ77', clientName: 'Смирнов Игорь', type: 'Ремонт', priority: 'high', createdAt: 'Вчера, 15:40' },
    { id: 5, number: 'ON-2024-00005', carInfo: 'Audi A4 | Е222ХХ77', clientName: 'Кузнецов Антон', type: 'ТО', priority: 'medium', createdAt: 'Вчера, 10:50' },
  ],
  waiting_parts: [
    { id: 6, number: 'ON-2024-00006', carInfo: 'Lexus RX | М444ММ77', clientName: 'Рябов Алексей', type: 'Ожидает запчасти', priority: 'high', createdAt: 'Вчера, 16:40' },
    { id: 7, number: 'ON-2024-00007', carInfo: 'Mercedes C200 | Т555ТТ77', clientName: 'Меркушев Олег', type: 'Ожидает запчасти', priority: 'medium', createdAt: 'Вчера, 15:20' },
  ],
  ready: [
    { id: 8, number: 'ON-2024-00008', carInfo: 'Nissan Qashqai | Н666НН77', clientName: 'Федоров Иван', type: 'Готов', priority: 'low', createdAt: 'Сегодня, 12:10' },
    { id: 9, number: 'ON-2024-00009', carInfo: 'Hyundai Solaris | А777АА77', clientName: 'Давыдов Петр', type: 'Готов', priority: 'medium', createdAt: 'Сегодня, 11:30' },
  ],
  completed: [
    { id: 10, number: 'ON-2024-00010', carInfo: 'Range Rover Evoque | О888ОО77', clientName: 'Борисов Сергей', type: 'Завершен', priority: 'low', createdAt: 'Вчера, 18:10' },
    { id: 11, number: 'ON-2024-00011', carInfo: 'Mazda 3 | Х999ХХ77', clientName: 'Громов Дмитрий', type: 'Завершен', priority: 'medium', createdAt: 'Вчера, 18:30' },
  ],
};

const statusLabels = {
  new: 'Новые',
  diagnostics: 'В диагностике',
  in_progress: 'В работе',
  waiting_parts: 'Ожидает запчасти',
  ready: 'Готовы',
  completed: 'Завершены',
};

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
  urgent: 'bg-red-600',
};

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [draggedOrder, setDraggedOrder] = useState(null);

  const handleDragStart = (order) => {
    setDraggedOrder(order);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (status) => {
    if (!draggedOrder) return;

    try {
      await apiPut(`/api/orders/${draggedOrder.id}`, { status });
    } catch (err) {
      console.log('Demo: cannot update order (API not connected)');
    }

    setDraggedOrder(null);
  };

  const columns = ['new', 'diagnostics', 'in_progress', 'waiting_parts', 'ready', 'completed'];

  return (
    <div className="animate-fade-in h-[calc(100vh-96px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Заказы на ремонт</h1>
          <p className="text-sm text-slate-400">Перетащите карточку для смены статуса</p>
        </div>
        <button onClick={() => navigate('/order/new')} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-600 text-white font-semibold hover:shadow-glow transition-all text-sm flex items-center gap-2">
          <span>＋</span> Новая заявка
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((status) => (
            <div
              key={status}
              className="w-72 flex flex-col bg-card/50 rounded-2xl border border-accent/5 overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-accent/5 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <h3 className="text-sm font-semibold text-white">{statusLabels[status]}</h3>
                <span className="ml-auto text-xs text-slate-500 bg-surface/50 px-2 py-0.5 rounded-md">
                  {orders[status]?.length || 0}
                </span>
              </div>

              {/* Orders */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {(orders[status] || []).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/order/${order.id}`)}
                    draggable
                    onDragStart={() => handleDragStart(order)}
                    className="glass rounded-xl p-4 cursor-pointer active:cursor-grabbing hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[order.priority] || 'bg-slate-500'}`}></div>
                      <span className="text-xs font-medium text-slate-300">{order.number}</span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{order.carInfo}</div>
                    <div className="text-xs text-slate-500 mb-3">{order.clientName}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">{order.type}</span>
                      <span className="text-[10px] text-slate-600">{order.createdAt}</span>
                    </div>
                  </div>
                ))}

                {(!orders[status] || orders[status].length === 0) && (
                  <div className="text-center text-slate-600 text-sm py-8">
                    Пусто
                  </div>
                )}
              </div>

              {/* Add button */}
              <div className="p-3 border-t border-accent/5">
                <button className="w-full py-2 rounded-lg border border-dashed border-surface/50 text-slate-500 hover:text-white hover:border-accent/30 transition-all text-xs">
                  + Добавить задачу
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

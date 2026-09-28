# XCRM — CRM для автосервиса

Полнофункциональная CRM-система для автосервиса, СТО и детейлинга с multi-tenancy.

## 🚀 Быстрый старт

### 1. Запуск локально

```bash
# База данных
docker compose up -d

# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

Открыть: http://localhost:5173

### 2. Продакшен (Docker)

```bash
# Создать .env файл
cp .env.example .env
# Отредактировать .env — изменить пароли и SECRET_KEY!

# Запустить всё
docker compose -f docker-compose.prod.yml up -d --build

# Открыть: http://localhost
```

## 📁 Структура

```
xcrm/
├── backend/           # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/       # REST endpoints
│   │   ├── models/    # SQLAlchemy модели
│   │   ├── schemas/   # Pydantic схемы
│   │   └── core/      # Config, DB, Security
│   ├── tests/         # Backend тесты
│   └── alembic/       # Миграции
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/     # Страницы
│   │   ├── components/
│   │   └── store/     # Zustand state
│   └── tests/         # Frontend тесты
├── .github/           # CI/CD
└── docker-compose.prod.yml
```

## 🔑 API Endpoints

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/register` | Регистрация |
| GET | `/api/clients` | Список клиентов |
| POST | `/api/clients` | Создать клиента |
| GET | `/api/cars` | Список авто |
| POST | `/api/cars` | Создать авто |
| GET | `/api/orders` | Список заказов |
| POST | `/api/orders` | Создать заказ |
| GET | `/api/orders/kanban` | Канбан-доска |
| GET | `/api/warehouse` | Склад |
| POST | `/api/finance` | Добавить операцию |
| GET | `/api/dashboard/stats` | Статистика |

## 🧪 Тесты

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 🔄 CI/CD

GitHub Actions автоматически:
- Запускает тесты при каждом push
- Проверяет качество кода
- Деплоит на staging (develop branch)
- Деплоит на production (main branch)

## 💰 Модели монетизации

- **SaaS подписка**: от 2 990 ₽/мес
- **Free trial**: 14 дней
- **Self-hosted**: для крупных СТО

## 📦 Деплой

1. Купите VPS (Ubuntu 22.04, 2GB RAM минимум)
2. Установите Docker и Docker Compose
3. Клонируйте репозиторий
4. Настройте .env
5. Запустите: `docker compose -f docker-compose.prod.yml up -d`
6. Настройте домен и HTTPS (Let's Encrypt)

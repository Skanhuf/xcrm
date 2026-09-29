# XCRM — CRM для автосервиса

Полнофункциональная CRM-система для автосервиса, СТО и детейлинга с multi-tenancy.

## 🚀 Быстрый старт

### Локальная разработка

#### Backend (FastAPI)
```bash
cd backend

# Создай виртуальное окружение
python -m venv venv
# Windows: venv\Scripts\activate
# Linux: source venv/bin/activate

# Установи зависимости
pip install -r requirements.txt

# Запусти
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API будет доступен: http://localhost:8000
Swagger docs: http://localhost:8000/docs

#### Frontend (React)
```bash
cd frontend

# Установи зависимости
npm install

# Запусти dev-сервер
npm run dev
```

Фронтенд будет доступен: http://localhost:5173

### Продакшен (Docker)

#### 1. Настройка переменных
```bash
# Скопируй пример
cp .env.example .env

# Отредактируй .env
nano .env
```

Заполни значения:
- `POSTGRES_PASSWORD` — сложный пароль для БД
- `SECRET_KEY` — сгенерируй: `openssl rand -hex 32`

#### 2. Запуск
```bash
# Собери и запусти
sudo docker compose -f docker-compose.prod.yml up -d --build

# Создай таблицы БД
sudo docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Проверить
sudo docker compose -f docker-compose.prod.yml ps
```

Приложение будет доступно: http://your-server-ip

#### 3. Обновление
```bash
git pull
sudo docker compose -f docker-compose.prod.yml up -d --build
sudo docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
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
│   └── alembic/       # Миграции БД
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/     # Страницы
│   │   ├── components/
│   │   └── store/     # Zustand state
│   └── tests/         # Frontend тесты
├── .env.example       # Пример переменных (без паролей!)
├── .env               # Твои переменные (НЕ КОММИТЬ!)
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
| GET | `/api/templates` | Шаблоны работ |
| POST | `/api/templates` | Создать шаблон |

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

## 📦 Деплой

1. Купи VPS (Ubuntu 22.04, 2GB RAM минимум)
2. Установи Docker и Docker Compose
3. Клонируй репозиторий
4. Настрой .env
5. Запусти: `sudo docker compose -f docker-compose.prod.yml up -d --build`
6. Создай таблицы: `sudo docker compose exec backend alembic upgrade head`

## 💰 Модели монетизации

- **SaaS подписка**: от 2 990 ₽/мес
- **Free trial**: 14 дней
- **Self-hosted**: для крупных СТО

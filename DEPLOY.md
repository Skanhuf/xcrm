# XCRM — Production Deployment Guide

## 1. Подготовка сервера

### Требования
- Ubuntu 22.04 LTS
- 2GB RAM минимум (рекомендуется 4GB)
- 20GB SSD
- Docker + Docker Compose

### Установка Docker
```bash
# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER

# Проверить
docker --version
docker compose version
```

## 2. Настройка проекта

### Клонировать репозиторий
```bash
git clone <your-repo-url>
cd xcrm
```

### Настроить .env
```bash
cp .env.example .env
nano .env
```

Отредактируйте:
```env
POSTGRES_PASSWORD=your_secure_password_here
SECRET_KEY=your_random_secret_key_here
CORS_ORIGINS=https://yourdomain.com
```

## 3. Запуск

### Первый запуск
```bash
# Запустить Docker
docker compose -f docker-compose.prod.yml up -d --build

# Создать таблицы БД
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Проверка
```bash
# Проверить контейнеры
docker compose -f docker-compose.prod.yml ps

# Проверить логи
docker compose -f docker-compose.prod.yml logs -f

# Проверить API
curl http://localhost:80/api/health
```

## 4. Настройка домена и HTTPS

### Купить домен
- reg.ru / namecheap / cloudflare

### Настроить DNS
```
A record: yourdomain.com -> your-server-ip
```

### Установить Certbot (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y

# Получить сертификат
sudo certbot --nginx -d yourdomain.com
```

### Обновить nginx
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... остальная конфигурация ...
}
```

## 5. Настройка CI/CD

### GitHub
1. Создать репозиторий
2. Загрузить код:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/xcrm.git
git push -u origin main
```

3. Создать secrets в GitHub:
   - `STAGING_HOST` — SSH хост staging сервера
   - `PROD_HOST` — SSH хост production сервера
   - `GITHUB_TOKEN` — Personal access token

### GitLab
1. Создать проект
2. Загрузить код
3. Настроить CI/CD variables в Settings → CI/CD → Variables

## 6. Мониторинг

### Добавить мониторинг
```yaml
# docker-compose.prod.yml
services:
  # ...
  
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
```

## 7. Резервное копирование

### Бэкап БД
```bash
# Создать бэкап
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U xcrm xcrm > backup_$(date +%Y%m%d).sql

# Восстановить
docker compose -f docker-compose.prod.yml exec -T postgres psql -U xcrm xcrm < backup_20240101.sql
```

### Автоматический бэкап
```bash
# Добавить в crontab
crontab -e

# Каждый день в 3:00
0 3 * * * docker exec xcrm_postgres_1 pg_dump -U xcrm xcrm > /backups/backup_$(date +\%Y\%m\%d).sql
```

## 8. Обновление

### Обновить код и перезапустить
```bash
cd /opt/xcrm
git pull
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## 9. Устранение проблем

### Контейнеры не запускаются
```bash
# Посмотреть логи
docker compose -f docker-compose.prod.yml logs

# Перезапустить
docker compose -f docker-compose.prod.yml restart
```

### База данных не подключается
```bash
# Проверить БД
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U xcrm

# Проверить переменные окружения
docker compose -f docker-compose.prod.yml exec backend env | grep DATABASE
```

### Невозможно подключиться к API
```bash
# Проверить backend
curl http://localhost:8000/api/health

# Перезапустить backend
docker compose -f docker-compose.prod.yml restart backend
```

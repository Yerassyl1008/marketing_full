# Деплой CRM на Railway

## Почему падало с `Field required`

В контейнере **нет** твоего локального `.env`. Все секреты задаются в **Railway → проект → Variables**.

## Минимум переменных

Подключи **PostgreSQL** (Add plugin) — Railway сам создаст **`DATABASE_URL`**.

Затем добавь вручную:

| Variable | Пример |
|----------|--------|
| `ENVIRONMENT` | `production` |
| `SECRET_KEY` | длинная случайная строка (рекомендуется ≥32 символов) |
| `ADMIN_EMAIL` | почта админа |
| `ADMIN_PASSWORD` | пароль админа |
| `CORS_ORIGINS` | `https://crm.example.com` |
| `ALLOWED_HOSTS` | `your-app.up.railway.app,api.example.com` |
| `DATABASE_URL` | если не подставился сам — скопируй из вкладки Postgres (**важно**: приложение само заменит `postgresql://` на `postgresql+asyncpg://`) |

Опционально: `ENABLE_DOCS=false`, `WEB_CONCURRENCY=2`, `RUN_MIGRATIONS=true`, `LOG_LEVEL=INFO` — значения по умолчанию уже есть в `app/config.py` и стартовом скрипте.

`PORT` Railway выставляет сам, контейнер теперь использует его автоматически.

## После деплоя

<!-- dawda -->
Если оставил `ENABLE_DOCS=true`, открой публичный URL Railway → `/docs` (Swagger). Логин: `POST /auth/login` с `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Этот же URL укажи в Vercel как `NEXT_PUBLIC_API_URL` и `CRM_API_URL`.

## Ошибка: `No address associated with hostname` / `socket.gaierror`

Хост в **`DATABASE_URL` не существует** для сети Railway (часто подставили локальный Docker).

**Сделай так:**

1. Открой сервис **PostgreSQL** в том же проекте → **Variables** (или **Connect**).
2. Скопируй **`DATABASE_URL` как есть** (хост вида `*.railway.app` или внутренний Railway — не `db`, не `localhost`).
3. В сервисе **CRM (FastAPI)** → **Variables**:
   - удали ручной `DATABASE_URL` с `db` / `localhost` / заглушками;
   - либо **Add variable → Reference** и привяжи `DATABASE_URL` из плагина Postgres;
   - либо вставь скопированную строку **одной** переменной `DATABASE_URL`.

4. Перезапусти деплой.

Локальный `postgresql://...@db:5432/...` из **docker-compose** на Railway **не работает** — там другой хост.

## Проверка здоровья сервиса
- `GET /health/live` — контейнер жив.
- `GET /health/ready` — приложение видит базу данных.
<!-- dawdad -->
<!-- dawdawdwadawdawdd -->
<!-- dawdad -->

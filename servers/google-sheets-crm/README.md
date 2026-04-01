# Google Sheets CRM API (Node)

Лёгкий бэкенд с тем же публичным API, что у `vrode_crm/FastAPI`, плюс **дублирование строк заявок в Google Таблицу** (для менеджеров, отчётов, ботов).

**Админка-канбан** на **сайте** (`/admin`) читает те же данные, что и **лист Google** — после настройки Google это **источник правды**: менеджер может править **всё** прямо в таблице (имя, email, статус, комментарий и т.д.), на доске это появится с задержкой кэша `BOARD_CACHE_MS` (по умолчанию ~2.5 c) или после действия с сайта. Без переменных Google сервер работает в **режиме только SQLite** (для локальной отладки).

Проект на **Python (`vrode_crm`)** для этого сценария не обязателен — достаточно Node CRM + Next + одна таблица.

- **SQLite (WAL)** — быстрый приём формы и доска даже при всплесках трафика.
- **Очередь на 1 поток + пауза между запросами** — укладывается в лимиты Google Sheets API.
- **Rate limit** на `POST /public/leads` — настраивается переменными окружения.

## Запуск

```bash
cd servers/google-sheets-crm
cp .env.example .env   # создай и заполни
npm run dev
```

Секреты держи в **`.env`** (подхватывается через `dotenv`). Из каталога `google-sheets-crm`, иначе путь к `.env` может не найтись.

**Windows PowerShell 5.1:** вместо `&&` используй `;`, например  
`cd servers/google-sheets-crm; npm run dev`

По умолчанию порт **8010**. В `my-app/.env.local` укажи **`CRM_API_URL=http://127.0.0.1:8010`** (и при желании `NEXT_PUBLIC_API_URL` так же), **перезапусти** `npm run dev` у Next.

**Админка** (`/admin/login`): Next вызывает `POST /api/admin/login`, который проксирует на **`POST {CRM_API_URL}/auth/login`**. В `.env` CRM-сервера обязательны **`ADMIN_EMAIL`** и **`ADMIN_PASSWORD`** — те же значения вводишь в форме входа.

## Google Sheets

1. Создай проект в [Google Cloud Console](https://console.cloud.google.com/).
2. Включи API **Google Sheets API** и **Google Drive API** (для сервисного аккаунта с расшаренным файлом это часто обязательно).
3. Создай **сервисный аккаунт**, скачай JSON-ключ или скопируй `client_email` и `private_key`.
4. Создай таблицу, **поделись** ею с email сервисного аккаунта (права «Редактор»).
5. Скопируй **ID таблицы** из URL (`.../d/SPREADSHEET_ID/edit`).
6. Лист с именем по умолчанию **Leads** (или задай `GOOGLE_SHEETS_TAB`).

Первая строка на листе: при пустой шапке создаются **русские заголовки** (ID, Имя, Email, …).

При старте CRM (если не `SHEETS_MANAGER_FORMAT=0`): **заморозка шапки**, ширины колонок, **выпадающий список** только в колонке «Статус» (`new` / `in_progress` / `success` / `rejected`), подсказка в примечании к ячейке статуса, **цвет строки** по статусу. Колонка «Канал» — обычный текст (без списка).

## Переменные окружения

См. `.env.example`.

## Совместимость с Next.js

Прокси в `my-app` уже ходит на `CRM_API_URL`:

- `POST /public/leads` — форма на сайте
- `GET /public/leads/board` — админская воронка
- `PATCH /public/leads/:id/status` — колонка статуса
- `PATCH /public/leads/:id` — комментарий (`message`)
- `POST|DELETE /public/leads/delete/:id` — удаление (как в FastAPI)

Статусы: `new`, `in_progress`, `success`, `rejected`.

## Прод (локально)

```bash
npm ci
npm run build
npm run start:prod
```

Переменные задай в окружении (файл `.env` на сервере не обязателен — хост подставит `process.env`).  
Если включён только Google (без fallback SQLite), каталог `data/` не критичен. Для **нескольких реплик** один и тот же SQLite на диске не подойдёт — тогда только режим Google Sheet как источник правды.

---

## Деплой в облако и связка с Next (Vercel)

Идея: CRM получает **публичный HTTPS URL** (например `https://google-sheets-crm-xxxx.onrender.com`). Сайт на Vercel **никогда** не ходит на `localhost` — в переменных указываешь именно этот URL.

### 1. Что задать на хостинге CRM (все из `.env.example`, без кавычек в UI где мешают)

| Переменная | Обязательно |
|------------|-------------|
| `PORT` | Обычно задаётся платформой сама (Render/Railway) — не переопределяй, если уже есть |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | да |
| `GOOGLE_SHEETS_TAB` | да (как вкладка в таблице) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | да |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | да — **одна строка**, внутри ключа переносы как `\n` (как в JSON) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | да — вход в `/admin/login` |
| `SHEETS_MANAGER_FORMAT` | опционально `0` отключить авто-оформление листа |
| `BOARD_CACHE_MS`, `RATE_LIMIT_*` | по желанию |

После деплоя открой в браузере: `https://ТВОЙ-CRM-ХОСТ/health` и `.../health/sheets` — должно быть `ok` / `storage: google_sheet`.

### 2. Render (пример)

1. Репозиторий на GitHub/GitLab с этим монорепо.
2. [Render](https://render.com) → **New** → **Blueprint** → укажи репозиторий, файл `render.yaml` в **корне** репозитория (`marketing/render.yaml`).
3. Либо **Web Service** вручную: **Root Directory** = `servers/google-sheets-crm`, Build = `npm ci --include=dev && npm run build && npm prune --omit=dev`, Start = `npm run start:prod`. (На Render часто `NODE_ENV=production`; без `--include=dev` не ставятся `typescript` и `@types/*`, и `tsc` падает.)
4. Во вкладке **Environment** вставь все секреты из таблицы выше.
5. Скопируй URL сервиса (например `https://google-sheets-crm.onrender.com`).

**Важно:** бесплатный инстанс Render «засыпает» — первый запрос после паузы может быть медленным.

### 3. Railway / Fly.io / VPS

- **Railway:** New Project → Deploy from repo → выбери папку `servers/google-sheets-crm`, команды как у Render, переменные те же.
- **Docker:** из каталога `servers/google-sheets-crm`: `docker build -t crm .` и `docker run -p 8010:8010 --env-file .env crm` (или передай `-e` по одной).

### 4. Подключить сайт (Next на Vercel) снова

В [Vercel](https://vercel.com) → твой проект `my-app` → **Settings → Environment Variables**:

```env
CRM_API_URL=https://ТВОЙ-CRM-ХОСТ.onrender.com
NEXT_PUBLIC_API_URL=https://ТВОЙ-CRM-ХОСТ.onrender.com
```

Без слеша в конце. Сохрани и сделай **Redeploy**.

Локально в `my-app/.env.local` оставь `http://127.0.0.1:8011` — на Vercel подставятся свои значения.

### 5. Чеклист после смены URL

- [ ] CRM открывается по HTTPS, `/health` = JSON с `"ok": true`
- [ ] Таблица расшарена на email сервисного аккаунта
- [ ] В Vercel оба ключа: `CRM_API_URL` и `NEXT_PUBLIC_API_URL`
- [ ] Redeploy Vercel после изменения env

### 6. Потом снова работать локально

В `.env.local` снова `CRM_API_URL=http://127.0.0.1:ПОРТ`, запусти CRM и Next — Vercel на это не влияет.

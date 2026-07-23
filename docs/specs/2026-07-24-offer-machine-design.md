# Offer Machine — Design Spec

**Дата:** 2026-07-24
**Ціль:** живий паблік-тул на Vercel до кінця дня.
**Одна фраза:** користувач відповідає на 5 питань про бізнес → за ~40 сек отримує Hormozi-оффер + живий преміальний лендінг із шерабельним URL.

---

## 1. Рішення, зафіксовані перед білдом

| Питання | Рішення |
|---|---|
| Стек | Next.js 15 (App Router) + TypeScript + Tailwind |
| БД | Neon Postgres через `@neondatabase/serverless` (HTTP-драйвер, ідеальний для Vercel serverless) |
| LLM | `claude-sonnet-5` для обох викликів, streaming |
| Валідація | `zod` для обох JSON-схем |
| Slug | `nanoid(8)` |
| Хостинг | Vercel (акаунт готовий); Anthropic-ключ готовий; Neon — провізіонимо |
| Пріоритет темплейтів | Спочатку `editorial` до вітринного рівня + повний флоу + деплой, потім `bold`, `craft` |
| Мова UI | English (українська локалізація — поза scope) |

---

## 2. Маршрути

| Path | Тип | Призначення |
|---|---|---|
| `/` | Server | Editorial hero (демо планки), 3 кроки «how it works», лінк на seed-приклад |
| `/create` | Client | Чат-візард: 4 фіксовані питання + 1 адаптивне + опційний contact link |
| `/result/[slug]` | Server | Таби: **Offer** (структурований Hormozi-розбір, копіюється) · **Landing** (`<iframe src="/p/[slug]">`). Дії: Copy link · Download HTML · Regenerate style |
| `/p/[slug]` | Server | Публічний лендінг, рендериться з `page_config` темплейт-компонентом |

## 3. API

| Endpoint | Робота |
|---|---|
| `POST /api/clarify` | Відповіді 1–4 → один дешевий Sonnet-виклик → адаптивне Q5 |
| `POST /api/generate` | **SSE-стрім.** Rate-limit чек → Call 1 (Offer Engineer, streamed) → Call 2 (Art Director) → запис у БД. Емітить реальні статуси |
| `POST /api/restyle` | slug → новий `page_config` на іншому темплейті (guard `restyled=false`) |
| `GET /api/download/[slug]` | Рендер темплейта у self-contained HTML (inline CSS) → attachment |

## 4. Два виклики Claude

Обидва — `output_config.format` (structured JSON), валідація Zod. Невалідний JSON → 1 авто-retry з описом помилки схеми у фідбеку; другий фейл → user-facing помилка + retry-кнопка, **без запису в БД** (rate limit не з'їдається).

- **Call 1 — Offer Engineer.** System prompt = дистилят методології `$100M Offers` (локальний скіл `alex-hormozi`). Вхід: відповіді візарда. Вихід: Offer JSON (Dream Outcome, Value Stack, guarantee, name, pricing frame, scarcity/urgency, `language`).
- **Call 2 — Art Director.** Вхід: Offer JSON + ніша. Вихід: Page config (template ∈ `editorial|bold|craft`, `palette_id`, `font_pair_id` — **тільки з фіксованих пресетів**, + всі тексти секцій). **AI ніколи не генерує HTML/CSS.**

## 5. Схема БД

```sql
CREATE TABLE generations (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,        -- nanoid(8)
  answers     JSONB NOT NULL,
  offer       JSONB NOT NULL,
  page_config JSONB NOT NULL,
  restyled    BOOLEAN DEFAULT FALSE,
  ip_hash     TEXT NOT NULL,               -- sha256(ip + IP_SALT)
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON generations (ip_hash, created_at);
```

Rate limit: `count(*) WHERE ip_hash=$1 AND created_at > now() - interval '24 hours' >= 3` → 429.

## 6. SSE-чесність

Статуси `Analyzing → Crafting value equation → Engineering guarantee → Naming offer → Designing page → Done` прив'язані до реального прогресу: стрімимо Call 1 і емітимо перші чотири, коли відповідні ключі з'являються в partial JSON; далі Call 2 → «Designing page»; далі «Done». Не фейковий таймер.

## 7. Темплейти

Ручні React-компоненти, керовані `page_config`. Пресети (3–4 палітри + 2–3 Google-font пари на темплейт) — у типізованому конфізі, Art Director обирає за id. Один engineering-нюанс: той самий компонент-дерево рендерить і живу React-сторінку, і статичний inline-CSS рядок (для `/api/download`) через `renderToStaticMarkup` + збір CSS.

## 8. Захист і ліміти

`ip_hash = sha256(ip + IP_SALT)`; ≤500 симв./відповідь та ≤3000 сумарно; сміттєва відповідь → м'яке прохання уточнити (без витрати ліміту); стилізована 404; 529 → auto-retry з backoff.

## 9. Поза scope сьогодні

Оплати · акаунти · редагування після генерації · кастомні домени · аналітика · A/B · збір email-лідів · українська локалізація UI.

## 10. Env

```
ANTHROPIC_API_KEY=
DATABASE_URL=          # Neon
IP_SALT=               # секрет для hash IP
NEXT_PUBLIC_BASE_URL=  # для OG і copy link
```

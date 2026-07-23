# Offer Machine — Пофазний план побудови

Кожна фаза = окремий коміт у GitHub (`origin/main` або feature-гілка). Після кожної фази — стоп на твоє одобрення наступної. Формат кожної фази: **Кроки · Бібліотеки · Файли · Що може піти не так**.

Правило пріоритету (зі спеки): при нестачі часу ріжемо знизу вгору всередині Фаз 5–6 (лишаємо 1 темплейт + просту головну), але Фази 0–4 та 7–8 недоторканні.

---

## Фаза 0 — Скаффолд і фундамент

**Мета:** порожній, але запускабельний Next.js-проєкт із усіма залежностями, env та схемою БД. Один зелений `npm run build`.

**Кроки**
1. `create-next-app` (App Router, TS, Tailwind, ESLint) у поточну теку.
2. Встановити runtime-залежності.
3. `.env.local` + `.env.example` з 4 змінними; підключити Neon, застосувати SQL-схему (`schema.sql`).
4. `lib/env.ts` — типізований доступ до env з fail-fast перевіркою.
5. Базовий `app/layout.tsx` + глобальні стилі; smoke-сторінка `/`.
6. Коміт: `chore: scaffold Next.js + deps + db schema`.

**Бібліотеки:** `next`, `react`, `typescript`, `tailwindcss`, `@anthropic-ai/sdk`, `@neondatabase/serverless`, `zod`, `nanoid`.

**Файли:** `package.json`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx` (заглушка), `app/globals.css`, `lib/env.ts`, `schema.sql`, `.env.example`, `.gitignore`.

**Що може піти не так:** Neon не провізіоніли → білд ОК, але БД-виклики впадуть (env-перевірка ловить рано); версії Next/React мінорні конфлікти; `.env.local` випадково закомічений (перевіряємо `.gitignore`).

---

## Фаза 1 — Бекенд-ядро (без UI)

**Мета:** типізований шар даних, Anthropic-клієнт, Zod-схеми, дистилят Hormozi-промпта, утиліти rate-limit/IP-hash. Покривається юніт-перевірками через простий скрипт.

**Кроки**
1. `lib/db.ts` — Neon-клієнт + функції `insertGeneration`, `getBySlug`, `countByIpHash24h`, `markRestyled`.
2. `lib/schemas.ts` — Zod-схеми `OfferSchema` і `PageConfigSchema` (+ TS-типи).
3. `lib/anthropic.ts` — обгортка над SDK: structured-output виклик із 1 авто-retry на schema-помилку та backoff на 529.
4. `lib/prompts/offer-engineer.ts` — дистилят `$100M Offers` зі скіла `alex-hormozi`.
5. `lib/prompts/art-director.ts` — промпт + перелік дозволених пресетів.
6. `lib/presets.ts` — палітри + шрифтові пари з id (поки для `editorial`).
7. `lib/ratelimit.ts` — `sha256(ip+IP_SALT)`, IP з хедерів Vercel.
8. Коміт: `feat: backend core — db, schemas, anthropic wrapper, prompts`.

**Бібліотеки:** ті ж; `crypto` (вбудований) для sha256.

**Файли:** `lib/db.ts`, `lib/schemas.ts`, `lib/anthropic.ts`, `lib/prompts/offer-engineer.ts`, `lib/prompts/art-director.ts`, `lib/presets.ts`, `lib/ratelimit.ts`.

**Що може піти не так:** Zod-схема надто сувора → часті retry (тримаємо схему з розумними optional); дистилят промпта завеликий → токени/латентність (тримаємо стисло); визначення IP за проксі Vercel (`x-forwarded-for` — беремо перший).

---

## Фаза 2 — Два виклики Claude як API (тестуємо через curl)

**Мета:** `/api/clarify` і `/api/generate` (SSE) працюють end-to-end на реальному ключі, повертають валідний Offer+PageConfig, пишуть у БД лише при успіху.

**Кроки**
1. `POST /api/clarify` — приймає відповіді 1–4, повертає адаптивне Q5.
2. `POST /api/generate` — route handler з `ReadableStream`: rate-limit → Call 1 (streamed, емісія статусів по partial-ключах) → Call 2 → Zod-валідація → `insertGeneration` → фінальна подія зі slug.
3. Валідація інпуту (≤500/≤3000 симв., сміттєва відповідь → м'який реджект без запису).
4. Обробка помилок: 429 (ліміт), retry-подія при подвійному фейлі схеми, backoff на 529.
5. Ручний тест `curl` + збереження прикладу відповіді.
6. Коміт: `feat: clarify + generate SSE endpoints`.

**Бібліотеки:** ті ж; Web Streams API (вбудований у Next runtime).

**Файли:** `app/api/clarify/route.ts`, `app/api/generate/route.ts`, `lib/sse.ts` (хелпер формування SSE-подій).

**Що може піти не так:** SSE-буферизація на Vercel/edge (використовуємо Node runtime, правильні хедери `text/event-stream`, `no-cache`); partial-JSON парсинг Call 1 крихкий → статуси робимо best-effort, фінальну валідацію — на повному об'єкті; таймаут функції Vercel (10–60с) — тримаємо в межах, стрім не дає обриву.

---

## Фаза 3 — Editorial-темплейт + публічний лендінг

**Мета:** `/p/[slug]` рендерить вітринний editorial-лендінг із `page_config`. Планка як ARTPRO/Аквастар, mobile-first.

**Кроки**
1. `components/templates/Editorial.tsx` — секції hero → проблема → value stack → how it works → guarantee → pricing → FAQ → final CTA + віральний бейдж.
2. Підключення Google-шрифтів через `next/font` за пресетом.
3. `app/p/[slug]/page.tsx` — фетч по slug, рендер темплейта, OG-мета; стилізована 404.
4. Дизайнерські деталі (типографіка, сітка, мікровзаємодії), адаптивність.
5. Коміт: `feat: editorial template + public landing page`.

**Бібліотеки:** `next/font`; (опційно легка анімація пізніше).

**Файли:** `components/templates/Editorial.tsx`, `components/templates/index.ts` (реєстр template→компонент), `app/p/[slug]/page.tsx`, `app/p/[slug]/not-found.tsx`.

**Що може піти не так:** динамічні Google-шрифти за пресетом vs статичний `next/font` (обмежимо пресети до заздалегідь імпортованих шрифтів); «AI-шаблонний» вигляд (свідома ручна робота над деталями); порожні/довгі поля з AI ламають верстку (clamp/усічення в компоненті).

---

## Фаза 4 — Фронтенд-флоу (головна, візард, результат)

**Мета:** повний користувацький шлях у браузері: `/` → `/create` → стрім генерації → `/result/[slug]`.

**Кроки**
1. `/` — editorial-hero тула, «how it works», CTA `Build my offer`, лінк на seed.
2. `/create` — чат-візард: 4 фіксовані Q + виклик `/api/clarify` для Q5 + опційний contact link; валідація довжини на клієнті.
3. Екран генерації — споживання SSE, показ статусів у реальному часі.
4. `/result/[slug]` — таби Offer|Landing (iframe), кнопки-заглушки під Фазу 5.
5. Коміт: `feat: homepage + chat wizard + result page`.

**Бібліотеки:** вбудований `fetch`/`EventSource`-патерн (читаємо ReadableStream вручну через `fetch`).

**Файли:** `app/page.tsx` (фінальна), `app/create/page.tsx`, `components/Wizard.tsx`, `components/GenerationStatus.tsx`, `app/result/[slug]/page.tsx`, `components/ResultTabs.tsx`.

**Що може піти не так:** читання SSE через `fetch` reader (не `EventSource`, бо треба POST) — акуратний парсинг чанків; iframe та CSP; стан візарда при рефреші (тримаємо в пам'яті, без persist — свідомо).

---

## Фаза 5 — Дії: copy link, download HTML, restyle

**Мета:** три дії на сторінці результату працюють.

**Кроки**
1. Copy link — клієнтський клипборд + `NEXT_PUBLIC_BASE_URL`.
2. `GET /api/download/[slug]` — `renderToStaticMarkup` темплейта + інлайн CSS → attachment.
3. `POST /api/restyle` — guard `restyled=false`, Call 2 на іншому темплейті, `markRestyled`, повернення нового `page_config`.
4. Коміт: `feat: copy link, download HTML, restyle actions`.

**Бібліотеки:** `react-dom/server` (`renderToStaticMarkup`).

**Файли:** `app/api/download/[slug]/route.ts`, `app/api/restyle/route.ts`, оновлення `components/ResultTabs.tsx`, `lib/render-static.ts` (інлайн CSS).

**Що може піти не так:** інлайнінг Tailwind-класів у самодостатній HTML (потрібен окремий збір критичного CSS або inline-стилі в темплейті — рішення: темплейт дає inline-CSS-варіант); restyle до появи `bold`/`craft` обмежений одним темплейтом (тимчасово — до Фази 7).

---

## Фаза 6 — Деплой + повний прогін + seed

**Мета:** живий URL на Vercel, повний флоу проходить, головна має seed-приклад.

**Кроки**
1. Env на Vercel (4 змінні), Neon у проді.
2. Деплой, прогін end-to-end на проді.
3. Seed-генерація як приклад на головній.
4. OG-теги, favicon, фінальна вичитка.
5. Коміт: `chore: production deploy config + seed example`.

**Файли:** `vercel.json` (за потреби), README-нотатка з деплою, seed-скрипт `scripts/seed.ts`.

**Що може піти не так:** розбіжність env локально vs Vercel; холодний старт serverless + латентність LLM близько до таймауту (стрім рятує); Neon connection pooling у serverless (HTTP-драйвер знімає проблему).

---

## Фаза 7 (stretch) — Темплейти bold + craft

**Мета:** повна цінність — 3 темплейти, restyle перемикає між ними.

**Кроки**
1. `components/templates/Bold.tsx` (темна кінематографічна).
2. `components/templates/Craft.tsx` (тепла, текстури).
3. Розширити пресети та реєстр; Art Director обирає з 3.
4. Коміт: `feat: bold + craft templates`.

**Файли:** `components/templates/Bold.tsx`, `components/templates/Craft.tsx`, оновлення `lib/presets.ts`, `components/templates/index.ts`.

**Що може піти не так:** три темплейти множать поверхню верстки/багів (спільні під-компоненти секцій); Art Director обирає невідповідний темплейт до ніші (підказки в промпті).

---

## Наскрізні ризики

- **Латентність двох LLM-викликів** близько до 60с — стрім + Sonnet тримають у межах; при потребі — `effort` нижче.
- **Якість лендінга («не соромно показати»)** — головний ризик цінності; тому Editorial робиться руками до вітринного рівня перш ніж масштабувати.
- **Rate-limit і IP за проксі** — тестуємо на проді Vercel, не лише локально.
- **Секрети** — `.env.local` у `.gitignore`; ключі тільки в env, ніколи в код чи в промпт.

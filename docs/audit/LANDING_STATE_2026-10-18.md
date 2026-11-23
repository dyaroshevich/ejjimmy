# AUDIT — состояние лендинга (рабочее дерево) — 2026-10-18 09:41

> Замер сделано на рабочем дереве `main` @ 87f0083 + незакоммиченные правки, dev-сервер :3001,
> chromium (browser-use), вьюпорт 804 px. Прод https://admintawanpower.vercel.app — старая версия, работает.

## Как воспроизвести

```bash
npm run dev                      # :3001, первый GET / компилируется ~72 s
curl -o probe.html http://127.0.0.1:3001/     # 200, 184 453 байта
```

Скриншоты: `shots/audit-2026-10-18-viewport.png`, `shots/audit-2026-10-18-fullpage.jpeg`.

## 1. Утечка лидов (критично)

| # | Факт | Доказательство |
|---|------|----------------|
| 1.1 | Форма `#contact` ничего не отправляет: `onSubmit={(e)=>{e.preventDefault();setOk(true);}}` | [contact/ContactSection.tsx:16](file:///K:/code/tawanpower/src/components/landing/contact/ContactSection.tsx#L16); в DOM `<form class="form-grid">` без action, `formAction: "none"` |
| 1.2 | Рабочий путь существует, но не используется: `LeadForm` → `submitLead()` (`@/lib/lead-manager`) | [LeadForm.tsx:6,38](file:///K:/code/tawanpower/src/components/LeadForm.tsx#L38) |
| 1.3 | Оверлей чата удалён из шелла: в HEAD `LandingShell` рендерил `<SolarChat>`, теперь нет | `git show HEAD:src/components/landing/LandingShell.tsx` стр. 5, 206 vs [LandingShell.tsx](file:///K:/code/tawanpower/src/components/landing/LandingShell.tsx); в HTML `/` совпадений `SolarChat` = 0 |
| 1.4 | `ChatContext` — заглушка: `openChat/openForm/closeChat/scrollToSegment` = `() => {}` | [LandingShell.tsx:24-37](file:///K:/code/tawanpower/src/components/landing/LandingShell.tsx#L24-L37). Кнопка hero «Talk to an engineer» (`OpenChatButton`) кликается вхолостую |
| 1.5 | Мёртвый якорь: `Segments` ведёт на `#chat`, элемента с `id="chat"` на странице нет | [segments/Segments.tsx:112](file:///K:/code/tawanpower/src/components/segments/Segments.tsx#L112); id в DOM: cases, contact, knowledge, location, name, phone, sigen, steps, systems, uniCount, uniDots, uniStrip |

Итог: с лендинга нельзя ни начать чат, ни оставить заявку. Заявка «успешно отправлена» и теряется.

## 2. Двойная шапка

`layout.tsx:133` оборачивает всё в `<AppShell>` → `layout/Header` + `layout/Footer`.
Новый `landing/LandingShell` рендерит ещё и `landing/Header` + `landing/Footer` (копия логики `hidePaths`/`showFooter`).
На `/` в DOM две навигации, два `<select>` языка, две кнопки меню — видно на скриншоте.

## 3. Каскада нет: 59 классов не определены

`src/app/globals.css` определяет `.wrap .section .section--cream .btn* .card .badge .hero* .pick*`.
Новые секции используют классы, которых в CSS нет. Замер (script ниже) по 9 файлам:

```
lead-grid form-grid field info success lead-form-side      <- contact
case-card cases case-body case-img case-meta cta-row        <- case
products product product--rich product-body product-inst product-photo
  product-price-row tier-strip tier-strip__item full-price roi save
  pills lbl dim brand-mark kit-photo kit-sub t-name t-price  <- system
step step-ic step-num step-top grad                          <- step
sigen sigen-grid sigen-img sigen-metrics hotspot             <- sigen
knowledge knowledge-card knowledge-body knowledge-ic kicker  <- knowledge
sec-head sec-head--center                                    <- все
hero-media hero-img strip strip-wrap dots count hl btn--sm   <- hero
```

Компьютерные стили с живой страницы (804 px): у всех `display: block`,
`grid-template-columns: none`, `padding: 0px`. Высота секций: systems 3032, steps 2940,
knowledge 2803, cases 512, sigen 476, contact 465 px.
Ложноположительные из 62 найденных (`from-orange-500`, `to-orange-600`, `blur-[120px]`) — tailwind, не в счёт → 59 реальных.

## 4. Контент вынесен из Supabase в JSX

| Секция | `useTranslations` | Источник данных |
|--------|-------------------|-----------------|
| system/SystemsSection | нет | хардкод: `฿120,000`, `฿228,000`, `from ฿89,000/159,000/289,000` |
| case/CaseSection | нет | хардкод |
| step/StepSection | нет | хардкод |
| SigenSection | нет | хардкод |
| KnowledgeSection | нет | хардкод |

Старые `ProductGrid` / `KnowledgeGrid` (+ адаптеры) читали `solar_products` и `knowledge`
через supabase ([ProductGrid.tsx:29](file:///K:/code/tawanpower/src/components/ProductGrid.tsx#L29),
[KnowledgeGrid.tsx:44](file:///K:/code/tawanpower/src/components/KnowledgeGrid.tsx#L44)).
Правки каталога в /admin на лендинг больше не влияют. Переключатель 8 локалей эти 5 секций не касается.

## 5. Пропущенные переводы (8 из 8 локалей)

Runtime-ошибки в консоли (`MISSING_MESSAGE ... locale en`), проверено по всем файлам `messages/*.json`:

```
contact.nameLabel  contact.phoneLabel  contact.locationLabel
contact.submit     contact.successTitle  contact.successSub
footer.brandTop
```

7 ключей × 8 локалей. Остальные ключи `contact.*` / `footer.*` / `header.*` на месте.
Дополнительно: `landing.features.packages.*` (5 ключей) есть только в `ru` и `zh-CN` — относится
к мёртвой секции `FeaturesSection`.

## 6. Картинки — горячие ссылки на прод, и они 404

```
https://admintawanpower.vercel.app/content/hero/crew.jpg        -> 404
https://admintawanpower.vercel.app/content/sigen/sigenergy-s1.jpg -> 404
https://admintawanpower.vercel.app/content/sigen/sigenergy.jpg  -> 404
/images/line-oa-qr.png  (локально)                          -> 200
```

В `public/` есть только `public/content/brands` и `public/content/products`.

## 7. Мёртвый код в `src/components/landing/`

Ни кем не импортируются (кроме себя): `SegmentsSection.tsx`, `StepsSection.tsx`,
`FeaturesSection.tsx`, `TrustSection.tsx`, `ContactSection.tsx` (старый, с `LeadForm`),
`KnowledgeGridAdapter.tsx`, `ProductGridAdapter.tsx`, `SigenergySectionAdapter.tsx`,
`SofinModelSectionAdapter.tsx`. `OpenChatButton.tsx` жив только внутри `HeroSection` и мёртвого `FeaturesSection`.
Дубли: `landing/Footer.tsx` vs `landing/FooterSection.tsx` (оба подключены), `landing/Header.tsx` vs `layout/Header.tsx`.

## 8. Репозиторий

20 позиций в `git status`, из них 9 изменённых файлов (−1950/+1664 строк) и 11 новых.
В корне и закоммичены: `database.db`, `db_cluster-10-09-2026@22-40-44.backup.gz`,
`MicrosoftTeams-image*.png` ×3, `consent.png`, `*.bat` ×4, `win-db-fix.ps1`, `test_line_notify.ps1`,
`data_sofin_solar_part_1.json`, `scraping_apis.json`, `schema.sql`, `create_solar_products_table.sql`,
`debug_product.ts`, `tawanpower-log-export-2026-05-17T19-52-06.json`, `audit-v2.mjs`, `mkdir` (файл).
`docs/` — 17 подкаталогов, `docs/marketing/` — 12 md-файлов.
CRLF-предупреждения git на 2 файлах landing.

## Что не является проблемой (проверено)

- `npx tsc --noEmit` — 0 ошибок (прогон этой сессии, см. ниже)
- Ключи `th.json` против `en.json` — 0 расхождений по составу, 0 пустых значений
- Горизонтального переполнения на 804 px нет (`docScrollWidth` 798 = вьюпорт)
- `/` отвечает 200, прод (`admintawanpower.vercel.app`) жив и это старая версия

---

# ПЕРЕЗАМЕР после правок — 2026-10-18 11:50

> Ветка `feat/landing-redesign`, диапазон коммитов `0483cc0..d627794` (7 коммитов), `main` не тронут.
> Замер: `npx tsc --noEmit`, dev-сервер :3001, `node scripts/landing-shots.mjs`
> (chromium + CDP, вьюпорты 390×844 и 1280×900, обход страницы скроллом, чтобы догрузить lazy-картинки).
> Свидетели прогона: `shots/landing/*.json`, `shots/landing/*.jpeg`, `shots/landing/*-console.txt` (оба файла пустые).

## 1–8: что было и что стало

| # | Пункт аудита | Было | Стало | Чем |
|---|---|---|---|---|
| 1 | Утечка лидов | форма `e.preventDefault(); setOk(true)`; чата нет; `ChatContext` — заглушки | `handleSubmit` → `submitLead()`; `<SolarChat>` в шелле; контекст живой | [contact/ContactSection.tsx:44](file:///K:/code/tawanpower/src/components/landing/contact/ContactSection.tsx#L44), [LandingShell.tsx:176](file:///K:/code/tawanpower/src/components/landing/LandingShell.tsx#L176) |
| 2 | Двойная шапка/футер | 2 `<header>`, 2 `<footer>` на `/` | `headers 1 · footers 1` в обоих вьюпортах | `7709f06` |
| 3 | 59 классов без CSS | 247 из 257 токенов определены, реальных ненайденных — 0 | 0 | `0483cc0` + `d627794` |
| 4 | Контент захардкожен в JSX | 5 секций молчат, /admin на лендинг не влияет | systems ← `solar_products`, cases ← `solar_cases`, knowledge ← `blog_posts`; steps/sigen/segments ← `messages/*.json` | [SystemsSection.tsx](file:///K:/code/tawanpower/src/components/landing/system/SystemsSection.tsx), [CaseSection.tsx:35](file:///K:/code/tawanpower/src/components/landing/case/CaseSection.tsx#L35), [KnowledgeSection.tsx:22](file:///K:/code/tawanpower/src/components/landing/KnowledgeSection.tsx#L22) |
| 5 | 7 пропущенных ключей × 8 локалей | `MISSING_MESSAGE` в консоли | 1089 ключей × 8 локалей, расхождений 0; консоль чистая | `7709f06`, `1a4828c` |
| 6 | 3 мёртвых hotlinka → 404 | 404 на prod-домене | битых картинок 0 в обоих вьюпортах | `7709f06` |
| 7 | Мёртвый код | 13 файлов-сирот, 2 футера, 4 адаптера | удалено 13 файлов (−1205 строк); футер один — `layout/Footer.tsx` | `17c8f0a` |
| 8 | Мёртвые строки в `messages/` | namespaces `landing/features/trust/sofin` не читались никем | −288 строк на локаль (ru/zh −293), всего −3262 | `17c8f0a` |

Отдельно, P0-регрессии самого редизайна, найденные при разборе и чиненные в `0483cc0`:
`@tailwind base/components/utilities` были удалены из `globals.css` (вернулись, стр. 10-12),
вместе с ними пропали `scroll-behavior` и три блока `prefers-reduced-motion` (в served CSS снова 4 упоминания).

## Замер после правок

```
tsc --noEmit            0 ошибок
GET /                   200, прогретый 0.31–0.61 s (5 прогонов); холодная первая компиляция ~72 s
phone  390×844          overflowX 0 · headers 1 · footers 1 · broken 0 · console errors 0 · low contrast 0
                        секции, px: segments 1031 · systems 5330 · cases 1617 · sigen 729 · steps 904 · knowledge 1038 · contact 929
desktop 1280×900        overflowX −6 · headers 1 · footers 1 · broken 0 · console errors 0 · low contrast 0
                        секции, px: segments 726 · systems 1760 · cases 1237 · sigen 663 · steps 667 · knowledge 681 · contact 778
каталог                 initial 8 карточек · пилюля «Hybrid» → 7 · «Show more (11)» → 19 · скелетонов 0 · цен пустых 0
                        тиры: from ฿120 000 Home · from ฿190 000 Business · from ฿375 000 Hybrid
контраст бейджей        success 3.58 → 5.21 · danger 3.44 → 5.91 · dark danger 1.00 → 8.10 (были равны фону)
```

Единственный «pending» на телефоне — `/images/crew/crew-smile.jpg`, lazy-картинка вне вьюпорта на момент
замера; отдаётся 200, не битая.

## Что нашлось только при починке (в порядке критичности)

1. **`ชุดโซลาร์ 100 kW (Huawei)` = ฿190 000 в `solar_products`.** Это цена одного инвертора, затесавшаяся в
   строку комплектной станции: `Huawei SUN2000-100KTL-M1` = ฿185 000, `Inverter SolarEdge 100 kW` = ฿195 000,
   а соседние комплектные — SolarEdge 100 kW ฿2 350 000, Huawei 200 kW ฿4 200 000. Лендинг из-за этого
   объявляет «бизнес-системы от ฿190 000». Правится в /admin/products; в коде не трогал — секция честно
   рендерит то, что в базе.
2. **`/privacy` → 404 при живой ссылке в футере** ([layout/Footer.tsx:80](file:///K:/code/tawanpower/src/components/layout/Footer.tsx#L80),
   и на лендинге, и на внутренних страницах). Сайт собирает имя+телефон+бюджет; политика — не только
   битая ссылка, но и дырка по PDPA. Ссылку не удалял: это решение про контент, а не про вёрстку.
3. **Гарантия в блоке SigenStor была «15 Y»** при `system_warranty = 5 ปี` у каждой Sigenergy-строки в базе
   и «10 yrs» в `sigenergy.m3value`. Теперь метрика показывает цифру из базы (5 лет) — та же, что и в
   карточках каталога выше на той же странице. Если у инвертора есть отдельная заводская гарантия на 10 лет,
   которую мы имеем право объявлять, — это в базу, а не в текст секции.
4. **`/login`** — при разборе оказалось, что «не локализован» это не дефект, а решение (`layout.tsx:27`:
   админка — Thai-first стаф-инструмент). Дефект другой: метки не были связаны с полями. Починено,
   подробности и проверка в браузере — в разделе «/login: метки не были связаны с полями» ниже.
   Словари `auth`, `forms`, `layout` (29 ключей) при этом не читает ни один файл; не удалял: это словарь
   под страницу, а не мусор от удалённой.
5. **Контент каталога существует только на тайском** (`locale = 'th'`). Секции выбирают строки текущего
   языка и откатываются на тайский, поэтому в русской или немецкой витрине названия товаров, кейсов и
   статей остаются тайскими. Механизм есть; нет данных.
6. **Три секции ждут Supabase последовательно** (`systems`, `cases`, `knowledge` — каждый свой `await`
   внутри рендера). Сколько это стоит на проде — не померено; на dev весь `/` укладывается в 0.31–0.61 s выше.
   Лечится `Promise.all` или `cache()`, но чинить стоит только когда цифра появится.
7. Мелочь: `.section--cream` нет тёмного варианта; метка `Product warranty` в полосе метрик SigenStor
   переносится на две строки, тогда как остальные — на одну.

## Не проверено (осталось за владельцем)

- **Сквозная отправка лида.** Код путь подключён и типизирован, но тестовую заявку я не отправлял:
  dev `.env.local` указывает на тот же Supabase-проект, что и прод, а `submitLead()` дополнительно
  пишет в `/api/notify-line`, то есть пинает админов в LINE. Решение и нажатие — за вами.
- **Вид финала глазами.** Инструмент считает числа, но вкус (порядок секций, плотность, tone of voice)
  смотрят на скриншотах: `shots/landing/desktop-*.jpeg`, `shots/landing/phone-*.jpeg`.

---

# Восстановление проверки на случайном порту — 2026-10-18 12:20

`:3001` был занят, поэтому весь перезамер перенесён на свободный порт. Инструмент уже умел `--base`,
так что правки в код не потребовались — только команда:

```bash
for i in 1 2 3 4 5 6 7 8; do p=$(( (RANDOM % 15000) + 23000 ));            # 23000..37999
  if ! netstat -ano | grep -q ":$p .*LISTENING"; then break; fi; done       # порт 31200
npx next dev -p $p > shots/dev-31200.log 2>&1 &                             # первая компиляция / ~40-70 s
curl -o shots/probe-31200.html -w "http %{http_code} %{size_download} B in %{time_total} s\n" http://127.0.0.1:$p/
node scripts/landing-shots.mjs --base http://127.0.0.1:$p
```

Результат совпал с таблицей выше до цифры, то есть перенос порта ничего не изменил в состоянии сайта:

```
GET /                  200, 196 940 байт, холодная первая компиляция 58.4 s (в логе: Compiled / in 38.2 s, 5043 модуля)
phone  390×844         overflowX 0 · headers 1 · footers 1 · broken 0 · console errors 0 · low contrast 0
                       секции, px: segments 1031 · systems 5330 · cases 1617 · sigen 729 · steps 904 · knowledge 1038 · contact 929
desktop 1280×900       overflowX −6 · headers 1 · footers 1 · broken 0 · console errors 0 · low contrast 0
                       секции, px: segments 726 · systems 1760 · cases 1237 · sigen 663 · steps 667 · knowledge 681 · contact 778
каталог                initial 8 · пилюля «Premium systems (Hybrid)» → 7 · «Show more (11)» → 19 · пустых цен 0 · скелетонов 0
                       тиры: ฿120 000 Home · ฿190 000 Business · ฿375 000 Hybrid
контент                cases 2 карточки · knowledge 3 карточки · битых 0 · неразрешённых 0 (база отвечает)
console                shots/landing/phone-console.txt и desktop-console.txt — по 0 байт
```

Единственный `not yet decoded 1` на телефоне — снова `/images/crew/crew-smile.jpg`
(`pendingSrc` в `shots/landing/phone.json`), lazy-картинка вне вьюпорта; отдаётся 200, не дефект.

## Мёртвый код вне `landing/` — нашёл `scripts/orphan-sweep.mjs`

Первый вариант инструмента искал импорты регуляркой с якорем `(?:^|\n)` и потому не видел
`dynamic(() => import('@/components/ProductCard'))` — `ProductCard`, `ProductDetail`,
`KnowledgeGrid` и другие живые файлы попадали в «мёртвые». Разбор переписан построчно
(`from '…'`, `import '…'`, `import(…)`/`require(…)` в любом месте строки), корнями стали
`src/app/**` + файлы фреймворка (`src/middleware.ts`, `src/instrumentation.ts`, `src/video/index.ts`,
`src/video/Root.tsx`), потому что их никто не импортирует, но они точки входа.

Замер (свидетель: `shots/orphans.json`): 235 файлов в `src/`, 226 достижимо, 13 нет,
из них **10 файлов и 1042 строки не упоминаются вообще никем**:

| Файл | Строк | Почему осиротел |
|---|---|---|
| `src/components/KnowledgeGrid.tsx` | 185 | заменён `landing/KnowledgeSection.tsx` в `549a345` |
| `src/components/ProductGrid.tsx` | 124 | заменён `landing/system/SystemsGrid.tsx` в `2b6de6e` |
| `src/components/CategoryTabs.tsx` | 20 | импортировался только из `ProductGrid.tsx` |
| `src/components/admin/super/AuditLogTab.tsx` | 217 | был до редизайна |
| `src/components/admin/LeadAnalytics.tsx` | 92 | был до редизайна |
| `src/lib/line-product.ts` | 193 | был до редизайна |
| `src/lib/solar/loader.js` | 105 | был до редизайна |
| `src/lib/system-config.ts` | 48 | был до редизайна |
| `src/lib/chunking.ts` | 44 | был до редизайна |
| `src/lib/browser-utils.ts` | 14 | был до редизайна |

Из них 329 строк (три верхние строки таблицы) — прямое следствие редизайна: старые гриды остались
без импортёров, когда секции начали читать Supabase. Не удалял в этой ветке: это за пределами
объезда «доделать редизайн», и решение «удаляем старые гриды навсегда» стоит за владельцем
(`BLIND_SPOTS.md` и `LAUNCH_PLAYBOOK.md` до сих пор ссылаются на `ProductGrid` как на живой).
Остальные 7 файлов к редизайну отношения не имеют — отдельная уборка.

## Переведено ли на 8 локалей на самом деле (уточнение к пункту 5)

В таблице «было → стало» я написал «1089 ключей × 8 локалей, расхождений 0». Это правда про
**состав** (ни одного отсутствующего или пустого ключа), но состав ≠ перевод. Замер перевода:
неспособный к совпадению критерий — значение побайтово равно английскому И в английском значении
есть хотя бы два латинских слова (то есть это фраза, а не «LINE» или «5 kW»).

| Локаль | Не переведено фраз | из них в `admin`+`content` (стаф-UI) | в словарях, которые не читает ни один файл | видно покупателю |
|---|---|---|---|---|
| th | 12 | 0 | 10 | 2 (`common.error`, `header.backToSite` — оба не читаются кодом) |
| ru | 1 | 0 | 0 | 1 (`header.backToSite` — не читается) |
| zh-CN | 1 | 0 | 0 | 1 (то же) |
| fr / ja / ko | 110 | 99 | 10 | 1 (`common.error`) |
| de | 110 | 99 | 10 | 1 (`common.error`) |
| en | — | — | — | — |

То есть **на витрине непереведённых строк не осталось** — два кандидата из таблицы проверены по
коду и никем не читаются: `common.error` (в `common` из 21 ключа читается ровно один — `filter`,
[SystemsGrid.tsx:58](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L58))
и `header.backToSite` (в админке для этой кнопки используется другая строка, `admin.backToSite`).
Единственная настоящая дыра, найденная таким замером, была одна: `header.navHybrid` в немецком
лежала английской («5-in-1 System» при «Système 5-en-1» во французском) — закрыто в этом же комите,
она выводится в [layout/Header.tsx:18](file:///K:/code/tawanpower/src/components/layout/Header.tsx#L18).

`meta.*` (title, description, ogTitle, ogDescription — то, что видно в поиске и в превью ссылки) —
во всех 8 локалях отличается от английского, проверено сравнением значений.

Вывод, который важно не перепутать: **витрина переведена целиком везде**; английский остаётся в
админке (`admin` 52 фразы + `content` 47) и в трёх словарях, которые не читает ни один файл
(`auth` 16, `forms` 7, `layout` 6). Первый замер давал для de/fr «60% совпадений с английским» —
это артефакт эвристики: немецкое «Modus wechseln» не содержит ни одного символа вне ASCII, поэтому
«нет родной скрипти» не отличить от «не переведено». Мерить надо побайтовым совпадением.

Первая версия замера «какие ключи читаются» тоже была неверна: она приписывала ключ любому
неймспейсу, упомянутому в файле, и потому приписала `common.priceAsk`/`common.title` как читаемые,
хотя `SystemsGrid.tsx` берёт их из `products`. Переписано на сопоставление переменной её
неймспейсу (`const tc = useTranslations('common')`), свидетельство — `shots/ns-usage.mjs`.

Граница метода, чтобы цифру не приняли за больше, чем она есть: на уровне **ключей** статический
разбор даёт ложные «не читается». Проверено: он показал, что из `navigation` не читается ни один
из 20 ключей, а [landing/Header.tsx:46](file:///K:/code/tawanpower/src/components/landing/Header.tsx#L46)
читает три из них динамически — `{tn(l.iconKey)}`. Поэтому «не читается» на уровне ключа — гипотеза
на удаление, а не факт.

На уровне **неймспейса** вывод надёжен: все 78 вызовов `useTranslations`/`getTranslations` в `src`
передают литерал (`grep -cE "(use|get)Translations\("` = 78 и `grep -cE "(use|get)Translations\(['\"]"` = 78 —
разницы нет, значит динамической подстановки неймспейса в коде нет). Отсюда и только отсюда —
утверждение, что словари `auth` (16), `forms` (7) и `layout` (6) не привязаны ни к одному файлу.

## /login: метки не были связаны с полями

`/login` — единственная страница редизайна вне лендинда, где нашлось что чинить кодом. При этом
локализовать её нельзя сознательно: `src/app/layout.tsx:27` фиксирует решение
«Admin shell stays Thai-first (staff tool)». Английские подписи на входа в админку — это не дефект.

Замер по всему `src` (регулярка по тегам `<label>`): **70 меток, `htmlFor` у 6**. Из 14 файлов,
где не связана ни одна метка, 13 — админские (`admin/products/new`, `admin/products/[id]/edit`,
`admin/content/*`, `components/admin/*`); лендинг в этом списке не участвует: в `#contact` всё
связано (`htmlFor="leadName"`/`leadPhone`/`leadArea`, `aria-invalid`, `role="alert"` — см.
[ContactSection.tsx:101](file:///K:/code/tawanpower/src/components/landing/contact/ContactSection.tsx#L101)).

На `/login` починено: `htmlFor`/`id` на обоих полях, `name`, `autoComplete="email"` и
`current-password` (менеджеры паролей раньше не подхватывали поля), `aria-invalid` на полях,
`role="alert"` на блоке ошибки, `aria-busy` + текст «Signing in…» для состояния загрузки
(раньше кнопка просто теряла подпись).

Проверено в браузере (`http://127.0.0.1:31200/login`, chromium), а не по коду:

```
label[for] → input:  loginEmail → ["Email Address"]  ·  loginPassword → ["Password"]
клик по метке ставит фокус в поле:            true
autocomplete в DOM (после парсинга HTML):     email / current-password   ← SSR пишет autoComplete, парсер нормализует
name:                                          email / password
aria-invalid:                                   false (до ошибки)
консоль (error/warn/issue):                    пусто
npx tsc --noEmit:                               0 ошибок
GET /login:                                     200, 118 028 байт
```

Ветка с `role="alert"` не проверялась живым запросом: чтобы она появилась, надо отправить заведомо
неверные creds в тот же Supabase-проект, что и прод. Это один лишний промах входа в логах auth у
общей системы — не делал. Эта ветка — обычное условное рендерирование `{error && <div role="alert">}`, оно видно из кода.

# Вес картинок — 2026-10-18 13:05

Причина отдельного замера: в `phone.json` после перезапуска проверки на случайном порту осталось
`pendingSrc` из 6 файлов, и два из них подозрительно весили. Проверка «что реально тянет телефон»
оказалась дороже, чем список незадекодированных: инструмент
[scripts/page-weight.mjs](file:///K:/code/tawanpower/scripts/page-weight.mjs) разбирает HTML,
для каждого `<img>` берёт `sizes`, выбирает из `srcset` ту ширину, которую возьмёт этот вьюпорт, и
каждый URL тянет с браузерским `Accept` (без него оптимизатор отдаёт PNG вместо AVIF — первый замер
был бы враньём).

```
node scripts/page-weight.mjs http://127.0.0.1:<порт> 390 2 /          # телефон
node scripts/page-weight.mjs http://127.0.0.1:<порт> 1280 1 /         # десктоп
node scripts/page-weight.mjs http://127.0.0.1:<порт> 390 2 /cases/krabi-001
```

## Что было

Лендинг на 390px @2x: **4 463 846 B** картинок, из них через оптимизатор шёл один QR-код.

| байт | файл | почему столько |
|---|---|---|
| 2 439 665 | `/images/krabi-002.png` | обложка кейса из прод-строки, 1672×941 PNG, `<img>` без srcset |
| 555 841 | `/images/krabi-001.png` | то же, вторая обложка |
| 324 294 | `/images/1779681091454.jpg` | фото в hero-strip, отдаётся целиком под плитку 179px |
| 300 468 | `/images/krabi-002-gallery-01.webp` | то же |
| 197 621 | `/images/crew/crew-shirtwide.jpg` | главное фото hero, **eager** — то есть в LCP |
| 153 562 / 141 060 | `crew-smile.jpg`, `1779681110584.jpg` | hero-strip |

Две обложки = 2 995 506 B (67% страницы) и пять hero-фото = 1 117 005 B. Пути к обложкам приходят из
прод-данных (`solar_cases.media_assets.cover` = `krabi-001.png` / `krabi-002.png`), но размер в байтах
выбирал код: он писал сырой файл в `<img>`.

## Что починено кодом

| файл | что изменилось |
|---|---|
| [CaseSection.tsx:73-84](file:///K:/code/tawanpower/src/components/landing/case/CaseSection.tsx#L73) | обложка идёт через `next/image` с `sizes`; сырой `<img>` остался только для `http`-обложек — их хост не в `remotePatterns`, оптимизатор на них упал бы |
| [HeroSection.tsx:38-53](file:///K:/code/tawanpower/src/components/landing/HeroSection.tsx#L38) | главное фото + 4 плитки strip через `next/image`; главному — `priority`, иначе `next/image` по умолчанию сделал бы его lazy и LCP бы поехал |
| [CaseGallery.tsx:89](file:///K:/code/tawanpower/src/components/cases/CaseGallery.tsx#L89), [:115](file:///K:/code/tawanpower/src/components/cases/CaseGallery.tsx#L115), [CaseHeroImage.tsx:91](file:///K:/code/tawanpower/src/components/cases/CaseHeroImage.tsx#L91) | три `unoptimized` были включены насовсем — убрали в условие `unoptimized={src.startsWith('http')}` и добавили `sizes` |

```
                          было          стало        Δ
/            390px @2x    4 463 846 B →   669 214 B  −85%
/            1280px @1x                     610 628 B
/cases/krabi-001 390px    2 831 534 B →   383 758 B  −86%   (16/16 ссылок через оптимизатор, PNG 0)
формат на телефоне:  было image/png 2 925 KB →  стало image/avif 317 KB · image/webp 336 KB
```

Отдельно про `/cases/krabi-001`: страница, на которую ведёт кнопка «View case details» с лендинга,
тянула 2.70 MB на телефон — 12 фото галереи по 141–324 KB. Это тот же дефект, что и на лендинге, и
чинился он теми же тремя строками.

## Регрессия

`node scripts/landing-shots.mjs --base http://127.0.0.1:39236` — все цифры совпали с записанными до
правок: телефон `overflowX 0 · headers 1 · footers 1 · broken 0 · console 0 · low contrast 0`,
высоты секций `segments=1031 systems=5330 cases=1617 sigen=729 steps=904 knowledge=1038 contact=929`,
десктоп `−6 / 1 / 1 / 0 / 0 / 0` и `726 1760 1237 663 667 681 778`, каталог `8 → 7 → 19`, тиеры
฿120 000 / ฿190 000 / ฿375 000. Высоты не сдвинулись — значит `next/image` не поменял вёрстку.

Что в инструменте добавлено: hero раньше не измерялся вообще (список секций начинался с `segments`),
теперь `hero=992` телефон / `hero=1017` десктоп и есть склейка `phone-hero.jpeg`. Рендер проверен
кадром, а не только цифрами: `shots/landing/phone-hero.jpeg`, `phone-cases.jpeg`, плюс живой скриншот
галереи `/cases/krabi-001` (3 колонки, квадратные кропы, без растяжения).

`npx next lint` по всем пяти изменённым файлам: exit 0, одно предупреждение —
`CaseSection.tsx:83 no-img-element`. Это осознанный `<img>` для `http`-обложек; убрать его можно,
только добавив нужный хост в `remotePatterns`, то есть решив вопрос, который ниже.

## Ассеты каталога: что показали `dup-assets.mjs` и `asset-usage.mjs`

`asset-usage.mjs` делает read-only `select` прод-таблиц (35 товаров, 2 кейса) и сверяет с диском:

- **0 путей, на которые ссылается строка и которых нет на диске** — то есть битых картинок в каталоге нет;
- **119 файлов из 208 (12 577 770 B) не упоминает ни одна строка** — 99 PNG (12.2 MB оригиналов рядом с
  109 webp, которые и отдаются) и 20 webp;
- 27 групп побайтово одинаковых файлов: 6 — близнецы внутри одного товара (`image-N.webp` и `img-N.webp`,
  46 186 B мусора), 21 — **разные SKU с одной фотографией**. Из них клиенту видно, например, что
  `sigenergy-10kwh-3phase` и `sigenergy-10kwh-16kwh-1phase` — один и тот же снимок 800×800 (оба ровно
  4 022 B), и что `huawei-100kw` и `huawei-1mw` показывают одну картинку: система на 100 kW и на 1 MW.

Ни один из этих пунктов не чинится кодом: пути лежат в строках `solar_products` / `solar_cases`, а
правки там — решение владельца (тот же порядок, что с ценой `Huawei 100 kW`).

## Мелочь, которую заметил конфиг

`next.config.mjs` разрешает оптимизатору хост `odolxtryjmfpzfmuhngo.supabase.co`, а `.env.local` и прод
указывают на `gfdbmxhtvhivoztgckit.supabase.co`. Ссылки на старый проект в коде и в строках нет ни
одной — проверено `git grep` по `src` и по дампу строк. Сегодня безвредно ровно потому, что ни один
компонент не подаёт удалённый URL в `next/image`; если админ вставит в `image_url` ссылку на
хранилище текущего проекта, оптимизатор её отвергнет.

## Границы метода

- Цифры сняты с dev-сервера. На Vercel тот же `sharp` отдаёт те же AVIF, но с CDN-кэшем; сравнение
  «было/стало» корректно, абсолютные байты на проде могут отличаться на единицы процентов.
- `sizes` я подобрал по CSS (`clamp(170px, 46vw, 250px)` у плитки strip, `100%` + `aspect-ratio` у
  обложек), а не замерил в браузере: `page-weight.mjs` считает ширину по этим подсказкам, поэтому
  «сколько возьмёт телефон» — оценка с точностью до ступени srcset (384/640/750/828), а не обмер
  пикселей.
- Оптимизатор в dev кодирует синхронно. Один замер попросил `w=3840` у 2.4 MB PNG — dev-сервер
  встал и уже не ожил (CPU процесса заморожен: 446.90625 → 446.90625 за 10 s, `GET /` не отвечает
  55 s). Перезапускал только свой `next dev` (PID 25828/24880, порт 31200); три сервера, поднятых
  вчера, не трогал. Все цифры выше сняты с чистого сервера на 39236.

## Что осталось незакрытым после этого замера

1. `SystemsGrid` — единственные тяжёлые картинки на лендинге вне правки:
   [SystemsGrid.tsx:87-88](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L87)
   отдаёт фото товара сырым `<img>` (остаток: `goodwe-20kw-3phase/main.webp` 175 550 B). Паттерн тот же,
   но путь приходит из `image_url` и легко может быть `http` — нужен такой же разбор, как в `CaseSection`.
2. `unoptimized` в админке (`content/library`, `content/posts`, `PostEditor`) — 4 места. Там картинки
   из Supabase Storage, то есть удалённые: до решения про `remotePatterns` это не баг, а единственная
   рабочая конфигурация.
3. Тайские `alt` в галерее кейса (`รายละเอียดการติดตั้ง N`, `รูปที่ N`) — это пункт про перевод
   контента каталога, а не про картинки.

# Стили пропали на 3001 + закоммиченный service worker — 2026-10-18 13:09 (коммит `e827c42`)

Сигнал от владельца: скриншот `http://127.0.0.1:3001/` без CSS («рузультат без стилей»). Разбирательство показало,
что сломан не сайт, а вкладка — и по пути нашлась настоящая мина в репозитории.

## Как воспроизвести

```bash
curl -s -o /dev/null -w "%{http_code} %{size_download} B\n" "http://127.0.0.1:3001/_next/static/css/app/layout.css?v=1"
curl -s -o /dev/null -w "%{http_code} %{size_download} B\n" http://127.0.0.1:3001/sw.js
grep -o 'url:"[^"]*"' public/sw.js | sed 's/url:"//;s/"//' | head -12 | while read u; do
  printf "%s %s\n" "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:3001$u")" "$u"; done
```

## Вердикт по вкладке: сервер жив, документ — нет

| Что проверено | Результат |
|---|---|
| `GET /_next/static/css/app/layout.css` на 3001 | **200, 246 584 B, `text/css; charset=UTF-8`** — каскад отдаётся |
| `GET /` на 3001 | 200, 203 687 B, в HTML есть `sizes=` (3 вхождения) — разметка сегодняшняя, с оптимизатором |
| Строка «Crew installation» из скриншота | **0 совпадений** в отдаваемом HTML; `git grep` по рабочему дереву и по `main` — тоже 0. Такого alt нет ни в одной актуальной версии |
| Чистый профиль браузера на том же URL | `sw: []`, `caches: []`, `bodyBg rgb(248,250,252)`, `h1Size 52.26px`, скриншот со стилями |

Вывод: вкладка показывает документ из прежней сборки, чей хешёный CSS-чанк на диске уже заменён. Это не регрессия ветки.

## Что при этом нашлось: `public/sw.js` — артефакт сборки, который лежит в git

Замерено, а не по памяти:

| Файл | Размер | В git | Комментарий |
|---|---|---|---|
| `public/sw.js` | 41 506 B | да, и на `main` (blob `06c4c62`) | генерируется `@ducanh2912/next-pwa` |
| `public/workbox-67661c47.js` | 22 284 B | да | сгенерирован вместе с `sw.js` |
| `public/fallback-ce627215c0e4a9af.js` | 563 B | да | сгенерирован (это `fallbacks.document`) |
| `public/swe-worker-5c72df51bb1f6ee0.js` | 1 413 B | да | сгенерирован |
| `public/custom-sw.js` | 2 612 B | да | **рукописный** воркер админки, его трогать нельзя |
| `public/offline.html` | 2 099 B | да | рукописный, нужен тем же `fallbacks` |

Внутри `sw.js` — `precacheAndRoute` на **407 URL** (`grep -c 'url:' public/sw.js` = 407) одной конкретной сборки,
папка `/_next/static/19PGC6szyP6rMPxbM8E2t/`. Прод живёт на сборке `zFpWFg7XwIHubrIFuUDfY` (проверено по `sw.js`
с Vercel). Из 12 первых закешированных URL на 3001 **404 все 12**, включая оба CSS-чанка этого манифеста
(`b6820c69a90dc4eb.css`, `fc1c9daac70c093b.css`). На проде `b6820c69…` тоже **404** (9 B), а `fc1c9daa…` — 200/10 603 B:
манифест пережил несколько деплоев и уже разошёлся с реальностью.

Почему это опасно, а не просто мусор:

1. Дев-сервер отдаёт `public/sw.js` как статику (200, 41 506 B). Регистрация воркера живёт в профиле браузера,
   а не на сервере: если на origin `127.0.0.1:3001` он зарегистрирован (например, после `next build && next start`
   на этом порту), то продолжает контролировать origin и после перезапуска `next dev`. Дальше precache по
   несуществующим чанкам + `CacheFirst` по картинкам = страница без стилей. Этим объясняется и расхождение
   между скриншотом и чистым профилем.
2. На проде воркер регистрируется: `register: true`, `skipWaiting: true` ([next.config.mjs:9-10](file:///K:/code/tawanpower/next.config.mjs#L9)),
   в прод-чанке `8142-c0b1850c9f20a61e.js` найден вызов `serviceWorker.register(...)`. `disable` в dev отключает
   только сборку плагина — закоммиченные байты `sw.js` уезжают в артефакт деплоя в любом случае. Пока Vercel
   пересобирает `next-pwa`, файл перезаписывается; но это лишняя строчка в diff каждой ветки, которая его
   пересобирает, и источник конфликтов при мерже. Худший случай (сборка не перезаписала `public/`) — возвращающиеся
   посетители получают precache-список чанков, которых на сервере нет.

## Чего я не делал

Не удалял файлы из git и не правил `.gitignore`: `git rm --cached public/sw.js …` меняет то, что уезжает в прод,
и это решение владельца. Сейчас `.gitignore` не исключает ни один из четырёх генерируемых файлов (проверено grep'ом
по `sw|workbox|fallback|offline|precache` — 0 совпадений). Варианты: игнорировать артефакты сборки и вычистить их
при мерже, или оставить как есть и следить за diff.

## Правка для владельца (одно действие)

На вкладке `127.0.0.1:3001`: DevTools → Application → Service Workers → **Unregister**, затем Application →
**Empty Cache and Hard Reload** (можно Ctrl+Shift+R, но с незарегистрированным воркером). Либо открыть порт 39236 —
та же ветка, профиль чистый, стили на месте.

# Последние сырые `<img>` на лендинге + метки публичной формы — 2026-10-18 13:22 (коммит `2c30cc7`)

Коммит `2c30cc7`. Продолжение пункта «Вес картинок»: на `/` оставалось два места, где фото шло мимо
оптимизатора, и одно из них было самым тяжёлым файлом страницы.

## Замер

```bash
MSYS_NO_PATHCONV=1 node scripts/page-weight.mjs http://127.0.0.1:39236 390 2 /   # телефон
MSYS_NO_PATHCONV=1 node scripts/page-weight.mjs http://127.0.0.1:39236 1280 1 /  # десктоп
```

| Вьюпорт | Было | Стало | Δ |
|---|---|---|---|
| телефон 390 @2x | 669 214 B | **469 980 B** | −199 234 B (−29.8%) |
| десктоп 1280 @1x | — | 353 282 B | референс для будущих правок |
|_refs мимо оптимизатора_ | 17 | **0** | из 25 |
| _не оптимизировано и > 150 KB_ | 1 (175 550 B) | **0** | — |

От первой точки отсчёта (до всей работы с картинками) телефон: 4 463 846 B → 469 980 B, **−89.5%**.

## Что починено

| Файл | Было | Стало |
|---|---|---|
| [SystemsGrid.tsx:87-88](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L87) | `goodwe-20kw-3phase/main.webp` 175 550 B в плитку 260 px | `next/image`, `sizes="(min-width: 1100px) 220px, 260px"` → 77 699 B AVIF |
| [SigenSection.tsx:30](file:///K:/code/tawanpower/src/components/landing/SigenSection.tsx#L30) | `sigenergy-5kwh-10kwh-1phase/main.webp` 21 368 B | `sizes="(min-width: 960px) 508px, 75vw"` |
| [LeadForm.tsx:81-109](file:///K:/code/tawanpower/src/components/LeadForm.tsx#L81) | 2 метки не связаны с полями, у имени нет `autocomplete` | `htmlFor`/`id` на всех трёх полях, `autoComplete="name"`, `aria-describedby` на ошибке телефона |

Ширины для `sizes` не угаданы по CSS, а взяты из обмера браузера (`shots/landing/*.json`): `.kit-photo`
= 260 px на телефоне и 213 px на десктопе, `.sigen-img` = 292 px и 508 px. Разбор хоста у `p.photo`
оставлен веткой на `http`, хотя сегодня **все 35** строк `solar_products` дают локальный путь
(проверено read-only `select`): поле заполняет админ, и завтра там может быть ссылка.

Форму `LeadForm` правил через `useId()`, а не литералами. Тогда я записал, что она рендерится дважды —
в модалке лендинга
([LandingShell.tsx:141](file:///K:/code/tawanpower/src/components/landing/LandingShell.tsx#L141))
и в чате ([SolarChat.tsx:28](file:///K:/code/tawanpower/src/components/SolarChat.tsx#L28)).
Это неверно: JSX-место ровно одно, а импорт в `SolarChat` никогда не рендерится. `useId()` остаётся
правильным выбором, но причина у него другая — см. пункт «Модальная форма заявки без входа» ниже.

## Ошибка в моём замере, найденная попутно

`scripts/img-dims.mjs` читал размеры WebP из чанка `VP8X` со смещением на 5 байт дальше нужного и печатал
`4997377x15616081` там, где на самом деле `300×300`. Молча, без ошибки. Ошиблись три файла (оба бренд-марка и
`sigenergy-5kwh-10kwh-1phase`) — все с альфа-каналом, то есть именно те, где срабатывает ветка `VP8X`.

Проверено, что цифры, уже записанные в этот аудит, не отравились: `krabi-002.png` 1672×941, дубли
`sigenergy-10kwh-3phase`/`sigenergy-10kwh-16kwh-1phase` 800×800 по 4 022 B, `goodwe-20kw-3phase` 800×1131 —
все подтверждены `sharp`, а не моим парсером. Тем не менее добавлен `scripts/img-dims-check.mjs`:
прогоняет парсер и `sharp` по всем 249 файлам `public/content` + `public/images` и падает на расхождении.
Свидетель — `shots/img-dims-check.txt`: `checked 249 image files against sharp · 0 mismatches`.

## Регрессия

`node scripts/landing-shots.mjs --base http://127.0.0.1:39236` после правок: телефон
`overflowX 0 · headers 1 · footers 1 · broken 0 · low contrast 0`, десктоп `−6 / 1 / 1 / 0 / 0 / 0`,
высоты секций совпали с записанными до правок до пикселя (`hero=992 segments=1031 systems=5330 cases=1617
sigen=729 steps=904 knowledge=1038 contact=929`), каталог по-прежнему `8 → 7 → 19`, оба console-файла 0 байт.
`npx tsc --noEmit` — 0 ошибок. `npx next lint` — только осознанные `no-img-element` на `http`-ветках
(`CaseSection.tsx:83`, `SystemsGrid.tsx:90`).

Рендер проверен кадрами, а не только цифрами: `shots/landing/phone-systems.jpeg` (плитки каталога: фото,
бренд-марк в углу, бейджи, цены — всё на месте), `shots/landing/phone-sigen.jpeg` (SigenStor + оба хотспота).

## Метки: честная цифра вместо прежней

`scripts/label-audit.mjs` отличает метку с `htmlFor` от метки, которая **оборачивает** поле (имплицитная
связь — она валидна). Прежняя запись «64 метки без htmlFor» считала грубым grep'ом и была завышена:

```
labels: 70 · htmlFor 8 · wrapping a control 6 · NEITHER 56
```

Из 56 сирот 2 были в `LeadForm` (починены выше), 2 — в `src/components/ui/index.tsx`, и это определения
примитивов `FormLabel`/`Label`, которые не использует ни один файл (проверено grep'ом: `FormLabel` встречается
только в самом `index.tsx`). Реально остались **52 метки в 10 админских файлах**; список с номерами строк —
`shots/labels.txt`.

> Число 56 здесь (и `htmlFor 8` выше) завышено на два: сам скрипт считал «total» неверно. Разбор и
> правильные цифры — в секции «Метки: 54 сироты → 2» ниже.

# Метки закрыты, плюс два найденных мёртвых пути — 2026-10-18 13:50

Коммиты `500e88b` (метки), `555e6ca` (CTA кейса), `d61c8ae` (`clipPath`).

## «Без стилей»: подтверждено ещё раз, на живом порту владельца

```bash
curl -s http://127.0.0.1:3001/ | grep -o '<link[^>]*stylesheet[^>]*>'
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" http://127.0.0.1:3001/_next/static/css/app/layout.css
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/_next/static/css/b6820c69a90dc4eb.css
node -e '… первые 12 url: из public/sw.js, каждый через curl …'   # свидетель — shots/sw-urls.txt
```

| Что | Значение (13:37–13:49) |
|---|---|
| `<link rel="stylesheet">` в документе, который отдаёт 3001 | один — `/_next/static/css/app/layout.css` |
| Он же | **200 · 246 584 B** — стили на сервере есть прямо сейчас |
| `sw.js` на том же origin | 200 · 41 506 B — тот самый закоммиченный артефакт |
| Два CSS-файла из его precache | `b6820c69a90dc4eb.css` → **404**, `fc1c9daac70c093b.css` → **404** |
| 12 первых URL манифеста | **404 все 12** |

Ветка ни при чём: `/` с 3001 выходит со стилями. Без стилей документ выходит только там, где ответила
старая регистрация воркера в профиле. Действие — одно, оно записано в «Правка для владельца» секции 13:09.

## Метки: 54 сироты → 2

**Инструмент был неправ.** `label-audit.mjs` печатал «total» как `max(forAttr+orphan, wrapped)` — попытку
не считать дважды метку, у которой есть и `htmlFor`, и обёртка. Из-за этого заголовок показывал
`htmlFor 8 · NEITHER 56`. До правок на самом деле было `htmlFor 10 · NEITHER 54`. Теперь классификатор
однозначный (`htmlFor` сильнее обёртки, каждая метка ровно в одной корзине) и печатает строку
`buckets add up: yes`: если корзины не сходятся с числом найденных `<label>`, это видно сразу.

Один и тот же скрипт, два дерева (`git archive 1625d1d src`, временная копия, удалена после замера):

| Замер | labels | htmlFor | только обёртка | NEITHER |
|---|---|---|---|---|
| `1625d1d` — до связывания | 70 | 10 | 6 | **54** |
| HEAD — после | 69 | 61 | 6 | **2** |

Сходится до единицы: 54 − 51 (связаны) − 1 (стала заголовком группы) = 2, и 70 − 1 = 69. Оставшиеся 2 —
`FormLabel`/`Label` в [src/components/ui/index.tsx:56,108](file:///K:/code/tawanpower/src/components/ui/index.tsx#L56):
определения примитивов, которые не использует ни один файл. Связывать их не с чем.

Что проверено после правки: `npx tsc --noEmit` — 0 ошибок; `npx next lint` по десяти файлам — ни одного
нового замечания (единственное, `PostEditor.tsx:143 exhaustive-deps`, лежит вне изменённых хунков);
статические `id` не повторяются внутри файла; каждый `htmlFor` ведёт на `id` из этого же файла; тайский
текст во всех десяти файлах совпадает с HEAD по набору кодпоинтов — 0 расхождений и 0 посторонних
скриптов. Свидетель — `shots/labels.txt` (13:50).

## Модальная форма заявки не открывается ниоткуда

Цепочка собрана grep'ом по всему `src`, звено за звеном:

| Звено | Где | Факт |
|---|---|---|
| `<LeadForm` рендерится | [LandingShell.tsx:141](file:///K:/code/tawanpower/src/components/landing/LandingShell.tsx#L141) | одно JSX-место на весь проект, внутри `{isFormOpen && (` ([LandingShell.tsx:126](file:///K:/code/tawanpower/src/components/landing/LandingShell.tsx#L126)) |
| `isFormOpen` ставит | [LandingShell.tsx:63](file:///K:/code/tawanpower/src/components/landing/LandingShell.tsx#L63) | только `openForm()` |
| `openForm` вызывают | [OpenChatButton.tsx:18](file:///K:/code/tawanpower/src/components/landing/OpenChatButton.tsx#L18) | единственное место, и то под условием `asForm ? … : …` |
| `asForm` передают | — | **0 мест**: `<OpenChatButton` встречается один раз, [HeroSection.tsx:31](file:///K:/code/tawanpower/src/components/landing/HeroSection.tsx#L31), без пропсов |
| чат | [SolarChat.tsx:28](file:///K:/code/tawanpower/src/components/SolarChat.tsx#L28) | `dynamic(() => import('@/components/LeadForm'))`, но `<LeadForm` в файле не рендерится |

Недостижимо: 129 строк `LeadForm.tsx`, 18 строк модалки в `LandingShell` (126–143) и 32 ключа перевода
(`formTitle`, `formSub`, `formLabel`, `closeForm` × 8 локалей). Живая форма на лендинге есть и работает —
это `ContactSection`; именно на неё теперь ведёт CTA из кейса.

Важно про `orphan-sweep.mjs`: он считает достижимость по графу импортов, поэтому `LeadForm` для него
«жив» — его импортируют. Достижимость по импорту ≠ достижимость кликом, и этот случай скрипт не ловит.

Решение за владельцем: либо дать модалке триггер (`asForm` на кнопках hero/segments), либо убрать её
вместе с остальными сиротами. Триггер я не придумывал — это меняет UX лендинга, а не чинит поломку.

## CTA в сайдбаре кейса вёл на якорь, которого нет

[CaseFinancingCalculator.tsx:53](file:///K:/code/tawanpower/src/components/cases/CaseFinancingCalculator.tsx#L53)
до правки — `router.push('/#contact-form')`. Элемента с таким `id` на сайте нет ни одного (grep по `src`);
секция на лендинге называется `#contact`
([ContactSection.tsx:65](file:///K:/code/tawanpower/src/components/landing/contact/ContactSection.tsx#L65)).

Замер в браузере до правки: маршрут меняется на `/`, хэш проставлен, но `scrollY` остаётся **0**, а
`#contact` лежит на **9 931 px** ниже вьюпорта. Кнопка выглядит мёртвой.

Отдельно проверено, что одна подмена якоря не лечит: `router.push('/#contact')` в App Router тоже не
прокручивает — те же `scrollY 0` / `contactTop 9931`. Поэтому кнопка стала ссылкой (`Button asChild` →
`<a href="/#contact">`), и прокрутку делает браузер на загрузке документа.

Замер после (числа с `shots/case-cta.json`): лендинг открылся на `scrollY 9931`, `#contact` у верхнего
края, заголовок секции — на 99 px, стабильно на протяжении 5.5 с; шапка `position: static`, она уже
унесена скроллом (`top −9931`), перехлёста нет. Бокс кнопки не изменился: 336×56, та же строка, что у
соседней `Share LINE` (тоже 336×56), `overflowX −6`.

## `clip-path` в JSX: ошибка React на каждой внутренней странице

Две копии солнечного логотипа передавали `clip-path` через JSX —
[layout/Header.tsx:32](file:///K:/code/tawanpower/src/components/layout/Header.tsx#L32) и
[admin/AdminClientLayout.tsx:209](file:///K:/code/tawanpower/src/app/admin/AdminClientLayout.tsx#L209).
React на это печатает `[error] Warning: Invalid DOM property 'clip-path'. Did you mean 'clipPath'?`, то есть
каждая страница под `AppShell` — `/cases`, `/blog`, `/segments`, `/partner` — открывалась с ошибкой в
консоли. Лендинг не был затронут: у него отдельный `components/landing/Header`, и того SVG-фрагмента в
нём нет (grep по `clip0_142_62` даёт ровно эти два файла).

После правки: консоль `/cases/krabi-001` — 9 сообщений → 8, из них `[error]` ноль; остаются только
служебные логи Vercel Analytics и Sentry в dev-режиме. Вывод не изменился: атрибут в DOM прочитан
после правки — `<g clip-path="url(#clip0_142_62)">`. `AdminClientLayout` проверен только типами: `/admin`
под логином, а логин — не моё действие (тот же Supabase-проект, что и прод).

## Регрессия после всей пачки

`node scripts/landing-shots.mjs --base http://127.0.0.1:39236` (свидетель — `shots/regression-1355.txt`):
телефон `overflowX 0 · headers 1 · footers 1 · broken 0 · console errors 0 · low contrast 0`, высоты секций
`hero=992 segments=1031 systems=5330 cases=1617 sigen=729 steps=904 knowledge=1038 contact=929` — совпали с
записанными в секции 13:22 до пикселя. Десктоп: `−6 / 1 / 1 / 0 / 0 / 0`,
`hero=1017 segments=726 systems=1760 cases=1237 sigen=663 steps=667 knowledge=681 contact=778`, каталог
`8 → 7 → 19`, тиеры ฿120 000 / ฿190 000 / ฿375 000. `scripts/page-weight.mjs` на телефоне —
**25 image refs · 469 980 B · 0 сырых**, базовая линия не сдвинулась (лендинг этой пачкой не тронут:
у него свой `components/landing/Header`, а метки и CTA живут на других страницах).

Поле, которого раньше не записывали: на телефоне на момент снимка одна картинка ещё не декодирована —
`/images/crew/crew-smile.jpg`, lazy, `broken 0`. Это не регрессия, но теперь число видно в выводе.

## Не тронуто, но видно

На вьюпорте 804×735 плавающий док чата («AI & SUPPORT TEAM») рисуется поверх кнопки отправки в `#contact`:
в кадре тёмный скруглённый прямоугольник залит на верхнюю треть оранжевой кнопки. Функционально это не
перекрытие — `elementFromPoint` в центр кнопки (399, 683) возвращает сам
`BUTTON.btn btn--primary btn--lg`, то есть клик доходит. Что делать с покраской (поднимать док или
добавлять отступ секции) — решение про вёрстку, не поломка, поэтому записано, а не переделано.

## Исправление в самом документе

Заголовки двух предыдущих секций несли минуту, которую я не измерял: «14:10» и «14:40», тогда как
реальные часы в этот момент показывали 13:xx, а `git log` даёт `e827c42` 13:09 и `2c30cc7` 13:22.
Заголовки заменены на время коммита — его можно проверить. Те же «14:10» были процитированы в `AGENTS.md`
и `ROADMAP.md`; убраны и там.

## Порт по approved-макету: hero → partners/services → header (18:xx–00:20, порт :39236)

Сигнал владельца: «вообще не то, что мы в опендизайне утвердили». Эталон —
[docs/design/opendesign/tawanpower-landing-unified.html](file:///K:/code/tawanpower/docs/design/opendesign/tawanpower-landing-unified.html)
(замороженная копия из Open Design, `cb83ae3`), и с этого момента сверка идёт только по нему, а не по памяти.

Закрыто полосами: `a3bb10d` (stylesheet + токены) → `32d10f9` (`uni-trust` = партнёры, `uni-features` =
4 карточки сервисов) → `f3a9dc1` (`uni-hero` с коллажем и snap-лентой) → эта правка (`uni-header` + skip-link).
Счётчик совпадения текстов — `node scripts/od-fidelity.mjs http://127.0.0.1:39236 th`:
**54/167 = 32 %** на старте полосы → **75/167 = 45 %** после hero → **80/167 = 48 %** после шапки.
Оставшиеся 87 строк разложены по полосам тем же скриптом: `uni-products` 20, `uni-knowledge` 19,
`uni-cases` 9, `uni-sigen` 9, `uni-contact` 9, `uni-footer` 12, `uni-steps` 6, `uni-systems` 3 — это задачи
23–25, а не текст-в-тексте.

### Замороженный макет рисовался без своих токенов, и прежние сверки были сняты по нему

`<link rel="stylesheet" href="tokens.css">` (строка 9 макета) указывал на файл, который в `docs/design/opendesign/`
не попал — он лежал в репозитории как `approved-tokens.css`, но не под тем именем. Итог: при локальном рендере
эталона каждая декларация с `var(--sp-*)`, `var(--btn-*)`, `var(--radius-*)` молча отваливалась.
Промерено на `.bar`: `gap=normal` вместо `12px`, у `nav--inline a` `pad=0px` вместо `12px`, шапка на телефоне
92 px вместо 138 px. То есть **hero был «подтверждён равным» макету, который рисовал себя сломанным.**

Правка: `cp approved-tokens.css tokens.css` рядом с макетом (9 396 B). После этого эталон рисует шапку
`77 px` десктоп / `138 px` телефон — ровно столько же, сколько живая страница, и `.ch-grid` на телефоне
350 px там и там. Все числа этой секции сняты заново, уже с токенами.

Слепое пятно инструмента осталось: `scripts/od-style-sync.mjs` читает только inline `<style>` макета
(39 270 B → `approved-style.css`), а `.btn { min-width: var(--btn-h); border-radius: var(--radius-base) }`
живёт в `tokens.css`. Контракт «297 правил · 0 отсутствуют · 0 расходятся» этого не видит.

### `.wrap` на телефоне был шире approved на 8 px

В `globals.css` с довоенных времён (порт до OpenDesign) лежало `@media (max-width: 640px) { .wrap { padding: 0 var(--sp-4) } }`
— 16 px. У макета такого оверрайда нет: gutter остаётся `clamp(20px, 4vw, 48px)` = 20 px и на 390.
Замер: `nav.nav--strip` 358 px против 350 px у эталона. Оверрайд удалён
([globals.css:286](file:///K:/code/tawanpower/src/app/globals.css#L286)) — теперь каждая телефонная
полоса стала на 8 px уже, как в макете. `od-style-sync` этого поймать не мог: правило сравнивает только то,
что есть в макете, а здесь лишнего правила не стало.

### Шапка: гамбургера больше нет, тема пошла через next-themes

[components/landing/Header.tsx](file:///K:/code/tawanpower/src/components/landing/Header.tsx) переписан
под `uni-header`: skip-link → `.bar` (логотип `S1` + `nav--inline` из 6 ссылок + `spacer` + выбор локали +
кнопка темы + CTA) → вторая строка `nav--strip` из 9 ссылок. Мобильного меню в макете нет, поэтому
`mobileOpen`/`Menu`/`X` удалены из `LandingShell` вместе с пропсами.

Кнопка темы до этого жила своей жизнью: `document.documentElement.classList.toggle('dark')` +
`localStorage.setItem('theme', …)`. Провайдер `next-themes`
([layout.tsx:127](file:///K:/code/tawanpower/src/app/layout.tsx#L127), `attribute="class"`) держит тот же
ключ и тот же класс, поэтому после клика на `<html>` оставалось **`class="light dark"`** — провайдер считал,
что светлая тема включена, а CSS уже рисовал тёмную. Сейчас контрол ходит через `useTheme()`, и промер после
клика даёт `before=light after=dark ls=dark`, то есть один класс вместо двух.

### Телефонная строка шапки не влезала: CTA уезжал за край

Замер по детям `.bar` на 390 ([shots/tmp-fit.mjs](file:///K:/code/tawanpower/shots/tmp-fit.mjs),
вывод — `shots/tmp-fit.mjs` печатает построчно):

```
mock  logo x=20..185 · theme 209..253 · theme 265..309 · cta x=321..370 w=49 TEXT-SPILL +13
live  logo x=20..185 · locale 209..273 · theme 285..329 · cta x=341..447 w=106   (barScrollW=447)
```

У макета CTA сжимается до своего `min-width: var(--btn-h)` = 48 px и текст вылезает за пилюлю на 13 px;
у нас `min-width` не перенесён (он в `tokens.css`, см. выше), поэтому кнопка держит min-content 106 px и
уезжает за вьюпорт — `body { overflow-x: hidden }` прячет это, а не чинит. Свободного места в строке на 390
просто нет: 350 px против 165 (логотип) + 64 (локаль) + 44 (тема) + 36 (гепы) + 106 (CTA) = 415 px.
Решение — на ≤640 скрывать текстовую часть логотипа, а не CTA
([globals.css:1296](file:///K:/code/tawanpower/src/app/globals.css#L1296)): у макета есть
`@media (max-width: 640px) { .header-cta { padding: 0 var(--sp-4) } }`, то есть автор собирался оставить кнопку.
После правки: `logo 20..62 · locale 100..164 · theme 176..220 · cta 232..370 w=138`, `barScrollW=390`,
вылезающего текста нет. `TH`-пилюля шире макетных 44 px (64 px) — это `<select>` с 8 локалями вместо
трёхпозиционного переключателя из макета; класс `.locale-btn` заведён рядом
([globals.css:1276](file:///K:/code/tawanpower/src/app/globals.css#L1276)).

### Тексты шапки сняты с макета по кодам, а не на слух

`en/ru/th` вытаскиваются из `data-en|data-ru|data-th` атрибутов программно
([shots/tmp-header-patch.mjs](file:///K:/code/tawanpower/shots/tmp-header-patch.mjs)) — в тайском
`แค็ตตาล็อก` стоит mai tung-kan ok на ы, что легко потерять при наборе; `navCatalog` в словаре был
`แคตตาล็อก` без него. `de/fr/ja/ko/zh-CN` в макете не заданы (атрибутов нет) — их авторизовал я, короткими
формами, чтобы в `nav--strip` не было двух одинаковых меток (в `en` это `Work` и `Cases`).
Записано `scripts/i18n-set.mjs` (96 ключей), паритет ключей 8 локалей проверен: 1113 ключа, 0 расхождений.

`header.*` читает не только лендинг: тот же namespace использует
[components/layout/Header.tsx:12](file:///K:/code/tawanpower/src/components/layout/Header.tsx#L12),
то есть `/cases`, `/blog`, `/chat` получили те же короткие метки и новый `brandTop` («Krabi · Solar installer»).
Это осознанно: метки стали короче, а не изменили смысл.

### Тёмная тема: что она показала на неперенесённых полосах

Скан по закрашенным блокам при `html.dark`
([shots/tmp-dark-light.mjs](file:///K:/code/tawanpower/shots/tmp-dark-light.mjs), 1280):

```
1x  area<=1021907  #contact   :: section section--cream = rgb(255,247,237)
1x  area<= 907247  #knowledge :: section section--cream = rgb(255,247,237)
8x  area<=   37800  #systems  :: product-photo        = rgb(255,255,255)
```

Две светлые острова — легасо-класс `.section--cream`, которого в макете нет; у макетного
`section.block--cream` тёмный вариант есть (`globals.css:1310`). Обе полосы уходят в задачи 24 и 25, где
переписываются на `block--cream`, и островки исчезают вместе с переносом. Белые `.product-photo` — не дефект:
макет сам держит `background: #fff` и в тёмной теме (строка 169), меняя только цвет иконки.
В `ROADMAP` это уже стояло как «мелочь по вёрстке»; теперь контрол темы реально кликабелен, так что
косметика стала видимой.

### Регрессия после полосы

`node scripts/landing-shots.mjs --base http://127.0.0.1:39236` (свидетель — `shots/tmp-shots5.txt`,
кадры `shots/landing/{phone,desktop}-header.jpeg`): телефон `overflowX 0 · headers 1 · footers 1 ·
broken 0 · console errors 0`, высоты `header=138 hero=933 segments=1163 systems=6445 cases=1675 sigen=1000
steps=1034 knowledge=1117 contact=1055`; десктоп `−6 / 1 / 1 / 0 / 0`, `header=77 hero=707 systems=2077`.
`npx tsc --noEmit` — 0, `next lint` по 4 изменённым файлам — 0, `od-style-sync` — 297 правил в объёме,
0 отсутствуют, 0 расходятся, 1 сознательно отказ (`.success|display`).
`page-weight.mjs 390 2 /` — **689 439 B · 37 ссылок · 0 сырых · non-200 0**, цифра не сдвинулась
(шапка картинок не тянет; рост с 469 980 B был в `f3a9dc1`, когда в hero приехали 12 фото ленты).
`low contrast 25` на обоих вьюпортах — те же 25, что и до полосы: `.kicker`/`.lbl`/`.roi` 9–12 px с
`--primary-deep` и `.grad`-заголовки. Все они один-в-один из макета (`.lbl { font-size: 9px; color: var(--primary-deep) }`,
строка 217) — то есть унаследованы от approved-дизайна, а не добавлены портом.
(Позже, в секции «Контраст: два нечитаемых текста», видно: 25 — это потолок среза пробы, а не измерение;
без реза тот же лист даёт 59.)

## Полоса `uni-systems`/`uni-products`: тиры, пилюли, ярлыки карточек (порт :39236)

Счётчик текстов: `node scripts/od-fidelity.mjs http://127.0.0.1:39236 en,ru,th` →
**th 80/167 = 48 % → 94/167 = 56 %**, en 99/166 = 60 %, ru 86/164 = 52 % (свидетели `shots/tmp-fid-th-final.txt`,
`shots/tmp-fid-tier4.txt`). По полосам: `uni-systems` 3 → 0, `uni-products` 20 → 10. Оставшиеся 73 строки:
`uni-knowledge` 19, `uni-products` 10, `uni-cases` 9, `uni-sigen` 9, `uni-contact` 9, `uni-footer` 11, `uni-steps` 6
([shots/tmp-fid-tier3.txt](file:///K:/code/tawanpower/shots/tmp-fid-tier3.txt)).

### Одна категория макета — три разные метки, и их нельзя склеить в один ключ

`products` в макете показывает `All / Home / Business / Hybrid` в пилюлях, `Home · 3–5 kW` в полосе тиров и
`บ้าน · 5 kW` бейджем на карточке. Один ключ на категорию не закрывает все три: в тире диапазон кВт, в бейдже
конкретный размер строки из каталога. Поэтому `seg*` (пилюля/бейдж) и `tier*` (тир) разведены
([SystemsGrid.tsx:12](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L12)),
плюс `unitKw`/`unitKwh` — в русской локали `кВт·ч`, а не латиница, которую несёт поле `battery_capacity`.
73 ключа записаны `scripts/i18n-set.mjs`, паритет: 8 локалей · 1121 ключ · 0 расхождений
(`shots/tmp-keyparity.txt`). `en/ru/th` проверены по кодпоинтам против `data-*` макета
(`shots/verify-tier-labels.mjs` → `shots/tmp-verify-labels.txt`: 24 значения из макета, 32 авторизованы — de/fr/ja/ko/zh-CN
в макете нет). `ctaSystem` был единственным исключением: в макете он «Ask price & installments →» с стрелкой внутри
атрибута, а у меня стрелку добавляет JSX, поэтому сверка по точному совпадению его не находила. Теперь значение —
ровно текст макета без стрелки, и `en/ru/th` дают `MATCH` при склейке `value + ' →'`. Это задевает не только лендинг:
тот же ключ читает карточка товара в чате ([ProductCard.tsx:238](file:///K:/code/tawanpower/src/components/ProductCard.tsx#L238)).

### Рассрочка в макете — не выдумка дизайнера, а то же правило, что уже в приложении

В макете под ценой стоит ฿4 500 / ฿8 550 / ฿16 612,5 / ฿17 212 — рядом с ценами ฿120 000 / ฿228 000 / ฿443 000 /
฿459 000. Перебор дал ровно одно правило, которое воспроизводит все четыре: `цена × 0.9 / 24` (первый взнос 10 %,
24 месяца, 0 %) — `shots/tmp-inst-check.txt` печатает `4500 / 8550 / 16613 / 17213`, то есть макет округлил последние
два вниз. Это то же правило, что уже живёт в тексте LINE-уведомления
([lib/line-product.ts:32](file:///K:/code/tawanpower/src/lib/line-product.ts#L32)) и в старой карточке товара
([ProductCard.tsx:52](file:///K:/code/tawanpower/src/components/ProductCard.tsx#L52)). Значит эту строку можно
считать честно, а не выкидывать: правило вынесено в `installmentThb()`
([systemCard.ts:49](file:///K:/code/tawanpower/src/components/landing/system/systemCard.ts#L49)) и считается от
цены каталога. Округление до целого бата даёт ฿16 613 там, где макет печатает ฿16 612,5 — половины бата не бывает.

### Два дефекта, которые CSS-контракт поймать не мог

Контракт сверяет правила макета с `globals.css`; оба дефекта были вне его поля зрения, потому что макет прав, а
ошибались мы.

1. Карточка товара была `<article className="card product">`. У макета `article.card` (кейсы, статьи) несёт
   `padding: clamp(20px, 2.5vw, 28px)`, а карточка товара — `<div>`, внутренний padding у неё на `.product-body`.
   Итог: 28 px съедено с каждой стороны, CTA перенесло на три строки. Поправка — вернуть `<div>`
   ([SystemsGrid.tsx:96](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L96)).
2. Довоенное правило `.kit-photo { width: 76%; max-width: 260px; max-height: 84%; aspect-ratio: 1/1; filter: drop-shadow(…) }`
   унаследовало свойства, которых макетному `.product-photo img` (`position:absolute; inset:0; width:100%; height:100%`)
   не задано, — и держало фото 260×176 в боксе 282×210, с серой полосой снизу. Блок удалён, причина записана на его месте
   ([globals.css:1045](file:///K:/code/tawanpower/src/app/globals.css#L1045)).

Замер после правки (`shots/tmp-img-cmp.mjs`, 1280, [shots/tmp-img-cmp-final.txt](file:///K:/code/tawanpower/shots/tmp-img-cmp-final.txt)):
`mock box 282x212 · img 282x211 @0` против `live box 281x210 · img 281x209 @0` — ±1 px, `object-fit: contain`,
padding 20 px, `inset: 0` совпадают. Отличие, которое я сознательно оставил: у живого фото `max-width: 100%` из
базового правила `img`, у макета `none`; на геометрию в этом боксе оно не влияет.

### `sizes` пришлось переснять, и страница подорожала

Пока фото было 260×176, оптимизатору хватало `w=256`. Теперь оно заполняет бокс, поэтому `sizes` снят с обмера на
390/700/900/1280 (`shots/tmp-img-{390,700,900,1280}.jpeg`), а не из CSS:
`(min-width: 1100px) 282px, (min-width: 760px) 45vw, 92vw` ([SystemsGrid.tsx:112](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L112)).
Цена честная и записанная: `/` по `page-weight.mjs` **689 439 → 712 860 B** на телефоне 390@2x и
**673 913 → 800 152 B** на 1280@1 (37 ссылок, 0 сырых, non-200 0 — `shots/tmp-weight-tier390.txt`, `shots/tmp-weight-tier1280.txt`).
Это потолок полосы: инструмент заряжает каждому вьюпорту каждый кадр обеих галерей.

### Счётчик тоже врал, и это надо было заметить до гордости за цифру

До правки `od-fidelity.mjs` искал approved-строку простым `includes` по тексту DOM. React разбивает любой узел текста,
собранный из двух выражений, пустым комментарием: `Home<!-- --> · 5 kW`. Такие строки не находились никогда — ни
бейджи, ни CTA со стрелкой. Инструмент теперь снимает комментарии и `script`/`style` перед сверкой
([od-fidelity.mjs:44](file:///K:/code/tawanpower/scripts/od-fidelity.mjs#L44)). На текущей DOM-копии разница
**90 → 94 из 167**, и все четыре строки — `uni-products` (три бейджа и CTA): список печатает
`shots/tmp-fid-attrib.mjs shots/tmp-th.html th`. Разделить прирост на «правка» и «инструмент» точно нельзя: эти четыре
строки рисуются только потому, что в этой же полосе появились бейдж из двух выражений и CTA со стрелкой в JSX, — но
без починки счётчика они остались бы в missing, хотя на экране были. Поэтому в ROADMAP цифра дана как «≤ 4 дал
инструмент, ≥ 10 дали правки страницы».

### Что в этой полосе может закрыть только владелец

Оставшиеся 10 строк `uni-products` — не переводы. Восемь это контент базы: названия наборов в `solar_products` пишут
«โซล่าร์», в макете «โซลาร์», плюс marketing-строки под заголовком (`kit-sub`). Две — числа, которых в каталоге нет:
฿16 612,5 (половина бата) и ฿17 212 (у карточки-гибрида с ценой ฿459 000, а строки с такой ценой в базе нет).

Про тиры отдельная история, и она в пользу того, что макет рисовался по этому же каталогу: три из четырёх цен на
карточках макета (฿120 000 / ฿228 000 / ฿443 000) — реальные строки `solar_products` (5 kW, 10 kW, 20 kW GoodWe),
а вот заголовки полосы тиров (฿89 000 / ฿289 000 / ฿159 000) не совпадают ни с одной из 35 цен
(`shots/tmp-tier-check.txt`). Живая полоса считает `min(price)` по категориям и даёт ฿120 000 / ฿190 000 / ฿375 000,
причём средний тир держится на известной битой строке `ชุดโซลาร์ 100 kW (Huawei)` = ฿190 000 (техдолг п. 4). Цен в код
я не переносил ни в каком виде: правится это в `/admin/products`, не в `SystemsGrid`.

### Регрессия после полосы

`node scripts/landing-shots.mjs --base http://127.0.0.1:39236` ([shots/tmp-shots-tier4.txt](file:///K:/code/tawanpower/shots/tmp-shots-tier4.txt),
кадры `shots/landing/{phone,desktop}-systems.jpeg`, оба `*-console.txt` — 0 байт): телефон `overflowX 0 · headers 1 ·
footers 1 · broken 0 · console errors 0`, `systems=6146`; десктоп `−6 / 1 / 1 / 0 / 0`, `systems=1995`, полоса тиров
читается как `from ฿120,000Home · 3–5 kW | from ฿190,000Business · 10–50 kW | from ฿375,000Premium Hybrid · 5 kW+`.
Фильтр каталога жив: initial 8 → pill «Hybrid» 7 → «Show more (11)» 19. `npx tsc --noEmit` — 0
(`shots/tmp-tsc-tier3.txt`), `next lint` — без новых замечаний (warning на `<img>` в ветке `http` был и до правки),
`od-style-sync` — 297 правил · 0 отсутствуют · 0 расходятся · 1 отказ, `:root` 65/65 идентичны.
14 затронутых ключей `products.*` в 8 локалях просканированы на смешение письменностей — 0 чужих скриптов
(`shots/tmp-script-scan-keys.txt`; для `ja` иероглифы + кана в одной строке — норма, не дефект).
`low contrast 25` — те же унаследованные от макета 25 (25 = потолок среза, см. секцию «Контраст: два нечитаемых текста»).

## Полосы `uni-sigen`, `uni-steps`, `uni-segments` + две общелистевые правки (порт :39236)

### Что перенесено

`SigenSection.tsx` переписан под разметку макета: `section.block#sigen > .sigen > .sigen-grid`, список
`.five` из пяти пунктов, четыре метрики как у макета (`<10ms`, `98.4%`, срок службы, `AI-Ready`) вместо
выдуманного набора «5 kW / 10 kWh», картинка с классом `.sigen-img` на самом `<img>` и три хотспота
(инвертор / батарея / EV) на позициях макета. `StepSection.tsx` — иконки шага 2 (пузырь чата) и шага 3
(круг + человек) из макета, CTA `btn btn--secondary` без `btn--lg` и без стрелки, инлайновые `style`
сняты: `#steps .cta-row { justify-content: center; margin-top: var(--sp-8) }` уже лежит в CSS
([globals.css:1449](file:///K:/code/tawanpower/src/app/globals.css#L1449)).

Тексты: `en/ru/th` подняты дословно из `data-*` атрибутов макета, `de/fr/ja/ko/zh-CN` написаны в той же
длине и регистре. Полоса `steps` — 7 ключей × 8 локалей = 56 строк; `sigenergy` — 16 ключей, из них
четыре новых (`m2label`, `m4label`, `hotInverter`/`hotBattery`/`hotEv` взамен `hotDisplay`/`hotVents`,
`mOutLabel`/`mCapLabel` удалены). Паритет после этих двух полос: **1122 ключа, 0 расхождений**
(`shots/tmp-keyparity.txt`; после segments — **1124**, счётчик вынесен в `scripts/i18n-parity.mjs` →
`shots/tmp-keyparity-3.txt`).

Счётчик: **th 94 → 102 → 108 из 167 (65 %)**, en 111 → 117/166 (70 %), ru 98 → 104/164 (63 %). Полосы
`uni-sigen` (9 строк) и `uni-steps` (6) исчезли из списка missing целиком
(`shots/tmp-fid-sigen.txt`, `shots/tmp-fid-steps-full.txt`). Осталось: `uni-products` 10 (данные),
`uni-cases` 9, `uni-knowledge` 20, `uni-contact` 9, `uni-footer` 11.

### Две общелистевые правки, которые CSS-контракт не видел

Обе живут в `tokens.css`, а `od-style-sync.mjs` сверяет только `approved-style.css` — слепое пятно было
записано ещё раньше, здесь оно стоило двух полос.

1. **`border-radius` кнопки.** `tokens.css:195` даёт обычной `.btn` `var(--radius-base)` = 16 px; пиллу в
   макете носят только явные `.btn--pill`, `.tabs`, `.pills button`, `.seg`. В `globals.css` `.btn`
   доживал с довоенным `--radius-pill` — то есть у **каждой кнопки лендинга** скругление было 999 px
   вместо утверждённых 16 px. Макет против живого: `#steps .cta-row .btn` mock 16 px / live 999 px
   → после правки оба 16 px ([globals.css:210](file:///K:/code/tawanpower/src/app/globals.css#L210)).
2. **Ведущая строка заголовков.** Общий `h1…h6 { line-height: 1.08; letter-spacing: -0.02em }` был довоенным:
   макет задаёт плотный leading только там, где ему надо (`.sec-head h2` 1.08, `.hero-grid h1` 1.0,
   `.pick-head h3` 1.05, `.sigen h2` 1.08, `.foot-cta h2` 1.08), а всё остальное наследует body 1.6.
   Прогнал по всем заголовкам лендинга (`shots/tmp-heading-lh.mjs`): **18 h3 расходились** — mock
   `line-height: 32px · letter-spacing: normal`, live `21.6px · -0.4px` (карточки товаров, кейсов,
   услуг, шагов). Сразу после правки — 13 совпали, 5 осталось (`shots/tmp-fid-heading.txt` →
   `shots/tmp-fid-heading2.txt`): две `#segments h3` и три `#knowledge h3`. Полоса segments починена в
   этом же подходе (см. ниже), и стало **3** — остались только `#knowledge h3` 20 px против 16 px у
   макета (`shots/tmp-fid-heading3.txt`)
   ([globals.css:153](file:///K:/code/tawanpower/src/app/globals.css#L153)).

Внутренние страницы правка не затронула: из 103 тегов `<h1…h4>` вне лендинга (`src/app/**`,
`src/components/{layout,segments}`) только два не несут ни одного класса — оба в `Segments.tsx`, т. е. на
той же полосе; остальные прижимают leading сами tailwind-классами `text-*`/`leading-*`, специфичнее
селектора тега.

### Полоса segments: анатомия, а не текст

Счётчик строк для неё ничего не показал (`uni-segments` и до, и после = 0 missing), потому что тексты
полосы уже были approved-ские ещё в юните 22. Расхождение было в разметке, и live-полоса рисовала
совсем другую карточку:

| Что | макет | было в live | стало |
|---|---|---|---|
| сетка | `.grid2` (1fr 1fr @760) | свой `.picks` (1fr 1fr @900) | `.grid2` |
| заголовок карточки | `.pick-head` = `.pick-ic` (48×48, SVG) + `h3` + `.pick-sub` | `.badge.pick-badge` + `h3` | `.pick-head` с теми же SVG, что у макета (дом / здание) |
| описание | `.pick-desc` (clamp 16→18 px, leading 1.65) | голый `<p>` под `.pick p` (16 px / 1.6) | `.pick-desc` |
| CTA | `.pick-ctas` (сетка, `margin-top: var(--sp-2)`) | `.cta-row` + `btn--sm` | `.pick-ctas`, кнопки без `btn--sm` |
| бизнес-карточка | `.pick--biz` — тёмная панель `linear-gradient(165deg,#2d1a04,#1a0e00)`, белый `h3`, оранжевые галочки | `.pick--featured` — светлая карточка с рамкой 2 px | `.pick--biz` |

Семейство `.pick--biz` (10 правил) было портировано в OD-блок ещё юнитом 18 и **никогда не
использовалось**: компонент не давал карточке этот класс. Плюс довоенный `.pick p { margin: 0;
font-size: var(--text-base) }` при специфичности (0,1,1) побеждал макетный `.pick-sub` (0,1,0) — тот же
капкан, что был с `.kit-photo`. Блок `globals.css:243-248` теперь переписан дословно по макету, а
`.pick h3`, `.pick p`, `.dark .pick ul*`, `.pick--featured*`, `.pick-badge`, `.picks` удалены: под них
не осталось ни одного узла (`shots/tmp-segments-route.html` проверяет классы на живом `/segments`).

Замер `shots/tmp-fid-segments.txt` + разбор `shots/tmp-fid-segments-diff.txt`: 15 узлов полосы
(секция, `.sec-head`, h2, `.grid2`, `.pick`, `.pick-head`, `.pick-ic`, `h3`, `.pick-sub`, `.pick-desc`,
`ul`, `li`, `li::before`, `.pick-ctas`, `.btn`) — **вычисленные значения совпадают все**; расходятся
только ширины на 4–5 px (скроллбар макета) и бокс `#segments` 1169 против 1274 (`.wrap`-конвенция).
`i18n`: `segments.badge` → «Solutions / Решения / โซลูชัน» (вместо выдуманного «Who it's for»), H2
разрезан на `titleA`+`titleB` под `.grad`; у `titleA` собственный пробел в конце — как в `data-en`,
поэтому JSX ничего не добавляет и тайский «เลือกโซลูชันที่เหมาะกับคุณ» не склеивается со знаком пробела.
Паритет: 1124 ключа, 0 расхождений.

### Геометрия полос

`sigen` — `shots/tmp-sigen-cmp.txt`, `steps` — `shots/tmp-fid-steps.txt` и разбор
`shots/tmp-fid-steps-diff.txt` (1280, mock против live). По `steps` совпало всё, включая высоту секции
(694 px в макете и 694 px в живом `landing-shots`); расходятся только ширины на 9 px (у макета скроллбар
не съедает ширину) и сам бокс `#steps` 1169 против 1274 — принятое приложение: каждая секция несёт свой
`.wrap`.

### Вес

`page-weight.mjs`, телефон 390@2x: **712 860 → 714 724 B**, 37 ссылок, 0 сырых, non-200 0
(`shots/tmp-weight-tier390.txt` → `shots/tmp-weight-steps390.txt`, после segments столько же —
`shots/tmp-weight-seg390.txt`). Прирост — 1 864 B на картинке SigenStor (`sizes` переписан под бокс 4/5
макета). Отдельно и честно про цифру в AGENTS.md: baseline 469 980 B замерян до коллажа hero. Разбор
веса по URL (`shots/tmp-weight-sum.cjs` → `shots/tmp-weight-sum-seg.txt`): 12 ссылок ведут в
`/images/crew/` и весят **384 535 B из 714 724 B** (54 %), из них 11 — сам коллаж (382 912 B),
двенадцатая (`sigen-batt.webp`, 1 623 B) относится к полосе sigen. Обсуждать коллаж надо как отдельное
решение, не как следствие этих полос.

### Регрессия

`landing-shots` после обеих полос
([shots/tmp-shots-steps.txt](file:///K:/code/tawanpower/shots/tmp-shots-steps.txt),
[shots/tmp-shots-segments.txt](file:///K:/code/tawanpower/shots/tmp-shots-segments.txt),
оба `*-console.txt` — 0 байт): телефон `overflowX 0 · headers 1 · footers 1 · broken 0 · console errors 0`,
`segments=1074 · steps=1008`; десктоп `−6 / 1 / 1 / 0 / 0`, `segments=774 · steps=694 · sigen=1029`.
Каталог жив: 8 → 7 → 19. `/segments` (тот же компонент) отвечает 200, 138 458 B, классы `pick-head`,
`pick-ic`, `pick-sub`, `pick-ctas`, `pick--biz`, `grid2` на месте (`shots/tmp-segments-route.html`).
`npx tsc --noEmit` — 0 (`shots/tmp-tsc-steps.txt`, `shots/tmp-tsc-segments.txt`), `next lint` — 0 ошибок,
15 warning'ов, набор идентичен прежнему (`shots/tmp-lint-steps.txt` против `shots/tmp-lint-final.txt`,
`diff` пустой), `od-style-sync` — 297 правил · 0 · 0 · 1 отказ. 46 затронутых ключей (`steps`,
`sigenergy`, `products`, `segments`) × 8 локалей на смешение письменностей — 0 дефектов из 368 строк
(`shots/tmp-fid-scan-steps.txt`, `shots/tmp-script-scan-keys.mjs`). `low contrast` — те же 25,
унаследованные от макета (25 — потолок среза пробы, см. «Контраст: два нечитаемых текста»).

### Что нашлось по дороге и остаётся открытым

1. ~~**`:lang(th)` нет в `globals.css`.**~~ → **закрыто тем же юнитом, что его нашёл.** Правило
   (`tokens.css:163`, `approved-style.css:7`: `letter-spacing: 0 !important; word-spacing: 0 !important; line-height:
   var(--leading-relaxed)`) портировано дословно в `globals.css:139`, вместе с пиком дисплейной строки
   `.ch-grid h1:lang(th), .ch-grid h1 :lang(th) { line-height: 1.3 }` (`globals.css:150`) — иначе blanket 1.8
   поднимает 80-px заголовок героя до 144 px на строку и прячет вторую кнопку CTA под `.ai-bar`. Замер, шумовое
   поле 0 px и три запила воспроизводимости — в разделе «Тайский hard rule: правило, которого не видит ни один
   счётчик» ниже (`scripts/thai-unit.mjs`, `shots/thai-rule/`). Из открытых пунктов этого списка снимается и «отрицательный трекинг там, где правило задаётся
   классом» (`.sigen h2`, `.badge`, `.pills button`): `!important` перекрывает их все. Остаётся недостижимым то, что
   пункт 5 выше по тексту: тайские строки из базы без `lang="th"` внутри англо-/русскоязычной страницы.
2. `#knowledge h3` 20 px против 16 px у макета — уйдёт вместе с полосой knowledge. (`#segments h3`
   починен вместе с полосой: h3 встал в `.pick-head`, и макетный leading 1.05 дошёл до него.)
3. `steps.title`, `steps.sub`, `steps.ctaLabel` и теперь ещё `segments.title`, `segments.sub`,
   `segments.tabHome`, `segments.tabBusiness` (7 ключей × 8 локалей = 56 строк) не связаны ни с одним
   файлом: `getTranslations('steps')` берёт `badge, titleA/B, s1t…s3d, cta`, а `segments` —
   `badge, titleA/B` и поля карточек. Это тот же пункт техдолга 7, что и `auth`/`forms`/`layout`: либо
   подключать, либо удалять. `sub` к тому же больше не рисуется: у макета в `#segments` нет `.lede`.

## Полоса `uni-knowledge`: вкладки Q&A вместо превью статей (порт :39236)

### Что перенесено

`src/components/landing/KnowledgeSection.tsx` удалён (`git rm`), на его место встал
[KnowledgeSection.tsx](file:///K:/code/tawanpower/src/components/landing/knowledge/KnowledgeSection.tsx)
(серверная обёртка: `section.block#knowledge > .wrap > .sec-head--center`) и
[KnowledgeTabs.tsx](file:///K:/code/tawanpower/src/components/landing/knowledge/KnowledgeTabs.tsx)
(`'use client'`: `.tabs-wrap > .tabs[role=tablist]` из трёх `button[role=tab]` + три `.tabpanel`, внутри
`div.card.qa` с `h3` и `p.dim`). `page.tsx` меняет только путь импорта, порядок полос на странице не
трогал: у макета `hero → trust → segments → systems → cases → features → sigen → steps → knowledge →
contact`, у живого `/` ровно так же.

Старый компонент читал `blog_posts` (`select slug,title,excerpt,locale … limit 6`, 3 карточки
`.knowledge-card` + CTA `allArticles`). У утверждённой полосы нет ни одного поля, которое можно было бы
в него воткнуть: три темы, девять вопросов и девять ответов существуют только в макете, а таблица
`knowledge` — это RAG-чанки (`id, content, metadata, embedding` из
`supabase/migrations/20260419000000_create_knowledge_table.sql`: ни заголовка, ни категории, ни locale).
Поэтому полоса перенесена статичной, как в макете.

Мёртвый CSS удалён вместе со старым разметом: блок `/* Knowledge base */` (`.knowledge`, медиа-правило
на 900 px, `.knowledge-card`, `.knowledge-card:hover`, `.knowledge-ic`, `.dark .knowledge-ic`,
`.knowledge-ic svg`, `.knowledge-body`, `.knowledge-body h3`, `.knowledge-body p` — 10 правил между
`.case-body .cta-row` и `@keyframes hotpulse`). Макет их никогда не использовал: `.tabs`/`.tabpanel`/`.qa`
([globals.css:1339-1383](file:///K:/code/tawanpower/src/app/globals.css#L1339),
[globals.css:1267-1306](file:///K:/code/tawanpower/src/app/globals.css#L1267),
[globals.css:983](file:///K:/code/tawanpower/src/app/globals.css#L983)) лежали в OD-блоке
неиспользованными с юнита 18 — ровно тот же дефект, что был с `.pick--biz`.

### ARIA-часть шире макета, и это не украшение

JS макета реагирует только на `click`. Живая полоса держит полный паттерн вкладок: roving `tabIndex`
(активная 0, остальные −1), `ArrowRight`/`ArrowLeft` с заворотом, `Home`/`End`, `aria-controls` ↔
`aria-labelledby`, `tabIndex={0}` на панели, имя списка — `aria-labelledby="knowledge-title"` на заголовок
полосы. Атрибут `hidden` на панелях намеренно не стоит: `.tabpanel.is-active { display: grid }` (0,2,0)
перебивает `display: none` из user-agent для `[hidden]`, и показались бы все три панели сразу — тот же
капкан специфичности, что с `.pick p` и `.kit-photo`.

### Тексты

24 ключа `knowledge.*` × 8 локалей = 192 строки (`badge,titleA,titleB,tabSavings,tabTech,tabFaq,q1…q9,a1…a9`).
`en/ru/th` подняты дословно из `data-*` макета — проверено по кодпоинтам, а не на глаз
(`shots/tmp-th-verbatim.mjs` → `shots/tmp-th-verbatim-knowledge.txt`, `shots/tmp-th-hex.mjs`):
**24/24 тайских значения побитово совпадают с `data-th` полосы**, разбивка по панелям тоже взята из
макета (`savings` 5, `tech` 2, `faq` 2 — `shots/tmp-th-panels.mjs`). `de/fr/ja/ko/zh-CN` написаны в той же
длине и регистре; на смешение письменностей — 0 дефектов из 192 строк
(`shots/tmp-script-scan-knowledge2.txt`).

Из namespace выкинуты 6 ключей старого размета (`tablist,title,sub,loadError,empty,allArticles`) — для
этого `scripts/i18n-drop.mjs` научился удалять одиночный ключ по точке (`knowledge.tablist`), раньше он
умел только целые блоки. Паритет: **1142 ключа · 0 расхождений** (`scripts/i18n-parity.mjs` →
`shots/tmp-keyparity-knowledge.txt`).

Отдельно про свою ошибку: первый вариант полосы вводил новый тайский ключ `knowledge.tablist` — подпись
списка вкладок, которой в макете нет (`.tabs` не несёт ни label, ни заголовка). Слово я придумал сам, и
проверка по кодпоинтам поймала в нём U+0E27 (`ว`) там, где должен быть U+0E2D: тайский, сгенерированный
на слух, утёк бы во все 8 локалей. Ключ удалён, список назван через `aria-labelledby` по заголовку полосы

### Геометрия

`shots/tmp-knowledge-cmp.mjs` → `shots/tmp-fid-knowledge-cmp.txt` и разбор
`shots/tmp-fid-knowledge-diff.txt`: 12 узлов полосы (`#knowledge`, `.sec-head`, `.sec-head h2`,
`.tabs-wrap`, `.tabs`, `[role=tab]`, `[role=tab][aria-selected=true]`, `.tabpanel`,
`.tabpanel.is-active`, `.qa`, `.qa h3`, `.qa p.dim`) + строка контента — **вычисленные значения и высоты
совпадают все**: полоса 771 px в макете и 771 px в живом `landing-shots`, панель 346, карточка 107, `h3`
26 (16 px / leading 25.6 px), `p.dim` 24. Расходятся только ширины, и все они следуют из одной: бокс
`#knowledge` 1169 против 1274 (`.wrap`-конвенция), отсюда 1178 у панели, 583 против 579 у карточки и 541
против 537 у текста. Контент (тексты вкладок, id панелей, разбивка 5/2/2, kicker, h2, первый вопрос и
ответ) — идентичен.

### Счётчик и два побочных эффекта

**th 108 → 128 из 167 (77 %)**, en 117 → 136/166 (82 %), ru 104 → 124/164 (76 %); полоса `uni-knowledge`
исчезла из missing целиком (`shots/tmp-fid-knowledge-final.txt`, `shots/tmp-fid-knowledge-th.txt`).
Осталось: `uni-products` 10 (данные), `uni-cases` 9 th / 10 en, `uni-contact` 9 / 7, `uni-footer` 11 / 3.

1. **Дрейф ведущих строк заголовков стал 0.** Последние три расхождения из п. «Две общелистевые правки»
   были именно здесь: live-rendered `#knowledge h3` 20 px / leading 1.6 против макетных 16 px / 25.6 px.
   Перенос размета в `.qa h3` закрыл их — `shots/tmp-heading-lh.mjs` →
   `shots/tmp-fid-heading5.txt`: `headings live=38 mock=34 · drift=0`.
2. **Светлый остров ещё на одной полосе снят.** `shots/tmp-dark-islands.mjs` →
   `shots/tmp-dark-islands-knowledge.txt`: `knowledge section rgba(0,0,0,0) card rgb(15,23,42) ok`; в
   тёмной теме остался один `LIGHT ISLAND` — `contact rgb(255,247,237)`, он уйдёт с полосой contact.

### Интерактивность

`shots/tmp-knowledge-tabs.mjs` → `shots/tmp-knowledge-tabs3.txt`: клик по трём вкладкам переключает
панель (`savings:5 → tech:2 → faq:2 → savings:5`), видимая панель всегда одна, roving tabIndex едет за
активной, `ArrowLeft` с заворотом с savings → faq, `Home`/`End` → savings/faq, фокус остаётся на вкладке,
`name` списка = «Answers to everything», активная панель подписана `knowledge-tab-faq`. Первая попытка
замера дала ложный «клик ничего не делает»: состояние читалось синхронно сразу после `.click()`, до
re-render'а React — инструмент переписан с `sleep(120)` на действие и ожиданием гидрации по `__react`
-ключам узла.

### Регрессия

`landing-shots` ([shots/tmp-shots-knowledge3.txt](file:///K:/code/tawanpower/shots/tmp-shots-knowledge3.txt),
оба `*-console.txt` — 0 байт): телефон `overflowX 0 · headers 1 · footers 1 · broken 0 · console errors 0`,
`knowledge=949`; десктоп `−6 / 1 / 1 / 0 / 0`, `knowledge=771`, каталог жив (8 → 7 → 19), `knowledge 9
cards · panels 3 (active savings:5)`. Пять проб в харнесе после переноса segments/knowledge молча стали
`MISSING` (они искали `.knowledge`, `.knowledge-ic`, `.picks`, `.pick-badge`, `.pick--featured`) —
переписаны на утверждённую анатомию (`.tabs`, `[aria-selected=true]`, `.tabpanel.is-active`, `.qa h3`) и
дополнены счётчиком панелей: `panels N (active …)` вместо ложных «0 cards».
`npx tsc --noEmit` — 0 (`shots/tmp-tsc-knowledge.txt`), `npx next lint` — 0 ошибок, 15 warning'ов и
набор побитово идентичен прежнему (`shots/tmp-lint-knowledge2.txt` против `shots/tmp-lint-segments.txt`,
`diff` пустой), `od-style-sync` — 297 правил · 0 · 0 · 1 отказ,
`i18n-parity` — 1142 · 0, вес `/` на телефоне **714 724 B, 37 ссылок, 0 сырых, non-200 0** — неизменно
(`shots/tmp-weight-knowledge4.txt`: в полосе картинок нет).

### Последствие, которое надо принять

`/` больше не показывает превью блога: полоса статична, CTA «Все статьи» из неё убрана (в шапке ссылки на
`/blog` остались, в футере — якорь `/#knowledge`). Данные `blog_posts` по-прежнему живые и страница
`/blog` их рисует, но на лендинге их не видно. Если захочется вернуть «живые статьи» в утверждённую
анатомию, это будет не перенос макета, а новый дизайн-запрос в Open Design.

Недостижимый `src/components/KnowledgeGrid.tsx` (п. 8 техдолга) ссылается на 4 ключа, которых теперь нет
(`title`, `sub`, `empty`, `allArticles`) — он и до этого не собирался ни с каким live-боксом, но вместе с
его удалением эти ключи уйдут из обращения совсем.

## Полоса `uni-cases`: карточка кейса по макету (порт :39236)

### Что перенесено

Полоса была портирована по классам наполовину: `.case-stats` (2 правила) и `article.card { padding }`
сидели в OD-блоке ([globals.css:1330-1361](file:///K:/code/tawanpower/src/app/globals.css#L1330),
[globals.css:1428](file:///K:/code/tawanpower/src/app/globals.css#L1428)) и не использовались никем,
`.case-img`/`.case-meta` стояли в разметке, но первое перебивалось довоенным `.case-card .case-img`, а
рисовалась сама карточка из блока `/* Cases */` (8 правил, строки 1095-1138 — удалены):

| Что | макет | было в live | стало |
|---|---|---|---|
| полоса | `section.block#cases` | `section.section--alt` + `.wrap` | `section.block#cases` + `.wrap` |
| сетка | `.grid2` (1fr 1fr @760, gap sp-4→5→8) | свой `.cases` (1fr 1fr @900, gap sp-5) | `.grid2` |
| карточка | `article.card` → `article.card { padding: clamp(20,2.5vw,28) }`, фото внутри карточки | `.card.case-card { padding: 0; overflow: hidden }`, фото в обрез, текст в `.case-body` (padding sp-6) | `article.card` |
| бейджи | `⌖ локация` + `N kW · −68% bill` | `локация` + `N kW` | `⌖ локация` + `N kW` (см. ниже про −68 %) |
| цифры | `.case-stats` — 2 ячейки (`Investment`, `Installed in`), `<b>` с градиентом | `.product-inst` — 3 строки (инвестиции, экономия/год, монтаж) | `.case-stats` |
| CTA | `a.btn.btn--secondary.btn--sm` «Get this system» → `#contact` | `btn--primary btn--sm` → `/cases/{slug}` в `.cta-row`, плюс `.more-row` «Все работы» → `/cases` | как у макета |
| `.lede` | нет | был (`cases.sub`) | нет |

`.more-row`, `.product-inst` и `.state-note` удалены не были: их продолжает использовать `SystemsGrid`.
Состояния (ошибка загрузки, пусто) в полосе остались — макет их не рисует, но правило «явные состояния»
из AGENTS.md сильнее макета в этом месте.

### Тексты

48 значений записано (6 ключей × 8 локалей), 2 ключа удалены (`cases.sub`, `cases.mapLink` — под них не
осталось ни одного узла). `en/ru/th` — **18/18 побитово совпадают с `data-*` полосы**
(`shots/tmp-cases-verify.mjs`), `de/fr/ja/ko/zh-CN` авторские, в той же длине и регистре; на смешение
письменностей — 0 дефектов из 64 строк (`shots/tmp-script-scan-cases.txt`). Паритет: **1140 ключей · 0
расхождений**.

Отдельно: `cases.investment` и `cases.mounting` были правильными по-русски и неточными по-тайски
(«ระยะติดตั้ง» против макетного «ติดตั้ง», «เงินลงทุน» против «งบลงทุน») — то есть ключ жил, но значение
расходилось с утверждённым, и счётчик ловил это как missing-строку полосы, а не как drift значения.

### Геометрия

`shots/tmp-cases-cmp.mjs` → `shots/tmp-fid-cases-cmp.txt` и разбор `shots/tmp-fid-cases-diff.txt`: 15
узлов + строка контента. Совпало всё расчётное: `.sec-head` 760 и `h2` 52/56.16, паддинг карточки,
`.case-img` (16/10, `object-fit: cover`, radius, `margin-bottom`), `.case-meta`, `.case-stats`
(2 колонки, `--card-2`, радиус, паддинг), подпись `.case-stats div span` (10 px / 700 / 0.14em / uppercase),
`div b` (20 px), `.btn--sm` (130 px). **Значения в панели цифр совпали с макетом буквально**: ฿890,000 ·
4 дня и ฿576,000 · 3 дня — две карточки макета нарисованы по этим же строкам `solar_cases`.

Расхождения три, и все из контента, не из разметки:
1. `.card p` 24 px → 190 px: `case_description` в базе — 8 строк тайского, у макета одна строка. Отсюда
   высота полосы 1010 → 1179 и то, что панели цифр у двух карточек больше не на одном уровне. Доводить до
   уровня можно либо данными (укоротить описание), либо `margin-top: auto`, которого в макете нет.
2. `.badge--success` 121 → 59 px: у макета в бейдже `· −68% bill`, а в `solar_cases` нет ни поля
   «процент счёта», ни пред-солнечного счёта, из которого он считается (`savings_annual_thb` — годовой
   эконом-бат, не доля). Придумывать число не стал.
3. `.badge` 65 → 98 px: `⌖ จังหวัดกระบี่` против `⌖ Krabi`.

### Два дефекта, которые счётчик полос не показывает

1. **`scroll-margin-top` у неперенесённых полос.** Прогнал по всем `section[id]` лендинга: у каждой
   `.block`-полосы 84 px, у `#systems` (`section section--alt`) и `#contact` (`section section--cream`) —
   **0 px**. Причина в листе: `.section` ([globals.css:176](file:///K:/code/tawanpower/src/app/globals.css#L176))
   повторяет паддинг `section.block`
   ([globals.css:1247](file:///K:/code/tawanpower/src/app/globals.css#L1247)), но не несёт
   `scroll-margin-top: 84px`. То есть переход по якорю `#contact` — а на него ведёт **каждый** CTA
   страницы — приземляется на 84 px выше, под залипающую шапку. `#cases` этот дефект уже не касается
   (полоса перешла на `.block` в этом юните). Чинить `#systems`/`#contact` одним словом нельзя: у
   макета alt- и cream-полосы не несут `.wrap`, их отступы делает bleed-правило
   ([globals.css:1249](file:///K:/code/tawanpower/src/app/globals.css#L1249)), поэтому это часть
   полосы contact, а не патч в одну строку.
2. **Цвет `.badge--success` расходится с макетом намеренно, и CSS-контракт этого не видит.** Mock
   `rgb(5,150,105)`, live `rgb(4,120,87)`. Это не дрейф, а `--success-ink`
   ([globals.css:23](file:///K:/code/tawanpower/src/app/globals.css#L23)): макетный `#059669` на
   `#ecfdf5` даёт **3.58:1**, что ниже AA для текста 12 px; `#047857` даёт **5.21:1**. Счётчик правил
   здесь молчит в том же слепом пятне, что и с `.btn`: `.badge--success` определён в `tokens.css:255`
   макета, а `od-style-sync.mjs` сверяет только inline `<style>`.

### Регрессия

`landing-shots` ([shots/tmp-shots-cases.txt](file:///K:/code/tawanpower/shots/tmp-shots-cases.txt),
оба `*-console.txt` — 0 байт): телефон `overflowX 0 · headers 1 · footers 1 · broken 0 · console errors 0`,
`cases=1822`; десктоп `−6 / 1 / 1 / 0 / 0`, `cases=1179`; контент-проба `cases 2 cards · broken 0 ·
unresolved 0 · state none`. Проба `.cases` переписана на `#cases .grid2` + `.case-stats` +
`.badge--success` — старая молча стала бы `MISSING` (тот же дефект инструмента, что был на knowledge).
`npx tsc --noEmit` — 0, `od-style-sync` — 297 · 0 · 0 · 1, паритет 1140 · 0, вес `/` на телефоне
**714 724 B, 37 ссылок, 0 сырых** — неизменно (фото карточки шли через оптимизатор и до правки).
Тёмная тема: `cases section rgba(0,0,0,0) card rgb(15,23,42) ok` — полоса перестала быть серым блоком,
как и у макета; светлых островов по-прежнему один (`contact`).

### Счётчик

**th 128 → 133 из 167 (80 %)**, en 136 → 140/166 (84 %), ru 124 → 128/164 (78 %). Из `uni-cases`
осталось 4 строки th — это заголовки и описания двух кейсов (`วิลล่าอ่าวนาง`, `คาเฟ่เกาะลันตา` и их
blurbs), то есть контент базы, а не код: строки из `solar_cases` переведены только по-тайски (п. 5
техдолга). Полос целиком из 10 утверждённых неперенесёнными остались `uni-contact` (9) и `uni-footer`
(11); `uni-products` 10 — тоже данные.

### Что теперь не достижимо с лендинга

Карточка кейса больше не ведёт на `/cases/{slug}`: макет кладёт в карточку одну кнопку — «Get this
system» → `#contact`. Страницы кейса не осиротели (`/cases` ссылается на детали
[page.tsx:102](file:///K:/code/tawanpower/src/app/cases/page.tsx#L102), а `/cases` живёт в шапке и
в `Header.tsx:26`), но путь «увидел кейс → прочитал кейс» с главной теперь длиннее на один клик. Если
нужны оба действия, это либо вторая кнопка в карточке (её нет в макете — значит это новый дизайн-запрос),
либо ссылка на `h3`. Решение за владельцем.

## Полоса `uni-contact` + футер + `.ai-bar` (порт :39236)

### Что перенесено

Полоса и подвал были портированы наполовину в п. 18: семейство `.foot-*` (22 правила) и `.lead-grid`
стояли в OD-блоке без узлов, а рисовались довоенным `section.section--cream` и Tailwind-футером из
`AppShell`.

| Что | макет | было в live | стало |
|---|---|---|---|
| полоса | `section.block.block--cream#contact` (без `.wrap`, bleed-правило) | `section.section.section--cream` + `.wrap` | как у макета |
| заголовок | `.sec-head` → kicker + H2 с `.grad` во второй половине + `.lede` | один `h2` без `.grad`, `sub` отдельным узлом | как у макета |
| сетка | `.lead-grid` (карточка доверия слева, форма справа) | своя сетка на инлайновых `style` | `.lead-grid` |
| доверие | `ul.trust` из 3 пунктов с `.trust-ic` + `.info` с `strong` LINE и `.privacy` | тот же список, но `.privacy` не несла PDPA-строку | как у макета |
| панель успеха | `.success` с `span.badge.badge--success` + `p`, `role=status` | `.success` без бейджа | как у макета |
| подвал | `footer.site-footer > .wrap > .foot-grid` (4 колонки 4fr 2fr 2fr 4fr) + `.foot-base` | Tailwind-футер: `bg-slate-950`, `grid-cols-12`, QR 96 px, `tel:` на нарисованный номер, две disclaimer-строки | `.foot-*` целиком |
| залипающая полоса | `.ai-bar` (672 px, радиус 24, `--primary-deep` кнопка 52×52) | ~40 строк Tailwind-разметки (`.input-glow-container` + `@keyframes shine` + `.input-inner-glass`, высота 80 px) | `.ai-bar` |

Удалено вместе с полосой: `.section--cream` (1 правило), весь блок `/* Sticky ask-bar (LandingShell) */`
(3 правила + keyframe) и его запись в `prefers-reduced-motion`.

### Тексты

138 значений записано, 5 ключей добавлено (`contact.titleA/titleB/hours`, `footer.brandSub/areas`),
5 удалено (`contact.title`, `footer.qrScan`, `footer.disclaimerA/B`, `shell.voiceLabel` — под них не
осталось ни одного узла). `en/ru/th` — **37/37 побитово из `data-*` полосы** (`shots/tmp-contact-verify.mjs`),
`de/fr/ja/ko/zh-CN` — 14 авторских строк в той же длине и регистре, 0 смешений письменностей из 138
изменённых листьев (`shots/tmp-script-scan-contact.txt`). Паритет: **1140 ключей · 0 расхождений**.

Два дефекта, которые я принёс сам и которые поймали собственные же прогоны:

1. **Сущности попали в `messages`.** Экстрактор брал `data-*` как есть, и `shell.stickyTag` стал
   `"AI &amp; support team"` — React печатает это буквально. Поймано сверкой (`NOT-IN-MOCK`),
   экстрактор теперь декодирует `&amp; &lt; &quot; &#39;`; греп по `messages/` показал, что других
   сущностей там нет.
2. **Собственный аппликатор переписал 7 файлов локалей.** Он делал `JSON.parse` → `JSON.stringify(_, 2)`,
   а у каждого файла своя конвенция отступа (th — 1 пробел): в диффе оказалось по 1206 строк на файл
   вместо правки. Откатил `messages/` к HEAD, перенёс те же изменения через `scripts/i18n-set.mjs` и
   `scripts/i18n-drop.mjs` (они вставляют текст, не переформатируя файл), и сверил по листьям с бэкапом:
   **8 локалей × 1140 листьев — идентично**, дифф снова 14–30 строк на файл.

### Три сознательных отступления

1. `.ai-bar` несёт `href="#contact"` (как в макете) как fallback без JS, но по клику открывает
   чат-оверлей. Статичный макет не может прототипировать оверлей; отказаться от него — значит убрать
   главный конверсионный вход лендинга ради буквальности разметки.
2. Ссылки подвала — `/#segments`, `/#systems`, …, а не голые `#…` как в макете: футер общий с
   внутренними страницами (`AppShell`), где якорь без пути ведёт в никуда.
3. `Footer` получил проп `showTheme`. В `Header.tsx` переключателя темы нет, так что кнопка в футере
   была единственным входом к теме на внутренних страницах. Лендинг рендерит `<Footer showTheme={false} />`
   — ровно как макет; внутренние страницы контроль сохранили.

### Слепое пятно счётчика: панель после отправки

Последние 2 строки `uni-contact` («Received ✓», «Thanks — we'll call within 24 hours.») живут в
панели, которой нет в DOM до сабмита, — `od-fidelity.mjs` меряет только спокойное состояние и до них
дойти не может. Проверил иначе (`shots/tmp-success-probe.mjs`), тремя слоями:

1. `--host-resolver-rules=MAP *.supabase.co ~NOTFOUND` — имя прод-базы не резолвится в принципе;
2. заглушка `window.fetch` ставится через `Page.addScriptToEvaluateOnNewDocument`, то есть до того,
   как supabase-js успеет её захватить, и отвечает локально на `rpc/submit_lead`, `/rest/v1/leads` и
   `/api/notify-line`;
3. свидетель — `Network.requestWillBeSent` из CDP: он пишет, что реально ушло из рендерера, а не что
   запомнила заглушка.

Результат (`shots/tmp-contact-success.txt`, скрин `shots/tmp-contact-success.jpeg`): панель есть,
форма ушла, `role=status`, обе строки во всех трёх локалях побитово (`en/ru/th`), тост
`data-type=success`, **реальных запросов к `supabase.co` и `/api/notify-line` — 0**. Покраска панели:
бейдж `rgb(4,120,87)` на `rgb(236,253,245)`, `display:inline-flex`.

Отдельно про скрин: на нём баннер cookies лежит поверх `.ai-bar`. В живом браузере этого нет — при
клипе `captureBeyondViewport` Chrome перерисовывает `position:fixed` со смещением клипа. Замеренные
прямоугольники вьюпорта: `.ai-bar` 802→880, контейнер уведомлений заканчивается на 792, зазор **+10 px**.

Слепых пятен у счётчика теперь три: `tokens.css` (п. 26), подстрока после снятия комментариев (п. 23)
и состояние после отправки (здесь).

### Геометрия и тёмная тема

`#contact` получил `scroll-margin-top: 84px` (проба в `landing-shots`, `shots/landing/desktop.json`) —
полоса перешла на `section.block`, и п. 31 сужается до одной `#systems`. Светлых островов в тёмной теме
не осталось: `contact section rgb(28, 15, 2) [block block--cream]`, и все 9 проверенных полос `ok`
(`shots/tmp-dark-islands-contact2.txt`). Пробы полосы и подвала: `.privacy` 12/20.4, `.foot-grid`
372.7 · 186.3 · 186.3 · 372.7 (= 4fr 2fr 2fr 4fr), `.foot-qr-mini` 70×70, `.foot-contact-card`
`padding: 0` (это и есть правило макета, [approved-style.css:348](file:///K:/code/tawanpower/docs/design/opendesign/approved-style.css#L348)),
`.btn--line` `rgb(6,199,85)` / 44 px, `.ai-bar-inner` 672 / 24 / 28, `.ai-bar-send` 52×52.

### `.foot-cta` — четвёртое пятно, не дефект

8 правил в `approved-style.css` (строки 327-334), **0 в разметке макета**, 4 в `globals.css`, 0 узлов в
`src/`. `od-style-sync.mjs` их не видит, потому что перебирает только классы, которые макет рисует
(«classes used by the mock's markup: 130»), — то есть «0 неопределённых классов» в AGENTS.md надо читать
как «из 130 используемых», а не «из листа». Дописывать 4 недостающих правила для семейства, которое
никто не рендерит, не стал.

### Регрессия (свидетели)

`landing-shots` (`shots/tmp-shots-contact2.txt`, оба `*-console.txt` — 0 байт): телефон
`overflowX 0 · headers 1 · footers 1 · broken 0 · console 0`, `contact=1082 footer=1093`; десктоп
`−6 / 1 / 1 / 0 / 0`, `contact=868 footer=417`; контент-проба `contact 3 cards` (по счётчику `.field` —
его я в этой же правке и добавил, до этого полоса давала 0). `low contrast` — 25, как до правки
(и это тоже потолок среза, не измерение — см. «Контраст: два нечитаемых текста»).
`npx tsc --noEmit` — 0 строк; `od-style-sync` — 297 · 0 · 0 · 1 waived
(`shots/tmp-style-sync-contact.txt`); `label-audit` — «every htmlFor points at an id that exists»;
`orphan-sweep` — 11 файлов / 1067 строк, ни один не осиротел из-за этой правки (в диффе нет ни одного
удалённого импорта из списка).

### Что видит посетитель

- Две disclaimer-строки (`footer.disclaimerA/B` — про оценки экономии и что считает AI) уходят со
  страницы вместе с макетным подвалом. Строки записаны здесь, чтобы их можно было вернуть; их место
  заняла PDPA-заметка из макета.
- `Privacy policy` в подвале больше не ведёт на `/privacy`, которого нет (это был 404 на каждой
  странице) — теперь на `#contact`, где лежит та самая PDPA-строка. Настоящая страница остаётся
  пунктом 3 техдолга.
- Отдельной кнопки микрофона в залипающей полосе нет (у оверлея свой, `SolarChat.tsx:899`).
- `tel:`-ссылка с нарисованным номером `080-XXX-XXXX` убрана: строка телефона теперь скроллит к форме.
- QR в подвале 96 → 70 px (макетный `.foot-qr-mini`).

### Счётчик

**en 140 → 148 из 166 (84 → 89 %)**, ru 128 → 144/164 (78 → 88 %), th 133 → 151/167 (80 → 90 %).
`uni-footer` закрыт целиком (11 → 0), `uni-contact` 9 → 2, и эти две строки доказаны выше — счётчик до
них дойти не может. Из 10 утверждённых полос неперенесённых не осталось; по строкам висит только
`uni-products` (10, и 8 из них — контент базы).

### Вес — поправка к базовой линии

Эта полоса вес не изменила: **714 724 B (390@2x, 37 ссылок, 0 сырых)** и **800 152 B (1280@1)** —
байт-в-байт совпадает с свидетелями тиров и кейсов (`shots/tmp-weight-contact.txt`,
`shots/tmp-weight-contact1280.txt`). Число 469 980 B в AGENTS.md устарело: оно снято до hero-коллажа,
партнёров и тиров, когда ссылок было 25. Ряд: 469 980 → 689 439 (коллаж + партнёры) → 712 860 (тиры) →
714 724 (сейчас).

### Про ссылки на строки в этом файле

Каждая правка CSS сдвигает все ссылки ниже удалённых строк, и секции этого документа заморожены в том
состоянии, в котором их писали. Всего снято **26 строк**: 18 в юните contact (`.section--cream` и весь
блок sticky ask-bar, оба ниже 306-й) и 8 в юните контраст (`.hl { color }` — строки 975-978, эхо `.pick` —
1350-1353, каждое заменено однострочной заметкой). После тайского юнита все ссылки ниже 135-й сдвинуты
на +17 (`shots/tmp-shift-cites.mjs`, 53 ссылки в трёх файлах) и снова стоят на местах: сверка даёт
**23 разрешённых · 9 точных · 14 «off»**, где «off» — шум эвристики «имя класса рядом со ссылкой», а не
разрыв. Актуальные якоря (всего в файле **1439 строки**, сдвиг на **+17** после тайского юнита — `:lang(th)` встал в секцию Reset между 134-й и 135-й):
`.section` — 171, `.pick` — 243-246, `section.block` — 1189, bleed-правило alt/cream — 1191,
`.dark .block--cream` — 1193, `.pick--biz ul` — 1229, маркер `.hl` — 1243, `#steps .cta-row` — 1426.
Проверка: `node scripts/css-cite-audit.mjs` — проходит по `AGENTS.md`, `ROADMAP.md` и этому файлу, для
каждой ссылки ищет имя класса рядом и сверяет с головой правила в CSS; сводка — `shots/css-cite-audit.txt`.

## Контраст: два нечитаемых текста и каскад, который сверка правил не видит (порт :39236)

### Что нашло посетителя

| Место | Что рисовалось | Контраст | Причина |
|---|---|---|---|
| Карта бизнес-сегмента в `#segments` (оба вьюпорта) | строки маркеров ✓ на тёмной карте | **1.06:1** | эхо `.pick ul { color: var(--fg) }` лежало строками 1350-1353 — **после** листевого `.pick--biz ul { color: #e7e5e4 }` ([globals.css:1218](file:///K:/code/tawanpower/src/app/globals.css#L1218)). Оба селектора (0,1,1), решает порядок → тёмная карта получала чернила `#0f172a` на фоне `#1a0e00` |
| Слово в H1 героя («…neighbours,») | `#c2410c` по оранжевому маркеру | **2.19:1** | `.hl { color: #c2410c }` из блока «Invented: no OpenDesign source for these» (строки 975-978) + приехавший из листа маркер `.ch-hero .display .hl { background: … rgb(255 138 0 / 0.5) }` ([globals.css:1232](file:///K:/code/tawanpower/src/app/globals.css#L1232)). Макет красит ту же строку чернилами заголовка по маркеру — **7.56:1** |

Номера строк в таблице — **до** удаления `a2a2837`: правило `.pick` занимало 1350-1353, `.hl` — 975-978.
На их месте теперь две однострочные заметки о том, почему правила нет ([globals.css:1013](file:///K:/code/tawanpower/src/app/globals.css#L1013) и
[:1363](file:///K:/code/tawanpower/src/app/globals.css#L1357)); живые якоря каскада — `.pick` 243-247, `.pick--biz ul` 1231, маркер `.hl` 1245.

Оба — один и тот же класс дефекта, уже виденный в этом-milestone: порт приносит правило макета, а
изобретённая до-макетная правка (или её дубль) остаётся и выигрывает каскад. Эхо `.pick` убрано целиком,
`.hl`-цвет убран целиком (у класса ровно одно место в разметке — [HeroSection.tsx:142](file:///K:/code/tawanpower/src/components/landing/HeroSection.tsx#L142), и оно всегда под маркером).
После правки `.hl` замеряется ровно как в макете: `7.56:1, fg rgb(15, 23, 42) on rgb(255,138,0)`.

### Два новых слепых пятна счётчиков (к четырём записанным выше)

1. **`od-style-sync.mjs` сверяет значения, но не порядок.** Правило `.pick ul` в глобалах и в листе
   идентичны байт-в-байт, поэтому зелёный отчёт «297 · 0 · 0 · 1» жил бок о бок с нечитаемой картой.
   Зелёная сверка по правилам не доказывает, что класс рисует тот же победитель, что и макет.
2. **`landing-shots.mjs` резал список по 25 и печатал длину порезанного куска.** Все `low contrast 25`
   в секциях выше — это потолок среза, а не измерение. То же касалось `tiny`. Теперь оба поля отдаются
   целиком, а в JSON добавлены `lowCount`/`tinyCount`, и консоль печатает именно их.
   Отдельно: `low contrast 0` в `shots/regression-1355.txt` (13:55) — не противоречит нынешним 59: на
   тот момент в глобалах ещё жили изобретённые AA-безопасные значения (`.lbl` — 11 px `#c2410c`,
   4.95:1), а правило-for-rule порт `a3bb10d` 21:42 + `ade9d2b` 22:49 вернул листовые 9 px и
   `--primary` — оттуда и взялись 9–12 px ярлыки в списках ниже.

### Измерительный юнит

Ход по тексту теперь живёт в одном файле и вставляется дословно в обе пробы, чтобы они не могли
разойтись: `scripts/lib/contrast-core.js` (возвращает **все** текстовые листья, отсортированные по
возрастанию контраста, с полями `sec/cls/size/weight/ratio/large/on/fg/text`); `landing-shots.mjs`
применяет порог AA сам. Новый `scripts/contrast-audit.mjs` меряет макет и живую страницу одним ядром и
разкладывает провалы по трём вердиктам:

```bash
node scripts/landing-shots.mjs --base http://127.0.0.1:39236
node scripts/contrast-audit.mjs http://127.0.0.1:39236   # witness: shots/contrast-audit.txt
```

| Вердикт | Что значит |
|---|---|
| SHEET FAILS TOO | макет красит этот же класс в тот же или худший контраст → внешний вид утверждён владельцем |
| WE PAINT IT WORSE | класс в макете есть и проходит → дефект нашего порта, чинить здесь |
| NOT IN THE SHEET | такого узла в макете нет → наша разметка или полоса, которой макет не имеет |

Сопоставление — по `class|weight|size`, при промахе по классу целиком (и строка помечает, где макет
красит этот класс другим весом/размером). Первая версия сверяла строго по `class|weight|size` и
отнесла 7 градиентных половин `.grad` в «NOT IN THE SHEET» — макет их тоже проваливает (1.32:1), просто
его H2 считаются весом 700 (UA-дефолт), а наши — 800.

### Замер после правок (оба вьюпорта совпадают)

```
телефон  390×844  узлов текста: макет 222 · живой 290 | ниже AA: макет 45 · живой 59
десктоп 1280×900  узлов текста: макет 219 · живой 279 | ниже AA: макет 45 · живой 59
                  SHEET FAILS TOO 59 · WE PAINT IT WORSE 0 · NOT IN THE SHEET 0
```

То есть после двух удалённых правил ни одного контрастного дефекта, которого нет в утверждённом макете,
на лендинге не осталось. Что держится из макета (наихудший контраст группы, `xN` — сколько узлов):

| :1 | Узлы | Где | Это макетное |
|---|---|---|---|
| 1.32–1.44 | 7 градиентных halves `.grad` | H2 всех полос | [approved-style.css:57](file:///K:/code/tawanpower/docs/design/opendesign/approved-style.css#L57) `#fb923c → #fcd34d` по белому |
| 1.96 | 4 | `.case-stats b` «฿890 000» | кейс-статистика листа |
| 2.26 | 1 | `.btn--line` в подвале | белый по LINE-зелени `rgb(6,199,85)` |
| 2.66 | 2 | `.foot-base` | серый `#475569` по `#020617` |
| 3.25–3.56 | 9 | `.kicker` 12 px | [approved-style.css](file:///K:/code/tawanpower/docs/design/opendesign/approved-style.css) `--primary-deep` |
| 3.56 | 32 | `.lbl` / `.roi` / `/mo` 9 px в тирах и карточках | `font-size: 9px; color: var(--primary-deep)` |
| 4.24 | 2 | `.foot-contact-card small` | `#64748b` по `#020617` |
| 4.34–4.48 | 2 | `.lede` 16–19 px | `--muted-2` на креме/slate |

Это выбор дизайна, а не порта: менять его против воли владельца я не стал — ниже пункт техдолга с этим
вопросом. Порог в пробе AA (4.5 для текста, 3 для крупного: ≥24 px, или ≥18.66 px и вес ≥700).

### Мелочь, оставленная как есть

- `tiny(<11.5px)` без реза: **80 узлов на телефоне, 72 на десктопе** (в разных прогонах ±2 — зависит от
  того, что ещё не развернулось). Раньше вывод показывал «25».
- `h1..h6 { font-weight: var(--weight-extrabold) }` ([globals.css:156](file:///K:/code/tawanpower/src/app/globals.css#L156))
  против UA-дефолта 700 в макете — это правка всего приложения (затрагивает и админку), а не одной полосы,
  поэтому в этот юнит не вошла; из-за неё же первые прогоны аудита не совпадали по классам.
- Прогон `landing-shots` дважды падал на десктопной фазе с «Detected unsettled top-level await»
  (:247, CDP-ответ не пришёл) — на третий прогон оба вьюпорта отработали чисто, `*-console.txt` 0 байт.
  Это сбой транспорта пробы, не страницы.
- **Наш белый wrapper под всеми полосами.** Цепочка фонов у хиро-`.kicker` (живой): `p.kicker` → `div.ch-grid`
  → `div.ch-hero` → `div.wrap` → `section.block` → `main` — все `rgba(0,0,0,0)`, и первым непрозрачным
  оказывается `div.min-h-screen bg-white` (`rgb(255,255,255)`); у макета та же цепочка доходит до
  `body { background: rgb(248,250,252) }` (`shots/tmp-kicker-bg.mjs`). То есть страницы, которые лист
  оставляет slate-50, у нас рисуются на чистом белом. Это расхождение с макетом по факту, но не дефект
  контраста: для оранжевых чернил белый чуть *выгоднее* slate-50 (`.kicker` 3.56 против макетных 3.25),
  и ниже порога они в обоих случаях. Общим `bg-white` пользуются и внутренние страницы, поэтому это
  отдельное решение, не правка этой полосы.
- Оба замера сняты в светлой теме и в спокойном DOM (тёмная тема и панель после отправки — отдельные
  пробы, см. секции выше).

## Тиры: арифметика сходится, с полос не осталось ничего верстаемого (порт :39236)

Последний шаг порядка владельца — «тиры». Разобрал 10 непройденных строк `uni-products` по одной
причине: разметка, код расчёта или строка базы. Итог: **верстать там нечего, осталось три решения про
данные.** Свидетели: `shots/tmp-tiers-calc.txt`, `shots/tmp-name-cp.txt`, `shots/tmp-fid-tiers-th.txt`,
`shots/tmp-price-list.txt` (35 строк каталога: цены, типы и рассрочки, которые делятся на половину бата).

### Рассрочка: наш множитель ровно листовой, спор только про половину бата

`installmentThb()` ([systemCard.ts:49](file:///K:/code/tawanpower/src/components/landing/system/systemCard.ts#L49)) = `round(price × 0.9 / 24)`,
то есть 10 % первый взнос и 24 месяца без процентов — тот же срок, которым LINE-поток считает с
`lib/line-product.ts:32`. Проверено по парам (цена, рассрочка) на макете и на живой полосе:

| Карта | Цена | Рассрочка в листе | `price × 0.9 / 24` | У нас |
|---|---|---|---|---|
| 5 kW Solar Kit (GoodWe) | ฿120 000 | ฿4 500 | 4 500,00 | ฿4 500 |
| 10 kW Solar Kit (GoodWe) | ฿228 000 | ฿8 550 | 8 550,00 | ฿8 550 |
| 20 kW Solar Kit (GoodWe) | ฿443 000 | **฿16 612,5** | 16 612,50 | **฿16 613** |
| Hybrid 10 kWh (Sigenergy) | ฿459 000 | **฿17 212** | 17 212,50 | строки нет в базе |

Три из четырёх макетных наборов есть в каталоге с **теми же самыми ценами** (120 000 / 228 000 /
443 000), то есть расхождение не в формуле. Четвёртой цены (459 000) в базе действительно нет:
`shots/tmp-price-list.txt` — 35 строк, `type` = accessory 13 / inverter 3 / system 19, все `locale = th`,
и ни одной из четырёх макетных цифр-заголовков (89 000 / 289 000 / 159 000 / 459 000) в списке цен нет.
Само расхождение — в том, что **лист непоследователен сам в себе**:
у 443 000 половину бата печатает («16 612,5»), у 459 000 — отбрасывает («17 212» вместо 17 212,5).
Ни одно правило округления не воспроизводит обе строки сразу. Мы держим целые бат везде
(`money()` в [SystemsGrid.tsx:34](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L34) — `maximumFractionDigits: 0`).
Если понадобится слово в слово как в листе, правило = «печатать хвост, если он есть», и тогда половина
бата появится ещё на пяти из семи остальных видимых карточек (промер по базе: 20 строк из 35, из них
7 систем; `shots/tmp-price-list.txt`).

### Тиры: у нас `min` по системам, у макета — выдуманные числа

Полоса считает `from ฿…` как `Math.min` по **всем** строкам `type = 'system'` этой категории
([SystemsSection.tsx:14](file:///K:/code/tawanpower/src/components/landing/system/SystemsSection.tsx#L14), [SystemsGrid.tsx:26-30](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L26-L30)) —
฿120 000 / ฿190 000 / ฿375 000. Это не опечатка и не разошедшийся источник: сетка показывает 8 карточек
из 19 (`PAGE = 8`, [SystemsGrid.tsx:15](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L15),
остальное открывает `show all`), поэтому заголовок тиры может назвать цену, которой среди видимых восьми
нет — ровно так выглядит ฿190 000 в «бизнес от». Заголовок макета обещает ฿89 000 / ฿289 000 / ฿159 000:
`shots/tmp-tier-check.txt` — «rows priced at those figures: none». И этот заголовок противоречит
собственным карточкам макета: гибридная карта в нём ฿459 000, а тир «Premium Hybrid» — «from ฿159 000».
Минимум по всей таблице (฿4 100 панель, ฿500 коннектор MC4, ฿18 000 инвертор) полоса правильно не
показывает: это не системы. Так что подгонять числа под макет = выдумывать цены, чего я не делаю.
Единственный настоящий дефект данных в этих трёх числах — ฿190 000: строка `Huawei 100 kW`, у которой
в базе цена инвертора вместо комплекта (пункт 4 техдолга).

### Имена и подписи наборов: 8 строк из 10 живут в колонках

`h3` карточки — колонка `name`, `.kit-sub` — колонка `model` ([SystemsGrid.tsx:119](file:///K:/code/tawanpower/src/components/landing/system/SystemsGrid.tsx#L119)).
Значит все 8 «пропущенных» строк — контент, а не разметка, и в en/ru/th они не могут совпасть, пока
у наборов нет локализованных строк (пункт 5 техдолга). Плюс одна деталь по-тайски, которую я до этой
правки в ROADMAP передавал **наоборот**:

```
mock: ชุดโซล่าร์ 5 kW (GoodWe)   … U+0E32 U+0E48 U+0E23   (า + ่ + ร)
live: ชุดโซลาร์ 5 kW (GoodWe)    … U+0E32 U+0E23 U+0E4C   (า + ร + ์)
```

Лишний знак — `่` (U+0E48, mai ek) — в **макете**, база пишет привычное в отрасли «โซลาร์». То есть
расхождение не «база и макет», а «макет и база», и чинить его правкой строки Supabase — это запись в
общий проект, решение владельца. В п. 30 ROADMAP это было написано наоборот; исправлено там же.

### Что осталось от шага «тиры»

Три вопроса владельцу, ни один не решается кодом полосы:
1. `Huawei 100 kW` → ฿190 000 → настоящая цена комплекта (двигает заголовок «бизнес от»).
2. Локализованные `name`/`model` наборов (тогда закроются 8 строк из 10) и выбор написания «โซลาร์»
   против макетного «โซล่าร์».
3. Печатать ли половину бата в рассрочке, как на карточке ฿443 000.

### Регрессия юнита

`od-style-sync` — **297 · 0 · 0 · 1** (`.pick`-блок листа остался verbatim на :226-229, удаления правил
его не касаются); `landing-shots` — телефон `overflowX 0 · headers 1 · footers 1 · broken 0 · console 0`,
`segments=1074 contact=1082 footer=1093`, десктоп `−6 / 1 / 1 / 0 / 0`, `segments=774 contact=868 footer=417`;
свидетели `shots/tmp-shots-contrast.txt`, `shots/contrast-audit.txt`, `shots/tmp-hl-grad.mjs` (проба
`.hl`/`.grad` макет vs живой по одному ядру).








## Тайский hard rule: правило, которого не видит ни один счётчик (порт :39236)

### Что это за правило

`tokens.css:163` — «Thai text: relaxed leading, NEVER letter-spaced — HARD RULE»:

```css
:lang(th) { letter-spacing: 0 !important; word-spacing: 0 !important; line-height: var(--leading-relaxed); }
```

В живом листе его не было вообще. Причина не забывчивость, а форма правила: **селектор без класса**.
`od-style-sync.mjs` берёт из макета инлайн-`<style>` (39 270 B) и те 130 классов, которые разметка
макета реально использует; `approved-style.css:7` — половина hard rule (`letter-spacing: 0 !important`),
и то в блоке, который макет держит для `lang`-атрибутов. `tokens.css` сверка не читает вовсе. Значит
правило из `tokens.css` лежит **вне контракта дважды** — по источнику и по форме селектора. Это седьмое
слепое пятно instruments-ряда; первые шесть записаны выше.

### Что оно делало на живой странице

Тайский — `routing.defaultLocale` (`i18n.ts:6`), то есть дефолтная локаль сайта. Проба
`scripts/thai-unit.mjs` (1280×900, `NEXT_LOCALE=th`, таймеры героя заморожены до загрузки скриптов,
`prefers-reduced-motion: reduce`): **198** родов тайского текста, из них **55 с letter-spacing** —
от `-2.4px` на 80-px заголовке героя до `1.26px` на 9-px ярлыке `.lbl`. После правила — **0**.
Правило меняет трекинг или межстрочный интервал у **157** родов из 198.

| Полоса | Высота без правила | С правилом | Ink (пиксели, которых касается правило) |
|---|---|---|---|
| `#segments` | 788 | 820 (+32) | — |
| `#systems` | 2021 | 2076 (+55) | 9.30 % кадра 1280×900 |
| `#steps` | 708 | 737 (+29) | 5.06 % |
| `#contact` | 896 | 953 (+57) | 20.48 % |
| `footer` | 417 | 420 (+3) | — |
| вся страница | 9964 | 10265 (**+301**) | 6.10 % первого кадра |

Ink считается попарно на одинаковых кадрах (`sharp` → raw RGBA, порог 12): **шумовой пол** — два
кадра одного и того же CSS — **0 px**, и `restored` (вернули лист — сняли — вернули) тоже **0 px** и
**0 родов**. Держится он на трёх запилах, без них числа плывут: `setInterval` героя глушится до
загрузки скриптов, на прогон вешается `*{transition:none!important;animation:none!important}`
(`transition-all` перетягивает и `letter-spacing`, и снимок сразу после подмены листа ловит
`0.34 px` вместо `0` — именно так в одном прогоне «restored» дал 1 род и 238 px), и в `localStorage`
до перехода кладётся `s1-pwa-install-dismissed`: баннер установки PWA встаёт по эвристике Chrome,
поэтому в одних сессиях он есть и это **+3 рода тайского текста** и ещё одна анимация в кадре.

### Почему «побайтово одинаковые JPEG» из прошлого прогона — не опровержение

`landing-shots.mjs` запускает headless Chrome без `--lang`/`--accept-lang`, Chrome шлёт
`Accept-Language: en-US,en`, а `resolveLocale()` в [src/i18n.ts:14](file:///K:/code/tawanpower/src/i18n.ts#L14)
ставит заголовок выше `defaultLocale`. Проверено curl'ом на :39236: `en-US,en;q=0.9` → `<html lang="en"`,
`th-TH,th;q=0.9` → `<html lang="th"`. Значит вся полоса, которую снимает `landing-shots`, — английская,
`:lang(th)` в ней не матчится ни в чём, и идентичные JPEG **подтверждают** вывод, а не опровергают его.
Тайскую пару пришлось снимать отдельной пробой (`scripts/thai-shots.mjs`, ключевое — cookie до
перехода), и она даёт 12/12 разных stills: телефон `hero 908 → 959`, `systems 6290 → 6474`,
`contact 1071 → 1113`.

### Pin героя из того же листа

Одно blanket-правило, без pin, поднимает строки 80-px заголовка с `1.0` до `1.8` = **144 px**, то
есть бокс H1 растёт с 240 px до 432 px. Полоса героя при этом почти не меняется (**711 → 717**),
потому что в `.ch-grid` на 1280 колонка текста центрирована по высоте коллажа (`align-items: center`) — вместо
полосы растёт сама колонка, вниз: `cta-row` уезжает с **709 px на 812 px**, а верх фиксированного
`.ai-bar` — **802 px**. Вторая кнопка CTA (`ดูความคุ้มค่า`, низ 865) оказывается под баром; на
`shots/thai-rule/blanket-only-fold.png` от неё виден только левый край белой пилюли. Утверждённый лист
от этого и защищается: `approved-style.css:74` / mock `:83` — `.hero-grid h1:lang(th) { line-height: 1.3 }`.
В макете оно мёртво **тремя** способами: класс в разметке макета называется `.ch-grid`, сам `<h1>`
запечатан `lang="en"` (mock :441), и в инлайн-листе макета есть только половина про трекинг (`:16`).
Портирован обеими ветками селектора:

```css
.ch-grid h1:lang(th), .ch-grid h1 :lang(th) { line-height: 1.3; }
```

Вторая ветка обязательна: `:lang(th)` матчится и на `<span>`-ы внутри H1, а указанное значение всегда
бьёт наследованное — без неё заголовок оставался на 144 px. Четыре состояния одним прогоном
(`stripPin` вырезает pin отдельно, `LAND`-проба снимает координаты):

| Состояние | H1 line-height | бокс H1 | `cta-row` верх | высота страницы | полоса героя |
|---|---|---|---|---|---|
| ни правила, ни pin | 80 px | 240 px | 709 | 9964 | 711 |
| только blanket-правило | **144 px** | **432 px** | **812** (под баром) | 10271 | 717 |
| только pin | 104 px | 312 px | 745 | 9964 | 711 |
| правило + pin (как в листе) | **104 px** | **312 px** | **750** | **10265** | **711** |

Стоимость pin по высоте страницы — ровно **6 px** (10271 → 10265); всё остальное, что он делает, —
положение строк внутри заголовка и `cta-row` над баром: на паре кадров `blanket-only` vs `rule-on`
pin перекладывает **19.64 %** чернил первого экрана (строки 151..870).

### Что осталось после юнита

1. **Контент базы без `lang="th"` внутри не-тайской локали.** В en и ru на :39236 остаётся по одному
   роду тайского текста (`b.` «4 วัน» в статистике кейса) — правило до него не дотягивается, потому что
   `lang` у узла английский. Это тот же владелец-вопрос, что и пункт 5 (локализованные `name`/`model`):
   либо строим `lang="th"` вокруг тайских колонок, либо закрываем вместе с переводом контента.
2. **`tokens.css:189` `.display:lang(th) { letter-spacing: 0; font-weight: var(--weight-bold) }`** —
   трекинг уже даёт hard rule, а вот `font-weight: 700` не портирован: `h1…h6` в globals держат
   `--weight-extrabold` (800). Это ровно открытый вопрос «800 против 700 из листа», решать надо обоим
   вместе, не здесь.
3. **`.hero-grid` pin в макете мёртв** — если когда-нибудь захотят тайский герой ровно как в макете,
   макет надо чинить первым (там он не рисуется никогда).

### Регрессия юнита

`od-style-sync` — **297 · 0 · 0 · 1** (правило без класса в сверку не входит — см. выше, это и есть
смысл юнита); `tsc --noEmit` — 0; `i18n-parity` — 8 локалей, 1140 ключей, **divergent 0**;
`landing-shots` (английская полоса, правкой не тронута) — телефон `overflowX 0 · headers 1 · footers 1 ·
broken 0 · console 0 · контраст 59`, десктоп `−6 / 1 / 1 / 0 / 0 · контраст 59`, каталог `8 → 7 → 19`;
`css-cite-audit` — **+17 ко всем ссылкам ниже 135-й строки** (правило добавило 17 строк в начало
секции Reset), шов `AGENTS.md` 4 + `ROADMAP.md` 6 + этот файл 43, вне конца файла — **0**.
Свидетели: `shots/thai-rule/unit.txt` и `unit.json` (четыре состояния, `hero stack`-таблица, попарные
ink-диффы), `unit-run.log` — тот же вывод в момент замера, `rule-on-*.png` / `rule-off-*.png` /
`blanket-only-*.png` / `neither-*.png` / `restored-*.png` / `noise-floor-*.png`,
`shots/thai-rule/{before,after}/thai-census.txt`. Проба лежит в [scripts/thai-unit.mjs](file:///K:/code/tawanpower/scripts/thai-unit.mjs)
(раньше — `shots/tmp-thai-unit.mjs`, перенесена, потому что `shots/` в `.gitignore:47` и закоммиченная
команда проверки указывала на файл вне репозитория).

## Мобильный юнит: семь замечаний владельца с телефона (порт 3476, 2026-10-19)

Замер: `feat/landing-redesign`, `npx next dev -p 3476`, chromium (puppeteer-core), вьюпорты 390×844@2x и
1280×900@1x, тайская локаль через cookie `NEXT_LOCALE` (см. «Какой харнесс рендерит какую локаль»).
Все семь пунктов — с телефона владельца, тёмная тема, тайский UI.

### Отступ полос: причина в DOM, и её не видит ни один CSS-счётчик

Макет держит все девять полос внутри одного страничного `<div class="wrap" id="top">` (макет :427→:813),
поэтому `section.block` отвечает только за вертикаль, а цветные полосы выезжают к краям сами
(`margin: calc((100vw - 100%)/-2)`) и возвращают отступ своим паддингом. Живое дерево устроено иначе:
каждая полоса несёт **свой** `.wrap`. Форма разная, бокс тот же — пока полоса про свой `.wrap` не забыла.
Забыли две: `#features` и `#sigen`. `#systems` — наоборот: это цветная полоса, и у неё `.wrap` лишний.

`shots/tmp-before-after.mjs` — тот же DOM, два состояния (перед снят stylesheet-мутацией, `src/` не тронут):

| Узел на 390 | ПЕРЕД | ПОСЛЕ | Эталон (макет) |
|---|---|---|---|
| `#features .sec-head` | L0 R0 **w390** | L20 R20 **w350** | L20 R20 w350 |
| `#features .grid4 > *` (карточка) | L0 R0 w390 | L20 R20 w350 | L20 R20 w350 |
| `#sigen .sigen` (панель) | L0 R0 w390 h1356 | L20 R20 w350 h1420 | L20 R20 w350 h1302 |
| `#sigen .sigen-img` | L33 R33 **w324** h560 | L53 R53 **w284** h560 | L53 R53 w284 h560 |
| `.ai-bar-inner` под реальным `:hover` | `underline` | `none` | правила `a:hover` в листе нет |

Высота панели sigen +118 px против макета — это тайский `line-height: 1.8` (см. предыдущую секцию), не отступ.
Картинка осталась во всю длину бокса и со всеми тремя хотспотами — владелец просил именно это; изменился
только бокс. Побочный эффект: `sizes` переснят по замеру этого бокса (`92vw` → `(min-width:960px) 592px, 73vw`),
и `/` подешевел на те 1 864 B, которые бокс добавлял (714 724 → **712 860 B** на телефоне; на 1280 — без
изменений, 800 152 B, потому что там работает ветка `592px`).

Новый прибор: **[scripts/band-edges.mjs](file:///K:/code/tawanpower/scripts/band-edges.mjs)** —
19 узлов, макет и живая страница одним прогоном, и `GATE - рёбра, отличные от эталона и не заявленные: N`.
На 390: **0** (18 из 19 совпадают, девятое заявлено ниже). На 1280: **0 и ноль заявленных — все 19 рёбер
совпадают с макетом**. Свидетели `shots/band-edges-390.txt`, `shots/band-edges-1280.txt`. Гейт меряет
только `left/right`: ширина и высота вправе отличаться (тайский лид, зажатые описания, реальные строки
каталога), а родителей не сравнивает вовсе — у макета полоса `L20 R20`, у нас `L0 R0` с внутренним `.wrap`,
и это два способа сделать один бокс, а не расхождение.

### Десятая слепая зона: порядок дублей добил второй класс

`«แคตตาล็อกอุปกรณ์ — вложенность по вертикали странная»`. Довоенный блок `.tier-strip` (41 строка, был
:1008…) задавал `.tier-strip { display:grid; gap: var(--sp-3) }` и `.tier-strip__item { flex-direction:
column; background: var(--card); border: 1px solid; border-radius: var(--radius-card) }`. Листовые правила
тиров, лежащие ниже, **ни одного из этих свойств не переопределяют** — поэтому на телефоне полоса
рисовалась как три отдельных карточки с ценой над названием, где у эталона один лист с тремя строками на
одной базовой линии. `od-style-sync` зелёный: он сверяет значения по селекторам и не смотрит, какой дубль
побеждает. Блок удалён, в файле остались правила макета (globals.css:1364-1374) — плюс одно заказное повторение ниже,
`:1380-1382` (п. 37, заявлено в `band-edges.mjs`).

Замер после: `tier strip L20 R20 w350 h232`, `tier item L21 R21 w348 h67` против макета `h217`/`h63` —
`+15`/`+4 px` это тот же тайский лид; `21` вместо `20` — 1 px рамки полосы, ровно как у макета.

### Одиннадцатая слепая зона: вес, а не порядок

`«при ховере подчёркиваются ссылки в инпуте ии»`. Глобальное `a:hover { text-decoration: underline }` —
вес (0,1,1) — било `text-decoration: none` компонентов (0,1,0): не только `.ai-bar-inner`, но и каждую
`.btn`-ссылку и `.tier-strip__item`. В утверждении владельца нет противоречия с листом: **в листе правила
`a:hover` для голого `a` нет вообще**, поэтому дыра не видна ни одному покадровому диффу — сравнивать
не с чем. Правило стало `a:not([class]):hover` (globals.css:169): у ссылок в тексте подчёркивание осталось,
всё, что само себя стилизует, его не получает. Доказательство — не «в idle-состоянии decoration none», а
настоящий `mouse.move` по узлу с `:hover=true` (см. таблицу выше и проверку C ниже).

### Херо: полоса листалась и уводила страницу наверх

`«что-то дрыгается, когда я на середине страницы, бывало перелистывало в начало»`. Причина:
`scrollIntoView({ block: 'nearest' })` проходит по **всем** родительским скроллерам, а `nearest` щадит
только те, что узел уже видят. Пока полоса была в кадре — скроллился только контейнер; как только посетитель
уходил вниз, тот же вызов каждый 5-секундный тик тянул назад страницу. Заменил на запись `scrollLeft`
самого контейнера (+ IntersectionObserver: пока полосы нет в кадре, таймер не крутится вовсе).

**[scripts/mobile-behaviour.mjs](file:///K:/code/tawanpower/scripts/mobile-behaviour.mjs)** печатает
четыре проверки с вердиктами и `GATE - failed checks: 0` (`shots/mobile-behaviour.txt`):

| Проверка | страница | полоса | слайд | декор |
|---|---|---|---|---|
| A · полоса не видна, 2 тика | **0 px** | 0 px | +0 | — |
| B · полоса в кадре, 2 тика | **0 px** | **+609 px** | **+2** | — |
| C · `.ai-bar-inner` / `a.btn` / `.tier-strip__item` под `:hover` | — | — | — | `none` ×3 |
| D · та же DOM проигрывает удалённую строку | **14 514 px** | — | — | — |

D — это доказательство причины, а не симптома: с `scrollIntoView({inline:'center',block:'nearest'})`
страница уезжает с `#contact` (y=15222) на y=708 — ровно то «перелистывало в начало», которое владелец
не мог объяснить. Без пина `prefers-reduced-motion: no-preference` этот прогон мерил бы слайдшоу, которого
нет: headless Chrome отвечает `reduce`, а `useReducedMotion()` выключает все таймеры (первая версия прибора
показала «ничего не происходит» именно так). Пин теперь печатается в каждой строке замера (`"mq":false`).

### Два отступления от замороженного макета, заявленные вслух

1. **Футер в два ряда** (п. 5 заказов): `.foot-col` ниже 900 px становится сеткой 2×2 (globals.css:1306-1309),
   колонка 207 px → **122 px**, ссылка w350 → **w167**, весь подвал влезает в экран. Единственный промер,
   где живое ≠ эталон, и он внесён в `DEVIATIONS` прибора — гейт остаётся нулевым, отступление не теряется.
2. **Кейсы: 3 строки** (п. 4 заказов): `#cases .card > p` зажат (globals.css:1427) — карточка 516 → **610 px**,
   абзац h24 → **h71**. Полный текст остаётся в DOM и на `/cases/[slug]`: зажим прячет стену текста, а 700-символьные
   `case_description` правит только данные (п. 5 техдолга), и решение про текст — по-прежнему владельческое.

На 1280 оба отступления выключены (`@media`), и весь десктоп совпадает с эталоном 19/19.

### Что осталось после юнита

1. Текст кейсов в базе (те же 700 символов на строку) — это данные, AGENTS п. 5; зажим на карточке его только прячет.
2. Маркеров по-прежнему 15 из 34 (`shots/tmp-odid-coverage.txt`): у шести полос (`#segments`, `#cases`,
   `#sigen`, `#steps`, `#knowledge`, и весь поддерево тиров `uni-tier-*`/`uni-cat-pills`/`uni-products`)
   полоса опознаётся только по якорному `id`, поэтому `od-fidelity` не умеет локализовать промах внутри
   полосы. `#systems` юнит приблизил: marker у неё появился, но её 6 подузлов — нет.
3. `band-edges` меряет 19 узлов, а не все: `uni-steps`/`uni-knowledge` проверены по одному узлу, коллаж
   героя на телефоне `w0 h0` **в обоих** целях (у макета он там `display:none`) — это совпадение, а не поломка.

### Регрессия юнита

`tsc --noEmit` — 0; `od-style-sync` — **297 · 0 · 0 · 1** (ни одна правка не тронула значения листовых
правил; удалённый блок был довоенным, а не листовым); `od-fidelity` — th **151/167 = 90 %**, en 148/166 = 89 %,
ru 144/164 = 88 % (проценты не двинулись: правки были про боксы, не про строки); `contrast-audit` —
живой **59** ниже AA, макет **45**, раздел **59 / 0 / 0** на обоих вьюпортах; `landing-shots` — телефон
`overflowX 0 · headers 1 · footers 1 · broken 0 · console 0`, высоты полос `header=138 hero=933 segments=1074
systems=6184 cases=1418 sigen=1414 steps=1008 knowledge=949 contact=1082 footer=917`, `tiny(<11.5px)` **78**;
десктоп `−6 / 1 / 1 / 0 / 0`, `tiny` **70**; `page-weight` — 37 ref / **712 860 B** (390@2x), **800 152 B**
(1280@1), 0 сырых ссылок, 0 не-200; `band-edges` — 0 незаявленных расхождений на 390 и на 1280;
`mobile-behaviour` — 0 упавших проверок; `css-cite-audit` — past end of file **0** (лист 1441 → **1421**
строка, 49 из 60 ссылок передвинуты `shots/tmp-recite.mjs`, две из них — `:1083` — resolving по тексту строки
был невозможен: `font-size: var(--text-xs);` встречается в файле **7 раз**, их наводил вручную на комментарий
`.kit-photo`). Свидетели: `shots/gate-mobile7.log`, `shots/band-edges-{390,1280}.txt`,
`shots/mobile-behaviour.txt`, `shots/before-after-mobile.txt`, `shots/bands/*.png` (шесть полос, макет и
живая страница, плюс верх каждой полосы с выключенным `.ai-bar`), `shots/fidelity-mobile7.txt`,
`shots/weight-mobile7{,-1280}.txt`, `shots/css-cite-audit.txt`.

## Мобильный юнит 2: четыре замечания владельца с телефона (порт 3476, 2026-10-19)

Вторая партия того же дня — пять пунктов, два из которых владелец назвал скриншотом: «там 5в1 на мобиле на
на всю длину + подписи (сделай как десктопе типа)», «из хедера убираем кнопку», «пробуем переклчалку языка
сделать hug content а не большая для всех сраху», «там где таблица … уже лучше но надо еще доработатть»,
«думаю нужен свайп позиций. плюс проверить чтобы фильтры тоже работали». Два решения владелец выбрал сам из
предложенных: какую кнопку убрать из хедера («ประเมินฟรี») и что доработать в полосе тиров («метка под ценой,
как на десктопе»). Пункт про 5в1 отменяет прошлую формулировку этого документа: бокс 284×560 был «ровно как у
макета» **один юнит**, и он же — то, что владелец видел чёрной колонной.

### Как снят «до»

Прежние юниты сравнивали экран с экраном. Здесь оба состояния сняты с **одного DOM**: пять правок этого
юнита заменяются в *скомпилированном* листе (его отдаёт dev-сервер) точечными подстроками на текст из
`git show HEAD:src/app/globals.css`, и наоборот. Заменить файл целиком нельзя: в браузере лежит вывод
PostCSS/Tailwind, а исходник содержит неразвёрнутые `@tailwind`, и страница после такой подмены вышла бы
без стилей — ровно тот «без стилей», который уже описан здесь для service worker. Отсюда урок для
любого будущего «до/после»: **дописывать override в конец листа тоже нельзя** — первая версия прибора вставляла
блок с `field-sizing: auto` последним правилом и молча получала то же значение, что и без revert.

Прибор: `shots/tmp-old-new.mjs <порт> <ширина>` → `shots/tmp-old-new-{390,1280}.txt`. Он печатает
`swaps: … replaced` для всех пяти (иначе строка — не «до»), вычисляемые значения-доказательства
(`field-sizing`, `display` кнопки, `display` полосы, `aspect-ratio` фото, `flex-direction` строки тира,
`display` вордмарка) и пины: `setInterval` героя заглушён до первого скрипта, все transitions/keyframes
выключены на прогон, `s1-pwa-install-dismissed` засеян, `prefers-reduced-motion: no-preference` (иначе
таймеры не идут и прогон мерит пустоту), `NEXT_LOCALE=th` + перезаход, потому что headless Chrome шлёт
`Accept-Language: en-US,en` и без куки весь замер был бы английским.

### 1. 5в1: поля листа ели подписи

Корень не в вёрстке, а в соотношении, которое лист даёт квадрату внутри: `.sigen-img` несёт
`aspect-ratio: 4 / 5` и `min-height: 560px`, фото внутри — квадрат 800×800, `object-fit: contain`.

| 390 px | до | после |
|---|---|---|
| бокс `.sigen-media` / `img` | 284×560 | **284×284** |
| нарисованное фото | 284 внутри 560 | 284 внутри 284 |
| чёрное сверху/снизу | 138 + 138 px | **0** |
| «อินเวอร์เตอร์» | 101..137 — в чёрном | 51..87 — на фото |
| «แบตเตอรี่» | 269..305 — на фото | 136..172 — на фото |
| «ชาร์จ EV» | 446..482 — в чёрном | 208..244 — на фото |
| полоса `#sigen` | 1532 px | 1256 px (−276 = ровно два поля) |

Значит «сделай как на десктопе» — это про **соотношение бокса и фото**, а не про ширину: на 1280 тот же лист
даёт 576×720 вокруг 576×576 (72 px поля), и там все три подписи уже на приборе — `130..166 / 346..382 /
583..619` внутри нарисованного `72..648`. Правка ниже собственного сгиба сетки: `.sigen-img { min-height: 0;
aspect-ratio: 1 / 1 }` (globals.css:1441-1443), поэтому на 1280 в таблице «до» и «после» — одни и те же числа.
Сознательное отступление от макета; `sizes` прошлого юнита описывает ширину бокса, а не высоту, и вес страницы
не двинулся.

### 2. Хедер: кнопка была куплена вордмарком

Владелец выбрал, какую кнопку убрать, — правка не про переполнение, а про обмен. Прибор снял три состояния
одного ряда на 390:

| состояние | логотип | пилюля локали | тема | кнопка | правый отступ |
|---|---|---|---|---|---|
| HEAD (вордмарк скрыт) | 42 px | 62 px | 44 px | 97 px | 20 px |
| HEAD + вордмарк показан | 165 px | 62 px | 44 px | **48 px** | **3 px** |
| рабочее дерево | **165 px** | 44 px | 44 px | 0×0 | 20 px |

То есть ряд никогда не переливался (`overflow-x` 0 во всех трёх), но с вордмарком кнопка сжималась до 48 px,
а правый отступ — до 3 px: предыдущий юнит заплатил за её 97 px текстом «Tawan Power»
(`.logo > span:not(.logo-mark) { display: none }`). Теперь `.header-cta { display: none }` ниже 640
(globals.css:1175), а обход с вордмарком удалён вместе с причиной; листовое медиа-правило
(`padding: 0 var(--sp-4)`) оставлено дословно, потому что именно его сверяет контракт — вырезали, `od-style-sync`
принёс `расшлись: 2`. На 1280 кнопка стоит 97 px, как стояла. Действие не потеряно: оно живёт в херо
(«Meet us on LINE») и в липкой `.ai-bar`.

### 3. Пилюля локали: 62 px обвязки вокруг 20 px текста

`<select>` меряется по **самому широкому** option. С восемью локалями это `日本語` — 48 px текста, — и пилюля
показывала 62 px обвязки вокруг 20 px «TH» у каждого посетителя, на обоих вьюпортах. Теперь
`field-sizing: content` + `width: auto` + `min-width: 44px` (globals.css:1153): 44×44 на 390 и 62 → 44 на 1280,
тач-цель 44 px сохранена. Без объявления Chrome отдаёт вычисленное `field-sizing: fixed` — это и печатает
прибор. В браузере, где свойства нет (Safari/Firefox), остаётся ширина по самому широкому option: широкая
пилюля, а не сломанная.

### 4. Тиры: метка под ценой, как на десктопе

Лист ставит цену и название на одну базовую линию. По-тайски «ไฮบริดพรีเมียม · 5 kW+» — 157 px имени против
141 px цены в 348 px места, и третья строка переносилась **после числа**: `96 px / 2 строки` рядом с `67` и `68`.
Ниже 760 `.tier-strip__item` получает колонку (globals.css:1380-1382) — ту же форму, что у десктопа:

| 390 px | до | после |
|---|---|---|
| строки полосы | 67 / 68 / 96 px | **99 / 100 / 100 px** |
| `.t-name` в строках | 1 / 1 / **2** | 1 / 1 / 1 |
| высота полосы | 232 px | 302 px |
| на 1280 | 107 px, полоса 109 px | те же числа |

Сознательное отступление от макета (его правило — базовая пара на всех ширинах).

### 5. Каталог: свайп вместо стека, и почему 4 кадра «не декодированы»

Восемь карточек по 677 px в одну колонку = 5 416 px прокрутки, полоса `#systems` 6 374 px, страница
17 357 px. Ниже 760 `.products` — снап-ряд (globals.css:558-569): карточка `flex: 0 0 86%` = 301 px,
следующая видна из-за обрезки полосы на 37 px (полоса `20..370`, вторая карточка с 333),
`scroll-snap-type: x mandatory`, `overscroll-behavior-x: contain`, скроллбар скрыт.

| 390 px | до | после |
|---|---|---|
| карточка | 350×677 | 301×700 |
| ширина содержимого ряда | 350 px | 2 492 px |
| полоса `#systems` | 6 374 px | **1 473 px** |
| страница | 17 357 px | **12 180 px** |
| 1280 px | сетка 4 × 284, страница 10 151 px | без изменений |

`mobile-behaviour` F: настоящий touch-драг на 180 px двигает `scrollLeft` 0 → 313, `overflow-x` 0 до и после.
`band-edges` на 390 даёт **0 незаявленных** расхождений и два заявленных (карточка каталога `L20 R69`, футер
`L20 R203`); на 1280 — 0 и 0.

Ленивую загрузку меряли отдельно, и сначала она выглядела поломкой: `landing-shots` на телефоне поднял
`not yet decoded` с 20 до **24**. `shots/tmp-undec.txt` называет узлы вместо догадок — на верху страницы не
декодирован 31: 11 узлов коллажа с боксом `0×0`, 8 кадров снап-полосы героя (302×378, обрезаны справа),
8 карточек каталога `kit-photo` (299×223), 2 картинки кейсов, 1 фото sigen и QR футера. Прирост именно в
каталоге: четыре карточки, которые лежали **ниже** сгиба и попадали в него при прокрутке-свипе, теперь лежат
**рядом** с ним внутри горизонтального скроллера, куда вертикальный свип прибора не заходит. Это не запросы и
не битые картинки: `shots/tmp-swipe-lazy.txt` показывает 2 видимые карточки, обе уже декодированы, карточка,
на которую приехал свайп, декодирована **+2 ms**, а правее — пустой `currentSrc`. Второй урок — про чтение
DOM: `src` у `next/image` это фолбэк на крупнейшего кандидата (3840w), и по нему прибор сначала показал,
что ряд просит 3840w на четырёх карточках; `shots/tmp-sizes.txt` на том же DOM: `cards choosing a candidate
of 1600w or more: 0 / 16`.

### Фильтры: сломанным оказался прогон, не приложение

Первая версия гейта E принесла «3 из 4 пилюль не реагируют». `document.elementFromPoint` в центр пилюли
вернул `<p>` баннера: фиксированные карточки PWA-install и cookie-consent лежат **поверх** строки фильтров,
когда `#systems` пришёл в верх вьюпорта. Прибор сам засеивает оба ключа закрытия в localStorage, центрирует
`.pills` и печатает, по какому узлу случился клик. Замер настоящими тапами (не `el.click()` — результаты
совпали и там и там, `shots/tmp-phone4.txt`):

| пилюля | показано | всего в данных | `aria-pressed` |
|---|---|---|---|
| ทั้งหมด | 8 | 19 | `1000` |
| บ้าน | 1 | 1 | `0100` |
| ธุรกิจ | 8 | 11 | `0010` |
| ไฮบริด | 7 | 7 | `0001` |

Ровно одна нажатая пилюля, каждый бейдж принадлежит выбранной категории, и 1 + 11 + 7 = 19. Что «บ้าน» —
одна карточка, это факт данных, а не фильтра: `categoryOf`
([src/components/system/systemCard.ts:42-46](file:///K:/code/tawanpower/src/components/system/systemCard.ts#L42-L46))
относит к дому **не**-гибридные строки с `power_kw ≤ 5`, и такая в каталоге одна. **Вывод для продукта
остаётся, и он не про CSS**: на телефоне баннеры закрывают живой контент, а не только `.ai-bar`, —
это AGENTS п. 14, решение за владельцем.

### Пять отступлений, и что из них видит прибор

К двум отступлениям прошлого юнита (футер 2×2 globals.css:1306-1309, зажим кейсов :1427) этот юнит добавляет
три: снап-ряд каталога (:558-569), колонка в полосе тиров (:1380-1382), квадрат 5в1 (:1441-1443). Из этих трёх
`band-edges` заявляет только одно — он меряет **рёбра**, поэтому видит карточку каталога, но не высоту фото
sigen и не форму строки тира; эти два отступления живут только в тексте заказа — в ROADMAP п. 37 и здесь.
Всего на 390 прибор печатает два заявленных расхождения (карточка каталога и футер) при **0 незаявленных**.
Двенадцатая слепая зона счётчиков (контракт сравнивает только те свойства, которые макет объявляет, и ничего
не знает про внутренние размеры `<select>`) описана в AGENTS; этот юнит — её первый случай.

### Регрессия юнита

`tsc --noEmit` — 0; `od-style-sync` — **297 · 0 · 0 · 1**; `band-edges` — 390: 0 незаявленных + 2 заявленных,
1280: 0 + 0; `mobile-behaviour` A–F — **0 упавших проверок**, и строка D теперь даёт **9 337 px** вместо
14 514: проигранная повторно `scrollIntoView` уводит страницу с `#contact` на y=708, а разница ровно
5 177 px — столько, сколько этот юнит снял с высоты страницы; A/B/C без изменений (0 px / +609 px и +2
слайда / `none` ×3), E и F написаны здесь. `landing-shots` — телефон `overflowX 0 · headers 1 · footers 1 ·
broken 0 · console 0`, высоты полос `header=138 hero=933 segments=1074 systems=1419 cases=1418 sigen=1138
steps=1008 knowledge=949 contact=1082 footer=917` (было `systems=6184 · sigen=1414`), `tiny(<11.5px)` **78**;
десктоп `−6 / 1 / 1 / 0 / 0`, `tiny` **70**, полосы не двинулись; контраст — живой **59** ниже AA, макет **45**,
раздел **59 / 0 / 0** на обоих вьюпортах (ни одно правило цвета не тронуто); `od-fidelity` — th
**151/167 = 90 %**, en 148/166 = 89 %, ru 144/164 = 88 % (правки были про боксы, не про строки);
`page-weight` — 37 ref / **712 860 B** (390@2x) / **800 152 B** (1280@1), 0 сырых ссылок, 0 не-200, 0
неоптимизированных >150 KB. Свидетели: `shots/tmp-old-new-{390,1280}.txt` (таблицы «до/после» выше),
`shots/tmp-phone2.txt` (тот же замер на dpr 2, оба вьюпорта), `shots/tmp-phone3.txt`, `shots/tmp-phone4.txt`
(фильтры тапами и синтетическим кликом), `shots/tmp-swipe-lazy.txt`, `shots/tmp-sizes.txt`,
`shots/tmp-undec.txt`, `shots/tmp-shots-gate.log`, `shots/tmp-gates3.log`, `shots/tmp-gates4.log`,
`shots/tmp-fidelity3.log`, `shots/tmp-weight-unit37.txt`, `shots/phone2/*.jpeg` (шапка, полоса систем,
5в1, футер, вся страница на 390), `shots/mobile-behaviour.txt`, `shots/band-edges-{390,1280}.txt`,
`shots/css-cite-audit.txt`.

## Мобильный юнит 3: два нижних баннера и мёртвый код (порт 3476, 2026-10-19)

Два хвоста, оба названные владельцу как «решение за тобой»: нижние уведомления, которые на телефоне
накрывали живую полосу (AGENTS п. 14), и мёртвый код, который три юнита подряд лежал в списке задачи
(AGENTS п. 8 и 11). Владелец выбрал «скрывать при первом скролле» и «работаем в коде» — красим и вычищаем.

### Что именно сделано с баннерами

`PwaInstallBanner` и `CookieConsent` — оба `position: fixed` внизу вьюпорта. Гейт поставлен не внутри них,
а на **обёртке** в `LandingShell.tsx`: контейнер получил `data-notices=""` и `display: none` при `scrollY > 8`.
Причина именно такой формы: `beforeinstallprompt` Chrome присылает **один раз на загрузку**, и если бы
уведомление размонтировалось при скролле, слушатель ушёл бы вместе с ним и prompt был бы потерян навсегда.
С `display: none` компоненты остаются смонтированными, поэтому поздний `beforeinstallprompt` (а он приходит
по своему расписанию) всё ещё ловится, а баннер возвращается, если посетитель вернулся наверх — «спрятать»
и «выбросить» здесь не одно и то же. Гейт на обёртке, а не внутри баннеров, закрывает и этот случай.

Принятое владельцем: при `scrollY = 0` стопка стоит на ~y 676–736 и задевает зону hero-CTA. Это не новая
потеря: hero-CTA в этом положении сам лежит под одобренным `.ai-bar` (top ≈ 802), то есть недостижим и без
баннеров — а внизу страницы, где лежат настоящие тапаемые цели, они больше не мешают.

### Проверка G, и ловушка, из-за которой она сначала покраснела

Из `scripts/mobile-behaviour.mjs` снят сидинг `s1-pwa-install-dismissed` и `s1-cookie-consent`: он ровно то,
что этот юнит починил, и оставлять его значило бы заявлять проверку, которая меряет выключенный баннер.
Вместо него — G: вверху `[data-notices]` обязан быть видим и внутри обязан быть диалог cookie; после
`scrollIntoView` на пилюлях обёртка обязана иметь `display: none`, а `document.elementFromPoint` в центре
пилюли — вернуть **саму пилюлю**. Проверять надо `display`, а не отсутствие узла: карточки остаются в DOM,
и `querySelector` их по-прежнему находит — свидетелем это и подтверждается:
`at top {y:0, shown:true, cookie:true}` → `scrolled {y:2960, shown:false, hit:"the pill itself"}`.

Ловушка: первый вариант G ждал фиксированные 1600 мс. Cookie-баннер ставит свой таймер (1200 мс) **после
гидратации**, а гидратация этого лендинга в dev не мгновенна — на холодной сборке `cookie` читался `false`, и
проверка падала на исправном приложении. Заменено на `waitForSelector` с запасом 15 с: прибор не должен
угадывать расписание чужого таймера. Ещё одна, уже про запуск: `node script | Select-Object -First N` в
PowerShell закрывает трубу и **убивает процесс** — прогон оборвался на середине, свидетель остался от прошлого
запуска, и GATE показывал упавшую G при зелёном выводе. Смотреть надо файл, а не голову stdout.

### Побочный эффект: E и F теперь меряют приложение, а не заглушку

Обе проверки каталога раньше шли с сидингом dismiss-ключей — то есть их зелёное было зелёным при
выключенных баннерах. Без сидинга они остались зелёными, и это и есть доказательство починки: все четыре
тапа приходят в пилюлю (`hit=the pill itself`), переключение `aria-pressed` одиночное, категории делят
каталог без пересечений и потерь (`19` = 1 + 11 + 7, где `8 shown` в строке — это свёрнутый список до
клика по «Показать ещё», а `full.n` — полный), а CDP-драг двигает `scrollLeft 0 → 313` при `overflow-x 0`.

### Мёртвый код

`node scripts/orphan-sweep.mjs` → `scanned 226 · reachable 227 · unreachable 3 · unmentioned 0 lines`.
Читать надо графу `unmentioned`: до этого юнита она была **1067 строк**. Удалено 12 файлов: 11 из списка
плюс `LeadForm.tsx` (AGENTS п. 11 — у модалки не было ни одного триггера, её звал `OpenChatButton` за пропом,
которого никто не передавал, а сам `OpenChatButton` не встречался в `src/` вообще). Вместе с формой ушли
18 строк JSX модалки, три поля из значения `ChatContext`, `dynamic()`-импорт в `SolarChat.tsx` и 4 ключа
`shell.*` × 8 локалей: ключей стало **1136** (`i18n-parity`: 8 локалей, divergent 0). Namespace `leadForm`
остался — его читает `ContactSection.tsx:21`, форма, которая на `/` действительно работает.
Три файла остались недостижимыми и остаются намеренно: они упомянуты только скриптами
(`src/lib/solar/loader.ts`, `src/lib/notifications.ts`, `src/worker/index.ts`).

### Регрессия юнита

`tsc --noEmit` — 0; `npm run lint` — exit 0 (только предсуществующие warning'и); `orphan-sweep` — 0 мёртвых
строк; `band-edges` 390 — 0 незаявленных + 2 заявленных (карточка каталога, футер 2×2), 1280 — 0 + 0;
`mobile-behaviour` A–G — **0 упавших**, D по-прежнему 9 337 px (строка не менялась); `i18n-parity` —
1136 / divergent 0. **В `globals.css` не тронуто ни одной строки** — это важно не только для пикселей:
все ссылки `globals.css:NNN` в трёх документах остались на своих местах, `css-cite-audit.mjs` от этого юнита
не меняется. Свидетели: `shots/mobile-behaviour.txt`, `shots/orphans.json`.

### PWA-артефакты: сгенерированное не хранят в git

Тот же юнит закрыл и вторую находку списка. Четыре файла в `public/` (`sw.js` 41 506 B, `workbox-*.js`, `fallback-*.js`,
`swe-worker-*.js` — и пять их `.map`) не рукописные: `next.config.mjs:8` ставит `dest: "public"`, поэтому
`@ducanh2912/next-pwa` перезаписывает их на каждой `next build`, а `:14` выключает плагин в dev. Значит, в дев
отдавалась **закоммиченная** копия — и она прекешировала 407 URL мёртвой сборки `19PGC6szyP6rMPxbM8E2t` (прод —
`zFpWFg7XwIHubrIFuUDfY`); из первых 12 URL манифеста 404 давали все 12, включая оба CSS-чанка. Регистрация воркера живёт
в профиле браузера, поэтому вкладка со старым воркером рисовала лендинг **без стилей**, тогда как чистый профиль по
тому же адресу был в порядке — это и есть тот самый снимок «без стилей».

Восемь шаблонов ушли в `.gitignore`, файлы сняты с учёта (`git rm --cached`) и удалены из рабочего дерева: без удаления
дев продолжал бы отдавать мёртвый манифест статикой, то есть починка была бы только на бумаге. Держащая старая
регистрация получает 404 на первой же проверке обновления и выбрасывается браузером. Прод не затронут: Vercel
перегенерирует все четыре у себя на сборке. Рукописные `public/custom-sw.js` (подключён через
`workboxOptions.importScripts`) и `public/offline.html` остались под git — они не выводятся из конфига, их потерять
нельзя. Ни одна строка кода и ни один класс не изменены, поэтому все счётчики этого документа к юниту отношения не
имеют: гейт здесь — `git ls-files public` (в нём больше нет ни одного генерированного файла) и `git check-ignore -v
public/sw.js`.


## Мёртвый словарь: 47 строк, которые три счётчика считали живыми (порт 3476, 2026-10-20)

Третий хвост списка владельца: 45 имён в `messages/*.json`, у которых нет ни одного читателя. Свести их в кучу
стоило дороже, чем удалить, — поэтому юнит начинается с доказательства, а не с `delete`.

### Сколько именно

**45 имён = 47 строк-значений** на локаль. Расхождение не опечатка: `layout.title` и `layout.description` — не
строки, а объекты по два ключа (`admin`/`public`), поэтому обход «по именам» даёт 45, а обход «по листьям» — 47
(четыре имени `layout` — это шесть листьев).
По namespace: `layout` 4, `auth` 16, `forms` 7, `steps` 3 (`title/sub/ctaLabel`), `segments` 4
(`title/sub/tabHome/tabBusiness`), `knowledge` 11 (`catAll/catSaving/catTech/catFaq/readMore/defaultTitle/
defaultSummary/catGeneral/catDocs/chatTopic/chatAll`). Удалено во всех восьми локалях; три обёртки, оставшиеся
пустыми объектами `{}`, сняты вторым проходом — в каждом файле теперь **29** верхнеуровневых namespace.

### Откуда они взялись

Все 45 пришли одним коммитом `f228782` (2026-10-11, «8-locale frontend…») — словарь «на будущее» из i18n-свепа.
`layout`/`auth`/`forms` не привязывались **ни в одном коммите** истории: `git log -S"Translations('auth')"` по
`src/` пуст, метаданные берёт `meta` (`src/app/layout.tsx:35`), `/login` — тайский хардкод. Остальные 18 имён
умерли позже, когда порт удалил их читателей: `steps.ctaLabel` ← `StepsSection`, `segments.tabHome/tabBusiness` ←
`SegmentsSection`, `knowledge.*` 11 из 17 ← `KnowledgeGrid` (удалены `17c8f0a` 2026-10-18 и `bafe67b` 2026-10-19).
Удаление компонентов JSON не трогает — ключи остались висеть.

### Почему это не видел ни один прибор

`i18n-parity.mjs` сравнивает локали **между собой**: ключ, мёртвый во всех восьми, у всех восьми на месте —
`divergent 0`, зелено. `orphan-sweep.mjs` ходит по графу импортов `src/**`, а `messages/*.json` — данные, не код.
`tsc` и `lint` ключи не валидируют вовсе. Единственный прибор, который мог бы поймать, — парсер самих JSON, и он
воспроизвёл бы ту же слепую зону на динамике (ниже), поэтому новый гейт решено не писать: он дал бы ложное чувство
проверенности там, где проверка — доказательство отсутствия читателя.

### Ловушка первая: однофамильцы

Удалять можно только **внутри шести объектов namespace**, никогда по имени ключа через файл. Живыми остались
`blog.readMore`, `products.catAll`, `products.catHome` и `content.catGeneral`/`content.catTech` — последние два
читает админка постов: `admin/content/posts/page.tsx:76` биндит `content`, а `t(c.labelKey)`/`t(s.labelKey)` на
`:202`/`:219` идут туда. Симметричная ошибка в зеркале: `admin.catGeneral` **не существует** и не существовал, а
`PostEditor.tsx:91,97` спрашивает именно `admin` — то есть рендерит путь ключа. Это предсуществующее, к юниту не
относится (файл нигде не смонтирован), но это ровно тот случай, ради которого нельзя доверять проверке по имени.

### Реестр динамики: 5 → 23

Прежняя сводка «5 динамических вызовов» была занижена грepом. Их **23**: `TIER_KEY`/`SEG_KEY`
(`SystemsGrid.tsx:61,78,101`), `l.key` (`Header.tsx:52,68`, `Footer.tsx:56,63`), `cap` (`HeroSection.tsx:85,188,194`),
`${id}Title|Desc` (`ServicesSection.tsx:48,49`), `key` (`SigenSection.tsx:25`), `p.tab`/`q${n}`/`a${n}`
(`KnowledgeTabs.tsx:55,72,73`), `s${i+1}t|d` (`StepSection.tsx:38,39`), `b${i+1}` (`ContactSection.tsx:87`),
`labelKey`/`descKey` (`admin/content/posts/page.tsx:202,219`, `admin/leads/[id]/page.tsx:204`,
`admin/super/AIConfigTab.tsx:74`). Ни одна из таблиц не адресует удалённые ключи — все закрытые: категории
продуктов, навигация, подписи слайдов, услуги, sigenergy, вкладки Q&A, бюджетные строки формы, категории и стадии
лида. Проверять будущую «мёртвость» надо по таблицам, а не по имени.

### Ловушка вторая: отступ, и как её поймал `git diff --stat`

Первый прогон пересохранил все восемь файлов с отступом в 2 пробела — и `git diff --stat` показал 2350 строк на
файл вместо 61. Причина: у семи локалей отступ **1 пробел** на уровень, у `en.json` — **2**; все файлы LF, без BOM,
с завершающим переводом строки. Откат — `git checkout -- messages`, затем второй прогон определяет шаг отступа по
каждому файлу (`/\n( +)"/`) и печатает его. Без этого «механическая» правка JSON превращается в переформатирование
семи файлов, которое никто не стал бы читать в диффе.

### Что было бы при промахе

`src/i18n.ts` не задаёт ни `onError`, ни `getMessageFallback`: в dev `next-intl` печатает `MISSING_MESSAGE`, в
проде рендерится путь ключа. Откат — revert одного коммита; скрипт печатал удаляемое «имя → значение» построчно,
поэтому восстановление проверяемо, а не «кажется, было так».

### Регрессия юнита

`npx tsc --noEmit` — exit 0; `npm run lint` — exit 0 (только предсуществующие warning'и про `<img>` и
`exhaustive-deps`, 0 ошибок); `i18n-parity` — **8 locales · 1089 keys · divergent 0**; `orphan-sweep` — без
изменений (`unmentioned 0`, три упомянутых только скриптами файла остались). Диф: **8 файлов × 61 строка,
16 вставок / 472 удаления**, 0 изменённых значений, 0 добавленных. Витрина не может измениться по построению —
удалённые ключи не читает ни один вызов, включая 23 динамических, — поэтому кадры и `band-edges` к юниту не
применимы; `css-cite-audit` — тоже, поскольку в этом разделе не появляется ни одной ссылки `globals.css:NNN`
(её и не могло появиться: файл стилей не тронут). Свидетели: `shots/tmp-i18n-drop.txt` (пофайловые числа
1136 → 1089 и полный список 47 удалённых путей), `shots/tmp-gates-i18n.log` (`tsc` + `i18n-parity` +
`orphan-sweep` + `css-cite-audit`), `shots/tmp-lint-i18n.log`.

Ловушка третья, уже у свидетеля: первый счётчик в нём шёл на две глубины и показал «удалено 43» — он не считал
`layout.title.admin`/`layout.description.admin`, лежащие на третьем уровне, да и абсолютные числа занижал
(1122/1079 вместо 1136/1089). Правду сказали развёрнутые в пути ключи: 47, ровно как в отчёте скрипта. Любой
счётчик ключей, который не разворачивает вложенность, врёт — включая тот, что рисует «потолок» в этих документах.

## Позиция каталога: карточка открывает нативный `<dialog>` (порт 3476, 2026-10-20)

Карточка каталога показывала фото, имя, цену и «в месяц», и всё. Что это за позиция — `description` и
`specifications` — лежало только в `/admin`: витрина собирает `SystemCard` из `select('*')` (`src/lib/solar/db.ts:15`),
но в тип `SystemCard` эти две колонки не попадали вовсе. Эталон `main:src/components/ProductDetail.tsx` непригоден
дважды — он тайский хардкодом и считает рассрочку 10 % / 36 месяцев, тогда как лист и `systemCard.ts:49` считают
`price × 0.9 / 24`.

Владелец выбрал вариант «модалка». Взамен своего оверлея — `<dialog>`: `showModal()` сам даёт Esc, ловушку фокуса,
backdrop и возврат фокуса на кнопку, которая его открыла. В `ProductModal.tsx` (116 строк) нет ни одного обработчика
клавиш и ни одного слушателя `focusin`; `SystemsGrid` получил `openCard` и две кнопки — на фото и на имени.

Спеки печатаются те, что есть у строки: `specifications` — свободная мапа, поэтому ключ humanize-ится
(`panel_warranty` → «Panel warranty»), булево рисуется `✓`, пустое/`NaN`/`false` отфильтровано. Это единственный
перевод, и он помечен `ponytail:` (`systemCard.ts:61`): таблица подписей × 8 локалей — решение владельца, а не
пропуск порта, так что новый ключ в базе до неё останется по-английски. На первой карточке — 6 строк.
CTA в модалке стоит **выше** описания намеренно: бокс на телефоне 358×812, содержимое 1030 px, кнопка под текстом
жила бы под фолдом (измерено: CTA `top 499–547` при `vh 844`). `warrantyNote` из модалки удалён — он дословно
повторял две строки её же таблицы; на карточке остаётся.

### Чем доказано

`shots/tmp-modal.mjs` — 9 вердиктов на 1280×900 (en) и 390×844 (th), все PASS: открывается с фото и с имени;
бокс 940×695 и 358×812; фокус входит; 12 Tab ни разу не доходят до контрола страницы; Esc возвращает фокус на
`button.product-photo`; backdrop закрывает; CTA закрывает и уводит на `#contact`; страница 1280/1280 и 390/390;
спек-таблица непустая.

Две ловушки прибора, обе стоили прогонов. `.card:hover { transform: translateY(-6px) }` за 250 ms: `page.click()`
считает точку **до** hover, поэтому клик приходит туда, где карточки уже нет — «клик ничего не делает», пока
харнесс не подождёт 350 ms после `hover()`. И нативный trap паркует один Tab на `body` — это хром браузера, а не
утечка: инвариант «ни один контрол страницы не достижим», а не «фокус не покидает диалог». Скролл у `body` не
блокируется (`overflow` остаётся `hidden auto`) — принято, это нативное поведение модалки.

Отдельно проверено, что имена не переполняют карточку, когда показаны все 19: на 390 самое длинное — 259 px в
301 px, страница 390/390. Именно поэтому `.product-name` — блочная кнопка внутри `h3`, а не инлайн.

### Регрессия юнита

`npx tsc --noEmit` — exit 0; `npm run lint` — 0 ошибок (0 → 2 предупреждения `no-img-element`, ровно на новых
`<img>` для http-картинок, как у соседних файлов); `i18n-parity` — **8 locales · 1089 keys · divergent 0** (новых
ключей юнит не вводит: всё берётся из `products.*` и `common.close`); `band-edges` на 390 — 0 незаявленных
+ 2 заявленных (карточка каталога, футер), на 1280 — 0 и 0; `page-weight` — **712 860 B**, 37 refs, без изменений:
диалог не рендерит ничего до открытия. Лист вырос 1462 → **1488** строк (+26), вставка только в конец, поэтому
`css-cite-audit` не сдвинулся ни на одной прежней ссылке и по-прежнему печатает past EOF **0**.

## Политика и условия: два документа и бокс, который говорит «прочитал» (порт 3476, 2026-10-20)

Форма в `#contact` собирает имя, телефон и бюджет, а политика конфиденциальности была **одной строкой** `contact.desc`
— и ссылка на неё в футере вела на `/#contact`. Это пункт 3 списка «что осталось» и, в отличие от остальных, он
юридический: без опубликованной политики обработка персональных данных в Таиланде не опирается ни на что.

`/privacy` — 10 разделов: контролёр данных, что собираем (имя, телефон, LINE, объект, бюджет, куки
`localStorage`), зачем, правовая база (ม.19 — согласие, ม.24(5) — законный интерес), получатели (Supabase, Vercel, LINE,
монтажники; не продаём и не обмениваем), срок хранения 24 месяца, права субъекта (ม.30–36), жалоба в สคส./PDPC с нашим
ответом за 30 дней, куки и `localStorage` (баннер, тема, язык — рекламных и трекеров нет), дата вступления
`2026-10-20`, версия 1.0. `/terms` — 10 разделов, ключевой: цены, экономия и окупаемость — **оценка, не оферта**, отправка
формы — не заказ, гарантия по карточке позиции.

Оба — самостоятельные `page.tsx`: `AppShell` даёт им хедер и футер, своего chrome у них нет. Тайский и английский стоят
секциями на одной странице (`section[lang="th"]` + `section[lang="en"]`, `prose prose-slate dark:prose-invert
max-w-3xl`), потому что тайский — юридически главный текст для тайского потребителя, а английский — его зеркало. На
остальные шесть локалей они **намеренно не переведены** (`ponytail:` в обоих файлах): переведённый контракт, которого
никто не вычитывал, хуже, чем английский.

Реквизиты владельца стоят **видимыми плейсхолдерами** — `๐-๐๐๐๐๐-๐๐๐๐๐-๐๐-๐ (รอระบุ)` (เลขทะเบียนนิติบุคคล / tax ID),
адрес «จังหวัดกระบี่ ประเทศไทย (รอระบุเลขที่และตำบล)», телефон `080-XXX-XXXX`. Помечены `ponytail:`
(`src/app/privacy/page.tsx:34`): политика, которая никого не называет, политикой не является, и это запрос владельцу, а
не пропуск порта.

### Бокс согласия

Форма — `noValidate`, поэтому HTML-атрибут `required` на чекбоксе это подсказка браузеру (autofill), а гейт стоит в
`handleSubmit`, сразу после проверки телефона: `if (!consent) { setConsentError(true); consentRef.current?.focus();
return; }`. Пока бокс не отмечен, из браузера **не уходит ни один запрос** — это отдельная проверка прибора, а не
следствие.

Запись согласия едет в `notes` строкой `PDPA consent v1.0 — web form, <ISO>` и видна в `/admin/leads`. Это меньше, чем
отдельная колонка `consent`: она требует миграции и смены сигнатуры RPC `submit_lead`, а `notes` уже принимает до 1000
символов (`src/lib/validations/lead.ts`). Помечено `ponytail:` в `ContactSection.tsx`.

Цвет метки — `var(--fg)`, ссылка — `inherit` + подчёркивание, и это не вкус: `--primary` (оранжевый) на белом не
проходит AA, а `--muted` в 12 px — на грани, то есть любое «покрасивее» добавило бы узел в `contrast-audit` и стало бы
новым провалом против макета. Ошибка живёт в `#fConsentError` с `role="alert"`, `aria-invalid` и
`aria-describedby` на боксе.

### Чем доказано

`shots/tmp-consent.mjs` — 9 вердиктов на 1280×900 (en) и 390×844 (th), все PASS: бокс есть, связан с `label` и с
`/privacy`; пустой бокс блокирует отправку (текст ошибки, `aria-invalid=true`, фокус на `fConsent`, `success=false`);
**0 вызовов до согласия**; клик по тексту метки переключает бокс; отмеченный бокс отправляет форму, уходит
`POST /rest/v1/rpc/submit_lead` с `p_notes` = `«PDPA consent v1.0 — web form, 2026-10-19T19:14:44.902Z»` и пинг
`/api/notify-line`; горизонтального скролла нет (1280/1280, 390/390); `/privacy` — оба языка, 20 `h2`, ссылка на
`/terms`; `/terms` — обратная ссылка; на лендинге футер ведёт на `/privacy`, старой ссылки `/#contact` в футере нет.

Dev смотрит в **тот же Supabase, что прод**, поэтому прибор режет сеть в браузере: `*.supabase.co` и `/api/notify-line`
отвечают локально, чтения — `[]`, RPC — строкой, которую никто не сохраняет. Реальной заявки не появляется.

Ловушка прибора стоила одного прогона и стоит того, чтобы её помнить: первый вариант отвечал **одной и той же** фейковой
строкой на любой запрос к Supabase, включая `select('*').eq('phone', …)` — `submitLead()` находил «существующего» лида
по телефону и уходил в UPDATE-ветку: `success:true`, ни RPC, ни LINE-пинга, то есть зелёный тест формы, который ничего не
доказал. Инструмент, подделывающий ответы, обязан отвечать так, как ответила бы база для **каждого** вида запроса.

### Регрессия юнита

`npx tsc --noEmit` — exit 0; `npm run lint` — 0 ошибок; `i18n-parity` — **8 locales · 1092 keys · divergent 0**
(1089 + `leadForm.consentLabel` / `consentLink` / `consentError`); `band-edges` на 390 — 0 незаявленных + 2 заявленных
(карточка каталога, футер), на 1280 — 0 и 0; `mobile-behaviour` A–G — **failed checks: 0**; контраст — 59 живых против
45 у макета, **0 «красим хуже» и 0 «нет в листе»** на обоих вьюпортах; `page-weight` — **712 860 B** без изменений
(страница выросла текстом, ни одной картинки); `globals.css` в этом юните **не тронут**, поэтому `css-cite-audit` не
сдвинулся и печатает past EOF **0**.

---

## Юнит 6 — липкая шапка, заголовок контакта, полка цен (2026-10-20)

Четыре замечания владельца. Три из них — CSS, четвёртое меняет семантику контрола.

**Шапка не липла, и причина не в `z-index`.** `html, body { overflow-x: hidden }` (globals.css:127) и `overflow-x-hidden`
на обёртке лендинга (LandingShell.tsx:119) — каждая из них делает из элемента scroll-container; `position: sticky`
внутри такого контейнера прилипает к **нему**, а он сам не скроллится, поэтому шапка уезжает вместе со страницей.
Оба объявления стали `overflow-x: clip` (scroll-container не создаёт), `hidden` оставлен первой декларацией как фолбэк.
Проверено: `position: sticky`, `top: 0` после `scrollTo(0, 2500)`.

**`--pin-h` — измеренные высоты шапки, а не догадка.** 84 px на десктопе (совпадает с прежним `scroll-margin-top: 84px`),
**140 px** ниже 1080 (шапка = бар + полоса навигации). Первая версия ставила 132 — замер дал 140, пилюли вставали на
8 px под шапку. `section.block` и `.pills` получают `scroll-margin-top: var(--pin-h)`; после правки
`pillsTop = 140 = headerBottom` на телефоне, `84` против `77` на десктопе.

**`tier-strip` — кнопки, а не ссылки.** `<button aria-pressed>`: тап фильтрует каталог (`showAll` сбрасывается) и уводит
к пилюлям под шапкой. Возврат — пилюля `All`; повторный тап недостижим по построению (ряд уже за скроллом), поэтому
toggle удалён: `pickTier` = `setCat(tier)`. Иначе получился бы контрол, который в половине состояний «ничего не делает».

**Гарантия вернулась в диалог** (`warrantyNote`, один `<p class="dim">` в конце тела `ProductModal`): на карточках —
0 строк, в модалке — 1. Владелец: карточка продаёт позицию, диалог её объясняет.

**`#contact .sec-head` центрируется только ниже 760.** Макет оставляет эту голову влево (строка 767) при семи
`sec-head--center` в остальных бандах — это **третье** заявленное мобильное отступление, и единственное, которое
`band-edges` не увидит по природе: центровка `margin: auto` не двигает края (L20 R20 остаются). Десктоп — как в макете.

### Прибор и его ловушка

`shots/tmp-unit6.mjs` — 15 вердиктов × 2 вьюпорта (390×844 th, 1280×900 en), **0 failed**. Ловушка: клик по второму
тиру промахивался — фильтр меняет высоту страницы, smooth-scroll уводит ряд за вьюпорт, `boundingBox()` отдаёт
отрицательный `y`, и `mouse.click` бьёт в пустоту. Лечится `scrollIntoView({block:'center'})`, ожиданием стабилизации
`scrollY` и свежим боксом прямо перед кликом.

### Регрессия юнита

`tsc` exit 0; lint 0 ошибок; `i18n-parity` **1092 · divergent 0** (новых ключей нет); `band-edges` 390 — 0 незаявленных
+ 2 заявленных, 1280 — 0 и 0; `mobile-behaviour` A–G — **failed 0**; контраст 59 живых / 45 у макета, **0 «красим хуже» /
0 «нет в листе»** на обоих вьюпортах; `page-weight` **712 860 B** (юнит — CSS и байты разметки, ни одна картинка не
сдвинулась); `globals.css` 1488 → **1504** строки, вся вставка в конец, поэтому `css-cite-audit` печатает past EOF **0**.


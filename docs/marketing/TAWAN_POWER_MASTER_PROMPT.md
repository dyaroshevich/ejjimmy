# Мастер-промпт: исправление лендинга Tawan Power

> Используется, когда в репозитории есть неработающая страница или «сайт не грузится», а на логах/ошибках виден ругательство от React:
> `useChatContext must be used within LandingShell`.
> Промпт приводит агента к строгому: восстановлению провайдера контекста → чистому `npx tsc --noEmit` → рабочему dev-серверу → HTTP-чекам → итоговому отчёту.

---

## 1. Что пошло не так (контекст, который надо прочитать и дать понимание)

- `FooterSection` вызывал `useChatContext()`, но `LandingShell` никогда не предоставлял `ChatContext`. Из-за этого на **каждом SSR-рендере** `/`, `/chat`, `/cases`, `/segments` и других страниц ловилось исключение:
  - `useChatContext must be used within LandingShell`
  -далее по логу: `MISSING_MESSAGE`/`useChatContext`/`IntlError` — страницы не отрисовывались, «сайт не грузится».
- Правильное решение не «убирать `useChatContext` где угодно» и не «дублировать логин/провайдер на каждой странице». Правильно:
  1. **wrapper-предоставить контекст на верхнем уровне лендинга**, а входные данные перенести в `LandingShell`.
  2. `ChatContextValue` сделать `export`, чтобы тип был импортируемым изсухого модуля.
  3. Убрать дублирующий хук-сайд-эффект (`FooterSection` с `useChatContext`), если таковой существует сразу рядом с подлинным футером.
- После этого надо не «вникнуть, что внизу», а **проверить**:
  1. `npx tsc --noEmit` — чистое TS.
  2. запуск `next dev` — нет строк `MISSING_MESSAGE`, `useChatContext`, `IntlError`.
  3. HTTP: `/` → 200, `/` → 200, остальные маршруты → 200; `/admin` — намеренная редирект (307), не страница ошибки.
- Важно: если в дата-центре уже есть работающий dev-сервер, не перезаписывать его дерьмом — запустить отдельный или правильно изменить порт/конфиг, а не «перезагружать контекст». Жёсткая перезагрузка сервера в отсутствии необходимости не изменяет факт ошибки.

---

## 2. Что нужно сделать (конкретно, без прибивания)

1. Найти, где `ChatContext` предоставляется. В `LandingShell` должно быть:
   - `value: ChatContextValue` (ключи `isChatOpen`, `isFormOpen`, `initialSegment`, `initialAction`, `initialMessage`, `openChat`, `openForm`, `closeChat`, `closeForm`, `setIsFormOpen`, `scrollToSegment`, `segmentsScrollRef`). `openChat/openForm/closeChat/closeForm/setIsFormOpen/scrollToSegment` могут быть заглушками внутри wrapper — главное, чтобы контекст **существовал**, чтобы не падало исключение.
   - `<ChatContext.Provider value={value}>` обёртка над целым лендингом, а не частью одного виджета.
2. Весь лендинг сейчас размазан по нескольким компонентам:
   - `src/app/page.tsx` — `LandingShell` + `HeroSection`, `SegmentsSection`, `SystemsSection`, `CaseSection`, `SigenSection`, `StepSection`, `KnowledgeSection`, `ContactSection`, `FooterSection`.
   - `LandingShell.tsx` — провайдер контекста + `Header` + `children` + `Footer` (подлинный).
   - `ChatContext.tsx` — `ChatContextValue` должен быть `export` (чтобы импортировать извне).
   - `OpenChatButton.tsx` и секции-адаптеры (`SegmentsSection`, `KnowledgeGridAdapter`, `ProductGridAdapter`, `SigenergySectionAdapter`, `SofinModelSectionAdapter`, `StepsSection`) — для локализации должны использовать `useChatContext()`.
3. Если есть `FooterSection` с `useChatContext()`, убрать его (дубль). Подлинный футер — `Footer.tsx` внутри `LandingShell`; он должен получать провайдер. Если же `FooterSection` — это то, что фактически отрисовывает футер, оставить его пустым от `useChatContext`, а футер реализовать в `LandingShell`, использующем `Footer.tsx`. Нельзя парсинг-решеткой идти от `FooterSection` к `LandingShell`.
4. На отладочных/визуальных вещах не редко делается `console.log` или тестовое состояние, которое нужно **убрать перед сдачей** — не оставлять в коде «пока отлаживается», в частности:
   - `console.log('g')`, `console.log('h')`, `g() => 12345` — это не код, это отладка.
   - `const val = 'σεσασσσ';` / `const val2 = '')';` — мусорные строки, должны быть удалены; `<div className='g'></div>` тоже.
5. Не забывать проверку после изменений:
   - `npx tsc --noEmit`
   - `next dev` (через `npx` или через `npm run dev`, подходящий порт/адрес)
   - `curl -s -o /dev/null -w '%{http_code}' http://localhost:3008/` и проверка `200`.
6. Для dev-сервера:
   - не перезаписывать порт, не лезть на `localhost:3001`, если там уже что-то слушает;
   - не запускать новый сервер, если предыдущий рабочий — сначала `pkill -f "next dev"` (при необходимости) и проверять, что порт освободился;
   - после запуска проверять логи цикла: `| grep -E "MISSING_MESSAGE|useChatContext|IntlError"` — отсутствие найденных записей — доказательство того, что ошибка устранена.

---

## 3. Проверки (QA) и критерии успеха

### Критерии «код-ревью»

- [ ] В `LandingShell` есть `<ChatContext.Provider value={value}>` и `value` содержит все ключи контекста.
- [ ] `ChatContextValue` тип экспортируется и импортируется в компонентах, использующих `useChatContext`.
- [ ] В `FooterSection` (если он есть в дереве лендинга) **нет** `useChatContext`; подлинный футер рендерится только в `LandingShell`.
- [ ] Дублирующиеся отладочные `console.log` / мусорные переменные / невалидные JSX-строки удалены.
- [ ] `npx tsc --noEmit` → exit `0`.
- [ ] `next dev` запускается без `MISSING_MESSAGE`, `useChatContext`, `IntlError`.

### Сценарий «сайт грузится»

- [ ] `GET /` → `200`
- [ ] `GET /chat` → `200` (если путь существует и не редирект)
- [ ] `GET /cases` → `200`
- [ ] `GET /segments` → `200`
- [ ] `/admin/*` → `307` (ожидаемая авторизация/редирект, не 500)
- [ ] В логи **не выводится** `useChatContext must be used within LandingShell` и аналогичные ошибки.

### Инструмент чек-листа

- [ ] После запуска dev-сервера выполняется:
  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3008/
  ```
  и результат равен `200`.
- [ ] Для проверки клиентской стороны можно запустить:
  ```bash
  npx tsc --noEmit
  ```
  и посмотреть `exitCode: 0`.

---

## 4. Порядок действий агента

1. Определить зону отвественности: `src/components/landing/LandingShell.tsx`, `src/components/landing/ChatContext.tsx`, `src/components/landing/FooterSection.tsx` (если есть), `src/app/page.tsx` (и `src/app/chat/page.tsx`, если он зависит от `LandingShell`, только если это часть запроса).
2. Посмотреть текущее дерево: где импортируется `useChatContext`, кто пытается «добавить контекст на странице», где виден дублирующийся футер.
3. Сделать минимальные изменения:
   - привязать `ChatContext` к `LandingShell`;
   - экспортировать `ChatContextValue`;
   - убрать дублирующий `useChatContext` (если он есть),
   - удалить отладочные `console.log`/мусор.
4. Запустить проверки:
   - `npx tsc --noEmit`
   - `next dev` (порт/адрес по конфигу)
   - `curl` для маршрутов.
5. Зафиксировать итог **в отчёте**, а не в голосе: что было сделано, что было ошибкой, что было запрошено, и что проверяется.
6. Достичь **финального результата**: в логах чисто, `npx tsc --noEmit` выдаёт `0`, HTTP-чеки показывают `200`, админские маршруты редиректуют, а `useChatContext` не падает.

---

## 5. Отчёт для «старшего товарища»

Сформировать итоговый отчёт в указанной структуре:

### 1) Что было сделано

- `src/components/landing/LandingShell.tsx` — обёртка вокруг всего лендинга в `<ChatContext.Provider value={value}>`, где `value` содержит полный набор `ChatContextValue`.
- `src/components/landing/ChatContext.tsx` — `ChatContextValue` стал `export`, чтобы компоненты могли импортировать тип.
- `src/components/landing/FooterSection.tsx` — удалён `useChatContext()`, вызывавший «использовать `useChatContext` внутри `LandingShell`»; подлинный футер `Footer.tsx` остаётся в `LandingShell`.
- В коде оставлены только нужные штуки: провайдер + `value` + отрисовка хедера, детей и футера, без лишних `console.log`/отладочных переменных.

### 2) Какие типы и служебные ошибки были

- `useChatContext must be used within LandingShell` — хук вызывался вне провайдера; на SSR падал рендер строк `MISSING_MESSAGE`/`useChatContext`/`IntlError` и «сайт не грузится».
- Служебная путаница: `FooterSection` и `Footer.tsx` идентифицировались как один объект; реальная проблема была в том, что `LandingShell` не предоставлял контекст. Решение было именно в `LandingShell`, а не в том, чтобы скрывать `useChatContext` во всем месте.
- Ненужные отладочные записи `console.log`, мусорные строки и невалидный JSX также были удалены.

### 3) Что просил пользователь

- Починить сайт так, чтобы он нормально грузился (первичный запрос/проверка на «не грузится», отсутствие ошибок).
- Поменять легаси-код в одну сторону: найти ошибку, починить её, а не})[дополнить вёрстку «на всякий случай».
- Проверить `npm run dev` / `npx tsc --noEmit` и HTTP-чеки.
- Выдать итог цензурой.

### 4) Какие виды отчёта запрошены

- Полный отчёт по проделанной работе: что изменилось, какие ошибки были найдены и исправлены, что проверено, какой результат квадратный.
- Формат: структурированный отчёт (`Что было сделано / Ошибки / Что запрошал пользователь / Проверки`).

### 5) Как выглядит финал

- `npx tsc --noEmit` → `0` (ошибок типов нет);
- `next dev` запускается, в логах нет `MISSING_MESSAGE`, `useChatContext`, `IntlError`;
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3008/` → `200`;
- `/admin/*` редирект 307, не страница ошибки;
- файлы `LandingShell`, `ChatContext`, `FooterSection` (`Footer`) обновлены согласно вышеописанному.

---

## 6. Правила оформления

- Ответ должен быть аналогичен полученному отчёту, но лаконичнее: сначала указывать, что было найдено / что сделано, потом — как проверялось.
- Не давать «технические комментарии» в комментариях к коду, не нужные в отчёте.
- Проверять выполнение не «по словам агента», а по выходным кодам и HTTP-ответам.

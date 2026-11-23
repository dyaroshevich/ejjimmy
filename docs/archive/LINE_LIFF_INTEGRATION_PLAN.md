# Implementation Plan: TAWAN POWER LIFF Integration

This plan outlines the integration of the TAWAN POWER website/chat with the LINE Front-end Framework (LIFF). This will allow users to access the solar calculator and chat directly within the LINE app with automatic profile retrieval.

## Objective
To provide a frictionless, personalized experience for LINE users by running the TAWAN POWER chat/calculator as a LIFF app, enabling automatic identity capture and enhanced interaction.

## Key Components & Context
- **LIFF SDK:** Client-side library for LINE integration.
- **LINE Developers Console:** To configure the LIFF app and Channel.
- **Supabase:** To store the mapping between LINE `userId` and leads.
- **SolarChat Component:** The main UI to be enhanced with LIFF features.

## Phased Implementation Plan

### Phase 1: Setup & Configuration
1. **LINE Developers Console:**
   - Create a Provider and a Messaging API Channel.
   - Create a LIFF App within the channel.
   - Set the LIFF URL to `https://tawanpower.vercel.app/chat`.
   - Enable `chat_message.write`, `openid`, and `profile` scopes.
2. **Environment Variables:**
   - Add `NEXT_PUBLIC_LINE_LIFF_ID` to `.env.local` and Vercel.

### Phase 2: Frontend Integration
1. **LIFF SDK Initialization:**
   - Install `@line/liff`.
   - Initialize the SDK in a root layout or a specialized hook.
2. **Identity Capture:**
   - On initialization, call `liff.getProfile()` to retrieve `userId`, `displayName`, and `pictureUrl`.
   - Automatically pre-fill the `LeadForm` with the `displayName`.
   - Persist the `userId` in the chat state.
3. **UI Optimization:**
   - Detect `liff.isInClient()`.
   - If in LIFF, hide external links, header navigation, and the "Back to Site" button to provide a "native app" feel.

### Phase 3: Identity Linking (Supabase)
1. **Schema Update:**
   - Ensure the `leads` table has a `line_user_id` column (and `line_id` for manual entry).
2. **Lead Capture Enhancement:**
   - Update the `saveLead` tool and `LeadForm` to include the `line_user_id` retrieved via LIFF.
   - This ensures that if the same user returns via LINE later, we can identify them immediately.

### Phase 4: Enhanced Interactions
1. **In-Chat Confirmation:**
   - Use `liff.sendMessages()` to send a "Flex Message" summary of the user's solar calculation directly back into the LINE chat thread.
   - This allows users to keep a record of their calculation in their correspondence.
2. **Sharing Features:**
   - Implement a "Share with Friends" button using `liff.shareTargetPicker()` to allow users to send the calculator to their contacts.

## Verification & Testing
1. **SDK Init:** Verify LIFF initializes correctly on mobile LINE.
2. **Profile Fetch:** Ensure user name and avatar appear in the chat UI.
3. **Lead Save:** Verify that leads created via LIFF include the `line_user_id` in Supabase.
4. **Message Send:** Test sending a calculation summary back to the LINE chat.
5. **UI Check:** Verify that the "native" mode (no headers) works as expected.

## Rollback Strategy
- The LIFF logic will be gated by feature flags or environment variables.
- Standard web functionality will remain as a fallback if LIFF fails to initialize.

---

# План реализации: Интеграция TAWAN POWER с LINE LIFF (Перевод)

Этот план описывает интеграцию веб-сайта и чата TAWAN POWER с LINE Front-end Framework (LIFF). Это позволит пользователям получать доступ к солнечному калькулятору и чату напрямую внутри приложения LINE с автоматическим получением данных профиля.

## Цель
Обеспечить бесшовный и персонализированный опыт для пользователей LINE, запустив чат/калькулятор TAWAN POWER как приложение LIFF, что позволит автоматически фиксировать личность пользователя и расширит возможности взаимодействия.

## Ключевые компоненты
- **LIFF SDK:** Клиентская библиотека для интеграции с LINE.
- **LINE Developers Console:** Для настройки приложения и канала LIFF.
- **Supabase:** Для хранения связи между LINE `userId` и лидами.
- **Компонент SolarChat:** Основной интерфейс, который будет дополнен функциями LIFF.

## Поэтапный план реализации

### Этап 1: Настройка и конфигурация
1. **LINE Developers Console:**
   - Создать Провайдера и канал Messaging API.
   - Создать приложение LIFF внутри канала.
   - Установить LIFF URL на `https://tawanpower.vercel.app/chat`.
   - Включить разрешения (scopes): `chat_message.write`, `openid` и `profile`.
2. **Переменные окружения:**
   - Добавить `NEXT_PUBLIC_LINE_LIFF_ID` в `.env.local` и настройки Vercel.

### Этап 2: Интеграция на фронтенде
1. **Инициализация LIFF SDK:**
   - Установить `@line/liff`.
   - Инициализировать SDK в корневом макете (layout) или через специализированный хук.
2. **Захват данных профиля:**
   - При инициализации вызвать `liff.getProfile()` для получения `userId`, `displayName` и `pictureUrl`.
   - Автоматически подставлять `displayName` в форму `LeadForm`.
   - Сохранять `userId` в состоянии чата.
3. **Оптимизация интерфейса:**
   - Определять состояние `liff.isInClient()`.
   - Если приложение открыто внутри LIFF, скрывать внешние ссылки, навигацию хедера и кнопку «Вернуться на сайт», чтобы создать ощущение нативного мобильного приложения.

### Этап 3: Связка данных (Supabase)
1. **Обновление схемы БД:**
   - Убедиться, что в таблице `leads` есть колонка `line_user_id` (помимо `line_id` для ручного ввода).
2. **Улучшение захвата лидов:**
   - Обновить инструмент `saveLead` и форму `LeadForm`, чтобы они включали `line_user_id`, полученный через LIFF.
   - Это гарантирует, что если пользователь вернется через LINE позже, мы узнаем его мгновенно.

### Этап 4: Расширенное взаимодействие
1. **Подтверждение в чате:**
   - Использовать `liff.sendMessages()`, чтобы отправить краткий итог расчета (Flex Message) напрямую в ветку чата пользователя в LINE.
   - Это позволит пользователям сохранять результаты своих расчетов в истории переписки.
2. **Функции шаринга:**
   - Реализовать кнопку «Поделиться с друзьями» с помощью `liff.shareTargetPicker()`, чтобы пользователи могли отправлять калькулятор своим контактам.

## Верификация и тестирование
1. **Инициализация SDK:** Проверить, что LIFF корректно запускается в мобильной версии LINE.
2. **Получение профиля:** Убедиться, что имя и аватар пользователя появляются в интерфейсе чата.
3. **Сохранение лида:** Проверить, что лиды, созданные через LIFF, содержат `line_user_id` в Supabase.
4. **Отправка сообщения:** Протестировать отправку итогов расчета обратно в чат LINE.
5. **Проверка UI:** Убедиться, что «нативный» режим (без хедеров) работает корректно.

## Стратегия отката
- Логика LIFF будет скрыта за флагами функций или переменными окружения.
- Стандартная веб-функциональность останется доступной в качестве резервной, если LIFF не удастся инициализировать.

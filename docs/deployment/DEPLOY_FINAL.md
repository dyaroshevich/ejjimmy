# 🚀 Финальный Протокол Деплоя TAWAN POWER (Dual-Project Mode)

Этот файл — единственный источник истины для деплоя. Проект разделен на два независимых домена.

## 1. Настройка Git (ОБЯЗАТЕЛЬНО)
```bash
git config user.email "arunphalung@gmail.com"
git config user.name "dyaroshevich"
```

## 2. Архитектура доменов
- **Public (Landing)**: `admintawanpower.vercel.app` (Переменная `NEXT_PUBLIC_APP_MODE=PUBLIC`)
- **Admin (Control)**: `admintawanpower.vercel.app` (Переменная `NEXT_PUBLIC_APP_MODE=ADMIN`)

Текущие URL:
- Лендинг: `https://admintawanpower.vercel.app`
- Админка: `https://admintawanpower.vercel.app`

## 3. Регион (Сингапур - sin1)
Для работы Google Gemini API принудительно используем регион **sin1 (Singapore)** в `vercel.json`.

## 4. Деплой основного проекта (Лендинг)
Убедитесь, что вы находитесь в корне и проект привязан к `tawanpower`:
```bash
# Линковка (один раз)
vercel link --yes --project tawanpower

# Деплой
vercel --prod --yes
```

## 5. Деплой админки
Админка автоматически подхватывает пуши в `main` ветку. Если нужно задеплоить вручную:
```bash
# Линковка (один раз)
vercel link --yes --project tawan-admin

# Деплой через --name (даже без линковки)
vercel --prod --name tawan-admin --yes
```

## 6. Проверка
1. Лендинг: https://admintawanpower.vercel.app/ (Путь /admin должен отдавать 404)
2. Админка: https://admintawanpower.vercel.app/ (Должна открывать панель или логин)
3. Чат: https://admintawanpower.vercel.app/chat
4. LINE Webhook: `https://admintawanpower.vercel.app/api/line-webhook` (обновить в LINE Dev Console)

## 7. Troubleshooting (Решение проблем)

### ⚠️ Изменения не видны на одном из доменов
**Причина:** Локальная папка `.vercel` привязана только к одному проекту. При запуске `vercel --prod --yes` обновляется только тот проект, который "залинкован" сейчас.
**Решение:** Перед деплоем конкретного проекта принудительно переключите линк:
```bash
# Для обновления Админки
vercel link --yes --project tawan-admin
vercel --prod --yes

# Для обновления Лендинга
vercel link --yes --project tawanpower
vercel --prod --yes
```

### ⚠️ Ошибка "npm run build" при деплое
**Причина:** Несоответствие типов TypeScript или отсутствие переменных окружения.
**Решение:** 
1. Проверьте логи в панели Vercel (Deployment Logs).
2. Запустите `npm run build` локально. Если локально билд падает — чините код.
3. Если локально ок, а на Vercel нет — проверьте, что все переменные из `.env.local` добавлены в `Settings -> Environment Variables` на Vercel.

### ⚠️ Админка выдает 404 или перебрасывает на главную
**Причина:** Неверное значение `NEXT_PUBLIC_APP_MODE`.
**Решение:** Зайдите в настройки проекта на Vercel и убедитесь:
- Для `tawan-admin`: `NEXT_PUBLIC_APP_MODE = ADMIN`
- Для `tawanpower`: `NEXT_PUBLIC_APP_MODE = PUBLIC`


## 8. TODO List for Current Deployment
- [x] Configure Git email and name.
- [x] Update all `tawanpower.vercel.app` URLs in code → `admintawanpower.vercel.app`
- [x] Deploy `tawanpower` landing with `vercel --prod --yes`
- [x] Deploy `tawan-admin` admin with `vercel --prod --yes`
- [x] Verify both deployments
- [ ] Update LINE webhook URL in LINE Developer Console: `https://admintawanpower.vercel.app/api/line-webhook`




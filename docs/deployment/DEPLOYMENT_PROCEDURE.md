# 🚀 Процедура деплоя Solar Krabi на Vercel

## ⚠️ КРИТИЧЕСКИЕ МОМЕНТЫ (НЕ ПРОПУСКАЙТЕ!)

Эти моменты критически важны для успешного деплоя. Нарушение любого из них приведет к ошибкам.

### 1. Привязка к правильному проекту Vercel
- **НЕ** создавайте новый проект через Vercel Dashboard - это создаст проект с именем текущей папки (solarkkkkk)
- **ДОЛЖНЫ** использовать существующий проект `tawanpower` (привязан к репозиторию `tawanpower-` на GitHub)
- Проверьте привязку: `cat .vercel/project.json` должно показывать `"projectName":"tawanpower"`

### 2. Настройка Git Author (ОБЯЗАТЕЛЬНО для Vercel)
Vercel блокирует деплои если Git author не настроен правильно:
```bash
git config user.email "arunphalung@gmail.com"
git config user.name "dyaroshevich"
```
Проверьте: `git config --list | grep -E "user.(name|email)"`

### 3. Пуш в правильный репозиторий GitHub
- Репозиторий должен быть: `https://github.com/dyaroshevich/tawanpower-.git`
- Не пушите в репозиторий с именем текущей папки (solarkkkkk)
- Проверьте remote: `git remote -v`

### 4. Environment Variables в Vercel
Обязательно установите в настройках проекта Vercel:
- `GROQ_API_KEY`: ваш ключ gsk_...
- `NEXT_PUBLIC_SUPABASE_URL`: `https://odolxtryjmfpzfmuhngo.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_u_KIQ_gT0YZGz6pU8f0lIA_Ca8fbcBW`

## 📋 ПОШАГОВАЯ ПРОЦЕДУРА ДЕПЛОЯ

### Подготовка
1. Убедитесь, что вы на ветке `main`:
   ```bash
   git checkout main
   ```

2. Убедитесь, что локальный код актуален и протестирован:
   ```bash
   npm run dev  # Проверьте локально: http://localhost:3001
   ```

### Выполнение деплоя
1. Закоммитьте все изменения:
   ```bash
   git add .
   git commit -m "Ваше описание изменений"
   ```

2. Пуш в GitHub:
   ```bash
   git push origin main
   ```

3. Деплой через Vercel CLI (рекомендованный способ):
   ```bash
   vercel --prod
   ```
   Альтернативно: пуш в GitHub автоматически triggering деплой если проект привязан правильно.

### Проверка после деплоя
1. Откройте продакшн URL: https://tawanpower.vercel.app
2. Проверьте критические страницы:
   - Главная: https://tawanpower.vercel.app/
   - Чат: https://tawanpower.vercel.app/chat
   - Админка: https://tawanpower.vercel.app/admin
   - Супер-админка: https://tawanpower.vercel.app/admin/super

## 🔧 РЕШЕНИЕ ПРОБЛЕМ

### Если деплой не запускается после пуша:
1. Проверьте, что пуш ушел в правильный репозиторий: `git remote -v`
2. Убедитесь, что в Vercel проекте привязан репозиторий `tawanpower-`
3. Проверьте логи деплоя в Vercel Dashboard

### Если ошибки авторизации Git:
1. Перенастройте Git author:
   ```bash
   git config user.email "arunphalung@gmail.com"
   git config user.name "dyaroshevich"
   ```
2. Закоммитьте еще раз и пушьте

### Если 500 ошибки на страницах:
1. Проверьте, что environment variables правильно установлены в Vercel
2. Убедитесь, что Supabase доступен и ключи верные
3. Посмотрите логи в Vercel Dashboard → Deployments → Логи

## 💡 СОВЕТЫ
- Всегда деплоьте с ветки `main`
- Перед крупным деплоем запускайте локальную проверку через `npm run dev`
- После деплоя проверяйте как публичные, так и приватные страницы (админка)
- Сохраняйте резервную копию рабочего состояния перед экспериментами
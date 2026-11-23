# 🚀 Solar Krabi - Deployment Guide

Этот проект настроен как чистая MVP-версия (v8 PRO) с элитным тайским дизайном и интеграцией ИИ (Groq/Llama 3).

## 1. Локальная установка и проверка
Перед деплоем обязательно убедитесь, что всё работает локально.

```bash
# 1. Перейдите в папку проекта
cd C:\Users\dy\code\solarkkkkk

# 2. Очистите кэш и установите зависимости
# (В PowerShell)
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
npm install

# 3. Запустите сервер
npm run dev
```
Проверьте:
- **Чат:** `http://localhost:3001/chat` (должен отвечать через Groq)
- **Админка:** `http://localhost:3001/admin` (должна показывать лиды из Supabase)

---

## 2. Заливка на GitHub (Чистый Репозиторий)
Используйте этот метод, чтобы избежать ошибок с "авторством" (Git Author) на Vercel.

1. Создайте НОВЫЙ пустой репозиторий на GitHub (например, `solarkrabi`).
2. Выполните в терминале (папка `solarkkkkk`):

```bash
# Инициализация
rmdir /s /q .git
git init

# Настройка личности (КРИТИЧНО для Vercel)
git config user.email "violstam23@gmail.com"
git config user.name "dyaroshevich"

# Коммит
git add .
git commit -m "🚀 Solar Krabi V8 PRO: Final Elite Production Copy"

# Пуш в main
git branch -M main
git remote add origin https://github.com/dyaroshevich/solarkrabi.git
git push -u origin main --force
```

---

## 3. Деплой на Vercel
1. На [vercel.com](https://vercel.com) импортируйте репозиторий `solarkrabi`.
2. В разделе **Environment Variables** добавьте следующие ключи:
   - `GROQ_API_KEY`: (ваш ключ gsk_...)
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://odolxtryjmfpzfmuhngo.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_u_KIQ_gT0YZGz6pU8f0lIA_Ca8fbcBW`
3. Убедитесь, что **Root Directory** — пустое поле.
4. Нажмите **Deploy**.

---

## 💎 Особенности сборки
- **AI:** Модель Llama 3 70B (через Groq).
- **Database:** Supabase Realtime (Таблица `leads`).
- **Design:** Thai Bold Luxe (Emerald/Mango palette).

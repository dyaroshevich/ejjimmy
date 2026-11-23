# Disaster Recovery Plan — Tawan Power

**Приоритет:** P2
**Дата создания:** 12 June 2026
**Статус:** Демо-версия (требует реальных контактов и тестирования)

---

## 📌 Зачем

Что делать когда всё ляжет. Минимизация downtime и потеря данных.

---

## 🚨 Severity Levels

| Level | Описание | Примеры | Время реакции |
|-------|----------|---------|---------------|
| **SEV1** | Полный outage, бизнес стоит | Supabase down, Vercel down | 15 мин |
| **SEV2** | Частичный outage, ключевые фичи не работают | AI chat down, PDF генерация | 1 час |
| **SEV3** | Некритичные баги, workarounds есть | Опечатки,次要 UI issues | 24 часа |

---

## 🔴 SEV1: Полный Outage

### Симптомы
- Сайт не открывается
- AI чат не отвечает
- Админка недоступна

### Diagnostics (5 минут)

```bash
# 1. Проверить Vercel
curl -I https://tawanpower.vercel.app

# 2. Проверить Supabase
curl -I https://[PROJECT_REF].supabase.co/rest/v1/

# 3. Проверить DNS
dig tawanpower.vercel.app

# 4. Проверить статус провайдеров
# Vercel: https://www.vercel-status.com
# Supabase: https://status.supabase.com
```

### Actions

| Причина | Действие |
|---------|----------|
| Vercel down | Ждать, мониторить status page |
| Supabase down | Ждать, проверить RLS policies |
| DNS issues | Проверить Vercel DNS settings |
| SSL certificate | Перевыпустить через Vercel dashboard |
| Build failed | Откатить на предыдущий деплой |

### Communication

- **Внутренняя:** Telegram/SMS команде
- **Клиентам:** LINE broadcast "Идут технические работы"

---

## 🟡 SEV2: Частичный Outage

### Симптомы
- AI чат не работает, но сайт открывается
- PDF генерация падает
- Lead notification не приходит

### Diagnostics

```bash
# 1. Проверить API routes
curl https://tawanpower.vercel.app/api/chat

# 2. Проверить Supabase connection
# В Supabase Dashboard → Health

# 3. Проверить logs
# Vercel → Functions → Logs
```

### Actions by Feature

| Фича | Проблема | Решение |
|------|----------|---------|
| AI Chat | API key expired | Обновить ключ в Vercel env |
| AI Chat | Rate limit | Переключить fallback provider |
| PDF Generation | Puppeteer crash | Restart function, check memory |
| LINE Notifications | Token expired | Refresh LINE channel access token |
| Leads not saving | RLS policy | Проверить Supabase RLS |

---

## 🟢 SEV3: Некритичные баги

### Process
1. Создать bug report в `docs/bugs/`
2. Оценить impact
3. Исправить в следующем спринте
4. Не деплоить hotfix для cosmetic issues

---

## 💾 Backup Strategy

### Данные (Supabase)

| Данные | Частота бэкапа | Метод | Хранение |
|--------|----------------|-------|----------|
| leads | Ежедневно | Supabase自动 backups | 7 дней |
| knowledge | Еженедельно | pg_dump | Local + Cloud |
| solar_products | При изменении | Export CSV | Git |
| blog articles | В git | seed_blog*.sql | Git |

### Код

| Что | Где | Автоматически |
|-----|-----|-------------- |
| Source code | GitHub | ✅ |
| Environment vars | Vercel | ❌ (backup manually) |
| Config files | Git | ✅ |

### Бэкап Environment Variables

```bash
# Экспорт (делать при изменениях)
vercel env pull .env.backup

# Импорт (при восстановлении)
vercel env add <key>
```

---

## 🔄 Rollback Procedures

### Vercel Rollback

```bash
# Список деплоев
vercel ls

# Откат на предыдущий
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# Если миграция пошла не так
# 1. Остановить приложение
# 2. Откатить миграцию вручную через Supabase SQL Editor
# 3. Проверить данные
```

---

## 📞 Emergency Contacts

| Роль | Имя | Контакт | Когда звонить |
|------|-----|---------|---------------|
| Owner/Developer | dyaroshevich | — | Любые SEV1/SEV2 |
| Vercel Support | — | vercel.com/support | Platform issues |
| Supabase Support | — | supabase.com/support | Database issues |
| LINE Support | — | line.me/business | LINE API issues |

---

## 🧪 Testing DR Plan

| Тест | Частота | Как |
|------|---------|-----|
| Rollback Vercel | Ежемесячно | Откатить деплой, проверить |
| Restore backup | Ежеквартально | Восстановить DB из бэкапа |
| Failover AI provider | Ежемесячно | Отключить основной provider |
| Communication test | Ежеквартально | Отправить test notification |

---

## 📋 Post-Incident Checklist

- [ ] Определить root cause
- [ ] Заполнить incident report
- [ ] Обновить этот документ если cần
- [ ] Добавить monitoring если был gap
- [ ] Communicate с командой/клиентами

---

## 🛡 Prevention

| Риск | Превенция |
|------|-----------|
| API key leak | Never commit, use Vercel env |
| Database corruption | Regular backups, RLS policies |
| DDoS | Vercel built-in protection |
| Human error | CI/CD pipeline, no manual deploys |
| Single point of failure | Document everything, backup configs |

---

*Документ создан как шаблон. Требует реальных контактов и тестирования.*

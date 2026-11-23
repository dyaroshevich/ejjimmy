# Testing Strategy — Tawan Power

**Приоритет:** P2
**Дата создания:** 12 June 2026
**Статус:** Демо-версия (требует имплементации)

---

## 📌 Зачем

Что и как тестируем перед деплоем. Гарантируем качество без замедления development.

---

## 🎯 Testing Pyramid

```
        /\
       /  \        E2E Tests (5%)
      /    \       - Критичные user flows
     /------\
    /        \     Integration Tests (25%)
   /          \    - API routes, DB queries
  /------------\
 /              \  Unit Tests (70%)
/                \ - Утилиты, бизнес-логика
```

---

## 🧪 Test Levels

### Unit Tests (70%)

**Что тестируем:**
- Утилиты (`src/lib/utils.ts`)
- Валидация данных
- Бизнес-логика (расчёты, конвертации)
- Хелперы (formatCurrency, formatDate)

**Инструменты:**
- Jest (уже настроен в `jest.config.js`)
- React Testing Library для компонентов

**Пример:**
```typescript
// src/lib/utils.test.ts
describe('formatCurrency', () => {
  it('formats THB correctly', () => {
    expect(formatCurrency(150000)).toBe('฿150,000');
  });
});
```

**Покрытие:** > 80% для утилит

---

### Integration Tests (25%)

**Что тестируем:**
- API routes (mock внешние сервисы)
- Database queries (Supabase)
- AI chat flow (mock providers)
- PDF generation (snapshots)

**Инструменты:**
- Jest + MSW (Mock Service Worker)
- Supabase test client

**Пример:**
```typescript
// __tests__/api/chat.test.ts
describe('/api/chat', () => {
  it('qualifies lead correctly', async () => {
    const res = await POST('/api/chat', {
      messages: [{ role: 'user', content: 'Хочу солнечные панели' }]
    });
    expect(res.status).toBe(200);
    expect(res.data).toContain('qualified');
  });
});
```

---

### E2E Tests (5%)

**Что тестируем:**
- Home → Catalog → Chat → Lead submit
- Admin login → View leads
- Blog → Article view

**Инструменты:**
- Playwright (опционально, для critical flows)

**Не тестируем E2E:**
- Third-party services (LINE, Google)
- Payment flows (ещё нет)
- Edge cases

---

## 🔧 What to Test

### ✅ Обязательно тестировать

| Область | Приоритет | Метод |
|---------|-----------|-------|
| Lead qualification logic | P0 | Unit + Integration |
| AI chat responses | P0 | Integration |
| PDF generation | P0 | Integration (snapshot) |
| Supabase CRUD | P1 | Integration |
| LINE notification | P1 | Integration (mock) |
| Form validation | P1 | Unit |
| Currency formatting | P2 | Unit |

### ❌ Не тестировать (пока)

| Область | Причина |
|---------|---------|
| UI pixel-perfect | Ручное тестирование |
| Performance | Vercel оптимизирует |
| Security | RLS + code review |
| Third-party API behavior | Не контролируем |

---

## 🚀 Test Commands

```bash
# Все тесты
npm test

# С покрытием
npm run test:coverage

# Watch mode
npm run test:watch

# Только unit
npm run test:unit

# Только integration
npm run test:integration
```

---

## 📊 Coverage Goals

| Метрика | Текущее | Target |
|---------|---------|--------|
| Statements | —% | > 70% |
| Branches | —% | > 60% |
| Functions | —% | > 70% |
| Lines | —% | > 70% |

---

## 🔄 CI/CD Integration

### Пред-деплой чек-лист

```bash
# 1. Lint
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Tests
npm test

# 4. Build
npm run build

# 5. Deploy (только если всё прошло)
vercel --prod --yes
```

### GitHub Actions (план)

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
```

---

## 🐛 Bug Workflow

### Когда баг найден

1. Создать `docs/bugs/BUG_REPORT_[NAME].md`
2. Определить severity (P0-P3)
3. Написать test case (если возможно)
4. Исправить
5. Убедиться что test проходит

### Test-Driven Bug Fix

```bash
# 1. Написать failing test
npm test -- --grep "bug description"

# 2. Исправить баг
# ... edit code ...

# 3. Test должен пройти
npm test -- --grep "bug description"

# 4. Убедиться что другие тесты не сломались
npm test
```

---

## 📝 Test Documentation

### Где хранить тесты

```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts        # Unit test рядом с кодом
├── app/
│   └── api/
│       └── chat/
│           ├── route.ts
│           └── route.test.ts # Integration test
└── __tests__/               # E2E и complex tests
    └── e2e/
```

### Naming convention

- `*.test.ts` — unit tests
- `*.integration.test.ts` — integration tests
- `*.e2e.test.ts` — end-to-end tests

---

## ✅ Implementation Roadmap

### Phase 1: Foundation (неделя 1)
- [ ] Настроить jest.config.js
- [ ] Написать unit tests для утилит
- [ ] Покрыть валидацию форм

### Phase 2: API Tests (неделя 2)
- [ ] Тесты для /api/chat
- [ ] Тесты для /api/solar-products
- [ ] Mock external services

### Phase 3: Integration (неделя 3)
- [ ] Supabase integration tests
- [ ] PDF generation tests
- [ ] LINE notification tests (mock)

### Phase 4: CI/CD (неделя 4)
- [ ] GitHub Actions pipeline
- [ ] Pre-commit hooks
- [ ] Coverage reporting

---

*Документ создан как шаблон. Требует имплементации тестов.*

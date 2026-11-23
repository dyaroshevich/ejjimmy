# Chat Issues - Experiment Branch

**Branch:** `experiment/chat-fixes`  
**Date:** 2026-04-03  
**Goal:** Fix API errors and UI bugs in chat, improve UX with skills

---

## 🐛 Known Issues

### 1. API Error on Production Deploy
**Symptom:** 
- AI chat не работает на production (tawanpower.vercel.app)
- Показывает ошибку про API

**Possible Causes:**
- [ ] GROQ_API_KEY не настроен в Vercel Dashboard
- [ ] Модель llama-3.3-70b-versatile недоступна
- [ ] AI SDK version mismatch
- [ ] Environment variables не подхватываются

**Debug Steps:**
1. Check Vercel logs: `vercel logs tawanpower.vercel.app`
2. Check environment variables in Vercel Dashboard
3. Test API endpoint directly
4. Review route.ts error handling

---

### 2. Strange Chat UI Behavior
**Symptom:**
- Интерфейс чата ведет себя странно

**Possible Issues:**
- [ ] Messages не отображаются правильно
- [ ] Markdown синтаксис виден пользователю
- [ ] Tool calls показываются в чате
- [ ] Auto-scroll не работает
- [ ] Input field теряет фокус
- [ ] Стили ломаются после изменений

**Files to Check:**
- `src/components/SolarChat.tsx` (main chat component)
- `src/app/api/chat/route.ts` (API endpoint)
- `cleanMessageContent()` function (markdown stripping)

---

### 3. Markdown Display Issues
**Current Implementation:**
```typescript
function cleanMessageContent(content: string, toolInvocations?: any[]): string {
  if (!content) {
    if (toolInvocations && toolInvocations.length > 0) {
      return '⚙️ AI is working...';
    }
    return '';
  }
  return content.trim();
}
```

**Problem:**
- Функция НЕ удаляет markdown (`**`, `*`, ```)
- Только делает trim()
- Нужно добавить regex для очистки

**Fix Needed:**
```typescript
function cleanMessageContent(content: string): string {
  if (!content) return '';
  
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')  // bold
    .replace(/\*(.*?)\*/g, '$1')      // italic
    .replace(/```[\s\S]*?```/g, '')   // code blocks
    .replace(/`(.*?)`/g, '$1')        // inline code
    .trim();
}
```

---

### 4. Tool Calls Visible in Chat
**Current Filter:**
```typescript
if (!cleanedContent && !toolInvocationsWithResults?.length && !isLoading) {
  return null;
}
```

**Problem:**
- Условие может пропускать сообщения с tool calls
- Нужно лучше фильтровать `<function` теги

---

## 🎯 Experiment Goals

### Must Have:
1. ✅ API работает на production
2. ✅ Markdown очищается правильно
3. ✅ Tool calls скрыты от пользователя
4. ✅ UI стабильный (не ломается)
5. ✅ Auto-scroll работает

### Nice to Have:
1. 🎨 Улучшенный дизайн с skills
2. ⚡ Быстрая загрузка ответов
3. 📱 Мобильная адаптация
4. ♿ Accessibility улучшения

---

## 🧪 Test Plan

### Local Testing:
```bash
npm run dev
# http://localhost:3001/chat
```

**Test Cases:**
- [ ] Отправить сообщение на тайском
- [ ] Отправить сообщение на английском
- [ ] Проверить calculation wizard
- [ ] Проверить result dashboard
- [ ] Проверить quick actions
- [ ] Проверить persistence (localStorage)

### Production Testing:
```bash
# Preview deploy
vercel

# Production deploy
vercel --prod
```

**Check:**
- [ ] https://tawanpower.vercel.app/chat
- [ ] API отвечает без ошибок
- [ ] UI не ломается
- [ ] Messages сохраняются

---

## 📝 Notes

### Skills to Use:
- **ui-ux-pro-max** - улучшить дизайн чата
- **critique** - оценить UX
- **frontend-design** - улучшить компоненты
- **web-design-guidelines** - проверить стандарты

### Important Files:
- `src/components/SolarChat.tsx` - основной компонент
- `src/app/api/chat/route.ts` - API endpoint
- `src/lib/solarCalculator.ts` - калькулятор
- `package.json` - зависимости (AI SDK versions)

### Deployment:
- Preview: `vercel` (без --prod)
- Production: `vercel --prod`
- Main branch: `git push origin main` (НЕ мержить пока не готово)

---

## 🔍 Current State

**API Status:** ✅ Работает локально (проверено)
**Local Test:** `http://localhost:3001/chat` - OK
**Production:** ❌ Нуждается в исправлении

**Last Test:** 2026-04-03
- Groq API key: ✅ Valid
- Model: ✅ llama-3.3-70b-versatile available
- Endpoint: ✅ 200 OK locally
- Streaming: ✅ Works locally

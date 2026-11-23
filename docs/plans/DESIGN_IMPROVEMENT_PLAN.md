# 🎨 Design Improvement Plan - TAWAN POWER

**Branch:** `experiment/design-ui`  
**Date:** 2026-04-03  
**Source:** UX_CRITIQUE_FOR_FUTURE.md + UI-UX-Pro-Max Guidelines

---

## 🎯 Goals

1. **Remove AI Slop Patterns** - сделать дизайн уникальным
2. **Reduce Visual Noise** - четкая иерархия, меньше шума
3. **Fix Typography** - профессиональная типографика
4. **Reduce Cognitive Load** - ≤4 опции на старте
5. **Improve Accessibility** - контраст, focus states

---

## 📋 Changes to Apply

### 1. Typography Hierarchy
**Current:** Всё `font-black uppercase tracking-widest`  
**Target:**
- H1/H2: `font-black` (только заголовки)
- H3/H4: `font-bold`
- Body: `font-medium` или `font-normal`
- Labels: `font-semibold` (без uppercase везде)

### 2. Remove AI Patterns
- ❌ `bg-gradient-to-br from-emerald-800 to-teal-900` → solid color
- ❌ `shadow-emerald-500/20` → subtle shadows
- ❌ `input-inner-glass` → solid background
- ❌ `btn-luxe-primary shimmer` → remove shimmer
- ❌ `rounded-[2.5rem]` → `rounded-xl` или `rounded-2xl`
- ❌ Excessive `uppercase tracking-widest`

### 3. Reduce Visual Noise
- Уменьшить тени: `shadow-xl` → `shadow-md`
- Убрать glow эффекты
- Создать четкую иерархию через размер и цвет, не через weight

### 4. Information Architecture
- Стартовый экран: ТОЛЬКО 3 quick cards (убрать suggestion chips)
- Suggestion chips показывать только когда пользователь печатает
- ≤4 visible options на любом decision point

### 5. Text Alignment
- Установить `text-left` на root
- Убрать 50+ дублирующих `text-left`
- Использовать `text-center` только где нужно

### 6. Color System
**Current:** Emerald + Amber + случайные цвета  
**Target:** Semantic tokens:
- Primary: Emerald-600 (#059669)
- Secondary: Amber-400 (#FBBF24)
- Surface: White / Slate-50
- Text: Slate-900 / Slate-700
- Muted: Slate-400 / Slate-500

---

## 🎨 Design System (from UI-UX-Pro-Max)

**Product Type:** Service/Consulting  
**Style:** Professional, Minimal, Trustworthy  
**Colors:**
- Primary: #059669 (Emerald 600) - доверие, экология
- Accent: #FBBF24 (Amber 400) - энергия, солнце
- Surface: #FFFFFF / #F8FAFC
- Text: #0F172A / #475569

**Typography:**
- Headings: Inter Black (font-black) - только для H1
- Subheadings: Inter Bold (font-bold)
- Body: Inter Medium (font-medium)
- Labels: Inter Semibold (font-semibold)

**Effects:**
- Shadows: subtle (shadow-md, shadow-lg)
- Border radius: rounded-xl (12px), rounded-2xl (16px)
- No glassmorphism, no shimmer, no glow

---

## ✅ Success Criteria

- [ ] Нет `font-black` в body тексте
- [ ] Нет gradient text на сообщениях
- [ ] Нет glassmorphism/shimmer/glow
- [ ] Border radius ≤ 2xl
- [ ] ≤4 опции на старте
- [ ] Четкая typography иерархия
- [ ] Все кнопки ≥44px touch target
- [ ] Контраст текста ≥4.5:1

---

**NOTE:** Apply changes incrementally. Test after each change. Commit working state.

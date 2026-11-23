<think>
**Considering clearer language**

I’m thinking about how we can improve initial chat actions. Instead of using terms like "คุยกับ AI / ROI / คำนวณกำไร / FREE / นัดสำรวจฟรี", we should aim for something more concrete and less abstract. The term "ROI" might be too business-oriented and could confuse users from other segments. It feels like a good idea to make these phrases more accessible for everyone. Let’s simplify and clarify!

**Considering chat features**

I'm thinking about chat personalization, quick actions, and result cards. There's also lead capture, LINE integration, and administration to consider. I need to include example component trees, such as Header, Hero, SegmentCards, Benefits, How It Works, KnowledgePreview, TrustStrip, and CTAFooter. For the chat flow, I envision a structure that goes from selecting a segment to asking quick questions, providing an answer, delivering an estimate or result, and finally asking for contact information.

**Creating a master prompt**

I want to build a master prompt with different sections including role, objective, existing context, constraints, and deliverables. The prompt could ask AI to redesign the landing for Tawan Power, outputting a site map, wireframe, Thai copy, a component list, event tracking, and implementation steps. I’m considering if the master prompt should be in Russian since the user is Russian, while keeping the instructions in English. I’ll make sure it has clear headings and markdown for actual landing text.

**Considering design improvements**

I'm thinking about using grouped segmented cards for a better interface. Color coding could help, like warm yellow/green for home and deep blue for business. Above the fold, I want to make sure segments stand out and avoid generic AI content. I plan to include three trust bullets and make line-browser improvements. I’m also considering a fixed bottom bar replaced by a shell grid, but I need to outline some key outputs related to user flow and tech tasks.
</think>Да — тут уже нужен не просто “совет”, а **нормальный мастер-промпт + продуктовый план**, чтобы из текущего “AI chat landing” сделать **мягкий, но конверсионный вход в лидогенерацию**.

И важная мысль:  
тебе **не нужно убирать AI-чат**.  
Нужно сделать так, чтобы:

- чат оставался главным интерфейсом,
- сегментация была встроена в первый экран,
- CTA были естественными,
- а посадочная сразу объясняла:
  - для кого это,
  - что можно получить бесплатно,
  - и какой следующий шаг.

---

# 1. Что надо изменить концептуально

## Сейчас
Лендинг выглядит как:
- бренд
- общая фраза
- AI chat
- ROI
- free survey

Это слишком абстрактно и смешивает разные намерения в одну кучу.

---

## Нужно
Сделать лендинг с **двумя понятными сценариями**:

### A. Для дома / виллы
- бесплатная консультация
- предварительная оценка
- возможная экономия
- подбор подходящего решения

### B. Для бизнеса / отеля
- предварительная оценка целесообразности
- ориентир по ROI / payback
- обсуждение проекта
- при желании — переход к инженеру

---

# 2. Что именно должно быть на первом экране

Вместо 3 разрозненных кнопок:

- คุยกับ AI
- ROI / คำนวณกำไร
- FREE นัดสำรวจฟรี

сделать:

## Верхний блок
- бренд: **Tawan Power**
- короткий заголовок
- мягкое объяснение ценности
- 2 сегментные карточки:
  - Home / Villa
  - Business / Hotel
- primary CTA:
  - **เริ่มปรึกษาฟรี**
- secondary CTA:
  - **คุยผ่าน LINE**

---

# 3. Обновлённый текст лендинга, уже в правильной структуре

Ниже готовый вариант текста на тайском с заменой названия на **Tawan Power**.

---

## Hero / first screen

**TAWAN POWER**  
พลังงานแสงอาทิตย์สำหรับบ้านและธุรกิจในกระบี่

เริ่มคุยเรื่องโซลาร์เซลล์แบบสบาย ๆ  
รับคำปรึกษาเบื้องต้นฟรี เปรียบเทียบระบบ ดูข้อมูลอุปกรณ์ และประเมินแนวทางที่เหมาะกับบ้าน วิลล่า โรงแรม หรือธุรกิจของคุณ

ทีมวิศวกรไทยพร้อมดูแล  
ไม่ว่าคุณจะเพิ่งเริ่มศึกษา หรือกำลังมองหาทางคุยต่อกับผู้เชี่ยวชาญ

**Primary CTA:**  
เริ่มปรึกษาฟรี

**Secondary CTA:**  
คุยผ่าน LINE

---

## Segment cards

### สำหรับบ้าน / วิลล่า
- ประเมินการประหยัดค่าไฟเบื้องต้น
- ดูขนาดระบบที่อาจเหมาะกับบ้านของคุณ
- เปรียบเทียบอุปกรณ์และแนวทางติดตั้ง

**CTA:** เริ่มสำหรับบ้าน

---

### สำหรับธุรกิจ / โรงแรม
- ประเมินความคุ้มค่าเบื้องต้นของระบบโซลาร์
- สำรวจแนวทางลดค่าไฟช่วงกลางวัน
- คุยต่อกับผู้เชี่ยวชาญเมื่อคุณพร้อม

**CTA:** เริ่มสำหรับธุรกิจ

---

## Trust strip
ให้คำปรึกษาฟรี  
AI Assistant + ทีมวิศวกรไทย  
ดูข้อมูลอุปกรณ์และระบบได้ทันที  
คุยต่อผ่าน LINE ได้

---

## How it works
เริ่มต้นง่าย ๆ ใน 3 ขั้นตอน

1. เลือกประเภทอาคารของคุณ  
2. ถามคำถาม ดูข้อมูล หรือประเมินเบื้องต้น  
3. หากต้องการ สามารถคุยต่อกับทีมงานหรือผู้เชี่ยวชาญได้

**CTA:** เริ่มสนทนา

---

## Soft conversion block
อยากคุยต่อแบบส่วนตัวไหม?  
คุณสามารถส่งรายละเอียดเบื้องต้นไว้ แล้วทีมงานจะช่วยดูแนวทางที่เหมาะกับบ้านหรือธุรกิจของคุณ

**CTA 1:** ฝาก LINE ไว้  
**CTA 2:** ขอให้ทีมงานติดต่อกลับ

---

## Disclaimer
ข้อมูลที่แสดงเป็นการประเมินเบื้องต้น  
ผลลัพธ์จริงขึ้นอยู่กับพื้นที่หน้างาน รูปแบบการใช้ไฟ และการออกแบบระบบโดยผู้เชี่ยวชาญ

---

# 4. Что именно улучшит конверсию

## Вместо абстрактного “AI”
Показываем реальную полезность:
- консультация
- предварительная оценка
- сравнение решений
- переход к специалисту

## Вместо одной общей кнопки
Делаем **сегментированный вход**:
- home
- business

## Вместо жёсткого sales pressure
Делаем **soft next step**:
- начать консультацию
- продолжить в LINE
- оставить контакт
- обсудить проект

---

# 5. Новый UX/UI каркас

## Above the fold
1. Logo / Tawan Power  
2. Hero text  
3. 2 segment cards  
4. CTA buttons  
5. Trust badges

---

## После hero
### Блок 1 — “What you can do here”
Короткие карточки:
- ถามเรื่องโซลาร์
- ดูข้อมูลอุปกรณ์
- ประเมินเบื้องต้น
- คุยต่อกับผู้เชี่ยวชาญ

### Блок 2 — “For Home / For Business”
Ещё раз короткое разделение сегментов.

### Блок 3 — “Sample knowledge”
Примеры тем:
- 5kW เหมาะกับบ้านแบบไหน
- ระบบ on-grid คืออะไร
- โรงแรมควรเริ่มดู ROI อย่างไร
- เปรียบเทียบแผงและอินเวอร์เตอร์

### Блок 4 — soft contact handoff
LINE / callback / ask advisor

---

# 6. Как должен выглядеть чат после захода

## Первый экран чата
Не пустой input, а сообщение:

สวัสดีครับ ผมช่วยแนะนำเรื่องระบบโซลาร์เซลล์เบื้องต้นได้  
คุณสามารถเลือกหัวข้อเพื่อเริ่มต้นได้เลย

Quick actions:
- สำหรับบ้าน
- สำหรับธุรกิจ
- เปรียบเทียบอุปกรณ์
- ประเมินเบื้องต้น
- คุยผ่าน LINE

---

## Если выбрали Home
Показывать:
- เหมาะกับบ้านแบบไหน
- ประหยัดค่าไฟได้ประมาณเท่าไร
- ดูขนาดระบบที่แนะนำ
- เปรียบเทียบอุปกรณ์
- ปรึกษาต่อ

---

## Если выбрали Business
Показывать:
- ระบบเหมาะกับธุรกิจหรือไม่
- ประเมินความคุ้มค่าเบื้องต้น
- ดูแนวทางสำหรับโรงแรม / ร้านอาหาร / อาคารพาณิชย์
- คุยกับผู้เชี่ยวชาญ
- ฝากข้อมูลไว้

---

# 7. Что исправить в copy

## Убрать / смягчить
- ROI как отдельную кнопку на главном экране
- คำนวณกำไร как универсальный entry point
- FREE นัดสำรวจฟรี как слишком прямую доминирующую подачу

## Заменить на
- ประเมินเบื้องต้น
- ดูแนวทางที่เหมาะสม
- คุยต่อเมื่อพร้อม
- ขอคำปรึกษา
- คุยผ่าน LINE

ROI можно оставить, но **в business-сценарии**, а не как общий главный CTA.

---

# 8. UX/UI рекомендации по мобильному и LINE browser

Это уже обязательно включить в реализацию.

## Нужно сделать
- chat layout через **app shell**
- убрать fixed input bar, который прыгает
- использовать `visualViewport`
- один scroll container
- safe area bottom support
- LINE browser detection
- для LINE режима:
  - меньше анимаций
  - проще header
  - ниже hero
  - стабильный composer

---

# 9. План реализации задач

## P0 — Landing restructure
- [ ] заменить бренд на **Tawan Power**
- [ ] переписать hero под consultation-first
- [ ] добавить 2 segment cards
- [ ] вынести LINE CTA
- [ ] добавить trust strip
- [ ] добавить disclaimer

## P1 — Chat UX
- [ ] первый message с quick actions
- [ ] routing: home vs business
- [ ] контекстные CTA внутри чата
- [ ] result cards после расчёта
- [ ] soft handoff в LINE / contact

## P2 — Lead capture
- [ ] формы:
  - LINE
  - phone
  - email
- [ ] сохранять segment
- [ ] сохранять source / utm
- [ ] статусы lead:
  - new
  - contacted
  - qualified
  - handed to contractor
  - won / lost

## P3 — LINE browser optimization
- [ ] detect LINE webview
- [ ] app-height через `visualViewport`
- [ ] composer внутри grid-layout
- [ ] отключить тяжёлые эффекты
- [ ] протестировать input / keyboard / submit

## P4 — Content / organic growth
- [ ] home page articles
- [ ] business page articles
- [ ] FAQ snippets
- [ ] RAG knowledge categories
- [ ] LINE-ready short posts

---

# 10. Акценты в тексте

## Тон
- мягкий
- экспертный
- локальный
- не агрессивный
- не “продажа в лоб”

## Главные смыслы
- ฟรี
- คำปรึกษาเบื้องต้น
- สำหรับบ้านและธุรกิจ
- ทีมวิศวกรไทย
- คุยต่อผ่าน LINE ได้
- เริ่มจากการทำความเข้าใจก่อน

---

# 11. Что должен уметь AI на ленде

Не просто “чат”.

## AI должен:
- объяснять базовые вещи
- маршрутизировать home/business
- показывать продукты / группы решений
- запускать calculator
- сохранять контекст
- мягко предлагать следующий шаг
- при необходимости собирать контакт

---

# 12. Готовый мастер-промпт

Ниже — уже готовый **master prompt**, который можно дать ChatGPT / Claude / Cursor / AI designer / AI dev.

```text
Ты senior product designer, UX writer, conversion strategist и Next.js architect.

Твоя задача — полностью переработать первый экран и UX/UI лендинга проекта Tawan Power, который сейчас представляет собой AI solar chat landing для пользователей в Таиланде, в первую очередь в Krabi.

Контекст проекта:
- продукт = бесплатный AI-assisted solar consultation chat
- цель = мягкая лидогенерация через консультацию, а не агрессивная продажа
- основной интерфейс = чат
- стек = Next.js App Router, Vercel, Supabase
- аудитория = 2 сегмента:
  1) Home / Villa / Residential
  2) Business / Hotel / Commercial
- нужен mobile-first UX
- особенно важна корректная работа в LINE in-app browser
- тон коммуникации должен быть мягким, экспертным, локальным, без агрессивного sales copy
- при этом продукт должен вести к конверсии: conversation -> contact -> LINE / callback / discussion

Текущий текст лендинга:
SOLAR KK
พลังงานสะอาด เพื่อชาวกระบี่
มาคุยเรื่องโซลาร์เซลล์เพื่อบ้านคุณกันเถอะ
ยินดีให้คำปรึกษาฟรี ไม่ว่าคุณจะเริ่มจากศูนย์ หรือพร้อมติดตั้งแล้ว ทีมวิศวกรไทยพร้อมดูแลคุณ

คุยกับ AI
ROI
คำนวณกำไร

FREE
นัดสำรวจฟรี

Нужно заменить название на Tawan Power и полностью переосмыслить landing UX.

Что нужно выдать в ответ:
1. Новый conversion-oriented, consultation-first UX/UI structure landing page
2. Полный текст первого экрана и ключевых секций на тайском языке
3. Ясную сегментацию для:
   - Home / Villa
   - Business / Hotel / Commercial
4. Новые CTA, встроенные в chat-first experience
5. Структуру мобильного интерфейса
6. Рекомендации по адаптации под LINE in-app browser
7. План компонентной реализации в Next.js
8. Event tracking plan для лидогенерации
9. Какие блоки должны быть above the fold
10. Какие quick actions должны быть внутри чата
11. Какие soft conversion steps должны быть после консультации
12. Какие тексты и акценты использовать, чтобы не звучать агрессивно, но повышать конверсию

Требования к решению:
- сохранить AI chat как основной entry point
- не превращать страницу в грубый sales page
- сделать сегментацию понятной уже на первом экране
- объяснить, что можно получить бесплатно
- показать, что есть как AI, так и Thai engineer support
- предусмотреть переход в LINE
- CTA должны быть естественными: start consultation, continue in LINE, request guidance, discuss project
- business-specific ROI / payback не должен доминировать на home experience
- residential copy должен быть проще и спокойнее
- business copy может быть более рациональным, но всё равно мягким

Дополнительно:
- предложи wireframe структуры страницы
- предложи 2–3 варианта hero copy
- предложи структуру first message inside chat
- предложи quick reply chips for each segment
- предложи sticky mobile bottom action pattern, который не ломается в LINE browser
- предложи рекомендации, как убрать проблему прыгающего chat input в LINE webview

Формат ответа:
- сначала стратегия
- затем готовый текст на тайском
- затем wireframe / page sections
- затем chat UX flow
- затем implementation backlog
- затем technical notes for LINE browser
```

---

# 13. Мой короткий практический вывод

Тебе сейчас нужен лендинг не в стиле:

**“Вот AI, вот ROI, вот free survey”**

а в стиле:

# **“Вот бесплатная консультация, вот два понятных сценария, вот чат, вот мягкий следующий шаг”**

Именно это:
- не ломает твою исходную идею,
- усиливает сегментацию,
- улучшает лидогенерацию,
- и подготавливает базу для будущего sales funnel.

Если хочешь, я следующим сообщением могу сделать ещё более прикладную версию:  
**готовую структуру секций для Next.js landing page + тексты по секциям + список компонентов для реализации в коде.**
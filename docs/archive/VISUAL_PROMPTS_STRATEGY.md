# Визуальная Стратегия и Промпты: Solar Krabi

Этот документ содержит ТЗ для подбора и генерации визуального контента. Цель — создать доверие, показать экспертность и сегментировать аудиторию.

## 1. Категория: Реализм (Для поиска фото и видео)
*Используется для создания доверия. Должно выглядеть как "настоящий Краби", а не сток из Европы.*

### 1.1. Жилой сектор (Residential)
*   **Промпт/Описание:** Современная вилла в Краби (белые стены, тропический сад) с установленными на крыше черными панелями. На заднем плане видны известняковые скалы или море. Солнечный день, естественные тени.
*   **Зачем:** Показать клиенту, что солнечная энергия — это стандарт для современного дома в его регионе.

### 1.2. Процесс монтажа (Service/Expertise)
*   **Промпт/Описание:** Крупный план рук профессионального монтажника в перчатках, затягивающего крепление панели. На заднем плане — синее небо Таиланда. Фокус на деталях и качестве инструментов.
*   **Зачем:** Убедить в безопасности и технической грамотности команды.

### 1.3. Технический узел (Inverter/Tech)
*   **Промпт/Описание:** Аккуратно смонтированный инвертор Huawei на чистой стене технического помещения. Кабели убраны в аккуратные короба. Горят зеленые индикаторы работы.
*   **Зачем:** Показать "чистоту" и эстетичность системы внутри дома.

---

## 2. Категория: Продающий Каталог (Для рендеров/изолятов)
*Используется в карточках товаров и RAG-ответах.*

### 2.1. Солнечная панель (N-Type)
*   **Промпт/Описание:** Солнечная панель Jinko Tiger Neo, вид под углом 45 градусов. Поверхность переливается глубоким синим/черным цветом. Изолирована на белом фоне.
*   **Зачем:** Для каталога товаров.

### 2.2. Комплект "Все включено" (Bundle)
*   **Промпт/Описание:** Групповое фото: Солнечная панель, Инвертор и Батарея LUNA2000, расставленные композиционно. Профессиональный студийный свет.
*   **Зачем:** Визуализация комплексного предложения (System Package).

---

## 3. Категория: Дизайнерская Графика и Иконки
*Для интерфейса, схем и кнопок в чате.*

### 3.1. Экономия и Выгода (Benefit)
*   **Промпт/Описание:** Минималистичная 3D иконка: Солнце, превращающееся в монету (THB), или батарейка, заполненная зеленым светом. Стиль: Claymorphism или Flat Modern.
*   **Зачем:** Визуализация кнопок "Рассчитать окупаемость".

### 3.2. Этапы работы (Steps)
*   **Промпт/Описание:** Серия из 4 иконок: 1. Лупа (Анализ счета), 2. Планшет (Проектирование), 3. Гаечный ключ (Монтаж), 4. Смартфон (Мониторинг выработки).
*   **Зачем:** Показать прозрачность процесса.

---

## 4. Кастомные Решения на основе Чата (Динамический визуал)

Чтобы чат был "живым", мы можем использовать **сегментацию контента**:

### 4.1. Визуальные Лид-магниты
*   Если пользователь говорит о **бизнесе/отеле** — чат выводит превью брошюры "ROI для коммерческого сектора в Краби".
*   Если пользователь говорит об **отключениях света** — чат показывает схему работы гибридной системы с батареей.

### 4.2. Интерактивные "Карточки успеха"
*   Вместо простого текста "Мы установили много систем", чат может генерировать (или доставать из базы) мини-карточку: `[Фото объекта] + [Локация: Ао Нанг] + [Экономия: 4500 THB/мес]`.

### 4.3. Дифференциация UI
*   **Дневная тема (Солнце):** Желто-зеленые акценты, упор на экономию.
*   **Ночная тема (Энергия из батарей):** Темно-синие/фиолетовые акценты, упор на надежность и автономию.

---

## 5. English Prompts for AI Generation & Search (Master List)

*Use these prompts for high-quality image generation or finding precise stock footage.*

### 5.1. Hero & Backgrounds (The "First Impression")
*   **Prompt:** `Cinematic wide shot of a luxury tropical villa in Krabi, limestone cliffs in the background, sleek black monocrystalline solar panels seamlessly integrated on the roof, bright sunny day, 8k resolution, photorealistic, architectural photography, vibrant greenery. --ar 16:9`
*   **Prompt:** `A worker installing solar panels on a rooftop in Thailand, bright blue sky, wearing a professional uniform with "Solar Expert" logo, focus on high-quality tools and safety equipment, tropical palm trees in the blurred background. --ar 16:9`

### 5.2. Product Showcase (The "Catalog")
*   **Prompt:** `Studio shot of a Huawei SUN2000 solar inverter and a LUNA2000 battery bank, clean white background, soft professional lighting, high-tech sleek design, metallic textures, 8k, sharp focus. --v 6.0`
*   **Prompt:** `Close up of a N-type solar panel surface, deep black hexagonal cells, water droplets reflecting sunlight, macro photography, tech-focused, high efficiency vibe.`

### 5.3. Benefits & Icons (The "Why Us")
*   **Prompt:** `Minimalist 3D render of a golden sun ray hitting a digital Thai Baht coin, turning it into green energy, soft clay style, white background, isolated. --v 6.0`
*   **Prompt:** `Modern flat vector icon set: 1. Solar house 2. Electric car charging 3. Smart energy app 4. 25-year warranty badge. Clean lines, green and gold color palette.`

### 5.4. Customer Trust (The "Proof")
*   **Prompt:** `A happy Thai family standing in front of their modern house in Krabi, pointing at their new solar panels on the roof, smiling, late afternoon golden hour lighting, authentic look, non-staged feel.`

---

## 6. План поиска официальных материалов (Updated)

1.  **Бренды:** Скачать медиа-киты (Press Kit) с сайтов:
    *   Huawei Digital Power (Inverters/Batteries).
    *   Jinko Solar / Longi Solar (Panels).
2.  **Видео:** Искать на YouTube каналы этих брендов и отбирать ролики "How it works" для вставки.
3.  **Локальные данные:** Сделать подборку фото типичных крыш Краби (черепица, металлочерепица), чтобы клиенты узнавали свои дома.

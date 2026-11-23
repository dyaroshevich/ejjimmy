/**
 * Seller Scripts Generator for Solar Products
 * Uses enriched product data from database to create compelling sales narratives
 */

import { brand as brandConfig } from '../site.config';

export type SellerScriptType = 'technical' | 'economic' | 'simple' | 'objection-handler';

export interface ProductContext {
  productId: string;
  productName: string;
  brand: string;
  powerKw: number;
  priceThb: number;
  description: string;
  specifications: Record<string, any>;
  systemComponents?: Array<{ qty: number; item: string; warranty?: string }>;
  includedServices?: string[];

  // Enriched data from view
  directResearch?: string[];
  similarResearch?: Array<{
    content: string;
    category?: string;
    type?: string;
    similarity: number;
  }>;
  brandMentions?: number;
  avgPaybackForSize?: number;
}

export interface GeneratedScript {
  type: SellerScriptType;
  title: string;
  content: string;
  keyPoints: string[];
  targetAudience: string;
}

/**
 * Generate all seller scripts for a product
 */
export function generateSellerScripts(product: ProductContext): GeneratedScript[] {
  return [
    generateTechnicalScript(product),
    generateEconomicScript(product),
    generateSimpleScript(product),
    generateObjectionHandlers(product),
  ];
}

/**
 * Technical/B2B script - for engineers, architects, facility managers
 */
function generateTechnicalScript(p: ProductContext): GeneratedScript {
  const specs = p.specifications;
  const highlights: string[] = [];

  // Extract key technical specs
  if (specs.max_efficiency) highlights.push(`Кпд: ${specs.max_efficiency}`);
  if (specs.protection_standard) highlights.push(`Защита: ${specs.protection_standard}`);
  if (specs.mppt_trackers) highlights.push(`MPPT трекеров: ${specs.mppt_trackers}`);
  if (specs.certifications) highlights.push(`Сертификаты: ${specs.certifications}`);
  if (specs.warranty) highlights.push(`Гарантия: ${specs.warranty}`);

  // Use research insights
  const similarSystems = p.similarResearch || [];
  const comparableSystem = similarSystems.find(s => s.type === 'system');

  const content = `
🎯 **Техническое предложение: ${p.productName}**

**Ключевые технические характеристики:**
${highlights.map(h => `• ${h}`).join('\n')}

**Надёжность промышленного класса:**
${specificationsToNarrative(specs)}

**Сравнительный анализ:**
${comparableSystem ? `Аналогичная система ${p.brand} ${p.powerKw}kW: окупаемость ${extractPayback(comparableSystem.content)}` : ''}

**Преимущества для промышленных объектов:**
• Работа 24/7 без снижения эффективности
• Дистанционная диагностика через ${extractAppName(specs)}
• Автоматическое резервное копирование и обновления
• Поддержка Thailand Grid standards (PEA/MEA)

**Гарантии ${brandConfig.name}:**
• ${p.includedServices?.[0] || 'Бесплатная установка и сертификация'}
• 3 года гарантии на монтаж
• Обучение персонала включено

**Следующие шаги:**
1. Бесплатный выезд инженера для оценки объекта
2. Расчёт точной экономии на основе ваших тарифов
3. Подготовка технического проекта
  `.trim();

  return {
    type: 'technical',
    title: `${p.brand} ${p.powerKw}kW - Техническое предложение`,
    content,
    keyPoints: highlights,
    targetAudience: 'Инженеры, архитекторы, руководители технических служб',
  };
}

/**
 * Economic script - for CFOs, business owners
 */
function generateEconomicScript(p: ProductContext): GeneratedScript {
  const payback = p.avgPaybackForSize || extractPaybackFromAny(p.similarResearch) || 4;
  const savingsPerMonth = extractMonthlySavings(p.similarResearch) || Math.round(p.priceThb * 0.08);
  const annualSavings = savingsPerMonth * 12;
  const roi = ((annualSavings / p.priceThb) * 100).toFixed(1);

  const content = `
💰 **Экономическое обоснование: ${p.productName}**

**Инвестиции:**
• Стоимость системы: ${p.priceThb.toLocaleString()} THB
• Включены: ${p.includedServices?.[0] || 'установка и сертификация'}

**Ежемесячная экономия:**
• Ожидаемая экономия: ~${savingsPerMonth.toLocaleString()} THB/месяц
• На основе ${p.brand} систем ${p.powerKw}kW в Таиланде

**Возврат инвестиций:**
• Срок окупаемости: ${payback} года
• Годовая доходность: ~${roi}%
• Срок службы: 25+ лет (панели), ${extractInverterWarranty(p.specifications) || '10'} лет (инвертор)

**Налоговые преимущества (Тайланд):**
• ✓ Нет налога на экономию электроэнергии
• ✓ Возможность заявить как капитальные затраты
• ✓ Ускоренная амортизация (для юрлиц)

**Неочевидные выгоды:**
• Защита от будущих повышений тарифов (исторически +5%/год)
• Повышение стоимости недвижимости
• ESG-бренд для вашего бизнеса
• Бесплатный мониторинг в реальном времени

**Сравнение с банковским вкладом:**
При вкладе 635,000 THB под 3% годовых: ~19,000 THB/год
Наша система экономит: ~${annualSavings.toLocaleString()} THB/год
Разница: ${(annualSavings - 19000).toLocaleString()} THB/год
  `.trim();

  return {
    type: 'economic',
    title: `${p.brand} ${p.powerKw}kW - ROI и экономическая модель`,
    content,
    keyPoints: [
      `Срок окупаемости: ${payback} года`,
      `Экономия: ${savingsPerMonth} THB/месяц`,
      `ROI: ${roi}% годовых`,
    ],
    targetAudience: 'Финансовые директора, владельцы бизнеса',
  };
}

/**
 * Simple script - for regular customers, LINE chat
 */
function generateSimpleScript(p: ProductContext): GeneratedScript {
  const content = `
✅ **${p.productName}**

Идеальное решение для ${p.powerKw > 50 ? 'промышленного объекта' : 'коммерческого предприятия'}!

📊 **Основное:**
• Мощность: ${p.powerKw} kW
• Экономия: ~${extractMonthlySavings(p.similarResearch) || '50,000'} THB/месяц
• Гарантия: ${extractWarranty(p.specifications) || '10'} лет на инвертор
• Стоимость: ${p.priceThb.toLocaleString()} THB (всё включено)

🛡️ **${brandConfig.name} гарантии:**
✓ Бесплатная PEA/MEA сертификация
✓ Установка certified инженерами
✓ 3 года гарантии на работу
✓ Обучение и поддержка 24/7

🎯 **Почему ${p.brand}?**
${p.brandMentions && p.brandMentions > 5 ? `Бренд, проверенный в ${p.brandMentions} проектах в Таиланде` : 'Мировое лидерство в технологиях'}

📞 **Что дальше?**
1. Бесплатный замер на объекте
2. Подбор оптимального решения
3. Фиксированная цена без скрытых платежей
4. Готовность через 2-4 недели

👉 Ответьте "ДА" и мы назначим время выезда!
  `.trim();

  return {
    type: 'simple',
    title: `${p.productName} - краткое предложение`,
    content,
    keyPoints: ['Экономия', 'Гарантия', 'Бесплатная сертификация'],
    targetAudience: 'Конечные клиенты в LINE-чате',
  };
}

/**
 * Objection handlers - based on research about common questions
 */
function generateObjectionHandlers(p: ProductContext): GeneratedScript {
  const handlers = [
    {
      objection: 'Дорого!',
      response: `
❓ **"Это слишком дорого"**

✅ **Факты:**
• ${p.priceThb} THB - полная стоимость "под ключ"
• Включены: ${p.includedServices?.join(', ') || 'все работы и документы'}
• Экономия: ~${extractMonthlySavings(p.similarResearch) || '50,000'} THB/месяц
• Вы окупаетесь за ${p.avgPaybackForSize || '4'} года

🔍 **Для сравнения:**
Новая машина: 1-2M THB → теряет 50% стоимости через 5 лет
Солнечная система: ${p.priceThb} THB → приносит ${(extractMonthlySavings(p.similarResearch) || 50000) * 12 * 15} THB за 15 лет

💡 **Решение:**
Рассрочка 0% на 24 месяца → всего ${Math.round(p.priceThb / 24)} THB/месячноБанк даёт кредит под 8%, а ваша система начнёт экономить в первый же месяц!
      `.trim(),
    },
    {
      objection: 'А если Paige приедет позже?',
      response: `
❓ **"Боюсь, Paige затянет paperwork"**

✅ **Наш опыт:**
• Мы работаем с PEA/MEA постоянно (${p.brandMentions || 'много'} проектов)
• Готовим все документы за 3-5 дней
• Согласовываем график визита инспектора

📋 **Что мы делаем БЕСПЛАТНО:**
1. Подготовка технического плана
2. Заявка на новый счётчик (Form R1-1)
3. Согласование сmitted elsewhere ( jika required)
4. Назначение даты проверки Paige
5. Сопровождение на объекте во время проверки

⏱ **Сроки:**
Обычно: 2-4 недели от заявки до включения
В сезон Paige может занять до 6 недель → начинайте сейчас!

💡 **Застрахуйтесь:**
Если Paige займет >60 дней → бесплатно продлим гарантию на 6 месяцев.
      `.trim(),
    },
    {
      objection: 'Нужно подумать',
      response: `
❓ **"Мне нужно подумать"** — абсолютно нормально!

🎯 **Для чего? Давайте уточним:**

💰 **Экономия?** Мы рассчитаем точную сумму до копейки.
🛡️ **Надёжность?** У нас ${p.brandMentions || 'много'} успешных проектов, отзывы на Google.
⏱ **Сроки?** Установка — 2-3 дня, paperwork — 2-4 недели.
📈 **Будущее?** Через год вы будете экономить ${(extractMonthlySavings(p.similarResearch) || 50000) * 12} THB/год.

💎 **Идеальная возможность:**
• Цены на панели растут каждый год
• Государственные субсидии могут закончиться
• Сейчас лучший солнечный сезон (январь-май)

🤝 **Мы не навязываемся. Но:**
Если нет возражений по цене и срокам → это не "нет", а "не сейчас".
Давайте забронируем дату установки сейчас (без оплаты), и вы сможете отменить за 7 дней бесплатно.

✨ **Бонус при решении до конца недели:**
Бесплатный upgrade мониторинга (value 5,000 THB) + priority installation.
      `.trim(),
    },
  ];

  return {
    type: 'objection-handler',
    title: `Обработка возражений для ${p.productName}`,
    content: handlers.map(h => `**${h.objection}**\n${h.response}`).join('\n\n'),
    keyPoints: handlers.map(h => h.objection),
    targetAudience: 'Менеджеры по продажам',
  };
}

// Helper functions
function specificationsToNarrative(specs: Record<string, any>): string {
  const parts: string[] = [];

  if (specs.max_efficiency) parts.push(`Максимальный КПД ${specs.max_efficiency} — один из лучших в индустрии`);
  if (specs.standard) parts.push(`Соответствует стандартам ${specs.standard}`);
  if (specs.diagnostic_system) parts.push(`Система диагностики ${specs.diagnostic_system} предотвращает простои`);
  if (specs.cooling_system) parts.push(`Система охлаждения ${specs.cooling_system} обеспечивает стабильную работу при +50°C`);

  return parts.join('\n\n');
}

function extractPayback(text: string): string {
  const match = text.match(/(\d+)\s*ปี/);
  return match ? match[1] + ' года' : '4 года';
}

function extractMonthlySavings(research?: Array<{ content: string }>): number | null {
  if (!research || research.length === 0) return null;
  const first = research[0].content;
  const match = first.match(/(\d{1,3}(?:,\d{3})*)\s*บาท\/เดือน/);
  if (match) {
    return Number(match[1].replace(/,/g, ''));
  }
  return null;
}

function extractPaybackFromAny(research?: Array<{ content: string }>): number | null {
  if (!research || research.length === 0) return null;
  for (const r of research) {
    const match = r.content.match(/(\d+(?:\.\d+)?)\s*ปี/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

function extractAppName(specs: Record<string, any>): string {
  if (specs.connectivity?.includes('FusionSolar')) return 'FusionSolar';
  if (specs.monitoring) return specs.monitoring;
  return 'мобильном приложении';
}

function extractWarranty(specs: Record<string, any>): string {
  if (specs.inverter_warranty) return specs.inverter_warranty;
  if (specs.warranty) return specs.warranty;
  return '10';
}

function extractInverterWarranty(specs: Record<string, any>): string {
  return extractWarranty(specs);
}

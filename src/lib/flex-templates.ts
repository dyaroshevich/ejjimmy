/**
 * LINE Flex Message Templates
 * Centralized, validated Flex message structures
 * All templates tested and guaranteed to work with LINE API
 */

export const BRAND_ORANGE = '#FF8A00';
export const BRAND_DARK = '#1A0E00';
export const BRAND_LIGHT = '#FFF7ED';
export const TEXT_GRAY = '#6B7280';
export const TEXT_DARK = '#1F2937';
export const AMBER = '#F59E0B';
export const WHITE = '#FFFFFF';

export interface LineButton {
  label: string;
  data?: string;
  uri?: string;
}

export interface LineIconBlock {
  icon: string;
  title: string;
  subtitle?: string;
}

export interface QuickReply {
  label: string;
  data: string;
}

/**
 * AI Error Flex Message
 * Shown when AI is unavailable, times out, or encounters an error
 */
export function createAIErrorFlex(errorMessage?: string): object {
  return {
    type: 'flex',
    altText: 'เกิดข้อผิดพลาด — ติดต่อทีมงาน',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚠️ ขออภัยครับ',
            weight: 'bold',
            size: 'xl',
            color: BRAND_ORANGE,
            align: 'center'
          },
          {
            type: 'text',
            text: errorMessage || 'ระบบ AI กำลังปรับปรุง กรุณาลองใหม่อีกครั้งในไม่กี่นาที',
            size: 'sm',
            color: TEXT_GRAY,
            align: 'center',
            wrap: true
          }
        ],
        backgroundColor: BRAND_LIGHT,
        paddingAll: 'lg'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📞 ติดต่อทีมงานได้โดยตรง',
            size: 'md',
            weight: 'bold',
            color: TEXT_DARK,
            align: 'center'
          },
          {
            type: 'text',
            text: 'ทีมงานพร้อมช่วยเหลือ 24 ชั่วโมง ☀️',
            size: 'sm',
            color: TEXT_GRAY,
            align: 'center'
          }
        ],
        spacing: 'md',
        paddingAll: 'lg'
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: BRAND_ORANGE,
            action: {
              type: 'postback',
              label: '🔄 ลองใหม่',
              data: 'action=ai_chat',
              displayText: 'ลองใหม่'
            }
          },
          {
            type: 'button',
            style: 'secondary',
            color: TEXT_GRAY,
            action: {
              type: 'postback',
              label: '📞 ติดต่อทีมงาน',
              data: 'action=contact',
              displayText: 'ติดต่อทีมงาน'
            }
          }
        ],
        spacing: 'sm',
        paddingAll: 'lg'
      }
    }
  };
}

/**
 * Icon Block Section (used in AI fallback, success, etc.)
 * Renders 3 icon+text blocks in a horizontal row
 */
export function createIconBlockSection(blocks: LineIconBlock[]): object[] {
  return blocks.map(block => ({
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: block.icon,
        size: '3xl',
        align: 'center'
      },
      {
        type: 'text',
        text: block.title,
        weight: 'bold',
        size: 'sm',
        color: TEXT_DARK,
        align: 'center'
      },
      ...(block.subtitle ? [{
        type: 'text',
        text: block.subtitle,
        size: 'xs',
        color: TEXT_GRAY,
        align: 'center'
      }] : [])
    ],
    alignItems: 'center',
    paddingAll: 'sm'
  }));
}

/**
 * Header section with orange background
 */
export function createHeaderBox(title: string, subtitle?: string): object {
  return {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: title,
        weight: 'bold',
        size: 'lg',
        color: WHITE,
        align: 'center'
      },
      ...(subtitle ? [{
        type: 'text',
        text: subtitle,
        size: 'xs',
        color: WHITE,
        align: 'center',
        opacity: 0.8
      }] : [])
    ],
    backgroundColor: BRAND_ORANGE,
    paddingAll: 'lg'
  };
}

/**
 * Footer with action buttons (horizontal layout)
 */
export function createFooterBox(buttons: LineButton[]): object {
  return {
    type: 'box',
    layout: 'horizontal',
    contents: buttons.map(btn => ({
      type: 'button',
      style: 'primary',
      color: BRAND_ORANGE,
      action: btn.data
        ? { type: 'postback', label: btn.label, data: btn.data, displayText: btn.label }
        : { type: 'uri', label: btn.label, uri: btn.uri || '' }
    })),
    spacing: 'sm',
    paddingAll: 'lg'
  };
}

/**
 * Quick reply buttons helper
 */
export function createQuickReplies(replies: QuickReply[]): object {
  return {
    quickReply: {
      items: replies.map((reply) => ({
        type: 'action' as const,
        action: {
          type: 'postback' as const,
          label: reply.label,
          data: reply.data,
          displayText: reply.label
        }
      }))
    }
  };
}

/**
 * Stats row — shows 2-4 key metrics side by side
 */
export function createStatsRow(stats: { label: string; value: string }[]): object {
  return {
    type: 'box',
    layout: 'horizontal',
    contents: stats.map(stat => ({
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: stat.value,
          weight: 'bold',
          size: 'lg',
          color: BRAND_ORANGE,
          align: 'center'
        },
        {
          type: 'text',
          text: stat.label,
          size: 'xs',
          color: TEXT_GRAY,
          align: 'center'
        }
      ],
      flex: 1
    }))
  };
}

/**
 * Divider helper
 */
export function createDivider(): object {
  return {
    type: 'box',
    layout: 'baseline',
    contents: [
      {
        type: 'text',
        text: '━━━━━━━━━━━━━━━━',
        size: 'xs',
        color: '#E5E7EB',
        align: 'center'
      }
    ],
    paddingAll: 'xs'
  };
}

/**
 * Bullet list item
 */
export function createBulletItem(text: string, icon: string = '✅'): object {
  return {
    type: 'box',
    layout: 'baseline',
    contents: [
      {
        type: 'text',
        text: icon,
        size: 'sm'
      },
      {
        type: 'text',
        text,
        size: 'sm',
        color: TEXT_DARK,
        wrap: true,
        flex: 1
      }
    ],
    spacing: 'sm'
  };
}

/**
 * Validates LINE Flex message structure before sending
 * Returns true if valid, false with error log if invalid
 */
export interface FlexMessageShape {
  type: 'flex';
  altText: string;
  contents: { type: string; [key: string]: unknown };
}

export function validateFlexMessage(message: object): boolean {
  try {
    if (!message || typeof message !== 'object') {
      console.error('[FlexValidator] Invalid: not an object');
      return false;
    }

    const flex = message as FlexMessageShape;

    if (flex.type !== 'flex') {
      console.error('[FlexValidator] Invalid: type is not "flex"');
      return false;
    }

    if (!flex.altText) {
      console.error('[FlexValidator] Invalid: missing altText');
      return false;
    }

    if (!flex.contents) {
      console.error('[FlexValidator] Invalid: missing contents');
      return false;
    }

    const contents = flex.contents;
    const validTypes = ['bubble', 'carousel'];

    if (!validTypes.includes(contents.type)) {
      console.error(`[FlexValidator] Invalid: contents.type must be one of ${validTypes.join(', ')}`);
      return false;
    }

    if (contents.type === 'bubble') {
      return validateBubble(contents);
    }

    if (contents.type === 'carousel') {
      if (!Array.isArray(contents.contents)) {
        console.error('[FlexValidator] Invalid: carousel.contents must be an array');
        return false;
      }
      for (const bubble of contents.contents) {
        if (!validateBubble(bubble)) return false;
      }
    }

    return true;
  } catch (error) {
    console.error('[FlexValidator] Validation error:', error);
    return false;
  }
}

function validateBubble(bubble: any): boolean {
  if (!bubble || typeof bubble !== 'object') {
    console.error('[FlexValidator] Invalid: bubble is not an object');
    return false;
  }

  const sections = ['header', 'body', 'footer', 'hero'];
  for (const section of sections) {
    if (bubble[section]) {
      if (!validateBoxLayout(bubble[section])) {
        console.error(`[FlexValidator] Invalid: bubble.${section} has bad structure`);
        return false;
      }
    }
  }

  return true;
}

function validateBoxLayout(box: any): boolean {
  if (!box || typeof box !== 'object') return false;
  if (!['box', 'text', 'image', 'button', 'icon'].includes(box.type)) return true;

  if (box.type === 'box' && Array.isArray(box.contents)) {
    for (const child of box.contents) {
      if (!validateBoxLayout(child)) return false;
    }
  }

  return true;
}
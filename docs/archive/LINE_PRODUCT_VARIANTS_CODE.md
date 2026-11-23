/**
 * LINE Messaging API Service
 */

export async function sendLineFlexMessage(userId: string, flexContents: any, altText?: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return { success: false, error: 'Configuration missing' };

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ to: userId, messages: [{ type: 'flex', altText: altText || 'Solar Card', contents: flexContents }] })
    });
    return { success: response.ok, data: await response.json() };
  } catch (error) {
    return { success: false, error };
  }
}

export function createLeadFlexMessage(leadData: any) {
  const { name, phone, location, segment, monthly_bill, source, leadId } = leadData;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tawanpower.vercel.app';
  const adminUrl = `${siteUrl}/admin/leads/${leadId || ''}`;
  
  return {
    "type": "bubble",
    "header": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        { "type": "text", "text": "☀️ ข้อมูลลูกค้าใหม่ TAWAN POWER", "weight": "bold", "color": "#059669", "size": "sm" }
      ]
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        { "type": "text", "text": name || "ลูกค้าผู้สนใจบริการ", "weight": "bold", "size": "xl", "margin": "md", "wrap": true },
        {
          "type": "box",
          "layout": "vertical",
          "margin": "lg",
          "spacing": "sm",
          "contents": [
            { "type": "box", "layout": "horizontal", "contents": [{ "type": "text", "text": "📍 สถานที่", "size": "xs", "color": "#888888", "flex": 1 }, { "type": "text", "text": location || "กระบี่", "size": "xs", "color": "#111111", "flex": 2, "align": "end", "wrap": true }] },
            { "type": "box", "layout": "horizontal", "contents": [{ "type": "text", "text": "📞 เบอร์โทร", "size": "xs", "color": "#888888", "flex": 1 }, { "type": "text", "text": phone || "ไม่ระบุ", "size": "xs", "color": "#10B981", "flex": 2, "align": "end", "weight": "bold", "decoration": "underline", "action": { "type": "uri", "label": "Call", "uri": `tel:${phone}` } }] },
            { "type": "box", "layout": "horizontal", "contents": [{ "type": "text", "text": "💰 ค่าไฟ/เดือน", "size": "xs", "color": "#888888", "flex": 1 }, { "type": "text", "text": monthly_bill ? `฿${monthly_bill}` : "ไม่ระบุ", "size": "xs", "color": "#111111", "flex": 2, "align": "end" }] },
            { "type": "box", "layout": "horizontal", "contents": [{ "type": "text", "text": "🏷️ ประเภท", "size": "xs", "color": "#888888", "flex": 1 }, { "type": "text", "text": segment === 'home' ? 'บ้านพักอาศัย' : (segment === 'business' ? 'ธุรกิจ/โรงแรม' : segment), "size": "xs", "color": "#111111", "flex": 2, "align": "end" }] },
            { "type": "box", "layout": "horizontal", "contents": [{ "type": "text", "text": "🔗 แหล่งที่มา", "size": "xs", "color": "#888888", "flex": 1 }, { "type": "text", "text": source === 'Website Form' ? 'แบบฟอร์มหน้าเว็บ' : 'แชท AI', "size": "xs", "color": "#059669", "flex": 2, "align": "end", "weight": "bold" }] }
          ]
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "spacing": "sm",
      "contents": [
        { "type": "button", "style": "primary", "height": "md", "color": "#10B981", "action": { "type": "uri", "label": "📞 กดเพื่อโทรออก", "uri": `tel:${phone}` } },
        { "type": "button", "style": "secondary", "height": "md", "action": { "type": "uri", "label": "📊 เปิดในระบบจัดการ", "uri": adminUrl } }
      ],
      "flex": 0,
      "paddingTop": "md"
    }
  };
}

/**
 * V4: Minimalist Single Bubble with Large Price Highlight
 * Used by: notify-line/route.ts for product notifications to admin
 * Design Philosophy: Ultra-minimal - price dominates, minimal text, fast scanning
 */
export function createProductFlexMessageV4(product: any) {
  const priceThb = Number(product.price_thb) || 0;
  const powerKw = Number(product.power_kw) || 0;
  const formatPrice = (n: number) => Math.round(n).toLocaleString('th-TH');

  const monthlySavings = Math.round(powerKw * 135 * 4.7);
  const roiYears = priceThb > 0 ? Math.round(priceThb / (monthlySavings * 12)) : 0;

  return {
    type: "bubble" as const,
    size: "mega" as const,
    body: {
      type: "box" as const,
      layout: "vertical" as const,
      contents: [
        {
          type: "box" as const,
          layout: "horizontal" as const,
          contents: [
            {
              type: "box" as const,
              layout: "vertical" as const,
              contents: [
                { type: "text" as const, text: `${powerKw} kW`, size: "3xl" as const, weight: "bold" as const, color: "#10b981" }
              ],
              backgroundColor: "#10b9811a",
              cornerRadius: "md" as const,
            },
            {
              type: "text" as const,
              text: product.name || 'Solar Power',
              size: "xl" as const,
              weight: "bold" as const,
              color: "#0f172a",
              flex: 1,
              margin: "md"
            }
          ]
        },
        {
          type: "box" as const,
          layout: "vertical" as const,
          contents: [
            { type: "text" as const, text: `฿${formatPrice(priceThb)}`, size: "4xl" as const, weight: "bold" as const, color: "#0f172a", align: "center" as const },
            { type: "text" as const, text: `ประหยัด ฿${formatPrice(monthlySavings)}/เดือน`, size: "lg" as const, color: "#10b981", align: "center" as const, weight: "bold" as const }
          ],
          backgroundColor: "#f0fdf4",
          cornerRadius: "lg" as const
        },
        {
          type: "box" as const,
          layout: "horizontal" as const,
          contents: [
            { type: "text" as const, text: `คืนทุน ${roiYears} ปี`, size: "md" as const, color: "#64748b", flex: 1 },
            { type: "text" as const, text: product.brand || 'TAWAN POWER', size: "sm" as const, color: "#64748b" }
          ],
          margin: "md"
        },
        {
          type: "button" as const,
          style: "primary" as const,
          height: "lg" as const,
          color: "#10b981",
          action: { type: "message" as const, label: "จองสิทธิ์ 10% ทันที", text: `สนใจ ${product.name || 'Solar System'} ครับ สิทธิ์หัก 10%` }
        }
      ]
    }
  };
}

export const PRODUCT_CARD_VARIANTS = {
  V4: createProductFlexMessageV4
};

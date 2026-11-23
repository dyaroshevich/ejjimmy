import { FEATURES } from './feature-flags';
import { brand, contact, siteUrl } from './site.config';

export function createLeadFlexMessage(leadData: any) {
  return {
    type: 'flex',
    altText: 'New Lead',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: 'New Lead: ' + leadData.name, weight: 'bold' },
          { type: 'text', text: 'Phone: ' + leadData.phone },
          { type: 'text', text: 'Location: ' + leadData.location }
        ]
      }
    }
  };
}

/**
 * LINE Flex Message Builders
 * Creates all Flex messages for LINE chatbot responses.
 * Fully redesigned according to 'Breezy Premium' system.
 * Optimized for 'Ultra-Safe' rendering (mandatory contents: []).
 */

const BRAND_ORANGE = '#FF8A00';
const BRAND_DARK = '#1A0E00';
const BRAND_LIGHT = '#FFF7ED';
const TEXT_GRAY = '#9CA3AF';
const TEXT_DARK = '#1F2937';

// --- HELPERS ---

const getProductImage = (p: any) => {
  // One origin for every flex image, from `site.config.ts`: these URLs are what a LINE client
  // fetches, so a template that keeps the old domain serves a franchisee the founder's photos.
  const fallback = `${siteUrl}/images/hero-solar.jpg`;
  if (!p) return fallback;
  let path = p.image_url;
  if (p.gallery && p.gallery.length > 1) path = p.gallery[1];
  else if (p.gallery && p.gallery.length === 1) path = p.gallery[0];
  if (!path) return fallback;
  const pngPath = path.replace(/\.webp$/, '.png');
  if (pngPath.startsWith('http')) return pngPath;
  return `${siteUrl}${pngPath.startsWith('/') ? '' : '/'}${pngPath}`;
};

export function createQuickReplies(items: { label: string; data: string }[]) {
  return {
    quickReply: {
      items: items.map(item => ({
        type: 'action',
        action: {
          type: 'postback',
          label: item.label,
          data: item.data,
          displayText: item.label
        }
      }))
    }
  };
}

// Updated Quick Replies for the AI consultation flow
export const getAiConsultQuickReplies = () => createQuickReplies([
  { label: '📦 ชมแคตตาล็อกสินค้า', data: 'action=catalog' },
  { label: '🗺️ ชมผลงานติดตั้งจริง', data: 'action=cases' },
  { label: '📋 ขอใบเสนอราคาทางการ', data: 'action=lead_solar' },
  { label: '📞 ติดต่อทีมวิศวกร', data: 'action=contact' }
]);


export function createErrorMessage(text: string): any {
  return { type: 'text', text: `❌ ${text}\n\nลองใหม่อีกครั้งนะครับ หรือติดต่อทีมงานโดยตรงได้ทันทีครับ 🙏` };
}

// --- PHASE 1: WELCOME ---

export function createWelcomeMessage(): any {
  const heroImage = `${siteUrl}/images/hero-solar.jpg`;

  return {
    type: 'flex',
    altText: `ยินดีต้อนรับสู่${brand.nameTh}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'horizontal',
        paddingAll: '20px',
        backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            flex: 4,
            contents: [
              { type: 'text', text: `${brand.nameTh} ${brand.name}`, weight: 'bold', color: '#FF8A00', size: 'lg', contents: [] },
              { type: 'text', text: 'ผู้เชี่ยวชาญด้านโซลาร์เซลล์', size: 'xxs', color: '#64748B', margin: 'xs', weight: 'bold', contents: [] }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            flex: 2,
            contents: [{ type: 'text', text: 'กระบี่', size: 'xxs', color: '#F59E0B', weight: 'bold', align: 'end', contents: [] }],
            justifyContent: 'center'
          }
        ]
      },
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [{ type: 'image', url: heroImage, size: 'full', aspectRatio: '20:10', aspectMode: 'cover' }]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#F8FAFC',
        paddingAll: '20px',
        spacing: 'xl',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: ' ',
                contents: [
                  { "type": "span", "text": "สวัสดีครับ! ผม ", "color": "#1E293B", "size": "sm" },
                  { "type": "span", "text": "แทน", "weight": "bold", "color": "#FF8A00" }
                ]
              },
              {
                type: 'text',
                text: 'ผู้เชี่ยวชาญโซลาร์เซลล์ประจำจังหวัดกระบี่ ยินดีที่ได้แนะนำระบบที่คุ้มค่าและประหยัดที่สุดสำหรับคุณครับ',
                size: 'xs', color: '#64748B', margin: 'sm', wrap: true, lineSpacing: '3px', contents: []
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'md',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#FFFFFF',
                    cornerRadius: 'xl',
                    paddingAll: '12px',
                    flex: 1,
                    borderWidth: '1px',
                    borderColor: '#F1F5F9',
                    action: { "type": "uri", "label": "เข้าชมเว็บไซต์", "uri": siteUrl },
                    contents: [
                      { "type": "text", "text": "🌐", "size": "lg", "align": "center", contents: [] },
                      { "type": "text", "text": "ชมเว็บไซต์", "size": "xxs", "weight": "bold", "color": "#1E293B", "align": "center", "margin": "xs", contents: [] }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#FFFFFF',
                    cornerRadius: 'xl',
                    paddingAll: '12px',
                    flex: 1,
                    borderWidth: '1px',
                    borderColor: '#F1F5F9',
                    action: { "type": "postback", "data": "action=cases", "displayText": "ชมผลงานติดตั้งจริง" },
                    contents: [
                      { "type": "text", "text": "🗺️", "size": "lg", "align": "center", contents: [] },
                      { "type": "text", "text": "ชมผลงานจริง", "size": "xxs", "weight": "bold", "color": "#1E293B", "align": "center", "margin": "xs", contents: [] }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#FFFFFF',
                    cornerRadius: 'xl',
                    paddingAll: '12px',
                    flex: 1,
                    borderWidth: '1px',
                    borderColor: '#F1F5F9',
                    action: { "type": "postback", "data": "action=catalog", "displayText": "ชมแคตตาล็อกสินค้า" },
                    contents: [
                      { "type": "text", "text": "📦", "size": "lg", "align": "center", contents: [] },
                      { "type": "text", "text": "ชุดระบบโซลาร์", "size": "xxs", "weight": "bold", "color": "#1E293B", "align": "center", "margin": "xs", contents: [] }
                    ]
                  }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                spacing: 'md',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#FFFFFF',
                    cornerRadius: 'xl',
                    paddingAll: '12px',
                    flex: 1,
                    borderWidth: '1px',
                    borderColor: '#F1F5F9',
                    action: { "type": "postback", "data": "action=calculator", "displayText": "คำนวณค่าไฟ" },
                    contents: [
                      { "type": "text", "text": "⚡", "size": "lg", "align": "center", contents: [] },
                      { "type": "text", "text": "คำนวณค่าไฟ", "size": "xxs", "weight": "bold", "color": "#1E293B", "align": "center", "margin": "xs", contents: [] }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#FFFFFF',
                    cornerRadius: 'xl',
                    paddingAll: '12px',
                    flex: 1,
                    borderWidth: '1px',
                    borderColor: '#F1F5F9',
                    action: { "type": "postback", "data": "action=promotion", "displayText": "ดูโปรโมชั่น" },
                    contents: [
                      { "type": "text", "text": "💰", "size": "lg", "align": "center", contents: [] },
                      { "type": "text", "text": "การผ่อนชำระ", "size": "xxs", "weight": "bold", "color": "#1E293B", "align": "center", "margin": "xs", contents: [] }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    backgroundColor: '#FFFFFF',
                    cornerRadius: 'xl',
                    paddingAll: '12px',
                    flex: 1,
                    borderWidth: '1px',
                    borderColor: '#F1F5F9',
                    action: { "type": "postback", "data": "action=lead_solar", "displayText": "ขอใบเสนอราคาทางการ" },
                    contents: [
                      { "type": "text", "text": "📋", "size": "lg", "align": "center", contents: [] },
                      { "type": "text", "text": "ข้อเสนอส่วนตัว", "size": "xxs", "weight": "bold", "color": "#1E293B", "align": "center", "margin": "xs", contents: [] }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FF8A00',
            cornerRadius: 'md',
            paddingAll: '12px',
            justifyContent: 'center',
            action: { "type": "postback", "label": "ประเมินความคุ้มค่าฟรี", "data": "action=calculator", "displayText": "เริ่มประเมินความคุ้มค่าครับ" },
            contents: [{ "type": "text", "text": "⚡ เริ่มประเมินความคุ้มค่าฟรี", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", contents: [] }]
          }
        ]
      }
    }
  };
}

// --- PHASE 2: CATALOG & FILTER ---

export function createCatalogFilterMessage(): any {
  return {
    type: 'flex',
    altText: 'เลือกหมวดหมู่สินค้า',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        backgroundColor: '#FFFFFF',
        contents: [
          { "type": "text", "text": "CATALOG", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] },
          { "type": "text", "text": "แคตตาล็อกสินค้า", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        spacing: 'md',
        backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'md',
                paddingAll: 'md',
                flex: 1,
                action: { type: 'postback', data: 'action=catalog&filter=residential', displayText: 'ชมแพ็กเกจสำหรับที่พักอาศัย' },
                contents: [{ type: 'text', text: '🏠 บ้านพักอาศัย', size: 'xs', weight: 'bold', color: '#1E293B', align: 'center', contents: [] }]
              },
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'md',
                paddingAll: 'md',
                flex: 1,
                action: { type: 'postback', data: 'action=catalog&filter=commercial', displayText: 'ชมแพ็กเกจธุรกิจและองค์กร' },
                contents: [{ type: 'text', text: '🏪 ร้านค้า/SME', size: 'xs', weight: 'bold', color: '#1E293B', align: 'center', contents: [] }]
              }
            ]
          },
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'md',
                paddingAll: 'md',
                flex: 1,
                action: { type: 'postback', data: 'action=catalog&filter=industrial', displayText: 'ชมแพ็กเกจสำหรับโรงงานอุตสาหกรรม' },
                contents: [{ type: 'text', text: '🏭 โรงงาน', size: 'xs', weight: 'bold', color: '#1E293B', align: 'center', contents: [] }]
              },
              {
                type: 'box',
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                cornerRadius: 'md',
                paddingAll: 'md',
                flex: 1,
                action: { type: 'postback', data: 'action=catalog&filter=battery', displayText: 'ชมระบบเก็บกักพลังงาน' },
                contents: [{ type: 'text', text: '🔋 แบตเตอรี่', size: 'xs', weight: 'bold', color: '#1E293B', align: 'center', contents: [] }]
              }
            ]
          }
        ]
      }
    }
  };
}

export function createCatalogCarousel(products: any[]): any {
  const safe = (v: any, fallback: any) => (v == null ? fallback : v);
  const bubbles = products.slice(0, 10).map(p => {
    const specs = p.specifications || {};
    const savingsValue = specs.monthly_savings?.replace(/[~฿,]/g, '') || '0';
    const formattedSavings = parseInt(savingsValue).toLocaleString('th-TH');
    const priceValue = p.price_thb ? `฿${p.price_thb.toLocaleString('th-TH')}` : 'ติดต่อเจ้าหน้าที่';
    const payback = specs.payback_period || '4-5 ปี';
    const displaySpecs = [
      { label: 'แผงโซลาร์', value: p.brand || 'Tier 1 Standard' },
      { label: 'อินเวอร์เตอร์', value: p.model || 'High Efficiency' },
      { label: 'ประกันระบบ', value: specs.system_warranty || '5 ปี (On-site)' }
    ];

    return {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'image', url: getProductImage(p), size: 'full', aspectRatio: '20:13', aspectMode: 'cover' },
          {
            type: 'box',
            layout: 'vertical',
            position: 'absolute',
            backgroundColor: '#FF8A00',
            cornerRadius: 'md',
            paddingAll: '8px', paddingStart: '12px', paddingEnd: '12px',
            offsetTop: '15px', offsetStart: '15px',
            contents: [{ "type": "text", "text": "แพ็กเกจยอดนิยม", "color": "#FFFFFF", "size": "xxs", "weight": "bold", contents: [] }]
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingTop: '24px', paddingStart: '24px', paddingEnd: '24px', paddingBottom: '0px',
        backgroundColor: '#FFFFFF',
        contents: [
          { type: 'text', text: safe(p.name, 'Solar Package'), weight: 'bold', size: 'xl', color: '#0F172A', contents: [] },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'xs',
            contents: [
              { type: 'text', text: ' ', contents: [{ "type": "span", "text": "ราคาติดตั้ง: ", "color": "#64748B", "size": "xs" }, { "type": "span", "text": priceValue, "weight": "bold", "color": "#0F172A", "size": "lg" }] },
              { type: 'text', text: ' ', contents: [{ "type": "span", "text": "คืนทุนภายใน: ", "color": "#64748B", "size": "xs" }, { "type": "span", "text": payback, "weight": "bold", "color": "#F59E0B", "size": "sm" }] }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'xl',
            backgroundColor: '#F0FDF4',
            paddingAll: '16px',
            cornerRadius: 'lg',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                contents: [
                  { "type": "text", "text": "ช่วยคุณประหยัด", "size": "xs", "color": "#059669", "flex": 0, contents: [] },
                  { "type": "text", "text": `฿${formattedSavings}`, "weight": "bold", "color": "#10B981", "size": "xl", "margin": "md", "flex": 0, contents: [] },
                  { "type": "text", "text": "/เดือน", "size": "xs", "color": "#059669", "margin": "xs", "flex": 0, contents: [] }
                ]
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'xl',
            spacing: 'sm',
            contents: displaySpecs.map(s => ({
              type: 'box',
              layout: 'horizontal',
              contents: [
                { "type": "text", "text": s.label, "size": "xs", "color": "#94A3B8", "flex": 2, contents: [] },
                { "type": "text", "text": s.value, "size": "xs", "weight": "bold", "color": "#334155", "flex": 3, "align": "end", contents: [] }
              ]
            }))
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingTop: '20px', paddingStart: '24px', paddingEnd: '24px', paddingBottom: '24px',
        backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            spacing: 'md',
            contents: [
              {
                type: 'box',
                layout: 'vertical', flex: 1, backgroundColor: '#F1F5F9', cornerRadius: 'md',
                action: { "type": "postback", "data": `action=product_detail&id=${p.id || ''}`, "displayText": "ชมรายละเอียดทางเทคนิค" },
                paddingAll: '12px', justifyContent: 'center',
                contents: [{ "type": "text", "text": "🔍 เจาะลึกสเปก", "align": "center", "size": "xs", "weight": "bold", "color": "#475569", contents: [] }]
              },
              {
                type: 'box',
                layout: 'vertical', flex: 1, backgroundColor: '#F1F5F9', cornerRadius: 'md',
                action: { "type": "postback", "data": `action=download_spec&productId=${p.id || ''}`, "displayText": "ขอดาวน์โหลด Datasheet ครับ" },
                paddingAll: '12px', justifyContent: 'center',
                contents: [{ "type": "text", "text": "📄 Datasheet", "align": "center", "size": "xs", "weight": "bold", "color": "#475569", contents: [] }]
              }
            ]
          },
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md',
            action: { type: 'postback', label: '✅ เลือกแพ็กเกจนี้', data: `action=lead_solar&product=${p.id || ''}&size=${safe(p.power_kw, 0)}`, displayText: `สนใจติดตั้งชุด ${p.name} ครับ` },
            paddingAll: '12px', justifyContent: 'center',
            contents: [{ "type": "text", "text": "✅ เลือกแพ็กเกจนี้", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", contents: [] }]
          }
        ]
      }
    };
  });
  return { type: 'flex', altText: `Catalog - ${brand.name}`, contents: { type: 'carousel', contents: bubbles } };
}

// --- PHASE 3: PRODUCT DETAIL ---

export function createLocationMessage(data: { title: string, address: string, lat: any, lng: any }): any {
  const lat = typeof data.lat === 'string' ? parseFloat(data.lat) : data.lat;
  const lng = typeof data.lng === 'string' ? parseFloat(data.lng) : data.lng;

  // Validation to prevent LINE app crashes on invalid coords
  if (isNaN(lat) || isNaN(lng)) {
    return { type: 'text', text: `📍 ${data.title}\n${data.address}\n(ขออภัยครับ ไม่พบข้อมูลพิกัดในขณะนี้)` };
  }

  return {
    type: 'location',
    title: data.title,
    address: data.address,
    latitude: lat,
    longitude: lng
  };
}

export function createCasesCarousel(cases: any[]): any {
  
  const bubbles = cases.slice(0, 10).map(c => {
    const coverPath = c.media_assets?.cover || 'hero-solar.jpg';
    const imageUrl = coverPath.startsWith('http') ? coverPath : `${siteUrl}/images/${coverPath}`;
    
    // Video Support (Phase 3 "Wow" Effect)
    const videoFile = c.media_assets?.video;
    const videoUrl = videoFile ? (videoFile.startsWith('http') ? videoFile : `${siteUrl}/videos/${videoFile}`) : null;

    const heroContent: any = videoUrl ? {
      type: 'video',
      url: videoUrl,
      previewUrl: imageUrl,
      altContent: {
        type: 'image',
        url: imageUrl,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover'
      },
      aspectRatio: '20:13'
    } : {
      type: 'box',
      layout: 'vertical',
      contents: [
        { type: 'image', url: imageUrl, size: 'full', aspectRatio: '20:13', aspectMode: 'cover' },
        {
          type: 'box',
          layout: 'vertical',
          position: 'absolute',
          backgroundColor: '#FF8A00',
          cornerRadius: 'md',
          paddingAll: '8px',
          offsetTop: '15px', offsetStart: '15px',
          contents: [{ "type": "text", "text": "ผลงานความภูมิใจ", "color": "#FFFFFF", "size": "xxs", "weight": "bold", contents: [] }]
        }
      ]
    };

    return {
      type: 'bubble',
      size: 'mega',
      hero: heroContent,
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '24px',
        backgroundColor: '#FFFFFF',
        contents: [
          { type: 'text', text: c.customer_name || 'Project Installation', weight: 'bold', size: 'xl', color: '#0F172A', contents: [] },
          { type: 'text', text: `📍 ${c.location_name || 'Krabi'}`, size: 'xs', color: '#64748B', margin: 'xs', contents: [] },
          
          // Performance Metric
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            backgroundColor: '#F0FDF4',
            paddingAll: '12px',
            cornerRadius: 'md',
            contents: [
              { type: 'text', text: `⚡ ระบบ ${c.system_kw} kW`, weight: 'bold', size: 'sm', color: '#10B981', flex: 1, contents: [] },
              { type: 'text', text: `⏱️ ติดตั้ง ${c.metadata?.mounting_time || '3 วัน'}`, size: 'xs', color: '#059669', align: 'end', flex: 1, contents: [] }
            ]
          },

          // Hardware & Value
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            spacing: 'xs',
            contents: [
              {
                type: 'box', layout: 'horizontal', contents: [
                  { type: 'text', text: 'Inverter/Battery', size: 'xxs', color: '#94A3B8', flex: 2, contents: [] },
                  { type: 'text', text: `${c.inverter_brand || 'Deye'} + ${c.metadata?.battery || 'Dyness'}`, size: 'xxs', color: '#475569', flex: 3, align: 'end', weight: 'bold', contents: [] }
                ]
              },
              {
                type: 'box', layout: 'horizontal', contents: [
                  { type: 'text', text: 'Investment', size: 'xxs', color: '#94A3B8', flex: 2, contents: [] },
                  { type: 'text', text: `฿${(c.metadata?.total_investment || 576000).toLocaleString()}`, size: 'xxs', color: '#0F172A', flex: 3, align: 'end', weight: 'bold', contents: [] }
                ]
              }
            ]
          },

          { type: 'text', text: c.case_description || '', wrap: true, size: 'xxs', color: '#64748B', margin: 'md', lineSpacing: '3px', contents: [] }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '20px',
        backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'postback', label: '📍 ดูตำแหน่งบนแผนที่', data: `action=case_location&id=${c.id}`, displayText: `ขอดูตำแหน่งของ ${c.customer_name} ครับ` },
            contents: [{ type: 'text', text: '📍 ดูตำแหน่งบนแผนที่', align: 'center', size: 'xs', weight: 'bold', color: '#FFFFFF', contents: [] }]
          },
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#F1F5F9', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'uri', label: '🌐 ชมรายละเอียดโครงการ', uri: `${siteUrl}/cases/${c.slug}` },
            contents: [{ type: 'text', text: '🌐 ชมรายละเอียด', align: 'center', size: 'xs', weight: 'bold', color: '#475569', contents: [] }]
          }
        ]
      }
    };
  });
  return { type: 'flex', altText: `ผลงานการติดตั้ง - ${brand.name}`, contents: { type: 'carousel', contents: bubbles } };
}

export function createProductDetailCarousel(p: any): any {
  const safe = (v: any, fallback: any) => (v == null ? fallback : v);
  const specs = p.specifications || {};
  const savingsValue = specs.monthly_savings?.replace(/[~฿,]/g, '') || '0';
  const formattedSavings = parseInt(savingsValue).toLocaleString('th-TH');
  const warrantyYears = specs.inverter_warranty || '5-10 ปี';
  const panelWarranty = specs.panel_warranty || '25 ปี';

  const commonFooter = {
    type: 'box',
    layout: 'vertical',
    paddingAll: '20px',
    backgroundColor: '#FFFFFF',
    contents: [
      {
        type: 'box',
        layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
        action: { type: 'postback', label: '✅ เลือกแพ็กเกจนี้', data: `action=lead_solar&product=${p.id || ''}&size=${safe(p.power_kw, 0)}`, displayText: `สนใจติดตั้งชุด ${p.name} ครับ` },
        contents: [{ type: 'text', text: '✅ เลือกแพ็กเกจนี้', align: 'center', size: 'sm', weight: 'bold', color: '#FFFFFF', contents: [] }]
      },
      { type: 'text', text: 'เลื่อนขวาเพื่อชมข้อมูลเพิ่มเติม ⮕', size: 'xxs', color: '#94A3B8', align: 'center', margin: 'md', contents: [] }
    ]
  };

  const bubbles = [
    {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'horizontal', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ type: 'box', layout: 'vertical', flex: 1, contents: [{ "type": "text", "text": "HARDWARE", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": "ส่วนประกอบหลัก", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }] }]
      },
      hero: { type: 'box', layout: 'vertical', contents: [{ type: 'image', url: getProductImage(p), size: 'full', aspectRatio: '20:11', aspectMode: 'cover' }] },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'md', backgroundColor: '#F8FAFC',
        contents: [
          { type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', paddingAll: '16px', cornerRadius: 'md', contents: [{ "type": "text", "text": "🛡️ แผงโซลาร์เซลล์", "weight": "bold", "size": "xs", "color": "#0F172A", contents: [] }, { "type": "text", "text": `${safe(p.brand, 'Tier 1')} - แผงเกรดประสิทธิภาพสูง ทนความร้อนเมืองไทย ประกันผลผลิตยาวนาน`, "wrap": true, "size": "xxs", "color": "#64748B", "margin": "sm", contents: [] }] },
          { type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', paddingAll: '16px', cornerRadius: 'md', contents: [{ "type": "text", "text": "🔌 อินเวอร์เตอร์", "weight": "bold", "size": "xs", "color": "#0F172A", contents: [] }, { "type": "text", "text": `${safe(p.model, 'AI Hybrid')} - ระบบอัจฉริยะ รองรับแบตเตอรี่ พร้อมแอปฯ ติดตามไฟ 24 ชม.`, "wrap": true, "size": "xxs", "color": "#64748B", "margin": "sm", contents: [] }] }
        ]
      },
      footer: commonFooter
    },
    {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'horizontal', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ type: 'box', layout: 'vertical', flex: 1, contents: [{ "type": "text", "text": "VALUE & WARRANTY", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": "ความคุ้มค่าและการรับประกัน", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }] }]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'lg', backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box', layout: 'vertical', backgroundColor: '#F0FDF4', paddingAll: '16px', cornerRadius: 'lg',
            contents: [{ "type": "text", "text": "📉 ช่วยคุณประหยัดเงินได้สูงสุด", "size": "xxs", "color": "#059669", "align": "center", "weight": "bold", contents: [] }, { "type": "text", "text": `฿${formattedSavings} /เดือน`, "weight": "bold", "color": "#10B981", "size": "xl", "align": "center", "margin": "sm", contents: [] }]
          },
          {
            type: 'box', layout: 'vertical', spacing: 'sm',
            contents: [
              { type: 'box', layout: 'horizontal', contents: [{ "type": "text", "text": "🛡️ ประกันอินเวอร์เตอร์", "size": "xs", "color": "#64748B", "flex": 3, contents: [] }, { "type": "text", "text": warrantyYears, "size": "xs", "weight": "bold", "color": "#0F172A", "flex": 2, "align": "end", contents: [] }] },
              { type: 'box', layout: 'horizontal', contents: [{ "type": "text", "text": "🛡️ ประกันแผงโซลาร์", "size": "xs", "color": "#64748B", "flex": 3, contents: [] }, { "type": "text", "text": panelWarranty, "size": "xs", "weight": "bold", "color": "#0F172A", "flex": 2, "align": "end", contents: [] }] },
              { type: 'box', layout: 'horizontal', contents: [{ "type": "text", "text": "🛡️ ประกันงานติดตั้ง", "size": "xs", "color": "#64748B", "flex": 3, contents: [] }, { "type": "text", "text": "3 ปี (On-site)", "size": "xs", "weight": "bold", "color": "#0F172A", "flex": 2, "align": "end", contents: [] }] }
            ]
          }
        ]
      },
      footer: commonFooter
    },
    {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'horizontal', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ type: 'box', layout: 'vertical', flex: 1, contents: [{ "type": "text", "text": "SERVICES", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": "บริการและการติดตั้ง", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }] }]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'md', backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', paddingAll: '16px', cornerRadius: 'md',
            contents: [
              { "type": "text", "text": "✨ สิ่งที่คุณจะได้รับ:", "weight": "bold", "size": "xs", "color": "#FF8A00", contents: [] },
              { "type": "text", "text": "• สำรวจหน้างานและออกแบบฟรี\n• ดำเนินการขออนุญาต PEA/ERC\n• ติดตั้งมาตรฐานวิศวกรรม\n• ล้างแผงฟรี 2 ครั้ง (ปีแรก)", "wrap": true, "size": "xxs", "color": "#64748B", "margin": "md", "lineSpacing": "5px", contents: [] }
            ]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', paddingAll: '16px', cornerRadius: 'md',
            contents: [
              { "type": "text", "text": "📅 การดูแลหลังการขาย:", "weight": "bold", "size": "xs", "color": "#FF8A00", contents: [] },
              { "type": "text", "text": "• ทีมวิศวกรดูแลในพื้นที่กระบี่\n• ตรวจเช็คระบบฟรีทุก 6 เดือน\n• แอปฯ มอนิเตอร์ภาษาไทย", "wrap": true, "size": "xxs", "color": "#64748B", "margin": "md", "lineSpacing": "5px", contents: [] }
            ]
          }
        ]
      },
      footer: commonFooter
    },
    {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'horizontal', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ type: 'box', layout: 'vertical', flex: 1, contents: [{ "type": "text", "text": "PORTFOLIO", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": "ผลงานติดตั้งจริง", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }] }]
      },
      hero: { type: 'box', layout: 'vertical', contents: [{ type: 'image', url: `${siteUrl}/images/hero-solar.jpg`, size: 'full', aspectRatio: '20:11', aspectMode: 'cover' }] },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', backgroundColor: '#F8FAFC',
        contents: [
          { "type": "text", "text": "📍 กระบี่ และใกล้เคียง", "weight": "bold", "size": "sm", "color": "#0F172A", contents: [] },
          { "type": "text", "text": `เรามีลูกค้ากว่า 50+ รายในพื้นที่ ที่ไว้วางใจให้${brand.nameTh} ดูแลระบบพลังงานแสงอาทิตย์`, "wrap": true, "size": "xxs", "color": "#64748B", "margin": "sm", contents: [] }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'postback', label: '✅ เลือกแพ็กเกจนี้', data: `action=lead_solar&product=${p.id || ''}&size=${safe(p.power_kw, 0)}`, displayText: `สนใจติดตั้งชุด ${p.name} ครับ` },
            contents: [{ type: 'text', text: '✅ เลือกแพ็กเกจนี้', align: 'center', size: 'sm', weight: 'bold', color: '#FFFFFF', contents: [] }]
          }
        ]
      }
    }
  ];
  return { type: 'flex', altText: `รายละเอียดชุด ${p.name}`, contents: { type: 'carousel', contents: bubbles } };
}

// --- PHASE 4: INTERACTIVE FLOWS ---

export interface CalcResult {
  systemKw: number;
  estimatedPrice: number;
  monthlySavings: number;
  annualSavings: number;
  paybackYears: number;
  co2Reduction: number;
  monthlyPayment?: number;
  billRange: string;
  systemType: string;
  roofType: string;
  location: string;
}

export function createCalcResultMessage(result: CalcResult): any {
  // Generic installment calc (36 months, 10% down). Sofin-specific logic removed — see docs/SOFIN_FEATURE_FLAG.md
  const installmentPayment = Math.round((result.estimatedPrice * 0.9) / 36);
  const liffUrl = process.env.NEXT_PUBLIC_LINE_LIFF_URL || 'https://liff.line.me/2010020881-koR53fSr';
  const shareUrl = `${liffUrl}?action=share&kw=${result.systemKw}&save=${result.monthlySavings}&loc=${result.location}`;

  return {
    type: 'flex', altText: 'ผลการคำนวณโซลาร์เซลล์ของคุณ',
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '24px', backgroundColor: '#FFFFFF',
        contents: [
          { "type": "text", "text": "EXCLUSIVE ANALYSIS", "color": "#FF8A00", "weight": "bold", "size": "xxs", "letterSpacing": "2px", contents: [] },
          { "type": "text", "text": "ผลวิเคราะห์ความคุ้มค่า", "weight": "bold", "size": "xl", "color": "#0F172A", "margin": "sm", contents: [] }
        ]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'xl', backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box', layout: 'horizontal', spacing: 'md',
            contents: [
              { 
                type: 'box', layout: 'vertical', flex: 1, backgroundColor: '#FFFFFF', cornerRadius: 'xl', paddingAll: '16px', borderWidth: '1px', borderColor: '#F1F5F9', 
                contents: [
                  { type: 'text', text: '⚡ ขนาดแนะนำ', size: 'xxs', color: '#94A3B8', align: 'center', weight: 'bold', contents: [] }, 
                  { type: 'text', text: `${result.systemKw} kW`, weight: 'bold', size: 'lg', color: '#FF8A00', align: 'center', margin: 'sm', contents: [] }
                ] 
              },
              { 
                type: 'box', layout: 'vertical', flex: 1, backgroundColor: '#FFFFFF', cornerRadius: 'xl', paddingAll: '16px', borderWidth: '1px', borderColor: '#F1F5F9', 
                contents: [
                  { type: 'text', text: '📈 ประหยัด/เดือน', size: 'xxs', color: '#94A3B8', align: 'center', weight: 'bold', contents: [] }, 
                  { type: 'text', text: `฿${result.monthlySavings.toLocaleString('th-TH')}`, weight: 'bold', size: 'lg', color: '#0F172A', align: 'center', margin: 'sm', contents: [] }
                ] 
              }
            ]
          },
          {
            type: 'box', layout: 'vertical', spacing: 'md', backgroundColor: '#FFFFFF', paddingAll: '16px', cornerRadius: 'xl',
            contents: [
              { type: 'box', layout: 'horizontal', contents: [{ "type": "text", "text": "💎 ประมาณการระบบ", "size": "xs", "color": "#64748B", "flex": 1, contents: [] }, { "type": "text", "text": `฿${result.estimatedPrice.toLocaleString('th-TH')}`, size: 'xs', weight: 'bold', color: '#0F172A', align: 'end', contents: [] }] },
              { type: 'box', layout: 'horizontal', contents: [{ "type": "text", "text": "⏱️ คืนทุนภายใน", "size": "xs", "color": "#64748B", "flex": 1, contents: [] }, { "type": "text", "text": `${result.paybackYears} ปี`, size: 'xs', weight: 'bold', color: '#FF8A00', align: 'end', contents: [] }] },
              { type: 'box', layout: 'horizontal', contents: [{ "type": "text", "text": "💳 ผ่อนชำระ (36 เดือน)", "size": "xs", "color": "#64748B", "flex": 1, contents: [] }, { "type": "text", "text": `฿${installmentPayment.toLocaleString('th-TH')}/ด`, size: 'xs', weight: 'bold', color: '#F59E0B', align: 'end', contents: [] }] }
            ]
          },
          {
            type: 'box', layout: 'vertical', paddingAll: '12px', cornerRadius: 'lg', backgroundColor: '#ECFDF5',
            contents: [
              { type: 'text', text: `คุณช่วยโลกประหยัด CO₂ ได้กว่า ${result.co2Reduction.toFixed(1)} ตัน/ปี 🌿`, size: 'xxs', color: '#059669', align: 'center', weight: 'bold', wrap: true, contents: [] }
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '24px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'xl', paddingAll: '14px', justifyContent: 'center',
            action: { type: 'postback', label: '💎 ชมข้อเสนอส่วนตัวของคุณ', data: `action=generate_pdf&size=${result.systemKw}&bill=${result.billRange}&loc=${result.location}`, displayText: 'ขอชมข้อเสนอส่วนตัวครับ' },
            contents: [{ "type": "text", "text": "💎 ชมข้อเสนอส่วนตัวของคุณ", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", contents: [] }]
          },
          {
            type: 'box',
            layout: 'horizontal', spacing: 'md',
            contents: [
              {
                type: 'box',
                layout: 'vertical', backgroundColor: '#F8FAFC', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center', flex: 1, borderWidth: '1px', borderColor: '#F1F5F9',
                action: { type: 'uri', label: '📤 แชร์ผลลัพธ์', uri: `https://line.me/R/msg/text/?${encodeURIComponent('ตรวจสอบค่าประหยัดโซลาร์เซลล์ของคุณได้ที่นี่! ' + shareUrl)}` },
                contents: [{ type: 'text', text: '📤 แชร์', align: 'center', size: 'xs', weight: 'bold', color: '#64748B', contents: [] }]
              },
              {
                type: 'box',
                layout: 'vertical', backgroundColor: '#F8FAFC', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center', flex: 1, borderWidth: '1px', borderColor: '#F1F5F9',
                action: { type: 'postback', label: '🔄 คำนวณใหม่', data: 'action=calc_restart', displayText: 'เริ่มคำนวณใหม่' },
                contents: [{ type: 'text', text: '🔄 ใหม่', align: 'center', size: 'xs', weight: 'bold', color: '#64748B', contents: [] }]
              }
            ]
          }
        ]
      }
    }
  };
}

export function createCalcStepMessage(data: { 
  step: string, 
  selections?: { range?: string, type?: string, roof?: string, loc?: string } 
}): any {
  const steps: Record<string, { num: number, title: string, subtitle: string }> = {
    'bill_range': { num: 1, title: 'เลือกค่าไฟฟ้า', subtitle: 'ค่าไฟฟ้าต่อเดือนโดยเฉลี่ยประมาณเท่าไหร่ครับ?' },
    'system_type': { num: 2, title: 'ประเภทอาคาร', subtitle: 'ต้องการติดตั้งที่ไหนครับ?' },
    'roof_type': { num: 3, title: 'ประเภทหลังคา', subtitle: 'หลังคาเป็นแบบไหนครับ?' },
    'location': { num: 4, title: 'พื้นที่ติดตั้ง', subtitle: 'ติดตั้งในจังหวัดไหนครับ?' }
  };
  const current = steps[data.step] || steps['bill_range'];

  const selections = data.selections || {};
  const previousChoices: any[] = [];
  
  if (current.num > 1 && selections.range) {
    previousChoices.push({ type: 'text', text: `💰 ค่าไฟ: ${getBillLabel(selections.range)} ✅`, size: 'sm', color: '#FF8A00', margin: 'xs', contents: [] });
  }
  if (current.num > 2 && selections.type) {
    const typeLabel = selections.type === 'residential' ? 'บ้านพักอาศัย' : selections.type === 'commercial' ? 'ร้านค้า / ออฟฟิศ' : 'โรงงาน';
    previousChoices.push({ type: 'text', text: `🏠 ประเภท: ${typeLabel} ✅`, size: 'sm', color: '#FF8A00', margin: 'xs', contents: [] });
  }
  if (current.num > 3 && selections.roof) {
    const roofLabel = selections.roof === 'concrete' ? 'หลังคาคอนกรีต' : selections.roof === 'metal' ? 'หลังคาเมทัลชีท' : 'บนพื้นดิน';
    previousChoices.push({ type: 'text', text: `🏗️ หลังคา: ${roofLabel} ✅`, size: 'sm', color: '#FF8A00', margin: 'xs', contents: [] });
  }

  const buttons: any[] = [];
  if (data.step === 'bill_range') {
    const ranges = [
      { l: '2-4k', v: '2-4k', icon: '🥉' },
      { l: '4-6k', v: '4-6k', icon: '🥈' },
      { l: '6-8k', v: '6-8k', icon: '🥇' },
      { l: '8-10k', v: '8-10k', icon: '💎' },
      { l: '10-15k', v: '10-15k', icon: '🏢' },
      { l: '15-20k', v: '15-20k', icon: '🏢' },
      { l: '20-30k', v: '20-30k', icon: '🏭' },
      { l: '30-40k', v: '30-40k', icon: '🏭' },
      { l: '40-50k', v: '40-50k', icon: '⚡' },
      { l: '50k+', v: '50k+', icon: '🚀' }
    ];

    // Create 2-column grid
    for (let i = 0; i < ranges.length; i += 2) {
      const row = {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        margin: 'sm',
        contents: [] as any[]
      };

      [ranges[i], ranges[i+1]].forEach(r => {
        if (!r) return;
        row.contents.push({
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#FFFFFF',
          cornerRadius: 'md',
          paddingAll: '10px',
          flex: 1,
          borderWidth: '1px',
          borderColor: '#F1F5F9',
          action: { type: 'postback', label: r.l, data: `action=calc_step&step=bill&range=${r.v}`, displayText: r.l + ' ฿' },
          contents: [
            { type: 'text', text: r.icon, align: 'center', size: 'sm', contents: [] },
            { type: 'text', text: r.l + ' ฿', align: 'center', weight: 'bold', color: '#1E293B', size: 'xs', margin: 'xs', contents: [] }
          ]
        });
      });

      buttons.push(row);
    }
  } else if (data.step === 'system_type') {
    [{l:'🏠 บ้านพักอาศัย',v:'residential'},{l:'🏪 ร้านค้า / ออฟฟิศ',v:'commercial'},{l:'🏭 โรงงานอุตสาหกรรม',v:'industrial'}].forEach(b => {
      buttons.push({
        type: 'box', layout: 'vertical', 
        backgroundColor: '#FFFFFF', 
        cornerRadius: 'md', paddingAll: '12px', margin: 'sm', 
        borderWidth: '1px', 
        borderColor: '#F1F5F9',
        action: { type: 'postback', label: b.l, data: `action=calc_step&step=type&type=${b.v}`, displayText: b.l },
        contents: [{ type: 'text', text: b.l, align: 'center', weight: 'bold', color: '#1E293B', contents: [] }]
      });
    });
  } else if (data.step === 'roof_type') {
    [{l:'🏗️ หลังคาคอนกรีต',v:'concrete'},{l:'🔩 หลังคาเมทัลชีท',v:'metal'},{l:'🌍 ติดตั้งบนพื้นดิน',v:'ground'}].forEach(b => {
      buttons.push({
        type: 'box', layout: 'vertical', 
        backgroundColor: '#FFFFFF', 
        cornerRadius: 'md', paddingAll: '12px', margin: 'sm', 
        borderWidth: '1px', 
        borderColor: '#F1F5F9',
        action: { type: 'postback', label: b.l, data: `action=calc_step&step=roof&roof=${b.v}`, displayText: b.l },
        contents: [{ type: 'text', text: b.l, align: 'center', weight: 'bold', color: '#1E293B', contents: [] }]
      });
    });
  } else if (data.step === 'location') {
    [{l:'🏝️ จังหวัดกระบี่',v:'krabi'},{l:'🏖️ จังหวัดภูเก็ต',v:'phuket'},{l:'🌏 พื้นที่อื่นๆ',v:'other'}].forEach(b => {
      buttons.push({
        type: 'box', layout: 'vertical', 
        backgroundColor: '#FFFFFF', 
        cornerRadius: 'md', paddingAll: '12px', margin: 'sm', 
        borderWidth: '1px', 
        borderColor: '#F1F5F9',
        action: { type: 'postback', label: b.l, data: `action=calc_step&step=location&loc=${b.v}`, displayText: b.l },
        contents: [{ type: 'text', text: b.l, align: 'center', weight: 'bold', color: '#1E293B', contents: [] }]
      });
    });
  }

  return {
    type: 'flex', altText: current.title,
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ type: 'text', text: `STEP ${current.num}/4`, color: '#FF8A00', weight: 'bold', size: 'xxs', contents: [] }, { type: 'text', text: current.title, weight: 'bold', size: 'md', color: '#0F172A', margin: 'xs', contents: [] }]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', backgroundColor: '#F8FAFC',
        contents: [
          ...previousChoices,
          { type: 'text', text: current.subtitle, size: 'sm', color: '#64748B', wrap: true, margin: previousChoices.length > 0 ? 'md' : 'none', contents: [] },
          { type: 'box', layout: 'vertical', margin: 'xl', contents: buttons }
        ]
      },
      footer: current.num > 1 ? {
        type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', paddingAll: '10px',
        contents: [{ type: 'button', style: 'link', color: '#FF8A00', action: { type: 'postback', label: '⬅️ ย้อนกลับ', data: 'action=calc_step&step=back', displayText: 'ย้อนกลับ' } }]
      } : undefined
    }
  };
}

export function createCalcStartMessage(): any {
  return {
    type: 'flex', altText: 'ประเมินความประหยัดโซลาร์เซลล์',
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ "type": "text", "text": "SOLAR SAVINGS", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": "ประเมินความประหยัด", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'xl', backgroundColor: '#F8FAFC',
        contents: [
          { type: 'text', text: 'ให้ AI ช่วยวิเคราะห์ว่าคุณจะประหยัดเงินได้เท่าไหร่ เมื่อติดตั้งโซลาร์เซลล์ในพื้นที่กระบี่และใกล้เคียง', size: 'sm', color: '#64748B', wrap: true, contents: [] },
          {
            type: 'box', layout: 'vertical', spacing: 'md',
            contents: [
              { "type": "text", "text": "เตรียมข้อมูลเหล่านี้:", "size": "xxs", "weight": "bold", "color": "#FF8A00", contents: [] },
              { type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'md', paddingAll: '12px', contents: [{ "type": "text", "text": "• บิลค่าไฟเฉลี่ยต่อเดือน", "size": "xs", "color": "#475569", contents: [] }, { "type": "text", "text": "• ประเภทหลังคาและพื้นที่ติดตั้ง", "size": "xs", "color": "#475569", margin: 'xs', contents: [] }] }
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { "type": "postback", "data": "action=calc_restart", "displayText": "เริ่มคำนวณครับ" },
            contents: [{ "type": "text", "text": "⚡ เริ่มการประเมิน", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", contents: [] }]
          }
        ]
      }
    }
  };
}

export function createAppLauncherMessage(): any {
  const liffUrl = process.env.NEXT_PUBLIC_LINE_LIFF_URL || 'https://liff.line.me/2010020881-koR53fSr';
  return {
    type: 'flex', altText: `แอปพลิเคชัน${brand.nameTh}`,
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ "type": "text", "text": "OFFICIAL APP", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": `แอปพลิเคชัน${brand.nameTh}`, "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }]
      },
      hero: { type: 'box', layout: 'vertical', contents: [{ type: 'image', url: `${siteUrl}/images/hero-solar.jpg`, size: 'full', aspectRatio: '20:10', aspectMode: 'cover' }] },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'md', backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'md', paddingAll: '16px', borderWidth: '1px', borderColor: '#F1F5F9',
            contents: [
              { "type": "text", "text": "🚀 ฟีเจอร์ที่เหนือกว่า:", "weight": "bold", "size": "xs", "color": "#FF8A00", contents: [] },
              { "type": "text", "text": "• ชมแคตตาล็อกแบบ Full HD\n• บันทึกผลการคำนวณส่วนตัว\n• ติดตามสถานะโปรเจกต์แบบเรียลไทม์", "wrap": true, "size": "xxs", "color": "#475569", "margin": "md", "lineSpacing": "6px", contents: [] }
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { "type": "uri", "label": "📱 เปิดแอปเลย", "uri": liffUrl },
            contents: [{ "type": "text", "text": "📱 เปิดแอปพลิเคชัน", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", contents: [] }]
          },
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#F1F5F9', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { "type": "postback", "data": "action=contact", "displayText": "ติดต่อทีมวิศวกรครับ" },
            contents: [{ "type": "text", "text": "💬 ติดต่อทีมงาน", "align": "center", "size": "sm", "weight": "bold", "color": "#475569", contents: [] }]
          }
        ]
      }
    }
  };
}

export function createLeadConfirmMessage(data: { name: string, bill: string, size: string, location: string }): any {
  return {
    type: 'flex', altText: 'ยืนยันข้อมูลขอใบเสนอราคา',
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ "type": "text", "text": "QUOTATION SUMMARY", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": "สรุปข้อมูลขอใบเสนอราคา", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'md', backgroundColor: '#F8FAFC',
        contents: [{ type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', paddingAll: '16px', cornerRadius: 'md', borderWidth: '1px', borderColor: '#F1F5F9', contents: [{ type: 'box', layout: 'horizontal', contents: [{ type: 'text', text: 'ชื่อลูกค้า', size: 'xs', color: '#94A3B8', flex: 1, contents: [] }, { type: 'text', text: data.name, size: 'xs', weight: 'bold', color: '#0F172A', flex: 2, align: 'end', contents: [] }] }, { type: 'box', layout: 'horizontal', margin: 'md', contents: [{ type: 'text', text: 'ค่าไฟเฉลี่ย', size: 'xs', color: '#94A3B8', flex: 1, contents: [] }, { type: 'text', text: `${data.bill}`, size: 'xs', weight: 'bold', color: '#0F172A', flex: 2, align: 'end', contents: [] }] }, { type: 'box', layout: 'horizontal', margin: 'md', contents: [{ type: 'text', text: 'ขนาดระบบ', size: 'xs', color: '#94A3B8', flex: 1, contents: [] }, { type: 'text', text: `${data.size}`, size: 'xs', weight: 'bold', color: '#FF8A00', flex: 2, align: 'end', contents: [] }] }, { type: 'box', layout: 'horizontal', margin: 'md', contents: [{ type: 'text', text: 'พื้นที่ติดตั้ง', size: 'xs', color: '#94A3B8', flex: 1, contents: [] }, { type: 'text', text: data.location, size: 'xs', weight: 'bold', color: '#0F172A', flex: 2, align: 'end', contents: [] }] }] }]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'postback', label: '✅ ยืนยันส่งข้อมูล', data: 'action=confirm_lead', displayText: 'ยืนยันส่งข้อมูลครับ' },
            contents: [{ type: 'text', text: '✅ ยืนยันส่งข้อมูล', align: 'center', size: 'sm', weight: 'bold', color: '#FFFFFF', contents: [] }]
          },
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#F1F5F9', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'postback', label: '✏️ แก้ไขข้อมูล', data: 'action=calculator', displayText: 'ขอแก้ไขข้อมูลครับ' },
            contents: [{ type: 'text', text: '✏️ แก้ไขข้อมูล', align: 'center', size: 'sm', weight: 'bold', color: '#475569', contents: [] }]
          }
        ]
      }
    }
  };
}

export function createLeadFormMessage(prefilledSize?: number): any {
  const sizeText = prefilledSize ? `ระบบ ${prefilledSize} kW` : '';
  return {
    type: 'flex', altText: 'ขอใบเสนอราคาทางการ',
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          { "type": "text", "text": "OFFICIAL QUOTATION", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] },
          { "type": "text", "text": "ขอใบเสนอราคาทางการ", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }
        ]
      },
      hero: {
        type: 'box', layout: 'vertical',
        contents: [{ type: 'image', url: `${siteUrl}/images/hero-solar.jpg`, size: 'full', aspectRatio: '20:10', aspectMode: 'cover' }]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', backgroundColor: '#F8FAFC',
        contents: [
          { type: 'text', text: "เพื่อให้ทีมวิศวกรออกแบบระบบและคำนวณความคุ้มค่าให้แม่นยำที่สุด กรุณาให้ข้อมูลเบื้องต้นครับ", size: 'sm', color: '#64748B', wrap: true, contents: [] },
          {
            type: 'box', layout: 'vertical', margin: 'xl', backgroundColor: '#FFFFFF', cornerRadius: 'md', paddingAll: '16px', borderWidth: '1px', borderColor: '#F1F5F9',
            contents: [
              { "type": "text", "text": "💡 วิธีการที่รวดเร็วที่สุด:", "weight": "bold", "size": "xs", "color": "#FF8A00", contents: [] },
              { "type": "text", "text": "กดปุ่มด้านล่างเพื่อ 'ส่งตำแหน่งหน้างาน' แล้วผมจะพาคุณไปขั้นตอนต่อไปทันทีครับ", wrap: true, size: "xxs", color: "#475569", "margin": "sm", "lineSpacing": "4px", contents: [] }
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'location', label: '📍 ส่งตำแหน่งหน้างาน' },
            contents: [{ "type": "text", "text": "📍 ส่งตำแหน่งหน้างาน", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", contents: [] }]
          },
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#F1F5F9', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { "type": "postback", "data": "action=ai_chat", "displayText": "แจ้งข้อมูลผ่านการแชทครับ" },
            contents: [{ "type": "text", "text": "✏️ แจ้งข้อมูลผ่านแชท", "align": "center", "size": "sm", "weight": "bold", "color": "#475569", contents: [] }]
          }
        ]
      }
    }
  };
}


export function createSuccessMessage(text: string = 'ส่งข้อมูลเรียบร้อยแล้ว', leadId?: string): any {
  const proposalUrl = `${siteUrl}/proposal/${leadId}`;

  const buttons: any[] = [
    {
      type: 'box',
      layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
      action: { type: 'datetimepicker', label: '📅 จองคิวสำรวจหน้างาน', data: 'action=book_survey', mode: 'datetime' },
      contents: [{ type: 'text', text: '📅 จองคิวสำรวจหน้างาน', align: 'center', size: 'sm', weight: 'bold', color: '#FFFFFF', contents: [] }]
    }
  ];

  if (leadId) {
    buttons.push({
      type: 'box',
      layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
      borderWidth: '1px', borderColor: '#FF8A00',
      action: { type: 'uri', label: '📄 ดูใบเสนอราคา PDF', uri: proposalUrl },
      contents: [{ type: 'text', text: '📄 ดูใบเสนอราคา PDF', align: 'center', size: 'sm', weight: 'bold', color: '#FF8A00', contents: [] }]
    });
  }

  buttons.push({
    type: 'box',
    layout: 'vertical', backgroundColor: '#F1F5F9', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
    action: { type: 'postback', label: '📦 ชมแพ็กเกจอื่นๆ', data: 'action=catalog', displayText: 'ชมแพ็กเกจอื่นๆ' },
    contents: [{ type: 'text', text: '📦 ชมแพ็กเกจอื่นๆ', align: 'center', size: 'sm', weight: 'bold', color: '#475569', contents: [] }]
  });

  return {
    type: 'flex', altText: text,
    contents: {
      type: 'bubble', size: 'mega',
      body: {
        type: 'box', layout: 'vertical', paddingAll: '32px', alignItems: 'center', backgroundColor: '#FFFFFF',
        contents: [
          { type: 'text', text: '✓', color: '#FF8A00', size: '5xl', weight: 'bold', align: 'center', contents: [] },
          { type: 'text', text: text, weight: 'bold', size: 'lg', color: '#0F172A', margin: 'md', align: 'center', contents: [] },
          { type: 'text', text: 'ทีมวิศวกรจะติดต่อกลับภายใน 24 ชม. เพื่อยืนยันการนัดหมาย หรือคุณสามารถเลือกวันจองคิวสำรวจหน้างานได้ทันทีครับ', size: 'xs', color: '#64748B', margin: 'sm', align: 'center', wrap: true, contents: [] },
          {
            type: 'box', layout: 'vertical', margin: 'xxl', width: 'full', spacing: 'md',
            contents: buttons
          }
        ]
      }
    }
  };
}

export function createContactMessage(): any {
  return {
    type: 'flex', altText: `ติดต่อ${brand.nameTh}`,
    contents: {
      type: 'bubble', size: 'mega',
      header: { type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF', contents: [{ type: 'text', text: 'CONTACT US', color: '#FF8A00', weight: 'bold', size: 'xxs', contents: [] }, { type: 'text', text: 'ติดต่อทีมงานวิศวกร', weight: 'bold', size: 'md', color: '#0F172A', margin: 'xs', contents: [] }] },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'md', paddingAll: '16px', borderWidth: '1px', borderColor: '#F1F5F9',
            contents: [
              { type: 'text', text: `📞 โทร: ${contact.phone}`, size: 'sm', weight: 'bold', color: '#0F172A', contents: [] },
              { type: 'text', text: `💬 LINE: ${contact.lineId}`, size: 'sm', color: '#475569', margin: 'md', contents: [] },
              { type: 'text', text: '📍 พื้นที่ให้บริการ: จังหวัดกระบี่และภูเก็ต', size: 'sm', color: '#475569', margin: 'sm', contents: [] }
            ]
          },
          { type: 'text', text: 'ทีมวิศวกรของเราพร้อมให้บริการทุกวันจันทร์ - เสาร์ (08:30 - 17:30)', size: 'xxs', color: '#94A3B8', wrap: true, margin: 'sm', contents: [] }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'uri', label: '📞 โทรเลย', uri: contact.telHref },
            contents: [{ type: 'text', text: '📞 โทรติดต่อวิศวกรโดยตรง', align: 'center', size: 'sm', weight: 'bold', color: '#FFFFFF', contents: [] }]
          }
        ]
      }
    }
  };
}

export function createAboutTanMessage(): any {
  return {
    type: 'flex', altText: 'ทำความรู้จักกับ แทน',
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'horizontal', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [{ type: 'box', layout: 'vertical', flex: 1, contents: [{ "type": "text", "text": "SOLAR EXPERT", "color": "#FF8A00", "weight": "bold", "size": "xxs", contents: [] }, { "type": "text", "text": "ทำความรู้จักกับ แทน", "weight": "bold", "size": "md", "color": "#0F172A", "margin": "xs", contents: [] }] }]
      },
      hero: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'image', url: `${siteUrl}/images/hero-solar.jpg`, size: 'full', aspectRatio: '20:13', aspectMode: 'cover' },
          {
            type: 'box', layout: 'vertical', position: 'absolute', backgroundColor: '#FF8A00', cornerRadius: 'xl', paddingAll: '4px', paddingStart: '12px', paddingEnd: '12px', offsetBottom: '15px', offsetStart: '15px',
            contents: [{ "type": "text", "text": "● Online 24/7", "color": "#FFFFFF", "size": "xxs", "weight": "bold", contents: [] }]
          }
        ]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', spacing: 'md', backgroundColor: '#F8FAFC',
        contents: [
          {
            type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'md', paddingAll: '16px', borderWidth: '1px', borderColor: '#F1F5F9',
            contents: [
              { "type": "text", "text": "🤖 ผมคือใคร?", "weight": "bold", "size": "xs", "color": "#FF8A00", contents: [] },
              { "type": "text", "text": "ผมคือ AI อัจฉริยะที่ถูกเทรนด้วยข้อมูลวิศวกรรมแสงอาทิตย์เฉพาะทางสำหรับพื้นที่ภาคใต้ของไทย หน้าที่ของผมคือช่วยคุณตัดสินใจเลือกสิ่งที่ดีที่สุด", "wrap": true, "size": "xxs", "color": "#475569", "margin": "md", "lineSpacing": "5px", contents: [] }
            ]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'md', paddingAll: '16px', borderWidth: '1px', borderColor: '#F1F5F9',
            contents: [
              { "type": "text", "text": "🌟 ความสามารถของผม:", "weight": "bold", "size": "xs", "color": "#FF8A00", contents: [] },
              { "type": "text", "text": "• คำนวณจุดคืนทุนแม่นยำ\n• แนะนำแบรนด์แผงและอินเวอร์เตอร์\n• ตอบคำถามเทคนิคและภาษี\n• นัดหมายวิศวกรตัวจริงให้คุณ", "wrap": true, "size": "xxs", "color": "#475569", "margin": "md", "lineSpacing": "6px", contents: [] }
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box',
            layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { "type": "postback", "data": "action=ai_chat", "displayText": "ปรึกษาแทนตอนนี้" },
            contents: [{ "type": "text", "text": "💬 เริ่มปรึกษาตอนนี้", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", contents: [] }]
          }
        ]
      }
    }
  };
}


export function createPromotionMessage(): any {
  return {
    type: 'flex', altText: `โปรโมชั่นพิเศษ - ${brand.name}`,
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '20px',
        background: { type: 'linearGradient', angle: '135deg', startColor: '#FF8A00', endColor: '#FF8A00' },
        contents: [
          { type: 'text', text: 'PROMOTION', color: '#FFFFFF', weight: 'bold', size: 'xxs', contents: [] },
          { type: 'text', text: 'โปรโมชั่นพิเศษประจำเดือน', weight: 'bold', size: 'md', color: '#FFFFFF', margin: 'xs', contents: [] }
        ]
      },
      hero: {
        type: 'box', layout: 'vertical', position: 'relative',
        contents: [
          { type: 'image', url: `${siteUrl}/images/hero-solar.jpg`, size: 'full', aspectRatio: '20:8', aspectMode: 'cover' },
          {
            type: 'box', layout: 'vertical', position: 'absolute', backgroundColor: '#F59E0B',
            cornerRadius: 'md', paddingAll: '8px', offsetTop: '12px', offsetEnd: '12px',
            contents: [{ type: 'text', text: '🔥 พิเศษ!', color: '#FFFFFF', size: 'xxs', weight: 'bold', contents: [] }]
          }
        ]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '24px', backgroundColor: '#F8FAFC', spacing: 'xl',
        contents: [
          {
            type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'lg', paddingAll: '16px',
            borderWidth: '1px', borderColor: '#FF8A0020',
            contents: [
              {
                type: 'box', layout: 'horizontal', contents: [
                  { type: 'text', text: '🛡️', size: 'lg', flex: 0, contents: [] },
                  { type: 'box', layout: 'vertical', margin: 'sm', flex: 1, contents: [
                    { type: 'text', text: 'บริการหลังการขายฟรี 1 ปี', weight: 'bold', size: 'sm', color: '#0F172A', contents: [] },
                    { type: 'text', text: 'มูลค่า ฿5,000', size: 'xxs', color: '#FF8A00', margin: 'xs', weight: 'bold', contents: [] }
                  ]}
                ]
              },
              {
                type: 'box', layout: 'vertical', margin: 'md', spacing: 'xs',
                contents: [
                  { type: 'text', text: '✓ ตรวจเช็คระบบฟรีทุก 6 เดือน', size: 'xxs', color: '#64748B', contents: [] },
                  { type: 'text', text: '✓ ล้างแผงโซลาร์ 2 ครั้ง/ปี', size: 'xxs', color: '#64748B', contents: [] },
                  { type: 'text', text: '✓ วิเคราะห์ประสิทธิภาพระบบ', size: 'xxs', color: '#64748B', contents: [] }
                ]
              }
            ]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: '#FFFFFF', cornerRadius: 'lg', paddingAll: '16px',
            borderWidth: '1px', borderColor: '#F1F5F9',
            contents: [
              {
                type: 'box', layout: 'horizontal', contents: [
                  { type: 'text', text: '💳', size: 'lg', flex: 0, contents: [] },
                  { type: 'box', layout: 'vertical', margin: 'sm', flex: 1, contents: [
                    { type: 'text', text: 'ผ่อนชำระเบาๆ', weight: 'bold', size: 'sm', color: '#0F172A', contents: [] },
                    { type: 'text', text: 'อนุมัติไว 3-5 วันทำการ', size: 'xxs', color: '#64748B', margin: 'xs', contents: [] }
                  ]}
                ]
              }
            ]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: '#ECFDF5', cornerRadius: 'lg', paddingAll: '12px',
            contents: [
              { type: 'text', text: '💡 หลังปีแรก ค่าบำรุงรักษาเพียง ฿10,000/ปี (ไม่ถึง ฿850/เดือน)', size: 'xxs', color: '#059669', align: 'center', weight: 'bold', wrap: true, contents: [] }
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'md', paddingAll: '20px', backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'box', layout: 'vertical', backgroundColor: '#FF8A00', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'postback', data: 'action=lead_solar', displayText: 'ขอใบเสนอราคาครับ' },
            contents: [{ type: 'text', text: '📋 ขอใบเสนอราคา', align: 'center', size: 'sm', weight: 'bold', color: '#FFFFFF', contents: [] }]
          },
          {
            type: 'box', layout: 'vertical', backgroundColor: '#F1F5F9', cornerRadius: 'md', paddingAll: '12px', justifyContent: 'center',
            action: { type: 'postback', data: 'action=calculator', displayText: 'คำนวณความคุ้มค่า' },
            contents: [{ type: 'text', text: '⚡ คำนวณความคุ้มค่า', align: 'center', size: 'sm', weight: 'bold', color: '#475569', contents: [] }]
          }
        ]
      }
    }
  };
}

export const BILL_TO_KW: Record<string, number> = { 
  '2-4k': 3, 
  '4-6k': 5,
  '6-8k': 7.5,
  '8-10k': 10,
  '10-15k': 15,
  '15-20k': 20,
  '20-30k': 30,
  '30-40k': 45,
  '40-50k': 60,
  '50k+': 100 
};
const SYSTEM_PRICES: Record<string, number> = { residential: 45000, commercial: 35000, industrial: 30000 };
export const ROOF_ADJUSTMENT: Record<string, number> = { concrete: 1.0, metal: 0.95, ground: 0.9 };
const LOCATION_SUN_HOURS: Record<string, number> = { krabi: 5.2, phuket: 5.0, chiangmai: 5.5, other: 5.0 };

export function calculateSolarFromContext(params: { billRange: string, systemType: string, roofType: string, location: string }): CalcResult {
  const baseKw = BILL_TO_KW[params.billRange] || 5;
  const pricePerKw = SYSTEM_PRICES[params.systemType] || 40000;
  const roofMult = ROOF_ADJUSTMENT[params.roofType] || 1.0;
  const sunHours = LOCATION_SUN_HOURS[params.location] || 5.0;
  const systemKw = Math.round(baseKw * roofMult * 1.1 * 10) / 10;
  const estimatedPrice = Math.round(systemKw * pricePerKw * roofMult);
  const monthlySavings = Math.round(systemKw * sunHours * 135);
  const annualSavings = monthlySavings * 12;
  const paybackYears = Math.round(estimatedPrice / annualSavings * 10) / 10;
  const co2Reduction = Math.round(systemKw * 0.8 * 10) / 10;
  return { systemKw, estimatedPrice, monthlySavings, annualSavings, paybackYears, co2Reduction, billRange: params.billRange, systemType: params.systemType, roofType: params.roofType, location: params.location };
}

export function createCalculatorResultShareCard(params: { systemKw: number; monthlySavings: number; paybackYears: number; systemCost: number; co2Reduction: number; location: string }): any {
  return {
    type: 'flex', altText: 'ผลการคำนวณโซลาร์เซลล์',
    contents: {
      type: 'bubble', size: 'mega',
      header: {
        type: 'box', layout: 'vertical', paddingAll: '16px', backgroundColor: '#FF8A00',
        contents: [{ type: 'text', text: '⚡ Solar Calculation', color: '#FFFFFF', weight: 'bold', size: 'xxs', contents: [] }, { type: 'text', text: `ระบบ ${params.systemKw} kW`, weight: 'bold', size: 'lg', color: '#FFFFFF', margin: 'xs', contents: [] }]
      },
      body: {
        type: 'box', layout: 'vertical', paddingAll: '20px', spacing: 'md',
        contents: [
          { type: 'box', layout: 'horizontal', contents: [{ type: 'text', text: '💰 ประหยัด/เดือน', size: 'xs', color: '#64748B', flex: 1, contents: [] }, { type: 'text', text: `฿${params.monthlySavings.toLocaleString('th-TH')}`, size: 'xs', weight: 'bold', color: '#FF8A00', align: 'end', contents: [] }] },
          { type: 'box', layout: 'horizontal', contents: [{ type: 'text', text: '⏱️ คืนทุน', size: 'xs', color: '#64748B', flex: 1, contents: [] }, { type: 'text', text: `${params.paybackYears} ปี`, size: 'xs', weight: 'bold', color: '#0F172A', align: 'end', contents: [] }] },
          { type: 'box', layout: 'horizontal', contents: [{ type: 'text', text: '🌿 ลด CO₂', size: 'xs', color: '#64748B', flex: 1, contents: [] }, { type: 'text', text: `${params.co2Reduction.toFixed(1)} ตัน/ปี`, size: 'xs', weight: 'bold', color: '#0F172A', align: 'end', contents: [] }] },
          { type: 'box', layout: 'horizontal', contents: [{ type: 'text', text: '📍 พื้นที่', size: 'xs', color: '#64748B', flex: 1, contents: [] }, { type: 'text', text: params.location, size: 'xs', weight: 'bold', color: '#0F172A', align: 'end', contents: [] }] }
        ]
      }
    }
  };
}

export function getBillLabel(range: string): string { 
  const labels: Record<string, string> = {
    '2-4k': '2,000 - 4,000 ฿',
    '4-6k': '4,000 - 6,000 ฿',
    '6-8k': '6,000 - 8,000 ฿',
    '8-10k': '8,000 - 10,000 ฿',
    '10-15k': '10,000 - 15,000 ฿',
    '15-20k': '15,000 - 20,000 ฿',
    '20-30k': '20,000 - 30,000 ฿',
    '30-40k': '30,000 - 40,000 ฿',
    '40-50k': '40,000 - 50,000 ฿',
    '50k+': 'มากกว่า 50,000 ฿'
  };
  return labels[range] || range + ' ฿'; 
}
export function getLocationLabel(loc: string): string { const m: any = {krabi:'กระบี่', phuket:'ภูเก็ต'}; return m[loc] || loc; }

/**
 * LINE Action Handlers
 * Handles all 6 Rich Menu actions + text message AI processing
 */

import { supabase } from './supabase';
import { FEATURES } from './feature-flags';
import {
  getUserContext,
  setUserContext,
  logLineAction,
  parseActionData
} from './line-context';
import { submitLead } from './lead-manager';
import { createAIErrorFlex } from './flex-templates';
import { createCatalogCarousel,
  createCatalogFilterMessage,
  createPromotionMessage,
  createLeadFormMessage,
  createContactMessage,
  createSuccessMessage,
  createQuickReplies,
  createCalcStepMessage,
  createCalcResultMessage,
  createWelcomeMessage,
  createLeadConfirmMessage,
  createCalcStartMessage,
  createAppLauncherMessage,
  createAboutTanMessage,
  createCasesCarousel,
  createLocationMessage,
  calculateSolarFromContext,
  BILL_TO_KW,
  ROOF_ADJUSTMENT,
  getBillLabel,
  getLocationLabel
} from './line-messages';
import { calculateSolar, parseUserBillInput, getProductsForCatalog } from './line-calculator';
import { brand, siteUrl } from './site.config';

const LINE_REPLY_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

async function replyToLine(replyToken: string, messages: any[]): Promise<{success: boolean, lineError?: any}> {
  if (!LINE_REPLY_TOKEN) {
    console.error('[LINE] No access token configured');
    return { success: false, lineError: 'No access token configured' };
  }

  if (!replyToken) {
    console.warn('[LINE] No replyToken provided');
    return { success: false, lineError: 'No replyToken provided' };
  }

  const body = JSON.stringify({
    replyToken,
    messages
  });

  console.log('[LINE] Sending reply. Messages:', messages.length);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_REPLY_TOKEN}`
      },
      body,
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      console.log('[LINE] Reply sent successfully');
      return { success: true };
    } else {
      const rawBody = await response.text();
      console.error('[LINE] Reply API HTTP Error:', response.status, response.statusText);
      console.error('[LINE] Reply Error Raw Body:', rawBody);
      try {
        const errorData = JSON.parse(rawBody);
        return { success: false, lineError: { httpStatus: response.status, ...errorData } };
      } catch {
        return { success: false, lineError: { httpStatus: response.status, message: rawBody } };
      }
    }
  } catch (error: any) {
    console.error('[LINE] Reply fetch error:', error.message);
    return { success: false, lineError: { message: error.message } };
  }
}

export async function pushToLine(userId: string, messages: any[]): Promise<void> {
  if (!LINE_REPLY_TOKEN || !userId) return;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_REPLY_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages
      })
    });

    clearTimeout(timeout);

    if (response.ok) {
      console.log('[LINE] Push sent successfully');
    } else {
      const rawBody = await response.text();
      console.error('[LINE] Push API HTTP Error:', response.status, response.statusText);
      console.error('[LINE] Push Error Raw Body:', rawBody);
    }
  } catch (error: any) {
    console.error('[LINE] Push fetch error:', error.message);
  }
}

async function sendResponse(userId: string, replyToken: string, messages: any[]): Promise<void> {
  if (!replyToken) {
    if (userId) {
      console.log('[LINE] No replyToken, using push instead');
      await pushToLine(userId, messages);
    }
    return;
  }

  const result = await replyToLine(replyToken, messages);
  
  if (!result.success && userId) {
    const errInfo = result.lineError;
    const errCode = typeof errInfo === 'object' ? errInfo.message : String(errInfo);
    
    // Check if error is 'Invalid reply token' (already used or expired)
    if (errCode?.toLowerCase().includes('invalid reply token')) {
      console.warn('[LINE] replyToken already consumed or expired, trying push fallback...');
      await pushToLine(userId, messages);
    } else {
      console.error('[LINE] replyToLine failed with other error:', errCode);
      // For other structural errors, we still try push but without the noisy debug message
      await pushToLine(userId, messages);
    }
  }
}

export async function handleFollow(userId: string, replyToken: string): Promise<void> {
  console.log('[LINE] New follower:', userId);

  await logLineAction(userId, 'follow');

  await sendResponse(userId, replyToken, [
    {
      type: 'text',
      text: `👋 สวัสดีครับ! ยินดีต้อนรับสู่${brand.nameTh} ☀️\n\nผมเป็น AI ที่ปรึกษาระบบโซลาร์เซลล์ ช่วยอะไรได้บ้างครับ?`,
      ...createQuickReplies([
        { label: '📦 แพ็กเกจ', data: 'action=catalog' },
        { label: '⚡ คำนวณ', data: 'action=calculator' },
        { label: '🎁 โปรโมชั่น', data: 'action=promotion' },
        { label: '📋 ขอใบเสนอ', data: 'action=lead_solar' }
      ])
    }
  ]);
}

export async function handleUnfollow(userId: string): Promise<void> {
  console.log('[LINE] Unfollowed:', userId);
  await logLineAction(userId, 'unfollow');
}

export async function handlePostback(
  userId: string,
  replyToken: string,
  data: string,
  params: any = {}
): Promise<void> {
  const dataParams = parseActionData(data);
  const action = dataParams.action;

  await logLineAction(userId, `postback:${action}`, { ...dataParams, ...params });

  switch (action) {
    case 'ai_chat':
      await handleAiChat(userId, replyToken);
      break;
    case 'catalog':
      await handleCatalog(userId, replyToken, dataParams);
      break;
    case 'promotion':
      await handlePromotion(userId, replyToken);
      break;
    case 'calculator':
      await handleCalculator(userId, replyToken);
      break;
    case 'calc_input': {
      const bill = parseInt(dataParams.bill || '0');
      if (bill > 0) {
        await handleCalculatorQuickInput(userId, replyToken, bill);
      }
      break;
    }
    case 'calc_step':
      await handleCalcStep(userId, replyToken, dataParams);
      break;
    case 'calc_restart':
      await handleCalcStart(userId, replyToken);
      break;
    case 'confirm_lead':
      await handleConfirmLead(userId, replyToken);
      break;
    case 'survey_segment':
      await handleSurveySegment(userId, replyToken, dataParams);
      break;
    case 'lead_solar':
      await handleLeadForm(userId, replyToken, dataParams);
      break;
    case 'book_survey':
      await handleBookSurvey(userId, replyToken, params);
      break;
    case 'contact':
      await handleContact(userId, replyToken);
      break;
    case 'product_detail':
      await handleProductDetail(userId, replyToken, dataParams);
      break;
    case 'about_tan':
      await handleAboutTan(userId, replyToken);
      break;
    case 'generate_pdf':
      await handleGeneratePdf(userId, replyToken, dataParams);
      break;
    case 'liff':
      await handleLiff(userId, replyToken);
      break;
    case 'cases':
      await handleCases(userId, replyToken);
      break;
    case 'case_location':
      await handleCaseLocation(userId, replyToken, dataParams);
      break;
    case 'download_catalog':
      await handleDownloadCatalog(userId, replyToken);
      break;
    case 'download_spec':
      await handleDownloadSpec(userId, replyToken, dataParams);
      break;
    default:
      await sendResponse(userId, replyToken, [{ type: 'text', text: 'ไม่เข้าใจคำสั่ง ลองใหม่นะครับ 🙏' }]);
  }
}

async function handleDownloadCatalog(userId: string, replyToken: string): Promise<void> {
  // TODO(catalog-pdf): full catalog PDF not published yet.
  // When TAWANPOWER_Catalog PDF is ready, upload to public/catalog/ and
  // restore the flex download card (see git history for the old version).
  await sendResponse(userId, replyToken, [
    {
      type: 'text',
      text: '📚 แคตตาล็อกรวมฉบับ PDF กำลังจัดทำอยู่ครับ แต่แพ็กเกจทั้งหมดดูได้ตรงนี้เลย 👇',
      ...createQuickReplies([
        { label: '📦 ดูแพ็กเกจ', data: 'action=catalog' },
        { label: '🧮 คำนวณค่าไฟ', data: 'action=calculator' },
        { label: '📋 ขอใบเสนอราคา', data: 'action=lead_solar' }
      ])
    }
  ]);
}

async function handleDownloadSpec(userId: string, replyToken: string, params: any): Promise<void> {
  const productId = params.productId;
  // Fallback to general catalog if no specific product
  const specUrl = `${siteUrl}/api/pdf/spec?productId=${productId}`;
  
  await sendResponse(userId, replyToken, [
    {
      type: 'text',
      text: '📄 นี่คือสเปกชีท (Data Sheet) สำหรับแพ็กเกจที่คุณสนใจครับ ☀️'
    },
    {
      type: 'flex',
      altText: 'ดาวน์โหลดสเปกชีท',
      contents: {
        type: 'bubble',
        size: 'mega',
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '20px',
          contents: [
            {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#FF8A00',
              cornerRadius: 'md',
              paddingAll: '12px',
              justifyContent: 'center',
              action: { type: 'uri', label: '⬇️ ดาวน์โหลดสเปกชีท', uri: specUrl },
              contents: [{ "type": "text", "text": "⬇️ ดาวน์โหลดสเปกชีท (PDF)", "align": "center", "size": "sm", "weight": "bold", "color": "#FFFFFF", "contents": [] }]
            }
          ]
        }
      }
    }
  ]);
}

export async function handleCases(userId: string, replyToken: string): Promise<void> {
  console.log('[LINE] Fetching cases for carousel...');
  
  const { data: cases, error } = await supabase
    .from('solar_cases')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error || !cases || cases.length === 0) {
    console.error('[LINE] Cases fetch error:', error);
    await sendResponse(userId, replyToken, [{ 
      type: 'text', 
      text: 'ขออภัยครับ ยังไม่มีข้อมูลผลงานในขณะนี้ 🙏',
      ...createQuickReplies([{ label: '📦 ดูแคตตาล็อก', data: 'action=catalog' }])
    }]);
    return;
  }

  const carousel = createCasesCarousel(cases);
  await sendResponse(userId, replyToken, [
    { type: 'text', text: '🌟 นี่คือส่วนหนึ่งของผลงานการติดตั้งโซลาร์เซลล์ของเราในพื้นที่กระบี่และใกล้เคียงครับ:' },
    {
      ...carousel,
      ...createQuickReplies([
        { label: '📦 ดูแคตตาล็อก', data: 'action=catalog' },
        { label: '📋 ขอใบเสนอราคา', data: 'action=lead_solar' },
        { label: '🗺️ เปิดแผนที่รวม', data: 'action=liff' }
      ])
    }
  ]);
}

export async function handleCaseLocation(
  userId: string,
  replyToken: string,
  params: Record<string, string>
): Promise<void> {
  const caseId = params.id;
  if (!caseId) return;

  const { data: caseItem } = await supabase
    .from('solar_cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (!caseItem || !caseItem.lat || !caseItem.lng) {
    await sendResponse(userId, replyToken, [{ type: 'text', text: 'ไม่พบตำแหน่งของโครงการนี้ครับ 🙏' }]);
    return;
  }

  const locationMsg = createLocationMessage({
    title: `ผลงานติดตั้ง: ${caseItem.customer_name}`,
    address: caseItem.location_name || 'Krabi',
    lat: parseFloat(caseItem.lat),
    lng: parseFloat(caseItem.lng)
  });

  await sendResponse(userId, replyToken, [locationMsg]);
}

export async function handleBookSurvey(
  userId: string,
  replyToken: string,
  params: any
): Promise<void> {
  const datetime = params.datetime;
  if (!datetime) return;

  console.log(`[LINE] Booking survey for ${userId} at ${datetime}`);

  // Update the latest lead for this user with the booking info
  const { data: leads } = await supabase
    .from('leads')
    .select('id')
    .eq('line_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (leads?.[0]) {
    await supabase
      .from('leads')
      .update({ notes: `Customer booked site survey for: ${datetime}` })
      .eq('id', leads[0].id);
  }

  await sendResponse(userId, replyToken, [{
    type: 'text',
    text: `ขอบคุณครับ! จองคิวสำรวจหน้างานวันที่ ${new Date(datetime).toLocaleString('th-TH')} เรียบร้อยแล้ว ทีมงานจะโทรยืนยันอีกครั้งครับ 🙏☀️`,
    ...createQuickReplies([
      { label: '📦 ดูสินค้าอื่นๆ', data: 'action=catalog' },
      { label: '📞 ติดต่อด่วน', data: 'action=contact' }
    ])
  }]);
}

export async function handleLocationMessage(
  userId: string,
  replyToken: string,
  message: { address: string; latitude: number; longitude: number }
): Promise<void> {
  console.log(`[LINE] Location received from ${userId}: ${message.address}`);

  const context = await getUserContext(userId);
  
  // If in lead flow, update the lead
  if (context?.state === 'lead_form') {
    await updateLeadWithLocation(userId, message.address, message.latitude, message.longitude);
    
    await sendResponse(userId, replyToken, [{
      type: 'text',
      text: `ได้รับตำแหน่งแล้วครับ: ${message.address}\n\nกรุณาพิมพ์ชื่อหรือเบอร์ติดต่อของคุณเพื่อยืนยันการรับใบเสนอราคาครับ`,
      ...createQuickReplies([{ label: '🤖 คุยกับ AI', data: 'action=ai_chat' }])
    }]);
  } else {
    // Normal context: just acknowledge or handle via AI
    await sendResponse(userId, replyToken, [{
      type: 'text',
      text: `ขอบคุณครับสำหรับตำแหน่งที่ส่งมา (${message.address}) ต้องการให้ผมทำอะไรกับตำแหน่งนี้ดีครับ?`,
      ...createQuickReplies([
        { label: '📋 ขอใบเสนอราคา', data: 'action=lead_solar' },
        { label: '⚡ คำนวณค่าไฟที่นี่', data: 'action=calculator' }
      ])
    }]);
  }
}

async function updateLeadWithLocation(
  userId: string, 
  address: string, 
  lat: number, 
  lng: number
): Promise<void> {
  const { data: leads } = await supabase
    .from('leads')
    .select('id, notes')
    .eq('line_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (leads?.[0]) {
    const existingNotes = leads[0].notes || '';
    const newNotes = `${existingNotes}\nLocation: ${address} (Lat: ${lat}, Lng: ${lng})`.trim();
    await supabase
      .from('leads')
      .update({ 
        location: address,
        notes: newNotes
      })
      .eq('id', leads[0].id);
  }
}

export async function handleAiChat(userId: string, replyToken: string): Promise<void> {
  await setUserContext(userId, { state: 'ai_chat', last_action: 'ai_chat' });

  const welcome = createWelcomeMessage();
  await sendResponse(userId, replyToken, [welcome]);
}

export async function handleCatalog(userId: string, replyToken: string, params: Record<string, string> = {}): Promise<void> {
  const filter = params.filter;

  console.log('[LINE] handleCatalog:', { userId, filter, params });

  // Step 1: If no filter, show categories menu
  if (!filter) {
    const filterMsg = createCatalogFilterMessage();
    await sendResponse(userId, replyToken, [filterMsg]);
    return;
  }

  // Step 2: Show filtered products carousel
  console.log('[LINE] Calling getProductsForCatalog with filter:', filter);
  const products = await getProductsForCatalog(filter);
  console.log('[LINE] Products returned:', products.length);
  if (products.length > 0) {
    console.log('[LINE] First 2 products power_kw:', products.slice(0, 2).map(p => `${p.power_kw} (${typeof p.power_kw})`));
  }

  if (products.length === 0) {
    await sendResponse(userId, replyToken, [{
      type: 'text',
      text: `ขออภัยครับ ยังไม่มีสินค้าในหมวดนี้ (${filter}) ในขณะนี้ครับ 🙏`,
      ...createQuickReplies([
        { label: '🔍 เลือกหมวดอื่น', data: 'action=catalog' },
        { label: '📞 ติดต่อสอบถาม', data: 'action=contact' }
      ])
    }]);
    return;
  }

  const carousel = createCatalogCarousel(products);
  
  const json = JSON.stringify(carousel);
  const sizeKB = Math.round(json.length / 1024 * 10) / 10;
  console.log('[LINE] Carousel:', carousel.contents?.contents?.length || 0, 'bubbles,', sizeKB, 'KB');
  
  if (sizeKB > 50) {
    console.error('[LINE] Carousel too large:', sizeKB, 'KB — truncating to 3 bubbles');
    if (carousel.contents?.contents) {
      carousel.contents.contents = carousel.contents.contents.slice(0, 3);
    }
  }
  
  const messages = [
    {
      type: 'text',
      text: `📦 นี่คือสินค้าในหมวด ${getCategoryLabel(filter)} ครับ เลือกขอใบเสนอราคาได้เลยครับ:`
    },
    {
      ...carousel,
      ...createQuickReplies([
        { label: '🔍 ดูหมวดอื่น', data: 'action=catalog' },
        { label: '📋 ขอใบเสนอรวม', data: 'action=lead_solar' },
        { label: '📞 ติดต่อทีมงาน', data: 'action=contact' }
      ])
    }
  ];
  console.log('[LINE] About to send', messages.length, 'messages to user', userId);

  await sendResponse(userId, replyToken, messages);
}

function getCategoryLabel(filter: string): string {
  const map: Record<string, string> = {
    residential: 'บ้านพักอาศัย',
    commercial: 'ธุรกิจ/ออฟฟิศ',
    industrial: 'โรงงานอุตสาหกรรม',
    battery: 'ระบบแบตเตอรี่'
  };
  return map[filter] || filter;
}

export async function handlePromotion(userId: string, replyToken: string): Promise<void> {
  console.log('[LINE] Sending promotion info...');

  await setUserContext(userId, { state: 'idle', last_action: 'promotion' });

  const promotionMsg = createPromotionMessage();
  const messages: any[] = [];
  if (promotionMsg) messages.push(promotionMsg);
  messages.push({
    type: 'text',
    text: '🎁 โปรโมชั่นพิเศษประจำเดือน!\n\n🛡️ บริการหลังการขายฟรี 1 ปี (มูลค่า ฿5,000)\n• ตรวจเช็คระบบฟรีทุก 6 เดือน\n• ล้างแผงโซลาร์ 2 ครั้ง/ปี\n• วิเคราะห์ประสิทธิภาพระบบ\n\n💡 หลังปีแรก ค่าบำรุงรักษาเพียง ฿10,000/ปี\n\nกดปุ่มด้านล่างเพื่อขอใบเสนอราคาได้เลยครับ!',
    ...createQuickReplies([
      { label: '📋 ขอใบเสนอราคา', data: 'action=lead_solar' },
      { label: '⚡ คำนวณความคุ้มค่า', data: 'action=calculator' }
    ])
  });
  await sendResponse(userId, replyToken, messages);
}

export async function handleCalculator(userId: string, replyToken: string): Promise<void> {
  console.log('[LINE] Starting new calculator flow...');

  await setUserContext(userId, {
    state: 'calculator',
    calculator_step: 'idle',
    last_action: 'calc_entry'
  });

  const startMsg = createCalcStartMessage();
  await sendResponse(userId, replyToken, [startMsg]);
}

export async function handleCalcStart(userId: string, replyToken: string): Promise<void> {
  await setUserContext(userId, {
    state: 'calculator',
    calculator_step: 'bill_range',
    calc_bill_range: undefined,
    calc_system_type: undefined,
    calc_roof_type: undefined,
    calc_location: undefined,
    last_action: 'calc_restart'
  });

  const stepMsg = createCalcStepMessage({ step: 'bill_range' });
  await sendResponse(userId, replyToken, [stepMsg]);
}

export async function handleCalcStep(
  userId: string,
  replyToken: string,
  params: Record<string, string>
): Promise<void> {
  console.log('[LINE] Calc step raw params:', JSON.stringify(params));
  const context = await getUserContext(userId);
  console.log('[LINE] Calc context:', JSON.stringify(context));

  const step = params.step;

  // bill range selected
  if (step === 'bill' || step === 'bill_range') {
    const range = params.range;
    await setUserContext(userId, {
      state: 'calculator',
      calculator_step: 'system_type',
      calc_bill_range: range as any,
      last_action: `calculator_bill:${range}`
    });
    const msg = createCalcStepMessage({ 
      step: 'system_type', 
      selections: { range } 
    });
    await sendResponse(userId, replyToken, [msg]);
    return;
  }

  // system type selected
  if (step === 'type') {
    const systemType = params.type;
    const range = context?.calc_bill_range;
    await setUserContext(userId, {
      state: 'calculator',
      calculator_step: 'roof_type',
      calc_system_type: systemType as any,
      last_action: `calc_type:${systemType}`
    });
    const msg = createCalcStepMessage({ 
      step: 'roof_type', 
      selections: { range, type: systemType } 
    });
    await sendResponse(userId, replyToken, [msg]);
    return;
  }

  // roof type selected
  if (step === 'roof') {
    const roofType = params.roof;
    const range = context?.calc_bill_range;
    const systemType = context?.calc_system_type;
    await setUserContext(userId, {
      state: 'calculator',
      calculator_step: 'location',
      calc_roof_type: roofType as any,
      last_action: `calc_roof:${roofType}`
    });
    const msg = createCalcStepMessage({ 
      step: 'location', 
      selections: { range, type: systemType, roof: roofType } 
    });
    await sendResponse(userId, replyToken, [msg]);
    return;
  }

  // location selected
  if (step === 'location') {
    const location = params.loc;
    await setUserContext(userId, {
      state: 'calculator',
      calculator_step: 'result',
      calc_location: location as any,
      last_action: `calc_location:${location}`
    });

    const freshContext = await getUserContext(userId);
    const billRange = freshContext?.calc_bill_range || '4-6k';
    const systemType = freshContext?.calc_system_type || 'residential';
    const roofType = freshContext?.calc_roof_type || 'concrete';

    console.log('[LINE] Calc result params:', { billRange, systemType, roofType, location });

    const result = calculateSolarFromContext({
      billRange,
      systemType,
      roofType,
      location
    });

    await logLineAction(userId, 'calc_result', { ...result });

    // Save calculator result to lead
    const BILL_MIDPOINTS: Record<string, number> = {
      '2-4k': 3000, '4-6k': 5000, '6-8k': 7000, '8-10k': 9000,
      '10-15k': 12500, '15-20k': 17500, '20-30k': 25000, 
      '30-40k': 35000, '40-50k': 45000, '50k+': 75000
    };
    const billAmount = BILL_MIDPOINTS[billRange] || 5000;
    await submitLead({
      line_id: userId,
      system_size: result.systemKw,
      bill_amount: billAmount,
      location: location,
      source: 'line',
      status: 'New (LINE)',
      notes: `Calculator result: ${result.systemKw}kW, ${billRange} bill, saves ${result.monthlySavings}/mo`,
    }).catch(err => console.error('[LINE] Failed to save calc result to lead:', err));

    await setUserContext(userId, {
      state: 'calculator',
      calculator_step: 'result',
      calc_result_kw: result.systemKw,
      last_action: `calc_result:${result.systemKw}`
    });

    const resultMsg = createCalcResultMessage(result);
    await sendResponse(userId, replyToken, [resultMsg]);
    return;
  }

  if (step === 'back') {
    const currentStep = (await getUserContext(userId))?.calculator_step;
    let prevStep = 'bill_range';

    if (currentStep === 'system_type') prevStep = 'bill_range';
    else if (currentStep === 'roof_type') prevStep = 'system_type';
    else if (currentStep === 'location') prevStep = 'roof_type';
    else if (currentStep === 'result') prevStep = 'location';

    const freshContext = await getUserContext(userId);
    await setUserContext(userId, { state: 'calculator', calculator_step: prevStep as any });
    
    const msg = createCalcStepMessage({ 
      step: prevStep,
      selections: {
        range: freshContext?.calc_bill_range,
        type: freshContext?.calc_system_type,
        roof: freshContext?.calc_roof_type
      }
    });
    await sendResponse(userId, replyToken, [msg]);
    return;
  }

  await sendResponse(userId, replyToken, [
    { 
      type: 'text', 
      text: 'เกิดข้อผิดพลาด ลองเริ่มใหม่นะครับ 🙏',
      ...createQuickReplies([{ label: '🔄 เริ่มใหม่', data: 'action=calc_restart' }])
    }
  ]);
}

export async function getLineProfile(userId: string): Promise<{ displayName: string, pictureUrl?: string } | null> {
  if (!LINE_REPLY_TOKEN || !userId) return null;
  try {
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: { 'Authorization': `Bearer ${LINE_REPLY_TOKEN}` }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('[LINE] Profile fetch error:', error);
    return null;
  }
}

export async function handleLeadForm(
  userId: string,
  replyToken: string,
  params: Record<string, string>
): Promise<void> {
  console.log('[LINE] Smart Lead flow requested...', params);

  const context = await getUserContext(userId);
  const profile = await getLineProfile(userId);
  const displayName = profile?.displayName || 'ลูกค้า';

  // PRIORITY: Data from button (stateless)
  const powerKw = params.size ? parseFloat(params.size) : context?.calc_result_kw;
  const billRange = params.bill || context?.calc_bill_range;
  const location = params.loc || context?.calc_location;

  if (powerKw || billRange) {
    const leadMsg = createLeadConfirmMessage({
      name: displayName,
      bill: billRange ? getBillLabel(billRange) : 'ยังไม่ได้ระบุ',
      size: powerKw ? `${powerKw} kW` : 'ยังไม่ได้คำนวณ',
      location: location ? getLocationLabel(location) : 'ยังไม่ได้ระบุ'
    });
    
    // Temporarily save these specifically to context so confirm button can use them if needed
    if (params.size || params.bill || params.loc) {
      await setUserContext(userId, {
        calc_result_kw: powerKw,
        calc_bill_range: billRange as any,
        calc_location: location as any
      });
    }

    await sendResponse(userId, replyToken, [
      leadMsg,
      {
        type: 'text',
        text: '👆 ยืนยันข้อมูลด้านบนเพื่อขอใบเสนอราคา หรือเลือกแก้ไขข้อมูลครับ',
        ...createQuickReplies([
          { label: '✅ ยืนยันขอใบเสนอ', data: 'action=confirm_lead' },
          { label: '✏️ แก้ไขข้อมูล', data: 'action=calculator' }
        ])
      }
    ]);
    return;
  }

  // Fallback: If no data, send a friendly form
  const leadForm = createLeadFormMessage();
  await sendResponse(userId, replyToken, [
    {
      type: 'text',
      text: `สวัสดีครับคุณ ${displayName}! 😊 ยินดีที่ได้ให้บริการครับ`
    },
    leadForm
  ]);
}

export async function handleConfirmLead(userId: string, replyToken: string): Promise<void> {
  const context = await getUserContext(userId);
  console.log('[LINE] handleConfirmLead:', { userId, contextKeys: Object.keys(context || {}) });

  try {
    const systemKw = context?.calc_result_kw || 0;
    const location = context?.calc_location || 'Krabi (LINE)';
    const billRange = context?.calc_bill_range || 'unknown';

    const BILL_MIDPOINTS: Record<string, number> = {
      '2-4k': 3000, '4-6k': 5000, '6-8k': 7000, '8-10k': 9000,
      '10-15k': 12500, '15-20k': 17500, '20-30k': 25000, 
      '30-40k': 35000, '40-50k': 45000, '50k+': 75000
    };
    const billAmount = BILL_MIDPOINTS[billRange] || 0;

    console.log('[LINE] Submitting lead:', { systemKw, location, billRange, billAmount });

    const profile = await getLineProfile(userId);
    const displayName = profile?.displayName || 'ลูกค้า LINE';

    const { success, lead, error } = await submitLead({
      name: displayName,
      line_id: userId,
      system_size: systemKw,
      bill_amount: billAmount,
      location: location,
      notes: `LINE lead: system ${systemKw}kW, bill range ${billRange}, saves confirmed`,
      status: 'New (LINE)',
      source: 'line'
    });

    console.log('[LINE] submitLead result:', { success, leadId: lead?.id, error });

    if (!success || error) {
      console.error('[LINE] submitLead error:', error);
      throw new Error(error || 'Unknown error');
    }

    await setUserContext(userId, { state: 'lead_form', last_action: 'lead_confirmed' });

    const successMsg = createSuccessMessage(
      `✅ บันทึกข้อมูลสำเร็จแล้วครับ!\n\nระบบ ${systemKw}kW ของคุณอยู่ในการดูแลของทีม${brand.nameTh} แล้ว ☀️`,
      lead?.id
    );

    const phoneRequestMsg = {
      type: 'text',
      text: '📱 หากต้องการให้เราโทรกลับ สามารถส่งเบอร์โทรศัพท์ได้เลยครับ\n\n(ไม่บังคับ - ถ้าไม่สะดวก ทีมงานจะติดต่อผ่าน LINE แทนครับ)',
      ...createQuickReplies([
        { label: '🏠 จบการทำงาน', data: 'action=ai_chat' },
        { label: '📞 ติดต่อด่วน', data: 'action=contact' }
      ])
    };

    await sendResponse(userId, replyToken, [successMsg, phoneRequestMsg]);

  } catch (error) {
    console.error('[LINE] Confirm lead error:', error);
    await sendResponse(userId, replyToken, [{
      type: 'text',
      text: `❌ เกิดข้อผิดพลาด ขออภัยครับ กรุณาลองใหม่อีกครับ 🙏 (${(error as Error).message})`
    }]);
  }
}

export async function handleSurveySegment(
  userId: string, 
  replyToken: string, 
  params: Record<string, string>
): Promise<void> {
  const segment = params.type || 'other';
  console.log(`[LINE] Survey segment for ${userId}: ${segment}`);

  // Update the latest lead for this user with the segment info
  const { data: leads } = await supabase
    .from('leads')
    .select('id')
    .eq('line_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (leads?.[0]) {
    await supabase
      .from('leads')
      .update({ notes: `Building type: ${segment}` })
      .eq('id', leads[0].id);
  }

  await sendResponse(userId, replyToken, [{
    type: 'text',
    text: 'ขอบคุณสำหรับข้อมูลเพิ่มเติมครับ! ทีมงานจะรีบสรุปใบเสนอราคาให้ตามที่ระบุไว้ครับ 🙏☀️',
    ...createQuickReplies([
      { label: '📦 ดูแคตตาล็อก', data: 'action=catalog' },
      { label: '📞 ติดต่อด่วน', data: 'action=contact' }
    ])
  }]);
}

export async function handleContact(userId: string, replyToken: string): Promise<void> {
  console.log('[LINE] Sending contact info...');

  await setUserContext(userId, { state: 'idle', last_action: 'contact' });

  const contactMsg = createContactMessage();
  await sendResponse(userId, replyToken, [contactMsg]);
}

export async function handleProductDetail(
  userId: string,
  replyToken: string,
  params: Record<string, string>
): Promise<void> {
  const productId = params.id;
  console.log('[LINE] handleProductDetail:', productId);

  if (!productId) {
    await sendResponse(userId, replyToken, [{ type: 'text', text: 'ไม่พบรหัสสินค้าครับ 🙏' }]);
    return;
  }

  const { data: product, error } = await supabase
    .from('solar_products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !product) {
    console.error('[LINE] Product fetch error:', error);
    await sendResponse(userId, replyToken, [{ type: 'text', text: 'ขออภัยครับ ไม่พบข้อมูลสินค้านี้ในระบบ 🙏' }]);
    return;
  }

  const { createProductDetailCarousel } = await import('./line-messages');
  const carousel = createProductDetailCarousel(product);

  await sendResponse(userId, replyToken, [
    {
      ...carousel,
      ...createQuickReplies([
        { label: '⬅️ กลับไปดูแคตตาล็อก', data: 'action=catalog' },
        { label: '📞 ติดต่อทีมงาน', data: 'action=contact' }
      ])
    }
  ]);
}

export async function handleLiff(userId: string, replyToken: string): Promise<void> {
  await setUserContext(userId, { state: 'idle', last_action: 'liff' });
  const appMsg = createAppLauncherMessage();
  await sendResponse(userId, replyToken, [appMsg]);
}

export async function handleAboutTan(userId: string, replyToken: string): Promise<void> {
  await setUserContext(userId, { state: 'idle', last_action: 'about_tan' });
  const { createAboutTanMessage } = await import('./line-messages');
  const aboutMsg = createAboutTanMessage();
  await sendResponse(userId, replyToken, [aboutMsg]);
}

export async function handleGeneratePdf(
  userId: string,
  replyToken: string,
  params: Record<string, string>
): Promise<void> {
  console.log('[LINE] PDF Generation requested:', params);

  // Immediate feedback to improve UX
  await sendResponse(userId, replyToken, [{ 
    type: 'text', 
    text: '📄 แทนกำลังเตรียมใบเสนอราคา PDF ให้คุณสักครู่นะครับ... (กรุณารอสักครู่เพื่อความแม่นยำ)' 
  }]);

  // Retrieve lead with details
  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, bill_amount, equipment_tier, system_size')
    .eq('line_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  const lead = leads?.[0];
  if (!lead) {
     await sendResponse(userId, replyToken, [{ type: 'text', text: 'ไม่พบข้อมูลการจองของคุณ กรุณาเริ่มคำนวณใหม่ครับ 🙏' }]);
     return;
  }

  const hasBillData = lead.bill_amount && Number(lead.bill_amount) > 0;
  const normalizedTier = lead.equipment_tier?.toLowerCase();
  const hasTier = normalizedTier && ['eco', 'premium', 'ultra'].includes(normalizedTier);

  let title: string, subtitle: string, btnLabel: string;
  if (hasTier) {
    title = '📄 ใบเสนอราคาระบบที่คุณเลือก';
    subtitle = 'ระบบที่คุณเลือก + 2 ทางเลือกสำหรับเปรียบเทียบ';
    btnLabel = '📱 เปิด PDF';
  } else if (hasBillData) {
    title = '📄 ข้อเสนอส่วนบุคคล';
    subtitle = `ประเมินจากค่าไฟฟ้า ${Number(lead.bill_amount).toLocaleString('th-TH')} บาท/เดือน`;
    btnLabel = '📱 เปิดเอกสาร';
  } else {
    title = '📄 ตัวอย่างข้อเสนอ';
    subtitle = 'ระบบ 5kW — เปรียบเทียบทั้ง 3 ระดับ';
    btnLabel = '📱 เปิดตัวอย่าง';
  }

  const liffUrl = process.env.NEXT_PUBLIC_LINE_LIFF_URL || 'https://liff.line.me/2010020881-koR53fSr';
  const proposalLiffUrl = `${liffUrl}?leadId=${lead.id}&uid=${encodeURIComponent(userId)}`;

  await sendResponse(userId, replyToken, [{
    type: 'flex',
    altText: `ใบเสนอราคา ${brand.name}`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box', layout: 'vertical', paddingAll: '20px',
        contents: [
          { type: 'text', text: title, weight: 'bold', size: 'md', color: '#FF8A00', contents: [] },
          { type: 'text', text: subtitle, wrap: true, size: 'xs', color: '#475569', margin: 'md', contents: [] },
          { type: 'separator', color: '#E2E8F0', margin: 'md' },
          { type: 'text', text: `💡 PDF จะถูกสร้างหลังจากคุณเปิดลิงก์`, wrap: true, size: 'xxs', color: '#94A3B8', margin: 'md', contents: [] }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '20px',
        contents: [
          {
            type: 'button',
            action: { type: 'uri', label: btnLabel, uri: proposalLiffUrl },
            style: 'primary', color: '#FF8A00'
          }
        ]
      }
    }
  }]);
}


export async function handleCalculatorQuickInput(
  userId: string,
  replyToken: string,
  bill: number
): Promise<void> {
  console.log('[LINE] Calculator quick input:', bill);

  let billRange = '4-6k';
  if (bill <= 4000) billRange = '2-4k';
  else if (bill <= 6000) billRange = '4-6k';
  else if (bill <= 8000) billRange = '6-8k';
  else if (bill <= 10000) billRange = '8-10k';
  else if (bill <= 15000) billRange = '10-15k';
  else if (bill <= 20000) billRange = '15-20k';
  else if (bill <= 30000) billRange = '20-30k';
  else if (bill <= 40000) billRange = '30-40k';
  else if (bill <= 50000) billRange = '40-50k';
  else billRange = '50k+';

  await setUserContext(userId, {
    state: 'calculator',
    calculator_step: 'system_type',
    calc_bill_range: billRange as any,
    calculator_bill: bill,
    last_action: 'calc_quick_bill'
  });

  const msg = createCalcStepMessage({ step: 'system_type' });
  await sendResponse(userId, replyToken, [msg]);
}

export async function handleTextMessage(
  userId: string,
  replyToken: string,
  text: string
): Promise<void> {
  const context = await getUserContext(userId);
  const lowerText = text.trim().toLowerCase();

  console.log('[LINE] Message:', { userId, text, contextState: context?.state });

  await logLineAction(userId, 'message', { text, state: context?.state });

  // Special Case: Optional Phone Number after Lead Confirmation
  if (context?.state === 'lead_form' && context.last_action === 'lead_confirmed') {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits.length >= 9 && digits.length <= 12) {
      await updateLeadWithPhone(userId, digits);
      await sendResponse(userId, replyToken, [{
        type: 'text',
        text: `ขอบคุณครับ! บันทึกเบอร์โทร ${text} เรียบร้อยแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุดครับ 🙏☀️`,
        ...createQuickReplies([
          { label: '📦 ดูสินค้า', data: 'action=catalog' },
          { label: '🤖 คุยกับ AI', data: 'action=ai_chat' }
        ])
      }]);
      await setUserContext(userId, { state: 'idle' });
      return;
    }
  }

  if (context?.state === 'calculator' && context.calculator_step !== 'idle' && context.calculator_step !== 'result') {
    await handleCalcStep(userId, replyToken, { step: 'text_input', text: text });
    return;
  }

  if (context?.state === 'lead_form' && context.last_action !== 'lead_confirmed') {
    await handleLeadSubmission(userId, replyToken, text);
    return;
  }

  if (lowerText.includes('ขอบคุณ') || lowerText.includes('thank')) {
    await sendResponse(userId, replyToken, [{
      type: 'text',
      text: 'ไม่เป็นไรครับ 😊 หากมีคำถามเพิ่มเติม สามารถสอบถามได้ตลอดเวลาครับ!'
    }]);
    return;
  }

  if (lowerText.includes('ติดต่อ') || lowerText.includes('โทร') || lowerText.includes('เบอร์')) {
    await handleContact(userId, replyToken);
    return;
  }

  if (lowerText.includes('ราคา') || lowerText.includes('แพ็กเกจ') || lowerText.includes('catalog') || lowerText.includes('แคตตาล็อก')) {
    await handleCatalog(userId, replyToken);
    return;
  }

  if (lowerText.includes('คำนวณ') || lowerText.includes('calc') || lowerText.includes('ประหยัด')) {
    await handleCalculator(userId, replyToken);
    return;
  }

  await handleAiChatMessage(userId, replyToken, text);
}

async function updateLeadWithPhone(userId: string, phone: string): Promise<void> {
  const { data: leads } = await supabase
    .from('leads')
    .select('id')
    .eq('line_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (leads?.[0]) {
    await supabase
      .from('leads')
      .update({ phone: phone })
      .eq('id', leads[0].id);
  }
}

async function handleCalculatorInput(
  userId: string,
  replyToken: string,
  input: string
): Promise<void> {
  const bill = parseUserBillInput(input);

  if (!bill) {
    await sendResponse(userId, replyToken, [{
      type: 'text',
      text: '❌ กรุณาใส่ตัวเลขค่าไฟที่ถูกต้อง เช่น "5000" || "8000" (บาท)',
      ...createQuickReplies([
        { label: '⚡ คำนวณใหม่', data: 'action=calc_restart' },
        { label: '📞 ติดต่อทีมงาน', data: 'action=contact' }
      ])
    }]);
    return;
  }

  await handleCalculatorQuickInput(userId, replyToken, bill);
}

async function handleAiChatMessage(
  userId: string,
  replyToken: string,
  text: string
): Promise<void> {
  try {
    const response = await fetch(`${siteUrl}/api/chat/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: text }
        ],
        userId: userId,
        source: 'line'
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiText = data.text || '';

    if (!aiText) {
      throw new Error('Empty AI response');
    }

    // --- Product Tag Parsing ---
    const productIds: string[] = [];
    const productRegex = /\[PRODUCT_ID:([\s\S]*?)\]/g;
    let match;
    while ((match = productRegex.exec(aiText)) !== null) {
      productIds.push(match[1].trim());
    }

    // Clean text from tags
    const cleanAiText = aiText.replace(productRegex, '').trim();

    // 1. Prepare base message (Text)
    const messages: any[] = [{
      type: 'text',
      text: cleanAiText.slice(0, 2000)
    }];

    // 2. Prepare Quick Replies (Dynamic from AI or Default)
    const qr = data.quickReply || createQuickReplies([
      { label: '📦 แพ็กเกจ', data: 'action=catalog' },
      { label: '⚡ คำนวณค่าไฟ', data: 'action=calculator' },
      { label: '🎁 โปรโมชั่น', data: 'action=promotion' },
      { label: '📋 ขอใบเสนอ', data: 'action=lead_solar' },
      { label: '📞 ติดต่อ', data: 'action=contact' }
    ]).quickReply;

    // 3. Fetch Products if AI requested them OR if it's a specific power query
    let products: any[] = [];
    if (productIds.length > 0) {
      const { data: dbProducts } = await supabase
        .from('solar_products')
        .select('*')
        .in('id', productIds);
      products = dbProducts || [];
    } 
    
    // Fallback: ONLY search if there is a clear intent for POWER (kW)
    const isPowerQuery = text.toLowerCase().includes('kw') || /^[0-9]+$/.test(text.trim());
    if (products.length === 0 && isPowerQuery) {
      const cleanSearch = text.replace(/kW|kw|ราคา|ชุด|โซลาร์|เซลล์/g, '').trim();
      const numericKw = parseInt(cleanSearch);

      if (!isNaN(numericKw) && numericKw < 1000) {
        const { data: searchProducts } = await supabase
          .from('solar_products')
          .select('*')
          .eq('type', 'system')
          .or(`power_kw.eq.${numericKw},name.ilike.%${numericKw}%`)
          .limit(5);
        products = searchProducts || [];
      }
    }

    // 4. Build message chain
    if (products.length > 0) {
      // Add "Create Proposal" button to quick replies if we have product recommendations
      if (qr && qr.items) {
        qr.items.unshift({
          type: 'action',
          action: { 
            type: 'postback', 
            label: '📄 สร้างใบเสนอราคา', 
            data: `action=lead_solar&size=${products[0].power_kw || 5}`, 
            displayText: 'ขอใบเสนอราคาจากคำแนะนำนี้ครับ' 
          }
        });
      }

      const carousel = createCatalogCarousel(products);
      // Attach Quick Replies to the CAROUSEL (because it is the last message)
      messages.push({
        ...carousel,
        quickReply: qr
      });
    } else {
      // Attach Quick Replies to the TEXT message (as it's the last/only message)
      messages[0].quickReply = qr;
    }

    await sendResponse(userId, replyToken, messages);

  } catch (error) {
    console.error('[LINE] AI chat error:', error);
    const errorMsg = createAIErrorFlex();
    await sendResponse(userId, replyToken, [errorMsg]);
  }
}

export async function parseLineLeadData(text: string): Promise<{
  name?: string;
  phone?: string;
  location?: string;
  bill?: number;
} | null> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const result: any = {};

  for (const line of lines) {
    const parts = line.split(':').map(p => p.trim());
    if (parts.length < 2) continue;

    const key = parts[0].toLowerCase();
    const value = parts[1];

    if (key.includes('ชื่อ') || key.includes('name')) {
      result.name = value;
    } else if (key.includes('เบอร์') || key.includes('โทร') || key.includes('phone') || key.includes('tel')) {
      result.phone = value.replace(/[^0-9]/g, '');
    } else if (key.includes('ที่อยู่') || key.includes('พื้นที่') || key.includes('location')) {
      result.location = value;
    } else if (key.includes('ค่าไฟ') || key.includes('bill')) {
      result.bill = parseInt(value.replace(/[^0-9]/g, ''));
    }
  }

  if (result.name && result.phone) {
    return result;
  }

  return null;
}

export async function handleLeadSubmission(
  userId: string,
  replyToken: string,
  text: string
): Promise<void> {
  const leadData = await parseLineLeadData(text);

  if (!leadData) {
    // If structured parse fails, let AI handle it naturally (it will still enrich lead data via extractAndEnrichLead)
    console.log('[LINE] Structured lead parse failed, falling back to AI chat');
    await handleAiChatMessage(userId, replyToken, text);
    return;
  }

  try {
    const { success, lead, error } = await submitLead({
      name: leadData.name,
      phone: leadData.phone,
      location: leadData.location || 'Krabi (LINE)',
      bill_amount: leadData.bill || 0,
      status: 'New (LINE)',
      line_id: userId,
      source: 'line'
    });

    if (!success || error) throw new Error(error);

    await setUserContext(userId, { state: 'idle', last_action: 'lead_submitted' });
    await logLineAction(userId, 'lead_submitted', leadData);

    const successMsg = createSuccessMessage('รับข้อมูลแล้วครับ! ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง ☀️');

    const messages: any[] = [successMsg];

    // Auto-offer PDF if we have enough data (bill + system_size)
    if (lead?.bill_amount > 0 && lead?.system_size > 0) {
      const liffUrl = process.env.NEXT_PUBLIC_LINE_LIFF_URL || 'https://liff.line.me/2010020881-koR53fSr';
      const proposalLiffUrl = `${liffUrl}?leadId=${lead.id}&uid=${encodeURIComponent(userId)}`;
      messages.push({
        type: 'flex',
        altText: `ใบเสนอราคา ${brand.name}`,
        contents: {
          type: 'bubble',
          body: {
            type: 'box', layout: 'vertical', paddingAll: '20px',
            contents: [
              { type: 'text', text: '📄 ใบเสนอราคาส่วนบุคคล', weight: 'bold', size: 'md', color: '#FF8A00', contents: [] },
              { type: 'text', text: `ประเมินจากค่าไฟฟ้า ${Number(lead.bill_amount).toLocaleString('th-TH')} บาท/เดือน`, wrap: true, size: 'xs', color: '#475569', margin: 'md', contents: [] },
              { type: 'separator', color: '#E2E8F0', margin: 'md' },
              { type: 'text', text: '💡 PDF ถูกสร้างอัตโนมัติสำหรับคุณแล้ว', wrap: true, size: 'xxs', color: '#94A3B8', margin: 'md', contents: [] }
            ]
          },
          footer: {
            type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '20px',
            contents: [
              {
                type: 'button',
                action: { type: 'uri', label: '📱 เปิด PDF', uri: proposalLiffUrl },
                style: 'primary', color: '#FF8A00'
              }
            ]
          }
        }
      });
    }

    await sendResponse(userId, replyToken, messages);

    // NOTE: Notification is handled by DB trigger on_lead_created
  } catch (error) {
    console.error('[LINE] Lead save error:', error);

    await sendResponse(userId, replyToken, [{
      type: 'text',
      text: '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล\n\nกรุณาลองใหม่อีกครั้ง หรือติดต่อทีมงานโดยตรงครับ 🙏'
    }]);
  }
}
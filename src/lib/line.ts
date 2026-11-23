import { brand } from './site.config';

export const generateLineShareText = (data: any) => {
  const savings = Math.round(data.monthlySavings || 0).toLocaleString('th-TH');
  const tierName = data.tiers?.[data.selectedTier]?.name || 'Premium';
  const leadId = data.leadId || '';
  const userId = data.userId || '';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const proposalUrl = `${baseUrl}/proposal/${leadId}?uid=${userId}&openExternalBrowser=1`;
  const pdfUrl = data.pdfUrl || '';

  return `☀️ ผลลัพธ์การคำนวณความคุ้มค่าจาก${brand.nameTh} / ${brand.name} ☀️

เรียนคุณ ${data.customerName ?? 'ลูกค้า'} 🙏
หลังจากวิเคราะห์ข้อมูลการใช้ไฟฟ้าของคุณแล้ว นี่คือข้อเสนอพิเศษสำหรับคุณครับ:

📦 แพ็กเกจแนะนำ: ${tierName}
⚡ ขนาดระบบ: ${data.systemKw ?? 0} kW

📈 สรุปความคุ้มค่า:
💰 ประหยัดค่าไฟได้สูงสุด: ฿${savings} ต่อเดือน
⏳ คืนทุนไวใน: ${data.paybackYears ?? 0} ปี

---
📊 ดูรายละเอียดใบเสนอราคาฉบับเต็ม:
${proposalUrl}

📄 ดาวน์โหลด PDF:
${pdfUrl}
---
👉 ตอบกลับข้อความนี้เพื่อรับคำปรึกษาฟรี หรือสอบถามรายละเอียดเพิ่มเติม
ขอบคุณที่ให้${brand.nameTh} / ${brand.name} ดูแลเรื่องพลังงานสะอาดครับ!`;
};
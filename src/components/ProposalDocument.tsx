// Note: using <img> not next/image — ProposalDocument renders via renderToString() outside Next.js context
import type { PDFData } from '@/lib/pdf/generator';
import { FEATURES } from '@/lib/feature-flags';
import { brand, contact, siteUrl } from '@/lib/site.config';

/* eslint-disable @next/next/no-head-element, @next/next/no-sync-scripts */

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#f1f5f9" width="400" height="300"/><text x="200" y="140" text-anchor="middle" font-family="Inter,sans-serif" font-size="48" fill="#94a3b8">☀️</text><text x="200" y="180" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" fill="#94a3b8">Solar Product</text></svg>');

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Prompt:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap';

const pn = (n: number) => new Intl.NumberFormat('th-TH').format(n);
const fmtTHB = (num: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(num);

function Page({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`proposal-page w-[297mm] h-[210mm] bg-white relative overflow-hidden ${className}`}
      style={{ pageBreakAfter: 'always', breakAfter: 'page' } as React.CSSProperties}>
      {children}
    </div>
  );
}

export default function ProposalDocument({ data }: { data: PDFData }) {
  const eco = data.tiers.eco || { name: 'Standard Eco', price_thb: 0, image_url: '' };
  const premium = data.tiers.premium || { name: 'Premium Care', price_thb: 0, image_url: '' };
  const ultra = data.tiers.ultra || { name: 'Ultra Hybrid', price_thb: 0, image_url: '' };

  const scenario = data.scenario || 'personal';
  const selectedTier = data.selectedTier;
  const isSelected = (key: string) => key === selectedTier;

  const getImg = (p: any) => {
    if (!p || !p.image_url) return PLACEHOLDER;
    if (p.image_url.startsWith('http')) return p.image_url;
    return `${siteUrl}${p.image_url.startsWith('/') ? '' : '/'}${p.image_url}`;
  };

  const specSafely = (p: any, key: string, fallback = '—') => p?.specifications?.[key] || fallback;

  const coverBadge = scenario === 'sample' ? 'ตัวอย่างข้อเสนอ' : scenario === 'selected' ? 'ใบเสนอราคาที่คุณเลือก' : 'ข้อเสนออย่างเป็นทางการ';
  const coverTagline = scenario === 'sample' ? 'ระบบ 5kW ทั่วไป — ตัวอย่างเท่านั้น' : `ระบบ ${data.systemKw}kW — ${data.location || 'กระบี่'}`;

  const tierMeta = [
    { p: eco, key: 'eco', badge: scenario === 'selected' && isSelected('eco') ? '✓ ที่คุณเลือก' : 'ECO', badgeBg: isSelected('eco') ? 'bg-orange-500' : 'bg-orange-100', badgeText: isSelected('eco') ? 'text-white' : 'text-orange-800', label: 'เริ่มต้นประหยัด', desc: 'ระบบ On-Grid มาตรฐาน ราคาเข้าถึงได้ เหมาะกับบ้านที่ต้องการลดค่าไฟทันที', border: isSelected('eco') ? 'border-orange ring-2 ring-orange-200' : 'border-gray-200' },
    { p: premium, key: 'premium', badge: scenario === 'selected' && isSelected('premium') ? '✓ ที่คุณเลือก' : 'PREMIUM', badgeBg: isSelected('premium') ? 'bg-orange-500' : 'bg-blue-100', badgeText: isSelected('premium') ? 'text-white' : 'text-blue-800', label: 'คุ้มค่าที่สุด', desc: 'แผง Tier-1 อินเวอร์เตอร์คุณภาพสูง อายุการใช้งานยาวนาน ประหยัดสูงสุด', border: isSelected('premium') ? 'border-orange ring-2 ring-orange-200 shadow-xl' : 'border-orange shadow-xl' },
    { p: ultra, key: 'ultra', badge: scenario === 'selected' && isSelected('ultra') ? '✓ ที่คุณเลือก' : 'ULTRA', badgeBg: isSelected('ultra') ? 'bg-orange-500' : 'bg-purple-100', badgeText: isSelected('ultra') ? 'text-white' : 'text-purple-800', label: 'เทคโนโลยีล้ำ', desc: 'ระบบ Hybrid พร้อมแบตเตอรี่สำรอง ตัดขาดค่าไฟ พร้อมรับอนาคต', border: isSelected('ultra') ? 'border-orange ring-2 ring-orange-200' : 'border-gray-200' },
  ];

  const selectedProduct = data.tiers[data.selectedTier || 'premium'] || premium;
  const components: { qty?: number; item?: string; warranty?: string }[] = selectedProduct.system_components || [];

  const yearlySave = data.monthlySavings * 12;
  const totalWithoutSolar = data.monthlyBill * 12 * 25;
  const totalWithSolar = data.totalCost + (data.monthlyBill - data.monthlySavings) * 12 * 25;
  const netSave = totalWithoutSolar - totalWithSolar;
  const co2Year = Math.round(data.systemKw * 1.1);
  const treesYear = Math.round(data.systemKw * 0.3);

  const { downPayment, monthly36, monthly60 } = data.installmentCalculation;
  const monthly48 = Math.round((data.totalCost - downPayment) / 48);
  const totalInstallment60 = downPayment + monthly60 * 60;
  const totalPEA25yr = data.monthlyBill * 12 * 25;
  const remainingBillWithSolar = (data.monthlyBill - data.monthlySavings) * 12 * 25;
  const totalInstallmentViaPEA = totalInstallment60 + remainingBillWithSolar;
  const totalSaved = totalPEA25yr - totalInstallmentViaPEA;

  return (
    <html lang="th">
      <head>
        <meta charSet="UTF-8" />
        <script src="https://cdn.tailwindcss.com" />
        <link href={FONT_HREF} rel="stylesheet" />
        <style>{`
          @page { size: A4 landscape; margin: 0; }
          body { font-family: 'Manrope', 'Prompt', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .font-heading { font-family: 'Manrope', 'Prompt', sans-serif; font-weight: 800; letter-spacing: -0.025em; }
          .font-subheading { font-family: 'Manrope', 'Prompt', sans-serif; font-weight: 600; }
          .font-body { font-family: 'Manrope', 'Prompt', sans-serif; font-weight: 400; }
          .font-tech { font-family: 'JetBrains Mono', monospace; font-weight: 500; }
        `}</style>
      </head>
      <body>
        {/* P1: COVER */}
        <Page>
          <div className="flex flex-row h-full">
            <div className="w-[35%] bg-orange-950 text-white p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px]" />
              <div className="relative z-10">
                <div className="mb-2">
                  <div className="text-xl font-extrabold tracking-tight">{brand.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-orange-300/70 mt-1">Solar Engineering · Krabi</div>
                </div>
                <div className="mt-14">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-orange-400 font-semibold">{coverBadge}</div>
                  <h1 className="text-4xl font-extrabold leading-tight mt-4">เอกสารนำเสนอ<br />โครงการโซลาร์</h1>
                  <div className="w-10 h-0.5 bg-orange mt-6" />
                  <div className="text-white/80 font-semibold text-sm mt-4">{coverTagline}</div>
                </div>
              </div>
              <div className="relative z-10 text-[10px] text-orange-200/60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-px bg-orange-500/30 inline-block" />
                  <span>วิศวกรผู้ดูแล</span>
                </div>
                <div className="text-white/80 font-semibold text-sm">{data.engineerName || `ทีมวิศวกร ${brand.name}`}</div>
                <div className="mt-0.5">{data.engineerTitle || `ทีมวิศวกรรมอาวุโส ${brand.name}`}</div>
              </div>
            </div>
            <div className="flex-1 p-14 flex flex-col justify-between">
              <div className="text-right text-[10px] uppercase tracking-[0.2em] text-gray-400">ข้อเสนอเฉพาะสำหรับ</div>
              <div className="text-center -mt-6">
                <h2 className="text-5xl font-extrabold leading-tight">{data.customerName}</h2>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="h-px w-12 bg-orange-200 inline-block" />
                  <span className="text-xs text-gray-400">{data.location || 'กระบี่'}</span>
                  <span className="h-px w-12 bg-orange-200 inline-block" />
                </div>
              </div>
              <div>
                <div className="grid grid-cols-3 gap-5 mb-4">
                  <div className="bg-orange-50 rounded-2xl p-5 text-center">
                    <div className="mb-1 text-lg">☀️</div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">กำลังผลิต</div>
                    <div className="text-2xl font-extrabold">{data.systemKw} <span className="text-sm text-gray-400">KWP</span></div>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-5 text-center">
                    <div className="mb-1 text-lg">💰</div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">ประหยัดต่อปี</div>
                    <div className="text-2xl font-extrabold text-orange-500">{fmtTHB(yearlySave)}</div>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-5 text-center">
                    <div className="mb-1 text-lg">📅</div>
                    <div className="text-[10px] uppercase text-gray-500 mb-1">คืนทุน</div>
                    <div className="text-2xl font-extrabold text-orange-500">{data.paybackYears}<span className="text-sm text-gray-400"> ปี</span></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-orange-500">🌱 {co2Year} ตัน CO₂/ปี</span>
                    <span className="w-px h-3 bg-gray-200" />
                    <span className="text-[10px] text-gray-400">เทียบเท่าปลูก {treesYear} ต้นไม้</span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Page>

        {/* P2: ROI ANALYSIS */}
        <Page className="p-12 flex flex-col">
          <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-5">
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-2 text-orange-500">02 / การวิเคราะห์ผลตอบแทน</div>
              <h2 className="text-3xl font-extrabold">ความคุ้มค่าทางการเงิน</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-orange-50 rounded-2xl p-5 text-center border-l-4 border-orange-500">
              <div className="text-[10px] uppercase text-gray-500 mb-1">ประหยัดต่อปี</div>
              <div className="text-xl font-extrabold text-orange-500">{fmtTHB(yearlySave)}</div>
              <div className="text-[10px] text-gray-400">คิดเป็น {(data.monthlySavings / data.monthlyBill * 100).toFixed(0)}% ของค่าไฟเดิม</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 text-center border-l-4 border-amber-400">
              <div className="text-[10px] uppercase text-gray-500 mb-1">ระยะเวลาคืนทุน</div>
              <div className="text-xl font-extrabold text-amber-600">{data.paybackYears} ปี</div>
              <div className="text-[10px] text-gray-400">เร็วกว่าค่าเฉลี่ยอุตสาหกรรม</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-5 text-center border-l-4 border-blue-400">
              <div className="text-[10px] uppercase text-gray-500 mb-1">กำไรสุทธิ 25 ปี</div>
              <div className="text-xl font-extrabold text-blue-600">{fmtTHB(netSave)}</div>
              <div className="text-[10px] text-gray-400">ผลตอบแทน {(netSave / data.totalCost * 100 / 25).toFixed(0)}% ต่อปี</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-5 text-center border-l-4 border-green-400">
              <div className="text-[10px] uppercase text-gray-500 mb-1">ลด CO₂</div>
              <div className="text-xl font-extrabold text-green-600">{co2Year} ตัน/ปี</div>
              <div className="text-[10px] text-gray-400">เทียบเท่าปลูก {treesYear} ต้น/ปี</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 flex-1">
            <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
              <div className="font-semibold text-sm mb-4">เปรียบเทียบต้นทุนค่าไฟฟ้า 25 ปี</div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-700">⚡ อยู่กับ PEA</span>
                    <span className="text-sm font-extrabold text-rose-600">{fmtTHB(totalWithoutSolar)}</span>
                  </div>
                  <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">ค่าไฟที่ต้องจ่ายทั้งหมด (ประมาณการ)</div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-700">☀️ ติดตั้ง {brand.name}</span>
                    <span className="text-sm font-extrabold text-orange-500">{fmtTHB(totalWithSolar)}</span>
                  </div>
                  <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(totalWithSolar / totalWithoutSolar * 100).toFixed(0)}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">รวมค่าอุปกรณ์ + ติดตั้ง + ค่าไฟส่วนที่เหลือ</div>
                </div>
              </div>
              <div className="mt-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold">คุณประหยัดได้ {fmtTHB(netSave)}</div>
                  <div className="text-xs opacity-80">หรือ {pn(Math.round(netSave / totalWithoutSolar * 100))}% ของค่าไฟ 25 ปี</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold">{fmtTHB(yearlySave)}</div>
                  <div className="text-[10px] uppercase opacity-80">ประหยัดต่อปี</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-gray-900 text-white rounded-2xl p-5 flex flex-col flex-1">
                <div className="font-semibold text-xs uppercase tracking-wider text-orange-400 mb-3">🌴 ทำไม {brand.name}</div>
                <div className="space-y-3">
                  {[
                    { icon: '✦', title: `แผง ${premium.brand || 'Jinko N-Type'}`, desc: `ผลิตไฟได้แม้ในวันเมฆมาก รับประกัน ${specSafely(premium, 'panel_warranty', '30')}` },
                    { icon: '✦', title: 'โครงสร้าง 6005-T5', desc: 'อลูมิเนียมเกรดสูง ทนไอเกลือกระบี่' },
                    { icon: '✦', title: 'บริการครบวงจร', desc: 'ยื่นขออนุญาต PEA จนถึงติดตั้ง ไม่ต้องทำเอง' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-orange-400 text-sm mt-0.5">{item.icon}</span>
                      <div>
                        <div className="font-semibold text-xs">{item.title}</div>
                        <div className="text-[10px] text-gray-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {data.location?.toLowerCase() === 'business' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="font-semibold text-xs text-amber-800">🏭 สำหรับธุรกิจ</div>
                  <div className="text-sm font-extrabold text-amber-700 mt-1">ลดภาษีนิติบุคคลสูงสุด 50%</div>
                  <div className="text-[10px] text-amber-600 mt-1">ผ่านสิทธิ BOI และค่าเสื่อมราคาเร่ง</div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <div className="font-semibold text-xs text-orange-500">🔒 สำหรับบ้าน</div>
                  <div className="text-sm font-extrabold text-gray-800 mt-1">ล็อกราคาค่าไฟ 25 ปี</div>
                  <div className="text-[10px] text-gray-500 mt-1">ไม่ต้องกังวลค่าไฟจะแพงขึ้นทุกปี</div>
                </div>
              )}
            </div>
          </div>
        </Page>

        {/* P3: PACKAGE SUMMARY */}
        <Page className="p-12 flex flex-col">
          <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-2 text-orange-500">03 / สรุปแพ็กเกจของคุณ</div>
              <h2 className="text-3xl font-extrabold">{selectedProduct.name}</h2>
            </div>
          </div>
          <div className="flex gap-8 flex-1">
            <div className="w-[220px] flex-shrink-0 flex flex-col gap-4">
              <div className="h-36 bg-gray-50 rounded-2xl overflow-hidden relative">
                <img src={getImg(selectedProduct)} className="object-cover w-full h-full" alt={selectedProduct.name} />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{selectedProduct.description || tierMeta.find(t => t.p === selectedProduct)?.desc || ''}</p>
              <div className="space-y-1.5">
                {(selectedProduct.system_warranty || selectedProduct.panel_product_warranty || selectedProduct.inverter_warranty || selectedProduct.panel_performance_warranty || selectedProduct.battery_warranty) && (
                  <div className="font-semibold text-[10px] text-gray-700 uppercase tracking-wide mb-1">🛡️ การรับประกัน</div>
                )}
                {selectedProduct.system_warranty && (
                  <div className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-xl px-3 py-2">
                    <span>🔧</span><span className="text-gray-600">ระบบ:</span><span className="font-medium text-gray-800">{specSafely(selectedProduct, 'system_warranty', '3 ปี')}</span>
                  </div>
                )}
                {selectedProduct.panel_product_warranty && (
                  <div className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-xl px-3 py-2">
                    <span>☀️</span><span className="text-gray-600">แผง (ผลิตภัณฑ์):</span><span className="font-medium text-gray-800">{specSafely(selectedProduct, 'panel_product_warranty', '12 ปี')}</span>
                  </div>
                )}
                {selectedProduct.panel_performance_warranty && (
                  <div className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-xl px-3 py-2">
                    <span>⚡</span><span className="text-gray-600">แผง (กำลังผลิต):</span><span className="font-medium text-gray-800">{specSafely(selectedProduct, 'panel_performance_warranty', '30 ปี')}</span>
                  </div>
                )}
                {selectedProduct.inverter_warranty && (
                  <div className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-xl px-3 py-2">
                    <span>🔧</span><span className="text-gray-600">อินเวอร์เตอร์:</span><span className="font-medium text-gray-800">{specSafely(selectedProduct, 'inverter_warranty', '5 ปี')}</span>
                  </div>
                )}
                {selectedProduct.battery_warranty && (
                  <div className="flex items-center gap-2 text-[11px] bg-gray-50 rounded-xl px-3 py-2">
                    <span>🔋</span><span className="text-gray-600">แบตเตอรี่:</span><span className="font-medium text-gray-800">{specSafely(selectedProduct, 'battery_warranty', '10 ปี')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {components.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <div className="font-semibold text-xs text-gray-800 mb-3">📦 อุปกรณ์ในชุด</div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-200">
                        <th className="text-left pb-2 font-medium w-[48px]">จำนวน</th>
                        <th className="text-left pb-2 font-medium">รายการ</th>
                        <th className="text-right pb-2 font-medium w-[120px]">ประกัน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((c, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-2 text-gray-500">×{c.qty || 1}</td>
                          <td className="py-2 font-medium text-gray-700">{c.item || '-'}</td>
                          <td className="py-2 text-right text-gray-500">{c.warranty || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {data.customFields && data.totalCost > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="font-semibold text-xs text-gray-800 mb-3">💰 สรุปค่าใช้จ่าย</div>
                  <div className="space-y-2 text-xs">
                    {data.customFields.basePrice > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">ราคาพื้นฐาน</span>
                        <span className="font-medium">{fmtTHB(data.customFields.basePrice)}</span>
                      </div>
                    )}
                    {data.customFields.manpower > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">ค่าติดตั้ง</span>
                        <span className="font-medium">{fmtTHB(data.customFields.manpower)}</span>
                      </div>
                    )}
                    {data.customFields.discountPercent > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">ส่วนลด {data.customFields.discountPercent}%</span>
                        <span className="font-medium text-orange-600">-{fmtTHB(Math.round(data.customFields.basePrice * data.customFields.discountPercent / 100))}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-800">รวมทั้งสิ้น</span>
                      <span className="font-extrabold text-orange-500">{fmtTHB(data.totalCost)}</span>
                    </div>
                  </div>
                </div>
              )}
              {(selectedProduct.included_services || []).length > 0 && (
                <div className="mt-auto bg-orange-50 rounded-2xl p-4">
                  <div className="font-semibold text-xs text-gray-800 mb-2">✅ บริการรวมในแพ็กเกจ</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProduct.included_services || []).map((s: string, si: number) => (
                      <span key={si} className="text-[10px] bg-white text-gray-600 px-2.5 py-1.5 rounded-full">{s.replace(/^ฟรี! /, '')}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Page>

        {/* P4: PRODUCT COMPARISON */}
        <Page className="p-12 flex flex-col">
          <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-2 text-orange-500">04 / เปรียบเทียบแพ็กเกจ</div>
              <h2 className="text-3xl font-extrabold">เลือกระบบที่ใช่สำหรับคุณ</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 flex-1">
            {tierMeta.map(({ p, badge, badgeBg, badgeText, label, desc, border }, i) => {
              const services = (p.included_services || []).slice(0, 3);
              return (
                <div key={i} className={`border rounded-2xl p-5 flex flex-col ${border}`}>
                  <div className="h-28 bg-gray-50 mb-3 rounded-xl overflow-hidden relative">
                    <img src={getImg(p)} className="object-cover w-full h-full" alt={p.name} />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`${badgeBg} ${badgeText} text-xs font-semibold px-3 py-1 rounded-full uppercase`}>{badge}</span>
                    <span className="text-xs text-orange-600 font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{fmtTHB(p.price_thb || 0)}</span>
                  </div>
                  <div className="font-semibold text-base leading-tight">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</div>
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">☀️</span>
                      <span className="font-medium text-gray-700">แผง:</span>
                      <span className="text-gray-500">{p.brand || 'Tier 1'} · {specSafely(p, 'panel_warranty', 'รับประกัน 12/30 ปี')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔧</span>
                      <span className="font-medium text-gray-700">อินเวอร์เตอร์:</span>
                      <span className="text-gray-500">{specSafely(p, 'inverter_model', p.model || 'Standard')} · {specSafely(p, 'inverter_warranty', 'รับประกัน 5 ปี')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">💰</span>
                      <span className="font-medium text-gray-700">ประหยัด:</span>
                      <span className="text-orange-500 font-semibold">{specSafely(p, 'monthly_savings', `~${pn(data.monthlySavings)} บาท/เดือน`)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">🛡️</span>
                      <span className="font-medium text-gray-700">ประกัน:</span>
                      <span className="text-gray-500">{specSafely(p, 'system_warranty', '3 ปี')} (ระบบ)</span>
                    </div>
                  </div>
                  {services.length > 0 && (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="font-semibold text-xs text-gray-800 mb-2 tracking-wide">✅ บริการรวม</div>
                      {services.map((s: string, si: number) => (
                        <div key={si} className="text-xs text-gray-600 flex items-start gap-1.5 mb-1">
                          <span className="text-orange-500 mt-0.5">✦</span>
                          {s.replace(/^ฟรี! /, '')}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="text-lg font-extrabold text-orange-500">{fmtTHB(p.price_thb || 0)}</div>
                    <div className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Page>

        {/* P5: SOFIN FINANCING */}
        {FEATURES.sofin && (
        <Page className="p-12 flex flex-col">
          <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-5">
            <div>
              <div className="font-semibold text-xs uppercase tracking-wider mb-2 text-orange-500">05 / สินเชื่อ Sofin Solar</div>
              <h2 className="text-3xl font-extrabold">เริ่มติดตั้งได้ทันที ด้วยเงินดาวน์เพียง 10%</h2>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-5 flex-1">
            <div className="col-span-3 flex flex-col gap-4">
              <div className="bg-slate-950 text-white rounded-2xl p-5">
                <div className="font-semibold text-[10px] uppercase tracking-wider text-orange-400 mb-3">กลไกคุ้มครองเงินทุน 10/90/85</div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 rounded-xl p-3 text-center min-w-[80px]">
                    <div className="text-xl font-extrabold text-orange-400">10%</div>
                    <div className="text-[8px] text-gray-400 uppercase mt-0.5">เงินดาวน์</div>
                  </div>
                  <div className="flex-1 h-px bg-gray-700" />
                  <div className="bg-orange-500/20 rounded-xl p-3 text-center min-w-[80px]">
                    <div className="text-xl font-extrabold text-orange-400">85%</div>
                    <div className="text-[8px] text-gray-400 uppercase mt-0.5">ค้ำด้วยสินทรัพย์</div>
                  </div>
                  <div className="flex-1 h-px bg-gray-700" />
                  <div className="bg-amber-500/10 rounded-xl p-3 text-center min-w-[80px]">
                    <div className="text-xl font-extrabold text-amber-400">5%</div>
                    <div className="text-[8px] text-gray-400 uppercase mt-0.5">เงินสำรอง</div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-gray-400 text-center">คุ้มครอง 90% ของเงินลงทุนด้วยแผงโซลาร์ Tier 1 ที่เป็นกรรมสิทธิ์ของคุณ</div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-5 flex-1">
                <div className="font-semibold text-xs mb-3">เปรียบเทียบรายจ่าย 25 ปี</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <span className="text-xs text-gray-700">อยู่กับ PEA (ไม่มีโซลาร์)</span>
                    </div>
                    <span className="text-sm font-extrabold text-rose-600">{fmtTHB(totalPEA25yr)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">☀️</span>
                      <span className="text-xs text-gray-700">Sofin + โซลาร์</span>
                    </div>
                    <span className="text-sm font-extrabold text-orange-500">{fmtTHB(totalInstallmentViaPEA)}</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      <span className="text-xs font-semibold text-gray-800">ประหยัดรวม</span>
                    </div>
                    <span className="text-base font-extrabold text-orange-500">{fmtTHB(totalSaved)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-2xl p-6 text-center">
                <div className="text-[10px] uppercase tracking-widest opacity-80 mb-2">ข้อเสนอพิเศษของคุณ</div>
                <div className="text-4xl font-extrabold mb-1">{fmtTHB(downPayment)}</div>
                <div className="text-xs opacity-80">ดาวน์เริ่มต้นเพียง 10%</div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-sm font-extrabold">{fmtTHB(monthly36)}</div>
                    <div className="text-[8px] opacity-70">36 เดือน</div>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 ring-1 ring-orange-300">
                    <div className="text-sm font-extrabold">{fmtTHB(monthly60)}</div>
                    <div className="text-[8px] opacity-70">60 เดือน</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <div className="text-sm font-extrabold">{fmtTHB(monthly48)}</div>
                    <div className="text-[8px] opacity-70">48 เดือน</div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] opacity-70">เลือกผ่อนได้ตามสบาย — เริ่มประหยัดค่าไฟตั้งแต่วันแรก</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="font-semibold text-xs mb-3">สิทธิพิเศษสำหรับคุณ</div>
                <div className="space-y-2">
                  {[
                    `ไม่ต้องใช้เงินก้อนใหญ่ — ผ่อนเริ่ม ${fmtTHB(monthly48)}/เดือน`,
                    'อนุมัติไว — ภายใน 3-5 วันทำการ',
                    'ฟรีค่าสำรวจหน้างาน + ยื่นขออนุญาต PEA',
                    'คุ้มครอง 90% — แผง Tier 1 ค้ำประกัน',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px]">✓</span>
                      <span className="text-[10px] text-gray-600">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                <div className="flex-shrink-0">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${contact.lineUrl}`} width={96} height={96} className="w-24 h-24" alt="QR" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-gray-800">สนใจใช่ไหม?</div>
                  <div className="text-[10px] text-gray-500 mt-1">สแกน QR เพื่อรับคำปรึกษาฟรี<br />หรือ LINE: {contact.lineId}</div>
                </div>
              </div>
            </div>
          </div>
        </Page>
        )}
      </body>
    </html>
  );
}

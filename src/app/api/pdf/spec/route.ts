import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PDFGenerator } from '@/lib/pdf/generator';
import { address, brand, contact, siteUrl } from '@/lib/site.config';

export const dynamic = 'force-dynamic';

function esc(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from('solar_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Basic Spec Sheet HTML Template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: sans-serif; color: #1e293b; }
          </style>
        </head>
        <body class="bg-white p-10">
          <div class="flex justify-between items-start mb-10 border-b pb-6">
            <div>
              <h1 class="text-3xl font-extrabold text-orange-600">${esc(brand.name)}</h1>
              <p class="text-sm text-slate-500 font-bold uppercase tracking-widest">Solar Data Sheet</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold">${esc(product.name)}</p>
              <p class="text-sm text-slate-400">ID: ${esc(product.id)}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-10 mb-10">
            <div>
              <h2 class="text-xl font-bold mb-4 border-l-4 border-orange-500 pl-3">คุณสมบัติเด่น</h2>
              <p class="text-slate-600 leading-relaxed">${esc(product.description) || 'ไม่มีข้อมูลรายละเอียดในขณะนี้'}</p>
              
              <div class="mt-6 space-y-2">
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">ประเภทระบบ</span>
                  <span class="font-bold">${product.type === 'system' ? 'Solar System' : 'Equipment'}</span>
                </div>
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">กำลังผลิต</span>
                  <span class="font-bold text-orange-600">${esc(product.power_kw)} kW</span>
                </div>
                <div class="flex justify-between border-b pb-1">
                  <span class="text-slate-500">ยี่ห้อแผง</span>
                  <span class="font-bold">${esc(product.brand) || '—'}</span>
                </div>
              </div>
            </div>
            <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-center">
               ${product.image_url ? `<img src="${esc(product.image_url.startsWith('http') ? product.image_url : siteUrl + product.image_url)}" class="max-h-64 object-contain" />` : '<div class="text-slate-300 text-6xl">☀️</div>'}
            </div>
          </div>

          <div class="mb-10">
            <h2 class="text-xl font-bold mb-4 border-l-4 border-orange-500 pl-3">รายละเอียดทางเทคนิค</h2>
            <div class="bg-white border rounded-xl overflow-hidden">
              <table class="w-full text-sm">
                <tr class="bg-slate-50">
                  <th class="px-4 py-3 text-left border-b">รายการ</th>
                  <th class="px-4 py-3 text-left border-b">รายละเอียด</th>
                </tr>
                ${Object.entries(product.specifications || {}).map(([key, val]) => `
                  <tr>
                    <td class="px-4 py-2 border-b text-slate-500 capitalize">${esc(key.replace(/_/g, ' '))}</td>
                    <td class="px-4 py-2 border-b font-medium">${esc(val)}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          </div>

          <div class="mt-20 pt-10 border-t flex justify-between items-end">
            <div class="text-[10px] text-slate-400">
              <p>${esc(brand.legalName)} Co., Ltd.</p>
              <p>88/8 ${esc(address.city)}, Thailand</p>
              <p>${esc(siteUrl.replace(/^https?:\/\//, ''))}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-orange-600 mb-1">สนใจแพ็กเกจนี้?</p>
              <p class="text-[10px] text-slate-400">ติดต่อสอบถามข้อมูลเพิ่มเติมที่ LINE: ${contact.lineId}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const pdfBuffer = await PDFGenerator.generateProposal(html);

    if (!pdfBuffer) {
      return NextResponse.json({ error: 'PDF service temporarily unavailable' }, { status: 503 });
    }

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="TAWANPOWER_Spec_${(product.name || 'Product').replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('[Spec PDF] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

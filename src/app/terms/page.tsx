import type { Metadata } from 'next';
import Link from 'next/link';
import { getSite } from '@/lib/site-server';
import { missingLegalFields } from '@/lib/legal';

// Same rule as /privacy: a document naming an entity that does not exist yet is a draft, and a draft is
// not indexed. Both pages read one function, so they cannot end up in different states.
export function generateMetadata(): Metadata {
  const { brand } = getSite();
  const ready = missingLegalFields(brand.legal).length === 0;
  return {
    title: `ข้อกำหนดการใช้เว็บไซต์ · Terms of use — ${brand.name}`,
    description: `ข้อกำหนดการใช้เว็บไซต์ ${brand.name} — ราคาบนเว็บไซต์เป็นการประเมิน ไม่ใช่ข้อเสนอผูกพัน`,
    robots: ready ? undefined : 'noindex, nofollow',
  };
}

// ponytail: same shape as /privacy — Thai authoritative, English mirror, the other
// 6 UI locales are not served this document. See the note in src/app/privacy/page.tsx.
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="pt-32 pb-24 px-6">
        <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto prose-headings:font-black prose-headings:tracking-tight prose-a:text-orange-600 dark:prose-a:text-orange-400">
          <p className="not-prose text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-3">
            Terms of use
          </p>

          <section lang="th">
            <h1>ข้อกำหนดการใช้เว็บไซต์</h1>

            <h2>1. ลักษณะของเว็บไซต์</h2>
            <p>
              เว็บไซต์นี้จัดทำขึ้นเพื่อให้ข้อมูลเกี่ยวกับระบบโซลาร์และรับคำขอประเมินจากลูกค้าในจังหวัดกระบี่
              และพื้นที่ใกล้เคียง เนื้อหาทั้งหมดเป็นข้อมูลทั่วไป ไม่ถือเป็นคำแนะนำทางวิศวกรรมสำหรับหน้างานใดหน้างานหนึ่ง
            </p>

            <h2>2. ราคาและการประมาณการ</h2>
            <p>
              ราคา ค่าไฟที่ประหยัดได้ และระยะคืนทุนที่แสดงบนเว็บไซต์หรือในแชทเป็น{' '}
              <strong>การประเมินเบื้องต้นจากข้อมูลที่คุณให้ไว้ ไม่ใช่ข้อเสนอที่ผูกพันตามกฎหมาย</strong>
              ราคาสุดท้ายและขนาดระบบจะยืนยันเป็นลายลักษณ์อักษรหลังการสำรวจหน้างานเท่านั้น
              ผลการประหยัดจริงขึ้นอยู่กับพฤติกรรมการใช้ไฟ ทิศทางหลังคา ร่มเงาและสภาพอากาศ
            </p>

            <h2>3. การนัดสำรวจและการติดตั้ง</h2>
            <p>
              การกดส่งแบบฟอร์มเป็นการขอให้เราติดต่อกลับ ไม่ใช่การสั่งซื้อ
              เงื่อนไขการติดตั้ง การชำระเงิน การรับประกัน และการส่งมอบ เป็นไปตามสัญญาติดตั้งและใบรับประกันที่ลงนามกันเป็นรายโครงการ
            </p>

            <h2>4. ข้อมูลจากช่างและการรับประกัน</h2>
            <p>
              ระยะเวลาการรับประกัน ขอบเขตงาน และการบริการหลังการขาย ระบุไว้ในใบรับประกันที่แนบท้ายสัญญาแต่ละโครงการ
              ซึ่งเป็นเอกสารที่มีผลเหนือข้อความทั่วไปบนเว็บไซต์
            </p>

            <h2>5. การใช้งานที่ไม่อนุญาต</h2>
            <ul>
              <li>ส่งข้อมูลเท็จ ข้อมูลของผู้อื่นโดยไม่ได้รับอนุญาต หรือสแปมผ่านแบบฟอร์มหรือแชท</li>
              <li>พยายามเข้าถึงส่วนที่ไม่เปิดให้ใช้งาน หรือรบกวนการทำงานของระบบ</li>
              <li>คัดลอกเนื้อหา รูปภาพ หรือแบบระบบไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร</li>
            </ul>

            <h2>6. ทรัพย์สินทางปัญญา</h2>
            <p>
              ข้อความ รูปถ่ายแบบติดตั้ง และเครื่องหมายการค้าบนเว็บไซต์นี้เป็นของเรา
              หรือใช้โดยได้รับอนุญาตจากเจ้าของ (เช่น เครื่องหมายของ Huawei, SigenStor, GoodWe)
              ห้ามนำไปใช้ต่อโดยไม่ได้รับอนุญาต
            </p>

            <h2>7. ลิงก์ภายนอก</h2>
            <p>
              ลิงก์ไปยัง LINE หรือเว็บไซต์ของผู้ผลิตเป็นบริการอำนวยความสะดวก
              เราไม่รับผิดชอบต่อเนื้อหาหรือความปลอดภัยของเว็บไซต์เหล่านั้น
            </p>

            <h2>8. การจำกัดความรับผิด</h2>
            <p>
              เราให้บริการเว็บไซต์นี้ &ldquo;ตามสภาพ&rdquo; และพยายามให้ข้อมูลถูกต้องที่สุดเท่าที่ทำได้
              แต่ไม่รับประกันว่าข้อมูลจะครบถ้วนหรือไม่มีข้อผิดพลาด
              ความรับผิดของเราไม่เกินขอบเขตที่กฎหมายไทยกำหนด
            </p>

            <h2>9. กฎหมายที่ใช้บังคับ</h2>
            <p>ข้อกำหนดนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย และอยู่ในเขตอำนาจของศาลไทย</p>

            <h2>10. การแก้ไขข้อกำหนด</h2>
            <p>
              เราอาจปรับปรุงข้อกำหนดนี้ได้ โดยจะแก้ไขวันที่ด้านล่าง
              การใช้งานเว็บไซต์ต่อหลังการแก้ไขถือว่าคุณยอมรับข้อกำหนดฉบับใหม่
            </p>

            <p>
              วันที่มีผล: <time dateTime="2026-10-20">20 ตุลาคม 2569</time> (เวอร์ชัน 1.0)
            </p>
          </section>

          <hr />

          <section lang="en">
            <h1>Terms of use</h1>

            <h2>1. What this site is</h2>
            <p>
              This site provides information about solar systems and collects assessment requests from
              customers in Krabi and nearby provinces. Everything here is general information, not
              engineering advice for any specific roof.
            </p>

            <h2>2. Prices and estimates</h2>
            <p>
              Prices, savings and payback figures shown on the site or in chat are{' '}
              <strong>preliminary estimates based on what you told us, not a binding offer</strong>.
              Final price and system size are confirmed in writing after a site survey only. Real
              savings depend on how you use power, roof orientation, shading and weather.
            </p>

            <h2>3. Surveys and installations</h2>
            <p>
              Submitting the form asks us to call you back; it is not an order. Installation, payment,
              warranty and handover terms come from the installation contract and warranty card signed
              per project.
            </p>

            <h2>4. Warranty</h2>
            <p>
              Warranty periods, scope of work and after-sales service are those in the warranty card
              attached to each project contract, which overrides general statements on this site.
            </p>

            <h2>5. Unacceptable use</h2>
            <ul>
              <li>Sending false data, someone else&rsquo;s data without permission, or spam through the form or chat</li>
              <li>Attempting to reach non-public parts of the service or disrupt it</li>
              <li>Copying text, photos or system designs for commercial use without written permission</li>
            </ul>

            <h2>6. Intellectual property</h2>
            <p>
              The text, installation photos and marks on this site are ours or used with the owner&rsquo;s
              permission (e.g. Huawei, SigenStor, GoodWe marks). Do not reuse them without permission.
            </p>

            <h2>7. External links</h2>
            <p>
              Links to LINE or manufacturer sites are a convenience. We are not responsible for their
              content or security.
            </p>

            <h2>8. Limitation of liability</h2>
            <p>
              The site is provided &ldquo;as is&rdquo;. We try to keep the information accurate but do not
              warrant it is complete or error-free, and our liability is limited to the extent Thai law
              allows.
            </p>

            <h2>9. Governing law</h2>
            <p>These terms are governed by the laws of the Kingdom of Thailand, under Thai courts.</p>

            <h2>10. Changes</h2>
            <p>
              We may update these terms; the date below changes with them. Continuing to use the site
              after a change means you accept the new version.
            </p>

            <p>
              Effective: <time dateTime="2026-10-20">20 October 2026</time> (version 1.0)
            </p>
          </section>

          <p className="not-prose mt-10 text-sm">
            <Link href="/privacy" className="font-bold text-orange-600 dark:text-orange-400">
              นโยบายความเป็นส่วนตัว / Privacy policy →
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}

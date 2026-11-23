import type { Metadata } from 'next';
import Link from 'next/link';
import { getSite } from '@/lib/site-server';
import { missingLegalFields } from '@/lib/legal';

// A draft must not be indexed: the policy names a controller that does not exist yet. `legal.ts` decides
// this from the values themselves, so the tag flips the day the owner fills them in — per site, because
// each storefront names its own entity.
export function generateMetadata(): Metadata {
  const { brand } = getSite();
  const ready = missingLegalFields(brand.legal).length === 0;
  return {
    title: `นโยบายความเป็นส่วนตัว (PDPA) · Privacy policy — ${brand.name}`,
    description: `นโยบายคุ้มครองข้อมูลส่วนบุคคลของ ${brand.name} ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) — Personal data protection notice.`,
    robots: ready ? undefined : 'noindex, nofollow',
  };
}

function DraftNotice({ missing }: { missing: string[] }) {
  if (missing.length === 0) return null;
  return (
    <div
      role="note"
      className="not-prose mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <p className="font-bold">ฉบับร่าง · Draft</p>
      <p className="mt-1">
        เอกสารนี้ยังไม่สมบูรณ์: ยังขาด {missing.join(' · ')} — therefore it is not indexed and
        is not in the sitemap until those are filled in.
      </p>
    </div>
  );
}

// ponytail: the document is Thai + English on purpose — Thai is the authoritative
// text for a Thai consumer, English is the courtesy mirror — so it is NOT localised
// into the other 6 UI locales. Revisit only if a market outside TH/EN asks for it.
export default function PrivacyPage() {
  const { brand, contact } = getSite();
  const legal = brand.legal;
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="pt-32 pb-24 px-6">
        <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto prose-headings:font-black prose-headings:tracking-tight prose-a:text-orange-600 dark:prose-a:text-orange-400">
          <p className="not-prose text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-3">
            PDPA · พ.ศ. 2562
          </p>

          <DraftNotice missing={missingLegalFields(legal)} />

          <section lang="th">
            <h1>นโยบายความเป็นส่วนตัว</h1>
            <p>
              {brand.nameTh} ({brand.name}) ให้ความสำคัญกับข้อมูลส่วนบุคคลของคุณ
              นโยบายฉบับนี้อธิบายว่าเราเก็บ ใช้ และเปิดเผยข้อมูลอะไรบ้าง เมื่อคุณกรอกแบบฟอร์ม
              สอบถามผ่านแชท หรือคุยกับทีมงานของเรา โดยสอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
            </p>

            <h2>1. ผู้ควบคุมข้อมูลส่วนบุคคล</h2>
            {/* ponytail: legal entity name and tax ID are placeholders — the owner's to fill.
                The address is his, given 2026-10-20. Thai is kept verbatim in the English
                section too: a transliterated Thai address is an error waiting to happen. */}
            <ul>
              <li>ชื่อ: {legal.entityName || `${brand.nameTh} (${brand.name})`}</li>
              <li>
                เลขทะเบียนนิติบุคคล / เลขประจำตัวผู้เสียภาษี: {legal.taxId || '๐-๐๐๐๐๐-๐๐๐๐๐-๐๐-๐ (รอระบุ)'}
              </li>
              <li>
                ที่อยู่: {legal.address || '322/1 เอวีกระบี่ ถ.อุตรกิจ ปากน้ำ จังหวัดกระบี่ ประเทศไทย'}
              </li>
              <li>
                ช่องทางติดต่อ: LINE <span lang="en">{contact.lineId}</span> · โทร. <span lang="en">{contact.phone}</span>
              </li>
            </ul>

            <h2>2. ข้อมูลที่เราเก็บ</h2>
            <ul>
              <li>ชื่อที่คุณให้ไว้ในแบบฟอร์ม</li>
              <li>เบอร์โทรศัพท์ และ/หรือ LINE ID (และชื่อที่แสดงบน LINE หากคุณเข้าสู่ระบบด้วย LINE)</li>
              <li>พื้นที่ติดตั้งที่คุณเลือกหรือระบุ</li>
              <li>ข้อมูลที่คุณพิมพ์ในแชท เช่น ขนาดระบบ ค่าไฟ หรืองบประมาณที่สนใจ</li>
            </ul>
            <p>เราไม่เก็บข้อมูลอ่อนไหวตามมาตรา 26 และไม่เก็บข้อมูลบัตรชำระเงินบนเว็บไซต์นี้</p>

            <h2>3. วัตถุประสงค์ในการใช้ข้อมูล</h2>
            <ul>
              <li>ประเมินระบบเบื้องต้นและจัดทำข้อเสนอให้คุณ</li>
              <li>โทรกลับและนัดหมายเข้าสำรวจหน้างาน</li>
              <li>ให้บริการหลังการขายและติดตามผลการติดตั้ง</li>
            </ul>

            <h2>4. ฐานทางกฎหมาย</h2>
            <p>
              เราใช้ข้อมูลของคุณโดยอาศัย <strong>ความยินยอม</strong> (มาตรา 19) ซึ่งคุณให้โดยการติ๊กยินยอมในแบบฟอร์ม
              ก่อนกดส่ง และอาศัย <strong>ประโยชน์โดยชอบด้วยกฎหมาย</strong> (มาตรา 24(5)) สำหรับการติดต่อกลับ
              ในกรณีที่คุณเป็นผู้ติดต่อเราก่อน คุณถอนความยินยอมได้ทุกเมื่อ (ดูข้อ 8)
            </p>

            <h2>5. ผู้ที่อาจได้รับข้อมูล</h2>
            <p>
              เราไม่ขายหรือให้เช่าข้อมูลของคุณ ข้อมูลอาจถูกประมวลผลโดยผู้ให้บริการที่จำเป็นต่อการทำงานของระบบ ได้แก่
              ผู้ให้บริการฐานข้อมูล (Supabase), ผู้ให้บริการโฮสติ้งเว็บไซต์ (Vercel), แพลตฟอร์ม LINE
              (เพื่อแจ้งเตือนทีมงานเมื่อมีคำขอใหม่) และทีมช่างติดตั้งตามพื้นที่ของคุณ
              ซึ่งผูกพันตามสัญญาและเข้าถึงข้อมูลเท่าที่จำเป็น
            </p>

            <h2>6. ระยะเวลาจัดเก็บ</h2>
            <p>
              เราเก็บข้อมูลคำขอไว้ไม่เกิน <strong>24 เดือน</strong> นับจากการติดต่อครั้งสุดท้าย
              เว้นแต่คุณเป็นลูกค้าที่มีสัญญาติดตั้ง ซึ่งต้องเก็บตามอายุการรับประกันและกำหนดเวลาตามกฎหมาย
              เมื่อครบกำหนดเราจะลบหรือทำให้เป็นข้อมูลนิรนาม
            </p>

            <h2>7. สิทธิของเจ้าของข้อมูล</h2>
            <p>
              คุณมีสิทธิ์ขอเข้าถึงและรับสำเนาข้อมูล ขอแก้ไขให้ถูกต้อง ขอลบหรือทำให้นิรนาม
              ขอระงับการใช้ คัดค้านการประมวลผล ขอย้ายข้อมูล และขอถอนความยินยอมได้ตลอดเวลา
              การถอนความยินยอมไม่กระทบการประมวลผลที่ทำไปแล้วโดยชอบด้วยกฎหมาย
            </p>

            <h2>8. การใช้สิทธิและการร้องเรียน</h2>
            <p>
              ติดต่อทีมงานได้ที่ LINE <span lang="en">{contact.lineId}</span> หรือโทร.{' '}
              <span lang="en">{contact.phone}</span> เราจะดำเนินการภายใน 30 วัน
              หากไม่ได้รับคำตอบที่พอใจ คุณมีสิทธิ์ร้องเรียนต่อสำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (สคส.)
            </p>

            <h2>9. คุกกี้ และที่จัดเก็บในเบราว์เซอร์</h2>
            <p>
              เราไม่มีคุกกี้โฆษณาหรือคุกกี้ติดตาม third-party บนเว็บไซต์นี้
              เราใช้ที่จัดเก็บในเบราว์เซอร์ของคุณเพื่อจดจำการปิดแบนเนอร์คุกกี้ ธีมสว่าง/มืด
              และภาษาที่คุณเลือกเท่านั้น หากปิดใช้งาน หน้าเว็บยังใช้งานได้ตามปกติ
            </p>

            <h2>10. วันที่มีผล</h2>
            <p>
              นโยบายฉบับนี้มีผลตั้งแต่ <time dateTime="2026-10-20">20 ตุลาคม 2569</time> (เวอร์ชัน 1.0)
              หากมีการแก้ไข เราจะปรับปรุงวันที่ด้านบนและประกาศบนหน้านี้
            </p>
          </section>

          <hr />

          <section lang="en">
            <h1>Privacy policy</h1>
            <p>
              {brand.name} respects your personal data. This notice explains what we collect,
              why, and with whom we share it when you use our contact form, chat with our assistant, or
              talk to our team. It follows Thailand&rsquo;s Personal Data Protection Act B.E. 2562 (PDPA).
            </p>

            <h2>1. Data controller</h2>
            <ul>
              <li>Name: {legal.entityName || `${brand.legalName} (Krabi, Thailand)`}</li>
              <li>Company registration / Tax ID: 0-0000-00000-00-0 (to be completed)</li>
              <li>Address: 322/1 เอวีกระบี่ ถ.อุตรกิจ ปากน้ำ จังหวัดกระบี่ ประเทศไทย</li>
              <li>
                Contact: LINE <span lang="en">{contact.lineId}</span> · phone <span lang="en">{contact.phone}</span>
              </li>
            </ul>

            <h2>2. What we collect</h2>
            <ul>
              <li>The name you type into the form</li>
              <li>Your phone number and/or LINE ID (plus your LINE display name if you sign in with LINE)</li>
              <li>The installation area you choose or type</li>
              <li>What you type in the chat: system size, electricity bill, budget range</li>
            </ul>
            <p>We do not collect sensitive data under section 26, and no card details are taken on this site.</p>

            <h2>3. Why we use it</h2>
            <ul>
              <li>To size a system and prepare an offer for you</li>
              <li>To call you back and book a site survey</li>
              <li>After-sales service and installation follow-up</li>
            </ul>

            <h2>4. Legal basis</h2>
            <p>
              We rely on your <strong>consent</strong> (section 19), given when you tick the box before
              submitting the form, and on our <strong>legitimate interest</strong> (section 24(5)) in
              calling you back when you contacted us first. You may withdraw consent at any time (see 8).
            </p>

            <h2>5. Who may receive it</h2>
            <p>
              We never sell or rent your data. It may be processed by the providers the service needs:
              our database (Supabase), our web host (Vercel), the LINE platform (to notify the team of a
              new request), and the installation team for your area. Each is bound to use it only as
              needed for that purpose.
            </p>

            <h2>6. How long we keep it</h2>
            <p>
              Contact requests are kept for up to <strong>24 months</strong> from your last contact,
              unless you are a customer with an installation contract, which is kept for the warranty
              term and any legally required period. Then we delete or anonymise it.
            </p>

            <h2>7. Your rights</h2>
            <p>
              You may access and obtain a copy, correct it, erase or anonymise it, restrict or object to
              processing, request portability, and withdraw consent at any time. Withdrawal does not
              affect processing already lawfully carried out.
            </p>

            <h2>8. Exercising your rights and complaints</h2>
            <p>
              Contact us on LINE <span lang="en">{contact.lineId}</span> or by phone at{' '}
              <span lang="en">{contact.phone}</span>. We answer within 30 days. If you are not satisfied,
              you may complain to the Personal Data Protection Committee of Thailand (PDPC).
            </p>

            <h2>9. Cookies and browser storage</h2>
            <p>
              There is no advertising or third-party tracking cookie on this site. We use your
              browser&rsquo;s own storage only to remember that you dismissed the cookie notice, your
              light/dark theme, and your chosen language. The site still works with it disabled.
            </p>

            <h2>10. Effective date</h2>
            <p>
              Effective <time dateTime="2026-10-20">20 October 2026</time> (version 1.0). If it changes,
              the date above changes too.
            </p>
          </section>

          <p className="not-prose mt-10 text-sm">
            <Link href="/terms" className="font-bold text-orange-600 dark:text-orange-400">
              ข้อกำหนดการใช้เว็บไซต์ / Terms of use →
            </Link>
          </p>
        </article>
      </div>
    </div>
  );
}

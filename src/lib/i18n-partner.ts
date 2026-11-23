'use client';

import { useCallback, useEffect, useState } from 'react';

export type PartnerLang = 'th' | 'en';

const STRINGS = {
  th: {
    dashboard: 'แดชบอร์ดพาร์ทเนอร์',
    my_leads: 'ลีดของฉัน',
    referrals: 'ผู้แนะนำ',
    overview: 'ภาพรวม',
    expected: 'ค่าคอมมิชชั่นที่คาดหวัง',
    paid: 'จ่ายแล้ว',
    pending_count: 'รอดำเนินการ',
    invite_link: 'ลิงก์เชิญของฉัน',
    copy: 'คัดลอก',
    copied: 'คัดลอกแล้ว!',
    move_to: 'ย้ายไป',
    no_leads: 'ยังไม่มีลีดในขั้นตอนนี้',
    invite_customer: 'เชิญลูกค้า',
    name: 'ชื่อ',
    phone: 'โทรศัพท์',
    send_invite: 'ส่งคำเชิญ',
    status: 'สถานะ',
    reward: 'รางวัล',
    paid_mark: 'จ่ายแล้ว',
    back_home: '← หน้าแรกพาร์ทเนอร์',
    loading: 'กำลังโหลด...',
    thb: '฿',
    col_referred: 'มาใหม่',
    col_qualified: 'ผ่านคัดเลือก',
    col_surveyed: 'สำรวจแล้ว',
    col_closed: 'ปิดการขาย',
    col_lost: 'หลุด',
  },
  en: {
    dashboard: 'Partner Dashboard',
    my_leads: 'My Leads',
    referrals: 'Referrals',
    overview: 'Overview',
    expected: 'Expected commission',
    paid: 'Paid',
    pending_count: 'Pending',
    invite_link: 'My invite link',
    copy: 'Copy',
    copied: 'Copied!',
    move_to: 'Move to',
    no_leads: 'No leads in this stage',
    invite_customer: 'Invite customer',
    name: 'Name',
    phone: 'Phone',
    send_invite: 'Send invite',
    status: 'Status',
    reward: 'Reward',
    paid_mark: 'Paid',
    back_home: '← Partner home',
    loading: 'Loading...',
    thb: 'THB ',
    col_referred: 'New',
    col_qualified: 'Qualified',
    col_surveyed: 'Surveyed',
    col_closed: 'Closed',
    col_lost: 'Lost',
  },
} as const;

export type PartnerStrings = (typeof STRINGS)['th'];

const KEY = 'sb_partner_lang';

export function usePartnerLang() {
  const [lang, setLangState] = useState<PartnerLang>('th');
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === 'en' || saved === 'th') setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);
  const setLang = useCallback((l: PartnerLang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  return { lang, setLang, t: STRINGS[lang] as PartnerStrings };
}

export const PARTNER_FLOW = ['referred', 'qualified', 'surveyed', 'closed', 'lost'] as const;

const VIEW_KEY = 'sb_partner_view_code';

export function getViewCode(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    const v = window.localStorage.getItem(VIEW_KEY);
    return v && /^[a-z0-9-]{2,40}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

export function setViewCode(code: string | null) {
  try {
    if (typeof window === 'undefined') return;
    if (code) window.localStorage.setItem(VIEW_KEY, code);
    else window.localStorage.removeItem(VIEW_KEY);
  } catch {
    /* ignore */
  }
}

export function flowLabel(t: PartnerStrings, status: string): string {
  switch (status) {
    case 'referred':
      return t.col_referred;
    case 'qualified':
      return t.col_qualified;
    case 'surveyed':
      return t.col_surveyed;
    case 'closed':
      return t.col_closed;
    case 'lost':
      return t.col_lost;
    default:
      return status;
  }
}

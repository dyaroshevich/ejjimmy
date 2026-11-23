/**
 * Lead sources write their own status dialect — `New (Web)`, `New (AI)`, `New (LINE)`, plain
 * English stages, and the Thai names the tracker writes back. The tracker and the list both
 * need the same answer, so the mapping lives here once.
 */
export const STATUS_STAGES = ['ใหม่', 'ติดต่อแล้ว', 'ส่งใบเสนอราคาแล้ว', 'เซ็นสัญญาแล้ว', 'ติดตั้งแล้ว'] as const;

export function normalizeStatus(status?: string | null): string {
  if (!status) return 'ใหม่';
  const s = status.trim();
  if (s === 'ใหม่' || s.startsWith('New') || s === 'Qualified' || s === 'Interested') return 'ใหม่';
  if (s === 'ติดต่อแล้ว' || s === 'Contacted') return 'ติดต่อแล้ว';
  if (s === 'ส่งใบเสนอราคาแล้ว' || s === 'Proposal Sent') return 'ส่งใบเสนอราคาแล้ว';
  if (s === 'เซ็นสัญญาแล้ว') return 'เซ็นสัญญาแล้ว';
  if (s === 'ติดตั้งแล้ว' || s === 'Won' || s === 'Closed Won') return 'ติดตั้งแล้ว';
  if (s === 'ยกเลิก' || s === 'Lost' || s === 'Closed Lost') return 'ยกเลิก';
  return s;
}

export function getActiveStageIndex(status?: string | null): number {
  return (STATUS_STAGES as readonly string[]).indexOf(normalizeStatus(status));
}

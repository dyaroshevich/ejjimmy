// Single entry point for brand data inside Remotion compositions.
// Reads brand.json so a rebrand does not require edits in src/video/**.
import brand from '../../brand.json';

export interface VideoBrand {
  name: string;
  nameTh: string;
  domain: string;
  lineHandle: string;
  tagline: string;
  location: string;
  brandLabel: string;
  watermark: string;
  frame: { width: number; height: number; fps: number };
}

const v = (brand as any).video ?? {};

export const videoBrand: VideoBrand = {
  name: v.name ?? brand.brand?.name ?? '',
  nameTh: v.nameTh ?? brand.brand?.nameTh ?? '',
  domain: v.domain ?? '',
  lineHandle: v.lineHandle ?? '',
  tagline: v.tagline ?? brand.brand?.subTh ?? '',
  location: v.location ?? `${brand.brand?.city ?? ''}, ${brand.brand?.country ?? ''}`.trim(),
  brandLabel: v.brandLabel ?? '',
  watermark: v.watermark ?? '',
  frame: v.frame ?? { width: 1080, height: 1920, fps: 30 },
};

export default videoBrand;

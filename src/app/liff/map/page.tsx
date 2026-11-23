import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { brand } from '@/lib/site.config';

export const metadata: Metadata = {
  title: `แผนที่โครงการติดตั้ง | ${brand.nameTh}`,
  description: `ดูตัวอย่างโครงการติดตั้งโซลาร์เซลล์ของ ${brand.nameTh} ทั่วจังหวัดกระบี่และพังงา`,
  openGraph: {
    title: `แผนที่โครงการติดตั้ง — ${brand.nameTh}`,
    description: `ดูตัวอย่างโครงการติดตั้งโซลาร์เซลล์ของ ${brand.nameTh} ทั่วจังหวัดกระบี่และพังงา`,
    images: ['/og-image.png'],
  }
};

// Map must be client-side only due to Leaflet
const MapComponent = dynamic(
  () => import('./MapContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center animate-pulse">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Project Map...</p>
      </div>
    )
  }
);

export default function TawanMap() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="p-4 bg-orange-600 text-white font-black uppercase tracking-widest text-center z-[1000] text-xs">
        {brand.nameTh} — แผนที่โครงการติดตั้ง
      </div>
      <div className="flex-1 relative">
        <MapComponent />
      </div>
    </div>
  );
}

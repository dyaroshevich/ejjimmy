'use client';

import dynamic from 'next/dynamic';
import { Map as MapIcon } from 'lucide-react';

const CaseLocationMap = dynamic(
  () => import('../../app/liff/map/MapContent'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
        <MapIcon className="text-slate-300" size={48} />
      </div>
    )
  }
);

interface CaseMapProps {
  lat: number;
  lng: number;
  locationName: string;
}

export default function CaseMap({ lat, lng, locationName }: CaseMapProps) {
  return (
    <div className="rounded-[3.5rem] overflow-hidden border border-slate-100 dark:border-white/5 h-[400px] shadow-2xl relative">
      <CaseLocationMap />
      {lat && lng && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 text-left">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">พิกัดโครงการ</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{lat}, {lng}</p>
        </div>
      )}
    </div>
  );
}

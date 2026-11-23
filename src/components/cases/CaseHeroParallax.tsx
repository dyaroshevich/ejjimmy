'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Zap, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CaseHeroParallaxProps {
  coverUrl: string;
  customerName: string;
  locationName: string;
  systemKw: number;
}

export default function CaseHeroParallax({ coverUrl, customerName, locationName, systemKw }: CaseHeroParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section ref={ref} className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden bg-slate-950 pt-20">
      {/* Parallax Image Layer */}
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0 w-full h-[120%] -top-[10%]">
        <Image
          src={coverUrl}
          alt={customerName}
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
        />
      </motion.div>
      <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

      {/* Content */}
      <motion.div style={{ y: contentY }} className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
        <div className="max-w-5xl space-y-6 md:space-y-8">
          <Badge className="bg-orange-600/30 text-orange-400 border border-orange-500/30 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-xl">
            การติดตั้งที่ผ่านการรับรอง
          </Badge>
          <h1 lang="th" className="text-4xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[1.1] text-balance">
            {customerName}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-6 text-slate-300 font-black uppercase tracking-[0.2em] text-[10px] pt-2">
            <div lang="th" className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <MapPin size={14} className="text-orange-500" /> {locationName}
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <Zap size={14} className="text-amber-400" /> ระบบ {systemKw} kW
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20"
      >
        <ChevronDown size={28} className="animate-bounce" />
      </motion.div>
    </section>
  );
}

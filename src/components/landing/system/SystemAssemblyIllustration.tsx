'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface Annotation {
  id: string;
  label: string;
  x: number; // 0-1 relative to image width
  y: number; // 0-1 relative to image height
  align?: 'left' | 'right' | 'top' | 'bottom';
}

const DEFAULT_ANNOTATIONS: Annotation[] = [
  { id: 'panels', label: 'Solar Panels', x: 0.15, y: 0.12, align: 'left' },
  { id: 'inverter', label: 'Inverter', x: 0.85, y: 0.45, align: 'right' },
  { id: 'battery', label: 'Battery Storage', x: 0.15, y: 0.75, align: 'left' },
  { id: 'meter', label: 'Smart Meter', x: 0.85, y: 0.88, align: 'right' },
  { id: 'mounting', label: 'Mounting Structure', x: 0.5, y: 0.02, align: 'top' },
  { id: 'cables', label: 'DC/AC Cables', x: 0.5, y: 0.98, align: 'bottom' },
];

export default function SystemAssemblyIllustration({
  imageSrc = '/images/system-assembly.jpg',
  annotations = DEFAULT_ANNOTATIONS,
  className = '',
  alt = 'Solar system assembly — brick by brick',
}: {
  imageSrc?: string;
  annotations?: Annotation[];
  className?: string;
  alt?: string;
}) {
  return (
    <div className={`relative w-full h-full min-h-[600px] ${className}`}>
      {/* Assembly illustration image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/10 to-transparent" />
      </div>

      {/* Annotations / Labels */}
      {annotations.map((ann) => (
        <motion.div
          key={ann.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`
            absolute pointer-events-none
            ${ann.align === 'left' ? 'left-[8%]' : ann.align === 'right' ? 'right-[8%]' : ''}
            ${ann.align === 'top' ? 'top-[5%]' : ann.align === 'bottom' ? 'bottom-[5%]' : ''}
          `}
          style={{
            '--x': ann.x,
            '--y': ann.y,
            left: ann.align === 'left' || ann.align === 'right' ? undefined : `calc(${ann.x * 100}%)`,
            top: ann.align === 'top' || ann.align === 'bottom' ? undefined : `calc(${ann.y * 100}%)`,
            transform: ann.align === 'left' ? 'translateX(-100%)' : ann.align === 'right' ? 'translateX(0)' : ann.align === 'top' ? 'translateY(-100%)' : ann.align === 'bottom' ? 'translateY(0)' : 'translate(-50%, -50%)',
          } as React.CSSProperties}
        >
          <div className={`
            flex items-center gap-2 px-3 py-1.5 rounded-xl
            bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm
            border border-slate-200 dark:border-slate-700
            shadow-lg text-slate-900 dark:text-white
            font-medium text-sm whitespace-nowrap
            ${ann.align === 'left' ? 'flex-row' : ann.align === 'right' ? 'flex-row-reverse' : 'flex-col items-center'}
          `}>
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            <span>{ann.label}</span>
          </div>
        </motion.div>
      ))}

      {/* "Brick by brick" tagline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600/20 border border-orange-500/30 backdrop-blur-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-900">
            Собирается покирпично — как баггер
          </span>
        </div>
      </motion.div>
    </div>
  );
}
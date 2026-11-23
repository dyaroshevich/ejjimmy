'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CaseHeroImageProps {
  coverUrl: string;
  images: string[];
  customerName: string;
}

export default function CaseHeroImage({ coverUrl, images, customerName }: CaseHeroImageProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  }, [selectedIndex, images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  }, [selectedIndex, images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence initial={false}>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-4 md:p-10 touch-none"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-6 right-6 w-14 h-14 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center text-white transition-all shadow-2xl z-[210] border border-white/20"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
            >
              <X size={28} />
            </button>
            <button
              className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 hidden md:flex items-center justify-center text-white transition-all z-[210] border border-white/5"
              onClick={handlePrev}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 hidden md:flex items-center justify-center text-white transition-all z-[210] border border-white/5"
              onClick={handleNext}
            >
              <ChevronRight size={32} />
            </button>
            <motion.div
              key={selectedIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, { offset }) => {
                if (offset.x > 50) handlePrev();
                else if (offset.x < -50) handleNext();
              }}
              className="relative max-w-5xl max-h-[80vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex].startsWith('http') ? images[selectedIndex] : `/images/${images[selectedIndex]}`}
                width={1200}
                height={800}
                unoptimized={images[selectedIndex].startsWith('http')}
                sizes="(max-width: 1023px) 100vw, 1024px"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl pointer-events-none"
                alt={`รูปที่ ${selectedIndex + 1}`}
              />
              <div className="absolute -bottom-10 left-0 right-0 text-center">
                <span className="text-white/40 font-black text-xs uppercase tracking-widest">{selectedIndex + 1} / {images.length}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clickable Hero Image */}
      <section
        onClick={() => setSelectedIndex(0)}
        className="relative rounded-[3.5rem] overflow-hidden group shadow-2xl cursor-pointer bg-slate-100 dark:bg-slate-900"
      >
        <Image
          src={coverUrl}
          alt={customerName}
          width={1200}
          height={800}
          className="w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-[1.01]"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest bg-orange-600/80 backdrop-blur-md px-6 py-3 rounded-full">
            <Camera size={16} /> คลิกเพื่อดูภาพขยาย
          </div>
        </div>
      </section>
    </>
  );
}

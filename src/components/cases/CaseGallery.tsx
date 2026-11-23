'use client';

import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight, Camera, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contact } from '@/lib/site.config';

interface CaseGalleryProps {
  images: string[];
}

export default function CaseGallery({ images }: CaseGalleryProps) {
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
              <NextImage
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

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(i)}
            className="rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 aspect-square cursor-pointer group relative shadow-lg hover:shadow-2xl transition-all duration-700"
          >
            <NextImage
              src={img.startsWith('http') ? img : `/images/${img}`}
              fill
              unoptimized={img.startsWith('http')}
              sizes="(min-width: 768px) 30vw, 46vw"
              className="object-cover"
              alt={`รายละเอียดการติดตั้ง ${i + 1}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <Maximize2 size={20} />
              </div>
            </div>
          </motion.div>
        ))}
        <motion.div
          onClick={() => window.open(contact.lineUrl, '_blank')}
          className="rounded-[2.5rem] bg-orange-600 flex flex-col items-center justify-center p-10 text-center space-y-4 cursor-pointer hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 group"
        >
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <div className="space-y-1 text-white">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">ต้องการดูเพิ่ม?</p>
            <h4 className="text-lg font-black uppercase tracking-tight leading-none">คุย LINE</h4>
          </div>
        </motion.div>
      </div>
    </>
  );
}

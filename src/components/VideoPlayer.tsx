'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  hero?: boolean;
  controls?: boolean;
}

export function VideoPlayer({ src, poster, className, hero, controls }: VideoPlayerProps) {
  const [isLine, setIsLine] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsLine(ua.includes('line/') || ua.includes('liff'));
  }, []);

  if (isLine) {
    const videoUrl = src.startsWith('http') ? src : `${window.location.origin}${src}`;
    return (
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block relative group cursor-pointer ${className ?? ''}`}
      >
        {poster && (
          <Image src={poster} alt="" fill className="object-cover" sizes="100vw" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition">
          <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
            <Play size={28} fill="currentColor" />
          </div>
        </div>
      </a>
    );
  }

  if (hero) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className={className}
      />
    );
  }

  return (
    <video
      src={src}
      controls={controls}
      poster={poster}
      playsInline
      className={className}
    />
  );
}

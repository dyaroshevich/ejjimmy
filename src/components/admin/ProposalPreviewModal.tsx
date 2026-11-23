'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Props {
  leadId: string;
  tier: string | null;
  open: boolean;
  onClose: () => void;
}

export default function ProposalPreviewModal({ leadId, tier, open, onClose }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) {
      setHtml(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (tier) params.set('tier', tier);
    const url = `/api/pdf/preview-html/${leadId}${params.toString() ? '?' + params.toString() : ''}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load preview');
        return r.text();
      })
      .then((h) => {
        if (!cancelled) {
          setHtml(h);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [open, leadId, tier]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-8">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">
            Предпросмотр оффера
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-slate-100 p-2 md:p-4 min-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center h-[400px] text-slate-400">
              <Loader2 size={32} className="animate-spin" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-[400px] text-red-500 text-xs font-bold uppercase">
              {error}
            </div>
          )}
          {html && !loading && (
            <iframe
              ref={iframeRef}
              srcDoc={html}
              className="w-full h-full min-h-[70vh] rounded-xl bg-white"
              title="Proposal Preview"
              sandbox="allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}

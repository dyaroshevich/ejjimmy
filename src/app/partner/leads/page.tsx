'use client';

import { useEffect, useState } from 'react';
import { usePartnerLang, flowLabel, PARTNER_FLOW, getViewCode } from '@/lib/i18n-partner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function LeadCard({ lead, t, moving, onMove, colIdx }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl p-3 border border-slate-200 space-y-1 cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'shadow-lg ring-2 ring-orange-500' : ''}`}
    >
      <p className="font-bold text-sm text-slate-900 truncate">{lead.leads?.name || `#${lead.leads?.id}`}</p>
      <p className="text-xs text-slate-500">{lead.leads?.phone || ''}</p>
      <p className="text-xs text-slate-400 truncate">{lead.leads?.location || ''}</p>
      {lead.commission_amount ? (
        <p className="text-xs font-black text-green-700">
          {t.thb}
          {Number(lead.commission_amount).toLocaleString()}
          {lead.paid_at ? ` · ${t.paid_mark}` : ''}
        </p>
      ) : null}
      <div className="flex gap-1 pt-1" onPointerDown={(e) => e.stopPropagation()}>
        {colIdx > 0 && (
          <button
            disabled={moving === lead.id}
            onClick={() => onMove(lead.id, PARTNER_FLOW[colIdx - 1])}
            className="flex-1 px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-black text-slate-600 disabled:opacity-50"
          >
            ←
          </button>
        )}
        {colIdx < PARTNER_FLOW.length - 1 && (
          <button
            disabled={moving === lead.id}
            onClick={() => onMove(lead.id, PARTNER_FLOW[colIdx + 1])}
            className="flex-1 px-2 py-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-[11px] font-black text-white disabled:opacity-50"
          >
            {moving === lead.id ? '…' : '→'}
          </button>
        )}
      </div>
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { status: id } });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl p-3 space-y-3 min-h-[120px] transition-colors ${isOver ? 'bg-orange-100/70 ring-2 ring-orange-400' : 'bg-slate-100/70'}`}
    >
      {children}
    </div>
  );
}

export default function PartnerLeads() {
  const { t } = usePartnerLang();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  async function load() {
    setLoading(true);
    try {
      const code = getViewCode();
      const r = await fetch('/api/partner/leads' + (code ? `?code=${encodeURIComponent(code)}` : ''));
      const j = await r.json();
      setLeads(j.leads || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function move(id: string, status: string) {
    setMoving(id);
    try {
      const code = getViewCode();
      await fetch(`/api/partner/leads/${id}` + (code ? `?code=${encodeURIComponent(code)}` : ''), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setMoving(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const targetStatus = String(over.id);
    const item = leads.find((l) => String(l.id) === activeId);
    if (!item || item.status === targetStatus) return;
    // Optimistic UI
    setLeads((prev) => prev.map((l) => (String(l.id) === activeId ? { ...l, status: targetStatus } : l)));
    try {
      const code = getViewCode();
      const res = await fetch(
        `/api/partner/leads/${activeId}` + (code ? `?code=${encodeURIComponent(code)}` : ''),
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus }),
        }
      );
      if (!res.ok) throw new Error('move failed');
      await load();
    } catch {
      await load();
    }
  }

  if (loading) return <p className="text-slate-500 font-bold">{t.loading}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900">{t.my_leads}</h1>
      <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-5 gap-3 items-start">
          {PARTNER_FLOW.map((s) => {
            const col = leads.filter((l) => l.status === s);
            const idx = PARTNER_FLOW.indexOf(s);
            return (
              <DroppableColumn key={s} id={s}>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
                  {flowLabel(t, s)} · {col.length}
                </p>
                {col.length === 0 && <p className="text-xs text-slate-400 px-1">{t.no_leads}</p>}
                <div className="space-y-2">
                  {col.map((l) => (
                    <LeadCard key={l.id} lead={l} t={t} moving={moving} onMove={move} colIdx={idx} />
                  ))}
                </div>
              </DroppableColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

"use client";

import { ArrowDown, ArrowUp, Film, ImageIcon, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { MediaRow } from "@/db/schema";
import { MEDIA_CATEGORIES } from "@/lib/uploads";
import { cn } from "@/lib/utils";

function Thumb({ item, className }: { item: MediaRow; className?: string }) {
  if (item.type === "video") {
    return (
      <div className={cn("flex items-center justify-center bg-navy text-white", className)}>
        <Film className="h-6 w-6" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.thumbnailUrl || item.url} alt={item.altText || item.title} className={cn("object-cover", className)} loading="lazy" />;
}

export function MediaBrowserModal({
  open,
  onClose,
  onSelect,
  typeFilter,
  title = "Select media",
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaRow) => void;
  typeFilter?: "image" | "video";
  title?: string;
}) {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category !== "all") params.set("category", category);
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const json = await res.json();
      setItems(json.items || []);
    } finally {
      setLoading(false);
    }
  }, [q, category, typeFilter]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-strong relative flex max-h-[85vh] w-full max-w-5xl flex-col rounded-3xl">
        <div className="flex items-center justify-between border-b border-navy/10 px-6 py-4">
          <h3 className="display text-lg text-navy">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-navy/5" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-wrap gap-3 border-b border-navy/10 px-6 py-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-ink" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, filename or alt text" className="input pl-9" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-44">
            <option value="all">All categories</option>
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? <p className="text-sm text-slate-ink">Loading…</p> : null}
          {!loading && !items.length ? <p className="text-sm text-slate-ink">No media found. Upload files in the Media Library.</p> : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((item) => (
              <button key={item.id} type="button" onClick={() => onSelect(item)} className="group overflow-hidden rounded-xl border border-navy/10 text-left transition-shadow hover:shadow-lg focus:ring-2 focus:ring-green">
                <Thumb item={item} className="aspect-[4/3] w-full" />
                <div className="p-2">
                  <div className="truncate text-xs font-medium text-navy">{item.title || item.filename}</div>
                  <div className="truncate text-[10px] text-slate-ink">{item.category} · {item.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MediaPicker({
  name,
  label,
  value,
  hint,
  typeFilter,
}: {
  name: string;
  label: string;
  value: MediaRow | null;
  hint?: string;
  typeFilter?: "image" | "video";
}) {
  const [selected, setSelected] = useState<MediaRow | null>(value);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <div className="flex items-center gap-3 rounded-xl border border-navy/10 p-2">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-mist">
          {selected ? <Thumb item={selected} className="h-full w-full" /> : (
            <div className="flex h-full w-full items-center justify-center text-slate-ink/40">
              {typeFilter === "video" ? <Film className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-navy">{selected ? selected.title || selected.filename : "None selected"}</div>
          {selected ? <div className="truncate text-xs text-slate-ink">{selected.type} · {selected.category}</div> : null}
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => setOpen(true)} className="btn-outline py-1.5 text-xs">{selected ? "Replace" : "Select"}</button>
          {selected ? <button type="button" onClick={() => setSelected(null)} className="btn-outline py-1.5 text-xs" aria-label="Remove"><X className="h-3.5 w-3.5" /></button> : null}
        </div>
      </div>
      {hint ? <p className="mt-1 text-xs text-slate-ink/70">{hint}</p> : null}
      <MediaBrowserModal open={open} onClose={() => setOpen(false)} typeFilter={typeFilter} onSelect={(item) => { setSelected(item); setOpen(false); }} title={`Select ${label}`} />
    </div>
  );
}

export type GalleryEntry = { mediaId: number; kind: string; caption: string; media: MediaRow };

const KINDS = ["gallery", "before", "after", "diagram", "drone", "video"];

export function MediaMultiPicker({ name, label, value }: { name: string; label: string; value: GalleryEntry[] }) {
  const [entries, setEntries] = useState<GalleryEntry[]>(value);
  const [open, setOpen] = useState(false);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= entries.length) return;
    const next = [...entries];
    [next[i], next[j]] = [next[j], next[i]];
    setEntries(next);
  };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="label mb-0">{label}</span>
        <button type="button" onClick={() => setOpen(true)} className="btn-outline py-1.5 text-xs">Add media</button>
      </div>
      <input type="hidden" name={name} value={JSON.stringify(entries.map(({ mediaId, kind, caption }) => ({ mediaId, kind, caption })))} />
      {entries.length ? (
        <ul className="space-y-2">
          {entries.map((e, i) => (
            <li key={`${e.mediaId}-${i}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-navy/10 p-2">
              <Thumb item={e.media} className="h-14 w-20 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 text-xs">
                <div className="truncate font-medium text-navy">{e.media.title || e.media.filename}</div>
                <div className="text-slate-ink">{e.media.type}</div>
              </div>
              <select value={e.kind} onChange={(ev) => setEntries(entries.map((x, j) => (j === i ? { ...x, kind: ev.target.value } : x)))} className="input w-28 py-1.5 text-xs">
                {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <input value={e.caption} onChange={(ev) => setEntries(entries.map((x, j) => (j === i ? { ...x, caption: ev.target.value } : x)))} placeholder="Caption (optional)" className="input w-full py-1.5 text-xs sm:w-56" />
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="rounded-lg p-1.5 hover:bg-navy/5" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} className="rounded-lg p-1.5 hover:bg-navy/5" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => setEntries(entries.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-navy/15 p-4 text-center text-xs text-slate-ink">No gallery media yet. Add images, drone footage, before/after shots or videos.</p>
      )}
      <MediaBrowserModal open={open} onClose={() => setOpen(false)} title="Add to gallery" onSelect={(item) => { setEntries([...entries, { mediaId: item.id, kind: item.type === "video" ? "video" : "gallery", caption: "", media: item }]); setOpen(false); }} />
    </div>
  );
}

"use client";

import { Check, Copy, Film, Loader2, Search, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { MediaRow } from "@/db/schema";
import { MEDIA_CATEGORIES } from "@/lib/uploads";
import { cn, formatBytes, formatDateShort } from "@/lib/utils";

async function readDimensions(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return {};
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({});
    img.src = url;
  });
}

export function MediaUploader({ onUploaded }: { onUploaded?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<string>("general");
  const [altText, setAltText] = useState("");
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    setBusy(true);
    setError("");
    let done = 0;
    for (const file of list) {
      setProgress(`Uploading ${done + 1} of ${list.length}: ${file.name}`);
      const dims = await readDimensions(file);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      fd.append("altText", altText);
      fd.append("title", file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      if (dims.width) fd.append("width", String(dims.width));
      if (dims.height) fd.append("height", String(dims.height));
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error || `Upload failed for ${file.name}.`);
        break;
      }
      done++;
    }
    setBusy(false);
    setProgress(done ? `${done} file${done === 1 ? "" : "s"} uploaded.` : "");
    if (inputRef.current) inputRef.current.value = "";
    onUploaded?.();
    router.refresh();
  }

  return (
    <div className="card-admin">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          className={cn("flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors", drag ? "border-green bg-green/5" : "border-navy/15 hover:border-navy/30")}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        >
          <UploadCloud className="h-6 w-6 text-green" />
          <p className="mt-2 text-sm font-medium text-navy">Drop files here or click to upload</p>
          <p className="mt-1 text-xs text-slate-ink">JPG, PNG, WEBP, AVIF, SVG up to 15 MB · MP4, WEBM up to 300 MB</p>
          <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,video/mp4,video/webm" className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
        </div>
        <label className="block">
          <span className="label">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-40">
            {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Default alt text</span>
          <input value={altText} onChange={(e) => setAltText(e.target.value)} className="input w-56" placeholder="Describe the image" />
        </label>
      </div>
      {(progress || error || busy) ? (
        <div className={cn("mt-3 flex items-center gap-2 text-xs", error ? "text-red-600" : "text-slate-ink")}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {error || progress}
        </div>
      ) : null}
    </div>
  );
}

export function MediaLibrary({ initialItems }: { initialItems: MediaRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const items = initialItems.filter((m) => {
    if (category !== "all" && m.category !== category) return false;
    if (type !== "all" && m.type !== type) return false;
    if (q) {
      const s = `${m.title} ${m.filename} ${m.altText}`.toLowerCase();
      if (!s.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  async function save(item: MediaRow, patch: Partial<MediaRow>) {
    setBusy(true);
    await fetch(`/api/admin/media/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setBusy(false);
    setEditing(null);
    router.refresh();
  }
  async function remove(item: MediaRow) {
    if (!window.confirm(`Delete "${item.title || item.filename}"? Content using it will fall back gracefully.`)) return;
    setBusy(true);
    await fetch(`/api/admin/media/${item.id}`, { method: "DELETE" });
    setBusy(false);
    setEditing(null);
    router.refresh();
  }
  async function copy(item: MediaRow) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.id);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-ink" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search media" className="input pl-9" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-44">
          <option value="all">All categories</option>
          {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input w-36">
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
        <div className="self-center text-xs text-slate-ink">{items.length} item{items.length === 1 ? "" : "s"}</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((m) => (
          <div key={m.id} className="group overflow-hidden rounded-2xl border border-navy/10 bg-white">
            <button type="button" onClick={() => setEditing(m)} className="block w-full text-left">
              <div className="aspect-[4/3] w-full bg-mist">
                {m.type === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-navy text-white"><Film className="h-7 w-7" /></div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.thumbnailUrl || m.url} alt={m.altText || m.title} className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-xs font-medium text-navy">{m.title || m.filename}</div>
                <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-ink">
                  <span>{m.category} · {m.type}</span>
                  <span>{formatBytes(m.size)}</span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
      {!items.length ? <p className="rounded-2xl border border-dashed border-navy/15 p-8 text-center text-sm text-slate-ink">No media matches these filters.</p> : null}

      {editing ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <form
            className="glass-strong relative grid w-full max-w-3xl gap-6 rounded-3xl p-6 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              save(editing, { title: String(fd.get("title")), altText: String(fd.get("altText")), description: String(fd.get("description")), category: String(fd.get("category")) });
            }}
          >
            <div>
              <div className="overflow-hidden rounded-2xl bg-mist">
                {editing.type === "video" ? (
                  <video src={editing.url} controls className="aspect-video w-full" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={editing.url} alt={editing.altText || editing.title} className="w-full object-contain" />
                )}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-ink">
                <dt>Filename</dt><dd className="truncate text-navy">{editing.filename}</dd>
                <dt>Type</dt><dd className="text-navy">{editing.mimeType || editing.type}</dd>
                <dt>Dimensions</dt><dd className="text-navy">{editing.width && editing.height ? `${editing.width} × ${editing.height}` : "—"}</dd>
                <dt>Size</dt><dd className="text-navy">{formatBytes(editing.size) || "—"}</dd>
                <dt>Uploaded</dt><dd className="text-navy">{formatDateShort(editing.createdAt)}</dd>
                <dt>Source</dt><dd className="text-navy">{editing.source}{editing.credit ? ` · ${editing.credit}` : ""}</dd>
              </dl>
              <button type="button" onClick={() => copy(editing)} className="btn-outline mt-4 py-1.5 text-xs">
                {copied === editing.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Copy URL
              </button>
            </div>
            <div className="space-y-4">
              <label className="block"><span className="label">Title</span><input name="title" defaultValue={editing.title} className="input" /></label>
              <label className="block"><span className="label">Alt text</span><input name="altText" defaultValue={editing.altText} className="input" placeholder="Describe the image for accessibility" /></label>
              <label className="block"><span className="label">Description</span><textarea name="description" defaultValue={editing.description} className="input" rows={3} /></label>
              <label className="block"><span className="label">Category</span>
                <select name="category" defaultValue={editing.category} className="input">
                  {MEDIA_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button type="button" onClick={() => remove(editing)} className="btn border border-red-200 py-2 text-xs text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditing(null)} className="btn-outline py-2 text-xs">Cancel</button>
                  <button type="submit" disabled={busy} className="btn-primary py-2 text-xs">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} Save</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

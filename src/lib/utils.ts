import type { SectionItem } from "@/db/schema";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function digitsOnly(value: string) {
  return (value || "").replace(/[^0-9]/g, "");
}

export function waLink(number: string, message?: string) {
  const digits = digitsOnly(number);
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Builds a dialable tel: link. Nigerian local numbers (e.g. 09130703970)
 * are normalised to international format (+2349130703970); the displayed
 * number stays exactly as entered in Admin.
 */
export function telLink(number: string) {
  let digits = (number || "").replace(/[^0-9+]/g, "");
  if (/^0\d{10}$/.test(digits)) digits = `+234${digits.slice(1)}`;
  return `tel:${digits}`;
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Split a textarea value into trimmed non-empty lines. */
export function parseLines(text: string | null | undefined): string[] {
  return (text || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** "Title | Description" lines -> SectionItem[] */
export function parseItems(text: string | null | undefined): SectionItem[] {
  return parseLines(text).map((line) => {
    const [title, ...rest] = line.split("|");
    return { title: (title || "").trim(), text: rest.join("|").trim() };
  });
}

export function itemsToText(items: SectionItem[] | null | undefined) {
  return (items || []).map((i) => (i.text ? `${i.title} | ${i.text}` : i.title)).join("\n");
}

export function truncate(text: string, max = 160) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function toInt(value: FormDataEntryValue | null | undefined, fallback = 0) {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function toFloat(value: FormDataEntryValue | null | undefined, fallback = 0) {
  const n = parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : fallback;
}

export function toOptionalId(value: FormDataEntryValue | null | undefined): number | null {
  const n = parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function str(value: FormDataEntryValue | null | undefined) {
  return String(value ?? "").trim();
}

export function bool(value: FormDataEntryValue | null | undefined) {
  const v = String(value ?? "").toLowerCase();
  return v === "on" || v === "true" || v === "1" || v === "yes";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * A project cover is considered "unverified" when it is missing or is generic
 * stock/illustrative media (source = external, or titled as illustrative).
 * Unverified projects must never present stock imagery as real TRES work.
 */
export function isPlaceholderCover(cover: { source?: string | null; title?: string | null } | null | undefined): boolean {
  if (!cover) return true;
  return cover.source === "external" || /illustrative/i.test(cover.title || "");
}

export function round(value: number, decimals = 1) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** Minimal, safe rich-text renderer input: paragraphs split by blank lines. */
export function splitParagraphs(text: string | null | undefined) {
  return (text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, inArray, ne, or, ilike } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import {
  calculatorAppliances,
  calculatorSettings,
  insights,
  markets,
  media,
  navigation,
  pageSections,
  projectMedia,
  projects,
  seoMetadata,
  services,
  siteSettings,
  type InsightRow,
  type MarketRow,
  type MediaRow,
  type ProjectMediaRow,
  type ProjectRow,
  type SectionRow,
  type ServiceRow,
} from "@/db/schema";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings-defaults";
import { normalizeConfig, type ApplianceDef, type CalculatorConfig } from "@/lib/calculator";
import { ensureSeeded } from "@/db/seed";

export type Media = MediaRow;

/* ------------------------------------------------------------------ */
/* Media helpers                                                       */
/* ------------------------------------------------------------------ */

export async function getMediaMap(ids: Array<number | null | undefined>) {
  const unique = [...new Set(ids.filter((n): n is number => typeof n === "number" && n > 0))];
  if (!unique.length) return new Map<number, Media>();
  const rows = await db.select().from(media).where(inArray(media.id, unique));
  return new Map(rows.map((r) => [r.id, r]));
}

export async function getMediaById(id: number | null | undefined) {
  if (!id) return null;
  const rows = await db.select().from(media).where(eq(media.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAllMedia(opts: { category?: string; type?: string; q?: string } = {}) {
  const conditions = [];
  if (opts.category && opts.category !== "all") conditions.push(eq(media.category, opts.category));
  if (opts.type && opts.type !== "all") conditions.push(eq(media.type, opts.type));
  if (opts.q) {
    const like = `%${opts.q}%`;
    conditions.push(
      or(ilike(media.title, like), ilike(media.filename, like), ilike(media.altText, like)),
    );
  }
  return db
    .select()
    .from(media)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(media.createdAt));
}

/* ------------------------------------------------------------------ */
/* Settings & navigation                                               */
/* ------------------------------------------------------------------ */

export const getSettings = cache(async (): Promise<SiteSettings> => {
  await ensureSeeded();
  const rows = await db.select().from(siteSettings);
  const merged: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of rows) merged[row.key] = row.value;
  return merged as SiteSettings;
});

export const getNavigation = cache(async (location: "header" | "footer") => {
  await ensureSeeded();
  return db
    .select()
    .from(navigation)
    .where(and(eq(navigation.location, location), eq(navigation.visible, true)))
    .orderBy(asc(navigation.order), asc(navigation.id));
});

export async function getAllNavigation() {
  return db.select().from(navigation).orderBy(asc(navigation.location), asc(navigation.order));
}

/* ------------------------------------------------------------------ */
/* Page sections                                                       */
/* ------------------------------------------------------------------ */

export type Section = SectionRow & {
  media: Media | null;
  mobileMedia: Media | null;
  video: Media | null;
  mobileVideo: Media | null;
  poster: Media | null;
};

export const getSections = cache(async (page: string) => {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.page, page))
    .orderBy(asc(pageSections.order), asc(pageSections.id));
  const map = await getMediaMap(
    rows.flatMap((r) => [
      r.mediaId,
      r.mobileMediaId,
      r.videoMediaId,
      r.mobileVideoMediaId,
      r.posterMediaId,
    ]),
  );
  const result: Record<string, Section> = {};
  for (const r of rows) {
    result[r.key] = {
      ...r,
      media: r.mediaId ? (map.get(r.mediaId) ?? null) : null,
      mobileMedia: r.mobileMediaId ? (map.get(r.mobileMediaId) ?? null) : null,
      video: r.videoMediaId ? (map.get(r.videoMediaId) ?? null) : null,
      mobileVideo: r.mobileVideoMediaId ? (map.get(r.mobileVideoMediaId) ?? null) : null,
      poster: r.posterMediaId ? (map.get(r.posterMediaId) ?? null) : null,
    };
  }
  return result;
});

export async function getSectionRows(page: string) {
  return db
    .select()
    .from(pageSections)
    .where(eq(pageSections.page, page))
    .orderBy(asc(pageSections.order), asc(pageSections.id));
}

export async function getSectionById(id: number) {
  const rows = await db.select().from(pageSections).where(eq(pageSections.id, id)).limit(1);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export type Service = ServiceRow & { media: Media | null; video: Media | null };

async function attachServiceMedia(rows: ServiceRow[]): Promise<Service[]> {
  const map = await getMediaMap(rows.flatMap((r) => [r.mediaId, r.videoMediaId]));
  return rows.map((r) => ({
    ...r,
    media: r.mediaId ? (map.get(r.mediaId) ?? null) : null,
    video: r.videoMediaId ? (map.get(r.videoMediaId) ?? null) : null,
  }));
}

export const getServices = cache(async (opts: { includeHidden?: boolean; homeOnly?: boolean } = {}) => {
  await ensureSeeded();
  const conditions = [];
  if (!opts.includeHidden) conditions.push(eq(services.visible, true));
  if (opts.homeOnly) conditions.push(eq(services.showOnHome, true));
  const rows = await db
    .select()
    .from(services)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(services.order), asc(services.id));
  return attachServiceMedia(rows);
});

export async function getServiceBySlug(slug: string, includeHidden = false) {
  await ensureSeeded();
  const rows = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  const row = rows[0];
  if (!row || (!includeHidden && !row.visible)) return null;
  return (await attachServiceMedia([row]))[0];
}

export async function getServiceById(id: number) {
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Markets                                                             */
/* ------------------------------------------------------------------ */

export type Market = MarketRow & { media: Media | null };

async function attachMarketMedia(rows: MarketRow[]): Promise<Market[]> {
  const map = await getMediaMap(rows.map((r) => r.mediaId));
  return rows.map((r) => ({ ...r, media: r.mediaId ? (map.get(r.mediaId) ?? null) : null }));
}

export const getMarkets = cache(async (opts: { includeHidden?: boolean; homeOnly?: boolean } = {}) => {
  await ensureSeeded();
  const conditions = [];
  if (!opts.includeHidden) conditions.push(eq(markets.visible, true));
  if (opts.homeOnly) conditions.push(eq(markets.showOnHome, true));
  const rows = await db
    .select()
    .from(markets)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(markets.order), asc(markets.id));
  return attachMarketMedia(rows);
});

export async function getMarketBySlug(slug: string, includeHidden = false) {
  await ensureSeeded();
  const rows = await db.select().from(markets).where(eq(markets.slug, slug)).limit(1);
  const row = rows[0];
  if (!row || (!includeHidden && !row.visible)) return null;
  return (await attachMarketMedia([row]))[0];
}

export async function getMarketById(id: number) {
  const rows = await db.select().from(markets).where(eq(markets.id, id)).limit(1);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type Project = ProjectRow & { cover: Media | null };
export type ProjectGalleryItem = ProjectMediaRow & { media: Media };
export type ProjectDetail = Project & { gallery: ProjectGalleryItem[] };

async function attachCovers(rows: ProjectRow[]): Promise<Project[]> {
  const map = await getMediaMap(rows.map((r) => r.coverMediaId));
  return rows.map((r) => ({
    ...r,
    cover: r.coverMediaId ? (map.get(r.coverMediaId) ?? null) : null,
  }));
}

export const getProjects = cache(
  async (opts: { featuredOnly?: boolean; includeUnpublished?: boolean; limit?: number } = {}) => {
  await ensureSeeded();
    const conditions = [];
    if (!opts.includeUnpublished) conditions.push(eq(projects.published, true));
    if (opts.featuredOnly) conditions.push(eq(projects.featured, true));
    const query = db
      .select()
      .from(projects)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(projects.order), desc(projects.createdAt));
    const rows = opts.limit ? await query.limit(opts.limit) : await query;
    return attachCovers(rows);
  },
);

export async function getProjectGallery(projectId: number): Promise<ProjectGalleryItem[]> {
  const rows = await db
    .select()
    .from(projectMedia)
    .where(eq(projectMedia.projectId, projectId))
    .orderBy(asc(projectMedia.order), asc(projectMedia.id));
  const map = await getMediaMap(rows.map((r) => r.mediaId));
  return rows
    .map((r) => ({ ...r, media: map.get(r.mediaId) }))
    .filter((r): r is ProjectGalleryItem => Boolean(r.media));
}

export async function getProjectBySlug(
  slug: string,
  includeUnpublished = false,
): Promise<ProjectDetail | null> {
  await ensureSeeded();
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  const row = rows[0];
  if (!row || (!includeUnpublished && !row.published)) return null;
  const [withCover] = await attachCovers([row]);
  const gallery = await getProjectGallery(row.id);
  return { ...withCover, gallery };
}

export async function getProjectById(id: number): Promise<ProjectDetail | null> {
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  const [withCover] = await attachCovers([row]);
  const gallery = await getProjectGallery(row.id);
  return { ...withCover, gallery };
}

export async function getRelatedProjects(project: ProjectRow, limit = 3) {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.published, true), ne(projects.id, project.id)))
    .orderBy(asc(projects.order), desc(projects.createdAt))
    .limit(limit);
  return attachCovers(rows);
}

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

export type Insight = InsightRow & { cover: Media | null };

async function attachInsightCovers(rows: InsightRow[]): Promise<Insight[]> {
  const map = await getMediaMap(rows.map((r) => r.coverMediaId));
  return rows.map((r) => ({
    ...r,
    cover: r.coverMediaId ? (map.get(r.coverMediaId) ?? null) : null,
  }));
}

export const getInsights = cache(
  async (opts: { featuredOnly?: boolean; includeUnpublished?: boolean; limit?: number } = {}) => {
  await ensureSeeded();
    const conditions = [];
    if (!opts.includeUnpublished) conditions.push(eq(insights.published, true));
    if (opts.featuredOnly) conditions.push(eq(insights.featured, true));
    const query = db
      .select()
      .from(insights)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(insights.publishedAt));
    const rows = opts.limit ? await query.limit(opts.limit) : await query;
    return attachInsightCovers(rows);
  },
);

export async function getInsightBySlug(slug: string, includeUnpublished = false) {
  await ensureSeeded();
  const rows = await db.select().from(insights).where(eq(insights.slug, slug)).limit(1);
  const row = rows[0];
  if (!row || (!includeUnpublished && !row.published)) return null;
  return (await attachInsightCovers([row]))[0];
}

export async function getInsightById(id: number) {
  const rows = await db.select().from(insights).where(eq(insights.id, id)).limit(1);
  const row = rows[0];
  if (!row) return null;
  return (await attachInsightCovers([row]))[0];
}

/* ------------------------------------------------------------------ */
/* Calculator                                                          */
/* ------------------------------------------------------------------ */

export const getCalculatorConfig = cache(
  async (): Promise<{ config: CalculatorConfig; appliances: ApplianceDef[] }> => {
  await ensureSeeded();
    const [settingsRow] = await db.select().from(calculatorSettings).limit(1);
    const config = normalizeConfig(settingsRow?.settings);
    const rows = await db
      .select()
      .from(calculatorAppliances)
      .where(eq(calculatorAppliances.visible, true))
      .orderBy(asc(calculatorAppliances.order), asc(calculatorAppliances.id));
    return {
      config,
      appliances: rows.map((r) => ({
        id: r.id,
        name: r.name,
        wattage: r.wattage,
        defaultQuantity: r.defaultQuantity,
        defaultHours: r.defaultHours,
      })),
    };
  },
);

export async function getCalculatorAdminData() {
  const [settingsRow] = await db.select().from(calculatorSettings).limit(1);
  const appliances = await db
    .select()
    .from(calculatorAppliances)
    .orderBy(asc(calculatorAppliances.order), asc(calculatorAppliances.id));
  return { settingsRow: settingsRow ?? null, config: normalizeConfig(settingsRow?.settings), appliances };
}

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

export const getSeoOverride = cache(async (path: string) => {
  await ensureSeeded();
  const rows = await db.select().from(seoMetadata).where(eq(seoMetadata.path, path)).limit(1);
  return rows[0] ?? null;
});

export async function buildMetadata(opts: {
  path: string;
  title: string;
  description?: string;
  image?: Media | null;
  noIndex?: boolean;
}): Promise<Metadata> {
  const [settings, override] = await Promise.all([getSettings(), getSeoOverride(opts.path)]);
  const ogMedia = override?.ogMediaId ? await getMediaById(override.ogMediaId) : null;
  const brand = settings.brand_name || "TRES";
  const baseTitle = override?.title || opts.title;
  const title = baseTitle.includes(brand) ? baseTitle : `${baseTitle} — ${brand}`;
  const description =
    override?.description || opts.description || settings.default_seo_description;
  const siteUrl = settings.site_url?.replace(/\/$/, "") || "";
  const canonical = override?.canonical || (siteUrl ? `${siteUrl}${opts.path}` : undefined);
  const image = ogMedia?.url || opts.image?.url;
  const noIndex = override?.noIndex || opts.noIndex;
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: brand,
      url: canonical,
      images: image ? [{ url: image.startsWith("http") ? image : `${siteUrl}${image}` }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
}

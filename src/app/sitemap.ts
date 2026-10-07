import type { MetadataRoute } from "next";
import { getInsights, getMarkets, getProjects, getServices, getSettings } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettings();
  const base = settings.site_url?.replace(/\/$/, "") || "";
  const [services, markets, projects, insights] = await Promise.all([
    getServices(),
    getMarkets(),
    getProjects(),
    getInsights(),
  ]);
  const staticPaths = ["/", "/about", "/services", "/markets", "/projects", "/insights", "/solar-calculator", "/contact", "/privacy", "/terms"];
  const now = new Date();
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: now, priority: p === "/" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt, priority: 0.8 })),
    ...markets.map((m) => ({ url: `${base}/markets/${m.slug}`, lastModified: m.updatedAt, priority: 0.7 })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
    ...insights.map((i) => ({ url: `${base}/insights/${i.slug}`, lastModified: i.updatedAt, priority: 0.6 })),
  ];
}

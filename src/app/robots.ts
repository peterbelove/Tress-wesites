import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const base = settings.site_url?.replace(/\/$/, "") || "";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}

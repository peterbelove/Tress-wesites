import type { ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { getMarkets, getMediaById, getNavigation, getServices, getSettings } from "@/lib/cms";

// Time-based caching for the public site. Admin saves call
// revalidatePath("/", "layout") so edits appear immediately; everything else
// revalidates within 5 minutes.
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();
  const [headerNav, footerNav, services, markets, logoMedia, logoLightMedia] = await Promise.all([
    getNavigation("header"),
    getNavigation("footer"),
    getServices(),
    getMarkets(),
    settings.logo_media_id ? getMediaById(Number(settings.logo_media_id)) : null,
    settings.logo_light_media_id ? getMediaById(Number(settings.logo_light_media_id)) : null,
  ]);
  const logo = {
    logoUrl: logoMedia?.url ?? null,
    logoLightUrl: logoLightMedia?.url ?? null,
    showWordmark: settings.logo_show_wordmark !== "false",
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.brand_name,
    legalName: settings.legal_name,
    url: settings.site_url || undefined,
    email: settings.email || undefined,
    telephone: [settings.phone_primary, settings.phone_secondary].filter(Boolean),
    identifier: settings.rc_number || undefined,
    areaServed: "NG",
    description: settings.tagline,
    logo: logo.logoUrl && settings.site_url ? `${settings.site_url.replace(/\/$/, "")}${logo.logoUrl}` : undefined,
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-green focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header
        items={headerNav.map((n) => ({ label: n.label, href: n.href }))}
        services={services.map((s) => ({ label: s.title, href: `/services/${s.slug}`, summary: s.summary }))}
        markets={markets.map((m) => ({ label: m.title, href: `/markets/${m.slug}`, summary: m.summary }))}
        ctaLabel={settings.header_cta_label}
        ctaHref={settings.header_cta_href}
        brand={settings.brand_name}
        logo={logo}
      />
      <main id="main">{children}</main>
      <Footer
        settings={settings}
        footerNav={footerNav.map((n) => ({ label: n.label, href: n.href }))}
        services={services.map((s) => ({ label: s.title, href: `/services/${s.slug}` }))}
        markets={markets.map((m) => ({ label: m.title, href: `/markets/${m.slug}` }))}
        logo={logo}
      />
      {settings.show_whatsapp_button !== "false" ? (
        <WhatsAppButton number={settings.whatsapp} message={settings.whatsapp_default_message} />
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
    </>
  );
}

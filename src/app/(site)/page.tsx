import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { EnergyFlow } from "@/components/calculator/energy-flow";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ProjectCard, ServiceCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { Hero } from "@/components/site/hero";
import { ImproveLives } from "@/components/site/improve-lives";
import { MediaImage } from "@/components/site/media-renderer";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata, getProjects, getSections, getServices, getSettings } from "@/lib/cms";
import { isPlaceholderCover } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const sections = await getSections("home");
  return buildMetadata({
    path: "/",
    title: settings.default_seo_title,
    description: settings.default_seo_description,
    image: sections.hero?.media ?? null,
  });
}

export default async function HomePage() {
  const [settings, sections, services, projects] = await Promise.all([
    getSettings(),
    getSections("home"),
    getServices({ homeOnly: true }),
    getProjects({ featuredOnly: true, limit: 4 }),
  ]);

  const { hero, pain, improve, services: svc, projects: proj, credentials: cred, calculator: calc, cta } = sections;
  const show = (s?: { visible: boolean } | null) => Boolean(s && s.visible);
  // Only verified (real-photography) projects appear in the home featured grid,
  // and only when there are at least two of them.
  const verifiedProjects = projects.filter((p) => !isPlaceholderCover(p.cover));

  return (
    <>
      {/* Hero */}
      {show(hero) ? (
        <Hero
          title={hero.title || "ENGINEERING BETTER LIVES."}
          subtitle={hero.subtitle}
          primary={hero.primaryLabel ? { label: hero.primaryLabel, href: hero.primaryHref } : null}
          secondary={hero.secondaryLabel ? { label: hero.secondaryLabel, href: hero.secondaryHref } : null}
          media={{
            image: hero.media,
            mobileImage: hero.mobileMedia,
            video: hero.video,
            mobileVideo: hero.mobileVideo,
            poster: hero.poster,
          }}
        />
      ) : null}

      {/* Customer problem */}
      {show(pain) ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-28 md:py-40">
            <div className="max-w-4xl">
              <SectionHeading title={pain.title} size="lg" />
              {pain.body ? (
                <Reveal delay={0.1}>
                  <p className="lede mt-8 max-w-2xl">{pain.body}</p>
                </Reveal>
              ) : null}
            </div>
            {pain.items?.length || pain.media ? (
              <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
                {pain.media ? (
                  <Reveal className="lg:col-span-5">
                    <div className="aspect-[4/5] overflow-hidden rounded-3xl">
                      <MediaImage media={pain.media} className="h-full w-full" sizes="(min-width: 1024px) 40vw, 100vw" fallbackTone="light" />
                    </div>
                  </Reveal>
                ) : null}
                {pain.items?.length ? (
                  <Stagger className={pain.media ? "lg:col-span-6 lg:col-start-7" : "lg:col-span-8"}>
                    <ul className="divide-y divide-navy/10 border-y border-navy/10">
                      {pain.items.map((item, i) => (
                        <StaggerItem key={`${item.title}-${i}`} as="li" className="grid gap-1 py-5 sm:grid-cols-5 sm:gap-6">
                          <h3 className="display text-lg text-navy sm:col-span-2">{item.title}</h3>
                          {item.text ? <p className="text-sm leading-relaxed text-slate-ink sm:col-span-3">{item.text}</p> : null}
                        </StaggerItem>
                      ))}
                    </ul>
                  </Stagger>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Engineering should improve lives */}
      {show(improve) ? (
        <ImproveLives
          title={improve.title}
          body={improve.body}
          words={improve.items || []}
          media={improve.media}
          video={improve.video}
          tagline={settings.tagline}
        />
      ) : null}

      {/* Services preview */}
      {show(svc) && services.length ? (
        <section className="grid-lines bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
            <SectionHeading
              title={svc.title}
              subtitle={svc.subtitle}
              action={svc.primaryLabel ? { label: svc.primaryLabel, href: svc.primaryHref || "/services" } : null}
            />
            <Stagger className="mt-16 grid gap-4 md:grid-cols-6 md:grid-rows-[minmax(14rem,auto)_minmax(14rem,auto)]" stagger={0.07}>
              {services.map((s, i) => (
                <StaggerItem key={s.id} className={i === 0 ? "md:col-span-4 md:row-span-2" : "md:col-span-2"}>
                  <ServiceCard service={s} variant={i === 0 ? "feature" : "standard"} className="h-full" />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Featured projects */}
      {show(proj) && verifiedProjects.length >= 2 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
            <SectionHeading
              title={proj.title}
              subtitle={proj.subtitle}
              action={proj.primaryLabel ? { label: proj.primaryLabel, href: proj.primaryHref || "/projects" } : null}
            />
            <Stagger className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
              {verifiedProjects.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard project={p} variant="compact" />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {/* Credentials & partners — hidden by default, owner-managed. Never invent these. */}
      {show(cred) && cred.items?.length ? (
        <section className="border-y border-navy/10 bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {cred.items.map((it, i) => (
                <li key={i} className="text-sm text-slate-ink">
                  {it.title}
                  {it.text ? <span className="text-slate-ink/70"> · {it.text}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Solar calculator invitation */}
      {show(calc) ? (
        <section className="grid-lines bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-32">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <Reveal>
                <h2 className="display text-4xl text-navy md:text-6xl">{calc.title}</h2>
                {calc.body ? <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-ink">{calc.body}</p> : null}
                <div className="mt-10">
                  <Link href={calc.primaryHref || "/solar-calculator"} className="btn-primary">
                    {calc.primaryLabel || "Calculate Your Solar System"} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <p className="mt-6 max-w-md text-xs text-slate-ink/70">Indicative estimate for planning only. Final sizing is confirmed through a TRES site assessment and engineering design.</p>
              </Reveal>
              <Reveal delay={0.15}>
                <EnergyFlow />
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      {/* Final CTA */}
      {show(cta) ? (
        <CTASection
          title={cta.title}
          body={cta.body}
          primaryLabel={cta.primaryLabel}
          primaryHref={cta.primaryHref}
          secondaryLabel={cta.secondaryLabel}
          secondaryHref={cta.secondaryHref}
          whatsapp={settings.whatsapp}
          whatsappMessage={settings.whatsapp_default_message}
        />
      ) : null}
    </>
  );
}

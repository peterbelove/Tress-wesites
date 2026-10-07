import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CTASection } from "@/components/site/cta-section";
import { MediaImage } from "@/components/site/media-renderer";
import { PageHero } from "@/components/site/page-hero";
import { ProcessFlow } from "@/components/site/process-flow";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata, getSections, getServices, getSettings } from "@/lib/cms";
import { splitParagraphs } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSections("about");
  return buildMetadata({
    path: "/about",
    title: "About TRES",
    description: s.hero?.subtitle || undefined,
    image: s.hero?.media,
  });
}

export default async function AboutPage() {
  const [settings, s, services] = await Promise.all([getSettings(), getSections("about"), getServices()]);
  const show = (k: string) => Boolean(s[k] && s[k].visible);
  const why = s["why-tres"];
  const process = s["how-we-work"];

  return (
    <>
      {show("hero") ? (
        <PageHero
          title={s.hero.title}
          subtitle={s.hero.subtitle}
          media={s.hero.media}
          crumbs={[{ label: "About" }]}
        />
      ) : null}

      {show("who") ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
            <div className="grid gap-16 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <SectionHeading title={s.who.title} />
                <Reveal delay={0.1} className="mt-8 space-y-5">
                  {splitParagraphs(s.who.body).map((p, i) => (
                    <p key={i} className="text-lg leading-relaxed text-slate-ink">{p}</p>
                  ))}
                </Reveal>
              </div>
              <div className="lg:col-span-6">
                <Reveal delay={0.2} className="aspect-[4/3] overflow-hidden rounded-3xl">
                  <MediaImage media={s.who.media} className="h-full w-full" sizes="(min-width: 1024px) 50vw, 100vw" fallbackTone="light" />
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {show("why-exists") ? (
        <section className="relative overflow-hidden bg-navy text-white">
          <div className="grid-lines-dark absolute inset-0 opacity-40" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
            <div className="grid gap-16 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionHeading tone="dark" title={s["why-exists"].title} />
                <Reveal delay={0.1}>
                  <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75">{s["why-exists"].body}</p>
                </Reveal>
              </div>
              <div className="lg:col-span-4 lg:col-start-9">
                <Stagger>
                  <div className="eyebrow mb-6 text-white/70">What TRES was created to address</div>
                  <ul className="divide-y divide-white/10 border-y border-white/10">
                    {(s["why-exists"].items || []).map((item, i) => (
                      <StaggerItem key={i} as="li" className="display py-4 text-xl text-white">
                        {item.title}
                      </StaggerItem>
                    ))}
                  </ul>
                </Stagger>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {show("founder") && s.founder.body ? (
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-28 md:py-36">
            <Reveal>
              <h2 className="display text-3xl text-navy md:text-4xl">{s.founder.title}</h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-12 border-l-2 border-green pl-8 md:pl-12">
              {splitParagraphs(s.founder.body).map((p, i) => (
                <p key={i} className={i === 0 ? "display text-2xl leading-snug text-navy md:text-3xl" : "mt-6 text-lg leading-relaxed text-slate-ink"}>{p}</p>
              ))}
              {s.founder.subtitle ? <p className="eyebrow mt-10 text-slate-ink">— {s.founder.subtitle}</p> : null}
            </Reveal>
          </div>
        </section>
      ) : null}

      {show("mission") || show("vision") ? (
        <section className="grid-lines bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
            <div className="grid gap-6 md:grid-cols-2">
              {show("mission") ? (
                <Reveal className="glass rounded-3xl p-8 md:p-12">
                  <h2 className="display text-2xl text-navy">{s.mission.title}</h2>
                  <p className="mt-6 text-xl leading-relaxed text-navy">{s.mission.body}</p>
                </Reveal>
              ) : null}
              {show("vision") ? (
                <Reveal delay={0.1} className="rounded-3xl bg-navy p-8 text-white md:p-12">
                  <h2 className="display text-3xl leading-tight md:text-4xl">{s.vision.title}</h2>
                  {s.vision.body ? <p className="mt-6 text-lg text-white/70">{s.vision.body}</p> : null}
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {show("beliefs") && s.beliefs.items?.length ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
            <SectionHeading title={s.beliefs.title} />
            <Stagger className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {s.beliefs.items.map((b, i) => (
                <StaggerItem key={i}>
                  <div className="h-px w-10 bg-green" aria-hidden />
                  <h3 className="display mt-5 text-xl text-navy">{b.title}</h3>
                  {b.text ? <p className="mt-2 text-sm leading-relaxed text-slate-ink">{b.text}</p> : null}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      {why && why.visible ? (
        <section className="relative overflow-hidden bg-navy-950 text-white">
          <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-green/10 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
            <div className="grid gap-16 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Reveal>
                  <h2 className="display text-4xl whitespace-pre-line md:text-6xl">{why.title}</h2>
                  {why.body ? <p className="mt-8 text-lg leading-relaxed text-white/70">{why.body}</p> : null}
                </Reveal>
              </div>
              <div className="lg:col-span-6 lg:col-start-7">
                <Stagger>
                  <ul className="divide-y divide-white/10 border-y border-white/10">
                    {(why.items || []).map((item, i) => (
                      <StaggerItem key={`${item.title}-${i}`} as="li" className="grid gap-1 py-5 sm:grid-cols-5 sm:gap-6">
                        <h3 className="display text-lg sm:col-span-2">{item.title}</h3>
                        {item.text ? <p className="text-sm leading-relaxed text-white/65 sm:col-span-3">{item.text}</p> : null}
                      </StaggerItem>
                    ))}
                  </ul>
                </Stagger>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {show("capabilities") && services.length ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
            <SectionHeading title={s.capabilities.title} subtitle={s.capabilities.subtitle} />
            <ul className="mt-14 divide-y divide-navy/10 border-y border-navy/10">
              {services.map((svc) => (
                <li key={svc.id}>
                  <Link href={`/services/${svc.slug}`} className="group flex items-center justify-between gap-6 py-6 text-navy transition-colors hover:text-green-700">
                    <div>
                      <h3 className="display text-2xl md:text-3xl">{svc.title}</h3>
                      <p className="mt-1 hidden max-w-xl text-sm text-slate-ink md:block">{svc.summary}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {process && process.visible && process.items?.length ? (
        <section className="grid-lines bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-28 md:py-36">
            <SectionHeading title={process.title} subtitle={process.subtitle} />
            <div className="mt-16">
              <ProcessFlow steps={process.items} />
            </div>
          </div>
        </section>
      ) : null}

      {show("cta") ? (
        <CTASection
          title={s.cta.title}
          body={s.cta.body}
          primaryLabel={s.cta.primaryLabel}
          primaryHref={s.cta.primaryHref}
          secondaryLabel={s.cta.secondaryLabel}
          secondaryHref={s.cta.secondaryHref}
          whatsapp={settings.whatsapp}
          whatsappMessage={settings.whatsapp_default_message}
        />
      ) : null}
    </>
  );
}

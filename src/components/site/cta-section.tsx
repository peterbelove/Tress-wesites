import { ArrowRight, MessageCircle } from "lucide-react";
import { GlassButton } from "@/components/ui/glass";
import { Reveal } from "@/components/motion/reveal";
import { waLink } from "@/lib/utils";

export function CTASection({
  title = "LET'S ENGINEER SOMETHING BETTER.",
  body = "Tell us what you need to power, protect or improve.",
  primaryLabel = "Talk to TRES",
  primaryHref = "/contact",
  secondaryLabel = "Calculate Your Solar System",
  secondaryHref = "/solar-calculator",
  whatsapp,
  whatsappMessage,
}: {
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  whatsapp?: string;
  whatsappMessage?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="grid-lines-dark absolute inset-0" aria-hidden />
      <div className="absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-green/15 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 left-0 h-[28rem] w-[28rem] rounded-full bg-navy-500/30 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-40">
        <Reveal>
          <h2 className="display max-w-4xl text-4xl whitespace-pre-line md:text-6xl lg:text-7xl">{title}</h2>
          {body ? <p className="mt-6 max-w-xl text-lg text-white/70 md:text-xl">{body}</p> : null}
        </Reveal>
        <Reveal delay={0.15} className="mt-10 flex flex-wrap gap-3">
          {primaryLabel && primaryHref ? (
            <GlassButton href={primaryHref} variant="primary">
              {primaryLabel} <ArrowRight className="h-4 w-4" />
            </GlassButton>
          ) : null}
          {whatsapp ? (
            <GlassButton href={waLink(whatsapp, whatsappMessage)} variant="glass">
              <MessageCircle className="h-4 w-4" /> WhatsApp TRES
            </GlassButton>
          ) : null}
          {secondaryLabel && secondaryHref ? (
            <GlassButton href={secondaryHref} variant="outline-light">
              {secondaryLabel}
            </GlassButton>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

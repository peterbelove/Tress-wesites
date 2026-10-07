"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo, type LogoAssets } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export type NavLink = { label: string; href: string };
export type SubLink = { label: string; href: string; summary?: string };

const ease = [0.22, 1, 0.36, 1] as const;

export function Header({
  items,
  services,
  markets,
  ctaLabel,
  ctaHref,
  brand,
  logo,
}: {
  items: NavLink[];
  services: SubLink[];
  markets: SubLink[];
  ctaLabel: string;
  ctaHref: string;
  brand: string;
  logo: LogoAssets;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setMobileOpen(false);
      setOpen(null);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const subFor = useCallback(
    (href: string): SubLink[] | null => {
      if (href === "/services") return services;
      if (href === "/markets") return markets;
      return null;
    },
    [services, markets],
  );

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const solid = scrolled || mobileOpen;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const linkCls = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-[13px] font-medium whitespace-nowrap transition-colors xl:px-3.5 xl:text-sm",
      solid ? "hover:bg-navy/5" : "hover:bg-white/10",
      active && "underline decoration-green decoration-2 underline-offset-8",
    );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "py-2" : "py-4",
        )}
      >
        <div className="mx-auto max-w-[88rem] px-4 md:px-6">
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-full px-4 py-2 transition-all duration-500 md:px-5",
              solid ? "glass-strong text-navy" : "border border-transparent text-white",
            )}
          >
            <Logo tone={solid ? "dark" : "light"} brand={brand} {...logo} />

            {/* Desktop navigation — one line */}
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-0.5 xl:gap-1">
                {items.map((item) => {
                  const sub = subFor(item.href);
                  const active = isActive(item.href);
                  return (
                    <li
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => {
                        cancelClose();
                        if (sub) setOpen(item.href);
                      }}
                      onMouseLeave={scheduleClose}
                      onFocusCapture={() => {
                        cancelClose();
                        if (sub) setOpen(item.href);
                      }}
                    >
                      <Link
                        href={item.href}
                        aria-haspopup={sub ? "true" : undefined}
                        aria-expanded={sub ? open === item.href : undefined}
                        className={linkCls(active)}
                      >
                        {item.label}
                      </Link>

                      <AnimatePresence>
                        {sub && open === item.href ? (
                          <motion.div
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.28, ease }}
                            className="absolute top-full left-1/2 z-50 mt-3 w-[34rem] -translate-x-1/2"
                            onMouseEnter={cancelClose}
                            onMouseLeave={scheduleClose}
                          >
                            <div className="glass-strong rounded-2xl p-2 text-navy">
                              <ul className="grid grid-cols-2 gap-0.5">
                                {sub.map((s) => (
                                  <li key={s.href}>
                                    <Link
                                      href={s.href}
                                      className="group block rounded-xl px-4 py-3 transition-colors hover:bg-navy/5"
                                    >
                                      <span className="block text-sm font-medium">{s.label}</span>
                                      {s.summary ? (
                                        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-ink">
                                          {s.summary}
                                        </span>
                                      ) : null}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-1 border-t border-navy/10 px-4 pt-3 pb-2">
                                <Link
                                  href={item.href}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green"
                                >
                                  View all {item.label.toLowerCase()} <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={ctaHref || "/contact"}
                className={cn(
                  "hidden items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-all md:inline-flex xl:text-sm",
                  solid
                    ? "bg-navy text-white hover:bg-green-700"
                    : "border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-navy",
                )}
              >
                {ctaLabel || "Talk to TRES"} <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
                  solid ? "hover:bg-navy/5" : "hover:bg-white/10",
                )}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={reduce ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.5, ease }}
              className="glass-dark-strong absolute inset-x-3 top-[4.6rem] bottom-3 overflow-y-auto rounded-3xl p-6 text-white"
            >
              <motion.ul
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } }}
                className="space-y-1"
              >
                {items.map((item) => {
                  const sub = subFor(item.href);
                  const expanded = mobileSub === item.href;
                  return (
                    <motion.li
                      key={item.href}
                      variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                      className="border-b border-white/10"
                    >
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={cn(
                            "display flex-1 py-4 text-2xl",
                            isActive(item.href) ? "text-green-400" : "text-white",
                          )}
                        >
                          {item.label}
                        </Link>
                        {sub ? (
                          <button
                            type="button"
                            aria-expanded={expanded}
                            aria-label={`Toggle ${item.label} submenu`}
                            onClick={() => setMobileSub(expanded ? null : item.href)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
                          >
                            <ChevronDown className={cn("h-5 w-5 transition-transform", expanded && "rotate-180")} />
                          </button>
                        ) : null}
                      </div>
                      <AnimatePresence initial={false}>
                        {sub && expanded ? (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pb-3"
                          >
                            {sub.map((s) => (
                              <li key={s.href}>
                                <Link href={s.href} className="block py-2 pl-4 text-base text-white/75 hover:text-white">
                                  {s.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </motion.ul>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-6"
              >
                <Link href={ctaHref || "/contact"} className="btn-primary w-full">
                  {ctaLabel || "Talk to TRES"} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

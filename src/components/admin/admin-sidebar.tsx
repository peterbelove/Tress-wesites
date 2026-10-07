"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Calculator,
  FileText,
  Globe,
  Home,
  Images,
  Inbox,
  Info,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Navigation,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const groups = [
  { title: "", items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Content",
    items: [
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/about", label: "About & Legal", icon: Info },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/markets", label: "Markets", icon: Globe },
      { href: "/admin/projects", label: "Projects", icon: Briefcase },
      { href: "/admin/insights", label: "Insights", icon: FileText },
    ],
  },
  { title: "Media", items: [{ href: "/admin/media", label: "Media Library", icon: Images }] },
  { title: "Tools", items: [{ href: "/admin/calculator", label: "Solar Calculator", icon: Calculator }] },
  { title: "Communication", items: [{ href: "/admin/enquiries", label: "Enquiries", icon: Inbox }] },
  {
    title: "Settings",
    items: [
      { href: "/admin/navigation", label: "Navigation", icon: Navigation },
      { href: "/admin/settings?tab=contact", label: "Contact", icon: BarChart3 },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/settings", label: "Site Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar({ userName, logout }: { userName: string; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <LogoMark size={32} />
        <div>
          <div className="display text-sm tracking-[0.2em] text-navy">TRES</div>
          <div className="text-[10px] tracking-[0.2em] text-slate-ink uppercase">Admin</div>
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {groups.map((g) => (
          <div key={g.title || "root"}>
            {g.title ? <div className="eyebrow px-2 pb-2 text-slate-ink/60">{g.title}</div> : null}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const base = item.href.split("?")[0];
                const active = pathname === base || (base !== "/admin/dashboard" && pathname.startsWith(`${base}/`)) || (pathname === base && item.href === base);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        active ? "bg-navy text-white" : "text-navy hover:bg-navy/5",
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", active ? "text-green-400" : "text-slate-ink")} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-navy/10 p-4">
        <div className="mb-3 truncate text-xs text-slate-ink">{userName}</div>
        <div className="flex gap-2">
          <Link href="/" target="_blank" className="btn-outline flex-1 py-2 text-xs">View site</Link>
          <form action={logout}>
            <button type="submit" className="btn-outline py-2 text-xs" aria-label="Log out"><LogOut className="h-3.5 w-3.5" /></button>
          </form>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-navy/10 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2"><LogoMark size={28} /><span className="display text-sm tracking-[0.2em] text-navy">TRES ADMIN</span></div>
        <button type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu" className="rounded-lg p-2 hover:bg-navy/5">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">{nav}</aside>
        </div>
      ) : null}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-navy/10 bg-white lg:block">{nav}</aside>
    </>
  );
}

"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { waLink } from "@/lib/utils";

export function WhatsAppButton({ number, message }: { number: string; message?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!number) return null;
  return (
    <a
      href={waLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with TRES on WhatsApp"
      className={`fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full border border-white/20 bg-navy/85 px-4 py-3 text-sm font-medium text-white shadow-[0_12px_32px_-8px_rgba(4,12,26,0.6)] backdrop-blur-md transition-all duration-500 hover:bg-green md:right-6 md:bottom-6 md:px-3.5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <MessageCircle className="h-5 w-5" />
      <span className="md:sr-only">WhatsApp TRES</span>
    </a>
  );
}

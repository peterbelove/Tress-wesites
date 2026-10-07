import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "TRES — Engineering better lives through renewable energy and technology",
  description:
    "TRES engineers reliable renewable energy, electrical, smart security and automation systems across Nigeria — designed around your actual load, structure and budget.",
};

export const viewport: Viewport = {
  themeColor: "#0a1e3c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-white text-ink antialiased">{children}</body>
    </html>
  );
}

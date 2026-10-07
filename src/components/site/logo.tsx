import Link from "next/link";
import { cn } from "@/lib/utils";

/** Fallback mark used only until the official TRES logo is selected in Admin → Site Settings. */
export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <rect x="1" y="1" width="38" height="38" rx="10" className="fill-navy" />
      <path d="M10 11h20v5h-7.5v14h-5V16H10z" fill="#fff" />
      <path d="M27.5 19.5 23 28h3.6l-1.8 7 6.7-10.5h-3.7l1.9-5z" className="fill-green-500" />
    </svg>
  );
}

export type LogoAssets = {
  /** Primary mark (used on light / solid backgrounds). */
  logoUrl?: string | null;
  /** Variant for dark backgrounds; falls back to the primary mark. */
  logoLightUrl?: string | null;
  /** Show the "TRES" wordmark next to an uploaded mark. */
  showWordmark?: boolean;
};

export function Logo({
  tone = "dark",
  className,
  href = "/",
  brand = "TRES",
  logoUrl,
  logoLightUrl,
  showWordmark = true,
}: {
  tone?: "dark" | "light";
  className?: string;
  href?: string;
  brand?: string;
} & LogoAssets) {
  const src = tone === "light" ? logoLightUrl || logoUrl : logoUrl;
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)} aria-label={`${brand} — Home`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={showWordmark ? "" : brand} className="h-9 w-auto" />
      ) : (
        <LogoMark />
      )}
      {!src || showWordmark ? (
        <span
          className={cn(
            "display text-xl tracking-[0.18em]",
            tone === "light" ? "text-white" : "text-navy",
          )}
        >
          {brand}
        </span>
      ) : null}
    </Link>
  );
}

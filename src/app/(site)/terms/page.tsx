import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { buildMetadata } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/terms", title: "Terms of Use" });
}

export default function TermsPage() {
  return <LegalPage page="terms" crumb="Terms" />;
}

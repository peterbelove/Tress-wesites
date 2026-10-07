import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { buildMetadata } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ path: "/privacy", title: "Privacy Policy", noIndex: false });
}

export default function PrivacyPage() {
  return <LegalPage page="privacy" crumb="Privacy" />;
}

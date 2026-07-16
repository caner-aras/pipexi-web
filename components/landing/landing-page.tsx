"use client";

import { Montserrat, Poppins } from "next/font/google";
import type { AuthUser } from "@/types/auth";
import { cn } from "@/lib/utils";

// Import modular sections
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LandingFeatures } from "./landing-features";
import { LandingValueProp } from "./landing-value-prop";
import { LandingIntegrations } from "./landing-integrations";
import { LandingTestimonials } from "./landing-testimonials";
import { LandingPricing } from "./landing-pricing";
import { LandingUpdates } from "./landing-updates";
import { LandingFaq } from "./landing-faq";
import { LandingCta } from "./landing-cta";
import { LandingFooter } from "./landing-footer";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const NAV_LINKS = [
  { href: "#features", label: "Platform" },
  { href: "#solutions", label: "Solutions" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
] as const;

interface LandingPageProps {
  user: AuthUser | null;
}

export function LandingPage({ user }: LandingPageProps) {
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "Dashboard"
    : null;

  return (
    <div
      className={cn(
        montserrat.variable,
        poppins.variable,
        "landing min-h-screen bg-white text-zinc-900 selection:bg-[#e86a3d]/20 selection:text-[#e86a3d]",
        "font-[family-name:var(--font-poppins)] overflow-x-hidden"
      )}
    >
      <LandingHeader displayName={displayName} navLinks={NAV_LINKS} />

      <main>
        <LandingHero displayName={displayName} />
        <LandingFeatures />
        <LandingValueProp />
        <LandingIntegrations />
        <LandingTestimonials />
        <LandingPricing displayName={displayName} />
        <LandingUpdates />
        <LandingFaq />
        <LandingCta displayName={displayName} />
      </main>

      <LandingFooter navLinks={NAV_LINKS} />
    </div>
  );
}

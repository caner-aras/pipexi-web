import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "Free",
    period: "",
    detail: "Try out basic operations and communications for tiny teams.",
    highlights: [
      "1 organization (business)",
      "1 team limit",
      "Up to 3 active members limit",
      "Basic scheduling & messaging",
      "Basic time clock logging"
    ],
    featured: false,
  },
  {
    name: "Basic",
    price: "$2",
    period: "/user/mo",
    detail: "Essential operations and communications tools with active limits.",
    highlights: [
      "Essential Operations & Communications",
      "Up to 3 teams limit",
      "Up to 30 active members limit",
      "Geofenced time tracking & scheduling",
      "Direct 1-on-1 team messaging",
      "Basic files sharing & document viewing"
    ],
    featured: false,
  },
  {
    name: "Premium",
    price: "$3.5",
    period: "/user/mo",
    detail: "Advanced operations, communications, collaboration, and engagement tools with no limits.",
    highlights: [
      "Advanced Operations & Communications",
      "Unlimited teams (no limit)",
      "Unlimited active members (no limit)",
      "Company Wiki, Docs & Shared Calendars",
      "Heartbeat News Feed & Shoutouts",
      "Compliance checklists & photo reports",
      "Priority customer support & onboarding"
    ],
    featured: true,
  },
] as const;

interface LandingPricingProps {
  displayName: string | null;
}

export function LandingPricing({ displayName }: LandingPricingProps) {
  return (
    <section id="pricing" className="bg-[#FAFAFA] py-24 sm:py-32 border-b border-zinc-200/50">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Simple plans that scale
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-[2.5rem] p-10 transition-all duration-300 relative group bg-white border border-zinc-200/80 shadow-sm hover:shadow-xl hover:border-zinc-300",
                plan.featured && "ring-[3px] ring-[#e86a3d] shadow-2xl shadow-orange-500/10 hover:border-transparent scale-[1.02]"
              )}
            >
              {plan.featured && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#e86a3d] text-white text-[12px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-extrabold text-zinc-900">{plan.name}</h3>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-6xl font-black tracking-tight text-zinc-900">{plan.price}</span>
                <span className="text-base font-bold text-zinc-400">{plan.period}</span>
              </div>
              <p className="mt-4 text-[15px] font-semibold text-zinc-500 h-12">{plan.detail}</p>

              <ul className="mt-8 flex-1 space-y-4 border-t border-zinc-100 pt-8">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] font-bold text-zinc-700">
                    <Check className="size-5 text-[#e86a3d] shrink-0 bg-orange-50 rounded-full p-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={displayName ? "/dashboard" : "/register"}
                className={cn(
                  "mt-10 inline-flex h-14 items-center justify-center rounded-2xl px-6 text-base font-bold transition-all w-full",
                  plan.featured
                    ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg"
                    : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                )}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

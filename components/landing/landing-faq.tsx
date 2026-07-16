import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How many employees can I add to the Starter plan?",
    a: "Our free Starter plan supports up to 10 active team members, offering basic shift schedules, direct messaging, and geofenced time tracking features.",
  },
  {
    q: "Is there a contract required for paid subscriptions?",
    a: "No, all plans are billed monthly on a pay-as-you-go basis. You can upgrade, downgrade, or cancel your subscription at any time without extra fees.",
  },
  {
    q: "Does the time clock require an active GPS connection?",
    a: "Yes, when geofencing is enabled, employees must permit location access on their devices to clock in or out, ensuring they are physically present at the site.",
  },
  {
    q: "What tools does Pipexi replace?",
    a: "Pipexi consolidates shift schedules (Excel), task lists (Trello), time cards (paper logs), and team announcements into one cohesive, single workspace.",
  },
] as const;

export function LandingFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-[#FAFAFA] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl mb-12 text-center">
          Frequently asked questions
        </h2>

        <div className="space-y-4">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200/60 bg-white overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-6 text-left text-[17px] font-bold text-zinc-900"
                >
                  {item.q}
                  <span className={cn("shrink-0 size-8 rounded-full flex items-center justify-center transition-colors", isOpen ? "bg-zinc-100" : "bg-zinc-50")}>
                    {isOpen ? (
                      <ChevronDown className="size-4 text-[#e86a3d]" />
                    ) : (
                      <ChevronRight className="size-4 text-zinc-500" />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-[15px] font-semibold leading-relaxed text-zinc-600 border-t border-zinc-100 pt-5">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

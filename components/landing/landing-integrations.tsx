import Image from "next/image";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingIntegrations() {
  return (
    <section id="integrations" className="py-24 bg-zinc-950 text-white overflow-hidden text-center">
      <div className="mx-auto max-w-3xl px-6 mb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white mb-6 border border-white/10">
          <Globe className="size-4" /> Seamless Ecosystem
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">Connected integrations</h2>
        <p className="text-lg font-semibold text-zinc-400">
          Pipexi plays nicely with the payroll, HRIS, and accounting software you already use. Sync your data instantly without manual data entry.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-4">
        {[
          { name: "Stripe", src: "/assets/landing/integrations/stripe.png", aspect: "w-24 h-7" },
          { name: "Sage", src: "/assets/landing/integrations/sage.png", aspect: "w-24 h-7" },
          { name: "Xero", src: "/assets/landing/integrations/xero.png", aspect: "w-14 h-14" },
          { name: "QuickBooks", src: "/assets/landing/integrations/quickbooks.png", aspect: "w-32 h-9" },
          { name: "Google Cloud", src: "/assets/landing/integrations/google-cloud.png", aspect: "w-48 h-48" },
          { name: "LinkedIn", src: "/assets/landing/integrations/linkedin.png", aspect: "w-24 h-6" },
          { name: "Microsoft Azure", src: "/assets/landing/integrations/azure.png", aspect: "w-45 h-45" },
        ].map((tool, i) => (
          <div 
            key={i} 
            className="h-20 w-48 rounded-3xl bg-white border border-zinc-100 flex items-center justify-center p-4 hover:bg-zinc-50/80 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className={cn("relative w-full h-full flex items-center justify-center")}>
              <div className={cn("relative", tool.aspect)}>
                <Image 
                  src={tool.src} 
                  alt={`${tool.name} logo`} 
                  fill
                  sizes="(max-width: 768px) 100px, 150px"
                  className="object-contain"
                  priority={i < 4}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

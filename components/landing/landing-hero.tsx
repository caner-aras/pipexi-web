import { NavLink as Link } from "@/components/ui/nav-link";
import {
  ArrowRight,
  MessageSquare,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckSquare,
  Zap,
  Layers
} from "lucide-react";
import { LandingHeroCollage } from "./landing-hero-collage";

interface LandingHeroProps {
  displayName: string | null;
}

export function LandingHero({ displayName }: LandingHeroProps) {
  return (
    <section className="relative pt-44 pb-20 md:pt-52 md:pb-32 overflow-hidden bg-[#FAFAFA] border-b border-zinc-150">
      {/* Premium dot matrix background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(circle at 50% 30%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 30%, black 50%, transparent 100%)',
        }}
      />

      {/* Abstract Soft Glow Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(232,106,61,0.06)_0%,rgba(250,250,250,0)_70%)] blur-3xl" />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04)_0%,rgba(250,250,250,0)_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 md:px-8 flex flex-col items-center text-center">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/10 bg-orange-50/50 px-4 py-1.5 text-xs font-semibold text-[#e86a3d] mb-8 shadow-sm backdrop-blur-sm">
          <Zap className="size-3.5 fill-current" />
          <span>The Unified App for Frontline & Deskless Teams</span>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-5xl font-black tracking-tight text-zinc-900 sm:text-7xl leading-[1.15]">
          One app to manage <br />
          <span className="bg-gradient-to-r from-[#e86a3d] to-[#ff8c61] bg-clip-text text-transparent">
            frontline operations.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 max-w-3xl text-lg sm:text-[21px] font-medium leading-relaxed text-zinc-500">
          Replace fragmented WhatsApp chats, scattered Excel schedules, and paper time cards. Pipexi brings scheduling, time tracking, task management, and team communication into one beautiful workspace.
        </p>

        {/* CTA Button */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={displayName ? "/dashboard" : "/login"}
            className="group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#e86a3d] px-8 text-[17px] font-bold text-white transition-all hover:bg-[#d05c31] hover:shadow-xl hover:shadow-[#e86a3d]/20 hover:-translate-y-0.5"
          >
            <span className="relative z-10">{displayName ? "Open workspace" : "Create your free workspace"}</span>
            <ArrowRight className="relative z-10 size-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Core Capabilities Ribbon */}
        <div className="mt-20 max-w-4xl mx-auto w-full px-4 mb-16">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-400 mb-6">Core Capabilities</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { label: "Messages", icon: MessageSquare },
              { label: "Scheduling", icon: Calendar },
              { label: "Time Clock", icon: Clock },
              { label: "Team Management", icon: Users },
              { label: "Custom Forms", icon: FileText },
              { label: "Task Lists", icon: CheckSquare },
              { label: "Announcements", icon: Zap },
              { label: "Knowledge Base", icon: Layers },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[14px] font-semibold border border-zinc-200/80 bg-white text-zinc-650 transition-all cursor-default shadow-sm hover:border-[#e86a3d]/30 hover:text-zinc-900 hover:scale-[1.02]"
                >
                  <Icon className="size-4 text-[#e86a3d]" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hero Dashboard Collage */}
        <div className="mt-8 w-full max-w-[1100px] relative z-10">
          <LandingHeroCollage />
        </div>

      </div>
    </section>
  );
}

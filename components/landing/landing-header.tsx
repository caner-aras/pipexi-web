import { ArrowRight } from "lucide-react";
import { BrandLogo } from "./brand-logo";

interface LandingHeaderProps {
  displayName: string | null;
  navLinks: readonly { readonly href: string; readonly label: string }[];
}

export function LandingHeader({ displayName, navLinks }: LandingHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100/80 transition-all duration-300">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 md:px-8">
        <a href="/" aria-label="Pipexi home" className="shrink-0 transition-transform duration-300 hover:scale-[1.02]">
          <BrandLogo />
        </a>

        <nav className="hidden items-center gap-10 text-[15px] font-bold text-zinc-600 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[#e86a3d]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {displayName ? (
            <a
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-[15px] font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20"
            >
              <span>{displayName}</span>
              <ArrowRight className="size-4" />
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="hidden md:inline-flex h-11 items-center justify-center rounded-xl px-5 text-[15px] font-bold text-zinc-600 transition hover:text-zinc-900 hover:bg-zinc-50"
              >
                Log in
              </a>
              <a
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#e86a3d] px-6 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-[#d05c31] hover:scale-105 hover:shadow-md hover:shadow-[#e86a3d]/20"
              >
                Start for free
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

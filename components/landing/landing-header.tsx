"use client";

import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { BrandLogo } from "./brand-logo";

interface LandingHeaderProps {
  displayName: string | null;
  navLinks: readonly { readonly href: string; readonly label: string }[];
}

export function LandingHeader({ displayName, navLinks }: LandingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
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
                className="inline-flex h-11 items-center justify-center rounded-xl px-5 text-[15px] font-bold text-zinc-600 transition hover:text-zinc-900 hover:bg-zinc-50"
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

        {/* Mobile Menu Action & Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          {displayName ? (
            <a
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white"
            >
              Dashboard
            </a>
          ) : (
            <a
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-xl bg-[#e86a3d] px-4 text-xs font-bold text-white"
            >
              Start free
            </a>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/85 bg-white text-zinc-650 hover:bg-zinc-50"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-6 py-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-extrabold text-zinc-600 transition hover:text-[#e86a3d] py-1"
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-zinc-100" />
            {!displayName && (
              <div className="flex flex-col gap-3">
                <a
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50"
                >
                  Log in
                </a>
                <a
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-xl bg-[#e86a3d] text-sm font-bold text-white hover:bg-[#d05c31]"
                >
                  Start for free
                </a>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

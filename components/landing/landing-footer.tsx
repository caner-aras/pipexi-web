import { BrandLogo } from "./brand-logo";

interface LandingFooterProps {
  navLinks: readonly { readonly href: string; readonly label: string }[];
}

export function LandingFooter({ navLinks }: LandingFooterProps) {
  return (
    <footer className="bg-white border-t border-zinc-200/50">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <BrandLogo />

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[15px] font-bold text-zinc-500">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-zinc-900 transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          <div className="text-sm font-bold text-zinc-400">
            © {new Date().getFullYear()} Pipexi. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

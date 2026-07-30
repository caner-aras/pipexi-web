import { NavLink as Link } from "@/components/ui/nav-link";

interface LandingCtaProps {
  displayName: string | null;
}

export function LandingCta({ displayName }: LandingCtaProps) {
  return (
    <section className="py-24 sm:py-32 px-6 bg-card">
      <div className="mx-auto max-w-6xl rounded-[3rem] bg-foreground p-10 sm:p-20 text-center relative overflow-hidden shadow-2xl">
        {/* Abstract Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] rounded-full bg-gradient-to-r from-brand/20 to-emerald-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold tracking-tight text-background sm:text-6xl">
            Ready to transform your operations?
          </h2>
          <p className="text-lg font-semibold text-muted-foreground">
            Join modern businesses using Pipexi to schedule, track, and pay their teams in a fraction of the time.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={displayName ? "/dashboard" : "/login"}
              className="inline-flex h-14 items-center justify-center rounded-full bg-brand px-8 text-base font-bold text-brand-foreground transition-all hover:bg-brand-hover hover:scale-105 w-full sm:w-auto shadow-lg shadow-brand/30"
            >
              Create your workspace
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full bg-card/10 px-8 text-base font-bold text-background transition-all hover:bg-card/20 w-full sm:w-auto backdrop-blur-md"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

interface LandingCtaProps {
  displayName: string | null;
}

export function LandingCta({ displayName }: LandingCtaProps) {
  return (
    <section className="py-24 sm:py-32 px-6 bg-white">
      <div className="mx-auto max-w-6xl rounded-[3rem] bg-zinc-950 p-10 sm:p-20 text-center relative overflow-hidden shadow-2xl">
        {/* Abstract Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] rounded-full bg-gradient-to-r from-[#e86a3d]/20 to-emerald-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Ready to transform your operations?
          </h2>
          <p className="text-lg font-semibold text-zinc-400">
            Join modern businesses using Pipexi to schedule, track, and pay their teams in a fraction of the time.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={displayName ? "/dashboard" : "/login"}
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#e86a3d] px-8 text-base font-bold text-white transition-all hover:bg-[#d05c31] hover:scale-105 w-full sm:w-auto shadow-[0_0_40px_rgba(232,106,61,0.3)]"
            >
              Create your workspace
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-white/10 px-8 text-base font-bold text-white transition-all hover:bg-white/20 w-full sm:w-auto backdrop-blur-md"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

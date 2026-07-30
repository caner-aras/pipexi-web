import { Users, Layers, Zap } from "lucide-react";

export function LandingValueProp() {
  return (
    <section className="py-24 sm:py-32 bg-muted border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl mb-6">Why teams choose Pipexi</h2>
          <p className="text-xl font-semibold text-muted-foreground">
            Whether you manage one location or many, retail stores, restaurants, or construction sites, Pipexi helps everyone stay connected.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card rounded-[2rem] p-10 border border-border/60 shadow-sm hover:shadow-lg transition-shadow">
            <div className="size-14 rounded-2xl bg-foreground text-background flex items-center justify-center mb-6">
              <Users className="size-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-4">Employee management made simple.</h3>
            <p className="text-base font-semibold text-muted-foreground leading-relaxed">
              Managing staff shouldn&apos;t mean toggling between email, spreadsheets, and private messaging apps. Pipexi gives managers a single command center to publish schedules, send alerts, and track tasks.
            </p>
          </div>

          <div className="bg-card rounded-[2rem] p-10 border border-border/60 shadow-sm hover:shadow-lg transition-shadow">
            <div className="size-14 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center mb-6">
              <Layers className="size-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-4">One platform, tailored spaces.</h3>
            <p className="text-base font-semibold text-muted-foreground leading-relaxed">
              Create dedicated digital spaces for each branch, store, or department. Inside each space, activate only the tools that specific team needs, keeping it perfectly clean and simple for everyone.
            </p>
          </div>

          <div className="bg-card rounded-[2rem] p-10 border border-border/60 shadow-sm hover:shadow-lg transition-shadow">
            <div className="size-14 rounded-2xl bg-emerald-500 text-background flex items-center justify-center mb-6">
              <Zap className="size-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-foreground mb-4">One app. Zero training needed.</h3>
            <p className="text-base font-semibold text-muted-foreground leading-relaxed">
              It’s easy to set up, simple for employees to understand, and ready to use in minutes. No long implementation, no complex training sessions. Just invite your team and start working.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

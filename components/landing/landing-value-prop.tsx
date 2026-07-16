import { Users, Layers, Zap } from "lucide-react";

export function LandingValueProp() {
  return (
    <section className="py-24 sm:py-32 bg-[#FAFAFA] border-t border-zinc-200/50">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight sm:text-5xl mb-6">Why teams choose Pipexi</h2>
          <p className="text-xl font-semibold text-zinc-500">
            Whether you manage one location or many, retail stores, restaurants, or construction sites, Pipexi helps everyone stay connected.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-[2rem] p-10 border border-zinc-200/60 shadow-sm hover:shadow-lg transition-shadow">
            <div className="size-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-6">
              <Users className="size-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 mb-4">Employee management made simple.</h3>
            <p className="text-base font-semibold text-zinc-500 leading-relaxed">
              Managing staff shouldn&apos;t mean toggling between email, spreadsheets, and private messaging apps. Pipexi gives managers a single command center to publish schedules, send alerts, and track tasks.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-10 border border-zinc-200/60 shadow-sm hover:shadow-lg transition-shadow">
            <div className="size-14 rounded-2xl bg-[#e86a3d] text-white flex items-center justify-center mb-6">
              <Layers className="size-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 mb-4">One platform, tailored spaces.</h3>
            <p className="text-base font-semibold text-zinc-500 leading-relaxed">
              Create dedicated digital spaces for each branch, store, or department. Inside each space, activate only the tools that specific team needs, keeping it perfectly clean and simple for everyone.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-10 border border-zinc-200/60 shadow-sm hover:shadow-lg transition-shadow">
            <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-6">
              <Zap className="size-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-zinc-900 mb-4">One app. Zero training needed.</h3>
            <p className="text-base font-semibold text-zinc-500 leading-relaxed">
              It’s easy to set up, simple for employees to understand, and ready to use in minutes. No long implementation, no complex training sessions. Just invite your team and start working.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

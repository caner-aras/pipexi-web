const TESTIMONIALS = [
  { quote: "It replaced our messy WhatsApp groups and 4 different Excel sheets. Our team actually knows when they are working now.", author: "Sarah J.", role: "Store Manager" },
  { quote: "The geofenced time clock alone saved us thousands in payroll discrepancies in the first month.", author: "David C.", role: "Operations Director" },
  { quote: "Finally, an app that frontline workers don't need a manual to understand. It took 5 minutes to onboard my entire staff.", author: "Elena M.", role: "HR Head" },
  { quote: "We use the custom forms for daily store opening checklists. I can see exactly what was missed from my phone.", author: "Marcus T.", role: "Retail Owner" },
  { quote: "Pipexi gave us our sanity back. Shift swapping used to be a nightmare, now it's automated and seamless.", author: "Jessica R.", role: "Restaurant GM" },
  { quote: "Having all company announcements in one feed where I can see who read them is an absolute game-changer.", author: "Tom W.", role: "Internal Comms" },
  { quote: "We run 15 different locations. Being able to create separate workspaces for each branch keeps everything organized.", author: "Samantha K.", role: "Regional Manager" },
  { quote: "Tasks no longer slip through the cracks. The automated reminders keep the closing shift fully accountable.", author: "Liam P.", role: "Hotel Supervisor" },
  { quote: "Our staff loves how fast they can request leave and check their schedules. Engagement went up by 80%.", author: "Olivia S.", role: "Operations Lead" },
  { quote: "I can assign shifts in minutes instead of spending my entire Sunday evening balancing schedules.", author: "Chloe B.", role: "Cafe Manager" },
  { quote: "Being able to upload safety videos and verify who watched them is critical for our compliance audits.", author: "Daniel H.", role: "HSE Coordinator" },
  { quote: "The dashboard is beautiful and intuitive. I've never used a workforce tool that felt this premium.", author: "Sophia F.", role: "VP of People" },
  { quote: "No more phone tag. When a shift needs coverage, managers just push a request and members grab it.", author: "Ethan K.", role: "Logistics Manager" },
  { quote: "Our field team clocks in with GPS location tracking. We finally have 100% accurate time logs.", author: "Andrew M.", role: "Construction Partner" },
  { quote: "The announcements feed makes our remote workers feel like they are actually part of the core team.", author: "Isabella V.", role: "Culture Lead" },
  { quote: "Creating custom inspection check forms only took us 2 minutes. The team submits them directly on site.", author: "Tyler G.", role: "Facility Manager" },
  { quote: "It pays for itself. The time saved on manager admin duties alone makes this a no-brainer.", author: "Grace D.", role: "Franchise Owner" },
  { quote: "Perfect UI design, rich features, and extremely responsive. Best deskless HR platform on the market.", author: "Noah B.", role: "SaaS Reviewer" },
  { quote: "Getting team read-receipts on emergency shift changes prevents compliance errors.", author: "Mia L.", role: "Nurse Manager" },
  { quote: "Our employees love shift-swapping. They just trade directly in-app, saving managers tons of overhead.", author: "William S.", role: "Fitness Studio GM" },
  { quote: "Checklists with photo uploads mean I can verify cleaning standards remotely without visiting stores.", author: "Charlotte R.", role: "District Manager" },
  { quote: "The leave management system is beautifully simple. It syncs directly to the active scheduling board.", author: "James F.", role: "HR Generalist" },
  { quote: "Finally, a mobile app that doesn't crash or lag. My retail crew uses it multiple times a day.", author: "Amelia C.", role: "Brand Manager" },
  { quote: "Transitioning from paper schedules to Pipexi was the best decision we made all year.", author: "Benjamin T.", role: "Brewery Owner" }
];

export function LandingTestimonials() {
  return (
    <section className="py-24 sm:py-32 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8 mb-16 text-center">
        <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight sm:text-5xl mb-6">Loved by thousands of operators</h2>
        <p className="text-xl font-semibold text-zinc-500 max-w-2xl mx-auto">
          From independent cafes to regional health facilities, teams rely on Pipexi to run their workdays cleanly.
        </p>
      </div>

      <div className="relative flex flex-col gap-6 w-full overflow-hidden">
        {/* Row 1 - Left to Right */}
        <div className="flex w-max gap-6 animate-marquee">
          <div className="flex gap-6 shrink-0">
            {TESTIMONIALS.slice(0, 12).map((t, idx) => (
              <div
                key={idx}
                className="w-[380px] rounded-3xl bg-white border border-zinc-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                     ))}
                  </div>
                  <p className="text-[15px] font-semibold text-zinc-700 leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{t.author}</div>
                      <div className="text-[13px] font-bold text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless looping */}
          <div className="flex gap-6 shrink-0" aria-hidden="true">
            {TESTIMONIALS.slice(0, 12).map((t, idx) => (
              <div
                key={`dup1-${idx}`}
                className="w-[380px] rounded-3xl bg-white border border-zinc-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                     ))}
                  </div>
                  <p className="text-[15px] font-semibold text-zinc-700 leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{t.author}</div>
                      <div className="text-[13px] font-bold text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex w-max gap-6 animate-marquee-reverse">
          <div className="flex gap-6 shrink-0">
            {TESTIMONIALS.slice(12, 24).map((t, idx) => (
              <div
                key={idx}
                className="w-[380px] rounded-3xl bg-white border border-zinc-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[15px] font-semibold text-zinc-700 leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{t.author}</div>
                      <div className="text-[13px] font-bold text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Duplicate set for seamless looping */}
          <div className="flex gap-6 shrink-0" aria-hidden="true">
            {TESTIMONIALS.slice(12, 24).map((t, idx) => (
              <div
                key={`dup2-${idx}`}
                className="w-[380px] rounded-3xl bg-white border border-zinc-200/60 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="size-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[15px] font-semibold text-zinc-700 leading-relaxed mb-6">&quot;{t.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-500">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">{t.author}</div>
                      <div className="text-[13px] font-bold text-zinc-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

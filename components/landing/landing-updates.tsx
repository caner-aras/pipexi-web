import Link from "next/link";

export function LandingUpdates() {
  return (
    <section className="py-24 bg-white border-b border-zinc-100">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl">Updates from us</h2>
          <Link href="/" className="hidden sm:inline-flex text-[#e86a3d] font-bold hover:underline">View all articles</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "The ultimate guide to frontline retention in 2026", cat: "Guides" },
            { title: "How we built the new smart schedule auto-assigner", cat: "Product" },
            { title: "Why paper checklists are costing your retail business", cat: "Insights" }
          ].map((blog, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-[16/10] rounded-2xl bg-zinc-100 border border-zinc-200 mb-6 overflow-hidden">
                <div className="w-full h-full bg-zinc-200/50 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <span className="text-sm font-bold text-[#e86a3d] uppercase tracking-wider">{blog.cat}</span>
              <h3 className="text-xl font-extrabold text-zinc-900 mt-2 group-hover:text-[#e86a3d] transition-colors">{blog.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

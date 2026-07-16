import { cn } from "@/lib/utils";

interface DashboardMockupProps {
  className?: string;
}

export function DashboardMockup({ className }: DashboardMockupProps) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] sm:aspect-[21/10] w-full rounded-[2rem] border border-zinc-200/80 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col ring-1 ring-zinc-900/5",
        className
      )}
    >
      {/* Mock Mac Header */}
      <div className="h-12 border-b border-zinc-100 bg-zinc-50/80 flex items-center px-5 gap-5">
        <div className="flex gap-2.5">
          <div className="size-3 rounded-full bg-[#ff5f56]" />
          <div className="size-3 rounded-full bg-[#ffbd2e]" />
          <div className="size-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="h-6 w-72 bg-white rounded-md border border-zinc-200/60 shadow-sm flex items-center px-3">
            <div className="h-2 w-32 bg-zinc-200 rounded-full" />
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* Mock Dashboard Layout */}
      <div className="flex flex-1 overflow-hidden bg-zinc-50/30">
        {/* Sidebar Placeholder */}
        <div className="hidden md:flex w-64 border-r border-zinc-100 bg-white/50 flex-col p-5 gap-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-lg bg-[#e86a3d]/10 border border-[#e86a3d]/20" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 bg-zinc-200 rounded-full" />
              <div className="h-2 w-16 bg-zinc-100 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-8 w-full bg-zinc-100/80 rounded-lg" />
            <div className="h-8 w-full bg-zinc-50 rounded-lg" />
            <div className="h-8 w-5/6 bg-zinc-50 rounded-lg" />
            <div className="h-8 w-4/5 bg-zinc-50 rounded-lg" />
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-3 w-16 bg-zinc-200 rounded-full mb-4" />
            <div className="h-8 w-full bg-zinc-50 rounded-lg" />
            <div className="h-8 w-full bg-zinc-50 rounded-lg" />
          </div>
        </div>

        {/* Main Content Placeholder */}
        <div className="flex-1 p-8 flex flex-col gap-8 bg-zinc-50/50">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-zinc-200 rounded-lg" />
              <div className="h-3 w-64 bg-zinc-100 rounded-full" />
            </div>
            <div className="h-10 w-32 bg-[#e86a3d] rounded-xl shadow-sm shadow-orange-500/20" />
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="h-32 rounded-2xl bg-white border border-zinc-200/60 shadow-sm p-5 flex flex-col justify-between">
              <div className="h-3 w-20 bg-emerald-100 rounded-full" />
              <div className="h-10 w-24 bg-emerald-50 rounded-xl border border-emerald-100/50" />
            </div>
            <div className="h-32 rounded-2xl bg-white border border-zinc-200/60 shadow-sm p-5 flex flex-col justify-between">
              <div className="h-3 w-24 bg-orange-100 rounded-full" />
              <div className="h-10 w-32 bg-orange-50 rounded-xl border border-orange-100/50" />
            </div>
            <div className="h-32 rounded-2xl bg-white border border-zinc-200/60 shadow-sm p-5 flex flex-col justify-between">
              <div className="h-3 w-16 bg-blue-100 rounded-full" />
              <div className="h-10 w-20 bg-blue-50 rounded-xl border border-blue-100/50" />
            </div>
          </div>

          <div className="flex-1 rounded-2xl bg-white border border-zinc-200/60 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex justify-between border-b border-zinc-100 pb-4">
              <div className="h-4 w-32 bg-zinc-200 rounded-full" />
              <div className="h-4 w-16 bg-zinc-100 rounded-full" />
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex-1 bg-zinc-50 rounded-xl border border-zinc-100/80" />
              <div className="flex-1 bg-zinc-50 rounded-xl border border-zinc-100/80" />
              <div className="flex-1 bg-zinc-50 rounded-xl border border-zinc-100/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

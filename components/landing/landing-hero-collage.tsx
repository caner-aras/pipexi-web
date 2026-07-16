import Image from "next/image";
import {
  Calendar,
  Clock,
  CheckSquare,
  MessageSquare,
  Heart,
  MessageCircle,
  ThumbsUp,
  BookOpen,
  Shirt,
  Palmtree,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LandingHeroCollage() {
  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto flex items-center justify-center overflow-visible select-none">
      
      {/* 1. Decorative Glow Blobs */}
      <div className="absolute -inset-10 bg-gradient-to-tr from-orange-400/20 to-emerald-400/20 blur-[100px] rounded-full pointer-events-none" />

      {/* 2. Central Masked Image (Frontline worker looking at phone) */}
      <div 
        className="relative w-[340px] h-[480px] bg-zinc-100 shadow-2xl overflow-hidden z-10 transition-transform duration-500 hover:scale-[1.01]"
        style={{ borderRadius: "120px 120px 80px 160px" }}
      >
        <Image
          src="/assets/landing/frontline-worker.png"
          alt="Pipexi frontline employee"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 3. Floating Widget Collage (Desktop Absolute, Hidden on Mobile/Tablet for layout safety) */}
      
      {/* WIDGET 1: Shift Schedule (Top Left) */}
      <div className="hidden lg:flex absolute top-[-5%] left-[-15%] w-[240px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-4 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex gap-2.5 items-center">
          <div className="size-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
            <Calendar className="size-4" />
          </div>
          <div>
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Shift Schedule</div>
            <div className="text-xs font-extrabold text-zinc-900">Mon • Nov 18</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="text-[10px] font-black text-zinc-400 uppercase">Today</div>
          <div className="flex items-center justify-between p-2.5 bg-orange-50/50 rounded-xl border border-orange-100/50">
            <div>
              <div className="text-[11px] font-extrabold text-zinc-900">Morning Reception</div>
              <div className="text-[9px] font-bold text-zinc-400">9:00 AM – 5:00 PM</div>
            </div>
            <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">On</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div>
              <div className="text-[11px] font-extrabold text-zinc-900">Evening Bar</div>
              <div className="text-[9px] font-bold text-zinc-400">6:00 PM – 11:00 PM</div>
            </div>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">2 staff</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-[10px] font-black text-zinc-400 uppercase">Tomorrow</div>
          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div>
              <div className="text-[11px] font-extrabold text-zinc-900">Brunch Service</div>
              <div className="text-[9px] font-bold text-zinc-400">10:00 AM – 4:00 PM</div>
            </div>
            <span className="text-[9px] font-bold text-yellow-750 bg-yellow-50 px-2 py-0.5 rounded-md">3 staff</span>
          </div>
        </div>
      </div>

      {/* WIDGET 2: Team Form (Middle Left) */}
      <div className="hidden lg:flex absolute top-[36%] left-[-22%] w-[230px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex gap-2.5 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Shirt className="size-4 text-blue-600" />
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Team Form</div>
          </div>
          <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">New</span>
        </div>
        
        <div className="text-[13px] font-extrabold text-zinc-900 leading-tight">Uniform Size</div>

        <div className="space-y-2">
          <div>
            <label className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Your Name</label>
            <div className="h-8 rounded-lg bg-zinc-50 border border-zinc-200/80 flex items-center px-3 text-[11px] font-bold text-zinc-900">
              Sarah Johnson
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-zinc-400 uppercase block mb-1">T-Shirt Size</label>
            <div className="h-8 rounded-lg border border-orange-500 bg-white flex items-center justify-between px-3 text-[11px] font-bold text-zinc-400">
              <span>Select size...</span>
              <span className="text-orange-500">|</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 justify-between">
          {["S", "M", "L", "XL"].map((sz) => (
            <div
              key={sz}
              className={cn(
                "size-8 rounded-lg border flex items-center justify-center text-[10px] font-black cursor-pointer transition-colors",
                sz === "L"
                  ? "border-orange-500 text-orange-500 bg-orange-50/30"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
              )}
            >
              {sz}
            </div>
          ))}
        </div>

        <button className="w-full h-9 rounded-xl bg-zinc-950 text-white text-[11px] font-extrabold tracking-wide hover:bg-zinc-800 transition-colors mt-1">
          Submit →
        </button>
      </div>

      {/* WIDGET 3: Time Off Approved (Bottom Left) */}
      <div className="hidden lg:flex absolute bottom-[-5%] left-[-12%] w-[230px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3.5 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Palmtree className="size-4 text-emerald-600" />
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Time Off</div>
          </div>
          <div className="size-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="size-3" />
          </div>
        </div>

        <div className="text-[13px] font-extrabold text-zinc-900 leading-tight">Approved!</div>

        <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-1">
          <div className="text-[11px] font-extrabold text-zinc-900">Dec 24 – Dec 26</div>
          <div className="text-[9px] font-bold text-zinc-400">3 days • Holiday leave</div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
          <div className="size-6 rounded-full bg-orange-500 flex items-center justify-center text-[9px] font-black text-white">M</div>
          <span className="text-[10px] font-bold text-zinc-500">Approved by Manager</span>
        </div>
      </div>

      {/* WIDGET 4: My Tasks (Top Center) */}
      <div className="hidden lg:flex absolute top-[-8%] left-[45%] -translate-x-1/2 w-[220px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <CheckSquare className="size-4 text-emerald-500" />
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">My Tasks</div>
          </div>
          <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">Today</span>
        </div>

        <div className="text-[13px] font-extrabold text-zinc-900 leading-tight">3 remaining</div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-orange-500 shrink-0" />
              <span className="text-[11px] font-extrabold text-zinc-800">Restock bar supplies</span>
            </div>
            <span className="text-[8px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-md">High</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-zinc-300 shrink-0" />
              <span className="text-[11px] font-extrabold text-zinc-800">Update menu boards</span>
            </div>
            <span className="text-[8px] font-bold text-zinc-500 bg-zinc-200/60 px-1.5 py-0.5 rounded-md">3pm</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 opacity-40">
            <span className="size-4 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0"><Check className="size-2.5" /></span>
            <span className="text-[11px] font-extrabold text-zinc-800 line-through">Morning briefing</span>
          </div>
        </div>
      </div>

      {/* WIDGET 5: Wiki Knowledge Base (Bottom Center) */}
      <div className="hidden lg:flex absolute bottom-[-8%] left-[50%] -translate-x-1/2 w-[220px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <BookOpen className="size-4 text-blue-500" />
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Wiki</div>
          </div>
          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">New</span>
        </div>

        <div className="text-[13px] font-extrabold text-zinc-900 leading-tight">Knowledge Base</div>

        <div className="space-y-2">
          <div className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center gap-2.5">
            <span className="size-2 bg-orange-400 rounded-full" />
            <div>
              <div className="text-[11px] font-extrabold text-zinc-900">Opening Procedures</div>
              <div className="text-[8px] font-bold text-zinc-400">Updated 2h ago</div>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center gap-2.5">
            <span className="size-2 bg-emerald-400 rounded-full" />
            <div>
              <div className="text-[11px] font-extrabold text-zinc-900">Health & Safety Guide</div>
              <div className="text-[8px] font-bold text-zinc-400">Pinned by manager</div>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET 6: Team Chat (Top Right) */}
      <div className="hidden lg:flex absolute top-[-5%] right-[-15%] w-[220px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <MessageSquare className="size-4 text-orange-500" />
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Team Chat</div>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="bg-zinc-100 rounded-2xl rounded-tl-none p-3 text-[11px] font-semibold text-zinc-700 leading-normal">
            Can someone cover the 3pm slot? 🙏
          </div>

          <div className="bg-zinc-950 text-white rounded-2xl rounded-tr-none p-3 text-[11px] font-semibold leading-normal ml-auto w-5/6 shadow-sm">
            I got it! Clocking in now ✅
          </div>
        </div>
      </div>

      {/* WIDGET 7: Sarah Manager Feed Post (Middle Right) */}
      <div className="hidden lg:flex absolute top-[36%] right-[-22%] w-[240px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-4.5 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-black text-white">M</div>
          <div>
            <div className="text-xs font-extrabold text-zinc-900">Sarah • Manager</div>
            <div className="text-[9px] font-bold text-zinc-400">2 hours ago</div>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-zinc-650 leading-relaxed bg-zinc-50 border border-zinc-100 rounded-2xl p-3.5">
          🙌 Well done everyone! Amazing work this week — the team really showed up. So proud of you all!
        </p>

        <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-zinc-400">
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><Heart className="size-3 text-red-500 fill-current" /> 24</span>
            <span className="flex items-center gap-1"><MessageCircle className="size-3" /> 8</span>
          </div>
          <button className="flex items-center gap-1 text-orange-600 hover:underline">
            <ThumbsUp className="size-3" /> Like
          </button>
        </div>
      </div>

      {/* WIDGET 8: Clock In (Bottom Right) */}
      <div className="hidden lg:flex absolute bottom-[-5%] right-[-12%] w-[220px] rounded-3xl bg-white border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3.5 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Clock className="size-4 text-orange-600" />
            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Clock In</div>
          </div>
          <span className="text-[10px] font-black text-zinc-900">9:02 AM</span>
        </div>

        <div className="text-[11px] font-bold text-zinc-400">Front Desk • Floor 2</div>

        <button className="w-full h-11 rounded-2xl bg-zinc-950 text-white text-xs font-extrabold tracking-wide hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-md">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          Clock In Now
        </button>
      </div>

      {/* 4. Mobile layout fallback (renders widgets in a clean horizontal swipe block instead of breaking absolute stage) */}
      <div className="lg:hidden w-full flex flex-col gap-6 mt-6 z-20">
        <div className="text-xs font-black text-zinc-400 uppercase tracking-wider text-center">Platform Widget Previews</div>
        <div className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-none snap-x">
          
          <div className="snap-center shrink-0 w-[240px] rounded-3xl bg-white border border-zinc-200/80 shadow-lg p-5">
            {/* Shift schedule preview */}
            <div className="flex gap-2.5 items-center mb-4">
              <div className="size-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100"><Calendar className="size-4" /></div>
              <div>
                <div className="text-[9px] font-black text-zinc-400 uppercase">Schedule</div>
                <div className="text-xs font-extrabold text-zinc-900">Mon • Nov 18</div>
              </div>
            </div>
            <div className="p-2.5 bg-orange-50/50 rounded-xl border border-orange-100/50 flex justify-between items-center text-left">
              <div>
                <div className="text-[11px] font-extrabold">Morning Shift</div>
                <div className="text-[9px] text-zinc-400">9:00 AM – 5:00 PM</div>
              </div>
              <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">On</span>
            </div>
          </div>

          <div className="snap-center shrink-0 w-[220px] rounded-3xl bg-white border border-zinc-200/80 shadow-lg p-5 text-left">
            {/* Task preview */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 items-center">
                <CheckSquare className="size-4 text-emerald-500" />
                <div className="text-[9px] font-black text-zinc-400 uppercase">My Tasks</div>
              </div>
              <span className="text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">3 left</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[10px] font-extrabold">Restock bar supplies</span>
              <span className="text-[8px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-md">High</span>
            </div>
          </div>

          <div className="snap-center shrink-0 w-[220px] rounded-3xl bg-white border border-zinc-200/80 shadow-lg p-5 text-left">
            {/* Clock-in preview */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 items-center">
                <Clock className="size-4 text-orange-600" />
                <div className="text-[9px] font-black text-zinc-400 uppercase">Clock In</div>
              </div>
              <span className="text-[10px] font-black text-zinc-900">9:02 AM</span>
            </div>
            <button className="w-full h-10 rounded-xl bg-zinc-950 text-white text-[11px] font-extrabold flex items-center justify-center gap-2">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              Clock In Now
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

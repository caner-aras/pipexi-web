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
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center overflow-visible select-none min-h-[420px] sm:min-h-[500px] lg:aspect-square">
      
      {/* 1. Decorative Glow Blobs */}
      <div className="absolute -inset-10 bg-gradient-to-tr from-brand/20 to-emerald-400/20 blur-[100px] rounded-full pointer-events-none" />

      {/* 2. Central Masked Image (Frontline worker looking at phone) */}
      <div 
        className="relative w-[280px] h-[390px] sm:w-[340px] sm:h-[480px] max-w-full bg-muted shadow-2xl overflow-hidden z-10 transition-transform duration-500 hover:scale-[1.01]"
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
      <div className="hidden xl:flex absolute top-[-5%] left-[-15%] w-[240px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-4 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex gap-2.5 items-center">
          <div className="size-8 rounded-xl bg-brand/5 flex items-center justify-center text-brand border border-brand/15">
            <Calendar className="size-4" />
          </div>
          <div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Shift Schedule</div>
            <div className="text-xs font-semibold text-foreground">Mon • Nov 18</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-muted-foreground uppercase">Today</div>
          <div className="flex items-center justify-between p-2.5 bg-brand/5 rounded-xl border border-brand/10">
            <div>
              <div className="text-[11px] font-semibold text-foreground">Morning Reception</div>
              <div className="text-[9px] font-medium text-muted-foreground">9:00 AM – 5:00 PM</div>
            </div>
            <span className="text-[9px] font-bold text-brand-hover bg-brand/10 px-2 py-0.5 rounded-md">On</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-muted rounded-xl border border-border">
            <div>
              <div className="text-[11px] font-semibold text-foreground">Evening Bar</div>
              <div className="text-[9px] font-medium text-muted-foreground">6:00 PM – 11:00 PM</div>
            </div>
            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">2 staff</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase">Tomorrow</div>
          <div className="flex items-center justify-between p-2.5 bg-muted rounded-xl border border-border">
            <div>
              <div className="text-[11px] font-semibold text-foreground">Brunch Service</div>
              <div className="text-[9px] font-medium text-muted-foreground">10:00 AM – 4:00 PM</div>
            </div>
            <span className="text-[9px] font-bold text-yellow-750 bg-yellow-50 px-2 py-0.5 rounded-md">3 staff</span>
          </div>
        </div>
      </div>

      {/* WIDGET 2: Team Form (Middle Left) */}
      <div className="hidden xl:flex absolute top-[36%] left-[-22%] w-[230px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex gap-2.5 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Shirt className="size-4 text-blue-600" />
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Team Form</div>
          </div>
          <span className="text-[9px] font-bold text-brand bg-brand/5 border border-brand/15 px-2 py-0.5 rounded-full">New</span>
        </div>
        
        <div className="text-[13px] font-semibold text-foreground leading-tight">Uniform Size</div>

        <div className="space-y-2">
          <div>
            <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Your Name</label>
            <div className="h-8 rounded-lg bg-muted border border-border/80 flex items-center px-3 text-[11px] font-medium text-foreground">
              Sarah Johnson
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">T-Shirt Size</label>
            <div className="h-8 rounded-lg border border-brand bg-card flex items-center justify-between px-3 text-[11px] font-medium text-muted-foreground">
              <span>Select size...</span>
              <span className="text-brand">|</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 justify-between">
          {["S", "M", "L", "XL"].map((sz) => (
            <div
              key={sz}
              className={cn(
                "size-8 rounded-lg border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors",
                sz === "L"
                  ? "border-brand text-brand bg-brand/5"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {sz}
            </div>
          ))}
        </div>

        <button className="w-full h-9 rounded-xl bg-foreground text-background text-[11px] font-semibold tracking-wide hover:bg-foreground/90 transition-colors mt-1">
          Submit →
        </button>
      </div>

      {/* WIDGET 3: Time Off Approved (Bottom Left) */}
      <div className="hidden xl:flex absolute bottom-[-5%] left-[-12%] w-[230px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3.5 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Palmtree className="size-4 text-emerald-600" />
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Time Off</div>
          </div>
          <div className="size-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="size-3" />
          </div>
        </div>

        <div className="text-[13px] font-semibold text-foreground leading-tight">Approved!</div>

        <div className="p-3 bg-muted border border-border rounded-2xl space-y-1">
          <div className="text-[11px] font-semibold text-foreground">Dec 24 – Dec 26</div>
          <div className="text-[9px] font-medium text-muted-foreground">3 days • Holiday leave</div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <div className="size-6 rounded-full bg-brand flex items-center justify-center text-[9px] font-bold text-background">M</div>
          <span className="text-[10px] font-medium text-muted-foreground">Approved by Manager</span>
        </div>
      </div>

      {/* WIDGET 4: My Tasks (Top Center) */}
      <div className="hidden xl:flex absolute top-[-8%] left-[45%] -translate-x-1/2 w-[220px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <CheckSquare className="size-4 text-emerald-500" />
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">My Tasks</div>
          </div>
          <span className="text-[9px] font-bold text-brand bg-brand/5 border border-brand/15 px-2 py-0.5 rounded-full">Today</span>
        </div>

        <div className="text-[13px] font-semibold text-foreground leading-tight">3 remaining</div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 bg-muted rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-brand shrink-0" />
              <span className="text-[11px] font-semibold text-foreground">Restock bar supplies</span>
            </div>
            <span className="text-[8px] font-bold text-brand-hover bg-brand/10 px-1.5 py-0.5 rounded-md">High</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-muted rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span className="size-4 rounded-full border-2 border-border shrink-0" />
              <span className="text-[11px] font-semibold text-foreground">Update menu boards</span>
            </div>
            <span className="text-[8px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">3pm</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 opacity-40">
            <span className="size-4 rounded-full bg-emerald-500 flex items-center justify-center text-background shrink-0"><Check className="size-2.5" /></span>
            <span className="text-[11px] font-semibold text-foreground line-through">Morning briefing</span>
          </div>
        </div>
      </div>

      {/* WIDGET 5: Wiki Knowledge Base (Bottom Center) */}
      <div className="hidden xl:flex absolute bottom-[-8%] left-[50%] -translate-x-1/2 w-[220px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <BookOpen className="size-4 text-blue-500" />
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Wiki</div>
          </div>
          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">New</span>
        </div>

        <div className="text-[13px] font-semibold text-foreground leading-tight">Knowledge Base</div>

        <div className="space-y-2">
          <div className="p-2.5 bg-muted border border-border rounded-xl flex items-center gap-2.5">
            <span className="size-2 bg-brand rounded-full" />
            <div>
              <div className="text-[11px] font-semibold text-foreground">Opening Procedures</div>
              <div className="text-[8px] font-medium text-muted-foreground">Updated 2h ago</div>
            </div>
          </div>

          <div className="p-2.5 bg-muted border border-border rounded-xl flex items-center gap-2.5">
            <span className="size-2 bg-emerald-400 rounded-full" />
            <div>
              <div className="text-[11px] font-semibold text-foreground">Health & Safety Guide</div>
              <div className="text-[8px] font-medium text-muted-foreground">Pinned by manager</div>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET 6: Team Chat (Top Right) */}
      <div className="hidden xl:flex absolute top-[-5%] right-[-15%] w-[220px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <MessageSquare className="size-4 text-brand" />
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Team Chat</div>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="bg-muted rounded-2xl rounded-tl-none p-3 text-[11px] font-medium text-foreground/80 leading-normal">
            Can someone cover the 3pm slot? 🙏
          </div>

          <div className="bg-foreground text-background rounded-2xl rounded-tr-none p-3 text-[11px] font-medium leading-normal ml-auto w-5/6 shadow-sm">
            I got it! Clocking in now ✅
          </div>
        </div>
      </div>

      {/* WIDGET 7: Sarah Manager Feed Post (Middle Right) */}
      <div className="hidden xl:flex absolute top-[36%] right-[-22%] w-[240px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-4.5 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-background">M</div>
          <div>
            <div className="text-xs font-semibold text-foreground">Sarah • Manager</div>
            <div className="text-[9px] font-medium text-muted-foreground">2 hours ago</div>
          </div>
        </div>

        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed bg-muted border border-border rounded-2xl p-3.5">
          🙌 Well done everyone! Amazing work this week — the team really showed up. So proud of you all!
        </p>

        <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-muted-foreground">
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><Heart className="size-3 text-red-500 fill-current" /> 24</span>
            <span className="flex items-center gap-1"><MessageCircle className="size-3" /> 8</span>
          </div>
          <button className="flex items-center gap-1 text-brand hover:underline">
            <ThumbsUp className="size-3" /> Like
          </button>
        </div>
      </div>

      {/* WIDGET 8: Clock In (Bottom Right) */}
      <div className="hidden xl:flex absolute bottom-[-5%] right-[-12%] w-[220px] rounded-3xl bg-card border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-5 flex-col gap-3.5 text-left z-20 hover:-translate-y-1 transition-transform duration-300">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Clock className="size-4 text-brand" />
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Clock In</div>
          </div>
          <span className="text-[10px] font-bold text-foreground">9:02 AM</span>
        </div>

        <div className="text-[11px] font-medium text-muted-foreground">Front Desk • Floor 2</div>

        <button className="w-full h-11 rounded-2xl bg-foreground text-background text-xs font-bold tracking-wide hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 shadow-md">
          <span className="size-2 rounded-full bg-red-500 animate-pulse" />
          Clock In Now
        </button>
      </div>

      {/* 4. Mobile layout fallback (renders widgets in a clean horizontal swipe block instead of breaking absolute stage) */}
      <div className="xl:hidden w-full flex flex-col gap-6 mt-6 z-20">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Platform Widget Previews</div>
        <div className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-none snap-x">
          
          <div className="snap-center shrink-0 w-[240px] rounded-3xl bg-card border border-border/80 shadow-lg p-5">
            {/* Shift schedule preview */}
            <div className="flex gap-2.5 items-center mb-4">
              <div className="size-8 rounded-xl bg-brand/5 flex items-center justify-center text-brand border border-brand/15"><Calendar className="size-4" /></div>
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase">Schedule</div>
                <div className="text-xs font-semibold text-foreground">Mon • Nov 18</div>
              </div>
            </div>
            <div className="p-2.5 bg-brand/5 rounded-xl border border-brand/10 flex justify-between items-center text-left">
              <div>
                <div className="text-[11px] font-semibold">Morning Shift</div>
                <div className="text-[9px] text-muted-foreground">9:00 AM – 5:00 PM</div>
              </div>
              <span className="text-[9px] font-bold text-brand-hover bg-brand/10 px-2 py-0.5 rounded-md">On</span>
            </div>
          </div>

          <div className="snap-center shrink-0 w-[220px] rounded-3xl bg-card border border-border/80 shadow-lg p-5 text-left">
            {/* Task preview */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2.5 items-center">
                <CheckSquare className="size-4 text-emerald-500" />
                <div className="text-[9px] font-bold text-muted-foreground uppercase">My Tasks</div>
              </div>
              <span className="text-[8px] font-bold text-brand bg-brand/5 px-1.5 py-0.5 rounded-full">3 left</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded-xl border border-border">
              <span className="text-[10px] font-semibold">Restock bar supplies</span>
              <span className="text-[8px] font-bold text-brand-hover bg-brand/10 px-1.5 py-0.5 rounded-md">High</span>
            </div>
          </div>

          <div className="snap-center shrink-0 w-[220px] rounded-3xl bg-card border border-border/80 shadow-lg p-5 text-left">
            {/* Clock-in preview */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 items-center">
                <Clock className="size-4 text-brand" />
                <div className="text-[9px] font-bold text-muted-foreground uppercase">Clock In</div>
              </div>
              <span className="text-[10px] font-bold text-foreground">9:02 AM</span>
            </div>
            <button className="w-full h-10 rounded-xl bg-foreground text-background text-[11px] font-semibold flex items-center justify-center gap-2">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
              Clock In Now
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

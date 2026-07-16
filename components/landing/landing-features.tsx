import {
  MessageSquare,
  Check,
  Activity,
  FileText,
  HeartPulse
} from "lucide-react";
import { ChatMockup } from "./chat-mockup";
import { OperationsMockup } from "./operations-mockup";
import { CollaborationMockup } from "./collaboration-mockup";
import { EngagementMockup } from "./engagement-mockup";

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-white border-t border-zinc-100">
      <div className="mx-auto max-w-7xl px-6 md:px-8 space-y-32">

        {/* 1. Communication (Image Right) */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <MessageSquare className="size-6" />
            </div>
            <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight sm:text-5xl">
              Team Communication, <br />Streamlined.
            </h2>
            <p className="text-lg font-semibold text-zinc-500 leading-relaxed">
              Keep everyone aligned without the noise. From focused 1-on-1 direct messages to location-wide announcements and group chats, your team stays connected naturally.
            </p>
            <ul className="space-y-3 pt-4 text-[15px] font-bold text-zinc-700">
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Secure internal directory</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Read receipts for urgent updates</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Separate channels for branches</li>
            </ul>
          </div>
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-blue-50 rounded-[3rem] rotate-3 scale-105" />
            <ChatMockup />
          </div>
        </div>

        {/* 2. Operations (Image Left) */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative aspect-square w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-[#e86a3d]/10 rounded-[3rem] -rotate-3 scale-105" />
            <OperationsMockup />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-orange-50 text-[#e86a3d] border border-orange-100">
              <Activity className="size-6" />
            </div>
            <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight sm:text-5xl">
              Frictionless Daily <br />Operations.
            </h2>
            <p className="text-lg font-semibold text-zinc-500 leading-relaxed">
              Manage your entire physical workforce without switching tools. Oversee shift rosters, approve time-off, monitor GPS clock-ins, and collect daily forms in a unified hub.
            </p>
            <ul className="space-y-3 pt-4 text-[15px] font-bold text-zinc-700">
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Geofenced time tracking</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Automated shift scheduling</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Custom compliance checklists</li>
            </ul>
          </div>
        </div>

        {/* 3. Collaboration (Image Right) */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileText className="size-6" />
            </div>
            <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight sm:text-5xl">
              A Central Home for <br />Collaboration.
            </h2>
            <p className="text-lg font-semibold text-zinc-500 leading-relaxed">
              Unify your company culture. Store critical training manuals, organize company-wide events, and build a searchable directory of everyone from headquarters to the storefront.
            </p>
            <ul className="space-y-3 pt-4 text-[15px] font-bold text-zinc-700">
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Company Wiki & Docs</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Shared team calendars</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Searchable employee profiles</li>
            </ul>
          </div>
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-emerald-50 rounded-[3rem] rotate-3 scale-105" />
            <CollaborationMockup />
          </div>
        </div>

        {/* 4. Engagement (Image Left) */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative aspect-square w-full max-w-md mx-auto">
            <div className="absolute inset-0 bg-purple-50 rounded-[3rem] -rotate-3 scale-105" />
            <EngagementMockup />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <HeartPulse className="size-6" />
            </div>
            <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight sm:text-5xl">
              Meaningful Team <br />Engagement.
            </h2>
            <p className="text-lg font-semibold text-zinc-500 leading-relaxed">
              Turn your workplace into a community. Share company milestones on a heartbeat news feed and celebrate team members with profiles that go beyond just a job title.
            </p>
            <ul className="space-y-3 pt-4 text-[15px] font-bold text-zinc-700">
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Interactive News Feed</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Employee recognitions & shoutouts</li>
              <li className="flex gap-3 items-center"><Check className="size-5 text-emerald-500" /> Surveys & instant feedback</li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}

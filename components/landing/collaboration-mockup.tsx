import { cn } from "@/lib/utils";
import { FileText, Play } from "lucide-react";

interface CollaborationMockupProps {
  className?: string;
  wikiTitle?: string;
  articleTitle?: string;
  paragraphs?: string[];
  attachmentName?: string;
}

export function CollaborationMockup({
  className,
  wikiTitle = "Operations Wiki",
  articleTitle = "Morning Opening Checklist",
  paragraphs = [
    "1. Alarm System: Disarm the main security hub immediately upon entry using your store-specific code.",
    "2. Register Preparation: Verify cash drawers and launch the primary register systems before 08:45."
  ],
  attachmentName = "Opening_Walkthrough_Guide.mp4"
}: CollaborationMockupProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-white rounded-[3rem] border border-zinc-200 shadow-xl overflow-hidden flex flex-col p-6 gap-4 text-left",
        className
      )}
    >
      {/* Search/Doc Bar Mockup */}
      <div className="h-12 w-full bg-emerald-600 rounded-2xl flex items-center px-4 gap-3 shadow-md shadow-emerald-600/20">
        <FileText className="size-5 text-white/90" />
        <span className="text-xs font-bold text-white/90 tracking-wide">{wikiTitle}</span>
      </div>

      {/* Wiki Document Body */}
      <div className="flex-1 bg-zinc-50 rounded-2xl border border-zinc-100 p-5 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h4 className="text-base font-extrabold text-zinc-900 leading-tight">{articleTitle}</h4>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-xs font-semibold text-zinc-500 leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {/* Video / File Attachment Placeholder */}
        <div className="h-28 w-full bg-zinc-200/50 rounded-xl border border-zinc-200 flex flex-col items-center justify-center p-3 relative overflow-hidden group">
          <div className="size-10 rounded-full bg-white shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
            <Play className="size-4 text-emerald-600 fill-current ml-0.5" />
          </div>
          <span className="text-[10px] font-black text-zinc-500 mt-2 truncate w-full text-center px-4">
            {attachmentName}
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-full bg-zinc-200 rounded-full" />
          <div className="h-2 w-5/6 bg-zinc-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

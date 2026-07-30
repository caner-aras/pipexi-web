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
        "relative h-full w-full bg-card rounded-[3rem] border border-border shadow-xl overflow-hidden flex flex-col p-6 gap-4 text-left",
        className
      )}
    >
      {/* Search/Doc Bar Mockup */}
      <div className="h-12 w-full bg-emerald-600 rounded-full flex items-center px-4 gap-3 shadow-md shadow-emerald-600/20">
        <FileText className="size-5 text-background/90" />
        <span className="text-xs font-bold text-background/90 tracking-wide">{wikiTitle}</span>
      </div>

      {/* Wiki Document Body */}
      <div className="flex-1 bg-muted rounded-2xl border border-border p-5 space-y-4 overflow-y-auto">
        <div className="space-y-2">
          <h4 className="text-base font-extrabold text-foreground leading-tight">{articleTitle}</h4>
          {paragraphs.map((p, i) => (
            <p key={i} className="text-xs font-semibold text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {/* Video / File Attachment Placeholder */}
        <div className="h-28 w-full bg-muted/50 rounded-xl border border-border flex flex-col items-center justify-center p-3 relative overflow-hidden group">
          <div className="size-10 rounded-full bg-card shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
            <Play className="size-4 text-emerald-600 fill-current ml-0.5" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground mt-2 truncate w-full text-center px-4">
            {attachmentName}
          </span>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="h-2 w-full bg-muted rounded-full" />
          <div className="h-2 w-5/6 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}

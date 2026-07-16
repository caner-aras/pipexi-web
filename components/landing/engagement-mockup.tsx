import { cn } from "@/lib/utils";
import { MessageCircle, ThumbsUp } from "lucide-react";

interface FeedItem {
  authorName: string;
  roleAndTime: string;
  avatarInitials: string;
  text: string;
  likesCount: number;
  commentsCount: number;
  highlightClass?: string;
}

interface EngagementMockupProps {
  className?: string;
  items?: FeedItem[];
}

export function EngagementMockup({
  className,
  items = [
    {
      authorName: "Elena Rostova",
      roleAndTime: "Regional Manager • 2h ago",
      avatarInitials: "ER",
      text: "Shoutout to the North London team for hitting 120% of their operational target this week! 🚀 Superb hustle!",
      likesCount: 28,
      commentsCount: 9,
      highlightClass: "bg-purple-500/10 border-purple-500/20"
    },
    {
      authorName: "Liam Carter",
      roleAndTime: "Store Lead • Yesterday",
      avatarInitials: "LC",
      text: "Please join me in welcoming our new joiner, Sarah! She will be working the weekend shifts starting Saturday.",
      likesCount: 14,
      commentsCount: 3
    }
  ]
}: EngagementMockupProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-white rounded-[3rem] border border-zinc-200 shadow-xl overflow-hidden flex flex-col p-6 gap-6 bg-zinc-50/50 text-left",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md",
            idx > 0 ? "opacity-60" : ""
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-xs font-black text-purple-700">
              {item.avatarInitials}
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-extrabold text-zinc-900">{item.authorName}</div>
              <div className="text-[11px] font-bold text-zinc-400">{item.roleAndTime}</div>
            </div>
          </div>

          {/* Post Content */}
          <div className={cn("rounded-xl p-4 text-xs font-semibold leading-relaxed text-zinc-600 border", item.highlightClass || "bg-zinc-50 border-zinc-100")}>
            {item.text}
          </div>

          {/* Interactions */}
          <div className="flex gap-4 pt-2 border-t border-zinc-100 text-[11px] font-bold text-zinc-400">
            <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
              <ThumbsUp className="size-3.5" />
              <span>{item.likesCount}</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
              <MessageCircle className="size-3.5" />
              <span>{item.commentsCount}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

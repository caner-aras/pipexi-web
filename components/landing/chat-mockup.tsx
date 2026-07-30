import { cn } from "@/lib/utils";

interface ChatMessage {
  senderInitials?: string;
  text: string;
  isSelf?: boolean;
  imageAttachment?: boolean;
}

interface ChatMockupProps {
  className?: string;
  channelName?: string;
  memberCount?: string;
  messages?: ChatMessage[];
  isTyping?: boolean;
  typingText?: string;
}

export function ChatMockup({
  className,
  channelName = "announcements",
  memberCount = "128 members",
  messages = [
    { senderInitials: "JS", text: "Hey team, the new schedule for next week has been published! Please check your shifts." },
    { senderInitials: "ME", text: "Got it! Thanks for the heads up.", isSelf: true },
    { senderInitials: "AM", text: "Looks great, signed off my availability.", imageAttachment: true }
  ],
  isTyping = true,
  typingText = "Sarah is typing..."
}: ChatMockupProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full bg-card rounded-[3rem] border border-border shadow-xl overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center px-6 gap-4 bg-muted">
        <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">#</div>
        <div className="space-y-0.5 text-left">
          <div className="text-sm font-extrabold text-foreground">{channelName}</div>
          <div className="text-[11px] font-bold text-muted-foreground">{memberCount}</div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-3", msg.isSelf ? "flex-row-reverse" : "")}
          >
            {!msg.isSelf && (
              <div className="size-8 rounded-full bg-muted shrink-0 flex items-center justify-center text-[10px] font-black text-muted-foreground">
                {msg.senderInitials || "U"}
              </div>
            )}
            <div
              className={cn(
                "rounded-2xl p-4 max-w-[80%] space-y-2 text-left text-xs font-semibold leading-relaxed shadow-sm",
                msg.isSelf
                  ? "bg-blue-600 text-background rounded-tr-none shadow-blue-600/10"
                  : "bg-muted text-foreground/80 rounded-tl-none"
              )}
            >
              <p>{msg.text}</p>
              {msg.imageAttachment && (
                <div className={cn("h-16 w-80 max-w-full rounded-xl mt-2 border border-dashed flex items-center justify-center", msg.isSelf ? "bg-card/10 border-white/20" : "bg-muted/50 border-border")}>
                  <div className="text-[10px] opacity-60">shift_map_route.png</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 px-6 pb-4 text-[10px] font-bold text-muted-foreground text-left">
          <div className="flex gap-0.5 items-center h-3">
            <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span>{typingText}</span>
        </div>
      )}

      {/* Mock Chat Input Bar */}
      <div className="p-4 border-t border-border bg-muted flex items-center gap-3">
        <div className="flex-1 bg-card rounded-xl border border-border h-10 px-3 flex items-center text-xs font-semibold text-muted-foreground text-left">
          Message #{channelName}...
        </div>
        <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-background shadow-sm shadow-blue-600/20 cursor-pointer">
          <svg className="size-4 fill-current rotate-45 transform -translate-x-0.5" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

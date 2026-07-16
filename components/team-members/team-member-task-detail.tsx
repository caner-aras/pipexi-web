"use client";

import {
  CalendarClock,
  CheckSquare,
  ChevronRight,
  CircleDot,
  Clock3,
  Flag,
  LayoutList,
  MessageSquareText,
  Pencil,
  Send,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatLocalDateKey,
  getTodayDateKeyUtc,
} from "@/lib/date-format";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team";
import type {
  TeamMemberTask,
  WorkTaskComment,
  WorkTaskPriority,
  WorkTaskStatus,
} from "@/types/team-member-task";
import {
  formatWorkTaskLabel,
  normalizeWorkTaskStatus,
  WORK_TASK_PRIORITIES,
  WORK_TASK_STATUSES,
} from "@/types/team-member-task";

interface TeamMemberTaskDetailProps {
  task: TeamMemberTask;
  teamMemberId: string;
  assignableMembers: TeamMember[];
  commentAuthorUserId: string | null;
}

const PRIORITY_OPTIONS: Array<{ value: WorkTaskPriority; label: string }> =
  WORK_TASK_PRIORITIES.map((value) => ({
    value,
    label: formatWorkTaskLabel(value),
  }));

const STATUS_OPTIONS: Array<{ value: WorkTaskStatus; label: string }> =
  WORK_TASK_STATUSES.map((value) => ({
    value,
    label: formatWorkTaskLabel(value),
  }));

function formatDateTime(iso: string | null | undefined): string {
  if (!iso?.trim()) {
    return "—";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function isoToLocalDateKey(iso: string): string {
  return formatLocalDateKey(new Date(iso));
}

function isoToLocalTime(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function combineLocalDateTimeToIso(dateKey: string, time: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}

function isDueDateOverdue(
  dueAt: string | null | undefined,
  status: string,
  nowMs: number
): boolean {
  if (!dueAt || status === "done" || status === "canceled") {
    return false;
  }

  const dueMs = new Date(dueAt).getTime();

  if (Number.isNaN(dueMs)) {
    return false;
  }

  return dueMs < nowMs;
}

function getCommentAuthorName(comment: WorkTaskComment): string {
  const user = comment.member?.user;

  if (!user) {
    return "Team member";
  }

  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function CommentsSkeleton() {
  return (
    <div className="space-y-4 px-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-32 rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCommentsSection({
  taskId,
  commentAuthorUserId,
}: {
  taskId: string;
  commentAuthorUserId: string | null;
}) {
  const [comments, setComments] = useState<WorkTaskComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadComments() {
      try {
        const response = await fetch(`/api/tasks/${taskId}/comments`);
        const body = (await response.json()) as {
          data?: WorkTaskComment[];
          message?: string;
        };

        if (!active) {
          return;
        }

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to load comments.");
        }

        setComments(body.data ?? []);
      } catch (err) {
        if (!active) {
          return;
        }

        toast.error(
          err instanceof Error ? err.message : "Failed to load comments."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadComments();

    return () => {
      active = false;
    };
  }, [taskId]);

  useEffect(() => {
    if (isLoading || comments.length === 0) {
      return;
    }

    const node = listRef.current;
    if (!node) {
      return;
    }

    node.scrollTop = node.scrollHeight;
  }, [comments, isLoading]);

  async function handleAddComment() {
    if (!commentAuthorUserId) {
      toast.error("You must be signed in to comment.");
      return;
    }

    if (!message.trim()) {
      toast.error("Comment message is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createResponse = await fetch("/api/tasks/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workTaskId: taskId,
          userId: commentAuthorUserId,
          message: message.trim(),
        }),
      });

      const createBody = (await createResponse.json()) as {
        message?: string;
      };

      if (!createResponse.ok) {
        throw new Error(createBody.message ?? "Failed to add comment.");
      }

      setMessage("");

      const commentsResponse = await fetch(`/api/tasks/${taskId}/comments`);
      const commentsBody = (await commentsResponse.json()) as {
        data?: WorkTaskComment[];
        message?: string;
      };

      if (!commentsResponse.ok) {
        throw new Error(commentsBody.message ?? "Failed to load comments.");
      }

      setComments(commentsBody.data ?? []);
      toast.success("Comment added");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add comment."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="flex min-h-[32rem] flex-col overflow-hidden lg:min-h-[36rem]">
      <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-sm bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <MessageSquareText className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-medium">Comments</h2>
            <p className="text-xs text-muted-foreground">
              {!isLoading
                ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}`
                : "Loading comments"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {isLoading ? (
            <CommentsSkeleton />
          ) : comments.length === 0 ? (
            <div className="flex h-full min-h-44 flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <MessageSquareText className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No comments yet</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Start the discussion — ask a question or leave an update.
                </p>
              </div>
            </div>
          ) : (
            comments.map((comment) => {
              const authorName = getCommentAuthorName(comment);
              const jobTitle = comment.member?.jobTitle;
              const authorTeamMemberId =
                comment.member?.teamMemberId ?? comment.teamMemberId;
              const avatarUrl = comment.member?.user?.avatarUrl ?? null;

              return (
                <div key={comment.id} className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-background">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      getInitials(authorName)
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      {authorTeamMemberId ? (
                        <Link
                          href={`/team-members/${authorTeamMemberId}`}
                          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {authorName}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium text-foreground">
                          {authorName}
                        </p>
                      )}
                      {jobTitle ? (
                        <span className="text-xs text-muted-foreground">
                          {jobTitle}
                        </span>
                      ) : null}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <div className="rounded-md border border-border/50 bg-muted/35 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                      {comment.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4">
          <div className="space-y-3">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={isSubmitting || !commentAuthorUserId}
              placeholder={
                commentAuthorUserId ? "Add a comment…" : "Sign in to comment"
              }
              rows={3}
              className="flex min-h-20 w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  (event.metaKey || event.ctrlKey) &&
                  !isSubmitting &&
                  commentAuthorUserId &&
                  message.trim()
                ) {
                  event.preventDefault();
                  void handleAddComment();
                }
              }}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {commentAuthorUserId ? "⌘/Ctrl + Enter to send" : null}
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleAddComment()}
                disabled={
                  isSubmitting || !commentAuthorUserId || !message.trim()
                }
              >
                <Send className="size-3.5" />
                {isSubmitting ? "Sending…" : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getStatusToneClass(status: string): string {
  switch (normalizeWorkTaskStatus(status)) {
    case "done":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "in_progress":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "blocked":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "canceled":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPriorityToneClass(priority: WorkTaskPriority | string): string {
  switch (priority) {
    case "urgent":
      return "bg-destructive/10 text-destructive";
    case "high":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
    case "medium":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPriorityIconClass(priority: WorkTaskPriority | string): string {
  switch (priority) {
    case "urgent":
      return "bg-destructive/10 text-destructive";
    case "high":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
    case "medium":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function TaskMetaItem({
  label,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
  href,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName: string;
  valueClassName?: string;
  href?: string | null;
}) {
  const valueNode = href ? (
    <Link
      href={href}
      className={cn(
        "mt-0.5 block truncate text-base font-semibold underline-offset-4 hover:underline",
        valueClassName
      )}
    >
      {value}
    </Link>
  ) : (
    <p
      className={cn(
        "mt-0.5 truncate text-base font-semibold",
        valueClassName
      )}
    >
      {value}
    </p>
  );

  return (
    <div className="flex items-center gap-3 rounded-md border border-border/50 bg-background px-3 py-3">
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-sm",
          iconClassName
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {valueNode}
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 border-b border-border/50 py-3 last:border-b-0">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

function EditTaskDialog({
  open,
  onOpenChange,
  task,
  assignableMembers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TeamMemberTask;
  assignableMembers: TeamMember[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<WorkTaskPriority | string>(
    task.priority
  );
  const [status, setStatus] = useState<WorkTaskStatus>(
    normalizeWorkTaskStatus(String(task.status))
  );
  const [assignedToTeamMemberId, setAssignedToTeamMemberId] = useState(
    task.assignedToTeamMemberId ?? ""
  );
  const [hasDueAt, setHasDueAt] = useState(Boolean(task.dueAt));
  const [dueDate, setDueDate] = useState(
    task.dueAt ? isoToLocalDateKey(task.dueAt) : getTodayDateKeyUtc()
  );
  const [dueTime, setDueTime] = useState(
    task.dueAt ? isoToLocalTime(task.dueAt) : "17:00"
  );
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setStatus(normalizeWorkTaskStatus(String(task.status)));
      setAssignedToTeamMemberId(task.assignedToTeamMemberId ?? "");
      setHasDueAt(Boolean(task.dueAt));
      setDueDate(
        task.dueAt ? isoToLocalDateKey(task.dueAt) : getTodayDateKeyUtc()
      );
      setDueTime(task.dueAt ? isoToLocalTime(task.dueAt) : "17:00");
      setMemberSearch("");
      setError(null);
    });

    return () => cancelAnimationFrame(frame);
  }, [open, task]);

  const selectedMember =
    assignableMembers.find((member) => member.id === assignedToTeamMemberId) ??
    null;
  const selectedMemberName = selectedMember
    ? getShiftMemberDisplayName(selectedMember.organizationMember)
    : "Select member";
  const selectedMemberSubtitle = selectedMember
    ? `${selectedMember.organizationMember.user.email} · ${selectedMember.team.name}`
    : "Choose a team member";

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    if (!query) {
      return assignableMembers;
    }

    return assignableMembers.filter((member) => {
      const name = getShiftMemberDisplayName(
        member.organizationMember
      ).toLowerCase();
      const email = member.organizationMember.user.email.toLowerCase();
      const teamName = member.team.name.toLowerCase();
      return (
        name.includes(query) || email.includes(query) || teamName.includes(query)
      );
    });
  }, [assignableMembers, memberSearch]);

  async function handleSubmit() {
    if (!title.trim()) {
      const message = "Title is required.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!assignedToTeamMemberId) {
      const message = "Assignee is required.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selected = assignableMembers.find(
        (member) => member.id === assignedToTeamMemberId
      );

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: task.organizationId,
          shiftId: task.shiftId,
          locationId: task.locationId,
          title: title.trim(),
          description: description.trim() || null,
          assignedToTeamMemberId,
          assignedToTeamId: selected?.team.id ?? task.assignedToTeamId,
          dueAt: hasDueAt ? combineLocalDateTimeToIso(dueDate, dueTime) : null,
          priority,
          status,
        }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(body.message ?? "Failed to update task.");
      }

      toast.success("Task updated");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update task.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update details for this board item.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Button
                type="button"
                variant="outline"
                className="h-auto w-full justify-between px-3 py-2.5"
                onClick={() => setMemberPickerOpen(true)}
                disabled={isSubmitting || assignableMembers.length === 0}
              >
                <span className="flex min-w-0 items-center gap-2 text-left">
                  <UserRound className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">
                      {selectedMemberName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {selectedMemberSubtitle}
                    </span>
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <textarea
                id="edit-task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="flex w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  items={STATUS_OPTIONS}
                  value={status}
                  onValueChange={(value) => {
                    if (value) {
                      setStatus(value as WorkTaskStatus);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  items={PRIORITY_OPTIONS}
                  value={String(priority)}
                  onValueChange={(value) => {
                    if (value) {
                      setPriority(value as WorkTaskPriority);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label>Due date</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setHasDueAt((value) => !value)}
                  disabled={isSubmitting}
                >
                  {hasDueAt ? "Clear" : "Set due date"}
                </Button>
              </div>

              {hasDueAt ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <DatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-task-due-time">Time</Label>
                    <Input
                      id="edit-task-due-time"
                      type="time"
                      value={dueTime}
                      onChange={(event) => setDueTime(event.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No due date set.</p>
              )}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={memberPickerOpen} onOpenChange={setMemberPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select member</DialogTitle>
            <DialogDescription>
              Assign this task to a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={memberSearch}
              onChange={(event) => setMemberSearch(event.target.value)}
              placeholder="Search members…"
              autoFocus
            />
            <div className="max-h-72 overflow-y-auto rounded-sm border border-border/50">
              {filteredMembers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No members found.
                </p>
              ) : (
                filteredMembers.map((member) => {
                  const name = getShiftMemberDisplayName(
                    member.organizationMember
                  );
                  const selected = member.id === assignedToTeamMemberId;

                  return (
                    <button
                      key={member.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                        selected && "bg-muted/60"
                      )}
                      onClick={() => {
                        setAssignedToTeamMemberId(member.id);
                        setMemberPickerOpen(false);
                        setMemberSearch("");
                      }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {member.organizationMember.user.email} ·{" "}
                          {member.team.name}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TeamMemberTaskDetail({
  task,
  teamMemberId,
  assignableMembers,
  commentAuthorUserId,
}: TeamMemberTaskDetailProps) {
  const [nowMs] = useState(() => Date.now());
  const [editOpen, setEditOpen] = useState(false);
  const status = normalizeWorkTaskStatus(String(task.status));
  const overdue = isDueDateOverdue(task.dueAt, status, nowMs);

  const assignedMember = task.assignedToTeamMemberId
    ? assignableMembers.find(
      (member) => member.id === task.assignedToTeamMemberId
    )
    : null;
  const assignedName = assignedMember
    ? getShiftMemberDisplayName(assignedMember.organizationMember)
    : null;

  const assignedAvatarUrl =
    assignedMember?.organizationMember.user?.avatarUrl ?? null;
  const dueValue = task.dueAt
    ? `${overdue ? "Overdue · " : ""}${formatDateTime(task.dueAt)}`
    : "No due date";

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium",
                getStatusToneClass(status)
              )}
            >
              {formatWorkTaskLabel(status)}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-sm px-2 py-1 text-xs font-medium",
                getPriorityToneClass(task.priority)
              )}
            >
              {formatWorkTaskLabel(String(task.priority))}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <TaskMetaItem
            label="Status"
            value={formatWorkTaskLabel(status)}
            icon={CircleDot}
            iconClassName={getStatusToneClass(status)}
          />
          <TaskMetaItem
            label="Priority"
            value={formatWorkTaskLabel(String(task.priority))}
            icon={Flag}
            iconClassName={getPriorityIconClass(task.priority)}
          />
          <TaskMetaItem
            label="Due"
            value={dueValue}
            icon={CalendarClock}
            iconClassName={
              overdue
                ? "bg-destructive/10 text-destructive"
                : "bg-amber-400/15 text-amber-600 dark:text-amber-400"
            }
            valueClassName={overdue ? "text-destructive" : undefined}
          />
          <TaskMetaItem
            label="Assignee"
            value={assignedName ?? "Unassigned"}
            icon={UserRound}
            iconClassName="bg-primary/10 text-primary"
            href={
              task.assignedToTeamMemberId
                ? `/team-members/${task.assignedToTeamMemberId}`
                : null
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="space-y-0 overflow-hidden rounded-md border border-border/50 bg-background">
            <section className="border-b border-border/50 px-4 py-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckSquare className="size-4" />
                </div>
                <h2 className="text-sm font-medium">Description</h2>
              </div>
              {task.description ? (
                <div className="rounded-xl bg-muted/35 px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {task.description}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-3.5 py-6 text-center text-sm text-muted-foreground">
                  No description yet.
                </p>
              )}
            </section>

            <section className="px-4 py-5">
              <h2 className="text-sm font-medium">Details</h2>
              <div className="mt-1">
                <MetaRow icon={UserRound} label="Assignee">
                  {task.assignedToTeamMemberId ? (
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {assignedAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={assignedAvatarUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          getInitials(assignedName ?? "U")
                        )}
                      </div>
                      <Link
                        href={`/team-members/${task.assignedToTeamMemberId}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {assignedName ?? "View assignee"}
                      </Link>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </MetaRow>

                <MetaRow icon={CalendarClock} label="Due date">
                  {task.dueAt ? (
                    <span
                      className={cn(overdue && "font-medium text-destructive")}
                    >
                      {overdue ? "Overdue · " : null}
                      {formatDateTime(task.dueAt)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No due date</span>
                  )}
                </MetaRow>

                <MetaRow icon={Clock3} label="Created">
                  {formatDateTime(task.createdAt)}
                </MetaRow>

                <MetaRow icon={LayoutList} label="Board">
                  <Link
                    href={`/team-members/${teamMemberId}/tasks`}
                    className="font-medium underline-offset-4 hover:underline"
                  >
                    Open board
                  </Link>
                </MetaRow>
              </div>
            </section>
          </div>

          <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <TaskCommentsSection
              taskId={task.id}
              commentAuthorUserId={commentAuthorUserId}
            />
          </div>
        </div>
      </div>

      <EditTaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
        assignableMembers={assignableMembers}
      />
    </>
  );
}

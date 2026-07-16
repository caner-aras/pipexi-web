"use client";

import {
  AlertCircle,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ExternalLink,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  WorkTask,
  WorkTaskComment,
  WorkTaskPriority,
  WorkTaskStatus,
} from "@/types/team-member-task";

interface TaskDrawerProps {
  title?: string;
  subtitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  tasks: WorkTask[];
  isLoading: boolean;
  error: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getTaskHref?: (task: WorkTask) => string | null;
}

function formatTaskDueAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatTaskCreatedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isTaskOverdue(task: WorkTask): boolean {
  if (
    !task.dueAt ||
    task.status === "done" ||
    task.status === "canceled" ||
    task.status === "completed" ||
    task.status === "cancelled"
  ) {
    return false;
  }

  return new Date(task.dueAt).getTime() < Date.now();
}

function getPriorityDotClass(priority: WorkTaskPriority): string {
  if (priority === "urgent") {
    return "bg-destructive";
  }

  if (priority === "high") {
    return "bg-orange-500";
  }

  if (priority === "medium") {
    return "bg-amber-500";
  }

  return "bg-muted-foreground/40";
}

function getStatusVariant(
  status: WorkTaskStatus | string
): "default" | "secondary" | "outline" | "destructive" {
  if (status === "done" || status === "completed") {
    return "secondary";
  }

  if (status === "in_progress") {
    return "default";
  }

  if (status === "blocked" || status === "canceled" || status === "cancelled") {
    return "destructive";
  }

  return "outline";
}

function getTaskSummary(tasks: WorkTask[]) {
  return {
    openCount: tasks.filter((task) => task.status === "open").length,
    highPriorityCount: tasks.filter((task) => task.priority === "high").length,
    overdueCount: tasks.filter((task) => isTaskOverdue(task)).length,
  };
}

function TaskComments({ comments }: { comments: WorkTaskComment[] }) {
  const [open, setOpen] = useState(false);

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
        <MessageSquareText className="size-3.5 shrink-0" />
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </button>

      <div
        className={cn(
          "grid transition-all duration-200",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-2.5 space-y-2.5 pl-5">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-1">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {comment.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTaskCreatedAt(comment.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  href,
  onNavigate,
}: {
  task: WorkTask;
  href?: string | null;
  onNavigate?: () => void;
}) {
  const overdue = isTaskOverdue(task);

  return (
    <article className="space-y-3 rounded-sm bg-muted p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            getPriorityDotClass(task.priority)
          )}
          title={`${formatLabel(task.priority)} priority`}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            {href ? (
              <Link
                href={href}
                onClick={onNavigate}
                className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                <ExternalLink className="size-3.5 shrink-0" />
                <span className="truncate">{task.title}</span>
              </Link>
            ) : (
              <h4 className="truncate text-sm font-semibold">{task.title}</h4>
            )}
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant={
                  task.priority === "high" || task.priority === "urgent"
                    ? "destructive"
                    : "secondary"
                }
                className="font-normal"
              >
                {formatLabel(task.priority)}
              </Badge>
              <Badge variant={getStatusVariant(task.status)} className="font-normal">
                {formatLabel(task.status)}
              </Badge>
            </div>
          </div>

          {task.dueAt ? (
            <div
              className={cn(
                "flex items-center gap-2 text-xs",
                overdue ? "font-medium text-destructive" : "text-muted-foreground"
              )}
            >
              <CalendarClock className="size-3.5 shrink-0" />
              <span>
                {overdue ? "Overdue · " : "Due "}
                {formatTaskDueAt(task.dueAt)}
              </span>
            </div>
          ) : null}

          <TaskComments comments={task.comments} />
        </div>
      </div>
    </article>
  );
}

function TasksDrawerSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-sm bg-muted/30 p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

function SummaryStat({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "danger";
}) {
  return (
    <span
      className={cn(
        "text-xs",
        tone === "danger" ? "font-medium text-destructive" : "text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

export function TaskDrawer({
  title = "Tasks",
  subtitle,
  emptyTitle = "No tasks",
  emptyDescription = "Tasks will appear here when available.",
  tasks,
  isLoading,
  error,
  open,
  onOpenChange,
  getTaskHref,
}: TaskDrawerProps) {
  const summary = getTaskSummary(tasks);
  const resolvedSubtitle =
    subtitle ??
    `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="flex items-center gap-2">
            <CheckSquare className="size-4 text-primary" />
            {title}
          </DrawerTitle>
          <DrawerDescription>{resolvedSubtitle}</DrawerDescription>

          {!isLoading && !error && tasks.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
              <SummaryStat label={`${summary.openCount} open`} />
              {summary.highPriorityCount > 0 ? (
                <SummaryStat
                  label={`${summary.highPriorityCount} high priority`}
                  tone="danger"
                />
              ) : null}
              {summary.overdueCount > 0 ? (
                <SummaryStat
                  label={`${summary.overdueCount} overdue`}
                  tone="danger"
                />
              ) : null}
            </div>
          ) : null}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
          {isLoading ? (
            <TasksDrawerSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="size-8 text-destructive/70" />
              <p className="max-w-xs text-sm text-destructive">{error}</p>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title={emptyTitle}
              description={emptyDescription}
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  href={getTaskHref?.(task)}
                  onNavigate={() => onOpenChange(false)}
                />
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function TasksTrigger({
  label = "Tasks",
  taskCount,
  onClick,
  size = "default",
  className,
  hideWhenEmpty = true,
}: {
  label?: string;
  taskCount: number;
  onClick: () => void;
  size?: "default" | "sm";
  className?: string;
  hideWhenEmpty?: boolean;
}) {
  if (hideWhenEmpty && taskCount <= 0) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size === "sm" ? "sm" : "default"}
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <CheckSquare className="size-4" />
      {label}
      <Badge variant="secondary" className="min-w-5 h-5 justify-center px-1.5">
        {taskCount}
      </Badge>
    </Button>
  );
}

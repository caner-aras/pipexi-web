"use client";

import {
  CalendarClock,
  CheckSquare,
  ChevronRight,
  ExternalLink,
  Plus,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
  getTodayDateKeyUtc,
} from "@/lib/date-format";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/types/team";
import type {
  TeamMemberTask,
  WorkTaskPriority,
  WorkTaskStatus,
} from "@/types/team-member-task";
import {
  WORK_TASK_PRIORITIES,
  WORK_TASK_STATUSES,
  formatWorkTaskLabel,
  normalizeWorkTaskStatus,
} from "@/types/team-member-task";

interface TeamMemberTasksPageProps {
  teamMemberId: string;
  organizationId: string;
  defaultAssignedToTeamMemberId: string;
  assignableMembers: TeamMember[];
  memberName: string;
  initialTasks: TeamMemberTask[];
}

const PRIORITY_OPTIONS: Array<{ value: WorkTaskPriority; label: string }> =
  WORK_TASK_PRIORITIES.map((value) => ({
    value,
    label: formatWorkTaskLabel(value),
  }));

const STATUS_COLUMNS: Array<{
  status: WorkTaskStatus;
  title: string;
}> = WORK_TASK_STATUSES.map((status) => ({
  status,
  title: formatWorkTaskLabel(status),
}));

function formatTaskDueAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function isTaskOverdue(task: TeamMemberTask): boolean {
  const status = normalizeWorkTaskStatus(String(task.status));

  if (!task.dueAt || status === "done" || status === "canceled") {
    return false;
  }

  return new Date(task.dueAt).getTime() < Date.now();
}

function getPriorityBadgeVariant(
  priority: WorkTaskPriority | string
): "default" | "secondary" | "outline" | "destructive" {
  if (priority === "urgent" || priority === "high") {
    return "destructive";
  }

  if (priority === "medium") {
    return "default";
  }

  return "secondary";
}

function getPriorityDotClass(priority: WorkTaskPriority | string): string {
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

function combineLocalDateTimeToIso(dateKey: string, time: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}

function MemberPickerListItem({
  title,
  subtitle,
  selected,
  onSelect,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
        selected && "bg-muted/60"
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  organizationId,
  defaultAssignedToTeamMemberId,
  assignableMembers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  defaultAssignedToTeamMemberId?: string;
  assignableMembers: TeamMember[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<WorkTaskPriority>("medium");
  const [assignedToTeamMemberId, setAssignedToTeamMemberId] = useState(
    defaultAssignedToTeamMemberId ?? ""
  );
  const [dueDate, setDueDate] = useState(getTodayDateKeyUtc());
  const [dueTime, setDueTime] = useState("17:00");
  const [hasDueAt, setHasDueAt] = useState(true);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTimeout(() => {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setAssignedToTeamMemberId(defaultAssignedToTeamMemberId ?? "");
      setDueDate(getTodayDateKeyUtc());
      setDueTime("17:00");
      setHasDueAt(true);
      setMemberSearch("");
      setError(null);
    }, 0);
  }, [defaultAssignedToTeamMemberId, open]);

  const selectedMember =
    assignableMembers.find((member) => member.id === assignedToTeamMemberId) ??
    null;

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
      const jobTitle = member.organizationMember.jobTitle.toLowerCase();
      const teamName = member.team.name.toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        jobTitle.includes(query) ||
        teamName.includes(query)
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
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          title: title.trim(),
          description: description.trim() || null,
          assignedToTeamMemberId,
          dueAt: hasDueAt ? combineLocalDateTimeToIso(dueDate, dueTime) : null,
          priority,
        }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to create task.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Task created successfully");
      onOpenChange(false);
      router.refresh();
    } catch {
      const message = "Failed to create task.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedMemberName = selectedMember
    ? getShiftMemberDisplayName(selectedMember.organizationMember)
    : "Select member";
  const selectedMemberSubtitle = selectedMember
    ? `${selectedMember.organizationMember.user.email} · ${selectedMember.team.name}`
    : "Choose a team member";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              Assign a task to a team member.
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
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isSubmitting}
                placeholder="Task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <textarea
                id="task-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
                placeholder="Optional details"
                rows={3}
                className="flex w-full rounded-sm border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                items={PRIORITY_OPTIONS}
                value={priority}
                onValueChange={(value) => {
                  if (value) {
                    setPriority(value as WorkTaskPriority);
                  }
                }}
              >
                <SelectTrigger id="task-priority" className="w-full">
                  <SelectValue placeholder="Select priority" />
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

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="task-due-toggle">Due date</Label>
                <Button
                  id="task-due-toggle"
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
                    <Label htmlFor="task-due-time">Time</Label>
                    <Input
                      id="task-due-time"
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
              {isSubmitting ? "Creating…" : "Create task"}
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
              placeholder="Search members..."
            />
            <div className="max-h-72 overflow-y-auto rounded-sm border border-border/50">
              {filteredMembers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No members found.
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <MemberPickerListItem
                    key={member.id}
                    title={getShiftMemberDisplayName(member.organizationMember)}
                    subtitle={
                      member.organizationMember.jobTitle
                        ? `${member.organizationMember.user.email} · ${member.team.name} · ${member.organizationMember.jobTitle}`
                        : `${member.organizationMember.user.email} · ${member.team.name}`
                    }
                    selected={member.id === assignedToTeamMemberId}
                    onSelect={() => {
                      setAssignedToTeamMemberId(member.id);
                      setMemberPickerOpen(false);
                      setMemberSearch("");
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function KanbanTaskCard({
  task,
  assignableMembers,
}: {
  task: TeamMemberTask;
  assignableMembers: TeamMember[];
}) {
  const overdue = isTaskOverdue(task);
  const assignedMember = task.assignedToTeamMemberId
    ? assignableMembers.find(
        (member) => member.id === task.assignedToTeamMemberId
      )
    : null;
  const assignedName = assignedMember
    ? getShiftMemberDisplayName(assignedMember.organizationMember)
    : null;
  const href = task.assignedToTeamMemberId
    ? `/team-members/${task.assignedToTeamMemberId}/tasks/${task.id}`
    : null;

  const content = (
    <>
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            getPriorityDotClass(task.priority)
          )}
        />
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
          {task.title}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={getPriorityBadgeVariant(task.priority)}
          className="font-normal"
        >
          {formatWorkTaskLabel(String(task.priority))}
        </Badge>
      </div>

      {task.dueAt ? (
        <div
          className={cn(
            "flex items-center gap-1.5 text-xs",
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

      {assignedName ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <UserRound className="size-3.5 shrink-0" />
          <span className="truncate">{assignedName}</span>
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block space-y-2.5 rounded-sm border border-border/50 bg-background p-3 transition-colors hover:border-border/50 hover:bg-muted/30"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="block space-y-2.5 rounded-sm border border-border/50 bg-background p-3">
      {content}
    </div>
  );
}

export function TeamMemberTasksPageContent({
  organizationId,
  defaultAssignedToTeamMemberId,
  assignableMembers,
  memberName,
  initialTasks,
}: TeamMemberTasksPageProps) {
  const [createOpen, setCreateOpen] = useState(false);

  const tasksByStatus = useMemo(() => {
    const grouped = Object.fromEntries(
      WORK_TASK_STATUSES.map((status) => [status, [] as TeamMemberTask[]])
    ) as Record<WorkTaskStatus, TeamMemberTask[]>;

    for (const task of initialTasks) {
      const status = normalizeWorkTaskStatus(String(task.status));
      grouped[status].push(task);
    }

    return grouped;
  }, [initialTasks]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              Board for
              <Link
                href={`/team-members/${defaultAssignedToTeamMemberId}`}
                className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
              >
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                {memberName}
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              {initialTasks.length}{" "}
              {initialTasks.length === 1 ? "task" : "tasks"} across statuses
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New task
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {STATUS_COLUMNS.map((column) => {
              const columnTasks = tasksByStatus[column.status];

              return (
                <section
                  key={column.status}
                  className="flex min-w-0 flex-col rounded-sm bg-muted/40"
                >
                  <header className="flex items-center justify-between gap-2 px-3 py-3">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="size-3.5 text-muted-foreground" />
                      <h3 className="text-sm font-medium">{column.title}</h3>
                    </div>
                    <Badge variant="secondary" className="font-normal">
                      {columnTasks.length}
                    </Badge>
                  </header>

                  <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
                    {columnTasks.length === 0 ? (
                      <div className="rounded-sm border border-dashed border-border/50 px-3 py-8 text-center text-xs text-muted-foreground">
                        No tasks
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <KanbanTaskCard
                          key={task.id}
                          task={task}
                          assignableMembers={assignableMembers}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
        </div>
      </div>

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        organizationId={organizationId}
        defaultAssignedToTeamMemberId={defaultAssignedToTeamMemberId}
        assignableMembers={assignableMembers}
      />
    </>
  );
}

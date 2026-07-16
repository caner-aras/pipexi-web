"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, UserRound } from "lucide-react";
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
  type DialogAnchorRect,
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
import { Textarea } from "@/components/ui/textarea";
import { formatLocalDateKey } from "@/lib/date-format";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { OrganizationMember } from "@/types/member";
import {
  formatNotificationStatusLabel,
  formatNotificationTypeLabel,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
  type Notification,
} from "@/types/notification";

function padTimePart(value: number): string {
  return String(value).padStart(2, "0");
}

function scheduledTimeToDateKey(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatLocalDateKey(date);
}

function scheduledTimeToTimeValue(value: string | null | undefined): string {
  if (!value) {
    return "09:00";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "09:00";
  }

  return `${padTimePart(date.getHours())}:${padTimePart(date.getMinutes())}`;
}

function toScheduledTimeIso(dateKey: string, time: string): string | null {
  if (!dateKey || !time) {
    return null;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
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

interface NotificationFormBodyProps {
  organizationId: string;
  members: OrganizationMember[];
  notification: Notification | null;
  onOpenChange: (open: boolean) => void;
}

function NotificationFormBody({
  organizationId,
  members,
  notification,
  onOpenChange,
}: NotificationFormBodyProps) {
  const router = useRouter();
  const isEditing = Boolean(notification);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    notification?.organizationMemberId ?? members[0]?.id ?? null
  );
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState<DialogAnchorRect | null>(
    null
  );
  const memberPickerOpenRef = useRef(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [type, setType] = useState(
    notification?.type?.toLowerCase() ?? NOTIFICATION_TYPES[0]
  );
  const [title, setTitle] = useState(notification?.title ?? "");
  const [body, setBody] = useState(notification?.body ?? "");
  const [isRead, setIsRead] = useState(notification?.isRead ?? false);
  const [hasScheduledTime, setHasScheduledTime] = useState(
    Boolean(notification?.scheduledTime)
  );
  const [scheduledDateKey, setScheduledDateKey] = useState(
    scheduledTimeToDateKey(notification?.scheduledTime)
  );
  const [scheduledTimeValue, setScheduledTimeValue] = useState(
    scheduledTimeToTimeValue(notification?.scheduledTime)
  );
  const [status, setStatus] = useState(notification?.status ?? "active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    memberPickerOpenRef.current = memberPickerOpen;
  }, [memberPickerOpen]);

  function openMemberPicker(anchorEl?: HTMLElement | null) {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setPickerAnchor({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setPickerAnchor(null);
    }

    setMemberPickerOpen(true);
  }

  function closeMemberPicker() {
    setMemberPickerOpen(false);
    setMemberSearch("");
  }

  function handleMemberPickerOpenChange(open: boolean) {
    if (open) {
      setMemberPickerOpen(true);
      return;
    }

    closeMemberPicker();
  }

  function handleMemberPickerOpenChangeComplete(open: boolean) {
    if (!open && !memberPickerOpenRef.current) {
      setPickerAnchor(null);
    }
  }

  const typeOptions = useMemo(
    () =>
      NOTIFICATION_TYPES.map((value) => ({
        value,
        label: formatNotificationTypeLabel(value),
      })),
    []
  );

  const statusOptions = useMemo(
    () =>
      NOTIFICATION_STATUSES.map((value) => ({
        value,
        label: formatNotificationStatusLabel(value),
      })),
    []
  );

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? null;

  const filteredMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();

    if (!query) {
      return members;
    }

    return members.filter((member) => {
      const name = getShiftMemberDisplayName(member).toLowerCase();
      const email = member.user.email.toLowerCase();
      const jobTitle = member.jobTitle?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        jobTitle.includes(query)
      );
    });
  }, [memberSearch, members]);

  async function handleSubmit() {
    if (!isEditing && !selectedMemberId) {
      setError("Recipient is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const scheduledTime =
      hasScheduledTime && scheduledDateKey
        ? toScheduledTimeIso(scheduledDateKey, scheduledTimeValue)
        : null;

    if (hasScheduledTime && !scheduledTime) {
      setError("Scheduled date and time are required when scheduling.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        isEditing
          ? `/api/notifications/${notification!.id}`
          : "/api/notifications",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing
              ? {
                  type,
                  title: title.trim(),
                  body: body.trim(),
                  isRead,
                  scheduledTime,
                  status,
                }
              : {
                  organizationId,
                  organizationMemberId: selectedMemberId,
                  type,
                  title: title.trim(),
                  body: body.trim(),
                  isRead,
                  scheduledTime,
                }
          ),
        }
      );

      const responseBody = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          responseBody.message ??
          (isEditing
            ? "Failed to update notification."
            : "Failed to create notification.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing
          ? "Notification updated successfully"
          : "Notification created successfully"
      );
      onOpenChange(false);
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update notification."
        : "Failed to create notification.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(title.trim()) &&
    Boolean(body.trim()) &&
    Boolean(type) &&
    (isEditing ? Boolean(status) : Boolean(selectedMemberId)) &&
    (!hasScheduledTime ||
      (Boolean(scheduledDateKey) && Boolean(scheduledTimeValue)));

  const recipientName = selectedMember
    ? getShiftMemberDisplayName(selectedMember)
    : "Select member";
  const recipientSubtitle = selectedMember
    ? selectedMember.jobTitle
      ? `${selectedMember.user.email} · ${selectedMember.jobTitle}`
      : selectedMember.user.email
    : "Choose who receives this notification";

  return (
    <>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit notification" : "New notification"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update ${notification?.title}.`
              : "Send a notification to an organization member."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,40rem)] space-y-4 overflow-y-auto py-1">
          <div className="space-y-2">
            <Label>Recipient</Label>
            {isEditing ? (
              <div className="flex h-auto w-full items-center gap-2 rounded-lg border border-input px-3 py-2.5 text-left">
                <UserRound className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{recipientName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {recipientSubtitle}
                  </span>
                </span>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-auto w-full justify-between px-3 py-2.5"
                onClick={(event) => openMemberPicker(event.currentTarget)}
                disabled={isSubmitting || members.length === 0}
              >
                <span className="flex min-w-0 items-center gap-2 text-left">
                  <UserRound className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{recipientName}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {recipientSubtitle}
                    </span>
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                items={typeOptions}
                value={type}
                onValueChange={(value) => {
                  if (value) {
                    setType(value);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  items={statusOptions}
                  value={status}
                  onValueChange={(value) => {
                    if (value) {
                      setStatus(value);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-end">
                <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-muted/35 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">Marked as read</p>
                    <p className="text-xs text-muted-foreground">
                      Starts unread by default.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={isRead ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsRead((value) => !value)}
                    disabled={isSubmitting}
                  >
                    {isRead ? "Read" : "Unread"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-title">Title</Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
              placeholder="Shift reminder"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-body">Body</Label>
            <Textarea
              id="notification-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              disabled={isSubmitting}
              rows={5}
              placeholder="Write the notification message…"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="notification-schedule-toggle">
                Scheduled time
              </Label>
              <Button
                id="notification-schedule-toggle"
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  setHasScheduledTime((value) => {
                    const next = !value;

                    if (next && !scheduledDateKey) {
                      setScheduledDateKey(formatLocalDateKey(new Date()));
                    }

                    return next;
                  });
                }}
                disabled={isSubmitting}
              >
                {hasScheduledTime ? "Clear" : "Set schedule"}
              </Button>
            </div>

            {hasScheduledTime ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <DatePicker
                    value={scheduledDateKey}
                    onChange={setScheduledDateKey}
                    disabled={isSubmitting}
                    showIcon
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-scheduled-time">Time</Label>
                  <Input
                    id="notification-scheduled-time"
                    type="time"
                    value={scheduledTimeValue}
                    onChange={(event) =>
                      setScheduledTimeValue(event.target.value)
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No scheduled time — notification is available immediately.
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/35 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Marked as read</p>
                <p className="text-xs text-muted-foreground">
                  Unread notifications highlight in the header.
                </p>
              </div>
              <Button
                type="button"
                variant={isRead ? "default" : "outline"}
                size="sm"
                onClick={() => setIsRead((value) => !value)}
                disabled={isSubmitting}
              >
                {isRead ? "Read" : "Unread"}
              </Button>
            </div>
          ) : null}

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
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting
              ? isEditing
                ? "Saving…"
                : "Creating…"
              : isEditing
                ? "Save changes"
                : "Create notification"}
          </Button>
        </DialogFooter>
      </DialogContent>

      <Dialog
        open={memberPickerOpen}
        onOpenChange={handleMemberPickerOpenChange}
        onOpenChangeComplete={handleMemberPickerOpenChangeComplete}
      >
        <DialogContent
          className="w-[min(28rem,calc(100vw-2rem))] sm:max-w-md"
          anchor={pickerAnchor}
          style={{
            width: "min(28rem, calc(100vw - 2rem))",
            maxWidth: "28rem",
          }}
          initialFocus={false}
          finalFocus={false}
        >
          <DialogHeader>
            <DialogTitle>Select member</DialogTitle>
            <DialogDescription>
              Choose who should receive this notification.
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
                    title={getShiftMemberDisplayName(member)}
                    subtitle={
                      member.jobTitle
                        ? `${member.user.email} · ${member.jobTitle}`
                        : member.user.email
                    }
                    selected={member.id === selectedMemberId}
                    onSelect={() => {
                      setSelectedMemberId(member.id);
                      closeMemberPicker();
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

interface NotificationFormDialogProps {
  organizationId: string;
  members: OrganizationMember[];
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
}

export function NotificationFormDialog({
  organizationId,
  members,
  notification,
  open,
  onOpenChange,
  onOpenChangeComplete,
}: NotificationFormDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      {open ? (
        <NotificationFormBody
          key={notification?.id ?? "new"}
          organizationId={organizationId}
          members={members}
          notification={notification}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

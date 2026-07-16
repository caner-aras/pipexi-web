"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { OrganizationMember } from "@/types/member";

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

interface AuditLogFormProps {
  organizationId: string;
  members: OrganizationMember[];
  onCancel: () => void;
  onSaved: () => void;
}

function AuditLogForm({
  organizationId,
  members,
  onCancel,
  onSaved,
}: AuditLogFormProps) {
  const router = useRouter();
  const [actorMemberId, setActorMemberId] = useState<string | null>(null);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [entityName, setEntityName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [action, setAction] = useState("create");
  const [beforeJson, setBeforeJson] = useState("");
  const [afterJson, setAfterJson] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMember =
    members.find((member) => member.id === actorMemberId) ?? null;

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
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          actorMemberId,
          entityName: entityName.trim(),
          entityId: entityId.trim(),
          action: action.trim().toLowerCase(),
          beforeJson: beforeJson.trim() || null,
          afterJson: afterJson.trim() || null,
        }),
      });

      const responseBody = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = responseBody.message ?? "Failed to create audit log.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Audit log created successfully");
      onSaved();
      router.refresh();
    } catch {
      const message = "Failed to create audit log.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(entityName.trim()) &&
    Boolean(entityId.trim()) &&
    Boolean(action.trim());

  const actorName = selectedMember
    ? getShiftMemberDisplayName(selectedMember)
    : "No actor";
  const actorSubtitle = selectedMember
    ? selectedMember.jobTitle
      ? `${selectedMember.user.email} · ${selectedMember.jobTitle}`
      : selectedMember.user.email
    : "Optional — leave empty for system actions";

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Actor</Label>
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-between px-3 py-2.5"
              onClick={() => setMemberPickerOpen(true)}
              disabled={isSubmitting || members.length === 0}
            >
              <span className="flex min-w-0 items-center gap-2 text-left">
                <UserRound className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{actorName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {actorSubtitle}
                  </span>
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Button>
            {actorMemberId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setActorMemberId(null)}
                disabled={isSubmitting}
              >
                Clear actor
              </Button>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-entity-name">Entity name</Label>
            <Input
              id="audit-entity-name"
              value={entityName}
              onChange={(event) => setEntityName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Shift"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-entity-id">Entity id</Label>
            <Input
              id="audit-entity-id"
              value={entityId}
              onChange={(event) => setEntityId(event.target.value)}
              disabled={isSubmitting}
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-action">Action</Label>
            <Input
              id="audit-action"
              value={action}
              onChange={(event) => setAction(event.target.value)}
              disabled={isSubmitting}
              placeholder="create"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-before">Before JSON</Label>
            <Textarea
              id="audit-before"
              value={beforeJson}
              onChange={(event) => setBeforeJson(event.target.value)}
              disabled={isSubmitting}
              rows={4}
              placeholder='{"status":"draft"}'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-after">After JSON</Label>
            <Textarea
              id="audit-after"
              value={afterJson}
              onChange={(event) => setAfterJson(event.target.value)}
              disabled={isSubmitting}
              rows={4}
              placeholder='{"status":"published"}'
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <DrawerFooter>
        <Button
          onClick={() => void handleSubmit()}
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? "Creating…" : "Create audit log"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>

      <Dialog open={memberPickerOpen} onOpenChange={setMemberPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select actor</DialogTitle>
            <DialogDescription>
              Optionally attach an organization member as the actor.
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
                    selected={member.id === actorMemberId}
                    onSelect={() => {
                      setActorMemberId(member.id);
                      setMemberPickerOpen(false);
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

interface AuditLogDrawerProps {
  organizationId: string;
  members: OrganizationMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDrawer({
  organizationId,
  members,
  open,
  onOpenChange,
}: AuditLogDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>New audit log</DrawerTitle>
          <DrawerDescription>
            Append a manual audit event for this organization.
          </DrawerDescription>
        </DrawerHeader>

        <AuditLogForm
          key={open ? "open" : "closed"}
          organizationId={organizationId}
          members={members}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

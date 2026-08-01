"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/conversation";
import type { OrganizationMember } from "@/types/member";

type CreateGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: OrganizationMember[];
  onCreated: (conversation: Conversation) => void;
};

export function CreateGroupDialog({
  open,
  onOpenChange,
  members,
  onCreated,
}: CreateGroupDialogProps) {
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const aName = `${a.user.firstName} ${a.user.lastName}`.trim() || a.user.email;
        const bName = `${b.user.firstName} ${b.user.lastName}`.trim() || b.user.email;
        return aName.localeCompare(bName);
      }),
    [members]
  );

  function toggleMember(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  async function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Enter a group name.");
      return;
    }
    if (selectedIds.length < 2) {
      setError("Select at least two other members.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "group",
          title: trimmed,
          organizationMemberIds: selectedIds,
        }),
      });
      const body = (await response.json()) as {
        data?: Conversation;
        message?: string;
      };
      if (!response.ok || !body.data) {
        throw new Error(body.message ?? "Failed to create group.");
      }
      onCreated(body.data);
      setTitle("");
      setSelectedIds([]);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>
            Pick at least two people. You are added automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Group name</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Front of house"
            />
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
            {sortedMembers.map((member) => {
              const name =
                `${member.user.firstName} ${member.user.lastName}`.trim() ||
                member.user.email;
              const selected = selectedIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-muted/70",
                    selected && "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded border text-[10px]",
                      selected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-border"
                    )}
                  >
                    {selected ? "✓" : ""}
                  </span>
                  <PersonAvatar
                    name={name}
                    userId={member.userId}
                    avatarUrl={member.user.avatarUrl}
                    size="xs"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
                </button>
              );
            })}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => {
              void handleCreate();
            }}
          >
            {isSubmitting ? "Creating…" : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

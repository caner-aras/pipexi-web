"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_STATUS_OPTIONS } from "@/lib/record-status";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import type { TeamMember } from "@/types/team";

interface TeamMemberEditFormProps {
  member: TeamMember;
  onCancel: () => void;
  onSaved: () => void;
}

function TeamMemberEditForm({
  member,
  onCancel,
  onSaved,
}: TeamMemberEditFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(member.status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!status) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to update team member";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Team member updated successfully");
      onSaved();
      router.refresh();
    } catch {
      setError("Failed to update team member");
      toast.error("Failed to update team member");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              items={ENTITY_STATUS_OPTIONS}
              value={status}
              onValueChange={(value) => {
                if (value) {
                  setStatus(value);
                }
              }}
            >
              <SelectTrigger className="w-full" disabled={isSaving}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSave} disabled={isSaving || !status}>
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface EditTeamMemberDrawerProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTeamMemberDrawer({
  member,
  open,
  onOpenChange,
}: EditTeamMemberDrawerProps) {
  const displayName = member
    ? getShiftMemberDisplayName(member.organizationMember)
    : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Edit member</DrawerTitle>
          <DrawerDescription>
            {displayName
              ? `Update ${displayName} team membership.`
              : "Update team member details."}
          </DrawerDescription>
        </DrawerHeader>

        {member ? (
          <TeamMemberEditForm
            key={member.id}
            member={member}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

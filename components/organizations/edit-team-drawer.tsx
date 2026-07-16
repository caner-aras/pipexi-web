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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENTITY_STATUS_OPTIONS } from "@/lib/record-status";
import type { OrganizationMember } from "@/types/member";
import type { Team } from "@/types/team";

function getMemberLabel(member: OrganizationMember): string {
  const name =
    `${member.user.firstName} ${member.user.lastName}`.trim() ||
    member.user.email;

  return member.jobTitle ? `${name} · ${member.jobTitle}` : name;
}

interface EditTeamFormProps {
  team: Team;
  members: OrganizationMember[];
  onCancel: () => void;
  onSaved: () => void;
}

function EditTeamForm({
  team,
  members,
  onCancel,
  onSaved,
}: EditTeamFormProps) {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [managerMemberId, setManagerMemberId] = useState<string | null>(
    team.managerMemberId
  );
  const [status, setStatus] = useState<string | null>(
    team.status.toLowerCase()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!managerMemberId || !status) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          managerMemberId,
          status,
        }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to update team.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Team updated successfully");
      onSaved();
      router.refresh();
    } catch {
      setError("Failed to update team.");
      toast.error("Failed to update team.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(name.trim()) && Boolean(managerMemberId) && Boolean(status);
  const hasChanges =
    name.trim() !== team.name ||
    managerMemberId !== team.managerMemberId ||
    status !== team.status.toLowerCase();

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-team-name">Team name</Label>
            <Input
              id="edit-team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Manager</Label>
            <Select
              items={members.map((member) => ({
                value: member.id,
                label: getMemberLabel(member),
              }))}
              value={managerMemberId}
              onValueChange={(value) => {
                if (value) {
                  setManagerMemberId(value);
                }
              }}
            >
              <SelectTrigger className="w-full" disabled={isSubmitting}>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {getMemberLabel(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              <SelectTrigger className="w-full" disabled={isSubmitting}>
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
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isValid || !hasChanges}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface EditTeamDrawerProps {
  organizationId: string;
  team: Team | null;
  members: OrganizationMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTeamDrawer({
  team,
  members,
  open,
  onOpenChange,
}: EditTeamDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Edit team</DrawerTitle>
          <DrawerDescription>
            {team
              ? `Update ${team.name} details and manager.`
              : "Update team details and manager."}
          </DrawerDescription>
        </DrawerHeader>

        {team ? (
          <EditTeamForm
            key={team.id}
            team={team}
            members={members}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

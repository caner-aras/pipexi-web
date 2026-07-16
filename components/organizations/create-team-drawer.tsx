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
import type { OrganizationMember } from "@/types/member";

function getMemberLabel(member: OrganizationMember): string {
  const name =
    `${member.user.firstName} ${member.user.lastName}`.trim() ||
    member.user.email;

  return member.jobTitle ? `${name} · ${member.jobTitle}` : name;
}

type TeamDefaults = {
  name: string;
  managerMemberId: string;
};

interface CreateTeamFormProps {
  organizationId: string;
  members: OrganizationMember[];
  defaultManagerMemberId: string | null;
  defaults?: TeamDefaults | null;
  onCancel: () => void;
  onCreated: () => void;
}

function CreateTeamForm({
  organizationId,
  members,
  defaultManagerMemberId,
  defaults = null,
  onCancel,
  onCreated,
}: CreateTeamFormProps) {
  const router = useRouter();
  const [name, setName] = useState(defaults?.name ?? "");
  const [managerMemberId, setManagerMemberId] = useState<string | null>(
    defaults?.managerMemberId ??
      defaultManagerMemberId ??
      members[0]?.id ??
      null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!managerMemberId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/teams`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            managerMemberId,
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to create team.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Team created successfully");
      onCreated();
      router.refresh();
    } catch {
      setError("Failed to create team.");
      toast.error("Failed to create team.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = Boolean(name.trim()) && Boolean(managerMemberId);

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Operations"
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

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Creating..." : "Create team"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface CreateTeamDrawerProps {
  organizationId: string;
  members: OrganizationMember[];
  defaultManagerMemberId: string | null;
  defaults?: TeamDefaults | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeamDrawer({
  organizationId,
  members,
  defaultManagerMemberId,
  defaults = null,
  open,
  onOpenChange,
}: CreateTeamDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {defaults ? "Duplicate team" : "New team"}
          </DrawerTitle>
          <DrawerDescription>
            {defaults
              ? "Create a copy of this team."
              : "Create a team and assign a manager for this organization."}
          </DrawerDescription>
        </DrawerHeader>

        <CreateTeamForm
          key={
            defaults
              ? `duplicate-${defaults.name}-${defaults.managerMemberId}`
              : `${organizationId}-${defaultManagerMemberId ?? "none"}`
          }
          organizationId={organizationId}
          members={members}
          defaultManagerMemberId={defaultManagerMemberId}
          defaults={defaults}
          onCancel={() => onOpenChange(false)}
          onCreated={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

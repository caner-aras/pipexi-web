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
import type { OrganizationRole } from "@/types/role";
import type { Team } from "@/types/team";

interface AddTeamMemberFormProps {
  organizationId: string;
  team: Team | null;
  teams: Team[];
  roles: OrganizationRole[];
  onCancel: () => void;
  onAdded: (teamId: string) => void;
}

function AddTeamMemberForm({
  organizationId,
  team,
  teams,
  roles,
  onCancel,
  onAdded,
}: AddTeamMemberFormProps) {
  const router = useRouter();
  const requiresTeamSelection = team == null;
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    team?.id ?? teams[0]?.id ?? null
  );
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState<string | null>(roles[0]?.id ?? null);
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedTeam =
    team ?? teams.find((item) => item.id === selectedTeamId) ?? null;

  async function handleSubmit() {
    if (!roleId || !resolvedTeam) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/teams/${resolvedTeam.id}/members/onboard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            roleId,
            jobTitle,
            phone: phone.trim() ? phone.trim() : null,
            avatarUrl: null,
            authProviderId: null,
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to add team member";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Team member added successfully");
      onAdded(resolvedTeam.id);
      router.refresh();
    } catch {
      setError("Failed to add team member");
      toast.error("Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(resolvedTeam) &&
    email.trim() &&
    firstName.trim() &&
    lastName.trim() &&
    roleId &&
    jobTitle.trim();

  if (requiresTeamSelection && teams.length === 0) {
    return (
      <>
        <div className="mt-10 flex-1 overflow-y-auto px-4 pb-4">
          <p className="text-sm text-muted-foreground">
            Create a team first before adding members. Members must belong to a
            team.
          </p>
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </DrawerFooter>
      </>
    );
  }

  return (
    <>
      <div className="mt-10 flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-4">
          {requiresTeamSelection ? (
            <div className="flex flex-col gap-2">
              <Label>Team</Label>
              <Select
                items={teams.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={selectedTeamId}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedTeamId(value);
                  }
                }}
              >
                <SelectTrigger className="w-full" disabled={isSubmitting}>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              placeholder="new.member@company.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Role</Label>
            <Select
              items={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              value={roleId}
              onValueChange={(value) => {
                if (value) {
                  setRoleId(value);
                }
              }}
            >
              <SelectTrigger className="w-full" disabled={isSubmitting}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              disabled={isSubmitting}
              placeholder="Field Staff"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Adding..." : "Add member"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface AddTeamMemberDrawerProps {
  organizationId: string;
  team?: Team | null;
  teams?: Team[];
  roles: OrganizationRole[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: (teamId: string) => void;
}

export function AddTeamMemberDrawer({
  organizationId,
  team = null,
  teams = [],
  roles,
  open,
  onOpenChange,
  onAdded,
}: AddTeamMemberDrawerProps) {
  function handleAdded(teamId: string) {
    onOpenChange(false);
    onAdded(teamId);
  }

  const description = team
    ? `Onboard a new member to ${team.name}.`
    : "Select a team and onboard a new member.";

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>Add team member</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>

        <AddTeamMemberForm
          key={`${team?.id ?? "pick-team"}-${open ? "open" : "closed"}`}
          organizationId={organizationId}
          team={team}
          teams={teams}
          roles={roles}
          onCancel={() => onOpenChange(false)}
          onAdded={handleAdded}
        />
      </DrawerContent>
    </Drawer>
  );
}

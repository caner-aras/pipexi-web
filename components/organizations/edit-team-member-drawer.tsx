"use client";

import { Camera, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  generateRandomAvatarOptions,
  resolveAvatarUrl,
} from "@/lib/avatar";
import { ENTITY_STATUS_OPTIONS } from "@/lib/record-status";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import type { TeamMember } from "@/types/team";

function getMemberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

interface MemberAvatarPickerProps {
  name: string;
  userId: string;
  avatarUrl: string | null;
  disabled?: boolean;
  onChange: (avatarUrl: string) => void;
}

function MemberAvatarPicker({
  name,
  userId,
  avatarUrl,
  disabled = false,
  onChange,
}: MemberAvatarPickerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedAvatarUrl = avatarUrl ?? resolveAvatarUrl(userId, null);
  const showImage = Boolean(resolvedAvatarUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedAvatarUrl]);

  function openPicker() {
    if (disabled) {
      return;
    }

    setOptions(generateRandomAvatarOptions(8));
    setPickerOpen(true);
  }

  if (pickerOpen) {
    return (
      <div className="space-y-4 rounded-md border border-border/50 bg-muted/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">Choose photo</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPickerOpen(false)}
          >
            Back
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Pick a generated avatar or shuffle for a new set.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {options.map((optionUrl) => (
            <button
              key={optionUrl}
              type="button"
              className={`aspect-square overflow-hidden rounded-full border-2 transition-colors ${
                avatarUrl === optionUrl
                  ? "border-primary"
                  : "border-border/50 hover:border-border"
              }`}
              onClick={() => {
                onChange(optionUrl);
                setPickerOpen(false);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={optionUrl} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setOptions(generateRandomAvatarOptions(8))}
        >
          <RefreshCw className="size-4" />
          Shuffle
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <button
        type="button"
        className="relative disabled:cursor-not-allowed disabled:opacity-60"
        onClick={openPicker}
        disabled={disabled}
      >
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted text-xl font-semibold text-muted-foreground">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedAvatarUrl!}
              alt=""
              className="size-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            getMemberInitials(name)
          )}
        </div>
        <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground">
          <Camera className="size-3.5" />
        </span>
      </button>
    </div>
  );
}

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
  const user = member.organizationMember.user;
  const orgMember = member.organizationMember;

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [jobTitle, setJobTitle] = useState(orgMember.jobTitle);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    resolveAvatarUrl(user.id, user.avatarUrl)
  );
  const [status, setStatus] = useState<string | null>(member.status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = getShiftMemberDisplayName(member.organizationMember);
  const isValid =
    Boolean(firstName.trim()) &&
    Boolean(lastName.trim()) &&
    Boolean(jobTitle.trim()) &&
    Boolean(status);

  async function handleSave() {
    if (!status || !isValid) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const userResponse = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          avatarUrl: avatarUrl?.trim() ?? "",
        }),
      });

      const userBody = (await userResponse.json()) as { message?: string };
      if (!userResponse.ok) {
        const message = userBody.message ?? "Failed to update member profile";
        setError(message);
        toast.error(message);
        return;
      }

      const orgResponse = await fetch(`/api/organization-members/${orgMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          status: orgMember.status,
        }),
      });

      const orgBody = (await orgResponse.json()) as { message?: string };
      if (!orgResponse.ok) {
        const message = orgBody.message ?? "Failed to update member details";
        setError(message);
        toast.error(message);
        return;
      }

      const teamResponse = await fetch(`/api/teams/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const teamBody = (await teamResponse.json()) as { message?: string };
      if (!teamResponse.ok) {
        const message = teamBody.message ?? "Failed to update team membership";
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
          <MemberAvatarPicker
            name={displayName}
            userId={user.id}
            avatarUrl={avatarUrl}
            disabled={isSaving}
            onChange={setAvatarUrl}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member-first-name">First name</Label>
              <Input
                id="member-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-last-name">Last name</Label>
              <Input
                id="member-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              type="email"
              value={user.email}
              disabled
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-job-title">Job title</Label>
            <Input
              id="member-job-title"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              disabled={isSaving}
              placeholder="Field Staff"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-phone">Phone (optional)</Label>
            <Input
              id="member-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              disabled={isSaving}
              placeholder="+90 555 000 0000"
            />
          </div>

          <div className="space-y-2">
            <Label>Team membership status</Label>
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
        <Button onClick={handleSave} disabled={isSaving || !isValid}>
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
              ? `Update ${displayName} profile and team membership.`
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

interface MemberEditFormProps {
  member: OrganizationMember;
  onCancel: () => void;
  onSaved: () => void;
}

function MemberEditForm({ member, onCancel, onSaved }: MemberEditFormProps) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState(member.jobTitle);
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
      const response = await fetch(`/api/organization-members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, status }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(body.message ?? "Failed to update member");
        toast.error(body.message ?? "Failed to update member");
        return;
      }

      toast.success("Member updated successfully");
      onSaved();
      router.refresh();
    } catch {
      setError("Failed to update member");
      toast.error("Failed to update member");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 pb-4 mt-10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-2">
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
        <Button
          onClick={handleSave}
          disabled={isSaving || !status || !jobTitle.trim()}
        >
          {isSaving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface EditOrganizationMemberDrawerProps {
  member: OrganizationMember | null;
  isLoading: boolean;
  loadError: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrganizationMemberDrawer({
  member,
  isLoading,
  loadError,
  open,
  onOpenChange,
}: EditOrganizationMemberDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit member</DrawerTitle>
          <DrawerDescription>
            {member
              ? `Update ${member.user.firstName} ${member.user.lastName} details.`
              : "Update organization member details."}
          </DrawerDescription>
        </DrawerHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading member...
          </div>
        ) : loadError ? (
          <p className="px-4 py-8 text-sm text-destructive">{loadError}</p>
        ) : member ? (
          <MemberEditForm
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

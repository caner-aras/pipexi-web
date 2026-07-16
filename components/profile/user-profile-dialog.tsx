"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/types/auth";

interface UserProfileFormProps {
  user: UserProfile;
  onCancel: () => void;
  onSaved: () => void;
}

function UserProfileForm({ user, onCancel, onSaved }: UserProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          avatarUrl: avatarUrl.trim(),
        }),
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to update profile.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Profile updated successfully");
      onSaved();
      router.refresh();
    } catch {
      const message = "Failed to update profile.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = Boolean(firstName.trim()) && Boolean(lastName.trim());

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={user.email} disabled readOnly />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-first-name">First name</Label>
            <Input
              id="profile-first-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-last-name">Last name</Label>
            <Input
              id="profile-last-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-phone">Phone</Label>
          <Input
            id="profile-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            disabled={isSubmitting}
            placeholder="+90 555 000 0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-avatar-url">Avatar URL</Label>
          <Input
            id="profile-avatar-url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            disabled={isSubmitting}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter className="mt-2 sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

interface UserProfileDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadFresh?: boolean;
  title?: string;
  description?: string;
}

export function UserProfileDialog({
  user,
  open,
  onOpenChange,
  loadFresh = false,
  title = "Profile",
  description = "Update personal information.",
}: UserProfileDialogProps) {
  const [fetchedUser, setFetchedUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !loadFresh) {
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/auth/me");
        const body = (await response.json()) as {
          data?: {
            userId: string;
            email: string | null;
            firstName: string;
            lastName: string;
            phone?: string | null;
            avatarUrl?: string | null;
          };
          message?: string;
        };

        if (cancelled) {
          return;
        }

        if (response.ok && body.data) {
          setFetchedUser({
            userId: body.data.userId,
            email: body.data.email ?? "",
            firstName: body.data.firstName,
            lastName: body.data.lastName,
            phone: body.data.phone,
            avatarUrl: body.data.avatarUrl,
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [open, loadFresh]);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setFetchedUser(null);
      setIsLoading(false);
    }
  }

  const profileUser = loadFresh ? (fetchedUser ?? user) : user;
  const showLoading = loadFresh && isLoading && !profileUser;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {showLoading || !profileUser ? (
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        ) : (
          <UserProfileForm
            key={
              profileUser.userId +
              profileUser.firstName +
              profileUser.lastName +
              (profileUser.phone ?? "")
            }
            user={profileUser}
            onCancel={() => handleOpenChange(false)}
            onSaved={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function authUserToProfile(user: {
  userId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
}): UserProfile {
  return {
    userId: user.userId,
    email: user.email ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  };
}

export function organizationMemberUserToProfile(member: {
  userId: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
  };
}): UserProfile {
  return {
    userId: member.userId,
    email: member.user.email,
    firstName: member.user.firstName,
    lastName: member.user.lastName,
    phone: member.user.phone,
    avatarUrl: member.user.avatarUrl,
  };
}

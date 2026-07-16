"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TimezonePicker } from "@/components/organizations/timezone-picker";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Organization } from "@/types/auth";

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function OrganizationFormSkeleton() {
  return (
    <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
      <div className="space-y-4">
        <Skeleton className="h-10 rounded-sm" />
        <Skeleton className="h-10 rounded-sm" />
        <Skeleton className="h-10 rounded-sm" />
      </div>
    </div>
  );
}

interface OrganizationFormProps {
  organization: Organization | null;
  defaults?: Pick<Organization, "name" | "slug" | "timezone"> | null;
  defaultTimezone: string;
  onCancel: () => void;
  onSaved: () => void;
}

function OrganizationForm({
  organization,
  defaults = null,
  defaultTimezone,
  onCancel,
  onSaved,
}: OrganizationFormProps) {
  const router = useRouter();
  const isEditing = Boolean(organization);

  const [name, setName] = useState(
    organization?.name ?? defaults?.name ?? ""
  );
  const [slug, setSlug] = useState(
    organization?.slug ?? defaults?.slug ?? ""
  );
  const [isSlugManual, setIsSlugManual] = useState(
    Boolean(organization?.slug || defaults?.slug)
  );
  const [timezone, setTimezone] = useState<string | null>(
    organization?.timezone ?? defaults?.timezone ?? defaultTimezone
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setName(value);

    if (!isSlugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setIsSlugManual(value.trim().length > 0);
  }

  async function handleSubmit() {
    if (!timezone) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      timezone,
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/organizations/${organization!.id}`
          : "/api/organizations",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          body.message ??
          (isEditing
            ? "Failed to update organization."
            : "Failed to create organization.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing
          ? "Organization updated successfully"
          : "Organization created successfully"
      );
      onSaved();
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update organization."
        : "Failed to create organization.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(name.trim()) && Boolean(slug.trim()) && Boolean(timezone);

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization-name">Name</Label>
            <Input
              id="organization-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              disabled={isSubmitting}
              placeholder="Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization-slug">Slug</Label>
            <Input
              id="organization-slug"
              value={slug}
              onChange={(event) => handleSlugChange(event.target.value)}
              disabled={isSubmitting}
              placeholder="acme-corp"
            />
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <TimezonePicker
              className="w-full"
              value={timezone}
              onValueChange={setTimezone}
              disabled={isSubmitting}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || !isValid}>
          {isSubmitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save changes"
              : "Create organization"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface OrganizationDrawerProps {
  organization: Organization | null;
  defaults?: Pick<Organization, "name" | "slug" | "timezone"> | null;
  defaultTimezone?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  error?: string | null;
}

export function OrganizationDrawer({
  organization,
  defaults = null,
  defaultTimezone = "Europe/Istanbul",
  open,
  onOpenChange,
  loading = false,
  error = null,
}: OrganizationDrawerProps) {
  const isEditing = Boolean(organization);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {loading
              ? "Edit organization"
              : isEditing
                ? "Edit organization"
                : defaults
                  ? "Duplicate organization"
                  : "New organization"}
          </DrawerTitle>
          <DrawerDescription>
            {loading
              ? "Loading organization details..."
              : error
                ? "Unable to load organization details."
                : isEditing
                  ? `Update ${organization?.name} details.`
                  : defaults
                    ? "Create a copy of this organization."
                    : "Create a new organization in your workspace."}
          </DrawerDescription>
        </DrawerHeader>

        {loading ? (
          <OrganizationFormSkeleton />
        ) : error ? (
          <div className="px-4 pb-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <OrganizationForm
            key={
              organization?.id ??
              (defaults
                ? `duplicate-${defaults.slug}`
                : "new")
            }
            organization={organization}
            defaults={defaults}
            defaultTimezone={defaultTimezone}
            onCancel={() => onOpenChange(false)}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

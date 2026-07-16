"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DatePicker } from "@/components/ui/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { fromDateIsoToDateKey, getTodayDateKeyUtc, toFromDateIso } from "@/lib/date-format";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import {
  ANNOUNCEMENT_AUDIENCE_TYPES,
  ANNOUNCEMENT_STATUSES,
  formatAnnouncementAudienceLabel,
  formatAnnouncementStatusLabel,
  type Announcement,
  type AnnouncementAudienceType,
} from "@/types/announcement";
import type { Location } from "@/types/location";
import type { OrganizationMember } from "@/types/member";
import type { OrganizationRole } from "@/types/role";
import type { Team } from "@/types/team";

type AudienceOption = { value: string; label: string };

interface AnnouncementFormProps {
  organizationId: string;
  announcement: Announcement | null;
  onCancel: () => void;
  onSaved: () => void;
}

function AnnouncementForm({
  organizationId,
  announcement,
  onCancel,
  onSaved,
}: AnnouncementFormProps) {
  const router = useRouter();
  const isEditing = Boolean(announcement);

  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [audienceType, setAudienceType] = useState<AnnouncementAudienceType>(
    announcement?.audienceType ?? "all"
  );
  const [audienceId, setAudienceId] = useState<string | null>(
    announcement?.audienceId ?? null
  );
  const [publishedDateKey, setPublishedDateKey] = useState(
    announcement?.publishedAt
      ? fromDateIsoToDateKey(announcement.publishedAt)
      : getTodayDateKeyUtc()
  );
  const [status, setStatus] = useState(announcement?.status ?? "active");
  const [audienceOptions, setAudienceOptions] = useState<AudienceOption[]>([]);
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audienceTypeOptions = useMemo(
    () =>
      ANNOUNCEMENT_AUDIENCE_TYPES.map((value) => ({
        value,
        label: formatAnnouncementAudienceLabel(value),
      })),
    []
  );

  const statusOptions = useMemo(
    () =>
      ANNOUNCEMENT_STATUSES.map((value) => ({
        value,
        label: formatAnnouncementStatusLabel(value),
      })),
    []
  );

  useEffect(() => {
    if (audienceType === "all") {
      setTimeout(() => {
        setAudienceOptions([]);
        setIsLoadingAudience(false);
      }, 0);
      return;
    }

    let active = true;

    async function loadAudienceOptions() {
      setIsLoadingAudience(true);

      try {
        let nextOptions: AudienceOption[] = [];

        if (audienceType === "location") {
          const response = await fetch(
            `/api/organizations/${organizationId}/locations`
          );
          const bodyJson = (await response.json()) as {
            data?: Location[];
            message?: string;
          };

          if (!response.ok) {
            throw new Error(bodyJson.message ?? "Failed to load locations.");
          }

          nextOptions = (bodyJson.data ?? []).map((location) => ({
            value: location.id,
            label: location.name,
          }));
        } else if (audienceType === "role") {
          const response = await fetch(
            `/api/organizations/${organizationId}/roles`
          );
          const bodyJson = (await response.json()) as {
            data?: OrganizationRole[];
            message?: string;
          };

          if (!response.ok) {
            throw new Error(bodyJson.message ?? "Failed to load roles.");
          }

          nextOptions = (bodyJson.data ?? []).map((role) => ({
            value: role.id,
            label: role.name,
          }));
        } else if (audienceType === "team" || audienceType === "member") {
          const response = await fetch(
            `/api/organizations/${organizationId}/shift-create-options`
          );
          const bodyJson = (await response.json()) as {
            data?: {
              teams?: Team[];
              members?: OrganizationMember[];
            };
            message?: string;
          };

          if (!response.ok) {
            throw new Error(
              bodyJson.message ??
                (audienceType === "team"
                  ? "Failed to load teams."
                  : "Failed to load members.")
            );
          }

          if (audienceType === "team") {
            nextOptions = (bodyJson.data?.teams ?? []).map((team) => ({
              value: team.id,
              label: team.name,
            }));
          } else {
            nextOptions = (bodyJson.data?.members ?? []).map((member) => ({
              value: member.id,
              label: getShiftMemberDisplayName(member),
            }));
          }
        }

        if (!active) {
          return;
        }

        setAudienceOptions(nextOptions);
        setAudienceId((current) =>
          current && nextOptions.some((option) => option.value === current)
            ? current
            : null
        );
      } catch (err) {
        if (!active) {
          return;
        }

        setAudienceOptions([]);
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to load audience options."
        );
      } finally {
        if (active) {
          setIsLoadingAudience(false);
        }
      }
    }

    void loadAudienceOptions();

    return () => {
      active = false;
    };
  }, [audienceType, organizationId]);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      body: body.trim(),
      audienceType,
      audienceId: audienceType === "all" ? null : audienceId,
      publishedAt: publishedDateKey ? toFromDateIso(publishedDateKey) : null,
      ...(isEditing ? { status } : {}),
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/announcements/${announcement!.id}`
          : "/api/announcements",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isEditing ? payload : { ...payload, organizationId }
          ),
        }
      );

      const responseBody = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          responseBody.message ??
          (isEditing
            ? "Failed to update announcement."
            : "Failed to create announcement.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing
          ? "Announcement updated successfully"
          : "Announcement created successfully"
      );
      onSaved();
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update announcement."
        : "Failed to create announcement.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid =
    Boolean(title.trim()) &&
    Boolean(body.trim()) &&
    Boolean(audienceType) &&
    (audienceType === "all" || Boolean(audienceId)) &&
    (!isEditing || Boolean(status));

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
              placeholder="Weekly operations update"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announcement-body">Body</Label>
            <Textarea
              id="announcement-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              disabled={isSubmitting}
              rows={5}
              placeholder="Write the announcement content…"
            />
          </div>

          <div className="space-y-2">
            <Label>Audience type</Label>
            <Select
              items={audienceTypeOptions}
              value={audienceType}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }

                setAudienceType(value);
                setAudienceId(null);
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select audience type" />
              </SelectTrigger>
              <SelectContent>
                {audienceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {audienceType !== "all" ? (
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select
                items={audienceOptions}
                value={audienceId}
                onValueChange={(value) => setAudienceId(value)}
                disabled={isSubmitting || isLoadingAudience}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingAudience
                        ? "Loading…"
                        : `Select ${formatAnnouncementAudienceLabel(audienceType).toLowerCase()}`
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Published date</Label>
            <DatePicker
              value={publishedDateKey}
              onChange={setPublishedDateKey}
              disabled={isSubmitting}
              showIcon
              className="w-full"
              buttonClassName="w-full justify-start"
            />
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                items={statusOptions}
                value={status}
                onValueChange={(value) => {
                  if (value) {
                    setStatus(value);
                  }
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <DrawerFooter>
        <Button onClick={() => void handleSubmit()} disabled={isSubmitting || !isValid}>
          {isSubmitting
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save changes"
              : "Create announcement"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface AnnouncementDrawerProps {
  organizationId: string;
  announcement: Announcement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnnouncementDrawer({
  organizationId,
  announcement,
  open,
  onOpenChange,
}: AnnouncementDrawerProps) {
  const isEditing = Boolean(announcement);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {isEditing ? "Edit announcement" : "New announcement"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? `Update ${announcement?.title}.`
              : "Create an announcement for this organization."}
          </DrawerDescription>
        </DrawerHeader>

        <AnnouncementForm
          key={announcement?.id ?? "new"}
          organizationId={organizationId}
          announcement={announcement}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

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
import type { OrganizationFile } from "@/types/organization-file";

interface OrganizationFileFormProps {
  organizationId: string;
  file: OrganizationFile | null;
  onCancel: () => void;
  onSaved: () => void;
}

function OrganizationFileForm({
  organizationId,
  file,
  onCancel,
  onSaved,
}: OrganizationFileFormProps) {
  const router = useRouter();
  const isEditing = Boolean(file);

  const [fileName, setFileName] = useState(file?.fileName ?? "");
  const [contentType, setContentType] = useState(file?.contentType ?? "");
  const [storagePath, setStoragePath] = useState(file?.storagePath ?? "");
  const [sizeBytes, setSizeBytes] = useState(
    file ? String(file.sizeBytes) : "0"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const parsedSizeBytes = Number.parseInt(sizeBytes, 10);

    if (!Number.isFinite(parsedSizeBytes) || parsedSizeBytes < 0) {
      const message = "Size must be a non-negative number.";
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      fileName: fileName.trim(),
      contentType: contentType.trim(),
      storagePath: storagePath.trim(),
      sizeBytes: parsedSizeBytes,
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/organizations/${organizationId}/files/${file!.id}`
          : `/api/organizations/${organizationId}/files`,
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
          (isEditing ? "Failed to update file." : "Failed to create file.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing ? "File updated successfully" : "File created successfully"
      );
      onSaved();
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update file."
        : "Failed to create file.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const parsedSizeBytes = Number.parseInt(sizeBytes, 10);
  const isValid =
    Boolean(fileName.trim()) &&
    Boolean(contentType.trim()) &&
    Boolean(storagePath.trim()) &&
    Number.isFinite(parsedSizeBytes) &&
    parsedSizeBytes >= 0;

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-name">File name</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              disabled={isSubmitting}
              placeholder="control-photo.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-content-type">Content type</Label>
            <Input
              id="file-content-type"
              value={contentType}
              onChange={(event) => setContentType(event.target.value)}
              disabled={isSubmitting}
              placeholder="image/jpeg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-storage-path">Storage path</Label>
            <Input
              id="file-storage-path"
              value={storagePath}
              onChange={(event) => setStoragePath(event.target.value)}
              disabled={isSubmitting}
              placeholder="uploads/forms/control-photo.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-size-bytes">Size (bytes)</Label>
            <Input
              id="file-size-bytes"
              type="number"
              min={0}
              value={sizeBytes}
              onChange={(event) => setSizeBytes(event.target.value)}
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
              : "Create file"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface OrganizationFileDrawerProps {
  organizationId: string;
  file: OrganizationFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationFileDrawer({
  organizationId,
  file,
  open,
  onOpenChange,
}: OrganizationFileDrawerProps) {
  const isEditing = Boolean(file);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? "Edit file" : "New file"}</DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? `Update ${file?.fileName} metadata.`
              : "Register a new file for your organization."}
          </DrawerDescription>
        </DrawerHeader>

        <OrganizationFileForm
          key={file?.id ?? "new"}
          organizationId={organizationId}
          file={file}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

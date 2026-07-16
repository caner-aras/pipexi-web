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
import type { FormTemplate } from "@/types/form-template";

interface FormTemplateFormProps {
  organizationId: string;
  formTemplate: FormTemplate | null;
  onCancel: () => void;
  onSaved: () => void;
}

function FormTemplateForm({
  organizationId,
  formTemplate,
  onCancel,
  onSaved,
}: FormTemplateFormProps) {
  const router = useRouter();
  const isEditing = Boolean(formTemplate);

  const [name, setName] = useState(formTemplate?.name ?? "");
  const [description, setDescription] = useState(formTemplate?.description ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/organizations/${organizationId}/form-templates/${formTemplate!.id}`
          : `/api/organizations/${organizationId}/form-templates`,
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
            ? "Failed to update form template."
            : "Failed to create form template.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing
          ? "Form template updated successfully"
          : "Form template created successfully"
      );
      onSaved();
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update form template."
        : "Failed to create form template.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = Boolean(name.trim());

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-template-name">Name</Label>
            <Input
              id="form-template-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Daily check form"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="form-template-description">Description</Label>
            <textarea
              id="form-template-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              placeholder="Shift start checklist"
              rows={4}
              className="flex min-h-24 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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
              : "Create form"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface FormTemplateDrawerProps {
  organizationId: string;
  formTemplate: FormTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormTemplateDrawer({
  organizationId,
  formTemplate,
  open,
  onOpenChange,
}: FormTemplateDrawerProps) {
  const isEditing = Boolean(formTemplate);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? "Edit form" : "New form"}</DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? `Update ${formTemplate?.name} details.`
              : "Create a new form template for your organization."}
          </DrawerDescription>
        </DrawerHeader>

        <FormTemplateForm
          key={formTemplate?.id ?? "new"}
          organizationId={organizationId}
          formTemplate={formTemplate}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

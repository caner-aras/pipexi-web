"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  buildFieldOptionsJson,
  fieldTypeRequiresOptions,
  formatFieldOptionsText,
  FORM_TEMPLATE_FIELD_TYPES,
  getNextFieldSortOrder,
} from "@/lib/form-template-format";
import type { FormTemplateField } from "@/types/form-template";

interface FormTemplateFieldFormProps {
  organizationId: string;
  formTemplateId: string;
  field: FormTemplateField | null;
  defaultSortOrder: number;
  onCancel: () => void;
  onSaved: () => void;
}

function FormTemplateFieldForm({
  organizationId,
  formTemplateId,
  field,
  defaultSortOrder,
  onCancel,
  onSaved,
}: FormTemplateFieldFormProps) {
  const router = useRouter();
  const isEditing = Boolean(field);

  const [type, setType] = useState(field?.type ?? "text");
  const [label, setLabel] = useState(field?.label ?? "");
  const [isRequired, setIsRequired] = useState(field?.isRequired ?? true);
  const [sortOrder, setSortOrder] = useState(
    String(field?.sortOrder ?? defaultSortOrder)
  );
  const [optionsText, setOptionsText] = useState(
    formatFieldOptionsText(field?.optionsJson ?? null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiresOptions = fieldTypeRequiresOptions(type);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const parsedSortOrder = Number.parseInt(sortOrder, 10);
    const optionsJson = requiresOptions
      ? buildFieldOptionsJson(optionsText)
      : null;

    if (requiresOptions && !optionsJson) {
      const message = "Add at least one option for select fields.";
      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      type,
      label: label.trim(),
      isRequired,
      sortOrder: parsedSortOrder,
      optionsJson,
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/organizations/${organizationId}/form-templates/${formTemplateId}/fields/${field!.id}`
          : `/api/organizations/${organizationId}/form-templates/${formTemplateId}/fields`,
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
          (isEditing ? "Failed to update field." : "Failed to create field.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditing ? "Field updated successfully" : "Field created successfully"
      );
      onSaved();
      router.refresh();
    } catch {
      const message = isEditing
        ? "Failed to update field."
        : "Failed to create field.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const parsedSortOrder = Number.parseInt(sortOrder, 10);
  const isValid =
    Boolean(label.trim()) &&
    Boolean(type) &&
    Number.isFinite(parsedSortOrder) &&
    parsedSortOrder >= 0 &&
    (!requiresOptions || Boolean(buildFieldOptionsJson(optionsText)));

  return (
    <>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="field-type">Type</Label>
            <Select
              items={FORM_TEMPLATE_FIELD_TYPES.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              value={type}
              onValueChange={(value) => {
                if (value) {
                  setType(value);
                }
              }}
            >
              <SelectTrigger id="field-type" className="w-full">
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {FORM_TEMPLATE_FIELD_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-label">Label</Label>
            <Input
              id="field-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              disabled={isSubmitting}
              placeholder="Department"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="field-sort-order">Sort order</Label>
            <Input
              id="field-sort-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {requiresOptions ? (
            <div className="space-y-2">
              <Label htmlFor="field-options">Options</Label>
              <textarea
                id="field-options"
                value={optionsText}
                onChange={(event) => setOptionsText(event.target.value)}
                disabled={isSubmitting}
                placeholder={"Kitchen\nService\nStorage"}
                rows={4}
                className="flex min-h-24 w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Enter one option per line.
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <Checkbox
              id="field-required"
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="field-required">Required field</Label>
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
              : "Create field"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </DrawerFooter>
    </>
  );
}

interface FormTemplateFieldDrawerProps {
  organizationId: string;
  formTemplateId: string;
  fields: FormTemplateField[];
  field: FormTemplateField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormTemplateFieldDrawer({
  organizationId,
  formTemplateId,
  fields,
  field,
  open,
  onOpenChange,
}: FormTemplateFieldDrawerProps) {
  const isEditing = Boolean(field);
  const defaultSortOrder = getNextFieldSortOrder(fields);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>
            {isEditing ? "Edit field" : "New field"}
          </DrawerTitle>
          <DrawerDescription>
            {isEditing
              ? `Update ${field?.label} field settings.`
              : "Create a new field for this form template."}
          </DrawerDescription>
        </DrawerHeader>

        <FormTemplateFieldForm
          key={field?.id ?? `new-${defaultSortOrder}`}
          organizationId={organizationId}
          formTemplateId={formTemplateId}
          field={field}
          defaultSortOrder={defaultSortOrder}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}

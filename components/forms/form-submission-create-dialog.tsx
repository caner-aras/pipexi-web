"use client";

import { ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parseFieldOptions,
  sortFormTemplateFields,
} from "@/lib/form-template-format";
import type { FormTemplate, FormTemplateField } from "@/types/form-template";

interface FormSubmissionCreateFormProps {
  organizationId: string;
  formTemplate: FormTemplate;
  submittedByMemberId: string;
  shiftId: string | null;
  onCancel: () => void;
  onCreated: () => void;
}

function SubmissionFieldInput({
  field,
  value,
  disabled,
  onChange,
}: {
  field: FormTemplateField;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  if (field.type === "single_select") {
    const options = parseFieldOptions(field.optionsJson).map((option) => ({
      value: option,
      label: option,
    }));

    return (
      <Select
        items={options}
        value={value || null}
        onValueChange={(nextValue) => onChange(nextValue ?? "")}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" size="default">
          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      placeholder={`Enter ${field.label.toLowerCase()}`}
    />
  );
}

function FormSubmissionCreateForm({
  organizationId,
  formTemplate,
  submittedByMemberId,
  shiftId,
  onCancel,
  onCreated,
}: FormSubmissionCreateFormProps) {
  const router = useRouter();
  const fields = useMemo(
    () =>
      sortFormTemplateFields(formTemplate.fields).filter(
        (field) => field.status.toLowerCase() === "active"
      ),
    [formTemplate.fields]
  );
  const [answersByFieldId, setAnswersByFieldId] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateAnswer(fieldId: string, value: string) {
    setAnswersByFieldId((current) => ({
      ...current,
      [fieldId]: value,
    }));
  }

  async function handleSubmit() {
    for (const field of fields) {
      if (field.isRequired && !answersByFieldId[field.id]?.trim()) {
        const message = `${field.label} is required.`;
        setError(message);
        toast.error(message);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/form-submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formTemplateId: formTemplate.id,
            submittedByMemberId,
            shiftId: shiftId ?? undefined,
            submittedAt: new Date().toISOString(),
            answers: fields.map((field) => ({
              formFieldId: field.id,
              value: answersByFieldId[field.id]?.trim() ?? "",
            })),
          }),
        }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = body.message ?? "Failed to create submission.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Submission created successfully");
      router.refresh();
      onCreated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create submission.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="max-h-[min(70vh,640px)] space-y-4 overflow-y-auto px-1">
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This form has no active fields yet.
          </p>
        ) : (
          fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={`submission-field-${field.id}`}>
                {field.label}
                {field.isRequired ? (
                  <span className="text-destructive"> *</span>
                ) : null}
              </Label>
              <SubmissionFieldInput
                field={field}
                value={answersByFieldId[field.id] ?? ""}
                disabled={isSubmitting}
                onChange={(value) => updateAnswer(field.id, value)}
              />
            </div>
          ))
        )}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <DialogFooter className="mt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || fields.length === 0}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </DialogFooter>
    </>
  );
}

interface FormSubmissionCreateDialogProps {
  organizationId: string;
  formTemplate: FormTemplate;
  submittedByMemberId: string | null;
  shiftId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormSubmissionCreateDialog({
  organizationId,
  formTemplate,
  submittedByMemberId,
  shiftId,
  open,
  onOpenChange,
}: FormSubmissionCreateDialogProps) {
  const canSubmit = Boolean(submittedByMemberId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="size-4" />
            New submission
          </DialogTitle>
          <DialogDescription>
            Submit a response for {formTemplate.name}.
            {shiftId ? " This submission will be linked to the selected shift." : null}
          </DialogDescription>
        </DialogHeader>

        {!canSubmit ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No organization member is available to submit this form.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <FormSubmissionCreateForm
            key={`${formTemplate.id}-${open ? "open" : "closed"}`}
            organizationId={organizationId}
            formTemplate={formTemplate}
            submittedByMemberId={submittedByMemberId!}
            shiftId={shiftId}
            onCancel={() => onOpenChange(false)}
            onCreated={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";

import { FormSubmissionCreateDialog } from "@/components/forms/form-submission-create-dialog";
import { FormSubmissionsView } from "@/components/forms/form-submissions-view";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FormSubmission } from "@/types/form-submission";
import type { FormTemplate } from "@/types/form-template";

interface FormSubmissionsPageContentProps {
  organizationId: string;
  formTemplate: FormTemplate;
  submissions: FormSubmission[];
  submittedByMemberId: string | null;
  shiftId: string | null;
  autoOpenCreateDialog?: boolean;
  error: string | null;
}

export function FormSubmissionsPageContent({
  organizationId,
  formTemplate,
  submissions,
  submittedByMemberId,
  shiftId,
  autoOpenCreateDialog = false,
  error,
}: FormSubmissionsPageContentProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(autoOpenCreateDialog);

  return (
    <>
      <PageHeader
        leading={
          <Link
            href={`/forms/${formTemplate.id}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to form
          </Link>
        }
        title="Submissions"
        description={`Responses for ${formTemplate.name}.`}
        actions={
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            disabled={!submittedByMemberId}
          >
            <Plus className="size-4" />
            New submission
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <FormSubmissionsView
            organizationId={organizationId}
            submissions={submissions}
          />
        )}
      </div>

      <FormSubmissionCreateDialog
        organizationId={organizationId}
        formTemplate={formTemplate}
        submittedByMemberId={submittedByMemberId}
        shiftId={shiftId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}

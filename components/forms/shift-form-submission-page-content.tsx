"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { FormSubmissionDetailPanel } from "@/components/forms/form-submission-detail-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { getShiftDetailHref } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { FormSubmission } from "@/types/form-submission";

interface ShiftFormSubmissionPageContentProps {
  shiftId: string;
  formTemplateName: string;
  submission: FormSubmission | null;
  error: string | null;
}

export function ShiftFormSubmissionPageContent({
  shiftId,
  formTemplateName,
  submission,
  error,
}: ShiftFormSubmissionPageContentProps) {
  return (
    <>
      <PageHeader
        className="print:mb-4"
        leading={
          <Link
            href={getShiftDetailHref(shiftId)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit print:hidden"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to shift
          </Link>
        }
        title={formTemplateName}
        description="Submitted answers for this shift."
        actions={
          submission ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="print:hidden"
              onClick={() => window.print()}
            >
              <Printer className="size-4" />
              Print
            </Button>
          ) : undefined
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <FormSubmissionDetailPanel
        submission={submission}
        showShiftLink={false}
        emptyTitle="No submission yet"
        emptyDescription="This form has not been submitted for this shift."
      />
    </>
  );
}

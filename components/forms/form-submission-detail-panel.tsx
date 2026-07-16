"use client";

import { CalendarDays, ClipboardList, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  formatFormSubmissionDateTime,
  getFormSubmissionMemberLabel,
} from "@/lib/form-submission-format";
import { getShiftDetailHref } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type {
  FormSubmission,
  FormSubmissionAnswer,
} from "@/types/form-submission";

interface FormSubmissionDetailPanelProps {
  organizationId?: string;
  submission: FormSubmission | null;
  showShiftLink?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function FormSubmissionDetailPanel({
  organizationId,
  submission,
  showShiftLink = true,
  emptyTitle = "Select a submission",
  emptyDescription = "Choose a submission from the list to view its answers.",
}: FormSubmissionDetailPanelProps) {
  const router = useRouter();
  const [answerToDelete, setAnswerToDelete] =
    useState<FormSubmissionAnswer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resolvedOrganizationId =
    organizationId ?? submission?.organizationId ?? null;

  function handleOpenDelete(answer: FormSubmissionAnswer) {
    setAnswerToDelete(answer);
    setDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) {
      setAnswerToDelete(null);
    }
  }

  async function handleConfirmDelete() {
    if (!answerToDelete || !submission || !resolvedOrganizationId) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/organizations/${resolvedOrganizationId}/form-submissions/${submission.id}/answers/${answerToDelete.id}`,
        { method: "DELETE" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete answer");
        return;
      }

      toast.success("Answer deleted successfully");
      setDeleteDialogOpen(false);
      setAnswerToDelete(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete answer");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!submission) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-sm border border-dashed border-border/50 bg-muted/15 p-6">
        <EmptyState
          icon={ClipboardList}
          title={emptyTitle}
          description={emptyDescription}
          className="border-0 bg-transparent py-6"
        />
      </div>
    );
  }

  const sortedAnswers = [...submission.answers].sort(
    (left, right) => left.formField.sortOrder - right.formField.sortOrder
  );

  return (
    <>
      <div className="flex min-h-80 flex-col overflow-hidden rounded-sm border border-border/50">
        <div className="border-b border-border/50 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-medium">Submission details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {getFormSubmissionMemberLabel(submission)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatFormSubmissionDateTime(submission.submittedAt)}
              </p>
              {showShiftLink && submission.shiftId ? (
                <Link
                  href={getShiftDetailHref(submission.shiftId)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-3 w-fit"
                  )}
                >
                  <CalendarDays className="size-4" />
                  View linked shift
                </Link>
              ) : null}
            </div>
            <StatusIndicator status={submission.status} showLabel />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {sortedAnswers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No answers recorded.</p>
          ) : (
            <div className="space-y-3">
              {sortedAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className="flex items-start justify-between gap-3 border-b border-border/50 px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-lg font-medium text-muted-foreground">
                      {answer.formField.label}
                    </p>
                    <p className="mt-1 text-sm">{answer.value || "—"}</p>
                  </div>
                  {resolvedOrganizationId ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 shrink-0"
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(answer)}
                        >
                          Delete answer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete answer?</AlertDialogTitle>
            <AlertDialogDescription>
              {answerToDelete
                ? `This will permanently delete the answer for "${answerToDelete.formField.label}". This action cannot be undone.`
                : "This will permanently delete the answer. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, MoreHorizontalIcon, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { FormSubmissionDetailPanel } from "@/components/forms/form-submission-detail-panel";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatFormSubmissionDateTime,
  getFormSubmissionMemberLabel,
  getFormSubmissionStatusFilterOptions,
  matchesFormSubmissionSearch,
} from "@/lib/form-submission-format";
import { getShiftDetailHref } from "@/lib/shift-format";
import { cn } from "@/lib/utils";
import type { FormSubmission } from "@/types/form-submission";

interface FormSubmissionsViewProps {
  organizationId: string;
  submissions: FormSubmission[];
}

export function FormSubmissionsView({
  organizationId,
  submissions,
}: FormSubmissionsViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [preferredSubmissionId, setPreferredSubmissionId] = useState<
    string | null
  >(submissions[0]?.id ?? null);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<FormSubmission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusFilterOptions = useMemo(
    () => getFormSubmissionStatusFilterOptions(submissions),
    [submissions]
  );

  const filteredSubmissions = useMemo(
    () =>
      submissions.filter((submission) =>
        matchesFormSubmissionSearch(submission, searchQuery, statusFilter)
      ),
    [submissions, searchQuery, statusFilter]
  );

  const selectedSubmissionId =
    preferredSubmissionId &&
    filteredSubmissions.some(
      (submission) => submission.id === preferredSubmissionId
    )
      ? preferredSubmissionId
      : (filteredSubmissions[0]?.id ?? null);

  const selectedSubmission =
    filteredSubmissions.find(
      (submission) => submission.id === selectedSubmissionId
    ) ?? null;

  function handleOpenDelete(submission: FormSubmission) {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) {
      setSubmissionToDelete(null);
    }
  }

  async function handleConfirmDelete() {
    if (!submissionToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/form-submissions/${submissionToDelete.id}`,
        { method: "DELETE" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete submission");
        return;
      }

      toast.success("Submission deleted successfully");
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete submission");
    } finally {
      setIsDeleting(false);
    }
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No submissions found"
        description="Form submissions will appear here once members submit this form."
      />
    );
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by member, email, or answer..."
              className="h-8 pl-8"
            />
          </div>

          <Select
            items={statusFilterOptions}
            value={statusFilter}
            onValueChange={(value) => {
              if (value) {
                setStatusFilter(value);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-44" size="default">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredSubmissions.length} of {submissions.length} submission
          {submissions.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredSubmissions.length === 0 ? (
        <EmptyState title="No submissions match your search" filtered />
      ) : (
        <div className="grid min-h-[28rem] gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="overflow-hidden rounded-sm border border-border/50">
            <div className="max-h-[32rem] overflow-x-auto overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Submitted by</TableHead>
                    <TableHead>Submitted at</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Answers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => {
                    const isSelected = submission.id === selectedSubmissionId;

                    return (
                      <TableRow
                        key={submission.id}
                        className={cn(
                          "cursor-pointer",
                          isSelected && "bg-muted/50"
                        )}
                        onClick={() => setPreferredSubmissionId(submission.id)}
                      >
                        <TableCell className="font-medium">
                          {getFormSubmissionMemberLabel(submission)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFormSubmissionDateTime(submission.submittedAt)}
                        </TableCell>
                        <TableCell>
                          {submission.shiftId ? (
                            <Link
                              href={getShiftDetailHref(submission.shiftId)}
                              className="font-medium text-primary hover:underline"
                              onClick={(event) => event.stopPropagation()}
                            >
                              View shift
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{submission.answers.length}</TableCell>
                        <TableCell className="text-center">
                          <StatusIndicator status={submission.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  onClick={(event) => event.stopPropagation()}
                                />
                              }
                            >
                              <MoreHorizontalIcon />
                              <span className="sr-only">Open menu</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <DropdownMenuItem
                                onClick={() => handleOpenDelete(submission)}
                              >
                                Delete submission
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <FormSubmissionDetailPanel
            organizationId={organizationId}
            submission={selectedSubmission}
          />
        </div>
      )}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete submission?</AlertDialogTitle>
            <AlertDialogDescription>
              {submissionToDelete
                ? `This will permanently delete the submission from ${getFormSubmissionMemberLabel(submissionToDelete)}. This action cannot be undone.`
                : "This will permanently delete the submission. This action cannot be undone."}
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

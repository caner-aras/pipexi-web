import {
  buildRecordStatusFilterOptions,
  getRecordStatusBadgeVariant,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import type { FormSubmission } from "@/types/form-submission";

export const getFormSubmissionStatusBadgeVariant = getRecordStatusBadgeVariant;

export function formatFormSubmissionDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getFormSubmissionMemberLabel(submission: FormSubmission): string {
  const name = getShiftMemberDisplayName(submission.submittedByMember);

  if (submission.submittedByMember.jobTitle) {
    return `${name} · ${submission.submittedByMember.jobTitle}`;
  }

  return name;
}

export function matchesFormSubmissionSearch(
  submission: FormSubmission,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(submission.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const memberLabel = getFormSubmissionMemberLabel(submission).toLowerCase();
  const email = submission.submittedByMember.user.email.toLowerCase();
  const answerValues = submission.answers
    .map((answer) => answer.value.toLowerCase())
    .join(" ");

  return (
    memberLabel.includes(search) ||
    email.includes(search) ||
    answerValues.includes(search)
  );
}

export function getFormSubmissionStatusFilterOptions(
  submissions: FormSubmission[]
) {
  return buildRecordStatusFilterOptions(
    submissions.map((submission) => submission.status)
  );
}

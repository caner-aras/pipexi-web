export interface ShiftFormsStatus {
  shiftId: string;
  organizationMemberId: string | null;
  memberName: string;
  memberAvatarUrl: string | null;
  teamName: string;
  startAt: string;
  endAt: string;
  isMissingForms: boolean;
}

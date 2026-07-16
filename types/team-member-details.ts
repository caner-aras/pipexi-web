import type { Shift } from "@/types/shift";
import type { TeamMember } from "@/types/team";

export interface TeamMemberDetails {
  teamMember: TeamMember;
  shifts: Shift[];
  organizationId: string;
  organizationName: string;
  timeEntries: unknown[];
  totalTaskCount: number;
}

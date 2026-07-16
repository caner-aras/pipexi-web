"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MoreHorizontalIcon, Search, UsersRound } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamMemberLookupKey } from "@/lib/date-format";
import {
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { buildTeamMemberProfileHref } from "@/lib/team-member-navigation";
import type { Team } from "@/types/team";

function getManagerLabel(team: Team): string {
  if (!team.managerMember) {
    return team.managerMemberId;
  }

  return getShiftMemberDisplayName(team.managerMember);
}

function matchesTeamSearch(
  team: Team,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(team.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const name = team.name.toLowerCase();
  const manager = getManagerLabel(team).toLowerCase();
  const jobTitle = team.managerMember?.jobTitle?.toLowerCase() ?? "";

  return (
    name.includes(search) ||
    manager.includes(search) ||
    jobTitle.includes(search)
  );
}

interface TeamsViewProps {
  teams: Team[];
  teamMemberIdByKey?: Record<string, string>;
  memberCountByTeamId?: Record<string, number>;
  onEditTeam?: (team: Team) => void;
  onDuplicateTeam?: (team: Team) => void;
}

export function TeamsView({
  teams,
  teamMemberIdByKey = {},
  memberCountByTeamId = {},
  onEditTeam,
  onDuplicateTeam,
}: TeamsViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teamToRemove, setTeamToRemove] = useState<Team | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const statusFilterOptions = useMemo(
    () => buildRecordStatusFilterOptions(teams.map((team) => team.status)),
    [teams]
  );

  const filteredTeams = useMemo(
    () =>
      teams.filter((team) => matchesTeamSearch(team, searchQuery, statusFilter)),
    [teams, searchQuery, statusFilter]
  );

  function handleOpenRemove(team: Team) {
    setTeamToRemove(team);
    setRemoveDialogOpen(true);
  }

  function handleRemoveDialogOpenChange(open: boolean) {
    setRemoveDialogOpen(open);

    if (!open) {
      setTeamToRemove(null);
    }
  }

  async function handleConfirmRemove() {
    if (!teamToRemove) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(`/api/teams/${teamToRemove.id}`, {
        method: "DELETE",
      });

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to remove team");
        return;
      }

      toast.success("Team removed successfully");
      setRemoveDialogOpen(false);
      setTeamToRemove(null);
      router.refresh();
    } catch {
      toast.error("Failed to remove team");
    } finally {
      setIsRemoving(false);
    }
  }

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={UsersRound}
        title="No teams found"
        description="Teams will appear here once they are created."
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
              placeholder="Search by team or manager..."
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
          {filteredTeams.length} of {teams.length} team
          {teams.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredTeams.length === 0 ? (
        <EmptyState
          title="No teams match your search"
          filtered
        />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Team</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => {
                const memberCount = memberCountByTeamId[team.id] ?? 0;
                const managerTeamMemberId = team.managerMember
                  ? teamMemberIdByKey[
                  getTeamMemberLookupKey(team.id, team.managerMember.id)
                  ] ?? null
                  : null;
                const managerHref = managerTeamMemberId
                  ? buildTeamMemberProfileHref(managerTeamMemberId)
                  : null;
                const teamHref = `/teams/${team.id}`;

                return (
                  <TableRow key={team.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link
                        href={teamHref}
                        className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
                      >
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {managerHref ? (
                        <Link
                          href={managerHref}
                          className="transition-opacity hover:opacity-80"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {getManagerLabel(team)}
                        </Link>
                      ) : (
                        getManagerLabel(team)
                      )}
                      {team.managerMember?.jobTitle ? (
                        <p className="text-xs text-muted-foreground">
                          {team.managerMember.jobTitle}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>{memberCount}</TableCell>
                    <TableCell className="text-center">
                      <StatusIndicator status={team.status} />
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
                          <DropdownMenuItem render={<Link href={teamHref} />}>
                            View team
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditTeam?.(team)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDuplicateTeam?.(team)}
                          >
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={memberCount > 0}
                            onClick={() => handleOpenRemove(team)}
                          >
                            Remove team
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
      )}

      <AlertDialog
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team?</AlertDialogTitle>
            <AlertDialogDescription>
              {teamToRemove
                ? `This will permanently remove ${teamToRemove.name}. This action cannot be undone.`
                : "This will permanently remove the team. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmRemove()}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

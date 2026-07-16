"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, MoreHorizontalIcon, Search, Users } from "lucide-react";
import { toast } from "sonner";

import { EditOrganizationMemberDrawer } from "@/components/organizations/edit-organization-member-drawer";
import {
  UserProfileDialog,
  organizationMemberUserToProfile,
} from "@/components/profile/user-profile-dialog";
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
import {
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import { buildTeamMemberProfileHref } from "@/lib/team-member-navigation";
import type { OrganizationMember } from "@/types/member";
import type { UserProfile } from "@/types/auth";

function getMemberDisplayName(member: OrganizationMember): string {
  const fullName = `${member.user.firstName} ${member.user.lastName}`.trim();
  return fullName || member.user.email;
}

function matchesMemberSearch(
  member: OrganizationMember,
  query: string,
  statusFilter: string
): boolean {
  const search = query.trim().toLowerCase();

  if (!matchesRecordStatusFilter(member.status, statusFilter)) {
    return false;
  }

  if (!search) {
    return true;
  }

  const name = getMemberDisplayName(member).toLowerCase();
  const email = member.user.email.toLowerCase();

  return name.includes(search) || email.includes(search);
}

interface OrganizationMemberListProps {
  members: OrganizationMember[];
  teamMemberIdByOrganizationMemberId?: Record<string, string>;
}

export function OrganizationMemberList({
  members,
  teamMemberIdByOrganizationMemberId = {},
}: OrganizationMemberListProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(
    null
  );
  const [isLoadingMember, setIsLoadingMember] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] =
    useState<UserProfile | null>(null);
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const statusFilterOptions = useMemo(
    () =>
      buildRecordStatusFilterOptions(members.map((member) => member.status)),
    [members]
  );

  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        matchesMemberSearch(member, searchQuery, statusFilter)
      ),
    [members, searchQuery, statusFilter]
  );

  function handleOpenUserProfile(member: OrganizationMember) {
    setSelectedUserProfile(organizationMemberUserToProfile(member));
    setUserDialogOpen(true);
  }

  function handleUserDialogOpenChange(open: boolean) {
    setUserDialogOpen(open);

    if (!open) {
      setSelectedUserProfile(null);
    }
  }

  async function handleEditMember(memberId: string) {
    setDrawerOpen(true);
    setEditingMember(null);
    setLoadError(null);
    setIsLoadingMember(true);

    try {
      const response = await fetch(`/api/organization-members/${memberId}`);
      const body = (await response.json()) as {
        data?: OrganizationMember;
        message?: string;
      };

      if (!response.ok) {
        setLoadError(body.message ?? "Failed to load member");
        return;
      }

      if (!body.data) {
        setLoadError("Failed to load member");
        return;
      }

      setEditingMember(body.data);
    } catch {
      setLoadError("Failed to load member");
    } finally {
      setIsLoadingMember(false);
    }
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);

    if (!open) {
      setEditingMember(null);
      setLoadError(null);
      setIsLoadingMember(false);
    }
  }

  function handleOpenRemove(member: OrganizationMember) {
    setMemberToRemove(member);
    setRemoveDialogOpen(true);
  }

  function handleRemoveDialogOpenChange(open: boolean) {
    setRemoveDialogOpen(open);

    if (!open) {
      setMemberToRemove(null);
    }
  }

  async function handleConfirmRemove() {
    if (!memberToRemove) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(
        `/api/organization-members/${memberToRemove.id}`,
        { method: "DELETE" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(
          body.message ?? "Failed to remove member from organization"
        );
        return;
      }

      toast.success("Member removed from organization");
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      router.refresh();
    } catch {
      toast.error("Failed to remove member from organization");
    } finally {
      setIsRemoving(false);
    }
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members found"
        description="Members will appear here once they join the organization."
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
              placeholder="Search by name or email..."
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
          {filteredMembers.length} of {members.length} member
          {members.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredMembers.length === 0 ? (
        <EmptyState title="No members match your search" filtered />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-56">Name</TableHead>
                <TableHead className="w-56">Email</TableHead>
                <TableHead className="w-48">Job title</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const teamMemberId =
                  teamMemberIdByOrganizationMemberId[member.id] ?? null;
                const profileHref = teamMemberId
                  ? buildTeamMemberProfileHref(teamMemberId)
                  : null;

                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium w-56">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 text-left transition-opacity hover:opacity-80"
                        onClick={() => handleOpenUserProfile(member)}
                      >
                        <ArrowUpRight className="size-4 shrink-0" />
                        {getMemberDisplayName(member)}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground w-56">
                      {member.user.email}
                    </TableCell>
                    <TableCell className="w-48">
                      {member.jobTitle || "—"}
                    </TableCell>
                    <TableCell className="w-32 text-center">
                      <StatusIndicator status={member.status} />
                    </TableCell>
                    <TableCell className="text-right w-32">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            />
                          }
                        >
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {profileHref ? (
                            <DropdownMenuItem
                              render={<Link href={profileHref} />}
                            >
                              View schedule
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onClick={() => handleEditMember(member.id)}
                          >
                            Edit member
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenRemove(member)}
                          >
                            Remove from organization
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

      <EditOrganizationMemberDrawer
        member={editingMember}
        isLoading={isLoadingMember}
        loadError={loadError}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />

      <UserProfileDialog
        user={selectedUserProfile}
        open={userDialogOpen}
        onOpenChange={handleUserDialogOpenChange}
        title="User profile"
        description="Update user personal information."
      />

      <AlertDialog
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from organization?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove
                ? `This will remove ${getMemberDisplayName(memberToRemove)} from the organization. This action cannot be undone.`
                : "This will remove the member from the organization. This action cannot be undone."}
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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreHorizontalIcon, Users } from "lucide-react";
import { toast } from "sonner";

import { EditTeamMemberDrawer } from "@/components/organizations/edit-team-member-drawer";
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
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import { buildTeamMemberProfileHref } from "@/lib/team-member-navigation";
import type { TeamMember } from "@/types/team";

interface TeamMembersTableProps {
  members: TeamMember[];
  managerMemberId?: string | null;
}

export function TeamMembersTable({
  members,
  managerMemberId = null,
}: TeamMembersTableProps) {
  const router = useRouter();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleEditMember(member: TeamMember) {
    setEditingMember(member);
    setEditDrawerOpen(true);
  }

  function handleEditDrawerOpenChange(open: boolean) {
    setEditDrawerOpen(open);

    if (!open) {
      setEditingMember(null);
    }
  }

  function handleOpenDelete(member: TeamMember) {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) {
      setMemberToDelete(null);
    }
  }

  async function handleConfirmDelete() {
    if (!memberToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/teams/members/${memberToDelete.id}`,
        { method: "DELETE" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete team member");
        return;
      }

      toast.success("Team member removed successfully");
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete team member");
    } finally {
      setIsDeleting(false);
    }
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No members in this team yet"
        description="Add members to this team to see them listed here."
      />
    );
  }

  const memberToDeleteName = memberToDelete
    ? getShiftMemberDisplayName(memberToDelete.organizationMember)
    : null;

  return (
    <>
      <div className="overflow-hidden rounded-sm border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const profileHref = buildTeamMemberProfileHref(member.id);
              const displayName = getShiftMemberDisplayName(
                member.organizationMember
              );
              const isManager =
                member.organizationMemberId === managerMemberId;

              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={profileHref}
                        className="transition-opacity hover:opacity-80"
                      >
                        {displayName}
                      </Link>
                      {isManager ? (
                        <Badge variant="outline" className="text-[10px]">
                          Manager
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.organizationMember.user.email}
                  </TableCell>
                  <TableCell>
                    {member.organizationMember.jobTitle || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusIndicator status={member.status} />
                  </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem
                          onClick={() => handleEditMember(member)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(member)}
                        >
                          Delete member
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

      <EditTeamMemberDrawer
        member={editingMember}
        open={editDrawerOpen}
        onOpenChange={handleEditDrawerOpenChange}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToDeleteName
                ? `This will remove ${memberToDeleteName} from the team. This action cannot be undone.`
                : "This will remove the member from the team. This action cannot be undone."}
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

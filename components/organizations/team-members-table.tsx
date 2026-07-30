"use client";

import { NavLink as Link } from "@/components/ui/nav-link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, MoreHorizontalIcon, Users } from "lucide-react";
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
  organizationId: string;
  members: TeamMember[];
  managerMemberId?: string | null;
}

export function TeamMembersTable({
  organizationId,
  members,
  managerMemberId = null,
}: TeamMembersTableProps) {
  const router = useRouter();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToResetPassword, setMemberToResetPassword] =
    useState<TeamMember | null>(null);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  function handleOpenResetPassword(member: TeamMember) {
    setMemberToResetPassword(member);
    setResetPasswordDialogOpen(true);
  }

  function handleResetPasswordDialogOpenChange(open: boolean) {
    setResetPasswordDialogOpen(open);

    if (!open) {
      setMemberToResetPassword(null);
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

  async function handleConfirmResetPassword() {
    if (!memberToResetPassword) {
      return;
    }

    setIsResettingPassword(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/members/${memberToResetPassword.organizationMember.id}/reset-password`,
        { method: "POST" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to send password reset link");
        return;
      }

      toast.success("Reset link sent if the account exists.");
      setResetPasswordDialogOpen(false);
      setMemberToResetPassword(null);
    } catch {
      toast.error("Failed to send password reset link");
    } finally {
      setIsResettingPassword(false);
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

  const memberToResetPasswordName = memberToResetPassword
    ? getShiftMemberDisplayName(memberToResetPassword.organizationMember)
    : null;

  const memberToResetPasswordEmail =
    memberToResetPassword?.organizationMember.user.email ?? null;

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
                        className="inline-flex max-w-full items-center gap-2 text-left transition-opacity hover:opacity-80 hover:underline"
                      >
                        <ArrowUpRight className="size-4 shrink-0" />
                        <span className="truncate">{displayName}</span>
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
                          Edit member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              buildTeamMemberProfileHref(member.id, undefined, "profile")
                            )
                          }
                        >
                          Personal profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              buildTeamMemberProfileHref(member.id, undefined, "payments")
                            )
                          }
                        >
                          Payments
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenResetPassword(member)}
                        >
                          Reset password
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

      <AlertDialog
        open={resetPasswordDialogOpen}
        onOpenChange={handleResetPasswordDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset password?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToResetPasswordName && memberToResetPasswordEmail
                ? `Send a password reset link to ${memberToResetPasswordName} (${memberToResetPasswordEmail})?`
                : "Send a password reset link to this member?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingPassword}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmResetPassword()}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Sending..." : "Send reset link"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

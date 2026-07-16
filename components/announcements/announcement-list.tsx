"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, MoreHorizontalIcon, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import {
  formatAnnouncementAudienceLabel,
  type Announcement,
} from "@/types/announcement";

function formatDateTime(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function matchesAnnouncementSearch(
  announcement: Announcement,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(announcement.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  return (
    announcement.title.toLowerCase().includes(search) ||
    announcement.status.toLowerCase().includes(search) ||
    formatAnnouncementAudienceLabel(announcement.audienceType)
      .toLowerCase()
      .includes(search) ||
    announcement.audienceType.toLowerCase().includes(search)
  );
}

interface AnnouncementListProps {
  announcements: Announcement[];
  onEditAnnouncement: (announcement: Announcement) => void;
}

export function AnnouncementList({
  announcements,
  onEditAnnouncement,
}: AnnouncementListProps) {
  const router = useRouter();
  const shouldRefreshAfterRemoveRef = useRef(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [announcementToRemove, setAnnouncementToRemove] =
    useState<Announcement | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const statusOptions = useMemo(
    () =>
      buildRecordStatusFilterOptions(
        announcements.map((announcement) => announcement.status)
      ),
    [announcements]
  );
  const filteredAnnouncements = useMemo(
    () =>
      announcements.filter((announcement) =>
        matchesAnnouncementSearch(announcement, search, statusFilter)
      ),
    [announcements, search, statusFilter]
  );

  function handleOpenRemove(announcement: Announcement) {
    setAnnouncementToRemove(announcement);
    setRemoveDialogOpen(true);
  }

  function handleRemoveDialogOpenChange(open: boolean) {
    setRemoveDialogOpen(open);
  }

  function handleRemoveDialogOpenChangeComplete(open: boolean) {
    if (!open) {
      setAnnouncementToRemove(null);
      setIsRemoving(false);

      if (shouldRefreshAfterRemoveRef.current) {
        shouldRefreshAfterRemoveRef.current = false;
        router.refresh();
      }
    }
  }

  async function handleConfirmRemove() {
    if (!announcementToRemove) {
      return;
    }

    setIsRemoving(true);

    try {
      const response = await fetch(
        `/api/announcements/${announcementToRemove.id}`,
        { method: "DELETE" }
      );
      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete announcement");
        return;
      }

      toast.success("Announcement deleted successfully");
      shouldRefreshAfterRemoveRef.current = true;
      setRemoveDialogOpen(false);
    } catch {
      toast.error("Failed to delete announcement");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search announcements..."
              className="h-8 pl-8"
            />
          </div>
          <Select
            items={statusOptions}
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
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          {filteredAnnouncements.length} of {announcements.length} announcement
          {announcements.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements match"
          description="Try a different search or status filter."
          filtered
        />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="max-w-[20rem] font-medium">
                    <span className="line-clamp-2">{announcement.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {formatAnnouncementAudienceLabel(
                        announcement.audienceType
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusIndicator status={announcement.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(announcement.publishedAt)}
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
                          onClick={() => onEditAnnouncement(announcement)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenRemove(announcement)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={removeDialogOpen}
        onOpenChange={handleRemoveDialogOpenChange}
        onOpenChangeComplete={handleRemoveDialogOpenChangeComplete}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              {announcementToRemove
                ? `This will permanently delete “${announcementToRemove.title}”. This action cannot be undone.`
                : "This will permanently delete the announcement. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmRemove()}
              disabled={isRemoving}
            >
              {isRemoving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

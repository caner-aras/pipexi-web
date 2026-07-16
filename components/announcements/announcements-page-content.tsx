"use client";

import { Megaphone, Plus } from "lucide-react";
import { useState } from "react";

import { AnnouncementDrawer } from "@/components/announcements/announcement-drawer";
import { AnnouncementList } from "@/components/announcements/announcement-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Announcement } from "@/types/announcement";

interface AnnouncementsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  announcements: Announcement[];
  error: string | null;
}

export function AnnouncementsPageContent({
  organizationId,
  organizationName,
  announcements,
  error,
}: AnnouncementsPageContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  function handleCreate() {
    setEditingAnnouncement(null);
    setDrawerOpen(true);
  }

  function handleEdit(announcement: Announcement) {
    setEditingAnnouncement(announcement);
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);

    if (!open) {
      setEditingAnnouncement(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Announcements"
        description={
          organizationName
            ? `Announcements for ${organizationName}.`
            : "View announcements for the selected organization."
        }
        actions={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-4" />
            New announcement
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No announcements"
            description="Create your first announcement for this organization."
            action={
              <Button size="sm" onClick={handleCreate}>
                <Plus className="size-4" />
                New announcement
              </Button>
            }
          />
        ) : (
          <AnnouncementList
            announcements={announcements}
            onEditAnnouncement={handleEdit}
          />
        )}
      </div>

      <AnnouncementDrawer
        organizationId={organizationId}
        announcement={editingAnnouncement}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />
    </>
  );
}

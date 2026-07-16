"use client";

import { File, Plus } from "lucide-react";
import { useState } from "react";

import { OrganizationFileDrawer } from "@/components/files/organization-file-drawer";
import { OrganizationFileList } from "@/components/files/organization-file-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { OrganizationFile } from "@/types/organization-file";

interface FilesPageContentProps {
  organizationId: string;
  organizationName: string | null;
  files: OrganizationFile[];
  error: string | null;
}

export function FilesPageContent({
  organizationId,
  organizationName,
  files,
  error,
}: FilesPageContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<OrganizationFile | null>(null);

  function handleCreateFile() {
    setEditingFile(null);
    setDrawerOpen(true);
  }

  function handleEditFile(file: OrganizationFile) {
    setEditingFile(file);
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);

    if (!open) {
      setEditingFile(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Files"
        description={
          organizationName
            ? `Files for ${organizationName}.`
            : "Organization files and uploads."
        }
        actions={
          <Button size="sm" onClick={handleCreateFile}>
            <Plus className="size-4" />
            New file
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : files.length === 0 ? (
          <EmptyState
            icon={File}
            title="No files found"
            description="Create your first file record to get started."
            action={
              <Button size="sm" onClick={handleCreateFile}>
                <Plus className="size-4" />
                New file
              </Button>
            }
          />
        ) : (
          <OrganizationFileList files={files} onEditFile={handleEditFile} />
        )}
      </div>

      <OrganizationFileDrawer
        organizationId={organizationId}
        file={editingFile}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />
    </>
  );
}

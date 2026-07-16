"use client";

import Link from "next/link";
import { File, FileText, Plus } from "lucide-react";
import { useState } from "react";

import { FormTemplateDrawer } from "@/components/forms/form-template-drawer";
import { FormTemplateList } from "@/components/forms/form-template-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { FormTemplate } from "@/types/form-template";

interface FormsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  formTemplates: FormTemplate[];
  error: string | null;
}

export function FormsPageContent({
  organizationId,
  organizationName,
  formTemplates,
  error,
}: FormsPageContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFormTemplate, setEditingFormTemplate] =
    useState<FormTemplate | null>(null);

  function handleCreateFormTemplate() {
    setEditingFormTemplate(null);
    setDrawerOpen(true);
  }

  function handleEditFormTemplate(formTemplate: FormTemplate) {
    setEditingFormTemplate(formTemplate);
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);

    if (!open) {
      setEditingFormTemplate(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Forms"
        description={
          organizationName
            ? `Form templates for ${organizationName}.`
            : "Organization form templates."
        }
        actions={
          <>
            <Link
              href="/files"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <File className="size-4" />
              Files
            </Link>
            <Button size="sm" onClick={handleCreateFormTemplate}>
              <Plus className="size-4" />
              New form
            </Button>
          </>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : formTemplates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No forms found"
            description="Create your first form template to get started."
            action={
              <Button size="sm" onClick={handleCreateFormTemplate}>
                <Plus className="size-4" />
                New form
              </Button>
            }
          />
        ) : (
          <FormTemplateList
            organizationId={organizationId}
            formTemplates={formTemplates}
            onEditFormTemplate={handleEditFormTemplate}
          />
        )}
      </div>

      <FormTemplateDrawer
        organizationId={organizationId}
        formTemplate={editingFormTemplate}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
      />
    </>
  );
}

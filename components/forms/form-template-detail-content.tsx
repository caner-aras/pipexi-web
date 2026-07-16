"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  MoreHorizontalIcon,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { FormTemplateFieldDrawer } from "@/components/forms/form-template-field-drawer";
import { PageHeader } from "@/components/layout/page-header";
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatFieldTypeLabel,
  formatFormTemplateDateTime,
  parseFieldOptions,
  sortFormTemplateFields,
} from "@/lib/form-template-format";
import { cn } from "@/lib/utils";
import type { FormTemplate, FormTemplateField } from "@/types/form-template";

interface FormTemplateDetailContentProps {
  formTemplate: FormTemplate;
  error: string | null;
}

function FormTemplateMetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-sm border border-border/50 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export function FormTemplateDetailContent({
  formTemplate,
  error,
}: FormTemplateDetailContentProps) {
  const router = useRouter();
  const [fieldDrawerOpen, setFieldDrawerOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormTemplateField | null>(
    null
  );
  const [fieldToDelete, setFieldToDelete] = useState<FormTemplateField | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const sortedFields = sortFormTemplateFields(formTemplate.fields);

  function handleCreateField() {
    setEditingField(null);
    setFieldDrawerOpen(true);
  }

  function handleEditField(field: FormTemplateField) {
    setEditingField(field);
    setFieldDrawerOpen(true);
  }

  function handleFieldDrawerOpenChange(open: boolean) {
    setFieldDrawerOpen(open);

    if (!open) {
      setEditingField(null);
    }
  }

  function handleOpenDelete(field: FormTemplateField) {
    setFieldToDelete(field);
    setDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) {
      setFieldToDelete(null);
    }
  }

  async function handleConfirmDelete() {
    if (!fieldToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/organizations/${formTemplate.organizationId}/form-templates/${formTemplate.id}/fields/${fieldToDelete.id}`,
        { method: "DELETE" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete field");
        return;
      }

      toast.success("Field deleted successfully");
      setDeleteDialogOpen(false);
      setFieldToDelete(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete field");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        leading={
          <Link
            href="/forms"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "mb-3 -ml-2 w-fit"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to forms
          </Link>
        }
        title={formTemplate.name}
        titleAddon={<StatusIndicator status={formTemplate.status} showLabel />}
        description={formTemplate.description || "No description provided."}
        actions={
          <>
            <Link
              href={`/forms/${formTemplate.id}/submissions`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ClipboardList className="size-4" />
              Submissions
            </Link>
            <Button size="sm" onClick={handleCreateField}>
              <Plus className="size-4" />
              New field
            </Button>
          </>
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <FormTemplateMetaItem
          label="Fields"
          value={String(formTemplate.fields.length)}
        />
        <FormTemplateMetaItem
          label="Required fields"
          value={String(formTemplate.fields.filter((field) => field.isRequired).length)}
        />
        <FormTemplateMetaItem
          label="Created"
          value={formatFormTemplateDateTime(formTemplate.createdAt)}
        />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">Fields</h2>
          <p className="text-sm text-muted-foreground">
            Form fields in display order.
          </p>
        </div>

        {sortedFields.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No fields yet"
            description="Create your first field to start building this form."
            action={
              <Button size="sm" onClick={handleCreateField}>
                <Plus className="size-4" />
                New field
              </Button>
            }
            className="py-10"
          />
        ) : (
          <div className="overflow-hidden rounded-sm border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFields.map((field) => {
                  const options = parseFieldOptions(field.optionsJson);

                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {field.sortOrder + 1}
                      </TableCell>
                      <TableCell className="font-medium">{field.label}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatFieldTypeLabel(field.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {field.isRequired ? (
                          <Badge variant="secondary">Required</Badge>
                        ) : (
                          <span className="text-muted-foreground">Optional</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md">
                        {options.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {options.map((option) => (
                              <Badge key={option} variant="outline">
                                {option}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusIndicator status={field.status} />
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
                              onClick={() => handleEditField(field)}
                            >
                              Edit field
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(field)}
                            >
                              Delete field
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
      </section>

      <FormTemplateFieldDrawer
        organizationId={formTemplate.organizationId}
        formTemplateId={formTemplate.id}
        fields={formTemplate.fields}
        field={editingField}
        open={fieldDrawerOpen}
        onOpenChange={handleFieldDrawerOpenChange}
      />

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete field?</AlertDialogTitle>
            <AlertDialogDescription>
              {fieldToDelete
                ? `This will permanently delete "${fieldToDelete.label}". This action cannot be undone.`
                : "This will permanently delete the field. This action cannot be undone."}
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

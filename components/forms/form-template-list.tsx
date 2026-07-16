"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FileText, MoreHorizontalIcon, Search } from "lucide-react";
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
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatFormTemplateDate } from "@/lib/form-template-format";
import {
  buildRecordStatusFilterOptions,
  matchesRecordStatusFilter,
} from "@/lib/record-status";
import type { FormTemplate } from "@/types/form-template";

function matchesFormTemplateSearch(
  formTemplate: FormTemplate,
  query: string,
  statusFilter: string
): boolean {
  if (!matchesRecordStatusFilter(formTemplate.status, statusFilter)) {
    return false;
  }

  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const name = formTemplate.name.toLowerCase();
  const description = formTemplate.description.toLowerCase();

  return name.includes(search) || description.includes(search);
}

interface FormTemplateListProps {
  organizationId: string;
  formTemplates: FormTemplate[];
  onEditFormTemplate?: (formTemplate: FormTemplate) => void;
}

export function FormTemplateList({
  organizationId,
  formTemplates,
  onEditFormTemplate,
}: FormTemplateListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formTemplateToDelete, setFormTemplateToDelete] =
    useState<FormTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusFilterOptions = useMemo(
    () =>
      buildRecordStatusFilterOptions(
        formTemplates.map((formTemplate) => formTemplate.status)
      ),
    [formTemplates]
  );

  const filteredFormTemplates = useMemo(
    () =>
      formTemplates.filter((formTemplate) =>
        matchesFormTemplateSearch(formTemplate, searchQuery, statusFilter)
      ),
    [formTemplates, searchQuery, statusFilter]
  );

  function handleOpenDelete(formTemplate: FormTemplate) {
    setFormTemplateToDelete(formTemplate);
    setDeleteDialogOpen(true);
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open);

    if (!open) {
      setFormTemplateToDelete(null);
    }
  }

  async function handleConfirmDelete() {
    if (!formTemplateToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/form-templates/${formTemplateToDelete.id}`,
        { method: "DELETE" }
      );

      const body = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(body.message ?? "Failed to delete form");
        return;
      }

      toast.success("Form deleted successfully");
      setDeleteDialogOpen(false);
      setFormTemplateToDelete(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete form");
    } finally {
      setIsDeleting(false);
    }
  }

  if (formTemplates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No forms found"
        description="Form templates will appear here once they are created."
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
              placeholder="Search by name or description..."
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
          {filteredFormTemplates.length} of {formTemplates.length} form
          {formTemplates.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredFormTemplates.length === 0 ? (
        <EmptyState title="No forms match your search" filtered />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFormTemplates.map((formTemplate) => (
                <TableRow key={formTemplate.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <Link
                      href={`/forms/${formTemplate.id}`}
                      className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
                    >
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      {formTemplate.name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md text-muted-foreground">
                    <span className="line-clamp-2">
                      {formTemplate.description || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusIndicator status={formTemplate.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatFormTemplateDate(formTemplate.createdAt)}
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
                        <DropdownMenuItem
                          render={<Link href={`/forms/${formTemplate.id}`} />}
                        >
                          View form
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/forms/${formTemplate.id}/submissions`}
                            />
                          }
                        >
                          View submissions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditFormTemplate?.(formTemplate)}
                        >
                          Edit form
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleOpenDelete(formTemplate)}
                        >
                          Delete form
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
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              {formTemplateToDelete
                ? `This will permanently delete ${formTemplateToDelete.name}. This action cannot be undone.`
                : "This will permanently delete the form. This action cannot be undone."}
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

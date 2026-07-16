"use client";

import { useMemo, useState } from "react";
import { File, MoreHorizontalIcon, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  formatFileSize,
  formatOrganizationFileDate,
  getOrganizationFileStatusFilterOptions,
  matchesOrganizationFileSearch,
} from "@/lib/organization-file-format";
import type { OrganizationFile } from "@/types/organization-file";

interface OrganizationFileListProps {
  files: OrganizationFile[];
  onEditFile?: (file: OrganizationFile) => void;
}

export function OrganizationFileList({
  files,
  onEditFile,
}: OrganizationFileListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusFilterOptions = useMemo(
    () => getOrganizationFileStatusFilterOptions(files),
    [files]
  );

  const filteredFiles = useMemo(
    () =>
      files.filter((file) =>
        matchesOrganizationFileSearch(file, searchQuery, statusFilter)
      ),
    [files, searchQuery, statusFilter]
  );

  if (files.length === 0) {
    return (
      <EmptyState
        icon={File}
        title="No files found"
        description="Files will appear here once they are uploaded."
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
              placeholder="Search by name, type, or path..."
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
          {filteredFiles.length} of {files.length} file
          {files.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredFiles.length === 0 ? (
        <EmptyState title="No files match your search" filtered />
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Storage path</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <File className="size-4 shrink-0 text-muted-foreground" />
                      {file.fileName}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {file.contentType}
                  </TableCell>
                  <TableCell>{formatFileSize(file.sizeBytes)}</TableCell>
                  <TableCell className="max-w-xs font-mono text-xs text-muted-foreground">
                    <span className="line-clamp-2">{file.storagePath}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusIndicator status={file.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatOrganizationFileDate(file.createdAt)}
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
                        <DropdownMenuItem onClick={() => onEditFile?.(file)}>
                          Edit file
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
    </>
  );
}

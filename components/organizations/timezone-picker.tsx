"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown, Globe2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getOrganizationTimezoneLabel,
  getOrganizationTimezones,
  type OrganizationTimezoneOption,
} from "@/lib/organization-timezones";
import { cn } from "@/lib/utils";

const timezoneColumns: ColumnDef<OrganizationTimezoneOption>[] = [
  {
    accessorKey: "label",
    header: "Timezone",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.label}</p>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {row.original.id}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "offset",
    header: () => <div className="text-right">Offset</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">{row.original.offset}</div>
    ),
  },
];

interface TimezonePickerProps {
  value: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimezonePicker({
  value,
  onValueChange,
  disabled = false,
  className,
}: TimezonePickerProps) {
  const [open, setOpen] = useState(false);
  const timezones = useMemo(() => getOrganizationTimezones(), []);
  const selectedLabel = value ? getOrganizationTimezoneLabel(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-8 w-full justify-between gap-2 px-2.5 font-normal",
              className
            )}
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          <Globe2 className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selectedLabel ?? "Select timezone"}
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[min(calc(100vw-2rem),32rem)] p-3"
        style={{ maxHeight: "min(24rem, var(--available-height, 24rem))" }}
      >
        <PopoverHeader className="mb-3 px-0.5">
          <PopoverTitle>Select timezone</PopoverTitle>
          <PopoverDescription>
            Search and pick a timezone for this organization.
          </PopoverDescription>
        </PopoverHeader>

        <DataTable
          columns={timezoneColumns}
          data={timezones}
          searchPlaceholder="Search timezones..."
          selectedRowId={value}
          getRowId={(row) => row.id}
          paginate={false}
          maxBodyHeight="h-56"
          emptyMessage="No timezones found."
          onRowClick={(row) => {
            onValueChange(row.id);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

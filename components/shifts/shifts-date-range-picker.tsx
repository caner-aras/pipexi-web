"use client";

import { CalendarDays } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateRangeLabel,
  formatLocalDateKey,
  parseDateKey,
} from "@/lib/date-format";

interface ShiftsDateRangePickerProps {
  fromDateKey: string;
  onFromDateChange: (fromDateKey: string) => void;
}

export const ShiftsDateRangePicker = memo(function ShiftsDateRangePicker({
  fromDateKey,
  onFromDateChange,
}: ShiftsDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateKey(fromDateKey);

  function handleSelect(date: Date | undefined) {
    if (!date) {
      return;
    }

    const nextFromDateKey = formatLocalDateKey(date);

    if (nextFromDateKey === fromDateKey) {
      setOpen(false);
      return;
    }

    onFromDateChange(nextFromDateKey);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full min-w-0 justify-start gap-2 font-normal"
          />
        }
      >
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{formatDateRangeLabel(fromDateKey)}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" keepMounted>
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
});

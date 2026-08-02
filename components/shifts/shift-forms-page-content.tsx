"use client";

import { PageHeader } from "@/components/layout/page-header";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, FileWarning } from "lucide-react";
import type { ShiftFormsStatus } from "@/types/shift-forms-status";

interface ShiftFormsPageContentProps {
  organizationId: string;
  shiftForms: ShiftFormsStatus[];
  error: string | null;
}

function formatShiftRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);

  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  });

  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay) {
    return `${dateFmt.format(start)} · ${timeFmt.format(start)} – ${timeFmt.format(end)}`;
  }

  return `${dateFmt.format(start)} ${timeFmt.format(start)} – ${dateFmt.format(end)} ${timeFmt.format(end)}`;
}

export function ShiftFormsPageContent({
  shiftForms,
  error,
}: ShiftFormsPageContentProps) {
  return (
    <>
      <PageHeader
        title="Shift Forms"
        description="Forms attached to recent and upcoming shifts."
      />

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {!error && shiftForms.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-xl border-border bg-card">
          <FileWarning className="mx-auto size-8 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No Shift Forms</h3>
          <p className="text-sm text-muted-foreground mt-1">
            There are no forms attached to recent or upcoming shifts.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shiftForms.map((item) => (
            <div
              key={item.shiftId}
              className="flex flex-col p-4 border border-border rounded-xl bg-card hover:border-border/80 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <PersonAvatar
                  name={item.memberName}
                  avatarUrl={item.memberAvatarUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate text-foreground">
                      {item.memberName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate block mt-0.5">
                    {item.teamName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-foreground">
                <CalendarClock className="size-3.5 text-muted-foreground" />
                {formatShiftRange(item.startAt, item.endAt)}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                {item.isMissingForms ? (
                  <Badge variant="destructive" className="gap-1 rounded-md">
                    <FileWarning className="size-3" />
                    Missing
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-md">
                    Submitted
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

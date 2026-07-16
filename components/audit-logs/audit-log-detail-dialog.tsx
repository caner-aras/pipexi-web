"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getShiftMemberDisplayName } from "@/lib/shift-format";
import {
  formatAuditLogActionLabel,
  type AuditLog,
} from "@/types/audit-log";
import type { OrganizationMember } from "@/types/member";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatJsonPreview(value: string | null): string {
  if (!value) {
    return "—";
  }

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

interface AuditLogDetailDialogProps {
  auditLog: AuditLog | null;
  members: OrganizationMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenChangeComplete?: (open: boolean) => void;
}

export function AuditLogDetailDialog({
  auditLog,
  members,
  open,
  onOpenChange,
  onOpenChangeComplete,
}: AuditLogDetailDialogProps) {
  const actor = auditLog?.actorMemberId
    ? members.find((member) => member.id === auditLog.actorMemberId)
    : null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {auditLog
              ? `${formatAuditLogActionLabel(auditLog.action)} · ${auditLog.entityName}`
              : "Audit log"}
          </DialogTitle>
          <DialogDescription>
            Full details for this audit event.
          </DialogDescription>
        </DialogHeader>

        {auditLog ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {formatAuditLogActionLabel(auditLog.action)}
              </Badge>
              <Badge variant="outline" className="font-normal">
                {auditLog.entityName}
              </Badge>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Actor</dt>
                <dd className="text-right font-medium">
                  {actor ? getShiftMemberDisplayName(actor) : "System"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Entity id</dt>
                <dd className="max-w-[16rem] truncate text-right font-mono text-xs text-muted-foreground">
                  {auditLog.entityId}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="text-right font-medium">
                  {formatDateTime(auditLog.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Before
              </p>
              <pre className="max-h-40 overflow-auto rounded-xl bg-muted/35 px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap">
                {formatJsonPreview(auditLog.beforeJson)}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                After
              </p>
              <pre className="max-h-40 overflow-auto rounded-xl bg-muted/35 px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap">
                {formatJsonPreview(auditLog.afterJson)}
              </pre>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

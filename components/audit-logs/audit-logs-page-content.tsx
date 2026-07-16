"use client";

import { History, Plus } from "lucide-react";
import { useState } from "react";

import { AuditLogDetailDialog } from "@/components/audit-logs/audit-log-detail-dialog";
import { AuditLogDrawer } from "@/components/audit-logs/audit-log-drawer";
import { AuditLogList } from "@/components/audit-logs/audit-log-list";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { AuditLog } from "@/types/audit-log";
import type { OrganizationMember } from "@/types/member";

interface AuditLogsPageContentProps {
  organizationId: string;
  organizationName: string | null;
  auditLogs: AuditLog[];
  members: OrganizationMember[];
  error: string | null;
}

export function AuditLogsPageContent({
  organizationId,
  organizationName,
  auditLogs,
  members,
  error,
}: AuditLogsPageContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
    null
  );

  function handleCreate() {
    setDrawerOpen(true);
  }

  function handleView(auditLog: AuditLog) {
    setSelectedAuditLog(auditLog);
    setDetailOpen(true);
  }

  function handleDetailOpenChange(open: boolean) {
    setDetailOpen(open);
  }

  function handleDetailOpenChangeComplete(open: boolean) {
    if (!open) {
      setSelectedAuditLog(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description={
          organizationName
            ? `Audit history for ${organizationName}.`
            : "View audit history for the selected organization."
        }
        actions={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-4" />
            New audit log
          </Button>
        }
      />

      <div className="w-full">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : auditLogs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No audit logs"
            description="Audit events for this organization will appear here."
            action={
              <Button size="sm" onClick={handleCreate}>
                <Plus className="size-4" />
                New audit log
              </Button>
            }
          />
        ) : (
          <AuditLogList
            auditLogs={auditLogs}
            members={members}
            onViewAuditLog={handleView}
          />
        )}
      </div>

      <AuditLogDrawer
        organizationId={organizationId}
        members={members}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />

      <AuditLogDetailDialog
        auditLog={selectedAuditLog}
        members={members}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        onOpenChangeComplete={handleDetailOpenChangeComplete}
      />
    </>
  );
}

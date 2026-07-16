export interface AuditLog {
  id: string;
  organizationId: string;
  actorMemberId: string | null;
  entityName: string;
  entityId: string;
  action: string;
  beforeJson: string | null;
  afterJson: string | null;
  createdAt: string;
}

export interface CreateAuditLogInput {
  organizationId: string;
  actorMemberId: string | null;
  entityName: string;
  entityId: string;
  action: string;
  beforeJson: string | null;
  afterJson: string | null;
}

export function formatAuditLogActionLabel(action: string): string {
  if (!action) {
    return "Unknown";
  }

  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
}

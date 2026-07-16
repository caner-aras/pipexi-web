import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createAuditLog,
  listAuditLogs,
} from "@/lib/server/services/audit-log.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

  try {
    const auditLogs = await listAuditLogs(organizationId);
    return NextResponse.json({ data: auditLogs });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load audit logs." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const payload = body as {
    organizationId?: string;
    actorMemberId?: string | null;
    entityName?: string;
    entityId?: string;
    action?: string;
    beforeJson?: string | null;
    afterJson?: string | null;
  };

  const organizationId = payload.organizationId?.trim() ?? "";
  const actorMemberId =
    typeof payload.actorMemberId === "string" && payload.actorMemberId.trim()
      ? payload.actorMemberId.trim()
      : null;
  const entityName = payload.entityName?.trim() ?? "";
  const entityId = payload.entityId?.trim() ?? "";
  const action = payload.action?.trim().toLowerCase() ?? "";
  const beforeJson =
    typeof payload.beforeJson === "string" && payload.beforeJson.trim()
      ? payload.beforeJson.trim()
      : null;
  const afterJson =
    typeof payload.afterJson === "string" && payload.afterJson.trim()
      ? payload.afterJson.trim()
      : null;

  if (!organizationId) {
    return NextResponse.json(
      { message: "organizationId is required." },
      { status: 400 }
    );
  }

  if (!entityName) {
    return NextResponse.json(
      { message: "Entity name is required." },
      { status: 400 }
    );
  }

  if (!entityId) {
    return NextResponse.json(
      { message: "Entity id is required." },
      { status: 400 }
    );
  }

  if (!action) {
    return NextResponse.json({ message: "Action is required." }, { status: 400 });
  }

  try {
    const auditLog = await createAuditLog({
      organizationId,
      actorMemberId,
      entityName,
      entityId,
      action,
      beforeJson,
      afterJson,
    });

    return NextResponse.json({ data: auditLog });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create audit log." },
      { status: 500 }
    );
  }
}

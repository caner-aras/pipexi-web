import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createOrganizationFile,
  getOrganizationFiles,
} from "@/lib/server/services/organization-file.service";

function parseOrganizationFilePayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body" as const };
  }

  const payload = body as {
    fileName?: string;
    contentType?: string;
    storagePath?: string;
    sizeBytes?: number;
  };

  if (!payload.fileName?.trim()) {
    return { error: "File name is required." as const };
  }

  if (!payload.contentType?.trim()) {
    return { error: "Content type is required." as const };
  }

  if (!payload.storagePath?.trim()) {
    return { error: "Storage path is required." as const };
  }

  if (typeof payload.sizeBytes !== "number" || payload.sizeBytes < 0) {
    return { error: "sizeBytes must be a non-negative number." as const };
  }

  return {
    data: {
      fileName: payload.fileName.trim(),
      contentType: payload.contentType.trim(),
      storagePath: payload.storagePath.trim(),
      sizeBytes: payload.sizeBytes,
    },
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  try {
    const files = await getOrganizationFiles(organizationId);
    return NextResponse.json({ data: files });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load files." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const parsed = parseOrganizationFilePayload(body);

  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  try {
    const file = await createOrganizationFile(organizationId, parsed.data);
    return NextResponse.json({ data: file });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create file." },
      { status: 500 }
    );
  }
}

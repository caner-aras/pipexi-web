import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createOrganizationFormTemplate,
  getOrganizationFormTemplates,
} from "@/lib/server/services/form-template.service";

function parseFormTemplatePayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body" as const };
  }

  const payload = body as {
    name?: string;
    description?: string;
  };

  if (!payload.name?.trim()) {
    return { error: "Name is required." as const };
  }

  return {
    data: {
      name: payload.name.trim(),
      description: payload.description?.trim() ?? "",
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
    const formTemplates = await getOrganizationFormTemplates(organizationId);
    return NextResponse.json({ data: formTemplates });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load form templates." },
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

  const parsed = parseFormTemplatePayload(body);

  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  try {
    const formTemplate = await createOrganizationFormTemplate(
      organizationId,
      parsed.data
    );

    return NextResponse.json({ data: formTemplate });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create form template." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteOrganizationFormTemplate,
  getOrganizationFormTemplate,
  updateOrganizationFormTemplate,
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
  {
    params,
  }: { params: Promise<{ organizationId: string; formTemplateId: string }> }
) {
  const { organizationId, formTemplateId } = await params;

  if (!organizationId || !formTemplateId) {
    return NextResponse.json(
      { message: "Organization id and form template id are required" },
      { status: 400 }
    );
  }

  try {
    const formTemplate = await getOrganizationFormTemplate(
      organizationId,
      formTemplateId
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
      { message: "Failed to load form template." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; formTemplateId: string }> }
) {
  const { organizationId, formTemplateId } = await params;

  if (!organizationId || !formTemplateId) {
    return NextResponse.json(
      { message: "Organization id and form template id are required" },
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
    const formTemplate = await updateOrganizationFormTemplate(
      organizationId,
      formTemplateId,
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
      { message: "Failed to update form template." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ organizationId: string; formTemplateId: string }> }
) {
  const { organizationId, formTemplateId } = await params;

  if (!organizationId || !formTemplateId) {
    return NextResponse.json(
      { message: "Organization id and form template id are required" },
      { status: 400 }
    );
  }

  try {
    await deleteOrganizationFormTemplate(organizationId, formTemplateId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete form template." },
      { status: 500 }
    );
  }
}

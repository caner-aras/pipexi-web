import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { fieldTypeRequiresOptions } from "@/lib/form-template-format";
import { createOrganizationFormTemplateField } from "@/lib/server/services/form-template.service";

function parseFieldPayload(body: unknown) {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body" as const };
  }

  const payload = body as {
    type?: string;
    label?: string;
    isRequired?: boolean;
    sortOrder?: number;
    optionsJson?: string | null;
  };

  if (!payload.type?.trim()) {
    return { error: "Type is required." as const };
  }

  if (!payload.label?.trim()) {
    return { error: "Label is required." as const };
  }

  if (typeof payload.isRequired !== "boolean") {
    return { error: "isRequired must be a boolean." as const };
  }

  if (typeof payload.sortOrder !== "number" || payload.sortOrder < 0) {
    return { error: "sortOrder must be a non-negative number." as const };
  }

  const type = payload.type.trim();
  const optionsJson =
    payload.optionsJson === undefined || payload.optionsJson === null
      ? null
      : payload.optionsJson.trim() || null;

  if (fieldTypeRequiresOptions(type) && !optionsJson) {
    return { error: "optionsJson is required for select field types." as const };
  }

  return {
    data: {
      type,
      label: payload.label.trim(),
      isRequired: payload.isRequired,
      sortOrder: payload.sortOrder,
      optionsJson,
    },
  };
}

export async function POST(
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

  const parsed = parseFieldPayload(body);

  if ("error" in parsed) {
    return NextResponse.json({ message: parsed.error }, { status: 400 });
  }

  try {
    const field = await createOrganizationFormTemplateField(
      organizationId,
      formTemplateId,
      parsed.data
    );

    return NextResponse.json({ data: field });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create form field." },
      { status: 500 }
    );
  }
}

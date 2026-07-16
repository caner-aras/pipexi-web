import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { deleteOrganizationFormSubmission } from "@/lib/server/services/form-submission.service";

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ organizationId: string; formSubmissionId: string }>;
  }
) {
  const { organizationId, formSubmissionId } = await params;

  if (!organizationId || !formSubmissionId) {
    return NextResponse.json(
      { message: "Organization id and form submission id are required" },
      { status: 400 }
    );
  }

  try {
    await deleteOrganizationFormSubmission(organizationId, formSubmissionId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete form submission." },
      { status: 500 }
    );
  }
}

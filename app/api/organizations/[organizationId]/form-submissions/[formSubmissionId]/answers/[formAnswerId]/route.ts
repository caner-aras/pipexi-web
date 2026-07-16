import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { deleteOrganizationFormAnswer } from "@/lib/server/services/form-submission.service";

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      formSubmissionId: string;
      formAnswerId: string;
    }>;
  }
) {
  const { organizationId, formSubmissionId, formAnswerId } = await params;

  if (!organizationId || !formSubmissionId || !formAnswerId) {
    return NextResponse.json(
      {
        message:
          "Organization id, form submission id, and form answer id are required",
      },
      { status: 400 }
    );
  }

  try {
    await deleteOrganizationFormAnswer(
      organizationId,
      formSubmissionId,
      formAnswerId
    );
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete form answer." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  createOrganizationFormSubmission,
  getOrganizationFormSubmissions,
} from "@/lib/server/services/form-submission.service";
import type { CreateFormSubmissionAnswerInput } from "@/types/form-submission";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  const { organizationId } = await params;
  const formTemplateId = new URL(request.url).searchParams.get("formTemplateId");

  if (!organizationId) {
    return NextResponse.json(
      { message: "Organization id is required" },
      { status: 400 }
    );
  }

  if (!formTemplateId) {
    return NextResponse.json(
      { message: "formTemplateId is required" },
      { status: 400 }
    );
  }

  try {
    const submissions = await getOrganizationFormSubmissions(
      organizationId,
      formTemplateId
    );

    return NextResponse.json({ data: submissions });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load form submissions." },
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

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const payload = body as {
    formTemplateId?: string;
    submittedByMemberId?: string;
    taskId?: string;
    shiftId?: string;
    submittedAt?: string;
    answers?: CreateFormSubmissionAnswerInput[];
  };

  if (!payload.formTemplateId?.trim()) {
    return NextResponse.json(
      { message: "Form template id is required." },
      { status: 400 }
    );
  }

  if (!payload.submittedByMemberId?.trim()) {
    return NextResponse.json(
      { message: "Submitted by member id is required." },
      { status: 400 }
    );
  }

  if (!payload.submittedAt?.trim()) {
    return NextResponse.json(
      { message: "Submitted at is required." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.answers)) {
    return NextResponse.json(
      { message: "Answers must be an array." },
      { status: 400 }
    );
  }

  for (const answer of payload.answers) {
    if (!answer.formFieldId?.trim()) {
      return NextResponse.json(
        { message: "Each answer must include a form field id." },
        { status: 400 }
      );
    }
  }

  try {
    const submission = await createOrganizationFormSubmission(organizationId, {
      formTemplateId: payload.formTemplateId.trim(),
      submittedByMemberId: payload.submittedByMemberId.trim(),
      submittedAt: payload.submittedAt.trim(),
      taskId: payload.taskId?.trim() || undefined,
      shiftId: payload.shiftId?.trim() || undefined,
      answers: payload.answers.map((answer) => ({
        formFieldId: answer.formFieldId.trim(),
        value: answer.value ?? "",
        fileId: answer.fileId?.trim() || undefined,
      })),
    });

    return NextResponse.json({ data: submission });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create form submission." },
      { status: 500 }
    );
  }
}

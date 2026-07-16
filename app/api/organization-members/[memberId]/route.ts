import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteOrganizationMember,
  getOrganizationMember,
  updateOrganizationMember,
} from "@/lib/server/services/member.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params;

  if (!memberId) {
    return NextResponse.json({ message: "Member id is required" }, { status: 400 });
  }

  try {
    const member = await getOrganizationMember(memberId);
    return NextResponse.json({ data: member });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load member" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params;

  if (!memberId) {
    return NextResponse.json({ message: "Member id is required" }, { status: 400 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const jobTitle =
    typeof body === "object" &&
    body !== null &&
    "jobTitle" in body &&
    typeof body.jobTitle === "string"
      ? body.jobTitle
      : null;

  const status =
    typeof body === "object" &&
    body !== null &&
    "status" in body &&
    typeof body.status === "string"
      ? body.status
      : null;

  if (!jobTitle || !status) {
    return NextResponse.json(
      { message: "jobTitle and status are required" },
      { status: 400 }
    );
  }

  try {
    const member = await updateOrganizationMember(memberId, { jobTitle, status });
    return NextResponse.json({ data: member });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params;

  if (!memberId) {
    return NextResponse.json({ message: "Member id is required" }, { status: 400 });
  }

  try {
    await deleteOrganizationMember(memberId);
    return NextResponse.json({ data: true });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to remove member from organization" },
      { status: 500 }
    );
  }
}

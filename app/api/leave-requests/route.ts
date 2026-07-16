import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import {
  createLeaveRequest,
  listLeaveRequests,
} from "@/lib/server/services/leave-request.service";
import { getOrganizationMembers } from "@/lib/server/services/organization.service";

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
    const [leaveRequests, currentUser, members] = await Promise.all([
      listLeaveRequests(organizationId),
      getCurrentUser(),
      getOrganizationMembers(organizationId),
    ]);

    const currentMember = members.find(
      (member) => member.userId === currentUser.userId
    );

    return NextResponse.json({
      data: leaveRequests,
      currentOrganizationMemberId: currentMember?.id ?? null,
    });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load leave requests." },
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
    organizationMemberId?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
  };

  if (
    !payload.organizationId?.trim() ||
    !payload.leaveType?.trim() ||
    !payload.startDate?.trim() ||
    !payload.endDate?.trim() ||
    !payload.reason?.trim()
  ) {
    return NextResponse.json(
      {
        message:
          "organizationId, leaveType, startDate, endDate, and reason are required.",
      },
      { status: 400 }
    );
  }

  try {
    const organizationId = payload.organizationId.trim();
    let organizationMemberId = payload.organizationMemberId?.trim() ?? "";

    if (!organizationMemberId) {
      const [currentUser, members] = await Promise.all([
        getCurrentUser(),
        getOrganizationMembers(organizationId),
      ]);

      const member = members.find(
        (item) => item.userId === currentUser.userId
      );

      if (!member) {
        return NextResponse.json(
          {
            message:
              "You are not a member of this organization, so a leave request cannot be created.",
          },
          { status: 400 }
        );
      }

      organizationMemberId = member.id;
    }

    const existingRequests = await listLeaveRequests(organizationId);
    const hasPendingRequest = existingRequests.some(
      (request) =>
        request.organizationMemberId === organizationMemberId &&
        request.status.toLowerCase() === "pending"
    );

    if (hasPendingRequest) {
      return NextResponse.json(
        {
          message:
            "You already have a pending leave request for this organization.",
        },
        { status: 409 }
      );
    }

    const leaveRequest = await createLeaveRequest({
      organizationId,
      organizationMemberId,
      leaveType: payload.leaveType.trim(),
      startDate: payload.startDate.trim(),
      endDate: payload.endDate.trim(),
      reason: payload.reason.trim(),
    });

    return NextResponse.json({ data: leaveRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create leave request." },
      { status: 500 }
    );
  }
}

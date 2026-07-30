import { NextResponse } from "next/server";

import { BackendApiError } from "@/lib/server/api-client";
import {
  deleteOrganizationMemberPayment,
  updateOrganizationMemberPayment,
} from "@/lib/server/services/organization-member-profile.service";

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      organizationMemberId: string;
      paymentId: string;
    }>;
  }
) {
  const { organizationId, organizationMemberId, paymentId } = await params;

  if (!organizationId || !organizationMemberId || !paymentId) {
    return NextResponse.json(
      {
        message:
          "Organization id, organization member id, and payment id are required",
      },
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
    amount?: number;
    currency?: string;
    paidAt?: string;
    method?: string;
    reference?: string | null;
    notes?: string | null;
    periodStart?: string | null;
    periodEnd?: string | null;
  };

  if (typeof payload.amount !== "number" || !(payload.amount > 0)) {
    return NextResponse.json(
      { message: "Amount must be greater than 0." },
      { status: 400 }
    );
  }

  if (!payload.currency?.trim()) {
    return NextResponse.json({ message: "Currency is required." }, { status: 400 });
  }

  if (!payload.paidAt?.trim()) {
    return NextResponse.json({ message: "paidAt is required." }, { status: 400 });
  }

  if (!payload.method?.trim()) {
    return NextResponse.json({ message: "Method is required." }, { status: 400 });
  }

  try {
    const payment = await updateOrganizationMemberPayment(
      organizationId,
      organizationMemberId,
      paymentId,
      {
        amount: payload.amount,
        currency: payload.currency.trim(),
        paidAt: payload.paidAt.trim(),
        method: payload.method.trim(),
        reference: payload.reference?.trim() || null,
        notes: payload.notes?.trim() || null,
        periodStart: payload.periodStart?.trim() || null,
        periodEnd: payload.periodEnd?.trim() || null,
      }
    );

    return NextResponse.json({ data: payment });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update payment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      organizationId: string;
      organizationMemberId: string;
      paymentId: string;
    }>;
  }
) {
  const { organizationId, organizationMemberId, paymentId } = await params;

  if (!organizationId || !organizationMemberId || !paymentId) {
    return NextResponse.json(
      {
        message:
          "Organization id, organization member id, and payment id are required",
      },
      { status: 400 }
    );
  }

  try {
    await deleteOrganizationMemberPayment(
      organizationId,
      organizationMemberId,
      paymentId
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
      { message: "Failed to delete payment" },
      { status: 500 }
    );
  }
}

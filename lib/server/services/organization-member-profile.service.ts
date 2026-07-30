import "server-only";

import { BackendApiError, backendFetch } from "@/lib/server/api-client";
import type {
  CreateOrganizationMemberPaymentInput,
  OrganizationMemberPayment,
  OrganizationMemberProfile,
  UpdateOrganizationMemberPaymentInput,
  UpsertOrganizationMemberProfileInput,
} from "@/types/organization-member-profile";

function memberBasePath(organizationId: string, organizationMemberId: string) {
  return `/organizations/${organizationId}/organization-members/${organizationMemberId}`;
}

export async function getOrganizationMemberProfile(
  organizationId: string,
  organizationMemberId: string
): Promise<OrganizationMemberProfile | null> {
  try {
    return await backendFetch<OrganizationMemberProfile>(
      `${memberBasePath(organizationId, organizationMemberId)}/profile`
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

export async function upsertOrganizationMemberProfile(
  organizationId: string,
  organizationMemberId: string,
  input: UpsertOrganizationMemberProfileInput
): Promise<OrganizationMemberProfile> {
  return backendFetch<OrganizationMemberProfile>(
    `${memberBasePath(organizationId, organizationMemberId)}/profile`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function getOrganizationMemberPayments(
  organizationId: string,
  organizationMemberId: string
): Promise<OrganizationMemberPayment[]> {
  return backendFetch<OrganizationMemberPayment[]>(
    `${memberBasePath(organizationId, organizationMemberId)}/payments`
  );
}

export async function createOrganizationMemberPayment(
  organizationId: string,
  organizationMemberId: string,
  input: CreateOrganizationMemberPaymentInput
): Promise<OrganizationMemberPayment> {
  return backendFetch<OrganizationMemberPayment>(
    `${memberBasePath(organizationId, organizationMemberId)}/payments`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateOrganizationMemberPayment(
  organizationId: string,
  organizationMemberId: string,
  paymentId: string,
  input: UpdateOrganizationMemberPaymentInput
): Promise<OrganizationMemberPayment> {
  return backendFetch<OrganizationMemberPayment>(
    `${memberBasePath(organizationId, organizationMemberId)}/payments/${paymentId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteOrganizationMemberPayment(
  organizationId: string,
  organizationMemberId: string,
  paymentId: string
): Promise<void> {
  await backendFetch(
    `${memberBasePath(organizationId, organizationMemberId)}/payments/${paymentId}`,
    {
      method: "DELETE",
    }
  );
}

export type OrganizationMemberGender =
  | "male"
  | "female"
  | "other"
  | "prefer_not_to_say";

export interface OrganizationMemberProfile {
  id: string;
  organizationMemberId: string;
  dateOfBirth: string | null;
  gender: OrganizationMemberGender | string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  nationalId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UpsertOrganizationMemberProfileInput {
  dateOfBirth?: string | null;
  gender?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  nationalId?: string | null;
}

export type OrganizationMemberPaymentMethod =
  | "cash"
  | "bank_transfer"
  | "check"
  | "card"
  | "other";

export interface OrganizationMemberPayment {
  id: string;
  organizationMemberId: string;
  amount: number;
  currency: string;
  paidAt: string;
  method: OrganizationMemberPaymentMethod | string;
  reference: string | null;
  notes: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateOrganizationMemberPaymentInput {
  amount: number;
  currency?: string | null;
  paidAt: string;
  method: string;
  reference?: string | null;
  notes?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}

export interface UpdateOrganizationMemberPaymentInput {
  amount: number;
  currency: string;
  paidAt: string;
  method: string;
  reference?: string | null;
  notes?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}

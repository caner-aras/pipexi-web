export const ACCESS_TOKEN_COOKIE = "access_token" as const;
export const REFRESH_TOKEN_COOKIE = "refresh_token" as const;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginTokenData {
  statusCode: number;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface AuthUser {
  userId: string;
  organizationId: string;
  organizationMemberId?: string | null;
  roleId?: string | null;
  role: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface UpdateUserInput {
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  statusCode: number;
  user_id: string;
  email: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_in?: number | null;
}

export interface SyncProfileInput {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface SyncProfileResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  created: boolean;
}

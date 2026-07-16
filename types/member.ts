export interface OrganizationMemberUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  roleId: string;
  jobTitle: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  user: OrganizationMemberUser;
}

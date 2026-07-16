import { AppSidebar } from "@/components/app-sidebar";
import { UnauthorizedHandler } from "@/components/auth/unauthorized-handler";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { OrganizationProvider } from "@/components/layout/organization-provider";
import { OrganizationTasksProvider } from "@/components/tasks/organization-tasks-context";
import { TeamMemberTasksProvider } from "@/components/team-members/team-member-tasks-context";
import { BackendApiError, backendFetch } from "@/lib/server/api-client";
import { redirectIfUnauthorized } from "@/lib/server/redirect-if-unauthorized";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import {
  getSelectedOrganizationIdFromCookie,
  resolveSelectedOrganizationId,
} from "@/lib/server/selected-organization";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { AuthUser, Organization } from "@/types/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let organizations: Organization[] = [];
  let organizationsError: string | null = null;
  let user: AuthUser | null = null;
  let userError: string | null = null;

  try {
    organizations = await backendFetch<Organization[]>("/organizations");
  } catch (err) {
    redirectIfUnauthorized(err);

    if (err instanceof BackendApiError) {
      organizationsError = err.message;
    } else {
      organizationsError = "Failed to load organizations.";
    }
  }

  try {
    user = await getCurrentUser();
  } catch (err) {
    redirectIfUnauthorized(err);

    if (err instanceof BackendApiError) {
      userError = err.message;
    } else {
      userError = "Failed to load user.";
    }
  }

  const cookieOrganizationId = await getSelectedOrganizationIdFromCookie();
  const initialSelectedOrganizationId = resolveSelectedOrganizationId(
    organizations,
    cookieOrganizationId
  );

  return (
    <OrganizationProvider
      organizations={organizations}
      initialSelectedOrganizationId={initialSelectedOrganizationId}
    >
      <UnauthorizedHandler />
      <SidebarProvider>
        <AppSidebar user={user} userError={userError} />
        <SidebarInset className="min-w-0">
          <OrganizationTasksProvider>
            <TeamMemberTasksProvider>
              <div className="print:hidden">
                <DashboardHeader organizationsError={organizationsError} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-muted/20 print:bg-white print:overflow-visible">
                {children}
              </div>
            </TeamMemberTasksProvider>
          </OrganizationTasksProvider>
        </SidebarInset>
      </SidebarProvider>
    </OrganizationProvider>
  );
}

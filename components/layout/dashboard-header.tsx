"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { DashboardBreadcrumb } from "@/components/layout/dashboard-breadcrumb";
import { MessagesHeaderAction } from "@/components/layout/messages-header-action";
import { NotificationsHeaderAction } from "@/components/layout/notifications-header-action";
import { OrganizationSwitcher } from "@/components/layout/organization-switcher";
import { OrganizationTasksHeaderAction } from "@/components/tasks/organization-tasks-header-action";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  organizationsError?: string | null;
}

export function DashboardHeader({ organizationsError }: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border/50 px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger />
        <div className="hidden md:block min-w-0 flex-1">
          <DashboardBreadcrumb />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <MessagesHeaderAction />
        <NotificationsHeaderAction />
        <OrganizationTasksHeaderAction />
        <OrganizationSwitcher error={organizationsError} />
        <ThemeToggle />
        <Button
          variant="outline"
          size="default"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </Button>
      </div>
    </header>
  );
}

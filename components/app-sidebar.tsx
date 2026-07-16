"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/layout/brand-logo";
import { SidebarCollapsibleNavItem } from "@/components/layout/sidebar-collapsible-nav-item";
import { SidebarUserInfo } from "@/components/layout/sidebar-user-info";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { dashboardNavGroups } from "@/lib/dashboard-navigation";
import type { AuthUser } from "@/types/auth";

interface AppSidebarProps {
  user?: AuthUser | null;
  userError?: string | null;
}

function isPathActive(pathname: string, path: string): boolean {
  return (
    pathname === path ||
    (path !== "/dashboard" && pathname.startsWith(`${path}/`))
  );
}

export function AppSidebar({ user, userError }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="print:hidden">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Pipexi"
              render={<Link href="/dashboard" />}
              className="data-[size=lg]:h-12 group-data-[collapsible=icon]:justify-center"
            >
              <BrandLogo
                size="sm"
                className="group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5 group-data-[collapsible=icon]:object-left group-data-[collapsible=icon]:object-top"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {user ? (
          <SidebarUserInfo user={user} />
        ) : userError ? (
          <p className="px-2 text-xs text-destructive">Failed to load user</p>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        {dashboardNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.items?.length) {
                    return (
                      <SidebarCollapsibleNavItem
                        key={item.key}
                        item={item}
                        pathname={pathname}
                      />
                    );
                  }

                  const Icon = item.icon;
                  const isActive = isPathActive(pathname, item.path);

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={<Link href={item.path} />}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

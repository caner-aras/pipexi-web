"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { DashboardNavItem } from "@/lib/dashboard-navigation";
import { cn } from "@/lib/utils";

function isPathActive(pathname: string, path: string): boolean {
  return (
    pathname === path ||
    (path !== "/dashboard" && pathname.startsWith(`${path}/`))
  );
}

interface SidebarCollapsibleNavItemProps {
  item: DashboardNavItem;
  pathname: string;
}

export function SidebarCollapsibleNavItem({
  item,
  pathname,
}: SidebarCollapsibleNavItemProps) {
  const Icon = item.icon;
  const subItems = item.items ?? [];
  const isSectionActive =
    isPathActive(pathname, item.path) ||
    subItems.some((subItem) => isPathActive(pathname, subItem.path));

  const [open, setOpen] = useState(isSectionActive);

  useEffect(() => {
    if (isSectionActive) {
      setOpen(true);
    }
  }, [isSectionActive]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isSectionActive}
        tooltip={item.label}
        data-open={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon />
        <span>{item.label}</span>
        <ChevronRight
          className={cn(
            "ml-auto transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </SidebarMenuButton>

      {open ? (
        <SidebarMenuSub>
          {subItems.map((subItem) => (
            <SidebarMenuSubItem key={subItem.key}>
              <SidebarMenuSubButton
                isActive={isPathActive(pathname, subItem.path)}
                render={<Link href={subItem.path} />}
              >
                <span>{subItem.label}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      ) : null}
    </SidebarMenuItem>
  );
}

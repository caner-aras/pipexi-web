import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Briefcase,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckSquare,
  Clock3,
  FileText,
  FolderOpen,
  History,
  KeyRound,
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageSquare,
  Settings,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";

export interface DashboardNavSubItem {
  key: string;
  label: string;
  path: string;
}

export interface DashboardNavItem {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
  items?: DashboardNavSubItem[];
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

const iconMap = {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  UsersRound,
  Shield,
  KeyRound,
  MapPin,
  CalendarDays,
  Clock3,
  CheckSquare,
  FileText,
  FolderOpen,
  Megaphone,
  MessageSquare,
  CalendarCheck2,
  Bell,
  History,
  Settings,
} as const;

type IconName = keyof typeof iconMap;

function navItem(
  key: string,
  label: string,
  path: string,
  icon: IconName,
  items?: DashboardNavSubItem[]
): DashboardNavItem {
  return { key, label, path, icon: iconMap[icon], items };
}

export const dashboardNavGroups: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [navItem("dashboard", "Dashboard", "/dashboard", "LayoutDashboard")],
  },
  {
    label: "Organization",
    items: [
      navItem("organizations", "Organizations", "/organizations", "Building2"),
      navItem("teams", "Teams", "/teams", "UsersRound"),
      navItem("positions", "Positions", "/positions", "Briefcase"),
      //navItem("roles", "Roles", "/roles", "Shield"),
    ],
  },
  {
    label: "Operations",
    items: [
      navItem("locations", "Locations", "/locations", "MapPin"),
      navItem("shifts", "Shifts", "/shifts", "CalendarDays"),
    ],
  },
  {
    label: "Work",
    items: [
      navItem("tasks", "Tasks", "/tasks", "CheckSquare"),
      navItem("forms", "Forms", "/forms", "FileText"),
      navItem("files", "Files", "/files", "FolderOpen"),
    ],
  },
  {
    label: "Communication",
    items: [
      navItem("messages", "Messages", "/messages", "MessageSquare"),
      navItem("announcements", "Announcements", "/announcements", "Megaphone"),
      navItem(
        "leaveRequests",
        "Leave Requests",
        "/leave-requests",
        "CalendarCheck2"
      ),
      navItem("notifications", "Notifications", "/notifications", "Bell"),
    ],
  },
  {
    label: "Reports",
    items: [
      navItem("shiftReports", "Shift Report", "/reports/shifts", "FileText"),
    ],
  },
  {
    label: "System",
    items: [
      navItem("settings", "Settings", "/settings", "Settings", [
        {
          key: "settingsOverview",
          label: "Overview",
          path: "/settings",
        },
        {
          key: "settingsPermissions",
          label: "Permissions",
          path: "/settings/permissions",
        },
      ]),
    ],
  },
];

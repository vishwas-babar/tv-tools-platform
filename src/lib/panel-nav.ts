import type { SidebarItem } from "@/components/sidebar";

export const userPanelItems: SidebarItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/tools", label: "Tools", icon: "tools" },
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/purchases", label: "Purchases", icon: "purchases" },
];

export const adminPanelItems: SidebarItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/tools", label: "Tools", icon: "tools" },
  { href: "/admin/plans", label: "Plans", icon: "plans" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "subscriptions" },
  { href: "/admin/coupons", label: "Coupons", icon: "coupons" },
];

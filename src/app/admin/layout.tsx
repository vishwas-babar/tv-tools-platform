import { AppShell } from "@/components/app-shell";
import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper";

const adminItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" as const },
  { href: "/admin/tools", label: "Tools", icon: "tools" as const },
  { href: "/admin/plans", label: "Plans", icon: "plans" as const },
  { href: "/admin/users", label: "Users", icon: "users" as const },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "subscriptions" as const },
  { href: "/admin/coupons", label: "Coupons", icon: "coupons" as const },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteWrapper requireAdmin>
      <AppShell items={adminItems} title="Admin Panel">
        {children}
      </AppShell>
    </ProtectedRouteWrapper>
  );
}

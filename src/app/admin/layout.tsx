import { Sidebar } from "@/components/sidebar";
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
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar items={adminItems} title="Admin Panel" />
        <div className="flex-1 overflow-auto p-6 lg:p-8">{children}</div>
      </div>
    </ProtectedRouteWrapper>
  );
}

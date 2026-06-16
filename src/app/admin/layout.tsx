import { Sidebar } from "@/components/sidebar";
import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper";

const adminItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/coupons", label: "Coupons" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteWrapper requireAdmin>
      <div className="flex min-h-[calc(100vh-57px)]">
        <Sidebar items={adminItems} title="Admin Panel" />
        <div className="flex-1 p-6">{children}</div>
      </div>
    </ProtectedRouteWrapper>
  );
}

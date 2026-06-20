import { Sidebar } from "@/components/sidebar";

const dashboardItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/profile", label: "Profile", icon: "profile" as const },
  { href: "/purchases", label: "Purchases", icon: "purchases" as const },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar items={dashboardItems} title="User Panel" />
      <div className="flex-1 overflow-auto p-6 lg:p-8">{children}</div>
    </div>
  );
}

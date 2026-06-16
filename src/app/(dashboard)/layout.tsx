import { Sidebar } from "@/components/sidebar";

const dashboardItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/purchases", label: "Purchases" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      <Sidebar items={dashboardItems} title="User Panel" />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

const dashboardItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { href: "/tools", label: "Tools", icon: "tools" as const },
  { href: "/profile", label: "Profile", icon: "profile" as const },
  { href: "/purchases", label: "Purchases", icon: "purchases" as const },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6">
        {children}
      </div>
    );
  }

  return (
    <AppShell items={dashboardItems} title="User Panel">
      {children}
    </AppShell>
  );
}

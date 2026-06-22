import { auth } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { userPanelItems } from "@/lib/panel-nav";

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
    <AppShell items={userPanelItems} title="User Panel">
      {children}
    </AppShell>
  );
}

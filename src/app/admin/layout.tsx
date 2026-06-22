import { AppShell } from "@/components/app-shell";
import { ProtectedRouteWrapper } from "@/components/protected-route-wrapper";
import { adminPanelItems } from "@/lib/panel-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteWrapper requireAdmin>
      <AppShell items={adminPanelItems} title="Admin Panel">
        {children}
      </AppShell>
    </ProtectedRouteWrapper>
  );
}

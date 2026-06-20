import { Sidebar, type SidebarItem } from "@/components/sidebar";

interface AppShellProps {
  items: SidebarItem[];
  title: string;
  exactRoots?: string[];
  children: React.ReactNode;
}

export function AppShell({ items, title, exactRoots, children }: AppShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar
        items={items}
        title={title}
        exactRoots={exactRoots}
        className="hidden md:flex"
      />
      <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

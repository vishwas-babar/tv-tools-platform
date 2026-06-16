import Link from "next/link";

interface SidebarItem {
  href: string;
  label: string;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      tradingViewId: true,
      role: true,
      createdAt: true,
      _count: { select: { subscriptions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Manage Users</h1>
      <p className="mt-1 text-foreground-secondary">View and manage platform users.</p>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-elevated">
            <tr>
              <th className="px-4 py-3 font-medium text-foreground-muted">Name</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Email</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">
                TradingView ID
              </th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Role</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Subs</th>
              <th className="px-4 py-3 font-medium text-foreground-muted">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-foreground">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-foreground-secondary">{user.email}</td>
                <td className="px-4 py-3 text-foreground-secondary">
                  {user.tradingViewId ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-surface-elevated text-foreground-secondary"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground-secondary">
                  {user._count.subscriptions}
                </td>
                <td className="px-4 py-3 text-foreground-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

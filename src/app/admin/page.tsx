import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/dashboard-stats";

export default async function AdminDashboardPage() {
  const [userCount, toolCount, subscriptionCount, activeSubscriptionCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.tool.count(),
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { endDate: { gte: new Date() } },
      }),
    ]);

  const stats = [
    { label: "Total Users", value: userCount },
    { label: "Total Tools", value: toolCount },
    { label: "Total Subscriptions", value: subscriptionCount },
    { label: "Active Subscriptions", value: activeSubscriptionCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-gray-600">Platform overview and statistics.</p>
      <div className="mt-6">
        <DashboardStats stats={stats} />
      </div>
    </div>
  );
}

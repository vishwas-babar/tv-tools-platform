import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard-stats";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [subscriptionCount, activeSubscriptionCount] = await Promise.all([
    prisma.subscription.count({ where: { userId: session.user.id } }),
    prisma.subscription.count({
      where: {
        userId: session.user.id,
        endDate: { gte: new Date() },
      },
    }),
  ]);

  const stats = [
    { label: "Total Subscriptions", value: subscriptionCount },
    { label: "Active Subscriptions", value: activeSubscriptionCount },
    { label: "Account Type", value: session.user.role },
    { label: "Member Since", value: "Recently" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-gray-600">
        Welcome back, {session.user.name ?? "User"}!
      </p>
      <div className="mt-6">
        <DashboardStats stats={stats} />
      </div>
    </div>
  );
}

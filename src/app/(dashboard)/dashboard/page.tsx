import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardStats, QuickActions } from "@/components/dashboard-stats";
import { RecentSubscriptions } from "@/components/recent-subscriptions";
import { paidSubscriptionWhere } from "@/lib/subscriptions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const paidWhere = paidSubscriptionWhere(session.user.id);

  const [subscriptionCount, activeSubscriptionCount, pendingAccessCount, recentSubs] =
    await Promise.all([
      prisma.subscription.count({ where: paidWhere }),
      prisma.subscription.count({
        where: {
          ...paidWhere,
          status: "ACTIVE",
          endDate: { gt: new Date() },
        },
      }),
      prisma.subscription.count({
        where: {
          ...paidWhere,
          status: "PENDING_ACCESS",
        },
      }),
      prisma.subscription.findMany({
        where: paidWhere,
        include: {
          tool: { select: { name: true, slug: true } },
          plan: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    {
      label: "Total Subscriptions",
      value: subscriptionCount,
      accent: "bg-primary/15 text-primary-light",
      icon: <StatIcon path="M2.25 18 9 11.25 4.5 6.75m0 0L2.25 18m2.25-11.25L9 11.25m0 0 13.5 6.75M9 11.25l-4.5-4.5M9 11.25l4.5 4.5" />,
    },
    {
      label: "Active",
      value: activeSubscriptionCount,
      accent: "bg-success/15 text-success",
      icon: <StatIcon path="m4.5 12.75 6 6 9-13.5" />,
    },
    {
      label: "Pending Activation",
      value: pendingAccessCount,
      accent: "bg-warning/15 text-warning",
      icon: <StatIcon path="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    },
    {
      label: "Account Type",
      value: session.user.role,
      accent: "bg-accent-purple/15 text-accent-purple",
      icon: <StatIcon path="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-foreground-secondary">
          Welcome back,{" "}
          <span className="font-medium text-foreground">
            {session.user.name ?? "User"}
          </span>
          !
        </p>
      </div>

      <DashboardStats stats={stats} />
      <QuickActions hasSubscriptions={subscriptionCount > 0} />
      <RecentSubscriptions subscriptions={recentSubs} />
    </div>
  );
}

function StatIcon({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

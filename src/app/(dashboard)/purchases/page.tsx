import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PurchasesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      tool: { select: { name: true, slug: true } },
      plan: { select: { durationDays: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
      <p className="mt-1 text-gray-600">Your subscription history.</p>

      {subscriptions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            You don&apos;t have any subscriptions yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Tool</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Duration
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Start Date
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  End Date
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((sub) => {
                const isActive = new Date(sub.endDate) >= new Date();
                return (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {sub.tool.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.plan.durationDays} days
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      ${sub.plan.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {isActive ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          Expired
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

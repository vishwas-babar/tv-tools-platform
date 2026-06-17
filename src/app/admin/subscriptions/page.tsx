import { prisma } from "@/lib/prisma";

export default async function AdminSubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: { select: { name: true, email: true } },
      tool: { select: { name: true } },
      plan: { select: { durationDays: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Manage Subscriptions
      </h1>
      <p className="mt-1 text-gray-600">View all platform subscriptions.</p>

      {subscriptions.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">
          No subscriptions found.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">User</th>
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
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {sub.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sub.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.tool.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {sub.plan.durationDays} days
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      ₹{sub.plan.price.toFixed(2)}
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

import { prisma } from "@/lib/prisma";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Manage Coupons</h1>
      <p className="mt-1 text-foreground-secondary">
        Create and manage discount coupons.
      </p>

      {coupons.length === 0 ? (
        <p className="mt-8 text-center text-foreground-muted">No coupons created yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 font-medium text-foreground-muted">Code</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Type</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Value</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Status</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {coupon.discountType}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.active ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-foreground-muted">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {new Date(coupon.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

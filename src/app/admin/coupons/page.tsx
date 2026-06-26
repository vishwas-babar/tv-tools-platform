"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/axios";
import { getFieldError, validateForm, type FieldErrors } from "@/lib/validation";
import { couponSchema } from "@/validations/coupon";
import { FormFieldError } from "@/components/form-field-error";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  active: boolean;
  usedAt: string | null;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Coupon[] }>("/coupons")
      .then(({ data }) => setCoupons(data.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const data = {
      code: (form.elements.namedItem("code") as HTMLInputElement).value,
      discountType: (form.elements.namedItem("discountType") as HTMLSelectElement)
        .value,
      discountValue: Number(
        (form.elements.namedItem("discountValue") as HTMLInputElement).value,
      ),
      active: (form.elements.namedItem("active") as HTMLInputElement).checked,
    };

    const validation = validateForm(couponSchema, {
      ...data,
      code: data.code.trim(),
      discountType: data.discountType as "PERCENTAGE" | "FIXED",
    });
    if (!validation.success) {
      setFormError(validation.error);
      setFieldErrors(validation.details);
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        const { data: res } = await api.patch<{ success: boolean; data: Coupon }>(
          `/coupons/${editingId}`,
          validation.data,
        );
        setCoupons((prev) =>
          prev.map((coupon) => (coupon.id === editingId ? res.data : coupon)),
        );
        setEditingId(null);
      } else {
        const { data: res } = await api.post<{ success: boolean; data: Coupon }>(
          "/coupons",
          validation.data,
        );
        setCoupons((prev) => [res.data, ...prev]);
      }
      form.reset();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message);
        if (err.details) setFieldErrors(err.details);
      } else {
        setFormError(err instanceof Error ? err.message : "Failed to save coupon");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditClick(coupon: Coupon) {
    setEditingId(coupon.id);
    const form = document.getElementById("coupon-form") as HTMLFormElement;
    if (form) {
      (form.elements.namedItem("code") as HTMLInputElement).value = coupon.code;
      (form.elements.namedItem("discountType") as HTMLSelectElement).value =
        coupon.discountType;
      (form.elements.namedItem("discountValue") as HTMLInputElement).value =
        String(coupon.discountValue);
      (form.elements.namedItem("active") as HTMLInputElement).checked =
        coupon.active;
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormError(null);
    setFieldErrors({});
    const form = document.getElementById("coupon-form") as HTMLFormElement;
    if (form) form.reset();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this coupon?")) return;
    setDeletingId(id);
    api
      .delete(`/coupons/${id}`)
      .then(() => setCoupons((prev) => prev.filter((coupon) => coupon.id !== id)))
      .catch((err: Error) => alert(err.message))
      .finally(() => setDeletingId(null));
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Coupons</h1>
        <p className="mt-1 text-foreground-secondary">
          Create and manage discount coupons for checkout.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading && <p className="text-foreground-muted">Loading coupons...</p>}
          {error && <p className="text-danger">{error}</p>}

          {!loading && !error && coupons.length === 0 && (
            <p className="text-foreground-muted">No coupons created yet.</p>
          )}

          {!loading && !error && coupons.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-elevated">
                  <tr>
                    <th className="px-4 py-3 font-medium text-foreground-muted">
                      Code
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground-muted">
                      Type
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground-muted">
                      Value
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className={editingId === coupon.id ? "bg-primary/10" : ""}
                    >
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
                        {coupon.usedAt ? (
                          <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-foreground-muted">
                            Used
                          </span>
                        ) : coupon.active ? (
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-foreground-muted">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditClick(coupon)}
                            className="text-sm text-primary-light hover:text-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={deletingId === coupon.id}
                            className="text-sm text-danger hover:text-danger/80 disabled:opacity-50"
                          >
                            {deletingId === coupon.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {editingId ? "Edit Coupon" : "Create New Coupon"}
            </h2>

            {formError && (
              <div className="mt-4 rounded border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {formError}
              </div>
            )}

            <form id="coupon-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-foreground-secondary"
                >
                  Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="e.g. SAVE10"
                  className="mt-1 w-full rounded border border-border-subtle px-3 py-2 text-sm uppercase focus:border-primary focus:outline-none"
                />
                <FormFieldError message={getFieldError(fieldErrors, "code")} />
              </div>

              <div>
                <label
                  htmlFor="discountType"
                  className="block text-sm font-medium text-foreground-secondary"
                >
                  Discount Type
                </label>
                <select
                  id="discountType"
                  name="discountType"
                  className="mt-1 w-full rounded border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed amount (₹)</option>
                </select>
                <FormFieldError message={getFieldError(fieldErrors, "discountType")} />
              </div>

              <div>
                <label
                  htmlFor="discountValue"
                  className="block text-sm font-medium text-foreground-secondary"
                >
                  Discount Value
                </label>
                <input
                  id="discountValue"
                  name="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 10"
                  className="mt-1 w-full rounded border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <FormFieldError message={getFieldError(fieldErrors, "discountValue")} />
              </div>

              <label className="flex items-center gap-2 text-sm text-foreground-secondary">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  defaultChecked
                  className="rounded border-border-subtle"
                />
                Active
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingId
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

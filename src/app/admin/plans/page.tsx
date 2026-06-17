"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/axios";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Plan[] }>("/plans")
      .then(({ data }) => setPlans(data.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      durationDays: Number((form.elements.namedItem("durationDays") as HTMLInputElement).value),
      price: Number((form.elements.namedItem("price") as HTMLInputElement).value),
    };

    try {
      if (editingId) {
        // Update existing plan
        const { data: res } = await api.patch<{ success: boolean; data: Plan }>(`/plans/${editingId}`, data);
        setPlans((prev) => prev.map((p) => (p.id === editingId ? res.data : p)).sort((a, b) => a.durationDays - b.durationDays));
        setEditingId(null);
      } else {
        // Create new plan
        const { data: res } = await api.post<{ success: boolean; data: Plan }>("/plans", data);
        setPlans((prev) => [...prev, res.data].sort((a, b) => a.durationDays - b.durationDays));
      }
      form.reset();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditClick(plan: Plan) {
    setEditingId(plan.id);
    const form = document.getElementById("plan-form") as HTMLFormElement;
    if (form) {
      (form.elements.namedItem("name") as HTMLInputElement).value = plan.name;
      (form.elements.namedItem("durationDays") as HTMLInputElement).value = String(plan.durationDays);
      (form.elements.namedItem("price") as HTMLInputElement).value = String(plan.price);
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormError(null);
    const form = document.getElementById("plan-form") as HTMLFormElement;
    if (form) form.reset();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this global plan? It will be removed from all tools using it.")) return;
    setDeletingId(id);
    api
      .delete(`/plans/${id}`)
      .then(() => setPlans((prev) => prev.filter((p) => p.id !== id)))
      .catch((err: Error) => alert(err.message))
      .finally(() => setDeletingId(null));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Global Plans</h1>
          <p className="mt-1 text-gray-600">Create reusable plans that can be assigned to multiple tools.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: List of Plans */}
        <div className="lg:col-span-2">
          {loading && <p className="text-gray-500">Loading plans...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && plans.length === 0 && (
            <p className="text-gray-500">No global plans created yet.</p>
          )}

          {!loading && !error && plans.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Duration (Days)</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Price (₹)</th>
                    <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.map((plan) => (
                    <tr key={plan.id} className={editingId === plan.id ? "bg-blue-50" : ""}>
                      <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                      <td className="px-4 py-3 text-gray-600">{plan.durationDays}</td>
                      <td className="px-4 py-3 text-gray-600">₹{plan.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditClick(plan)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            disabled={deletingId === plan.id}
                            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {deletingId === plan.id ? "Deleting..." : "Delete"}
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

        {/* Right Column: Add/Edit Form */}
        <div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Plan" : "Create New Plan"}
            </h2>

            {formError && (
              <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form id="plan-form" onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Plan Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Monthly Standard"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700">
                  Duration (Days)
                </label>
                <input
                  id="durationDays"
                  name="durationDays"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 30"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="e.g. 29.99"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Update Plan" : "Create Plan"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

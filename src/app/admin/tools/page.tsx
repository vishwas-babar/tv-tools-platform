"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";

interface Tool {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count?: { plans: number; subscriptions: number };
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    setLoading(true);
    api
      .get<{ success: boolean; data: Tool[] }>("/tools/admin")
      .then(({ data }) => setTools(data.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    setDeletingId(id);
    api
      .delete(`/tools/${id}`)
      .then(() => setTools((prev) => prev.filter((t) => t.id !== id)))
      .catch((err: Error) => alert(err.message))
      .finally(() => setDeletingId(null));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Tools</h1>
          <p className="mt-1 text-foreground-secondary">Create and manage trading tools.</p>
        </div>
        <Link
          href="/admin/tools/new"
          className="rounded bg-primary px-4 py-2 text-sm text-foreground hover:bg-primary-hover"
        >
          Add Tool
        </Link>
      </div>

      {loading && (
        <p className="mt-8 text-center text-foreground-muted">Loading tools...</p>
      )}

      {error && <p className="mt-8 text-center text-danger">{error}</p>}

      {!loading && !error && tools.length === 0 && (
        <p className="mt-8 text-center text-foreground-muted">No tools created yet.</p>
      )}

      {!loading && !error && tools.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated">
              <tr>
                <th className="px-4 py-3 font-medium text-foreground-muted">Name</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Slug</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Status</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Plans</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Subs</th>
                <th className="px-4 py-3 font-medium text-foreground-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tools.map((tool) => (
                <tr key={tool.id}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {tool.name}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">{tool.slug}</td>
                  <td className="px-4 py-3">
                    {tool.isActive ? (
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
                    {tool._count?.plans ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground-secondary">
                    {tool._count?.subscriptions ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/tools/${tool.id}/edit`}
                        className="text-sm text-primary-light hover:text-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        disabled={deletingId === tool.id}
                        className="text-sm text-danger hover:text-danger/80 disabled:opacity-50"
                      >
                        {deletingId === tool.id ? "Deleting..." : "Delete"}
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
  );
}

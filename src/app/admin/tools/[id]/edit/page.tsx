"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { ImageUpload } from "@/components/image-upload";

interface Plan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  youtubeUrl: string | null;
  isActive: boolean;
  plans: Plan[];
}

export default function EditToolPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [tool, setTool] = useState<Tool | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loadingTool, setLoadingTool] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Plan state
  const [globalPlans, setGlobalPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Fetch tool and global plans
    Promise.all([
      api.get<{ success: boolean; data: Tool }>(`/tools/${id}`),
      api.get<{ success: boolean; data: Plan[] }>("/plans")
    ])
      .then(([toolRes, plansRes]) => {
        setTool(toolRes.data.data);
        setImageUrl(toolRes.data.data.imageUrl ?? "");
        setGlobalPlans(plansRes.data.data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => {
        setLoadingTool(false);
        setLoadingPlans(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      slug: (form.elements.namedItem("slug") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      imageUrl,
      youtubeUrl: (form.elements.namedItem("youtubeUrl") as HTMLInputElement).value || "",
      isActive: (form.elements.namedItem("isActive") as HTMLInputElement).checked,
      planIds: tool?.plans.map(p => p.id) || [],
    };

    api
      .patch<{ success: boolean }>(`/tools/${id}`, data)
      .then(() => {
        setSuccess(true);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setPending(false));
  }

  function togglePlan(plan: Plan) {
    if (!tool) return;
    const isSelected = tool.plans.some(p => p.id === plan.id);
    if (isSelected) {
      setTool({ ...tool, plans: tool.plans.filter(p => p.id !== plan.id) });
    } else {
      setTool({ ...tool, plans: [...tool.plans, plan] });
    }
  }

  if (loadingTool || loadingPlans) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Tool</h1>
        <p className="mt-4 text-gray-500">Loading tool data...</p>
      </div>
    );
  }

  if (!tool) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Tool</h1>
        <p className="mt-4 text-red-500">{error ?? "Tool not found"}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Edit Tool</h1>
      <p className="mt-1 text-gray-600">Update tool information.</p>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Tool updated successfully! Redirecting...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={tool.name}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={tool.slug}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={tool.description}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Cover image — S3 upload */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cover Image
          </label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>

        {/* YouTube URL */}
        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
            YouTube URL (optional)
          </label>
          <input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            defaultValue={tool.youtubeUrl ?? ""}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked={tool.isActive}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Active
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {pending ? "Updating..." : "Update Tool"}
        </button>
      </form>

      {/* --- Manage Plans Section --- */}
      <div className="mt-10 max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-bold text-gray-900">Assigned Plans</h2>
        <p className="mb-4 mt-1 text-sm text-gray-600">
          Select which global plans are available for this tool. You can manage global plans from the Plans page.
        </p>

        <div className="space-y-3">
          {globalPlans.map((plan) => {
            const isSelected = tool.plans.some(p => p.id === plan.id);
            return (
              <label
                key={plan.id}
                className={`flex cursor-pointer items-center justify-between rounded border p-4 hover:bg-gray-50 ${
                  isSelected ? "border-blue-500 bg-blue-50/50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePlan(plan)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-600">{plan.durationDays} Days for ₹{plan.price.toFixed(2)}</div>
                  </div>
                </div>
              </label>
            );
          })}
          {globalPlans.length === 0 && (
            <p className="text-sm text-gray-500">No global plans found. Go to Admin &gt; Plans to create some.</p>
          )}
        </div>
      </div>
    </div>
  );
}

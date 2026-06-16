"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { ImageUpload } from "@/components/image-upload";

export default function NewToolPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    };

    api
      .post<{ success: boolean }>("/tools", data)
      .then(() => {
        setSuccess(true);
        setTimeout(() => router.push("/admin/tools"), 1000);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setPending(false));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Add New Tool</h1>
      <p className="mt-1 text-gray-600">Create a new trading tool.</p>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Tool created successfully! Redirecting...
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
            placeholder="e.g. my-tool-name"
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
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked
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
          {pending ? "Creating..." : "Create Tool"}
        </button>
      </form>
    </div>
  );
}

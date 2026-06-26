"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/axios";
import { getFieldError, validateForm, type FieldErrors } from "@/lib/validation";
import { toolSchema } from "@/validations/tool";
import { ImageUpload } from "@/components/image-upload";
import { FormFieldError } from "@/components/form-field-error";

export default function NewToolPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      slug: (form.elements.namedItem("slug") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      imageUrl,
      youtubeUrl: (form.elements.namedItem("youtubeUrl") as HTMLInputElement).value || "",
      isActive: (form.elements.namedItem("isActive") as HTMLInputElement).checked,
    };

    const validation = validateForm(toolSchema, data);
    if (!validation.success) {
      setError(validation.error);
      setFieldErrors(validation.details);
      return;
    }

    setPending(true);
    api
      .post<{ success: boolean }>("/tools", validation.data)
      .then(() => {
        setSuccess(true);
        setTimeout(() => router.push("/admin/tools"), 1000);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          setError(err.message);
          if (err.details) setFieldErrors(err.details);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to create tool");
      })
      .finally(() => setPending(false));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Add New Tool</h1>
      <p className="mt-1 text-foreground-secondary">Create a new trading tool.</p>

      {error && (
        <div className="mt-4 rounded border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded border border-success/30 bg-success/10 p-3 text-sm text-success">
          Tool created successfully! Redirecting...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg space-y-4 rounded-lg border border-border bg-surface p-6"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground-secondary">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 w-full rounded border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <FormFieldError message={getFieldError(fieldErrors, "name")} />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground-secondary">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="e.g. my-tool-name"
            className="mt-1 w-full rounded border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <FormFieldError message={getFieldError(fieldErrors, "slug")} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground-secondary">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="mt-1 w-full rounded border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <FormFieldError message={getFieldError(fieldErrors, "description")} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground-secondary">
            Cover Image
          </label>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
          <FormFieldError message={getFieldError(fieldErrors, "imageUrl")} />
        </div>

        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-foreground-secondary">
            YouTube URL (optional)
          </label>
          <input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            className="mt-1 w-full rounded border border-border-subtle px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <FormFieldError message={getFieldError(fieldErrors, "youtubeUrl")} />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-border-subtle"
          />
          <label htmlFor="isActive" className="text-sm text-foreground-secondary">
            Active
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create Tool"}
        </button>
      </form>
    </div>
  );
}

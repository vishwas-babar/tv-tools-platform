"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/axios";
import { PlanCard } from "@/components/plan-card";

interface Plan {
  id: string;
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

/** Convert any YouTube URL to its embed URL */
function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // youtu.be/VIDEO_ID
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }

    // youtube.com/watch?v=VIDEO_ID
    const v = parsed.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;

    // Already an embed URL
    if (parsed.pathname.startsWith("/embed/")) return url;
  } catch {
    // fall through
  }
  return url;
}

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    api
      .get<{ success: boolean; data: Tool }>(`/tools/slug/${slug}`)
      .then(({ data }) => setTool(data.data))
      .catch((err: Error) => {
        if (err.message === "Request failed with status code 404") {
          setNotFoundError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFoundError) notFound();

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-gray-500">Loading tool details...</p>
      </div>
    );
  }

  if (!tool) return null;

  const embedUrl = tool.youtubeUrl ? toEmbedUrl(tool.youtubeUrl) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
        {tool.isActive ? (
          <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700">
            Active
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-500">
            Inactive
          </span>
        )}
      </div>

      {/* ── Thumbnail image ── */}
      {tool.imageUrl && (
        <div className="relative mt-6 h-64 w-full overflow-hidden rounded-xl border border-gray-200">
          <Image
            src={tool.imageUrl}
            alt={`${tool.name} preview`}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {/* ── Description ── */}
      <p className="mt-6 text-base leading-relaxed text-gray-700">
        {tool.description}
      </p>

      {/* ── Embedded YouTube video ── */}
      {embedUrl && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Demo Video</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={embedUrl}
                title={`${tool.name} demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Subscription Plans ── */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">
          Subscription Plans
        </h2>
        {tool.plans.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No plans available for this tool yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {tool.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                durationDays={plan.durationDays}
                price={plan.price}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

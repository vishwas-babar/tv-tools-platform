"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { api } from "@/lib/axios";
import { ToolDetailView, type ToolDetailData } from "@/components/tool-detail/tool-detail-view";
import { ToolDetailSkeleton } from "@/components/tool-detail/tool-detail-skeleton";

export default function ToolDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tool, setTool] = useState<ToolDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    api
      .get<{ success: boolean; data: ToolDetailData }>(`/tools/slug/${slug}`)
      .then(({ data }) => setTool(data.data))
      .catch((err: Error) => {
        if (err.message === "Request failed with status code 404") {
          setNotFoundError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFoundError) notFound();
  if (loading) return <ToolDetailSkeleton />;
  if (!tool) return null;

  return <ToolDetailView tool={tool} />;
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { ToolCard } from "@/components/tool-card";

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Tool[] }>("/tools")
      .then(({ data }) => setTools(data.data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">All Tools</h1>
      <p className="mt-2 text-gray-600">
        Browse our collection of premium TradingView indicators and tools.
      </p>

      {loading && (
        <p className="mt-8 text-center text-gray-500">Loading tools...</p>
      )}

      {error && <p className="mt-8 text-center text-red-500">{error}</p>}

      {!loading && !error && tools.length === 0 && (
        <p className="mt-8 text-center text-gray-500">
          No tools available at the moment.
        </p>
      )}

      {!loading && !error && tools.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              name={tool.name}
              slug={tool.slug}
              description={tool.description}
              imageUrl={tool.imageUrl}
              isActive={tool.isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

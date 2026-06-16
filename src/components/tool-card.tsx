import Image from "next/image";
import Link from "next/link";

interface ToolCardProps {
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
}

export function ToolCard({
  name,
  slug,
  description,
  imageUrl,
  isActive,
}: ToolCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} preview`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {isActive ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              Active
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              Inactive
            </span>
          )}
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{description}</p>

        <Link
          href={`/tools/${slug}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

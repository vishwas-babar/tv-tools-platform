"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";

interface ImageUploadProps {
  /** Current image URL (from DB or a just-uploaded file) */
  value: string;
  /** Called with the final public S3 URL once upload completes */
  onChange: (url: string) => void;
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";
const MAX_MB = 5;

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }

    setUploading(true);

    try {
      // Step 1 — ask the server for a presigned PUT URL
      const { data: presignRes } = await axios.post<{
        success: boolean;
        data: { presignedUrl: string; publicUrl: string; key: string };
      }>("/api/upload/presign", {
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      const { presignedUrl, publicUrl } = presignRes.data;

      // Step 2 — PUT the file directly to S3
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (ev) => {
          if (ev.total) setProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      });

      // Step 3 — bubble the public URL up to the parent form
      onChange(publicUrl);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err)
          ? (err.response?.data?.error ?? err.message)
          : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
      // Reset the file input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {/* Preview */}
      {value ? (
        <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-200">
          <Image
            src={value}
            alt="Tool image preview"
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
        >
          <svg className="mb-2 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Click to upload image</span>
          <span className="text-xs">PNG, JPG, WEBP up to {MAX_MB} MB</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload button (when no image yet) */}
      {!value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? `Uploading… ${progress}%` : "Choose Image"}
        </button>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

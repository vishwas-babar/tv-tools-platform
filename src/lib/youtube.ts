/** Convert any YouTube URL to its embed URL */
export function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }

    const v = parsed.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;

    if (parsed.pathname.startsWith("/embed/")) return url;
  } catch {
    // fall through
  }
  return url;
}

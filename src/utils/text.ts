/**
 * The form responses contain rich-text HTML from a WYSIWYG editor (notes,
 * scope fields, etc). For the preview we want to render that HTML as
 * formatted text (not strip it, unlike the docx export), but we still
 * normalize a few editor artifacts so empty paragraphs don't render as
 * visible gaps.
 */
export function isMeaningfulHtml(value?: string | null): boolean {
  if (!value) return false;
  const textOnly = value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return textOnly.length > 0;
}

export function normalizeRichText(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/<p>(\s|&nbsp;)*<\/p>/gi, "") // drop empty <p> spacer tags
    .trim();
}

export function isPlaceholder(value?: string | null): boolean {
  if (!value) return true;
  const trimmed = value.trim();
  return trimmed === "" || trimmed === "--" || trimmed === "N/A";
}

export function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

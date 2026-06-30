import type { PropsWithChildren } from "react";
import { isMeaningfulHtml, isPlaceholder, normalizeRichText } from "../../utils/text";

interface SectionProps extends PropsWithChildren {
  number: string;
  title: string;
  id: string;
}

export function ReportSection({ number, title, id, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-slate-200 py-10 first:pt-0 last:border-b-0">
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-mono text-sm tabular-nums text-amber-600">{number}</span>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: PropsWithChildren) {
  return <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{children}</h3>;
}

export function SubSubHeading({ children }: PropsWithChildren) {
  return <h4 className="text-sm font-medium text-slate-700">{children}</h4>;
}

interface FieldRowProps {
  label: string;
  value?: string | number | null;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 py-2 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-full shrink-0 text-xs font-medium uppercase tracking-wide text-slate-400 sm:w-48">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">
        {isPlaceholder(value as string) ? <span className="text-slate-400">Not provided</span> : value}
      </dd>
    </div>
  );
}

export function FieldList({ children }: PropsWithChildren) {
  return <dl className="divide-y divide-slate-100">{children}</dl>;
}

/** Renders WYSIWYG HTML from form fields (notes, scope, conclusion, etc). */
export function RichText({ html, fallback }: { html?: string | null; fallback?: string }) {
  if (!isMeaningfulHtml(html)) {
    return fallback ? <p className="text-sm italic text-slate-400">{fallback}</p> : null;
  }
  return (
    <div
      className="prose-report text-sm leading-relaxed text-slate-700"
      dangerouslySetInnerHTML={{ __html: normalizeRichText(html) }}
    />
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-sm italic text-slate-400">{message}</p>;
}

interface ImageCardProps {
  src: string;
  alt: string;
  caption?: string;
}

export function ImageCard({ src, alt, caption }: ImageCardProps) {
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <img src={src} alt={alt} loading="lazy" className="block h-auto w-full object-contain" />
      {caption && (
        <figcaption className="border-t border-slate-200 bg-white px-3 py-2 text-center text-xs text-slate-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function ImageGrid({ children }: PropsWithChildren) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

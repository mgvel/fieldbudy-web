export function ReportPreviewSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-6 py-10">
      <div className="h-3 w-40 rounded bg-slate-200" />
      <div className="h-8 w-3/4 rounded bg-slate-200" />
      <div className="space-y-3 pt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export function ReportPreviewError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3Z" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-slate-900">Couldn't load this report</h2>
      <p className="text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Try again
      </button>
    </div>
  );
}

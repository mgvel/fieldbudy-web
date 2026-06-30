import type { InspectorInfo } from "../../../types/report";

function SignatureLine({ name, title, date }: { name: string; title: string; date: string }) {
  return (
    <div className="space-y-1">
      <div className="h-px w-64 bg-slate-300" />
      <p className="text-sm font-medium text-slate-800">{name}</p>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-xs text-slate-400">Date: {date}</p>
    </div>
  );
}

export function SignaturesSection({ inspectorInfo }: { inspectorInfo: InspectorInfo }) {
  return (
    <section id="signatures" className="scroll-mt-24 py-10">
      <h2 className="mb-6 text-lg font-semibold tracking-tight text-slate-900">Signatures</h2>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prepared By</p>
          <SignatureLine name={inspectorInfo.name} title={inspectorInfo.title} date={inspectorInfo.date} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reviewed By</p>
          <SignatureLine name="Engineering Manager" title="" date="_________________" />
        </div>
      </div>
    </section>
  );
}

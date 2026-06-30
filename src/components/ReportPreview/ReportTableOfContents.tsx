const TOC_ITEMS = [
  { id: "project-information", label: "Project Information" },
  { id: "assignment-information", label: "Assignment Information" },
  { id: "property-information", label: "Property Information" },
  { id: "interviewee-information", label: "Interviewee Information" },
  { id: "structure-information", label: "Structure Information" },
  { id: "document-information", label: "Document Information" },
  { id: "weather-data", label: "Weather Data" },
  { id: "water-data", label: "Water Data" },
  { id: "aerial-imagery", label: "Aerial Imagery" },
  { id: "soil-data", label: "Soil Data" },
  { id: "project-conclusion", label: "Project Conclusion" },
  { id: "inspection-photographs", label: "Inspection Photographs" },
  { id: "signatures", label: "Signatures" },
];

export function ReportTableOfContents() {
  return (
    <nav className="hidden lg:sticky lg:top-24 lg:block lg:h-fit lg:w-56 lg:shrink-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contents</p>
      <ol className="space-y-1 border-l border-slate-200">
        {TOC_ITEMS.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block border-l-2 border-transparent py-1 pl-4 text-sm text-slate-500 transition hover:border-amber-500 hover:text-slate-900"
            >
              <span className="mr-1.5 font-mono text-xs text-slate-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

import type { FormResponses } from "../../../types/report";
import { EmptyState, ReportSection, RichText, SubHeading } from "../primitives";
import { isMeaningfulHtml } from "../../../utils/text";

export function AssignmentInformationSection({ responses }: { responses: FormResponses }) {
  const fields: { key: string; label: string }[] = [
    { key: "assignment-scope", label: "Assignment Scope" },
    { key: "received-scope", label: "Received Scope" },
    { key: "interview-scope", label: "Interview Scope" },
    { key: "standard-scope", label: "Standard Scope" },
  ];

  const hasAny = fields.some((f) => isMeaningfulHtml(responses[f.key] as string));

  return (
    <ReportSection id="assignment-information" number="02" title="Assignment Information">
      {!hasAny && <EmptyState message="No assignment information was provided." />}
      {fields.map(
        (f) =>
          isMeaningfulHtml(responses[f.key] as string) && (
            <div key={f.key} className="space-y-2">
              <SubHeading>{f.label}</SubHeading>
              <RichText html={responses[f.key] as string} />
            </div>
          ),
      )}
    </ReportSection>
  );
}

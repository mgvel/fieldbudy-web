import type { FormResponses } from "../../../types/report";
import { EmptyState, ReportSection, RichText } from "../primitives";
import { isMeaningfulHtml } from "../../../utils/text";

export function ConclusionSection({ responses }: { responses: FormResponses }) {
  const notes = responses["conclusion-notes"] as string | undefined;

  return (
    <ReportSection id="project-conclusion" number="11" title="Project Conclusion">
      {isMeaningfulHtml(notes) ? <RichText html={notes} /> : <EmptyState message="No conclusion was provided." />}
    </ReportSection>
  );
}

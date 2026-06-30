import type { FormResponses, ReportMediaFile } from "../../../types/report";
import { EmptyState, ImageCard, ImageGrid, ReportSection, RichText, SubHeading, SubSubHeading } from "../primitives";
import { isMeaningfulHtml } from "../../../utils/text";

function findDocumentNumbers(responses: FormResponses): number[] {
  const numbers = new Set<number>();
  Object.keys(responses).forEach((key) => {
    const match = key.match(/^document-desc-(\d+)$/);
    if (match) numbers.add(parseInt(match[1], 10));
  });
  return Array.from(numbers).sort((a, b) => a - b);
}

export function DocumentInformationSection({ responses }: { responses: FormResponses }) {
  const documentNumbers = findDocumentNumbers(responses).filter((n) =>
    isMeaningfulHtml(responses[`document-desc-${n}`] as string),
  );

  return (
    <ReportSection id="document-information" number="06" title="Document Information">
      {documentNumbers.length === 0 && <EmptyState message="No supporting documents were provided." />}

      {documentNumbers.map((n) => {
        const notes = responses[`document-notes-${n}`] as string | undefined;
        const images = (responses[`document-images-${n}`] as ReportMediaFile[] | undefined) ?? [];

        return (
          <div key={n} className="space-y-3">
            <SubHeading>Document {n}</SubHeading>
            <div className="space-y-1">
              <SubSubHeading>Description</SubSubHeading>
              <RichText html={responses[`document-desc-${n}`] as string} />
            </div>
            {isMeaningfulHtml(notes) && (
              <div className="space-y-1">
                <SubSubHeading>Notes</SubSubHeading>
                <RichText html={notes} />
              </div>
            )}
            {images.length > 0 && (
              <div className="space-y-1">
                <SubSubHeading>Images</SubSubHeading>
                <ImageGrid>
                  {images.map((file) => (
                    <ImageCard key={file._id} src={file.thumbnail} alt={file.filename} caption={file.filename} />
                  ))}
                </ImageGrid>
              </div>
            )}
          </div>
        );
      })}
    </ReportSection>
  );
}

import type { FormResponses, ReportMediaFile } from "../../../types/report";
import { EmptyState, ImageCard, ImageGrid, ReportSection, RichText, SubHeading } from "../primitives";
import { isMeaningfulHtml } from "../../../utils/text";

export function SoilDataSection({ responses }: { responses: FormResponses }) {
  const notes = responses["soil-notes"] as string | undefined;
  const images = (responses["soil-images"] as ReportMediaFile[] | undefined) ?? [];
  const hasAny = isMeaningfulHtml(notes) || images.length > 0;

  return (
    <ReportSection id="soil-data" number="10" title="Soil Data">
      {!hasAny && <EmptyState message="No soil data was provided." />}
      {isMeaningfulHtml(notes) && (
        <div className="space-y-2">
          <SubHeading>Soil Information</SubHeading>
          <RichText html={notes} />
        </div>
      )}
      {images.length > 0 && (
        <div className="space-y-2">
          <SubHeading>Soil Images</SubHeading>
          <ImageGrid>
            {images.map((file) => (
              <ImageCard key={file._id} src={file.thumbnail} alt={file.filename} caption={file.filename} />
            ))}
          </ImageGrid>
        </div>
      )}
    </ReportSection>
  );
}

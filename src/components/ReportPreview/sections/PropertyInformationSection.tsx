import type { FormResponses, ReportMediaFile } from "../../../types/report";
import { EmptyState, FieldList, FieldRow, ImageCard, ImageGrid, ReportSection, RichText, SubHeading } from "../primitives";
import { isMeaningfulHtml, isPlaceholder } from "../../../utils/text";

function findBuildingNumbers(responses: FormResponses): number[] {
  const numbers = new Set<number>();
  Object.keys(responses).forEach((key) => {
    const match = key.match(/^select-building-(\d+)$/);
    if (match) numbers.add(parseInt(match[1], 10));
  });
  return Array.from(numbers).sort((a, b) => a - b);
}

export function PropertyInformationSection({ responses }: { responses: FormResponses }) {
  const buildingNumbers = findBuildingNumbers(responses).filter(
    (n) => !isPlaceholder(responses[`select-building-${n}`] as string),
  );

  const propertyFiles = (responses["property-file"] as ReportMediaFile[] | undefined) ?? [];
  const propertyNote = responses["property-note"] as string | undefined;
  const topographyNote = responses["note-file"] as string | undefined;

  const isEmpty =
    buildingNumbers.length === 0 &&
    propertyFiles.length === 0 &&
    !isMeaningfulHtml(propertyNote) &&
    !isMeaningfulHtml(topographyNote);

  return (
    <ReportSection id="property-information" number="03" title="Property Information">
      {isEmpty && <EmptyState message="No property information was provided." />}

      {buildingNumbers.map((n) => (
        <div key={n} className="space-y-3">
          <SubHeading>Building {n} Information</SubHeading>
          <FieldList>
            <FieldRow label="Building Type" value={responses[`select-building-${n}`] as string} />
            <FieldRow label="Stories" value={responses[`story-number-${n}`] as string} />
            <FieldRow label="Active Story" value={responses[`active-story-${n}`] as string} />
            <FieldRow label="Construction Type" value={responses[`select-construction-${n}`] as string} />
            <FieldRow label="Foundation Type" value={responses[`select-foundation-${n}`] as string} />
          </FieldList>
        </div>
      ))}

      {isMeaningfulHtml(propertyNote) && (
        <div className="space-y-2">
          <SubHeading>Property Notes</SubHeading>
          <RichText html={propertyNote} />
        </div>
      )}

      {isMeaningfulHtml(topographyNote) && (
        <div className="space-y-2">
          <SubHeading>Topography</SubHeading>
          <RichText html={topographyNote} />
        </div>
      )}

      {propertyFiles.length > 0 && (
        <div className="space-y-3">
          <SubHeading>Property Images</SubHeading>
          <ImageGrid>
            {propertyFiles.map((file) => (
              <ImageCard key={file._id} src={file.thumbnail} alt={file.filename} caption={file.filename} />
            ))}
          </ImageGrid>
        </div>
      )}
    </ReportSection>
  );
}

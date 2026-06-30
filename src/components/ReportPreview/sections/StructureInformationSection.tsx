import type { FormResponses, ReportMediaFile } from "../../../types/report";
import {
  EmptyState,
  FieldList,
  FieldRow,
  ImageCard,
  ImageGrid,
  ReportSection,
  RichText,
  SubHeading,
  SubSubHeading,
} from "../primitives";
import { isMeaningfulHtml, isPlaceholder } from "../../../utils/text";

function findRoomNumbers(responses: FormResponses): number[] {
  const numbers = new Set<number>();
  Object.keys(responses).forEach((key) => {
    const match = key.match(/^interview-room-(\d+)$/);
    if (match) numbers.add(parseInt(match[1], 10));
  });
  return Array.from(numbers).sort((a, b) => a - b);
}

export function StructureInformationSection({ responses }: { responses: FormResponses }) {
  const structureBuilt = responses["interview-structure-built-1"] as string | undefined;
  const roofReplaced = responses["interview-roof-replaced-1"] as string | undefined;
  const interiorDamage = responses["interview-interior-damage-1"] as string | undefined;
  // Exterior notes can be numbered per-building (-1, -2, ...); collect all present.
  const exteriorNoteKeys = Object.keys(responses)
    .filter((key) => /^exterior-notes-\d+$/.test(key))
    .sort();

  const roomNumbers = findRoomNumbers(responses).filter(
    (n) => !isPlaceholder(responses[`interview-room-${n}`] as string),
  );

  const interiorSketchNotes = responses["interior-sketch-notes"] as string | undefined;
  const interiorSketchImages = responses["interior-sketch-images"] as ReportMediaFile[] | undefined;
  const roofSketchNotes = responses["roof-sketch-notes"] as string | undefined;
  const roofSketchImages = responses["roof-sketch-images"] as ReportMediaFile[] | undefined;

  const hasAny =
    !isPlaceholder(structureBuilt) ||
    !isPlaceholder(roofReplaced) ||
    isMeaningfulHtml(interiorDamage) ||
    exteriorNoteKeys.length > 0 ||
    roomNumbers.length > 0 ||
    isMeaningfulHtml(interiorSketchNotes) ||
    (interiorSketchImages?.length ?? 0) > 0 ||
    isMeaningfulHtml(roofSketchNotes) ||
    (roofSketchImages?.length ?? 0) > 0;

  return (
    <ReportSection id="structure-information" number="05" title="Structure Information">
      {!hasAny && <EmptyState message="No structure information was provided." />}

      {(!isPlaceholder(structureBuilt) || !isPlaceholder(roofReplaced)) && (
        <div className="space-y-3">
          <SubHeading>Structure Details</SubHeading>
          {!isPlaceholder(structureBuilt) && (
            <FieldList>
              <FieldRow label="Structure Built" value={structureBuilt} />
            </FieldList>
          )}
          {!isPlaceholder(roofReplaced) && (
            <FieldList>
              <FieldRow label="Roof Replaced" value={roofReplaced} />
            </FieldList>
          )}
        </div>
      )}

      {isMeaningfulHtml(interiorDamage) && (
        <div className="space-y-2">
          <SubHeading>Interior Damage</SubHeading>
          <RichText html={interiorDamage} />
        </div>
      )}

      {exteriorNoteKeys.map((key) => (
        <div key={key} className="space-y-2">
          <SubHeading>Exterior Notes{exteriorNoteKeys.length > 1 ? ` — Building ${key.split("-").pop()}` : ""}</SubHeading>
          <RichText html={responses[key] as string} />
        </div>
      ))}

      {roomNumbers.map((n) => (
        <div key={n} className="space-y-3">
          <SubHeading>Room {n} Damage Information</SubHeading>
          <FieldList>
            <FieldRow label="Room" value={responses[`interview-room-${n}`] as string} />
            <FieldRow
              label="Damage Location"
              value={responses[`section-room-${n}-damage-location-1`] as string}
            />
            <FieldRow label="Attic Access" value={responses[`section-room-${n}-damage-attic-1`] as string} />
          </FieldList>
          {isMeaningfulHtml(responses[`section-room-${n}-damage-notes-1`] as string) && (
            <div className="space-y-1">
              <SubSubHeading>Damage Notes</SubSubHeading>
              <RichText html={responses[`section-room-${n}-damage-notes-1`] as string} />
            </div>
          )}
        </div>
      ))}

      {(isMeaningfulHtml(interiorSketchNotes) || (interiorSketchImages?.length ?? 0) > 0) && (
        <div className="space-y-3">
          <SubHeading>Interior Sketch</SubHeading>
          <RichText html={interiorSketchNotes} />
          {interiorSketchImages && interiorSketchImages.length > 0 && (
            <ImageGrid>
              {interiorSketchImages.map((file) => (
                <ImageCard key={file._id} src={file.thumbnail} alt={file.filename} caption={file.filename} />
              ))}
            </ImageGrid>
          )}
        </div>
      )}

      {(isMeaningfulHtml(roofSketchNotes) || (roofSketchImages?.length ?? 0) > 0) && (
        <div className="space-y-3">
          <SubHeading>Roof Sketch</SubHeading>
          <RichText html={roofSketchNotes} />
          {roofSketchImages && roofSketchImages.length > 0 && (
            <ImageGrid>
              {roofSketchImages.map((file) => (
                <ImageCard key={file._id} src={file.thumbnail} alt={file.filename} caption={file.filename} />
              ))}
            </ImageGrid>
          )}
        </div>
      )}
    </ReportSection>
  );
}

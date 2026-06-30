import type { FormResponses, ReportMediaFile } from "../../../types/report";
import { EmptyState, ImageCard, ImageGrid, ReportSection, RichText, SubHeading } from "../primitives";
import { isMeaningfulHtml } from "../../../utils/text";

export interface NotesImageField {
  label: string;
  notesKey: string;
  imagesKey: string;
}

export function NotesAndImagesSection({
  id,
  number,
  title,
  responses,
  fields,
  emptyMessage,
}: {
  id: string;
  number: string;
  title: string;
  responses: FormResponses;
  fields: NotesImageField[];
  emptyMessage: string;
}) {
  const populated = fields.filter((f) => {
    const notes = responses[f.notesKey] as string | undefined;
    const images = responses[f.imagesKey] as ReportMediaFile[] | undefined;
    return isMeaningfulHtml(notes) || (images && images.length > 0);
  });

  return (
    <ReportSection id={id} number={number} title={title}>
      {populated.length === 0 && <EmptyState message={emptyMessage} />}
      {populated.map((f) => {
        const notes = responses[f.notesKey] as string | undefined;
        const images = (responses[f.imagesKey] as ReportMediaFile[] | undefined) ?? [];
        return (
          <div key={f.notesKey} className="space-y-3">
            <SubHeading>{f.label}</SubHeading>
            <RichText html={notes} />
            {images.length > 0 && (
              <ImageGrid>
                {images.map((file) => (
                  <ImageCard key={file._id} src={file.thumbnail} alt={file.filename} caption={file.filename} />
                ))}
              </ImageGrid>
            )}
          </div>
        );
      })}
    </ReportSection>
  );
}

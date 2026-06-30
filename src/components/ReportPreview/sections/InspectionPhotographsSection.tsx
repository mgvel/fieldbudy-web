import type { ReportMediaFile } from "../../../types/report";
import { EmptyState, ImageCard, ImageGrid, ReportSection, SubHeading } from "../primitives";

function groupByFolder(photographs: ReportMediaFile[]): Record<string, ReportMediaFile[]> {
  const groups: Record<string, ReportMediaFile[]> = {};

  photographs.forEach((photo) => {
    let folderName = photo.folderName;

    if (!folderName && photo.filename) {
      const nameWithoutExt = photo.filename.replace(/\.[^/.]+$/, "");
      folderName = nameWithoutExt
        .replace(/-\d+$/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
    }

    if (!folderName) folderName = "Uncategorized";

    groups[folderName] = groups[folderName] ?? [];
    groups[folderName].push(photo);
  });

  Object.values(groups).forEach((photos) => {
    photos.sort((a, b) => {
      if (a.sequenceOrder !== undefined && b.sequenceOrder !== undefined) {
        return a.sequenceOrder - b.sequenceOrder;
      }
      return (a.filename || "").localeCompare(b.filename || "");
    });
  });

  return groups;
}

export function InspectionPhotographsSection({ photographs }: { photographs: ReportMediaFile[] }) {
  const grouped = groupByFolder(photographs);
  const folderNames = Object.keys(grouped).sort();

  return (
    <ReportSection id="inspection-photographs" number="12" title="Inspection Photographs">
      <p className="text-sm text-slate-600">The following photographs document the inspection findings.</p>

      {folderNames.length === 0 && <EmptyState message="No inspection photographs were included in this report." />}

      {folderNames.map((folderName) => {
        const photos = grouped[folderName];
        return (
          <div key={folderName} className="space-y-3">
            <div className="flex items-baseline justify-between">
              <SubHeading>{folderName}</SubHeading>
              <span className="text-xs text-slate-400">
                {photos.length} image{photos.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ImageGrid>
              {photos.map((photo) => (
                <ImageCard
                  key={photo._id}
                  src={photo.thumbnail}
                  alt={photo.filename}
                  caption={photo.caption || photo.filename}
                />
              ))}
            </ImageGrid>
          </div>
        );
      })}
    </ReportSection>
  );
}

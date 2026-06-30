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

function findIntervieweeNumbers(responses: FormResponses): number[] {
  const numbers = new Set<number>();
  Object.keys(responses).forEach((key) => {
    const match = key.match(/^interviewee-firstname-(\d+)$/);
    if (match) numbers.add(parseInt(match[1], 10));
  });
  return Array.from(numbers).sort((a, b) => a - b);
}

function MediaGroup({ title, files }: { title: string; files?: ReportMediaFile[] }) {
  if (!files || files.length === 0) return null;
  return (
    <div className="space-y-2">
      <SubSubHeading>{title}</SubSubHeading>
      <ImageGrid>
        {files.map((file) => (
          <ImageCard key={file._id} src={file.thumbnail} alt={file.filename} caption={file.filename} />
        ))}
      </ImageGrid>
    </div>
  );
}

export function IntervieweeInformationSection({ responses }: { responses: FormResponses }) {
  const intervieweeNumbers = findIntervieweeNumbers(responses).filter(
    (n) => !isPlaceholder(responses[`interviewee-firstname-${n}`] as string),
  );

  const propertyPurchase = responses["property-purchase"] as string | undefined;
  const dateOfLoss = responses["dol"] as string | undefined;

  const isEmpty =
    intervieweeNumbers.length === 0 && isPlaceholder(propertyPurchase) && isPlaceholder(dateOfLoss);

  return (
    <ReportSection id="interviewee-information" number="04" title="Interviewee Information">
      {isEmpty && <EmptyState message="No interviewee information was provided." />}

      {intervieweeNumbers.map((n) => {
        const fullName = [
          responses[`interviewee-salutation-${n}`],
          responses[`interviewee-firstname-${n}`],
          responses[`interviewee-lastname-${n}`],
        ]
          .filter((part) => part && !isPlaceholder(part as string))
          .join(" ");

        return (
          <div key={n} className="space-y-3">
            <SubHeading>Interviewee {n}</SubHeading>
            <FieldList>
              <FieldRow label="Name" value={fullName || (responses[`interviewee-firstname-${n}`] as string)} />
              <FieldRow label="Title" value={responses[`interviewee-title-${n}`] as string} />
              <FieldRow label="Company" value={responses[`interviewee-company-${n}`] as string} />
              <FieldRow label="Contact Method" value={responses[`interviewee-contact-${n}`] as string} />
              <FieldRow label="Significance" value={responses[`interviewee-significance-${n}`] as string} />
            </FieldList>

            <MediaGroup
              title="Business Card (Front)"
              files={responses[`interviewee-business-front-${n}`] as ReportMediaFile[]}
            />
            <MediaGroup
              title="Business Card (Back)"
              files={responses[`interviewee-business-back-${n}`] as ReportMediaFile[]}
            />
            <MediaGroup title="Interview Documents" files={responses[`interviewee-docs-${n}`] as ReportMediaFile[]} />
          </div>
        );
      })}

      {!isPlaceholder(propertyPurchase) && (
        <div className="space-y-2">
          <SubHeading>Property Purchase Information</SubHeading>
          {isMeaningfulHtml(propertyPurchase) ? (
            <RichText html={propertyPurchase} />
          ) : (
            <p className="text-sm text-slate-700">{propertyPurchase}</p>
          )}
        </div>
      )}

      {!isPlaceholder(dateOfLoss) && (
        <div className="space-y-2">
          <SubHeading>Date of Loss Information</SubHeading>
          <p className="text-sm text-slate-700">{dateOfLoss}</p>
        </div>
      )}
    </ReportSection>
  );
}

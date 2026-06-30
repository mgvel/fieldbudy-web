import type { ProjectInfo } from "../../../types/report";
import { FieldList, FieldRow, ReportSection } from "../primitives";
import { formatDate } from "../../../utils/text";

export function ProjectInformationSection({ projectInfo }: { projectInfo: ProjectInfo }) {
  return (
    <ReportSection id="project-information" number="01" title="Project Information">
      <FieldList>
        <FieldRow label="Project Number" value={projectInfo.projectNumber} />
        <FieldRow label="Project Name" value={projectInfo.projectName} />
        <FieldRow label="Client Name" value={projectInfo.clientName} />
        <FieldRow label="Property Address" value={projectInfo.lossLocationStreetAddress} />
        <FieldRow label="Date of Loss" value={formatDate(projectInfo.dateOfLoss)} />
        <FieldRow label="Claim Number" value={projectInfo.claimNumber} />
        <FieldRow label="Policy Number" value={projectInfo.policyNumber} />
        <FieldRow label="Insurer" value={projectInfo.insurer} />
        <FieldRow label="Insurer Contact" value={projectInfo.insurerContactName} />
        <FieldRow label="Scope of Service" value={projectInfo.scopeOfService} />
      </FieldList>
    </ReportSection>
  );
}

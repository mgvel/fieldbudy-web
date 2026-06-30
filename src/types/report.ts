export interface ReportMediaFile {
  _id: string;
  slug: string;
  url: string;
  thumbnail: string;
  filename: string;
  caption?: string;
  sequenceOrder?: number;
  folderName?: string;
  includedInReport?: boolean;
}

export interface ProjectInfo {
  _id: string;
  slug: string;
  projectName: string;
  projectNumber: string;
  policyNumber: string;
  accountName: string;
  projectType: string;
  clientName: string;
  claimNumber: string;
  clientProjectNumber: string;
  dateOfLoss: string;
  lossLocationStreetAddress: string;
  insurer: string;
  insurerContactName: string;
  status: string;
  scopeOfService: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Form responses are a flat, dynamically-keyed bag — values can be plain
// strings, rich-text HTML strings, or arrays of ReportMediaFile.
export type FormResponses = Record<string, string | ReportMediaFile[] | undefined>;

export interface FormInfo {
  responses: FormResponses;
  updatedAt: string;
}

export interface InspectorInfo {
  name: string;
  title: string;
  date: string;
}

export interface InspectionPhotographs {
  includedMedia: ReportMediaFile[];
}

export interface VersionInfo {
  currentVersion: string;
}

export interface ReportPreviewPayload {
  projectInfo: ProjectInfo;
  formInfo: FormInfo;
  inspectorInfo: InspectorInfo;
  inspectionPhotographs: InspectionPhotographs;
  versionInfo: VersionInfo;
}

export interface ReportPreviewResponse {
  status: string;
  statusCode: number;
  message: string;
  payload: ReportPreviewPayload;
}

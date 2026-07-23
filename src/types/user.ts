export enum UserRole {
  ProjectCoordinator = "Project Coordinator",
  FieldEngineer = "Project Manager",
  EngineeringManager = "Peer Reviewer",
  ReportApproverPeerReviewer="Report Approver & Peer Reviewer",
  TechnicalWriter = "Staff Engineer",
  OperationsManager = "Operations Manager",
  QualityReviewer = "Quality Reviewer",
  ReportApprover = "Report Approver",
  ExternalFieldEngineer = "External Field Engineer",
  BusinessDevelopmentManager = "Business Development Manager",
  NexusEngineers = "Nexus Engineers",
  NexusEngineeringManager = "Nexus Engineering Manager",
  TechnicalWriterQualityReviewer = "Staff Engineer & Quality Reviewer",
}

export const normalizeUserRole = (
  role?: string | UserRole | null
): UserRole | string => {
  if (!role) return "";

  const aliases: Record<string, UserRole> = {
    "Field Engineer": UserRole.FieldEngineer,
    "Engineering Manager": UserRole.EngineeringManager,
    "ReportApproverPeerReviewer":UserRole.ReportApproverPeerReviewer,
    "Technical Writer": UserRole.TechnicalWriter,
    "Quality Reviewer": UserRole.QualityReviewer,
    "Technical Writer & Quality Reviewer": UserRole.TechnicalWriterQualityReviewer,
  };

  return aliases[role] ?? role;
};

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole | string;
  username: string;
  picture: string;
  activationDate: string;
  isDummyPassword:string;
}



export interface AuthResponse {
  status: string;
  statusCode: number;
  message: string;
  payload: {
    token: string;
    user: User;
  };
}
export enum UserRole {
  ProjectCoordinator = "Project Coordinator",
  FieldEngineer = "Field Engineer",
  EngineeringManager = "Engineering Manager",
  TechnicalWriter = "Technical Writer",
  OperationsManager = "Operations Manager",
  QualityReviewer = "Quality Reviewer",
  ReportApprover = "Report Approver",
  ExternalFieldEngineer = "External Field Engineer",
  BusinessDevelopmentManager = "Business Development Manager",
  NexusEngineers = "Nexus Engineers",
  NexusEngineeringManager = "Nexus Engineering Manager",
  TechnicalWriterQualityReviewer="Technical Writer & Quality Reviewer"
}

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
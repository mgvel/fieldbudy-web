export interface User {
    _id: string;
    username: string;
    fullName: string;
    role: string;
  }
  
  export interface Project {
    _id: string;
    id: string;
    projectName: string;
    projectNumber: string;
    projectType: string;
    claimNumber: string;
    status: string;
    clientProjectNumber: string;
    dateOfLoss: string;
    lossLocationStreetAddress: string;
    accountName: string;
    ownerName: string;
    insurer: string;
    insurerContactName: string;
    scopeOfService: string;
    description: string;
    projectFolderWorkdrive: string;
    form: { slug: string };
    fe?: User;
    qr?: User;
    em?: User;
    tw?: User;
    visitedStatus?: string[];
    damageCounts?: number[];
  }
  
  export interface FormFields {
    id: string;
    title: string;
    fieldType: 'text' | 'dropdown' | 'images' | 'file' | 'input' | 'number';
    folder?: string;
    options?: string[];
    hint?: string;
    instructions?: string;
    value?: string;
  }
  
  export interface FormSection {
    id: string;
    title: string;
    fields: FormField[];
    isDuplicable?: boolean;
    color?: string;
  }
  
  export interface FormPage {
    id: string;
    title: string;
    color?: string;
    section: FormSection[];
  }
  
  export interface UploadedFile {
    _id: string;
    slug?: string;
    url: string;
    thumbnail?: string;
    workdriveId?: string;
    filename: string;
    size?: number;
    localPath?: string;
    includedInReport?: boolean;
    type?: string;
    mimeType?: string;
    originalName?: string;
  }
  
  export interface Comment {
    _id: string;
    content: string;
    author: string;
    authorName: string;
    timestamp: string;
    tags?: Array<{ userId: string; username: string }>;
    attachments?: UploadedFile[];
    deliveredTo?: string[];
    readBy?: string[];
  }
  
  export interface FormCounts {
    intervieweeCount: number;
    documentCount: number;
    structureCount: number;
    roomCount: number;
    damageCounts: number[];
  }
  
  export interface FormDataType {
    _id: string;
    slug: string;
    responses: Record<string, any>;
    updatedAt: string;
    counts: FormCounts;
  }
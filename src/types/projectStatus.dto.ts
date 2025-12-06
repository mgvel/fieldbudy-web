// ✅ Correct enum syntax
export enum ProjectStatus {
    IDPNotStarted = 'IDP Not Started',
    IDPInProgressByFE = 'IDP In Progress - By FE',
    IDPCompletedByFE = 'IDP Completed - By FE',
    IDPRejectedByEM = 'IDP Rejected - By EM',
    IDPApprovedByEM = 'IDP Approved - By EM',
  
    ReportNotStarted = '_',
    DraftReportInProgress = 'Draft Report In Progress - By TW',
    DraftReportScheduledForReview = 'Draft Report Scheduled for OR Review',
    DraftReportSubmitted = 'Draft Report Submitted - By TW',
  
    DraftReviewInProgressByEM = 'Draft Review In Progress - By EM',
  
    DraftReportRejectedByFE = 'Draft Report Rejected - By FE',
    DraftReportApprovedByFE = 'Draft Report Approved - By FE',
    DraftReportRejectedByQR = 'Draft Report Rejected - By QR',
    DraftReportApprovedByQR = 'Draft Report Approved - By QR',
    DraftReportRejectedByEM = 'Draft Report Rejected - By EM',
    DraftReportApprovedByEM = 'Draft Report Approved - By EM',

    ReportApprovedByRA = 'RA Approved Review',
    ReportRejectedByRA = 'RA Rejected Review',
  
    ReceivedUsefulComments = 'Useful Comments by FE/TW',
    CommentsReviewed = 'Client Comments Received',
  
    GenerateFinalReport = 'Generate Final Report',
    ReportFinalized = 'Sign & Save the Report',
  }
  
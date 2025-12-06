import React, { useEffect, useState } from "react";
import {
  DownloadCloudIcon,
  Images,
  CloudSun,
  Verified,
  ShieldCheck,
  ImageOff,
} from "lucide-react";
import { Project } from "../../../types/type";
import { ProjectStatus as P } from "../../../types/projectStatus.dto";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import { Assignment, MoreVert, Schedule } from "@mui/icons-material";
import { format } from "date-fns";
import axiosInstance from "../../../api/axiosInstance";
import SiteInspectionModal from "./SiteInspectionModal";
import { useAuthStore } from "../../../store/authStore";

interface FormHeaderProps {
  project?: Project;
  userRole: string;
  versionName: string;
  lastSaved?: string;
  onDownload: () => void;
  loadingReport:boolean,
  onUpdateStatus: (newStatus: P) => void;
  isSaving: string;
  setVersionModalOpen: () => void;
}

const statusRoleMap: Record<string, Record<string, P[]>> = {
  [P.IDPInProgressByFE]: {
    "Field Engineer": [P.IDPCompletedByFE],
  },
  [P.IDPCompletedByFE]: {
    "Engineering Manager": [P.IDPRejectedByEM, P.IDPApprovedByEM],
  },
  [P.IDPRejectedByEM]: {
    "Field Engineer": [P.IDPInProgressByFE],
  },
  [P.IDPApprovedByEM]: {
    "Technical Writer": [P.DraftReportInProgress],
  },
  [P.DraftReportInProgress]: {
    "Technical Writer": [P.DraftReportSubmitted],
  },
  [P.DraftReportSubmitted]: {
    "Quality Reviewer": [P.DraftReportRejectedByQR, P.DraftReportApprovedByQR],
  },
  [P.DraftReportRejectedByQR]: {
    "Technical Writer": [P.DraftReportInProgress],
  },
  [P.DraftReportApprovedByQR]: {
    "Engineering Manager": [
      P.DraftReportRejectedByEM,
      P.DraftReportApprovedByEM,
    ],
  },
  [P.DraftReportRejectedByEM]: {
    "Technical Writer": [P.DraftReportInProgress],
    "Engineering Manager": [
      P.DraftReportRejectedByEM,
      P.DraftReportApprovedByEM,
    ],
  },
  [P.DraftReportApprovedByEM]: {
    "Field Engineer": [P.DraftReportRejectedByFE, P.DraftReportApprovedByFE],
  },
  [P.DraftReportRejectedByFE]: {
    "Technical Writer": [P.DraftReportInProgress],
  },
  [P.DraftReportApprovedByFE]: {
    "Report Approver": [P.ReportApprovedByRA, P.ReportRejectedByRA],
  },

  // [P.DraftReportApprovedByFE]: {
  //   "Project Coordinator": [P.CommentsReviewed],
  // },
  // [P.CommentsReviewed]: {
  //   "Field Engineer": [P.GenerateFinalReport, P.ReportFinalized],
  // },
  // [P.ReportFinalized]: {
  //   "Field Engineer": [P.GenerateFinalReport],
  // },
};

const statusLabelMap: Record<P, string> = {
  [P.IDPCompletedByFE]: "Submit IDP",
  [P.IDPRejectedByEM]: "Reject IDP",
  [P.IDPApprovedByEM]: "Approve IDP",
  [P.DraftReportInProgress]: "Start Draft Report",
  [P.DraftReportSubmitted]: "Submit Draft Report",
  [P.DraftReportRejectedByQR]: "Reject Draft Report",
  [P.DraftReportApprovedByQR]: "Approve Draft Report",
  [P.DraftReportRejectedByEM]: "Reject Draft Report",
  [P.DraftReportApprovedByEM]: "Approve Draft Report",
  [P.DraftReportRejectedByFE]: "Reject Draft Report",
  [P.DraftReportApprovedByFE]: "Approve Draft Report",
  [P.CommentsReviewed]: "Receive Client Comments",
  [P.GenerateFinalReport]: "Generate Final Report",
  [P.ReportFinalized]: "Sign & Save Report",
  [P.IDPInProgressByFE]: "Mark as In Progress",
};

const FormHeader: React.FC<FormHeaderProps> = ({
  project,
  userRole,
  versionName,
  onDownload,
  lastSaved,
  onUpdateStatus,
  isSaving,
  loadingReport,
  setVersionModalOpen,
}) => {
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [loadingStatus, setLoadingStatus] = useState<P | null>(null);
  const [versionMenuAnchor, setVersionMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [siteInspection, setSiteInspection] = useState([]);
  const [mySiteVisit,setMySiteVisit] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [versionBtn, setVersionBtn] = useState(false);
  const { User } = useAuthStore((state) => ({
    User: state.user,
  }));
  const userName = User?.fullName;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleVersionClick = (event: React.MouseEvent<HTMLElement>) => {
    setVersionMenuAnchor(event.currentTarget);
  };

  const handleStatusSelect = async (status: P) => {
    try {
      setLoadingStatus(status);
      await onUpdateStatus(status);
    } finally {
      setLoadingStatus(null);
    }
  };

  const availableStatuses = statusRoleMap[versionName]?.[userRole] || [];

  const isEditing =
    versionName?.includes("In Progress") ||
    versionName?.includes("Not Started");


    const fetchSiteVisit = async () => {
      if (!project?.projectNumber) return;
  
      try {
        const { data } = await axiosInstance.get(
          `/site-visit/${project?.projectNumber}`
        );
  
        const items: any[] = Array.isArray(data?.payload) ? data.payload : [];
        setSiteInspection(items);
  
        const norm = (s?: string) =>
          (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
        const me = norm(userName);
  
        const shouldOpen = items.some((item: any) => {
          const assignedToMe =
            Array.isArray(item?.Field_EngineerReferences) &&
            item.Field_EngineerReferences.some(
              (fe: any) => norm(fe?.display_value) === me
            );

            setMySiteVisit(item)
  
          const completionEmpty = !item?.Site_Viste_Completion?.trim();
  


          return assignedToMe && completionEmpty;
        });
         setVersionBtn(shouldOpen)
        if (shouldOpen) handleOpenModal();
      } catch (err) {
        console.error("Failed to fetch site visit", err);
      }
    };

  useEffect(() => {
    fetchSiteVisit();
  }, [project?.projectNumber, userName]);
  

  return (
    <Paper
      elevation={0}
      sx={{ borderBottom: "1px solid #E5E7EB", p: 2, mb: 2 }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isEditing ? "#10B981" : "#6B7280",
              animation: isEditing ? "pulse 2s infinite" : "none",
            }}
          />
          <Chip
            label={isEditing ? "EDITING" : "VIEWING"}
            size="small"
            color={isEditing ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {versionName} ({project?.projectName})
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {lastSaved && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Schedule sx={{ fontSize: 16, color: "#6B7280" }} />
                <Typography variant="body2" color="text.secondary">
                  Last Saved {lastSaved}
                </Typography>
              </Box>
            )}

            <Button
              size="small"
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => setVersionModalOpen(true)}
              sx={{
                borderColor: "#10B981",
                color: "#10B981",
                "&:hover": {
                  backgroundColor: "#ECFDF5",
                  borderColor: "#059669",
                },
              }}
            >
              View Changes
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {project.projectFolderWorkdrive !==null?(
          <a target="blank" href={`/inspection-photographs/${project?._id}`}>
            <IconButton
              sx={{
                border: "1px solid #3A52BC",
                borderRadius: 1,
                "&:hover": { backgroundColor: "#F8FAFC" },
              }}
              title="Inspection Photographs"
            >
              <Images style={{ color: "#3A52BC" }} />
            </IconButton>
          </a>
          ):(
            <IconButton
            disabled
            sx={{
                border: "1px solid gray",
                borderRadius: 1,
                "&:hover": { backgroundColor: "#eee" },
              }}
              title="WD not found"
            >
              <ImageOff style={{ color: "gray" }} />
            </IconButton>
          )}

          <IconButton
            sx={{
              border: "1px solid #3A52BC",
              borderRadius: 1,
              "&:hover": { backgroundColor: "#F8FAFC" },
            }}
            title="Weather Report"
          >
            <CloudSun style={{ color: "#3A52BC" }} />
          </IconButton>

          <IconButton
            sx={{
              border: "1px solid #3A52BC",
              background: "#1e51db",
              color: "white",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#1e51db",
                borderColor: "#059669",
              },
            }}
            title="Download Report"
          >
           
           {loadingReport?<CircularProgress size={25} color="inherit"/> : <DownloadCloudIcon onClick={onDownload} />}
          </IconButton>

          <Button
            variant="outlined"
            startIcon={<Assignment />}
            onClick={handleVersionClick}
            sx={{ display: { xs: "none", sm: "flex", height: "44px" } }}
          >
            Switch Version
          </Button>

          {!versionBtn &&
            availableStatuses.map((status) => {
              const isReject = status.toLowerCase().includes("reject");
              const loading = loadingStatus === status;
              const label = statusLabelMap[status] ?? status;

              return (
                <Button
                  key={status}
                  onClick={() => handleStatusSelect(status)}
                  disabled={isSaving}
                  startIcon={
                    isSaving ? <CircularProgress size={16} /> : undefined
                  }
                  sx={{
                    textTransform: "none",
                    fontSize: 17,
                    height: "43px",
                    h: 10,
                    p: 1,
                    ...(isReject
                      ? {
                          bgcolor: "#EF4444",
                          "&:hover": { bgcolor: "#dc2626" },
                        }
                      : {
                          bgcolor: "green",
                          "&:hover": { bgcolor: "#15803d" },
                        }),
                    color: "white",
                  }}
                >
                  {label}
                </Button>
              );
            })}

          <IconButton
            onClick={handleStatusClick}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      <Menu
        anchorEl={versionMenuAnchor}
        open={Boolean(versionMenuAnchor)}
        onClose={() => setVersionMenuAnchor(null)}
      >
        {project?.visitedStatus?.map((version) => (
          <MenuItem key={version} onClick={() => setVersionMenuAnchor(null)}>
            {version}
          </MenuItem>
        ))}
      </Menu>

      {project && (
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            color: "#6B7280",
            fontSize: "0.875rem",
          }}
        >
          <Typography variant="body2">
            Project: {project.projectNumber}
          </Typography>
          <Typography variant="body2">Claim: {project.claimNumber}</Typography>
          <Typography variant="body2">Type: {project.projectType}</Typography>
          {/* {project.dateOfLoss && (
            <Typography variant="body2">
              Date of Loss:{" "}
              {format(new Date(project.dateOfLoss), "MMM dd, yyyy")}
            </Typography>
          )} */}
          

<b className="-mr-4"> SV Status:</b>

{siteInspection.length <1 && (
            <p className="text-red-600 float-end">
              Site Inpection is not assigned
            </p>
          )}

          {siteInspection.map((item, idx) => {
            const engineerName =
              item?.Field_EngineerReferences?.[0]?.display_value?.trim() ||
              "Unknown Engineer";

            const isCompleted = Boolean(item?.Site_Viste_Completion);

            return (
              <div key={idx} className="mb-2">
                <Chip
                  variant="filled"
                  color={isCompleted ? "success" : "default"}
                  size="small"
                  icon={<ShieldCheck className="text-[10px] text-red-800" />}
                  label={
                    isCompleted
                      ? `${engineerName}`
                      : engineerName
                  }

                  onClick={() => {
                    if(!isCompleted && userName === engineerName) {
                      handleOpenModal();
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>
            );
          })}
        </Box>
      )}

      <SiteInspectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        siteInspection={mySiteVisit}
        fetchSiteVisit={fetchSiteVisit}
      />
    </Paper>
  );
};

export default FormHeader;

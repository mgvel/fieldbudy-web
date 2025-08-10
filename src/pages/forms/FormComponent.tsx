import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert } from "@mui/material";
import { API_BASE_URL } from "../../api/config";
import axiosInstance from "../../api/axiosInstance";
import FormHeader from "./form/FormHeader";
import FormTabs from "./form/FormTabs";
import CommentModal from "./form/CommentModal";
import GalleryModal from "./form/CameraModal";
import VersionComparisonModal from "./form/VersionComparisonModal";
import { toast } from "react-toastify";
import formdata from "../../assets/data/formdata.json";
import { useAuthStore } from "../../store/authStore";
import { Project, FormCounts, FormData, UploadedFile } from "../../types/forms";
import Breadcrumb from "../../components/ui/Breadcrumb";
import { ProjectStatus } from "../../types/projectStatus.dto";

const FormComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { User } = useAuthStore((state) => ({ User: state.user }));
  const navigate = useNavigate();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core state
  const [project, setProject] = useState<Project>();
  const [formData, setFormData] = useState<FormData>();
  const [pages] = useState(formdata);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [counts, setCounts] = useState<FormCounts>({
    intervieweeCount: 1,
    documentCount: 1,
    structureCount: 1,
    roomCount: 1,
    damageCounts: [1]
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>("page-1");
  const [readOnly, setReadOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Modal states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFieldId, setChatFieldId] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryFieldId, setGalleryFieldId] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<UploadedFile[]>([]);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  const versionName = project?.status;

  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`${API_BASE_URL}/project/${id}`);
      const projectData = response.data.payload.project;
      setProject(projectData);
      
      if (projectData?.form?.slug) {
        await fetchFormData(projectData.form.slug);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchFormData = useCallback(async (slug: string) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/form/${slug}?version=${versionName}`
      );

      const data = response.data.payload;
      
      setFormData(data.form);
      setResponses(data.form?.responses || {});
      setReadOnly(data.readOnly || false);
      
      if (data.form) {
        setCounts({
          intervieweeCount: data.form.intervieweeCount || 1,
          documentCount: data.form.documentCount || 1,
          structureCount: data.form.structureCount || 1,
          roomCount: data.form.roomCount || 1,
          damageCounts: data.form.damageCounts || [1]
        });
      }
      
      if (data.form?.updatedAt) {
        const date = new Date(data.form.updatedAt);
        setLastSaved(date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true
        }));
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
      toast.error("Failed to load form data");
    }
  }, [versionName]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const saveForm = useCallback(async (isNewVersion: boolean = false, targetVersion?: string) => {
    if (!project?.form?.slug) {
      toast.error("Project form slug is missing");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        responses,
        ...counts
      };

      const emptyPayload = {};

      const versionN = project?.status === "IDP Not Started" ? "IDP In Progress - By FE" : project?.status;

      const response = await axiosInstance.patch(
        `${API_BASE_URL}/form/${project.form.slug}`,
        targetVersion ? emptyPayload : payload,
        {
          params: {
            versionName: targetVersion || versionN,
            isNew: isNewVersion.toString(),
          },
        }
      );

      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });

      setLastSaved(formattedDate);
      setHasUnsavedChanges(false);
      toast.success("Changes saved successfully");
      await fetchProject();
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form data");
    } finally {
      setIsSaving(false);
    }
  }, [project?.form?.slug, responses, counts, versionName, fetchProject]);

  const saveCurrentVersionForm = useCallback(async () => {
    if (!project?.form?.slug) {
      toast.error("Project form slug is missing");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        responses,
        ...counts
      };

      const response = await axiosInstance.post(
        `${API_BASE_URL}/form/create/${project.form.slug}`,
         payload,
        {
          params: {
            versionName: ProjectStatus.IDPInProgressByFE,
          },
        }
      );

      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });

      setLastSaved(formattedDate);
      setHasUnsavedChanges(false);
      toast.success("Changes saved successfully");
      // await fetchProject();
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form data");
    } finally {
      setIsSaving(false);
    }
  }, [project?.form?.slug, responses, counts, versionName, fetchProject]);

  // Auto-save logic
  const handleInputChange = useCallback((fieldId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
    setHasUnsavedChanges(true);
    
    // Clear any pending auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new auto-save timer (2 seconds after last change)
    autoSaveTimerRef.current = setTimeout(() => {
      if (versionName === "IDP Not Started" || versionName === "IDP In Progress - By FE") {
        saveCurrentVersionForm();
      } else {
        saveCurrentVersionForm();
      }
    }, 2000);
  }, [saveCurrentVersionForm, saveCurrentVersionForm, versionName]);

  const handleUpdateCounts = useCallback((newCounts: FormCounts) => {
    setCounts(newCounts);
    setHasUnsavedChanges(true);
    
    // Trigger auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      if (versionName === "IDP Not Started" || versionName === "IDP In Progress - By FE") {
        saveCurrentVersionForm();
      } else {
        saveCurrentVersionForm();
      }
    }, 2000);
  }, [saveCurrentVersionForm, saveCurrentVersionForm, versionName]);

  const handleUpdateStatus = useCallback((newStatus: string) => {
    saveForm(false, newStatus);
  }, [saveForm]);

  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!formData?.slug) return;
    
    try {
      const reportUrl = `/field-buddy/report/${formData.slug}`;
      window.open(reportUrl, '_blank');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  }, [formData?.slug]);

  const handleOpenChat = useCallback((fieldId: string) => {
    setChatFieldId(fieldId);
    setChatOpen(true);
  }, []);

  const handleOpenGallery = useCallback((fieldId: string) => {
    setGalleryFieldId(fieldId);
    
    const fieldFiles = responses[fieldId];
    if (Array.isArray(fieldFiles)) {
      setGalleryFiles(fieldFiles);
    } else if (fieldFiles && typeof fieldFiles === 'object') {
      setGalleryFiles([fieldFiles]);
    } else {
      setGalleryFiles([]);
    }
    
    setGalleryOpen(true);
  }, [responses]);

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate('/projects');
      }
    } else {
      navigate('/projects');
    }
  }, [navigate, hasUnsavedChanges]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Project not found or failed to load
        </Alert>
      </Box>
    );
  }

  const isEditable = !readOnly && ['IDP In Progress - By FE', 'IDP Not Started'].includes(versionName || '');

  return (
    <Box sx={{backgroundColor: '#F8FAFC', minHeight: '100vh',width:"80vw", margin:"auto" }}>
      <Breadcrumb
        crumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Projects",to:"/projects" },
          { label: "Project Details", to:`/projects/${id}` },
          { label: "Field Buddy Form",},
        ]}
      />
      <FormHeader
        project={project}
        userRole={User?.role}
        versionName={versionName}
        lastSaved={lastSaved}
        onDownload={handleDownload}
        onUpdateStatus={handleUpdateStatus}
        onBack={handleBack}
        isSaving={isSaving}
        setVersionModalOpen={setVersionModalOpen} 
      />

      <Box sx={{ maxWidth: '100%', mx: 'auto', px: 3, pb: 3 }}>
        <FormTabs
          pages={pages}
          activeTab={activeTab}
          responses={responses}
          readOnly={!isEditable}
          isSaving={isSaving}
          counts={counts}
          onTabChange={handleTabChange}
          onInputChange={handleInputChange}
          onOpenChat={handleOpenChat}
          onOpenGallery={handleOpenGallery}
          onUpdateCounts={handleUpdateCounts}
          project={project.id}
          versionName={versionName}
          saveCurrentVersion={saveCurrentVersionForm}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </Box>

      {/* Modals */}
      <CommentModal
        open={chatOpen}
        fieldId={chatFieldId}
        project={project}
        form={formData}
        onClose={() => setChatOpen(false)}
      />

      <GalleryModal
        open={galleryOpen}
        fieldId={galleryFieldId}
        files={galleryFiles}
        onClose={() => setGalleryOpen(false)}
      />

      <VersionComparisonModal
        open={versionModalOpen}
        versions={project.visitedStatus || []}
        onClose={() => setVersionModalOpen(false)}
        formId={formData?._id || ''}
      />
    </Box>
  );
};

export default FormComponent;
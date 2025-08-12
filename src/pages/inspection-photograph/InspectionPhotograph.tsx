import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ImageAnnotator from "./ImageAnnotation";
import {
  ArrowLeft,
  FolderPlus,
  X,
  AlertCircle,
  Check,
  RefreshCw,
  Home,
  Folder,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { PROXY_BASE_URL } from "../../api/config";
import { CircularProgress } from "@mui/material";
import FileGrid from "./FileGrid";
import UploadModal from "./UploadModal";
import UploadButton from "./UploadButton";
// import UploadModal from "./UploadModal";
// import UploadButton from "./UploadButton";
// import FileGrid from "./FileGrid";

interface Folder {
  _id: string;
  name: string;
  slug: string;
  parentFolders: Folder[];
  totalImageCount?: number;
}

interface UploadSession {
  sessionId: string;
  total: number;
  completed: number;
  failed: number;
  status: "pending" | "in-progress" | "completed" | "failed";
  failedUploads?: any[];
}

interface FileItem {
  _id: string;
  filename: string;
  thumbnail: string;
  url: string;
  workdriveId: string;
  caption?: string;
  slug: string;
  includedInReport?: boolean;
  createdAt?: string;
}

const InspectionPhotographs: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [parentFolders, setParentFolders] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(true);
  const [currentCaption, setCurrentCaption] = useState({ id: "", text: "" });
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [overlayFilename, setOverlayFilename] = useState("");
  const [annotationActive, setAnnotationActive] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [deletingFiles, setDeletingFiles] = useState<string[]>([]);
  const [failedUploads, setFailedUploads] = useState<
    UploadSession["failedUploads"]
  >([]);
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [currentFolderName, setCurrentFolderName] = useState("");

  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

console.log("failedUploads",failedUploads)
  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/folder?project=${projectId}&order=${
        parentFolders.length + 1
      }`;
      if (parentFolders.length) {
        url += `&parentFolder=${parentFolders[parentFolders.length - 1]._id}`;
      }

      const response = await axiosInstance.get(url);
      setFolders(response.data.payload || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Error loading folders");
    } finally {
      setLoading(false);
    }
  }, [projectId, parentFolders]);


  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const folderId = parentFolders.length
        ? parentFolders[parentFolders.length - 1]._id
        : "default";
      const response = await axiosInstance.get(
        `/media/?project=${projectId}&fieldId=${folderId}`
      );
      setFiles(response.data.payload || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Error loading files");
    } finally {
      setLoading(false);
    }
  }, [projectId, parentFolders]);

  const setParentFolder = async (folderId: string): Promise<void> => {
    if (folderId === "default") {
      setParentFolders([]);
      return;
    }

    try {
      const response = await axiosInstance.get(`/folder/${folderId}`);
      setParentFolders([
        ...response.data.payload.folder.parentFolders,
        response.data.payload.folder,
      ]);
    } catch (error) {
      console.error("Error setting parent folder:", error);
      toast.error("Error navigating to folder");
    }
  };

  const handleBreadcrumbClick = async (folderId: string): Promise<void> => {
    await setParentFolder(folderId);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      if (uploadSession && uploadSession.status === "in-progress") {
        toast.warn("Please wait for current upload to complete");
        return;
      }
      handleUpload(acceptedFiles);
    },
  });


  const checkUploadStatus = async (sessionId: string) => {
    try {
      const response = await axiosInstance.get(
        `/media/bulk/status/${sessionId}`
      );
      const status = response.data.payload;
      
      const updatedSession = {
        ...status,
        sessionId: status._id || sessionId,
        total: status.totalCount,
        completed: status.uploadedCount,
        failed: status.failedCount,
        status: status.status,
      };
      
      setUploadSession(updatedSession);
      setUploadProgress(Math.round((status.uploadedCount / status.totalCount) * 100));
  
      if (status.failedUploads?.length > 0) {
        setFailedUploads(status.failedUploads);
      }
  
      // Clear everything when upload is fully completed
      if (status.status === "completed" || status.status === "failed") {
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        
        setIsUploading(false);
        
        // Only clear session if fully completed
        if (status.status === "completed") {
          setTimeout(() => {
            setUploadSession(null);
            setUploadProgress(0);
            setFailedUploads([]);
          }, 2000); // Small delay to show completion
        }
  
        fetchFiles(); // Refresh file list
      }
    } catch (error) {
      console.error("Status check error:", error);
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
      setIsUploading(false);
      toast.error("Failed to check upload status");
    }
  };
  
  const handleUpload = async (uploadFiles: File[]) => {
    if (!uploadFiles.length) {
      toast.warn("Please select files to upload");
      return;
    }
  
    if (!parentFolders.length) {
      toast.warn("Please select a folder first");
      return;
    }
  
    // Clear any existing session
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  
    const folderId = parentFolders[parentFolders.length - 1]._id;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSession(null);
    setFailedUploads([]);
  
    try {
      const formData = new FormData();
      formData.append('projectId', projectId || '');
      formData.append('folder', folderId);
      
      uploadFiles.forEach((file) => {
        formData.append('images', file, file.name);
      });
  
      const response = await axiosInstance.post('/media/bulk/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(percentCompleted);
          }
        },
      });
  
      const sessionId = response.data.payload.sessionId;
      const newSession: UploadSession = {
        sessionId,
        total: uploadFiles.length,
        completed: 0,
        failed: 0,
        status: "in-progress",
      };
      setUploadSession(newSession);
  
      // Start polling for status
      const interval = setInterval(() => {
        checkUploadStatus(sessionId);
      }, 3000);
      statusCheckIntervalRef.current = interval;
  
      toast.success("Upload started successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      let errorMessage = "Upload failed";
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage = "File too large";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
  
      toast.error(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
      
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    }
  };
  

  const fetchSessionStatus = useCallback(async () => {
    if (!projectId) return;

    try {
      const res = await axiosInstance.get(
        `/media/bulk/sessions/user?projectId=${projectId}`
      );
      const sessionList = res.data.payload.data || [];
      setProjectName(sessionList[0]?.projectName);
      setCurrentFolderName(sessionList[0]?.folderName);
    //  console.log("sessionList",sessionList)
      const activeSessions = sessionList.filter(
        (s: any) =>
          s.status === "in-progress" ||
          s.status === "failed" ||
          s.status === "partially-completed"
      );

      if (activeSessions.length > 0) {
        const latest = activeSessions[0];
        const newSession = {
          sessionId: latest._id,
          total: latest.totalImages,
          completed: latest.processedImages,
          failed: latest.failedImages,
          status: latest.status,
          failedUploads: latest.failedUploads,
        };

        setUploadSession(newSession);
        setFailedUploads(latest.failedUploads || []);

        const totalProcessed = latest.processedImages + latest.failedImages;
        const progress = Math.round(
          (totalProcessed / latest.totalImages) * 100
        );
        setUploadProgress(progress);

        if (latest.status === "in-progress") {
          if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
          }
          const interval = setInterval(
            () => checkUploadStatus(latest._id),
            3000
          );
          statusCheckIntervalRef.current = interval;
        }
      } else {
        setUploadSession(null);
      }
    } catch (err) {
      console.error("Error fetching session status", err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
    fetchSessionStatus();

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [fetchFolders, fetchFiles, fetchSessionStatus]);

  const handleAnnotate = async (
    imageUrl: string,
    filename: string,
    fileId: string
  ) => {
    setCurrentFileId(fileId);
    setOverlayFilename(filename);
    setOverlayImage(
      `${PROXY_BASE_URL}/proxy?url=${encodeURIComponent(imageUrl)}`
    );
    setAnnotationActive(true);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.warn("Please enter a folder name");
      return;
    }

    try {
      const folderData = {
        name: newFolderName.trim(),
        parentFolders: parentFolders.map((folder) => folder._id),
        project: projectId,
      };

      const response = await axiosInstance.post("/folder", folderData);

      if (response.status === 200 || response.status === 201) {
        toast.success("Folder created successfully");
        setNewFolderName("");
        setShowCreateFolder(false);
        fetchFolders();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error(`Error creating folder: ${error.message || "Unknown error"}`);
    }
  };

  const handleUpdateCaption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCaptionLoading(true);
      const response = await axiosInstance.post(
        `/media/caption/${currentCaption.id}`,
        { caption: currentCaption.text }
      );

      if (response.status === 202 || response.status === 201) {
        toast.success("Caption updated successfully");
        setShowCaptionModal(false);
        fetchFiles();
      }
    } catch (error) {
      console.error("Error updating caption:", error);
      toast.error(
        `Error updating caption: ${error.message || "Unknown error"}`
      );
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleFileSelect = (fileId: string, isSelected: boolean) => {
    setSelectedFiles((prev) =>
      isSelected ? [...prev, fileId] : prev.filter((id) => id !== fileId)
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectedFiles(isChecked ? files.map((file) => file._id) : []);
  };

  const handleIncludeFiles = async (include: boolean = true) => {
    if (selectedFiles.length === 0) {
      toast.warn("No files selected");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post("/media/include", {
        fileIds: selectedFiles,
        includedInReport: include,
        projectId: projectId,
      });

      toast.success(
        `${
          response.data.payload?.modifiedCount || selectedFiles.length
        } files ${include ? "included" : "excluded"} from report`
      );
      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error("Error updating file inclusion:", error);
      toast.error(`Error: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.warn("No files selected");
      return;
    }

    const result = window.confirm(
      `Are you sure you want to delete ${selectedFiles.length} file(s)? This action cannot be undone.`
    );
    if (!result) return;

    try {
      setDeletingFiles(selectedFiles);
      await axiosInstance.delete("/media/delete", {
        data: { fileIds: selectedFiles, projectId: projectId },
      });

      toast.success(`Deleted ${selectedFiles.length} file(s) successfully`);
      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting files:", error);
      toast.error(`Delete failed: ${error.message || "Unknown error"}`);
    } finally {
      setDeletingFiles([]);
    }
  };



  const handleRetryUpload = async (upload: any) => {
    if (!projectId || !parentFolders.length) return;
  
    try {
      const folderId = parentFolders[parentFolders.length - 1]._id;
      const formData = new FormData();
      
      // Convert Base64 back to File object for retry
      const byteString = atob(upload.base64Data.split(',')[1]);
      const mimeString = upload.base64Data.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], `Retry_${upload.sequenceId}.jpg`, { type: mimeString });
  
      formData.append('projectId', projectId);
      formData.append('folderId', folderId);
      formData.append('files', file);
      formData.append('filenames', `Retry_${upload.sequenceId}.jpg`);
  
      toast.info("Retrying upload...");
      await axiosInstance.post('/media/bulk/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      fetchSessionStatus();
      toast.success("Retry submitted");
    } catch (err) {
      console.error("Retry failed", err);
      toast.error("Retry failed");
    }
  };

  const handleBulkRetry = async () => {
    if (!uploadSession?.sessionId) {
      toast.warn("No active session found");
      return;
    }

    try {
      toast.info("Retrying all failed uploads...");
      await axiosInstance.post(`/media/bulk/retry/${uploadSession.sessionId}`);
      fetchSessionStatus();
      toast.success("Retry started");
    } catch (err) {
      console.error("Bulk retry failed", err);
      toast.error("Failed to retry uploads");
    }
  };

  const handleEditCaption = (fileId: string, caption: string) => {
    setCurrentCaption({ id: fileId, text: caption });
    setShowCaptionModal(true);
  };

  const hasActiveUploadSession =
    uploadSession?.status === "in-progress" ||
    uploadSession?.status === "completed" ||
    uploadSession?.status === "failed";

const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-center">
          {/* <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button> */}

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Inspection Photographs
            </h1>
            <p className="text-sm text-gray-500">
              Manage and annotate your inspection images
            </p>
          </div>

          <div className="w-16"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center overflow-x-auto py-2 scrollbar-hide">
            <button
              onClick={() => handleBreadcrumbClick("default")}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
            >
              <Home size={16} />
              <span>Home</span>
            </button>
            {parentFolders.map((folder) => (
              <React.Fragment key={folder._id}>
                <span className="mx-2 text-gray-400">/</span>
                <button
                  onClick={() => handleBreadcrumbClick(folder.slug)}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  <Folder size={16} />
                  <span>{folder.name}</span>
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Create Folder Button */}
        <div className="flex justify-between items-center mb-6">
          {(parentFolders.length === 0 || parentFolders.length === 1) && (
            <button
              onClick={() => setShowCreateFolder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FolderPlus size={18} />
              <span>Create Folder</span>
            </button>
          )}
        </div>

        {/* Folders Grid */}
        {folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Folders
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => handleBreadcrumbClick(folder.slug)}
                  className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Folder className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {folder.totalImageCount || 0}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-800 truncate text-sm">
                    {folder.name}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        )}

       {(parentFolders.length >1 ) &&  (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {files.length > 0 ? `Files (${files.length})` : "No Files"}
          </h2>
        </div>
        )}

        {/* Failed Uploads Section */}
        {failedUploads.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleBulkRetry}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retry All Failed Uploads
            </button>
          </div>
        )}

        {failedUploads?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
              <AlertCircle size={18} />
              Failed Uploads
            </h2>
            <span>{failedUploads.projectName}</span> <span>{failedUploads.folderName}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {failedUploads.map((upload, index) => (
                <div
                  key={index}
                  className="border border-red-100 rounded-lg p-3 shadow-sm bg-white"
                >
                  <img
                    src={`${PROXY_BASE_URL}/${upload.filePath}`}
                    alt="Failed Upload"
                    className="w-full h-32 object-contain rounded bg-gray-100"
                  />
                  <div className="mt-2 text-xs text-red-600 line-clamp-2">
                    {upload.lastError || "Unknown Error"}
                  </div>
                 
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Grid or Empty State */}
        {loading && !files.length ? (
          <div className="flex justify-center items-center h-40">
            <CircularProgress />
          </div>
        ) : files.length > 0 ? (
          <FileGrid
            files={files}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onSelectAll={handleSelectAll}
            onIncludeFiles={handleIncludeFiles}
            onDeleteFiles={handleDeleteFiles}
            onEditCaption={handleEditCaption}
            onAnnotate={handleAnnotate}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            deletingFiles={deletingFiles}
          />
        ) : (parentFolders.length >1 ) &&  (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              No files uploaded yet
            </h3>
            <p className="text-sm text-gray-500">
              Click the upload button to add files
            </p>
          </div>
        )}
      </div>

      {/* Upload Button - Only show when in a folder that can accept files */}
      {parentFolders.length > 1 && (
        <UploadButton
          onClick={() => setShowUploadModal(true)}
          isUploading={isUploading}
          hasActiveSession={hasActiveUploadSession}
        />
      )}

    {parentFolders.length > 1 && (
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadSession={uploadSession}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        onBrowseClick={open}
        onRetryUpload={handleRetryUpload}
        failedUploads={failedUploads || []}
        projectName={projectName}
        folderName={currentFolderName}
      />
       )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Folder</h2>
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                autoFocus
                required
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName("");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Caption Modal */}
      {showCaptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Caption</h2>
              <button
                onClick={() => {
                  setShowCaptionModal(false);
                  setCurrentCaption({ id: "", text: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateCaption}>
              <textarea
                value={currentCaption.text}
                onChange={(e) =>
                  setCurrentCaption({ ...currentCaption, text: e.target.value })
                }
                placeholder="Enter image caption..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4 h-24 resize-none"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCaptionModal(false);
                    setCurrentCaption({ id: "", text: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={captionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {captionLoading && (
                    <CircularProgress size={16} color="inherit" />
                  )}
                  {captionLoading ? "Saving..." : "Save Caption"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Annotator */}
      {annotationActive && overlayImage && currentFileId && (
        <ImageAnnotator
          imageUrl={overlayImage}
          filename={overlayFilename}
          isSaving={isSaving}
          onSave={async (annotatedImageFile) => {
            try {
              setIsSaving(true);
              const formData = new FormData();
              formData.append("file", annotatedImageFile);
              formData.append("isEdited", "true");
              formData.append(
                "caption",
                `Annotated version of ${overlayFilename}`
              );
              formData.append("projectId", projectId || "");

              if (parentFolders.length > 0) {
                formData.append(
                  "folder",
                  parentFolders[parentFolders.length - 1]._id
                );
              }

              const uploadResponse = await axiosInstance.post(
                `/media/image?project=${projectId}&folder=${
                  parentFolders[parentFolders.length - 1]._id
                }`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (
                uploadResponse.status === 200 ||
                uploadResponse.status === 201
              ) {
                toast.success("Annotated image saved successfully!");
              } else {
                throw new Error("Failed to save annotation");
              }
            } catch (error) {
              console.error("Error saving annotation:", error);
              toast.error("Failed to save annotated image");
            } finally {
              setIsSaving(false);
              setAnnotationActive(false);
              setOverlayImage(null);
              fetchFiles();
            }
          }}
          onClose={() => {
            setAnnotationActive(false);
            setOverlayImage(null);
          }}
        />
      )}
    </div>
  );
};

export default InspectionPhotographs;

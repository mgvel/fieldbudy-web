import React from 'react';
import { X, Upload, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { CircularProgress } from '@mui/material';

interface UploadSession {
  sessionId: string;
  total: number;
  completed: number;
  failed: number;
  status: "pending" | "in-progress" | "completed" | "failed";
  failedUploads?: any[];
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadSession: UploadSession | null;
  uploadProgress: number;
  isUploading: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
  onBrowseClick: () => void;
  onRetryUpload: (upload: any) => void;
  failedUploads: any[];
  projectName: string;
  folderName: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  uploadSession,
  uploadProgress,
  isUploading,
  getRootProps,
  getInputProps,
  onBrowseClick,
  onRetryUpload,
  failedUploads,
  projectName,
  folderName,
}) => {
  if (!isOpen) return null;

  const renderUploadInterface = () => (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
    >
      <input {...getInputProps()} />
      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Upload Images
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Drag & drop files here or click to browse
      </p>
      <button
        onClick={onBrowseClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Browse Files
      </button>
    </div>
  );

  

  const renderUploadStatus = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {uploadSession?.status === "in-progress" ? (
          <RefreshCw className="animate-spin text-blue-500" size={20} />
        ) : uploadSession?.status === "completed" ? (
          <Check className="text-green-500" size={20} />
        ) : (
          <AlertCircle className="text-yellow-500" size={20} />
        )}

{/* {uploadSession?.status !== "in-progress" && (
  <button
    onClick={onBrowseClick}
    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
  >
    <Upload size={16} />
    Upload More Files
  </button>
)} */}

        <h3 className="text-sm font-semibold">
          {uploadSession?.status === "in-progress"
            ? "Upload in Zoho drive"
            : uploadSession?.status === "completed"
            ? "Upload Complete"
            : "Uploading local to server"}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {uploadSession && uploadSession?.completed} {uploadSession && `of`} { uploadSession &&  uploadSession?.total} {uploadSession && `files`}
          </span>
          <span className="font-medium">{uploadProgress}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>

      {uploadSession?.failed && uploadSession.failed > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle size={16} />
            <span className="font-medium">
              {uploadSession.failed} upload(s) failed
            </span>
          </div>
        </div>
      )}

      {failedUploads?.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <h4 className="font-medium text-red-600">Failed Uploads:</h4>
          {failedUploads.map((upload, index) => (
            <div key={index} className="flex items-center justify-between bg-red-50 p-2 rounded">
              <span className="text-sm text-gray-600 truncate">
                Upload {upload.sequenceId}
              </span>
              <button
                onClick={() => onRetryUpload(upload)}
                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          ))}
        </div>
      )}

      {/* {uploadSession?.status !== "in-progress" && (
        <button
          onClick={onBrowseClick}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          Upload More Files
        </button>
      )} */}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl max-h-[80vh] overflow-y-auto">
      <div className="mb-3 text-left text-sm text-gray-600">
  <p><strong>Project:</strong> {projectName}</p>
  {/* <p><strong>Folder:</strong> {folderName}</p> */}
</div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isUploading || uploadSession?.status === "in-progress" 
              ? "Upload Status" 
              : "Upload Images"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {isUploading || uploadSession?.status === "in-progress" || uploadSession?.status === "completed" || uploadSession?.status === "failed"
          ? renderUploadStatus()
          : renderUploadInterface()}
      </div>
    </div>
  );
};

export default UploadModal;
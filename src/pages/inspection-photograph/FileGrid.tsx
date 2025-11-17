import React from 'react';
import { MoreVertical, Edit3, Eye, Image, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { CircularProgress } from '@mui/material';

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

interface FileGridProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string, isSelected: boolean) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncludeFiles: (include?: boolean) => void;
  onDeleteFiles: () => void;
  onEditCaption: (fileId: string, caption: string) => void;
  onAnnotate: (imageUrl: string, filename: string, fileId: string) => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  deletingFiles: string[];
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onIncludeFiles,
  onDeleteFiles,
  onEditCaption,
  onAnnotate,
  activeDropdown,
  setActiveDropdown,
  deletingFiles,
}) => {
  return (
    <div className="space-y-6">
      {files.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedFiles.length === files.length && files.length > 0}
              onChange={onSelectAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Select All</span>
          </label>

          {selectedFiles.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => onIncludeFiles(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={16} />
                <span>Include ({selectedFiles.length})</span>
              </button>
              <button
                onClick={() => onIncludeFiles(false)}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <XCircle size={16} />
                <span>Exclude</span>
              </button>
              <button
                onClick={onDeleteFiles}
                disabled={deletingFiles.length > 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {deletingFiles.length > 0 ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file._id}
            className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 ${
              file.includedInReport
                ? "ring-2 ring-green-300"
                : "border border-gray-200"
            }`}
          >
            <div className="relative">
              <div
                className="w-full h-40 bg-cover bg-center bg-gray-100"
                style={{
                  backgroundImage: `url(https://previewengine-accl.zoho.com/image/WD/${file.workdriveId})`,
                }}
              />

              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file._id)}
                  onChange={(e) => onFileSelect(file._id, e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
              </div>

              <div className="absolute top-2 right-2">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === file._id ? null : file._id);
                    }}
                    className="p-1.5 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all shadow-sm"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeDropdown === file._id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10">
                      <button
                        onClick={() => {
                          onEditCaption(file.slug, file.caption || "");
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Edit3 size={14} />
                        Edit Caption
                      </button>
                      <button
                        onClick={() => {
                          window.open(file.url, "_blank");
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Eye size={14} />
                        View Original
                      </button>
                      <button
                        onClick={() => {
                          onAnnotate(file.thumbnail, file.filename, file._id);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Image size={14} />
                        Annotate Image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="absolute bottom-2 right-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    file.includedInReport
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {file.includedInReport ? "Included" : "Excluded"}
                </span>
              </div>
            </div>

            <div className="p-3">
              <h3 className="font-medium text-gray-800 truncate text-sm mb-1">
                {file.filename}
              </h3>
              {file.caption && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {file.caption}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {file.createdAt && new Date(file.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditCaption(file.slug, file.caption || "")}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit Caption"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onAnnotate(file.thumbnail, file.filename, file._id)}
                    className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Annotate Image"
                  >
                    <Image size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileGrid;
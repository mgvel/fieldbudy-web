import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  GripVertical,
  Folder,
  Image,
  AlertCircle,
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
  FileImage,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import { CircularProgress } from "@mui/material";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// ... rest of your code remains the same

interface MediaItem {
  _id: string;
  slug: string;
  url: string;
  thumbnail: string;
  workdriveId: string;
  project: string;
  fieldId: string;
  filename: string;
  size: number;
  localPath: string;
  includedInReport: boolean;
  folderName?: string;
  sequenceOrder?: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface GroupedMedia {
  [folderName: string]: MediaItem[];
}

const ReportImages: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<string[]>([]);
  const [groupedImages, setGroupedImages] = useState<GroupedMedia>({});
  const [totalCount, setTotalCount] = useState(0);
  const [isModified, setIsModified] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch included images
  const fetchIncludedImages = useCallback(async () => {
    try {
      setLoading(true);
      const url = projectId
        ? `/media/included-images/${projectId}`
        : `/media/included-images`;

      const response = await axiosInstance.get(url);
      const data = response.data.payload;

      // Process and organize the data
      const processedGrouped: GroupedMedia = {};
      
      Object.keys(data.groupedByFolder || {}).forEach((folder) => {
        // Sort items by sequenceOrder, handling undefined values
        const sortedItems = (data.groupedByFolder[folder] || [])
          .map((item: any) => ({
            ...item,
            // Ensure folderName is set
            folderName: item.folderName || folder,
            // Ensure sequenceOrder has a default value
            sequenceOrder: item.sequenceOrder !== undefined ? item.sequenceOrder : 0,
          }))
          .sort((a: MediaItem, b: MediaItem) => {
            // Sort by sequenceOrder, putting items without sequenceOrder at the end
            const aOrder = a.sequenceOrder ?? 999;
            const bOrder = b.sequenceOrder ?? 999;
            return aOrder - bOrder;
          });

        processedGrouped[folder] = sortedItems;
      });

      setGroupedImages(processedGrouped);
      setTotalCount(data.totalCount || 0);
      setIsModified(false);

      // Auto-expand all folders that have items
      const folderNames = new Set(Object.keys(processedGrouped));
      setExpandedFolders(folderNames);
    } catch (error) {
      console.error("Error fetching included images:", error);
      toast.error("Failed to load report images");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        try {
          const { data } = await axiosInstance.get(`/project/${projectId}`);
          setProjectName(data.payload.project?.projectName || "");
        } catch (error) {
          console.error("Error fetching project:", error);
        }
      }
    };
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    fetchIncludedImages();
  }, [fetchIncludedImages]);

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceFolder = source.droppableId;
    const destFolder = destination.droppableId;

    // If dropped in the same position, do nothing
    if (sourceFolder === destFolder && source.index === destination.index) {
      return;
    }

    // Create a deep copy of grouped images
    const newGrouped = { ...groupedImages };

    // Get the items from source folder
    const sourceItems = [...newGrouped[sourceFolder]];
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (sourceFolder === destFolder) {
      // Reorder within the same folder
      sourceItems.splice(destination.index, 0, movedItem);
      newGrouped[sourceFolder] = sourceItems;
    } else {
      // Move to different folder
      const destItems = [...(newGrouped[destFolder] || [])];
      destItems.splice(destination.index, 0, movedItem);

      // Update folder name for the moved item
      movedItem.folderName = destFolder;

      newGrouped[sourceFolder] = sourceItems;
      newGrouped[destFolder] = destItems;
    }

    // Update sequence numbers for all items in affected folders
    [sourceFolder, destFolder].forEach((folder) => {
      if (newGrouped[folder]) {
        newGrouped[folder] = newGrouped[folder].map((item, index) => ({
          ...item,
          sequenceOrder: index,
        }));
      }
    });

    setGroupedImages(newGrouped);
    setIsModified(true);
    toast.success(`Moved "${movedItem.filename}" to ${destFolder}`);
  };

  // Toggle folder expansion
  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  // Remove image from report
  const handleRemoveImage = async (imageId: string, folderName: string) => {
    if (!window.confirm(`Remove "${groupedImages[folderName]?.find(i => i._id === imageId)?.filename}" from report?`)) {
      return;
    }

    try {
      setRemoving((prev) => [...prev, imageId]);

      const response = await axiosInstance.post("/media/include", {
        fileIds: [imageId],
        includedInReport: false,
        projectId: projectId,
      });

      if (response.status === 200 || response.status === 202) {
        const newGrouped = { ...groupedImages };
        const items = newGrouped[folderName].filter((item) => item._id !== imageId);

        if (items.length > 0) {
          // Update sequence numbers
          items.forEach((item, index) => {
            item.sequenceOrder = index;
          });
          newGrouped[folderName] = items;
        } else {
          delete newGrouped[folderName];
          setExpandedFolders((prev) => {
            const newSet = new Set(prev);
            newSet.delete(folderName);
            return newSet;
          });
        }

        setGroupedImages(newGrouped);
        setTotalCount((prev) => prev - 1);
        setIsModified(true);
        toast.success("Image removed from report");
      }
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image from report");
    } finally {
      setRemoving((prev) => prev.filter((id) => id !== imageId));
    }
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!isModified) {
      toast.info("No changes to save");
      return;
    }

    try {
      setSaving(true);

      const updateItems: any[] = [];

      Object.keys(groupedImages).forEach((folderName) => {
        groupedImages[folderName].forEach((item, index) => {
          updateItems.push({
            mediaId: item._id,
            folderName: folderName,
            sequenceOrder: index,
          });
        });
      });

      const response = await axiosInstance.put("/media/bulk-reorder", {
        items: updateItems,
      });

      if (response.status === 200 || response.status === 202) {
        toast.success(`Successfully updated ${updateItems.length} images`);
        setIsModified(false);
        await fetchIncludedImages();
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Reset to original order
  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset to the original order?")) {
      await fetchIncludedImages();
      toast.info("Reset to original order");
    }
  };

  // Navigate back
  const handleBack = () => {
    if (isModified) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Format filename for display (remove extension)
  const formatFilename = (filename: string) => {
    return filename.replace(/\.[^/.]+$/, ""); // Remove file extension
  };

  // Render empty state
  if (!loading && totalCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Report Images</h1>
          </div>

          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No images included in report
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Go to Inspection Photographs to include images in the report
            </p>
            <button
              onClick={() => navigate(`/inspection-photographs/${projectId}`)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
            >
              Go to Photographs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
                title="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  Report Images
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {totalCount} image{totalCount !== 1 ? "s" : ""}
                  </span>
                </h1>
                {projectName && (
                  <p className="text-sm text-gray-500 mt-0.5">{projectName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              {isModified && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse">
                  <AlertCircle size={14} />
                  Unsaved changes
                </span>
              )}

              <button
                onClick={handleReset}
                disabled={!isModified || saving}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw size={16} className={saving ? "animate-spin" : ""} />
                Reset
              </button>

              <button
                onClick={handleSaveChanges}
                disabled={!isModified || saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-100"
              >
                {saving ? (
                  <>
                    <CircularProgress size={18} color="inherit" thickness={4} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={48} thickness={4} />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-6">
              {Object.keys(groupedImages).map((folderName) => {
                const isExpanded = expandedFolders.has(folderName);
                const items = groupedImages[folderName];

                return (
                  <div
                    key={folderName}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    {/* Folder Header */}
                    <div
                      className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition-colors"
                      onClick={() => toggleFolder(folderName)}
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          {isExpanded ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                        <div className="p-2 bg-blue-50 rounded-xl">
                          <Folder className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {folderName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {items.length} image{items.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {items.length}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newName = prompt("Enter new folder name:", folderName);
                            if (newName && newName.trim() !== folderName && newName?.trim()) {
                              const newGrouped = { ...groupedImages };
                              const folderItems = newGrouped[folderName];
                              delete newGrouped[folderName];
                              newGrouped[newName.trim()] = folderItems.map((item) => ({
                                ...item,
                                folderName: newName.trim(),
                              }));
                              setGroupedImages(newGrouped);
                              setIsModified(true);
                              toast.success(`Folder renamed to "${newName.trim()}"`);

                              setExpandedFolders((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(folderName);
                                newSet.add(newName.trim());
                                return newSet;
                              });
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                        >
                          Rename
                        </button>
                      </div>
                    </div>

                    {/* Images Grid - Column Layout */}
                    {isExpanded && (
                      <Droppable droppableId={folderName} direction="vertical">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-6 transition-all duration-300 ${
                              snapshot.isDraggingOver
                                ? "bg-blue-50/50"
                                : ""
                            }`}
                          >
                            <div
                              className={`grid gap-4 ${
                                viewMode === "grid"
                                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                                  : "grid-cols-1"
                              }`}
                            >
                              {items.map((item, index) => {
                                const isRemoving = removing.includes(item._id);
                                const displayName = formatFilename(item.filename);
                                
                                return (
                                  <Draggable
                                    key={item._id}
                                    draggableId={item._id}
                                    index={index}
                                    isDragDisabled={isRemoving || saving}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`relative group transition-all duration-200 ${
                                          snapshot.isDragging
                                            ? "scale-105 z-50"
                                            : ""
                                        }`}
                                        style={{
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <div
                                          className={`relative bg-gray-100 rounded-2xl overflow-hidden border-2 transition-all ${
                                            snapshot.isDragging
                                              ? "border-blue-500 shadow-2xl"
                                              : "border-transparent hover:border-blue-300 hover:shadow-lg"
                                          } ${isRemoving ? "opacity-50" : ""}`}
                                        >
                                          {/* Drag Handle */}
                                          <div
                                            {...provided.dragHandleProps}
                                            className={`absolute top-3 left-3 z-10 p-1.5 bg-black/60 backdrop-blur-sm rounded-xl cursor-grab transition-all duration-200 ${
                                              isRemoving || saving
                                                ? "opacity-50 cursor-not-allowed"
                                                : "opacity-0 group-hover:opacity-100 hover:bg-black/80"
                                            }`}
                                          >
                                            <GripVertical className="w-4 h-4 text-white" />
                                          </div>

                                          {/* Remove Button */}
                                          <button
                                            onClick={() =>
                                              handleRemoveImage(item._id, folderName)
                                            }
                                            disabled={isRemoving || saving}
                                            className={`absolute top-3 right-3 z-10 p-1.5 rounded-xl transition-all duration-200 ${
                                              isRemoving || saving
                                                ? "opacity-0 cursor-not-allowed"
                                                : "opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 shadow-lg"
                                            }`}
                                          >
                                            <X className="w-4 h-4 text-white" />
                                          </button>

                                          {/* Order Badge */}
                                          <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-xs rounded-lg font-medium">
                                            #{index + 1}
                                          </div>

                                          {/* Loading overlay for removal */}
                                          {isRemoving && (
                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                                              <CircularProgress
                                                size={32}
                                                color="inherit"
                                                thickness={4}
                                              />
                                            </div>
                                          )}

                                          {/* Image */}
                                          <div className="relative w-full aspect-square">
                                            <img
                                              src={item.thumbnail || item.url}
                                              alt={displayName}
                                              className={`w-full h-full ${
                                                viewMode === "grid"
                                                  ? "object-cover"
                                                  : "object-contain"
                                              }`}
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                  "/placeholder-image.png";
                                              }}
                                              loading="lazy"
                                            />
                                          </div>

                                          {/* Filename */}
                                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                                            <div className="flex items-center gap-1.5">
                                              <FileImage className="w-3 h-3 text-white/60" />
                                              <p className="text-white text-xs font-medium truncate">
                                                {displayName}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Hover glow effect */}
                                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/50 rounded-2xl transition-all duration-300 pointer-events-none" />
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    )}
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Floating Save Button (Mobile) */}
      {isModified && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:hidden z-50">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-2xl shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium"
          >
            {saving ? (
              <>
                <CircularProgress size={20} color="inherit" thickness={4} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportImages;
import React from "react";
import {
  Pen,
  Highlighter,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Type,
  Undo,
  Redo,
  X,
  MousePointer,
  Save,
  Delete,
} from "lucide-react";
import { DrawingElement } from "../../types/annotation";

interface ToolsPanelProps {
  currentTool: DrawingElement["type"];
  onToolChange: (tool: DrawingElement["type"]) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onClose: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isCanvasReady?: boolean;
  isSaving?: boolean;
}

const tools = [
  { type: "select" as const, icon: MousePointer, label: "Select" },
  { type: "pen" as const, icon: Pen, label: "Pen" },
  { type: "marker" as const, icon: Highlighter, label: "Marker" },
  { type: "rectangle" as const, icon: Square, label: "Rectangle" },
  { type: "circle" as const, icon: Circle, label: "Circle" },
  { type: "arrow" as const, icon: ArrowRight, label: "Arrow" },
  { type: "line" as const, icon: Minus, label: "Line" },
  { type: "text" as const, icon: Type, label: "Text" },
  { type: "delete" as const, icon: Delete, label: "Delete" },
];

const colors = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#000000",
  "#6B7280",
  "#FFFFFF",
];

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  currentTool,
  onToolChange,
  currentColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onSave,
  onClose,
  canUndo,
  canRedo,
  isCanvasReady = true,
  isSaving = false,
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.type}
                  onClick={() => onToolChange(tool.type)}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    currentTool === tool.type
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  title={tool.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-3 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={onSave}
              disabled={!isCanvasReady || isSaving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isSaving
                  ? "bg-blue-400 text-white"
                  : isCanvasReady
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              } transition-all`}
              title={isCanvasReady ? "Save" : "Canvas not ready"}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Annotation
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Color Palette and Stroke Width */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">
              Colors:
            </span>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  currentColor === color
                    ? "border-gray-400 scale-110"
                    : "border-gray-200 hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600 w-8">{strokeWidth}px</span>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              {currentTool === "select"
                ? "Click to select • Drag to move • Handles to resize"
                : "Draw on canvas"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

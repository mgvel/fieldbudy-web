"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Square,
  Circle,
  ArrowRight,
  Type,
  Save,
  X,
  MousePointer2 as SelectIcon,
  Move as MoveIcon,
  Undo,
  Trash2,
  Palette as ColorIcon,
  Move,
} from "lucide-react";

import { useHotkeys } from "react-hotkeys-hook";
import { Box, Button, Input, Tab, Tabs, TextField } from "@mui/material";

interface DrawingElement {
  id: string;
  type: "pen" | "rectangle" | "circle" | "arrow" | "text";
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isSelected?: boolean;
}

interface ImageAnnotatorProps {
  imageUrl: string;
  filename: string;
  isSaving: boolean;
  onSave: (file: File) => void;
  onClose: () => void;
}

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageUrl,
  filename,
  isSaving,
  onSave,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [tool, setTool] = useState<
    "select" | "move" | "pen" | "rectangle" | "circle" | "arrow" | "text"
  >("pen");
  const [color, setColor] = useState("#ff0000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(
    null
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [elementStart, setElementStart] = useState<DrawingElement | null>(null);
  const [undoStack, setUndoStack] = useState<DrawingElement[][]>([]);
  const imageRef = useRef(new Image());

  // Keyboard shortcuts
  useHotkeys("ctrl+z", () => handleUndo());
  useHotkeys("del, backspace", () => handleDeleteSelected());
  useHotkeys("esc", () => {
    setSelectedElementId(null);
    setTool("select");
  });

  // Initialize canvas and load image
  useEffect(() => {
    const img = imageRef.current;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        redrawCanvas();
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Save state to undo stack before making changes
  const saveToUndoStack = useCallback(() => {
    setUndoStack((prev) => [...prev, [...elements]]);
  }, [elements]);

  // Calculate element bounds
  const calculateBounds = useCallback((element: DrawingElement) => {
    if (element.points.length === 0) return null;

    const xs = element.points.map((p) => p.x);
    const ys = element.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, []);

  // Check if point is inside element bounds
  const isPointInElement = useCallback(
    (point: { x: number; y: number }, element: DrawingElement): boolean => {
      const bounds = element.bounds || calculateBounds(element);
      if (!bounds) return false;

      const padding = 10; // Add some padding for easier selection
      return (
        point.x >= bounds.x - padding &&
        point.x <= bounds.x + bounds.width + padding &&
        point.y >= bounds.y - padding &&
        point.y <= bounds.y + bounds.height + padding
      );
    },
    [calculateBounds]
  );

  // Get resize handle at point
  const getResizeHandle = useCallback(
    (point: { x: number; y: number }, bounds: any): string | null => {
      const handleSize = 8;
      const handles = [
        { name: "nw", x: bounds.x, y: bounds.y },
        { name: "ne", x: bounds.x + bounds.width, y: bounds.y },
        { name: "sw", x: bounds.x, y: bounds.y + bounds.height },
        { name: "se", x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { name: "n", x: bounds.x + bounds.width / 2, y: bounds.y },
        {
          name: "s",
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height,
        },
        { name: "w", x: bounds.x, y: bounds.y + bounds.height / 2 },
        {
          name: "e",
          x: bounds.x + bounds.width,
          y: bounds.y + bounds.height / 2,
        },
      ];

      for (const handle of handles) {
        if (
          Math.abs(point.x - handle.x) <= handleSize &&
          Math.abs(point.y - handle.y) <= handleSize
        ) {
          return handle.name;
        }
      }
      return null;
    },
    []
  );

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = imageRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => {
      drawElement(ctx, element);

      // Draw selection handles for selected element
      if (element.id === selectedElementId) {
        drawSelectionHandles(ctx, element);
      }
    });

    if (currentElement) {
      drawElement(ctx, currentElement);
    }
  }, [elements, currentElement, selectedElementId]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Draw selection handles
  const drawSelectionHandles = (
    ctx: CanvasRenderingContext2D,
    element: DrawingElement
  ) => {
    const bounds = element.bounds || calculateBounds(element);
    if (!bounds) return;

    ctx.save();
    ctx.strokeStyle = "#3B82F6";
    ctx.fillStyle = "#3B82F6";
    ctx.lineWidth = 2;

    // Draw selection border
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      bounds.x - 5,
      bounds.y - 5,
      bounds.width + 10,
      bounds.height + 10
    );
    ctx.setLineDash([]);

    // Draw resize handles
    const handleSize = 8;
    const handles = [
      { x: bounds.x, y: bounds.y },
      { x: bounds.x + bounds.width, y: bounds.y },
      { x: bounds.x, y: bounds.y + bounds.height },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      { x: bounds.x + bounds.width / 2, y: bounds.y },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      { x: bounds.x, y: bounds.y + bounds.height / 2 },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
    ];

    handles.forEach((handle) => {
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
      ctx.strokeRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });

    ctx.restore();
  };

  // Draw individual element
  const drawElement = (
    ctx: CanvasRenderingContext2D,
    element: DrawingElement
  ) => {
    ctx.save();
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const points = element.points;
    if (points.length === 0) return;

    switch (element.type) {
      case "pen":
        if (points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        }
        break;

      case "rectangle":
        if (points.length >= 2) {
          const [start, end] = points;
          const width = end.x - start.x;
          const height = end.y - start.y;
          ctx.strokeRect(start.x, start.y, width, height);
        }
        break;

      case "circle":
        if (points.length >= 2) {
          const [start, end] = points;
          const radius = Math.sqrt(
            (end.x - start.x) ** 2 + (end.y - start.y) ** 2
          );
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;

      case "arrow":
        if (points.length >= 2) {
          const [start, end] = points;
          drawArrow(ctx, start, end);
        }
        break;

      case "text":
        if (element.text && points.length > 0) {
          const fontSize = element.fontSize || element.strokeWidth * 3;
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = element.color;
          ctx.fillText(element.text, points[0].x, points[0].y);
        }
        break;
    }

    ctx.restore();
  };

  // Draw arrow helper
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const headLength = 20;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle - Math.PI / 6),
      end.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - headLength * Math.cos(angle + Math.PI / 6),
      end.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Transform element based on handle
  const transformElement = (
    element: DrawingElement,
    handle: string,
    delta: { x: number; y: number }
  ) => {
    const bounds = element.bounds || calculateBounds(element);
    if (!bounds) return element;

    let newBounds = { ...bounds };

    switch (handle) {
      case "nw":
        newBounds.x += delta.x;
        newBounds.y += delta.y;
        newBounds.width -= delta.x;
        newBounds.height -= delta.y;
        break;
      case "ne":
        newBounds.y += delta.y;
        newBounds.width += delta.x;
        newBounds.height -= delta.y;
        break;
      case "sw":
        newBounds.x += delta.x;
        newBounds.width -= delta.x;
        newBounds.height += delta.y;
        break;
      case "se":
        newBounds.width += delta.x;
        newBounds.height += delta.y;
        break;
      case "n":
        newBounds.y += delta.y;
        newBounds.height -= delta.y;
        break;
      case "s":
        newBounds.height += delta.y;
        break;
      case "w":
        newBounds.x += delta.x;
        newBounds.width -= delta.x;
        break;
      case "e":
        newBounds.width += delta.x;
        break;
    }

    // Prevent negative dimensions
    if (newBounds.width < 10) newBounds.width = 10;
    if (newBounds.height < 10) newBounds.height = 10;

    // Update element points based on new bounds
    let newPoints = [...element.points];

    if (
      element.type === "rectangle" ||
      element.type === "circle" ||
      element.type === "arrow"
    ) {
      if (element.type === "rectangle" || element.type === "arrow") {
        newPoints = [
          { x: newBounds.x, y: newBounds.y },
          {
            x: newBounds.x + newBounds.width,
            y: newBounds.y + newBounds.height,
          },
        ];
      } else if (element.type === "circle") {
        const centerX = newBounds.x + newBounds.width / 2;
        const centerY = newBounds.y + newBounds.height / 2;
        const radius = Math.min(newBounds.width, newBounds.height) / 2;
        newPoints = [
          { x: centerX, y: centerY },
          { x: centerX + radius, y: centerY },
        ];
      }
    } else if (element.type === "text") {
      newPoints = [
        { x: newBounds.x, y: newBounds.y + (element.fontSize || 20) },
      ];
    }

    return {
      ...element,
      points: newPoints,
      bounds: newBounds,
      fontSize:
        element.type === "text"
          ? Math.max(12, newBounds.height)
          : element.fontSize,
    };
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);

    if (tool === "select" || tool === "move") {
      // Check if clicking on selected element's resize handle
      if (selectedElementId) {
        const selectedElement = elements.find(
          (el) => el.id === selectedElementId
        );
        if (selectedElement) {
          const bounds =
            selectedElement.bounds || calculateBounds(selectedElement);
          if (bounds) {
            const handle = getResizeHandle(point, bounds);
            if (handle) {
              setIsResizing(true);
              setResizeHandle(handle);
              setDragStart(point);
              setElementStart(selectedElement);
              return;
            }
          }
        }
      }

      // Check if clicking on any element
      const clickedElement = elements
        .slice()
        .reverse()
        .find((element) => isPointInElement(point, element));

      if (clickedElement) {
        setSelectedElementId(clickedElement.id);

        // Start dragging
        setIsDragging(true);
        setDragStart(point);
        setElementStart(clickedElement);
      } else {
        setSelectedElementId(null);
      }
      return;
    }

    // Clear selection when drawing
    setSelectedElementId(null);
    setIsDrawing(true);

    if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        saveToUndoStack();
        const newElement: DrawingElement = {
          id: generateId(),
          type: "text",
          points: [{ x: point.x, y: point.y + fontSize }],
          color,
          strokeWidth,
          text,
          fontSize,
          bounds: {
            x: point.x,
            y: point.y,
            width: text.length * fontSize * 0.6,
            height: fontSize,
          },
        };
        setElements((prev) => [...prev, newElement]);
      }
      setIsDrawing(false);
      return;
    }

    const newElement: DrawingElement = {
      id: generateId(),
      type: tool,
      points: [point],
      color,
      strokeWidth,
    };

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);

    // Handle resizing
    if (isResizing && resizeHandle && elementStart && selectedElementId) {
      const delta = {
        x: point.x - dragStart.x,
        y: point.y - dragStart.y,
      };

      const transformedElement = transformElement(
        elementStart,
        resizeHandle,
        delta
      );
      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedElementId ? transformedElement : el
        )
      );
      return;
    }

    // Handle dragging
    if (isDragging && elementStart && selectedElementId) {
      const delta = {
        x: point.x - dragStart.x,
        y: point.y - dragStart.y,
      };

      const newPoints = elementStart.points.map((p) => ({
        x: p.x + delta.x,
        y: p.y + delta.y,
      }));

      const newBounds = elementStart.bounds
        ? {
            x: elementStart.bounds.x + delta.x,
            y: elementStart.bounds.y + delta.y,
            width: elementStart.bounds.width,
            height: elementStart.bounds.height,
          }
        : undefined;

      setElements((prev) =>
        prev.map((el) =>
          el.id === selectedElementId
            ? {
                ...el,
                points: newPoints,
                bounds: newBounds,
              }
            : el
        )
      );
      return;
    }

    // Handle drawing
    if (!isDrawing || !currentElement || tool === "select" || tool === "move")
      return;

    if (tool === "pen") {
      setCurrentElement((prev) =>
        prev
          ? {
              ...prev,
              points: [...prev.points, point],
            }
          : null
      );
    } else {
      setCurrentElement((prev) =>
        prev
          ? {
              ...prev,
              points: [prev.points[0], point],
            }
          : null
      );
    }
  };

  const handleMouseUp = () => {
    if (currentElement && isDrawing) {
      saveToUndoStack();
      const bounds = calculateBounds(currentElement);
      const elementWithBounds = bounds
        ? { ...currentElement, bounds }
        : currentElement;
      setElements((prev) => [...prev, elementWithBounds]);
      setCurrentElement(null);
    }

    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setElementStart(null);
  };

  // Update cursor based on tool and hover state
  const getCursor = () => {
    if (tool === "select" || tool === "move") {
      if (isResizing) return "nwse-resize";
      if (isDragging) return "move";
      return "default";
    }
    return "crosshair";
  };

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setElements(lastState);
      setUndoStack((prev) => prev.slice(0, -1));
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (selectedElementId) {
      saveToUndoStack();
      setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
      setSelectedElementId(null);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    // Create a temporary canvas to draw everything
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
  
    // Draw white background first (in case the image has transparency)
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  
    // Draw the original image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      tempCtx.drawImage(img, 0, 0);
      
      // Draw all the annotations - use 'elements' instead of 'objects'
      elements.forEach(element => drawElement(tempCtx, element));
      
      // Now export the temp canvas
      tempCanvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `annotated-${filename}`, { type: 'image/png' });
          onSave(file);
        }
      }, 'image/png');
    };
    
    img.src = imageUrl;
  
    // Handle potential CORS errors
    img.onerror = () => {
      // If we can't load the image due to CORS, just draw the annotations on white background
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      elements.forEach(element => drawElement(tempCtx, element));
      
      tempCanvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `annotated-${filename}`, { type: 'image/png' });
          onSave(file);
        }
      }, 'image/png');
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full h-full max-w-[1800px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Image Annotator</h2>
          <Button variant="ghost" onClick={onClose} className="text-red-500">
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
        </div>

        <Box
          display="flex"
          alignItems="center"
          gap={2}
          borderBottom={1}
          borderColor="divider"
          px={2}
          py={1}
        >
          {/* Tool Tabs */}
          <Tabs
            value={tool}
            onChange={(e, val) => setTool(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<SelectIcon size={16} />}
              iconPosition="top"
              label="Select"
              value="select"
            />
            {/* <Tab
              icon={<Move size={16} />}
              iconPosition="top"
              label="Move"
              value="move"
            /> */}
            <Tab
              icon={<Pen size={16} />}
              iconPosition="top"
              label="Pen"
              value="pen"
            />
            <Tab
              icon={<Square size={16} />}
              iconPosition="top"
              label="Rectangle"
              value="rectangle"
            />
            <Tab
              icon={<Circle size={16} />}
              iconPosition="top"
              label="Circle"
              value="circle"
            />
            <Tab
              icon={<ArrowRight size={16} />}
              iconPosition="top"
              label="Arrow"
              value="arrow"
            />
            <Tab
              icon={<Type size={16} />}
              iconPosition="top"
              label="Text"
              value="text"
            />
          </Tabs>

          {/* Controls */}
          <Box display="flex" alignItems="center" gap={2} ml={2}>
            {/* Color Picker */}
            <Box display="flex" alignItems="center" gap={1}>
              <ColorIcon size={16} />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 32,
                  height: 32,
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              />
            </Box>

            {/* Stroke Width */}
            <TextField
              label="Size"
              type="number"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              size="small"
              inputProps={{ min: 1, max: 20 }}
              sx={{ width: 80 }}
            />

            {/* Font Size (only for text) */}
            {tool === "text" && (
              <TextField
                label="Font"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                size="small"
                inputProps={{ min: 8, max: 72 }}
                sx={{ width: 80 }}
              />
            )}
          </Box>

          {/* Action Buttons */}
          <Box display="flex" alignItems="center" gap={1} ml="auto">
            <Button
              variant="outlined"
              onClick={handleUndo}
              startIcon={<Undo size={16} />}
            >
              Undo
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteSelected}
              disabled={!selectedElementId}
              startIcon={<Trash2 size={16} />}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
              startIcon={<Save size={16} />}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg shadow-md bg-white h-full"
            style={{ cursor: getCursor() }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setIsDrawing(false);
              setIsDragging(false);
              setIsResizing(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageAnnotator;

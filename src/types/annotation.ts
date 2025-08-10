export interface Point {
    x: number;
    y: number;
  }
  
  export interface DrawingElement {
    id: string;
    type: 'select' | 'pen' | 'marker' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text';
    points: Point[];
    color: string;
    strokeWidth: number;
    text?: string;
    opacity?: number;
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    fontSize?: number;
  }
  
  export interface AnnotationState {
    elements: DrawingElement[];
    currentTool: DrawingElement['type'];
    currentColor: string;
    strokeWidth: number;
    isDrawing: boolean;
    history: DrawingElement[][];
    historyIndex: number;
    selectedElementId: string | null;
    isTransforming: boolean;
    transformHandle: string | null;
  }
// Type definitions for LeatherColorSectionModal

export interface LeatherColorAssignment {
  x: number; // Percentage from left
  y: number; // Percentage from top
  leatherNumber: number; // 1, 2, or 3
  color: string;
}

export interface LeatherColorSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignments: LeatherColorAssignment[], leatherColors: string[], paintedImage?: string | null) => void;
  numberOfColors: number; // 2 or 3
  shoeImage: string | null; // The uploaded shoe image
  initialAssignments?: LeatherColorAssignment[];
  initialLeatherColors?: string[];
}

export interface ImageLoadingOptions {
  shoeImage: string;
  renderedImage: HTMLImageElement | null;
  assignments: LeatherColorAssignment[];
  getColorForLeather: (num: number) => string;
}


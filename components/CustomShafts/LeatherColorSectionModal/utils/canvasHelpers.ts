// Canvas manipulation utilities

import { LeatherColorAssignment } from '../types';

/**
 * Draw leather assignment markers on canvas
 * @param canvas - Canvas element
 * @param ctx - Canvas 2D context
 * @param assignments - Array of leather color assignments
 * @param getColorForLeather - Function to get color for leather number
 */
export const drawMarkersOnCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  assignments: LeatherColorAssignment[],
  getColorForLeather: (num: number) => string
): void => {
  assignments.forEach((assignment) => {
    const x = (assignment.x / 100) * canvas.width;
    const y = (assignment.y / 100) * canvas.height;
    const color = getColorForLeather(assignment.leatherNumber);

    // Draw marker circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Draw white border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw leather number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(assignment.leatherNumber.toString(), x, y);
  });
};

/**
 * Create canvas from image element
 * @param img - Image or canvas element
 * @returns Canvas and context, or null if failed
 */
export const createCanvasFromImage = (
  img: HTMLImageElement | HTMLCanvasElement
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null => {
  const canvas = document.createElement('canvas');
  const width = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const height = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  
  canvas.width = width || 800;
  canvas.height = height || 600;
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  
  return { canvas, ctx };
};

/**
 * Export canvas to data URL with CORS error handling
 * @param canvas - Canvas element
 * @returns Data URL string
 * @throws Error if canvas is tainted (CORS issue)
 */
export const exportCanvasToDataURL = (canvas: HTMLCanvasElement): string => {
  try {
    return canvas.toDataURL('image/png');
  } catch (error: any) {
    if (error.name === 'SecurityError') {
      throw new Error('CORS_ERROR: Canvas is tainted and cannot be exported');
    }
    throw error;
  }
};

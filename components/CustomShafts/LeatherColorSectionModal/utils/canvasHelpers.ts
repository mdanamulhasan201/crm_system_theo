// Canvas manipulation utilities

import { LeatherColorAssignment } from '../types';

/**
 * Draw leather assignment markers on canvas
 * @param canvas - Canvas element
 * @param ctx - Canvas 2D context
 * @param assignments - Array of leather color assignments
 * @param getColorForLeather - Function to get color for leather number
 */
/** Min/max marker size – slightly smaller so markers are visible but not too big */
const MARKER_RADIUS_MIN = 18;
const MARKER_RADIUS_MAX = 40;
const FONT_SIZE_MIN = 16;
const FONT_SIZE_MAX = 32;

export const drawMarkersOnCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  assignments: LeatherColorAssignment[],
  getColorForLeather: (num: number) => string
): void => {
  const shortSide = Math.min(canvas.width, canvas.height);
  const radius = Math.min(MARKER_RADIUS_MAX, Math.max(MARKER_RADIUS_MIN, shortSide * 0.045));
  const fontSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, Math.round(shortSide * 0.03)));
  const borderWidth = Math.max(2, Math.round(radius * 0.18));

  assignments.forEach((assignment) => {
    const x = (assignment.x / 100) * canvas.width;
    const y = (assignment.y / 100) * canvas.height;
    const color = getColorForLeather(assignment.leatherNumber);

    // Draw marker circle (larger so numbering is clearly visible)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw white border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = borderWidth;
    ctx.stroke();

    // Draw leather number (bigger font so it matches position and is readable)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${fontSize}px Arial`;
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

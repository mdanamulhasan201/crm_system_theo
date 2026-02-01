// Custom hook for canvas painting functionality

import { useRef } from 'react';
import toast from 'react-hot-toast';
import { LeatherColorAssignment } from '../types';
import { generatePaintedImage } from '../utils/imageLoading';

interface UseCanvasPaintingOptions {
  shoeImage: string | null;
  assignments: LeatherColorAssignment[];
  getColorForLeather: (num: number) => string;
}

/**
 * Custom hook for handling canvas painting logic
 * Manages image reference and painted image generation
 */
export const useCanvasPainting = ({ shoeImage, assignments, getColorForLeather }: UseCanvasPaintingOptions) => {
  const imageRef = useRef<HTMLDivElement | null>(null);

  /**
   * Generate painted image with error handling and user feedback
   * @returns Painted image data URL, or null if generation fails
   */
  const createPaintedImage = async (): Promise<string | null> => {
    if (!shoeImage || !imageRef.current) {
      return null;
    }

    const renderedImage = imageRef.current.querySelector('img') as HTMLImageElement;
    
    if (!renderedImage) {
      return null;
    }

    try {
      const result = await generatePaintedImage({
        shoeImage,
        renderedImage,
        assignments,
        getColorForLeather,
      });

      return result;
    } catch (error: any) {
      if (error?.message?.includes('CORS_ERROR')) {
        toast.success(
          'Ledertypen-Zuordnung gespeichert! (Bildmarkierung wegen Browser-Sicherheit übersprungen)',
          { duration: 5000 }
        );
      } else {
        toast.success(
          'Ledertypen-Zuordnung gespeichert! (Bildvorschau konnte nicht erstellt werden)',
          { duration: 4000 }
        );
      }
      
      return null;
    }
  };

  return {
    imageRef,
    createPaintedImage,
  };
};

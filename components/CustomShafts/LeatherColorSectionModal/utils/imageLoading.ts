// Image loading strategies for painted image generation

import { createCanvasFromImage, drawMarkersOnCanvas, exportCanvasToDataURL } from './canvasHelpers';
import { ImageLoadingOptions } from '../types';

/**
 * Strategy 1: Use Next.js optimized image (via /_next/image proxy)
 * This avoids CORS by proxying through Next.js server
 */
const loadNextJSOptimizedImage = (
  renderedImage: HTMLImageElement,
  options: ImageLoadingOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // SSR-safe check
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load image on server-side'));
      return;
    }
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const result = createCanvasFromImage(img);
        if (!result) {
          reject(new Error('Could not create canvas'));
          return;
        }
        
        const { canvas, ctx } = result;
        ctx.drawImage(img, 0, 0);
        drawMarkersOnCanvas(canvas, ctx, options.assignments, options.getColorForLeather);
        
        const dataUrl = exportCanvasToDataURL(canvas);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Image failed to load'));
    };
    
    img.src = renderedImage.src;
  });
};

/**
 * Strategy 2: Use already-rendered DOM image
 * Fast method using the image that's already visible on screen
 */
const loadRenderedDOMImage = (
  renderedImage: HTMLImageElement,
  options: ImageLoadingOptions
): string => {
  const result = createCanvasFromImage(renderedImage);
  if (!result) throw new Error('Could not create canvas');
  
  const { canvas, ctx } = result;
  ctx.drawImage(renderedImage, 0, 0);
  drawMarkersOnCanvas(canvas, ctx, options.assignments, options.getColorForLeather);
  
  return exportCanvasToDataURL(canvas);
};

/**
 * Strategy 3: Reload image with CORS headers
 * Last resort method that may fail if server doesn't support CORS
 */
const reloadImageWithCORS = (
  shoeImage: string,
  options: ImageLoadingOptions
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // SSR-safe check
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load image on server-side'));
      return;
    }
    
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const result = createCanvasFromImage(img);
        if (!result) {
          reject(new Error('Could not create canvas'));
          return;
        }
        
        const { canvas, ctx } = result;
        ctx.drawImage(img, 0, 0);
        drawMarkersOnCanvas(canvas, ctx, options.assignments, options.getColorForLeather);
        
        const dataUrl = exportCanvasToDataURL(canvas);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };
    
    img.src = shoeImage;
  });
};

/**
 * Main function: Generate painted image using best available strategy
 * Tries multiple strategies in order of reliability:
 * 1. Next.js optimized image (best - no CORS issues)
 * 2. Already-rendered DOM image (fast - may have CORS issues)
 * 3. Reload with CORS headers (last resort - may fail)
 * 
 * @param options - Image loading options
 * @returns Data URL of painted image, or null if all strategies fail
 */
export const generatePaintedImage = async (
  options: ImageLoadingOptions
): Promise<string | null> => {
  const { renderedImage, shoeImage } = options;
  
  // Strategy 1: Next.js optimized image (best option)
  if (renderedImage?.src?.includes('/_next/image')) {
    try {
      return await loadNextJSOptimizedImage(renderedImage, options);
    } catch (error) {
      // Silent fallback to next strategy
    }
  }
  
  // Strategy 2: Already-rendered DOM image (fast option)
  if (renderedImage?.complete && renderedImage.naturalWidth > 0) {
    try {
      return loadRenderedDOMImage(renderedImage, options);
    } catch (error: any) {
      if (error.message?.includes('CORS_ERROR')) {
        throw error;
      }
      // Silent fallback to next strategy
    }
  }
  
  // Strategy 3: Reload with CORS (last resort)
  try {
    return await reloadImageWithCORS(shoeImage, options);
  } catch (error) {
    return null;
  }
};

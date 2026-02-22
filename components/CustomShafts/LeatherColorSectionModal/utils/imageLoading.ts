// Image loading strategies for painted image generation

import { createCanvasFromImage, drawMarkersOnCanvas, exportCanvasToDataURL } from './canvasHelpers';
import { ImageLoadingOptions } from '../types';

/**
 * Strategy 0: Fetch image via app proxy (avoids CORS, canvas stays untainted)
 * Use when shoeImage is an absolute http(s) URL so we always get a paintable image for payload.
 */
const loadViaProxy = (shoeImage: string, options: ImageLoadingOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load image on server-side'));
      return;
    }
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(shoeImage)}`;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Image loading timeout'));
    }, 15000);

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const result = createCanvasFromImage(img);
        if (!result) {
          if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
          reject(new Error('Could not create canvas'));
          return;
        }
        const { canvas, ctx } = result;
        ctx.drawImage(img, 0, 0);
        drawMarkersOnCanvas(canvas, ctx, options.assignments, options.getColorForLeather);
        const dataUrl = exportCanvasToDataURL(canvas);
        if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        resolve(dataUrl);
      } catch (error) {
        if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image via proxy'));
    };

    // Fetch via proxy (use absolute URL for relative paths)
    const urlToFetch = getAbsoluteImageUrl(shoeImage);
    const proxyUrlToUse = `/api/proxy-image?url=${encodeURIComponent(urlToFetch)}`;
    fetch(proxyUrlToUse)
      .then((r) => {
        if (!r.ok) throw new Error('Proxy fetch failed');
        return r.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        img.src = blobUrl;
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
};

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
 * Check if string is an absolute HTTP(S) URL (needs proxy to avoid CORS)
 */
const isAbsoluteImageUrl = (s: string): boolean =>
  typeof s === 'string' && (s.startsWith('http://') || s.startsWith('https://'));

/**
 * Get absolute URL for proxy (handles relative paths like /api/... or /uploads/...)
 */
const getAbsoluteImageUrl = (shoeImage: string): string => {
  if (isAbsoluteImageUrl(shoeImage)) return shoeImage;
  if (typeof window !== 'undefined' && shoeImage.startsWith('/')) {
    return `${window.location.origin}${shoeImage}`;
  }
  return shoeImage;
};

/**
 * Main function: Generate painted image using best available strategy
 * Tries multiple strategies so the payload always gets the paint image when possible:
 * 0. Proxy (for http/https URLs - avoids CORS, ensures payload gets image)
 * 1. Next.js optimized image (no CORS issues)
 * 2. Already-rendered DOM image (fast - may taint canvas)
 * 3. Reload with CORS headers (last resort)
 *
 * @param options - Image loading options
 * @returns Data URL of painted image, or null if all strategies fail
 */
export const generatePaintedImage = async (
  options: ImageLoadingOptions
): Promise<string | null> => {
  const { renderedImage, shoeImage } = options;

  // Strategy 0: For external or relative URLs, use proxy first so canvas is never tainted and payload gets image
  const useProxyFirst = isAbsoluteImageUrl(shoeImage) || (typeof shoeImage === 'string' && shoeImage.startsWith('/'));
  if (useProxyFirst) {
    try {
      return await loadViaProxy(shoeImage, options);
    } catch (error) {
      // Fall through to other strategies
    }
  }

  // Strategy 1: Next.js optimized image (best option)
  if (renderedImage?.src?.includes('/_next/image')) {
    try {
      return await loadNextJSOptimizedImage(renderedImage, options);
    } catch (error) {
      // Silent fallback to next strategy
    }
  }

  // Strategy 2: Already-rendered DOM image (fast option; data URLs are same-origin)
  if (renderedImage?.complete && renderedImage.naturalWidth > 0) {
    try {
      return loadRenderedDOMImage(renderedImage, options);
    } catch (error: any) {
      if (error.message?.includes('CORS_ERROR')) {
        // For data URLs we don't expect CORS; for external URLs try proxy again if not tried
        if (isAbsoluteImageUrl(shoeImage)) {
          try {
            return await loadViaProxy(shoeImage, options);
          } catch {
            // ignore
          }
        }
        throw error;
      }
      // Silent fallback to next strategy
    }
  }

  // Strategy 3: Reload with CORS (last resort)
  try {
    return await reloadImageWithCORS(shoeImage, options);
  } catch (error) {
    // Final attempt: proxy for external URL
    if (isAbsoluteImageUrl(shoeImage)) {
      try {
        return await loadViaProxy(shoeImage, options);
      } catch {
        // ignore
      }
    }
    return null;
  }
};

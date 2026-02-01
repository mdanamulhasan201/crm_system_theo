'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Pen, Eraser, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ZipperPlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageDataUrl: string) => void;
  imageUrl: string | null;
  savedDrawing?: string | null;
}

export default function ZipperPlacementModal({
  isOpen,
  onClose,
  onSave,
  imageUrl,
  savedDrawing,
}: ZipperPlacementModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null); // Canvas overlay for drawing only
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement | null>(null); // Offscreen canvas for drawings
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'pen' | 'eraser'>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, displayWidth: 0, displayHeight: 0 });
  const [hasDrawing, setHasDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update canvas overlay to show drawing
  const updateCanvasOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const drawingLayer = drawingLayerRef.current;
    
    if (!canvas || !ctx || !drawingLayer) return;

    // Clear canvas overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw only the drawing layer (transparent background)
    ctx.drawImage(drawingLayer, 0, 0, canvas.width, canvas.height);
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setIsDrawing(false);
      setDrawingMode('pen');
      setHasDrawing(false);
      setIsSaving(false);
      drawingLayerRef.current = null;
      imageRef.current = null;
      setImageDimensions({ width: 0, height: 0, displayWidth: 0, displayHeight: 0 });
    }
  }, [isOpen]);

  // Get mouse/touch coordinates
  const getCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Start drawing
  const startDrawing = (clientX: number, clientY: number) => {
    if (!imageLoaded) return;
    
    setIsDrawing(true);
    const drawingLayer = drawingLayerRef.current;
    const drawingCtx = drawingLayer?.getContext('2d');
    if (!drawingLayer || !drawingCtx) return;

    const { x, y } = getCoordinates(clientX, clientY);
    drawingCtx.beginPath();
    drawingCtx.moveTo(x, y);
  };

  // Draw line
  const draw = (clientX: number, clientY: number) => {
    if (!isDrawing || !imageLoaded) return;

    const drawingLayer = drawingLayerRef.current;
    const drawingCtx = drawingLayer?.getContext('2d');
    if (!drawingLayer || !drawingCtx) return;

    const { x, y } = getCoordinates(clientX, clientY);

    if (drawingMode === 'pen') {
      drawingCtx.globalCompositeOperation = 'source-over';
      drawingCtx.strokeStyle = '#FF0000';
      drawingCtx.lineWidth = lineWidth;
      drawingCtx.lineCap = 'round';
      drawingCtx.lineJoin = 'round';
      drawingCtx.lineTo(x, y);
      drawingCtx.stroke();
    } else {
      // Eraser - erase only from drawing layer
      drawingCtx.globalCompositeOperation = 'destination-out';
      drawingCtx.lineWidth = lineWidth * 2;
      drawingCtx.lineCap = 'round';
      drawingCtx.lineJoin = 'round';
      drawingCtx.lineTo(x, y);
      drawingCtx.stroke();
    }
    
    // Mark that drawing has been done
    setHasDrawing(true);
    
    // Update canvas overlay to show drawing
    updateCanvasOverlay();
  };

  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Clear all drawings (keep base image)
  const clearDrawing = () => {
    const drawingLayer = drawingLayerRef.current;
    const drawingCtx = drawingLayer?.getContext('2d');
    if (!drawingLayer || !drawingCtx) return;

    // Clear drawing layer only
    drawingCtx.clearRect(0, 0, drawingLayer.width, drawingLayer.height);
    
    // Mark that no drawing exists
    setHasDrawing(false);
    
    // Update canvas overlay
    updateCanvasOverlay();
  };

  // Check if drawing layer has any non-transparent pixels
  const checkIfDrawingExists = (): boolean => {
    const drawingLayer = drawingLayerRef.current;
    if (!drawingLayer) return false;

    const ctx = drawingLayer.getContext('2d');
    if (!ctx) return false;

    const imageData = ctx.getImageData(0, 0, drawingLayer.width, drawingLayer.height);
    const data = imageData.data;

    // Check if any pixel has non-zero alpha (meaning something was drawn)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) {
        return true; // Found a non-transparent pixel
      }
    }

    return false; // No drawing found
  };

  // Handle image load - setup dimensions and canvas
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!imageDimensions.width) {
      const maxDisplayWidth = 800;
      const maxDisplayHeight = 600;
      let displayWidth = img.width;
      let displayHeight = img.height;
      
      if (displayWidth > maxDisplayWidth || displayHeight > maxDisplayHeight) {
        const scale = Math.min(maxDisplayWidth / displayWidth, maxDisplayHeight / displayHeight);
        displayWidth = img.width * scale;
        displayHeight = img.height * scale;
      }
      
      setImageDimensions({
        width: img.width,
        height: img.height,
        displayWidth,
        displayHeight,
      });
      
      // Setup canvas overlay
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
      }
      
      // Initialize drawing layer
      const drawingLayer = document.createElement('canvas');
      drawingLayer.width = img.width;
      drawingLayer.height = img.height;
      drawingLayerRef.current = drawingLayer;
      
      // Load saved drawing if exists
      if (savedDrawing) {
        const savedImg = new window.Image();
        savedImg.onload = () => {
          const drawingCtx = drawingLayer.getContext('2d');
          if (drawingCtx) {
            drawingCtx.drawImage(savedImg, 0, 0, img.width, img.height);
            updateCanvasOverlay();
            setHasDrawing(true);
          }
          setImageLoaded(true);
        };
        savedImg.onerror = () => {
          updateCanvasOverlay();
          setImageLoaded(true);
        };
        savedImg.src = savedDrawing;
      } else {
        updateCanvasOverlay();
        setImageLoaded(true);
      }
    }
  };

  // Generate composite image - optimized to avoid CORS errors
  const generateCompositeImage = async (): Promise<{ compositeImage: string | null; drawingOnly: string | null }> => {
    const drawingLayer = drawingLayerRef.current;
    const img = imageRef.current;
    
    if (!drawingLayer || !imageUrl) {
      return { compositeImage: null, drawingOnly: null };
    }

    // Always save the drawing layer as fallback
    const drawingOnly = drawingLayer.toDataURL('image/png');

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = imageDimensions.width;
    compositeCanvas.height = imageDimensions.height;
    const compositeCtx = compositeCanvas.getContext('2d', { willReadFrequently: true });
    
    if (!compositeCtx) {
      return { compositeImage: null, drawingOnly };
    }

    // Helper function to check if image is from same origin
    const isSameOrigin = (url: string): boolean => {
      try {
        const imageOrigin = new URL(url, window.location.href).origin;
        const currentOrigin = window.location.origin;
        return imageOrigin === currentOrigin;
      } catch {
        return false;
      }
    };

    return new Promise((resolve) => {
      // Strategy 1: Try using already-loaded DOM image (only for same-origin images)
      if (isSameOrigin(imageUrl) && img && img.complete && img.naturalWidth > 0) {
        try {
          compositeCtx.drawImage(img, 0, 0, compositeCanvas.width, compositeCanvas.height);
          compositeCtx.drawImage(drawingLayer, 0, 0, compositeCanvas.width, compositeCanvas.height);
          const dataUrl = compositeCanvas.toDataURL('image/png');
          resolve({ compositeImage: dataUrl, drawingOnly });
          return;
        } catch (error: any) {
          // Continue to cross-origin strategy
        }
      }

      // For cross-origin images: Use crossOrigin='anonymous' approach directly
      // This works for S3 with proper CORS headers
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      
      const timeoutId = setTimeout(() => {
        // Timeout - return drawing only
        resolve({ compositeImage: null, drawingOnly });
      }, 5000);
      
      baseImg.onload = () => {
        clearTimeout(timeoutId);
        try {
          compositeCtx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
          compositeCtx.drawImage(baseImg, 0, 0, compositeCanvas.width, compositeCanvas.height);
          compositeCtx.drawImage(drawingLayer, 0, 0, compositeCanvas.width, compositeCanvas.height);
          const dataUrl = compositeCanvas.toDataURL('image/png');
          resolve({ compositeImage: dataUrl, drawingOnly });
        } catch (error: any) {
          // Failed - return drawing only
          resolve({ compositeImage: null, drawingOnly });
        }
      };
      
      baseImg.onerror = () => {
        clearTimeout(timeoutId);
        // Failed to load - return drawing only
        resolve({ compositeImage: null, drawingOnly });
      };
      
      // Add cache buster to ensure fresh load
      const cacheBuster = `?t=${Date.now()}`;
      baseImg.src = imageUrl.includes('?') ? `${imageUrl}&t=${Date.now()}` : `${imageUrl}${cacheBuster}`;
    });
  };

  // Save drawing - create composite image
  const handleSave = async () => {
    const drawingLayer = drawingLayerRef.current;
    
    if (!drawingLayer) return;

    // Check if any drawing has been done
    const drawingExists = checkIfDrawingExists() || hasDrawing;
    
    if (!drawingExists) {
      toast.error('Bitte markieren Sie die Position des Reißverschlusses.');
      return;
    }

    setIsSaving(true);

    try {
      // Try to generate composite image (base image + drawing)
      const result = await generateCompositeImage();
      
      if (result.compositeImage) {
        // Successfully created composite image (shoe + drawing combined)
        toast.success('Reißverschluss-Position gespeichert!');
        onSave(result.compositeImage);
        handleClose();
      } else if (result.drawingOnly) {
        // Fallback: save drawing only
        toast.success(
          'Zeichnung gespeichert! Hinweis: Nur die Markierung wurde gespeichert.',
          { duration: 4000 }
        );
        onSave(result.drawingOnly);
        handleClose();
      } else {
        toast.error('Fehler beim Speichern der Zeichnung.');
      }
    } catch (error: any) {
      console.error('Error saving zipper drawing:', error);
      toast.error('Fehler beim Speichern der Zeichnung.');
    } finally {
      setIsSaving(false);
    }
  };

  // Close modal
  const handleClose = () => {
    if (!isSaving) {
      setDrawingMode('pen');
      setIsDrawing(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-semibold">
              Position des Reißverschlusses festlegen
            </DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Da unser Standardmodell keinen Reißverschluss hat, benötigen wir Ihre Markierung, um die gewünschte Position korrekt umzusetzen. Zeichnen Sie den Verlauf des Reißverschlusses direkt auf dem Schuhbild ein.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description text under title */}
          <p className="text-sm text-gray-700">
            Bitte zeichnen Sie ein, wo der Reißverschluss am Schuh angebracht werden soll.
          </p>

          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="relative border border-gray-300 rounded-lg overflow-auto bg-gray-100 flex items-center justify-center min-h-[400px]"
          >
            {!imageUrl ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                No image available
              </div>
            ) : (
              <>
                {/* Loading overlay */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
                    <div className="text-gray-400">Bild wird geladen...</div>
                  </div>
                )}
                
                {/* Base image displayed using img tag - always visible */}
                {imageUrl && (
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Shoe"
                    className="relative z-0 max-w-full h-auto max-h-[600px] object-contain"
                    style={{ 
                      pointerEvents: 'none',
                      display: 'block',
                      visibility: 'visible',
                      opacity: 1,
                      width: 'auto',
                      height: 'auto'
                    }}
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      // Still allow drawing even if image fails to load
                      setImageLoaded(true);
                    }}
                  />
                )}
                
                {/* Canvas overlay for drawing (positioned absolutely on top of image) */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (imageLoaded) {
                      startDrawing(e.clientX, e.clientY);
                    }
                  }}
                  onMouseMove={(e) => {
                    e.preventDefault();
                    if (imageLoaded) {
                      draw(e.clientX, e.clientY);
                    }
                  }}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    if (imageLoaded) {
                      const touch = e.touches[0];
                      startDrawing(touch.clientX, touch.clientY);
                    }
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    if (imageLoaded) {
                      const touch = e.touches[0];
                      draw(touch.clientX, touch.clientY);
                    }
                  }}
                  onTouchEnd={stopDrawing}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair touch-none z-10"
                  style={{ 
                    pointerEvents: imageLoaded ? 'auto' : 'none',
                    display: imageLoaded ? 'block' : 'none'
                  }}
                />
              </>
            )}
          </div>

          {/* Drawing Tools */}
          {imageLoaded && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={drawingMode === 'pen' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingMode('pen')}
                  className="gap-2"
                >
                  <Pen className="w-4 h-4" />
                  Pen
                </Button>
                <Button
                  type="button"
                  variant={drawingMode === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingMode('eraser')}
                  className="gap-2"
                >
                  <Eraser className="w-4 h-4" />
                  Eraser
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Line Width:</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-600 w-8">{lineWidth}px</span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearDrawing}
                className="ml-auto"
              >
                Clear Drawing
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!imageLoaded || isSaving}
            className="bg-black text-white hover:bg-gray-800 min-w-[100px]"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <svg 
                  className="animate-spin h-4 w-4 text-white" 
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
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Saving...</span>
              </div>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

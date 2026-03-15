'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, RotateCw, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

const TOOLBAR_HEIGHT = 56;
const PADDING = 32;

interface FullscreenImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageAlt: string;
}

export default function FullscreenImageModal({
    isOpen,
    onClose,
    imageUrl,
    imageAlt,
}: FullscreenImageModalProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [rotation, setRotation] = useState(0); // Rotation in degrees: 0, 90, 180, 270
    const [zoom, setZoom] = useState(1); // Zoom scale factor (1.0 = 100%)
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imageAreaRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });

    const MIN_ZOOM = 0.1; // 10% minimum zoom
    const MAX_ZOOM = 5; // 500% maximum zoom
    const ZOOM_STEP = 0.25; // 25% zoom increment

    useEffect(() => {
        if (isOpen && imageUrl) {
            const img = new Image();
            img.onload = () => {
                setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                setImageLoaded(true);
            };
            img.onerror = () => {
                setImageLoaded(false);
            };
            img.src = imageUrl;
        } else {
            setImageLoaded(false);
            setImageDimensions(null);
            setRotation(0);
            setZoom(1);
            setPan({ x: 0, y: 0 });
        }
    }, [isOpen, imageUrl]);

    // Track viewport size for device-wise image sizing
    useEffect(() => {
        if (!isOpen) return;
        const updateSize = () => setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [isOpen]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
    };

    // Native wheel with passive: false so preventDefault works (mouse wheel zoom)
    useEffect(() => {
        const el = imageAreaRef.current;
        if (!el || !isOpen) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [isOpen]);

    // Stop drag when mouse released outside (e.g. over toolbar)
    useEffect(() => {
        const onGlobalMouseUp = () => {
            isDraggingRef.current = false;
            setIsDragging(false);
        };
        window.addEventListener('mouseup', onGlobalMouseUp);
        return () => window.removeEventListener('mouseup', onGlobalMouseUp);
    }, []);

    const rotateClockwise = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const rotateCounterClockwise = () => {
        setRotation((prev) => (prev - 90 + 360) % 360);
    };

    const zoomIn = () => {
        setZoom((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
    };

    const zoomOut = () => {
        setZoom((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
    };

    const resetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStartRef.current = {
            clientX: e.clientX,
            clientY: e.clientY,
            panX: pan.x,
            panY: pan.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current) return;
        setPan({
            x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.clientX),
            y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.clientY),
        });
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    // Device-wise image size: fit to viewport; wrapper size = rotated bounding box (no extra modal width)
    const imageDisplay = useMemo(() => {
        if (!imageDimensions || viewportSize.width <= 0 || viewportSize.height <= 0) return null;
        const { width: nw, height: nh } = imageDimensions;
        const availableW = viewportSize.width - PADDING * 2;
        const availableH = viewportSize.height - TOOLBAR_HEIGHT - PADDING * 2;
        const scaleFit = Math.min(availableW / nw, availableH / nh, 1);
        const displayedW = nw * scaleFit;
        const displayedH = nh * scaleFit;
        const is90or270 = rotation === 90 || rotation === 270;
        const wrapperW = is90or270 ? displayedH : displayedW;
        const wrapperH = is90or270 ? displayedW : displayedH;
        return { displayedW, displayedH, wrapperW, wrapperH };
    }, [imageDimensions, viewportSize, rotation]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="!w-screen !max-w-none !h-screen !max-h-screen p-0 gap-0 bg-black/40 shadow-none border-0 m-0 rounded-none [&_[data-slot='dialog-close']]:hidden"
            >
                <DialogTitle className="sr-only">1:1 Bildansicht - {imageAlt}</DialogTitle>
                <div className="relative w-full h-full flex flex-col overflow-hidden" ref={containerRef}>
                    {/* Toolbar - fixed at top center, modal never rotates so no counter-rotate */}
                    <div
                        className="fixed top-4 left-1/2 z-[100] flex items-center gap-2 flex-wrap pointer-events-auto"
                        style={{ transform: 'translateX(-50%)' }}
                    >
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md p-1">
                            <Button
                                onClick={zoomOut}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-white hover:bg-black/50 h-8 w-8 p-0"
                                title="Verkleinern"
                                disabled={zoom <= MIN_ZOOM}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-white text-xs font-medium px-2 min-w-[3rem] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button
                                onClick={zoomIn}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-white hover:bg-black/50 h-8 w-8 p-0"
                                title="Vergrößern"
                                disabled={zoom >= MAX_ZOOM}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={resetZoom}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-white hover:bg-black/50 h-8 px-2 text-xs"
                                title="Zoom zurücksetzen (100%)"
                            >
                                1:1
                            </Button>
                        </div>
                        {/* Rotation Controls */}
                        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md p-1">
                            <Button
                                onClick={rotateCounterClockwise}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-white hover:bg-black/50 h-8 w-8 p-0"
                                title="Gegen den Uhrzeigersinn drehen (90°)"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={rotateClockwise}
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer text-white hover:bg-black/50 h-8 w-8 p-0"
                                title="Im Uhrzeigersinn drehen (90°)"
                            >
                                <RotateCw className="w-4 h-4" />
                            </Button>
                        </div>
                        {/* Close Button */}
                        <Button
                            onClick={onClose}
                            variant="default"
                            size="sm"
                            className="cursor-pointer bg-black/70 hover:bg-black/90 text-white shadow-lg backdrop-blur-sm h-8 w-8 p-0"
                            title="Schließen"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                
                    {/* Image: no scrollbars; pan with mouse drag; wheel = zoom */}
                    <div
                        ref={imageAreaRef}
                        className="w-full h-full flex items-center justify-center overflow-hidden p-4 select-none"
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onWheel={handleWheel}
                    >
                        {imageLoaded && imageDimensions && imageDisplay ? (
                            <div
                                className="flex items-center justify-center shrink-0"
                                style={{
                                    width: imageDisplay.wrapperW,
                                    height: imageDisplay.wrapperH,
                                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                }}
                            >
                                <img
                                    src={imageUrl}
                                    alt={imageAlt}
                                    className="block pointer-events-none"
                                    draggable={false}
                                    style={{
                                        width: imageDisplay.displayedW,
                                        height: imageDisplay.displayedH,
                                        imageRendering: 'auto',
                                        objectFit: 'none',
                                        objectPosition: 'center',
                                        transform: `rotate(${rotation}deg) scale(${zoom})`,
                                        transformOrigin: 'center center',
                                        transition: 'transform 0.2s ease-in-out',
                                    }}
                                    onError={(e) => {
                                        console.error('Image failed to load:', imageUrl);
                                        const target = e.currentTarget;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('.error-message')) {
                                            const errorMsg = document.createElement('p');
                                            errorMsg.className = 'text-white error-message text-center';
                                            errorMsg.textContent = 'Bild konnte nicht geladen werden';
                                            parent.appendChild(errorMsg);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, RotateCw, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface FullscreenImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageAlt: string;
}

const DEFAULT_ZOOM = 0.75; // 75% default zoom

export default function FullscreenImageModal({
    isOpen,
    onClose,
    imageUrl,
    imageAlt,
}: FullscreenImageModalProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [rotation, setRotation] = useState(0); // Rotation in degrees: 0, 90, 180, 270
    const [zoom, setZoom] = useState(DEFAULT_ZOOM); // Zoom scale factor
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
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
            setZoom(DEFAULT_ZOOM);
            setPan({ x: 0, y: 0 });
        }
    }, [isOpen, imageUrl]);

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
        setZoom(DEFAULT_ZOOM);
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
                                title="Zoom zurücksetzen (75%)"
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

                    {/* Image: original size (1:1), pan with mouse drag; wheel = zoom */}
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
                        {imageLoaded && imageDimensions ? (
                            <div
                                className="flex items-center justify-center shrink-0"
                                style={{
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
                                        width: imageDimensions.width,
                                        height: imageDimensions.height,
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


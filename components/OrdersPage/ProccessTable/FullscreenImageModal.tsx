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
    const containerRef = useRef<HTMLDivElement>(null);

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
            setRotation(0); // Reset rotation when modal closes or image changes
            setZoom(1); // Reset zoom when modal closes or image changes
        }
    }, [isOpen, imageUrl]);

    // Mouse wheel zoom support
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
                setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
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
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                className="w-screen max-w-none h-screen max-h-screen p-0 gap-0 bg-white/95 border-0 m-0 rounded-none [&_[data-slot='dialog-close']]:hidden transition-transform duration-300"
                style={{
                    transform: `rotate(${rotation}deg)`,
                }}
            >
                <DialogTitle className="sr-only">1:1 Bildansicht - {imageAlt}</DialogTitle>
                <div className="relative w-full h-full flex flex-col overflow-hidden" ref={containerRef}>
                    {/* Toolbar with controls - Always fixed at top center of viewport, counter-rotated */}
                    <div 
                        className="fixed top-4 left-1/2 z-[100] flex items-center gap-2 flex-wrap transition-transform duration-300 pointer-events-auto"
                        style={{
                            transform: `translateX(-50%) translateY(0) rotate(-${rotation}deg)`,
                            transformOrigin: 'center center',
                        }}
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
                
                    {/* Image at 1:1 original size - perfect pixel display */}
                    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                        {imageLoaded && imageDimensions ? (
                            <img
                                src={imageUrl}
                                alt={imageAlt}
                                className="max-w-none max-h-none min-w-0 min-h-0"
                                style={{
                                    width: `${imageDimensions.width}px`,
                                    height: `${imageDimensions.height}px`,
                                    minWidth: `${imageDimensions.width}px`,
                                    minHeight: `${imageDimensions.height}px`,
                                    maxWidth: `${imageDimensions.width}px`,
                                    maxHeight: `${imageDimensions.height}px`,
                                    imageRendering: 'auto',
                                    display: 'block',
                                    objectFit: 'none',
                                    objectPosition: 'center',
                                    flexShrink: 0,
                                    transform: `scale(${zoom})`,
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


'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
        }
    }, [isOpen, imageUrl]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-screen max-w-none h-screen max-h-screen p-0 gap-0 bg-white/95 border-0 m-0 rounded-none [&_[data-slot='dialog-close']]:hidden">
                <DialogTitle className="sr-only">1:1 Bildansicht - {imageAlt}</DialogTitle>
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                
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
                                    flexShrink: 0
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


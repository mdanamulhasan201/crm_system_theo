'use client';

import React from 'react';
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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-screen max-w-none max-h-[90vh] p-0 gap-0 bg-white border-0 m-0 rounded-none [&_[data-slot='dialog-close']]:hidden">
                <DialogTitle className="sr-only">1:1 Bildansicht - {imageAlt}</DialogTitle>
                <div className="relative w-full max-h-[90vh] flex items-center justify-center p-4 overflow-hidden">
                    {/* Close Button */}
                 
                    
                    {/* Image at 1:1 original size - with max height constraint */}
                    <div className="w-full h-full max-h-[calc(90vh-2rem)] flex items-center justify-center overflow-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt={imageAlt}
                            className="max-h-full w-auto h-auto"
                            style={{
                                maxWidth: 'none',
                                objectFit: 'contain',
                                imageRendering: 'auto'
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
                </div>
            </DialogContent>
        </Dialog>
    );
}


'use client';

import React from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import legImage from '@/public/Kunden/legnew.png';

export interface ExternFertigenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLeistenJetztBestellen?: () => void;
    onLeistenUndHalbprobeBestellen?: () => void;
}

export default function ExternFertigenModal({
    open,
    onOpenChange,
    onLeistenJetztBestellen,
    onLeistenUndHalbprobeBestellen,
}: ExternFertigenModalProps) {
    const handleLeistenJetzt = () => {
        onLeistenJetztBestellen?.();
        onOpenChange(false);
    };
    const handleLeistenUndHalbprobe = () => {
        onLeistenUndHalbprobeBestellen?.();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl sm:max-w-xl! [&>button]:right-4 [&>button]:top-4 [&>button]:text-gray-500 [&>button]:hover:text-gray-700"
            >
                <div className="p-6 pt-10 pb-8">
                    {/* Image – no circle */}
                    <div className="flex justify-center">
                        <div className="w-48">
                            <Image
                                src={legImage}
                                alt="Leisten"
                                className="object-contain w-full h-full"
                                width={200}
                                height={200}
                            />
                        </div>
                    </div>

                    <DialogTitle className="mt-6 text-center text-xl font-bold tracking-tight text-[#62A07C]">
                        Möchten Sie die Halbprobe jetzt direkt beauftragen?
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="mt-4 space-y-3 text-center text-sm text-gray-600">
                            
                            <p>Die Fertigung startet anschließend ohne Verzögerung.“</p>
                            
                        </div>
                    </DialogDescription>

                    {/* CTA Buttons – green, rounded, same design */}
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-5">
                        <button
                            type="button"
                            onClick={handleLeistenJetzt}
                            className={cn(
                                'flex flex-1 items-center cursor-pointer justify-center rounded-lg py-3.5 px-6 text-xs font-semibold uppercase tracking-wide text-white',
                                'bg-[#62A07C] hover:bg-[#4A8A5F] transition-all duration-200'
                            )}
                        >
                            Später bestellen
                        </button>
                        <button
                            type="button"
                            onClick={handleLeistenUndHalbprobe}
                            className={cn(
                                'flex flex-1 items-center cursor-pointer justify-center rounded-lg py-3.5 px-6 text-xs font-semibold uppercase tracking-wide text-white',
                                'bg-[#62A07C] hover:bg-[#4A8A5F] transition-all duration-200'
                            )}
                        >
                            Leisten + Halbprobe bestellen
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

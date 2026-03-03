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
                className="overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl ring-1 ring-gray-200/90 sm:max-w-xl [&>button]:right-5 [&>button]:top-5 [&>button]:text-gray-400 [&>button]:hover:text-gray-600 [&>button]:hover:bg-gray-100 [&>button]:rounded-full"
            >
                <div className="bg-gradient-to-b from-gray-50/50 to-white p-6 pt-10 pb-8">
                    <div className="flex justify-center">
                        <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-gray-100">
                            <Image
                                src={legImage}
                                alt="Leisten"
                                className="object-contain w-full h-full"
                                width={200}
                                height={200}
                            />
                        </div>
                    </div>

                    <DialogTitle className="mt-7 text-center text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                        Möchten Sie die Halbprobe jetzt direkt beauftragen?
                    </DialogTitle>
                    <DialogDescription asChild>
                        <p className="mt-3 text-center text-sm leading-relaxed text-gray-600">
                            Die Fertigung startet anschließend ohne Verzögerung.
                        </p>
                    </DialogDescription>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                        <button
                            type="button"
                            onClick={handleLeistenJetzt}
                            className={cn(
                                'flex flex-1 items-center justify-center rounded-xl py-3.5 px-6 text-sm font-semibold transition-all cursor-pointer',
                                'bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300'
                            )}
                        >
                            Später bestellen
                        </button>
                        <button
                            type="button"
                            onClick={handleLeistenUndHalbprobe}
                            className={cn(
                                'flex flex-1 items-center justify-center rounded-xl py-3.5 px-6 text-sm font-semibold text-white shadow-md transition-all cursor-pointer',
                                'bg-[#62A07C] hover:bg-[#4A8A5F] hover:shadow-lg hover:-translate-y-0.5'
                            )}
                        >
                            Halbprobe bestellen
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import React from 'react';
import { Package, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import img from '@/public/images/massschuhauftraege/img.png';
import Image from 'next/image';

export interface LeistenBestellenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLeistenJetztBestellen?: () => void;
    onLeistenUndHalbprobeBestellen?: () => void;
}

export default function LeistenBestellenModal({
    open,
    onOpenChange,
    onLeistenJetztBestellen,
    onLeistenUndHalbprobeBestellen,
}: LeistenBestellenModalProps) {
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
                className="overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-xl sm:!max-w-xl [&>button]:right-4 [&>button]:top-4 [&>button]:text-gray-500 [&>button]:hover:text-gray-700"
            >
                <div className="p-6 pt-10 pb-8">
                    {/* Illustration: shoe last on cloud */}
                    <div className="flex justify-center">
                        <div className="w-48 ">
                            <Image width={200} height={200} src={img} alt="Leisten" className="object-contain w-full h-full" />
                        </div>
                    </div>

                    <DialogTitle className="mt-6 text-center text-xl font-bold tracking-tight text-emerald-800">
                        Leisten jetzt bestellen?
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="mt-4 space-y-3 text-center text-sm text-gray-600">
                            <p>
                                Sie haben die externe Leistenfertigung gewählt.
                                <br />
                                Möchten Sie den Leisten jetzt direkt bei uns bestellen?
                            </p>
                            <p>
                                Zusätzlich können Sie auch die Halbprobe gleich mit beauftragen,
                                damit der gesamte Prozess ohne Verzögerung startet.
                            </p>
                        </div>
                    </DialogDescription>

                    {/* CTA Buttons – pill shape, green glow */}
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-5">
                        <button
                            type="button"
                            onClick={handleLeistenJetzt}
                            className={cn(
                                'flex flex-1 items-center cursor-pointer justify-center gap-2 rounded-full py-3.5 px-6 text-xs font-medium uppercase tracking-wide text-white',
                                'bg-[#62A07C] shadow-[0_0_20px_rgba(16,185,129,0.45)]',
                                'hover:bg-[#4A8A5F] hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] transition-all duration-200'
                            )}
                        >
                            {/* <Package className="h-5 w-5 shrink-0" /> */}
                            Leisten jetzt bestellen
                        </button>
                        <button
                            type="button"
                            onClick={handleLeistenUndHalbprobe}
                            className={cn(
                                'flex flex-1 items-center cursor-pointer justify-center gap-1 rounded-full py-3.5 px-6 text-xs font-medium uppercase tracking-wide text-white',
                                'bg-[#62A07C] shadow-[0_0_20px_rgba(16,185,129,0.45)]',
                                'hover:bg-[#4A8A5F] hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] transition-all duration-200'
                            )}
                        >
                            {/* <Package className="h-5 w-5 shrink-0" /> */}
                            {/* <Plus className="h-4 w-4 shrink-0" /> */}
                            Leisten + Halbprobe bestellen
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

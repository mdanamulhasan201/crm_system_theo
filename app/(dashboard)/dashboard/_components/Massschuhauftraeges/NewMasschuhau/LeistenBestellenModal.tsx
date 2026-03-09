'use client';

import React, { useState } from 'react';
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
import { useRouter } from 'next/navigation';

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
    const router = useRouter();
    const [comingSoonOpen, setComingSoonOpen] = useState(false);

    const handleLeistenJetzt = () => {
        onLeistenJetztBestellen?.();
        onOpenChange(false);
    };
    const handleLeistenUndHalbprobe = () => {
        onLeistenUndHalbprobeBestellen?.();
        onOpenChange(false);
    };

    const handleExternClick = () => {
        router.push('/dashboard/leistenkonfigurator');
    };

    const handleLeistenUndHalbprobeClick = () => {
        setComingSoonOpen(true);
    };
    return (
        <>
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
                            onClick={handleLeistenUndHalbprobeClick}
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
                            onClick={handleExternClick}
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

        {/* Coming soon popup */}
        <Dialog open={comingSoonOpen} onOpenChange={setComingSoonOpen}>
            <DialogContent className="rounded-2xl border-0 bg-white p-0 shadow-xl sm:!max-w-sm [&>button]:right-4 [&>button]:top-4">
                <div className="p-8 text-center">
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Coming soon
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm text-gray-600">
                        Diese Funktion wird in Kürze verfügbar sein.
                    </DialogDescription>
                    <button
                        type="button"
                        onClick={() => setComingSoonOpen(false)}
                        className="mt-6 rounded-full bg-[#62A07C] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#4A8A5F] transition-colors cursor-pointer"
                    >
                        Schließen
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    </>
    );
}

'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Box, MapPin, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUBTOTAL = 49.99;
const SHIPPING = 11.99;
const TOTAL = SUBTOTAL + SHIPPING;

function formatPrice(value: number): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(value);
}

export interface BestellungPruefenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileLeftName: string;
    fileRightName: string;
    onBack: () => void;
    onVerbindlichBestellen: () => void;
}

export default function BestellungPruefenModal({
    open,
    onOpenChange,
    fileLeftName,
    fileRightName,
    onBack,
    onVerbindlichBestellen,
}: BestellungPruefenModalProps) {
    const [confirmed, setConfirmed] = useState(false);

    const handleBack = () => {
        onOpenChange(false);
        onBack();
    };

    const handleSubmit = () => {
        if (!confirmed) return;
        onVerbindlichBestellen();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl ring-1 ring-gray-200/90 sm:max-w-xl [&>button]:right-5 [&>button]:top-5 [&>button]:text-gray-400 [&>button]:hover:text-gray-600 [&>button]:hover:bg-gray-100 [&>button]:rounded-full">
                <div className="bg-gradient-to-b from-gray-50/50 to-white p-6 sm:p-8">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                            Bestellung prüfen und verbindlich bestellen
                        </DialogTitle>
                        <DialogDescription asChild>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                Bitte prüfen Sie Ihre Angaben. Mit einem Klick auf „Verbindlich bestellen“ wird die Bestellung verbindlich und kostenpflichtig ausgelöst.
                            </p>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Zusammenfassung */}
                    <div className="mt-6">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#62A07C]/10 text-[#62A07C] shadow-sm ring-1 ring-blue-100">
                                <Box className="size-4" aria-hidden />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Zusammenfassung</h3>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-5 shadow-sm ring-1 ring-gray-100 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Produkt</span>
                                <span className="text-gray-900">Halbprobe</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Leiste links</span>
                                <span className="text-gray-900 truncate max-w-[180px] text-right" title={fileLeftName}>{fileLeftName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Leiste rechts</span>
                                <span className="text-gray-900 truncate max-w-[180px] text-right" title={fileRightName}>{fileRightName}</span>
                            </div>
                            <div className="border-t border-gray-200 my-3 pt-3 space-y-2.5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Zwischensumme</span>
                                    <span className="text-gray-900 font-medium">{formatPrice(SUBTOTAL)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Versandgebühren</span>
                                    <span className="text-gray-900 font-medium">{formatPrice(SHIPPING)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-1 rounded-lg bg-blue-50/80 px-3 py-2 -mx-1">
                                    <span className="text-sm font-bold text-gray-900">Gesamtsumme</span>
                                    <span className="text-lg font-bold text-[#62A07C]">{formatPrice(TOTAL)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lieferinformationen */}
                    {/* <div className="mt-6">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#62A07C]/10 text-[#62A07C] shadow-sm ring-1 ring-blue-100">
                                <MapPin className="size-4" aria-hidden />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Lieferinformationen</h3>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-5 shadow-sm ring-1 ring-gray-100 space-y-2">
                            <div className="flex justify-between items-center text-sm gap-4">
                                <span className="text-gray-500 shrink-0">Lieferadresse</span>
                                <span className="text-gray-900 text-right">wird bei Bestätigung hinterlegt</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Lieferart</span>
                                <span className="text-gray-900 inline-flex items-center gap-1.5">
                                    <Truck className="size-4 text-gray-600" aria-hidden />
                                    Standard
                                </span>
                            </div>
                        </div>
                    </div> */}

                    {/* Checkbox */}
                    <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#62A07C] focus:ring-2 focus:ring-[#62A07C]/20 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700 leading-snug">
                            Ich bestätige, dass ich die Bestellung verbindlich und kostenpflichtig auslösen werde.
                        </span>
                    </label>

                    {/* Buttons */}
                    <div className="mt-7 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300"
                        >
                            Zurück
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!confirmed}
                            className={cn(
                                'rounded-xl cursor-pointer px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all',
                                confirmed
                                    ? 'bg-[#62A07C] hover:bg-[#4A8A5F] hover:shadow-lg hover:-translate-y-0.5'
                                    : 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-none'
                            )}
                        >
                            Verbindlich bestellen
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface SuggestSupplyItem {
    id: string;
    name: string;
    rohlingHersteller?: string;
    artikelHersteller?: string;
    versorgung?: string;
    diagnosis_status?: string[];
    supplyStatus?: {
        name?: string;
        price?: number;
        image?: string;
    };
    storeType?: string;
    store?: {
        id: string;
        produktname?: string;
        hersteller?: string;
        type?: string;
        matchedSizeKey?: string;
        matchedQuantity?: number;
    };
}

export interface SuggestMillingBlockItem {
    id: string;
    produktname?: string;
    hersteller?: string;
    artikelnummer?: string;
    type?: string;
    matchedSizeKey?: string;
    matchedQuantity?: number;
}

export interface SuggestSupplyAndStockData {
    supply?: SuggestSupplyItem[];
    rady_insole?: unknown[];
    milling_block?: SuggestMillingBlockItem[];
}

interface SuggestSupplyAndStockModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: SuggestSupplyAndStockData | null;
    requiredLengthMm?: number;
    /** Backend error message that triggered this modal (e.g. "Block 3 ist nicht auf Lager...") */
    errorMessage?: string | null;
    loading?: boolean;
}

export default function SuggestSupplyAndStockModal({
    open,
    onOpenChange,
    data,
    requiredLengthMm,
    errorMessage,
    loading = false,
}: SuggestSupplyAndStockModalProps) {
    const supply = data?.supply ?? [];
    const millingBlock = data?.milling_block ?? [];
    const radyInsole = data?.rady_insole ?? [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Vorschläge zu Versorgung & Lager
                    </DialogTitle>
                    {errorMessage && (
                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                            {errorMessage}
                        </p>
                    )}
                    {requiredLengthMm != null && (
                        <p className="text-sm text-gray-500 mt-1">
                            Erforderliche Länge: <strong>{requiredLengthMm} mm</strong>
                        </p>
                    )}
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-gray-500">Wird geladen...</div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {/* Supply (Versorgung) */}
                        {supply.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Versorgung (Supply)</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {supply.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex gap-3">
                                                {item.supplyStatus?.image && (
                                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        <Image
                                                            src={item.supplyStatus.image}
                                                            alt={item.name || ''}
                                                            fill
                                                            className="object-contain"
                                                            sizes="64px"
                                                        />
                                                    </div>
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                    {item.versorgung && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{item.versorgung}</p>
                                                    )}
                                                    {item.rohlingHersteller && (
                                                        <p className="text-xs text-gray-500">Rohling: {item.rohlingHersteller}</p>
                                                    )}
                                                    {item.supplyStatus?.name && (
                                                        <p className="text-xs text-gray-600 mt-1">{item.supplyStatus.name}</p>
                                                    )}
                                                    {item.supplyStatus?.price != null && (
                                                        <p className="text-sm font-medium text-emerald-600 mt-1">
                                                            €{item.supplyStatus.price}
                                                        </p>
                                                    )}
                                                    {item.store && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Lager: {item.store.produktname || item.store.hersteller}
                                                            {item.store.matchedQuantity != null && ` · ${item.store.matchedQuantity} Stück`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ready insole */}
                        {radyInsole.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fertige Einlagen (Rady Insole)</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(radyInsole as Record<string, unknown>[]).map((item: Record<string, unknown>, idx: number) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                        >
                                            <p className="font-medium text-gray-900">
                                                {String(item.produktname ?? item.name ?? 'Eintrag')}
                                            </p>
                                            {item.hersteller && (
                                                <p className="text-xs text-gray-500 mt-0.5">Hersteller: {String(item.hersteller)}</p>
                                            )}
                                            {item.matchedQuantity != null && (
                                                <p className="text-xs text-gray-600 mt-1">Anzahl: {Number(item.matchedQuantity)}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Milling block */}
                        {millingBlock.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Fräsblöcke (Milling Block)</h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {millingBlock.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                        >
                                            <p className="font-medium text-gray-900">{item.produktname || 'Fräsblock'}</p>
                                            {item.hersteller && (
                                                <p className="text-xs text-gray-500 mt-0.5">Hersteller: {item.hersteller}</p>
                                            )}
                                            {item.artikelnummer && (
                                                <p className="text-xs text-gray-500">Art.-Nr.: {item.artikelnummer}</p>
                                            )}
                                            {item.matchedSizeKey != null && (
                                                <p className="text-xs text-gray-600 mt-1">Größe: {item.matchedSizeKey}</p>
                                            )}
                                            {item.matchedQuantity != null && (
                                                <p className="text-xs text-gray-600">Anzahl: {item.matchedQuantity} Stück</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {supply.length === 0 && millingBlock.length === 0 && radyInsole.length === 0 && !loading && (
                            <p className="text-sm text-gray-500 py-4">Keine passenden Vorschläge vorhanden.</p>
                        )}
                    </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                    <Button type="button" onClick={() => onOpenChange(false)} className="cursor-pointer">
                        Schließen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

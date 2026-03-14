'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Package, Layers, Box, AlertCircle } from 'lucide-react';

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
        image?: string | null;
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
    /** When user selects a supply or milling_block card, call with that item's id (used as versorgungId in order) */
    onSelectVersorgung?: (id: string) => void;
    /** Called when user clicks Skip. Parent sends full order payload to without-supply-or-store API. */
    onSkip?: () => void | Promise<void>;
}

const MAX_DIAGNOSIS_TAGS = 3;

export default function SuggestSupplyAndStockModal({
    open,
    onOpenChange,
    data,
    requiredLengthMm,
    errorMessage,
    loading = false,
    onSelectVersorgung,
    onSkip,
}: SuggestSupplyAndStockModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [skipInProgress, setSkipInProgress] = useState(false);
    const supply = data?.supply ?? [];
    const millingBlock = data?.milling_block ?? [];
    const radyInsole = data?.rady_insole ?? [];

    const canSkip = Boolean(onSkip);

    useEffect(() => {
        if (open) setStep(1);
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {step === 1 ? 'Keine passende Größe im Lager' : 'Vorschläge zu Versorgung & Lager'}
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

                {step === 1 ? (
                    <div className="mt-4 space-y-4">
                        <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Wenn Sie überspringen, wird die Bestellung trotzdem erstellt. Wenn Sie möchten, können Sie eine passende Versorgung aus der Liste auswählen – klicken Sie auf <strong>Weiter</strong>, um die Vorschläge zu sehen und eine für Sie passende Option zu wählen.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-end pt-2">
                            {canSkip && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="cursor-pointer border-gray-300"
                                    disabled={skipInProgress}
                                    onClick={async () => {
                                        if (!onSkip) return;
                                        setSkipInProgress(true);
                                        try {
                                            await onSkip();
                                            onOpenChange(false);
                                        } finally {
                                            setSkipInProgress(false);
                                        }
                                    }}
                                >
                                    {skipInProgress ? 'Wird erstellt...' : 'Überspringen'}
                                </Button>
                            )}
                            <Button
                                type="button"
                                className="cursor-pointer bg-[#61A178] hover:bg-[#61A178]/90 text-white"
                                onClick={() => setStep(2)}
                                disabled={loading}
                            >
                                Weiter
                            </Button>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="py-8 text-center text-gray-500">Wird geladen...</div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {/* Supply (Versorgung) */}
                        {supply.length > 0 && (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                                    <Layers className="h-4 w-4 text-[#61A178]" />
                                    Versorgung ({supply.length})
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-1">
                                    {supply.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex gap-4 items-start">
                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                                                    {item.supplyStatus?.image ? (
                                                        <Image
                                                            src={item.supplyStatus.image}
                                                            alt={item.name || ''}
                                                            width={80}
                                                            height={80}
                                                            className="h-20 w-20 object-contain"
                                                        />
                                                    ) : (
                                                        <Layers className="h-9 w-9 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                                            {item.versorgung ? (
                                                                <p className="text-xs text-gray-500 mt-0.5">{item.versorgung}</p>
                                                            ) : null}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {item.store?.matchedSizeKey != null && (
                                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                                    Größe {item.store.matchedSizeKey}
                                                                </span>
                                                            )}
                                                            {item.store?.matchedQuantity != null && (
                                                                <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                                    {item.store.matchedQuantity} Stück
                                                                </span>
                                                            )}
                                                            {item.supplyStatus?.price != null && (
                                                                <span className="inline-flex items-center rounded-md bg-[#61A178]/15 px-2 py-0.5 text-xs font-semibold text-[#61A178]">
                                                                    €{item.supplyStatus.price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                                                        {item.rohlingHersteller ? (
                                                            <span>Rohling: {item.rohlingHersteller}</span>
                                                        ) : null}
                                                        {item.supplyStatus?.name ? (
                                                            <span>Status: {item.supplyStatus.name}</span>
                                                        ) : null}
                                                        {item.store?.produktname || item.store?.hersteller ? (
                                                            <span>Lager: {item.store.produktname || item.store.hersteller}</span>
                                                        ) : null}
                                                    </div>
                                                    {Array.isArray(item.diagnosis_status) && item.diagnosis_status.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 pt-1">
                                                            {item.diagnosis_status.slice(0, MAX_DIAGNOSIS_TAGS).map((d, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="inline-flex max-w-[180px] truncate rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700"
                                                                    title={typeof d === 'string' ? d : String(d)}
                                                                >
                                                                    {typeof d === 'string' ? d : String(d)}
                                                                </span>
                                                            ))}
                                                            {item.diagnosis_status.length > MAX_DIAGNOSIS_TAGS ? (
                                                                <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                                                                    +{item.diagnosis_status.length - MAX_DIAGNOSIS_TAGS}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                {onSelectVersorgung ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="shrink-0 bg-[#61A178] hover:bg-[#61A178]/90 text-white cursor-pointer"
                                                        onClick={() => {
                                                            onSelectVersorgung(item.id);
                                                            onOpenChange(false);
                                                        }}
                                                    >
                                                        Auswählen
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Ready insole */}
                        {radyInsole.length > 0 ? (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                                    <Package className="h-4 w-4 text-[#61A178]" />
                                    Fertige Einlagen ({radyInsole.length})
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(radyInsole as Record<string, unknown>[]).map((item: Record<string, unknown>, idx: number) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <p className="font-medium text-gray-900">
                                                {String(item.produktname ?? item.name ?? 'Eintrag')}
                                            </p>
                                            {item.hersteller != null && String(item.hersteller) !== '' ? (
                                                <p className="text-xs text-gray-500 mt-0.5">Hersteller: {String(item.hersteller)}</p>
                                            ) : null}
                                            {item.matchedQuantity != null ? (
                                                <p className="mt-1.5 text-xs font-medium text-emerald-600">Anzahl: {Number(item.matchedQuantity)}</p>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {/* Milling block */}
                        {millingBlock.length > 0 ? (
                            <section>
                                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-3">
                                    <Box className="h-4 w-4 text-[#61A178]" />
                                    Fräsblöcke ({millingBlock.length})
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {millingBlock.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                                        >
                                            <p className="font-semibold text-gray-900 truncate" title={item.produktname}>
                                                {item.produktname || 'Fräsblock'}
                                            </p>
                                            <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                                                {item.hersteller ? <p>Hersteller: {item.hersteller}</p> : null}
                                                {item.artikelnummer ? <p>Art.-Nr.: {item.artikelnummer}</p> : null}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {item.matchedSizeKey != null ? (
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                                                        Größe {item.matchedSizeKey}
                                                    </span>
                                                ) : null}
                                                {item.matchedQuantity != null ? (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                        {item.matchedQuantity} Stück
                                                    </span>
                                                ) : null}
                                            </div>
                                            {onSelectVersorgung ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="mt-3 w-full bg-[#61A178] hover:bg-[#61A178]/90 text-white cursor-pointer"
                                                    onClick={() => {
                                                        onSelectVersorgung(item.id);
                                                        onOpenChange(false);
                                                    }}
                                                >
                                                    Auswählen
                                                </Button>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : null}

                        {supply.length === 0 && millingBlock.length === 0 && radyInsole.length === 0 && !loading ? (
                            <p className="text-sm text-gray-500 py-4">Keine passenden Vorschläge vorhanden.</p>
                        ) : null}
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

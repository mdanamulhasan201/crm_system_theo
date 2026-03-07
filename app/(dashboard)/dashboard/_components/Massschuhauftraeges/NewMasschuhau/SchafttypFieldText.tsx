'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import SchafttypCustomModal, { type MassschafterstellungJson } from './SchafttypCustomModal';
import * as MassschuheAddedApis from '@/apis/MassschuheAddedApis';

export const SCHAFTTYP_OPTIONS = [
    { value: 'Intern', label: 'Intern' },
    { value: 'Extern', label: 'Extern' },
] as const;

export type SchafttypValue = (typeof SCHAFTTYP_OPTIONS)[number]['value'] | '';

export interface SchafttypFieldTextProps {
    schafttyp: SchafttypValue;
    /** Intern – Hinweise zur internen Schaftfertigung */
    schafttypInternNote: string;
    /** Extern – Hinweise zur externen Schaftfertigung */
    schafttypExternNote: string;
    onSchafttypChange: (value: SchafttypValue) => void;
    onSchafttypInternNoteChange: (value: string) => void;
    onSchafttypExternNoteChange: (value: string) => void;
    /** Step 5: orderId + step status for massschafterstellung GET/POST (erweitert modal) */
    orderId?: string;
    stepStatus?: string;
}

export default function SchafttypFieldText({
    schafttyp,
    schafttypInternNote,
    schafttypExternNote,
    onSchafttypChange,
    onSchafttypInternNoteChange,
    onSchafttypExternNoteChange,
    orderId,
    stepStatus,
}: SchafttypFieldTextProps) {
    const router = useRouter();
    const [externOrderDialogOpen, setExternOrderDialogOpen] = useState(false);
    const [internCustomModalOpen, setInternCustomModalOpen] = useState(false);
    const [massschafterstellungData, setMassschafterstellungData] = useState<{
        json?: MassschafterstellungJson;
        imageUrl?: string;
    } | null>(null);
    const [massschafterstellungLoading, setMassschafterstellungLoading] = useState(false);
    const isStep5 = Boolean(orderId && stepStatus);

    const fetchMassschafterstellung = useCallback(async () => {
        if (!orderId || !stepStatus) return null;
        setMassschafterstellungLoading(true);
        try {
            const res: any = await MassschuheAddedApis.getMassschuheOrderStepMassschafterstellung(orderId, stepStatus);
            const data = res?.data ?? res;
            if (data && (data.massschafterstellung_json || data.massschafterstellung_image)) {
                const json = typeof data.massschafterstellung_json === 'string'
                    ? (() => { try { return JSON.parse(data.massschafterstellung_json); } catch { return data.massschafterstellung_json; } })()
                    : data.massschafterstellung_json;
                setMassschafterstellungData({
                    json: json ?? undefined,
                    imageUrl: data.massschafterstellung_image ?? undefined,
                });
                return { json, imageUrl: data.massschafterstellung_image };
            }
            setMassschafterstellungData(null);
            return null;
        } catch {
            setMassschafterstellungData(null);
            return null;
        } finally {
            setMassschafterstellungLoading(false);
        }
    }, [orderId, stepStatus]);

    const handleErweitertClick = async () => {
        if (isStep5) {
            await fetchMassschafterstellung();
            setInternCustomModalOpen(true);
        } else {
            setInternCustomModalOpen(true);
        }
    };

    const handleMassschafterstellungSubmit = async (payload: {
        imageFile?: File;
        massschafterstellung_json: MassschafterstellungJson;
    }) => {
        if (!orderId) return;
        const formData = new FormData();
        if (payload.imageFile) formData.append('massschafterstellung_image', payload.imageFile);
        formData.append('massschafterstellung_json', JSON.stringify(payload.massschafterstellung_json));
        try {
            await MassschuheAddedApis.updateMassschuheOrderStepMassschafterstellung(orderId, formData);
            setMassschafterstellungData({
                json: payload.massschafterstellung_json,
                imageUrl: payload.imageFile ? undefined : massschafterstellungData?.imageUrl,
            });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (isStep5) fetchMassschafterstellung();
    }, [isStep5, fetchMassschafterstellung]);

    return (
        <>
            <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <Label className="text-sm font-medium text-gray-800 mb-3 block">
                    Schafttyp <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full min-w-0">
                    {SCHAFTTYP_OPTIONS.map((opt) => {
                        const isSelected = schafttyp === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onSchafttypChange(opt.value)}
                                className={cn(
                                    'relative flex cursor-pointer min-w-0 flex-1 basis-[calc(50%-0.375rem)] items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                                    'border-gray-300 bg-gray-50/80 text-gray-800 hover:border-gray-400 hover:bg-gray-100',
                                    isSelected && 'border-emerald-500 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500 ring-offset-2'
                                )}
                            >
                                {isSelected && <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
                                <span>{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
                {schafttyp === 'Intern' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <Label className="text-sm font-medium text-gray-800">
                                Hinweise zur internen Schaftfertigung
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className={cn(
                                    'text-gray-700 border-gray-400 hover:bg-gray-100',
                                    isStep5 && massschafterstellungData && 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                )}
                                onClick={handleErweitertClick}
                                disabled={massschafterstellungLoading}
                            >
                                {massschafterstellungLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                ) : isStep5 && massschafterstellungData ? (
                                    <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                                ) : null}
                                erweitert
                            </Button>
                        </div>
                        <textarea
                            value={schafttypInternNote}
                            onChange={(e) => onSchafttypInternNoteChange(e.target.value)}
                            placeholder="Details, Besonderheiten oder Wünsche für den internen Schaft..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                        />
                    </div>
                )}
                {schafttyp === 'Extern' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <Label className="text-sm font-medium text-gray-800">
                                Hinweise zur externen Schaftfertigung
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-gray-700 border-gray-400 hover:bg-gray-100"
                                onClick={() => setExternOrderDialogOpen(true)}
                            >
                                erweitert
                            </Button>
                        </div>
                        <textarea
                            value={schafttypExternNote}
                            onChange={(e) => onSchafttypExternNoteChange(e.target.value)}
                            placeholder="Notizen für die externe Schaftfertigung..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                        />
                    </div>
                )}
            </div>
            <Dialog open={externOrderDialogOpen} onOpenChange={setExternOrderDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Externe Schaft-Bestellung</DialogTitle>
                        <DialogDescription>
                            Möchten Sie jetzt die externe Schaftfertigung bestellen?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setExternOrderDialogOpen(false)}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            className="bg-[#61A178] hover:bg-[#4A8A5F]"
                            onClick={() => {
                                setExternOrderDialogOpen(false);
                                router.push('/dashboard/custom-shafts');
                            }}
                        >
                            Jetzt bestellen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <SchafttypCustomModal
                open={internCustomModalOpen}
                onOpenChange={setInternCustomModalOpen}
                initialData={isStep5 ? massschafterstellungData?.json : undefined}
                initialImageUrl={isStep5 ? massschafterstellungData?.imageUrl : undefined}
                onSubmit={isStep5 ? handleMassschafterstellungSubmit : undefined}
            />
        </>
    );
}

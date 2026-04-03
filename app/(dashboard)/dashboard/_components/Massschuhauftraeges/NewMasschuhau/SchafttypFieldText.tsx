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
    /** Actual orderId used for custom-shafts redirect query param */
    redirectOrderId?: string;
    /** Prefill customer in custom-shafts details page */
    redirectCustomerId?: string;
    redirectCustomerName?: string;
    stepStatus?: string;
    /** When true, only the Extern erweitert button is disabled (no redirect). Intern stays enabled. */
    disableExternErweitert?: boolean;
    /** Standalone (no orderId) submit handler – called when user saves the Intern modal. */
    onStandaloneSubmit?: (payload: { imageFile?: File; massschafterstellung_json: MassschafterstellungJson }) => Promise<void>;
    /** Standalone prefill – used as initialData/initialImageUrl when not in step5 mode. */
    standaloneInitialData?: MassschafterstellungJson | null;
    standaloneInitialImageUrl?: string | null;
}

export default function SchafttypFieldText({
    schafttyp,
    schafttypInternNote,
    schafttypExternNote,
    onSchafttypChange,
    onSchafttypInternNoteChange,
    onSchafttypExternNoteChange,
    orderId,
    redirectOrderId,
    redirectCustomerId,
    redirectCustomerName,
    stepStatus,
    disableExternErweitert = false,
    onStandaloneSubmit,
    standaloneInitialData,
    standaloneInitialImageUrl,
}: SchafttypFieldTextProps) {
    const router = useRouter();
    const [externOrderDialogOpen, setExternOrderDialogOpen] = useState(false);
    const [internCustomModalOpen, setInternCustomModalOpen] = useState(false);
    const [activeButtons, setActiveButtons] = useState<{ intern: boolean; extern: boolean }>({
        intern: false,
        extern: false,
    });
    const [activeButtonsLoading, setActiveButtonsLoading] = useState(false);
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

    const fetchActiveButtons = useCallback(async () => {
        if (!orderId) return;
        setActiveButtonsLoading(true);
        try {
            const res: any = await MassschuheAddedApis.getMassschuheOrderTrackActiveButtonSchafttyp(orderId);
            setActiveButtons({
                intern: Boolean(res?.data?.schafttyp?.intern),
                extern: Boolean(res?.data?.schafttyp?.extern),
            });
        } catch {
            setActiveButtons({ intern: false, extern: false });
        } finally {
            setActiveButtonsLoading(false);
        }
    }, [orderId]);

    const handleErweitertClick = async () => {
        if (isStep5) {
            if (activeButtons.intern && orderId) {
                setMassschafterstellungLoading(true);
                try {
                    const res: any = await MassschuheAddedApis.getMassschuheOrderTrackActiveButtonSchafttyp2(orderId, 'intern');
                    const internData = res?.data?.schafttyp?.intern;
                    const hasData = Boolean(internData?.hasData);
                    const json = typeof internData?.json === 'string'
                        ? (() => { try { return JSON.parse(internData.json); } catch { return undefined; } })()
                        : internData?.json;

                    if (hasData && (json || internData?.image)) {
                        setMassschafterstellungData({
                            json: json ?? undefined,
                            imageUrl: internData?.image ?? undefined,
                        });
                    } else {
                        setMassschafterstellungData(null);
                    }
                } catch {
                    setMassschafterstellungData(null);
                } finally {
                    setMassschafterstellungLoading(false);
                }
            } else {
                setMassschafterstellungData(null);
            }
            setInternCustomModalOpen(true);
        } else {
            setInternCustomModalOpen(true);
        }
    };

    const handleExternErweitertClick = () => {
        if (isStep5 && activeButtons.extern) {
            router.push('/dashboard/balance-dashboard');
            return;
        }
        setExternOrderDialogOpen(true);
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
        if (isStep5) {
            fetchActiveButtons();
        }
    }, [isStep5, fetchActiveButtons]);

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
                                    isStep5 && activeButtons.intern && 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                                    isStep5 && !activeButtons.intern && 'border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
                                )}
                                onClick={handleErweitertClick}
                                disabled={massschafterstellungLoading || activeButtonsLoading}
                            >
                                {massschafterstellungLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                ) : isStep5 && activeButtons.intern ? (
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
                                className={cn(
                                    'text-gray-700 border-gray-400 hover:bg-gray-100',
                                    isStep5 && activeButtons.extern && 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                                    disableExternErweitert && 'opacity-50 cursor-not-allowed'
                                )}
                                onClick={handleExternErweitertClick}
                                disabled={disableExternErweitert || activeButtonsLoading}
                            >
                                {isStep5 && activeButtons.extern ? (
                                    <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                                ) : null}
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
                                const targetOrderId = redirectOrderId || orderId;
                                const params = new URLSearchParams();
                                params.set('category', 'massschuhauftraege_order');
                                if (targetOrderId) params.set('orderId', targetOrderId);
                                if (redirectCustomerId) params.set('customerId', redirectCustomerId);
                                if (redirectCustomerName) params.set('customerName', redirectCustomerName);
                                const query = `?${params.toString()}`;
                                router.push(`/dashboard/custom-shafts${query}`);
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
                initialData={isStep5 ? massschafterstellungData?.json : (standaloneInitialData ?? undefined)}
                initialImageUrl={isStep5 ? massschafterstellungData?.imageUrl : (standaloneInitialImageUrl ?? undefined)}
                onSubmit={isStep5 ? handleMassschafterstellungSubmit : onStandaloneSubmit}
            />
        </>
    );
}

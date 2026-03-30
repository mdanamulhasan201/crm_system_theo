'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import * as MassschuheAddedApis from '@/apis/MassschuheAddedApis';

const BODEN_OPTIONS = [
    { value: 'Intern', label: 'Intern' },
    { value: 'Extern', label: 'Extern' },
] as const;

type BodenOption = (typeof BODEN_OPTIONS)[number]['value'] | '';

export interface BodenkonstruktionFiledTextProps {
    /** Controlled internal note (e.g. for step 5 payload) */
    bodenkonstruktionInternNote?: string;
    bodenkonstruktionExternNote?: string;
    onBodenkonstruktionInternNoteChange?: (value: string) => void;
    onBodenkonstruktionExternNoteChange?: (value: string) => void;
    /** Step 5: orderId + step status for bodenkonstruktion GET (erweitert green + link) */
    orderId?: string;
    /** Actual shoe order id used for redirects */
    redirectOrderId?: string;
    /** Prefill customer in destination page */
    redirectCustomerId?: string;
    redirectCustomerName?: string;
    stepStatus?: string;
}

export default function BodenkonstruktionFiledText({
    bodenkonstruktionInternNote,
    bodenkonstruktionExternNote,
    onBodenkonstruktionInternNoteChange,
    onBodenkonstruktionExternNoteChange,
    orderId,
    redirectOrderId,
    redirectCustomerId,
    redirectCustomerName,
    stepStatus,
}: BodenkonstruktionFiledTextProps = {}) {
    const router = useRouter();
    const [bodenOption, setBodenOption] = useState<BodenOption>('');
    const [internNoteLocal, setInternNoteLocal] = useState('');
    const [externNoteLocal, setExternNoteLocal] = useState('');
    const [hasBodenkonstruktionData, setHasBodenkonstruktionData] = useState(false);
    const [bodenLoading, setBodenLoading] = useState(false);
    const [externOrderDialogOpen, setExternOrderDialogOpen] = useState(false);
    const internControlled = onBodenkonstruktionInternNoteChange != null;
    const externControlled = onBodenkonstruktionExternNoteChange != null;
    const internNote = internControlled ? (bodenkonstruktionInternNote ?? '') : internNoteLocal;
    const externNote = externControlled ? (bodenkonstruktionExternNote ?? '') : externNoteLocal;
    const setInternNote = internControlled ? (v: string) => onBodenkonstruktionInternNoteChange?.(v) : setInternNoteLocal;
    const setExternNote = externControlled ? (v: string) => onBodenkonstruktionExternNoteChange?.(v) : setExternNoteLocal;
    const isStep5 = Boolean(orderId && stepStatus);

    const fetchBodenkonstruktion = useCallback(async () => {
        if (!orderId || !stepStatus) return;
        setBodenLoading(true);
        try {
            const res: any = await MassschuheAddedApis.getMassschuheOrderStepBodenkonstruktion(orderId, stepStatus);
            const data = res?.data ?? res;
            const hasData = data && (data.bodenkonstruktion_json != null || data.bodenkonstruktion_image != null);
            setHasBodenkonstruktionData(!!hasData);
        } catch {
            setHasBodenkonstruktionData(false);
        } finally {
            setBodenLoading(false);
        }
    }, [orderId, stepStatus]);

    useEffect(() => {
        if (isStep5) fetchBodenkonstruktion();
    }, [isStep5, fetchBodenkonstruktion]);

    const handleErweitertClick = () => {
        if (orderId) {
            router.push(`/dashboard/bodenkonstruktion-customer-order?orderId=${encodeURIComponent(orderId)}`);
        } else {
            router.push('/dashboard/bodenkonstruktion-customer-order');
        }
    };

    const handleExternBestellenRedirect = () => {
        const targetOrderId = redirectOrderId || orderId;
        const params = new URLSearchParams();
        if (targetOrderId) params.set('orderId', targetOrderId);
        if (redirectCustomerId) params.set('customerId', redirectCustomerId);
        if (redirectCustomerName) params.set('customerName', redirectCustomerName);
        const query = params.toString();
        router.push(query ? `/dashboard/bodenkonstruktion?${query}` : '/dashboard/bodenkonstruktion');
    };

    return (
        <div>
            <Label className="text-sm font-medium text-gray-800 mb-3 block">
                Bodenkonstruktion <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full min-w-0">
                {BODEN_OPTIONS.map((opt) => {
                    const isSelected = bodenOption === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setBodenOption(opt.value)}
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
            {bodenOption === 'Intern' && (
                <div className="mt-4 pt-4 border-t border-gray-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <Label className="text-sm font-medium text-gray-800">
                            Hinweise zur internen Bodenkonstruktion
                        </Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(
                                'text-gray-700 border-gray-400 hover:bg-gray-100',
                                isStep5 && hasBodenkonstruktionData && 'border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            )}
                            onClick={handleErweitertClick}
                            disabled={bodenLoading}
                        >
                            {bodenLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            ) : isStep5 && hasBodenkonstruktionData ? (
                                <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                            ) : null}
                            erweitert
                        </Button>
                    </div>
                    <textarea
                        value={internNote}
                        onChange={(e) => setInternNote(e.target.value)}
                        placeholder="Details zur internen Bodenkonstruktion..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                    />
                </div>
            )}
            {bodenOption === 'Extern' && (
                <div className="mt-4 pt-4 border-t border-gray-200/80">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <Label className="text-sm font-medium text-gray-800">
                            Hinweise zur externen Bodenkonstruktion
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
                        value={externNote}
                        onChange={(e) => setExternNote(e.target.value)}
                        placeholder="Details zur externen Bodenkonstruktion..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                    />
                </div>
            )}

            <Dialog open={externOrderDialogOpen} onOpenChange={setExternOrderDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Externe Bodenkonstruktion</DialogTitle>
                        <DialogDescription>
                            Möchten Sie jetzt die Externe Bodenkonstruktion bestellen?
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
                                handleExternBestellenRedirect();
                            }}
                        >
                            Jetzt bestellen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

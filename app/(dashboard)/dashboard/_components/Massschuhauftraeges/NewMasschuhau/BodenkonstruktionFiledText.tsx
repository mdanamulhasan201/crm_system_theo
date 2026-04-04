'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, FileText, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BodenkonstruktionCustomerOrderView } from '@/components/Bodenkonstruktion/BodenkonstruktionCustomerOrderView';
import * as MassschuheAddedApis from '@/apis/MassschuheAddedApis';

function isBodenExternActive(bk: any): boolean {
    if (!bk || typeof bk !== 'object') return false;
    if (typeof bk.active?.extern === 'boolean') return bk.active.extern;
    if (typeof bk.extern === 'boolean') return bk.extern;
    const ex = bk.extern;
    if (ex && typeof ex === 'object') {
        return Boolean(ex.hasData || (Array.isArray(ex.customShafts) && ex.customShafts.length > 0));
    }
    return false;
}

function isBodenInternActive(bk: any): boolean {
    if (!bk || typeof bk !== 'object') return false;
    if (typeof bk.active?.intern === 'boolean') return bk.active.intern;
    return Boolean(bk.intern);
}

function collectBodenInvoiceUrlsFromExternBlock(externBlock: unknown): string[] {
    const urls: string[] = [];
    if (!externBlock || typeof externBlock !== 'object') return urls;
    const ex = externBlock as { customShafts?: Array<{ invoice?: string | null; invoice2?: string | null }> };
    if (Array.isArray(ex.customShafts)) {
        for (const cs of ex.customShafts) {
            if (cs?.invoice) urls.push(cs.invoice);
            if (cs?.invoice2) urls.push(cs.invoice2);
        }
    }
    return urls;
}

function collectBodenInvoiceUrlsFromInternBlock(internBlock: unknown): string[] {
    const urls: string[] = [];
    if (!internBlock || typeof internBlock !== 'object') return urls;
    const ib = internBlock as {
        invoice?: string | null;
        invoice2?: string | null;
        customShafts?: Array<{ invoice?: string | null; invoice2?: string | null }>;
    };
    if (ib.invoice) urls.push(ib.invoice);
    if (ib.invoice2) urls.push(ib.invoice2);
    if (Array.isArray(ib.customShafts)) {
        for (const cs of ib.customShafts) {
            if (cs?.invoice) urls.push(cs.invoice);
            if (cs?.invoice2) urls.push(cs.invoice2);
        }
    }
    return urls;
}

function parseBodenInternFromPdfApiResponse(res: any): {
    json?: Record<string, unknown>;
    image: string | null;
    hasData: boolean;
    pdfUrls: string[];
} | null {
    const bk = res?.data?.bodenkonstruktion ?? res?.bodenkonstruktion;
    const internData = bk?.intern;
    if (!internData || typeof internData !== 'object') return null;
    const hasData = Boolean(internData.hasData);
    const parsedJson =
        typeof internData.json === 'string'
            ? (() => {
                  try {
                      return JSON.parse(internData.json) as Record<string, unknown>;
                  } catch {
                      return undefined;
                  }
              })()
            : (internData.json as Record<string, unknown> | undefined);
    const pdfUrls = collectBodenInvoiceUrlsFromInternBlock(internData);
    return {
        json: parsedJson,
        image: internData.image ?? null,
        hasData,
        pdfUrls,
    };
}

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
    /** When true, only the Extern erweitert button is disabled (no redirect). Intern stays enabled. */
    disableExternErweitert?: boolean;
    /** Standalone save handler – passed to BodenkonstruktionCustomerOrderView when no orderId. */
    onStandaloneSave?: (formData: FormData) => Promise<void>;
    /** sessionStorage key written by parent with { json, image } before modal opens (standalone). */
    standalonePrefillKey?: string;
    /** Called on textarea blur – use for auto-save in standalone context. */
    onBodenkonstruktionInternNoteBlur?: () => void;
    onBodenkonstruktionExternNoteBlur?: () => void;
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
    disableExternErweitert = false,
    onStandaloneSave,
    standalonePrefillKey,
    onBodenkonstruktionInternNoteBlur,
    onBodenkonstruktionExternNoteBlur,
}: BodenkonstruktionFiledTextProps = {}) {
    const router = useRouter();
    const [bodenOption, setBodenOption] = useState<BodenOption>('');
    const [internNoteLocal, setInternNoteLocal] = useState('');
    const [externNoteLocal, setExternNoteLocal] = useState('');
    const [bodenLoading, setBodenLoading] = useState(false);
    const [activeButtons, setActiveButtons] = useState<{ intern: boolean; extern: boolean }>({
        intern: false,
        extern: false,
    });
    const [activeButtonsLoading, setActiveButtonsLoading] = useState(false);
    const [internPopupOpen, setInternPopupOpen] = useState(false);
    const [externOrderDialogOpen, setExternOrderDialogOpen] = useState(false);
    const [bodenExternPdfUrls, setBodenExternPdfUrls] = useState<string[]>([]);
    const [bodenExternPdfLoading, setBodenExternPdfLoading] = useState(false);
    const [bodenPdfPreviewOpen, setBodenPdfPreviewOpen] = useState(false);
    const [bodenPdfPreviewUrl, setBodenPdfPreviewUrl] = useState<string | null>(null);
    const [bodenInternTrack, setBodenInternTrack] = useState<{
        json?: Record<string, unknown>;
        image: string | null;
        hasData: boolean;
        pdfUrls: string[];
    } | null>(null);
    const [bodenInternPdfLoading, setBodenInternPdfLoading] = useState(false);
    const [bodenInternPreviewOpen, setBodenInternPreviewOpen] = useState(false);
    const [bodenInternPreviewMode, setBodenInternPreviewMode] = useState<'pdf' | 'content'>('content');
    const [bodenInternPreviewPdfUrls, setBodenInternPreviewPdfUrls] = useState<string[]>([]);
    const [bodenInternPreviewPdfUrl, setBodenInternPreviewPdfUrl] = useState<string | null>(null);
    const [bodenInternPreviewImageUrl, setBodenInternPreviewImageUrl] = useState<string | null>(null);
    const [bodenInternPreviewJsonText, setBodenInternPreviewJsonText] = useState('');
    const wasInternPopupOpenRef = useRef(false);
    const internControlled = onBodenkonstruktionInternNoteChange != null;
    const externControlled = onBodenkonstruktionExternNoteChange != null;
    const internNote = internControlled ? (bodenkonstruktionInternNote ?? '') : internNoteLocal;
    const externNote = externControlled ? (bodenkonstruktionExternNote ?? '') : externNoteLocal;
    const setInternNote = internControlled ? (v: string) => onBodenkonstruktionInternNoteChange?.(v) : setInternNoteLocal;
    const setExternNote = externControlled ? (v: string) => onBodenkonstruktionExternNoteChange?.(v) : setExternNoteLocal;
    const isStep5 = Boolean(orderId && stepStatus);
    const internNoteRef = useRef(internNote);
    const externNoteRef = useRef(externNote);

    useEffect(() => {
        internNoteRef.current = internNote;
    }, [internNote]);

    useEffect(() => {
        externNoteRef.current = externNote;
    }, [externNote]);

    const fetchActiveButtons = useCallback(async () => {
        if (!orderId) return;
        setActiveButtonsLoading(true);
        try {
            const res: any = await MassschuheAddedApis.getMassschuheOrderTrackActiveButtonSchafttyp(orderId);
            const bk = res?.data?.bodenkonstruktion;
            setActiveButtons({
                intern: isBodenInternActive(bk),
                extern: isBodenExternActive(bk),
            });
            const internNoteFromApi = bk?.note?.intern;
            const externNoteFromApi = bk?.note?.extern;
            if (
                typeof internNoteFromApi === 'string' &&
                internNoteFromApi.trim() &&
                !internNoteRef.current.trim()
            ) {
                if (internControlled) onBodenkonstruktionInternNoteChange?.(internNoteFromApi);
                else setInternNoteLocal(internNoteFromApi);
            }
            if (
                typeof externNoteFromApi === 'string' &&
                externNoteFromApi.trim() &&
                !externNoteRef.current.trim()
            ) {
                if (externControlled) onBodenkonstruktionExternNoteChange?.(externNoteFromApi);
                else setExternNoteLocal(externNoteFromApi);
            }
        } catch {
            setActiveButtons({ intern: false, extern: false });
        } finally {
            setActiveButtonsLoading(false);
        }
    }, [
        orderId,
        internControlled,
        externControlled,
        onBodenkonstruktionInternNoteChange,
        onBodenkonstruktionExternNoteChange,
    ]);

    useEffect(() => {
        if (isStep5) {
            fetchActiveButtons();
        }
    }, [isStep5, fetchActiveButtons]);

    useEffect(() => {
        if (!isStep5 || !orderId || bodenOption !== 'Extern') {
            setBodenExternPdfUrls([]);
            setBodenExternPdfLoading(false);
            return;
        }
        let cancelled = false;
        setBodenExternPdfLoading(true);
        MassschuheAddedApis.getMassschuheOrderTrackActiveButtonBodenkonstruktionPdfDownload(orderId, 'extern')
            .then((res: any) => {
                if (cancelled) return;
                const bk = res?.data?.bodenkonstruktion ?? res?.bodenkonstruktion;
                const ext = bk?.extern;
                const urls = collectBodenInvoiceUrlsFromExternBlock(
                    typeof ext === 'object' && ext !== null ? ext : null
                );
                setBodenExternPdfUrls(urls);
            })
            .catch(() => {
                if (!cancelled) setBodenExternPdfUrls([]);
            })
            .finally(() => {
                if (!cancelled) setBodenExternPdfLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isStep5, orderId, bodenOption]);

    useEffect(() => {
        if (!isStep5 || !orderId || bodenOption !== 'Intern') {
            setBodenInternTrack(null);
            setBodenInternPdfLoading(false);
            return;
        }
        let cancelled = false;
        setBodenInternPdfLoading(true);
        MassschuheAddedApis.getMassschuheOrderTrackActiveButtonBodenkonstruktionPdfDownload(orderId, 'intern')
            .then((res: any) => {
                if (cancelled) return;
                setBodenInternTrack(parseBodenInternFromPdfApiResponse(res));
            })
            .catch(() => {
                if (!cancelled) setBodenInternTrack(null);
            })
            .finally(() => {
                if (!cancelled) setBodenInternPdfLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isStep5, orderId, bodenOption]);

    // Refetch active buttons only when intern modal transitions open -> closed
    useEffect(() => {
        if (isStep5 && wasInternPopupOpenRef.current && !internPopupOpen) {
            fetchActiveButtons();
        }
        wasInternPopupOpenRef.current = internPopupOpen;
    }, [internPopupOpen, isStep5, fetchActiveButtons]);

    useEffect(() => {
        if (!internControlled && !externControlled) return;
        if (bodenOption !== '') return;
        const i = (bodenkonstruktionInternNote ?? '').trim();
        const e = (bodenkonstruktionExternNote ?? '').trim();
        if (i && !e) setBodenOption('Intern');
        else if (e && !i) setBodenOption('Extern');
    }, [
        bodenkonstruktionInternNote,
        bodenkonstruktionExternNote,
        internControlled,
        externControlled,
        bodenOption,
    ]);

    const applyBodenInternPrefillToSession = (
        source: {
            json?: Record<string, unknown>;
            image: string | null;
            hasData: boolean;
        } | null
    ) => {
        if (!orderId) return;
        if (!source) {
            sessionStorage.removeItem(`bodenkonstruktion-embedded-prefill:${orderId}`);
            return;
        }
        const parsedJson = source.json;
        const mergedJson = {
            ...(parsedJson ?? {}),
            ...(!(parsedJson as { customerName?: string } | undefined)?.customerName && redirectCustomerName
                ? { customerName: redirectCustomerName }
                : {}),
        };

        if (source.hasData && (parsedJson || source.image)) {
            sessionStorage.setItem(
                `bodenkonstruktion-embedded-prefill:${orderId}`,
                JSON.stringify({ json: mergedJson, image: source.image ?? null })
            );
        } else {
            sessionStorage.setItem(
                `bodenkonstruktion-embedded-prefill:${orderId}`,
                JSON.stringify({
                    json: redirectCustomerName ? { customerName: redirectCustomerName } : null,
                    image: null,
                })
            );
        }
    };

    const handleErweitertClick = async () => {
        if (isStep5 && orderId) {
            setBodenLoading(true);
            try {
                if (bodenInternTrack) {
                    applyBodenInternPrefillToSession(bodenInternTrack);
                } else {
                    const res: any = await MassschuheAddedApis.getMassschuheOrderTrackActiveButtonBodenkonstruktionPdfDownload(
                        orderId,
                        'intern'
                    );
                    applyBodenInternPrefillToSession(parseBodenInternFromPdfApiResponse(res));
                }
            } catch {
                sessionStorage.removeItem(`bodenkonstruktion-embedded-prefill:${orderId}`);
            } finally {
                setBodenLoading(false);
            }
        } else {
            if (orderId) sessionStorage.removeItem(`bodenkonstruktion-embedded-prefill:${orderId}`);
        }
        setInternPopupOpen(true);
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

    const handleExternErweitertClick = () => {
        if (isStep5 && activeButtons.extern) {
            router.push('/dashboard/balance-dashboard');
            return;
        }
        setExternOrderDialogOpen(true);
    };

    const openBodenExternPdfPreview = () => {
        if (bodenExternPdfUrls.length === 0) return;
        setBodenPdfPreviewUrl(bodenExternPdfUrls[0]);
        setBodenPdfPreviewOpen(true);
    };

    const openBodenInternPdfPreview = () => {
        if (!bodenInternTrack?.hasData) return;
        const { pdfUrls, image, json } = bodenInternTrack;
        if (pdfUrls.length > 0) {
            setBodenInternPreviewPdfUrls(pdfUrls);
            setBodenInternPreviewPdfUrl(pdfUrls[0]);
            setBodenInternPreviewMode('pdf');
            setBodenInternPreviewOpen(true);
            return;
        }
        setBodenInternPreviewImageUrl(image);
        setBodenInternPreviewJsonText(json ? JSON.stringify(json, null, 2) : '');
        setBodenInternPreviewMode('content');
        setBodenInternPreviewOpen(true);
    };

    const showBodenInternPdfVorschau =
        isStep5 &&
        activeButtons.intern &&
        bodenInternTrack?.hasData &&
        (bodenInternTrack.pdfUrls.length > 0 ||
            Boolean(bodenInternTrack.image) ||
            Boolean(bodenInternTrack.json));

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
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {showBodenInternPdfVorschau ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-700 border-gray-400 hover:bg-gray-100"
                                    onClick={openBodenInternPdfPreview}
                                >
                                    <FileText className="w-4 h-4 mr-1.5" />
                                    PDF Vorschau
                                    {bodenInternTrack && bodenInternTrack.pdfUrls.length > 1
                                        ? ` (${bodenInternTrack.pdfUrls.length})`
                                        : ''}
                                </Button>
                            ) : isStep5 && activeButtons.intern && bodenInternPdfLoading ? (
                                <span className="inline-flex items-center text-xs text-gray-500">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    PDF wird geladen…
                                </span>
                            ) : null}
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
                                disabled={bodenLoading || activeButtonsLoading}
                            >
                                {bodenLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                                ) : isStep5 && activeButtons.intern ? (
                                    <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                                ) : null}
                                erweitert
                            </Button>
                        </div>
                    </div>
                    <textarea
                        value={internNote}
                        onChange={(e) => setInternNote(e.target.value)}
                        onBlur={onBodenkonstruktionInternNoteBlur}
                        placeholder="Details zur internen Bodenkonstruktion..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                    />
                </div>
            )}
            {bodenOption === 'Extern' && (
                <div className="mt-4 pt-4 border-t border-gray-200/80">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
                        BODENKONSTRUKTION WIRD ZURZEIT EXTERN GEFERTIGT
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <Label className="text-sm font-medium text-gray-800">
                            Hinweise zur externen Bodenkonstruktion
                        </Label>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {isStep5 && activeButtons.extern && bodenExternPdfUrls.length > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-700 border-gray-400 hover:bg-gray-100"
                                    onClick={openBodenExternPdfPreview}
                                >
                                    <FileText className="w-4 h-4 mr-1.5" />
                                    PDF Vorschau
                                    {bodenExternPdfUrls.length > 1 ? ` (${bodenExternPdfUrls.length})` : ''}
                                </Button>
                            ) : isStep5 && activeButtons.extern && bodenExternPdfLoading ? (
                                <span className="inline-flex items-center text-xs text-gray-500">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                    PDF wird geladen…
                                </span>
                            ) : null}
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
                    </div>
                    <textarea
                        value={externNote}
                        onChange={(e) => setExternNote(e.target.value)}
                        onBlur={onBodenkonstruktionExternNoteBlur}
                        placeholder="Details zur externen Bodenkonstruktion..."
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                    />
                </div>
            )}

            <Dialog open={bodenPdfPreviewOpen} onOpenChange={setBodenPdfPreviewOpen}>
                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-4 py-3 border-b shrink-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
                            <DialogTitle className="m-0">PDF Vorschau — Bodenkonstruktion extern</DialogTitle>
                            {bodenPdfPreviewUrl ? (
                                <a
                                    href={bodenPdfPreviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-emerald-700 hover:underline shrink-0"
                                >
                                    In neuem Tab öffnen / Download
                                </a>
                            ) : null}
                        </div>
                        <DialogDescription className="sr-only">
                            Vorschau der externen Bodenkonstruktion-Rechnungen (PDF)
                        </DialogDescription>
                        {bodenExternPdfUrls.length > 1 ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {bodenExternPdfUrls.map((url, idx) => (
                                    <Button
                                        key={url + idx}
                                        type="button"
                                        variant={bodenPdfPreviewUrl === url ? 'default' : 'outline'}
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setBodenPdfPreviewUrl(url)}
                                    >
                                        {idx === 0 ? 'Rechnung' : idx === 1 ? 'Rechnung 2' : `PDF ${idx + 1}`}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </DialogHeader>
                    {bodenPdfPreviewUrl ? (
                        <iframe
                            title="PDF Vorschau Boden"
                            src={bodenPdfPreviewUrl}
                            className="w-full flex-1 min-h-[70vh] border-0 bg-gray-100"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={bodenInternPreviewOpen} onOpenChange={setBodenInternPreviewOpen}>
                <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-4 py-3 border-b shrink-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
                            <DialogTitle className="m-0">
                                {bodenInternPreviewMode === 'pdf'
                                    ? 'PDF Vorschau — Bodenkonstruktion intern'
                                    : 'Vorschau — Bodenkonstruktion intern'}
                            </DialogTitle>
                            {bodenInternPreviewMode === 'pdf' && bodenInternPreviewPdfUrl ? (
                                <a
                                    href={bodenInternPreviewPdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-emerald-700 hover:underline shrink-0"
                                >
                                    In neuem Tab öffnen / Download
                                </a>
                            ) : bodenInternPreviewMode === 'content' && bodenInternPreviewImageUrl ? (
                                <a
                                    href={bodenInternPreviewImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-emerald-700 hover:underline shrink-0"
                                >
                                    Bild in neuem Tab
                                </a>
                            ) : null}
                        </div>
                        <DialogDescription className="sr-only">
                            Vorschau interner Bodenkonstruktion (PDF oder Konfiguration)
                        </DialogDescription>
                        {bodenInternPreviewMode === 'pdf' && bodenInternPreviewPdfUrls.length > 1 ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {bodenInternPreviewPdfUrls.map((url, idx) => (
                                    <Button
                                        key={url + idx}
                                        type="button"
                                        variant={bodenInternPreviewPdfUrl === url ? 'default' : 'outline'}
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setBodenInternPreviewPdfUrl(url)}
                                    >
                                        {idx === 0 ? 'Rechnung' : idx === 1 ? 'Rechnung 2' : `PDF ${idx + 1}`}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </DialogHeader>
                    {bodenInternPreviewMode === 'pdf' && bodenInternPreviewPdfUrl ? (
                        <iframe
                            title="PDF Vorschau Boden intern"
                            src={bodenInternPreviewPdfUrl}
                            className="w-full flex-1 min-h-[70vh] border-0 bg-gray-100"
                        />
                    ) : bodenInternPreviewMode === 'content' ? (
                        <div className="flex flex-1 flex-col gap-3 overflow-auto p-4 min-h-[50vh]">
                            {bodenInternPreviewImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={bodenInternPreviewImageUrl}
                                    alt=""
                                    className="max-h-[45vh] w-full object-contain rounded-lg border border-gray-200 bg-gray-50"
                                />
                            ) : null}
                            {bodenInternPreviewJsonText ? (
                                <pre className="max-h-[40vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 whitespace-pre-wrap wrap-break-word">
                                    {bodenInternPreviewJsonText}
                                </pre>
                            ) : (
                                <p className="text-sm text-gray-500">Keine Vorschaudaten.</p>
                            )}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

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

            <Dialog open={internPopupOpen} onOpenChange={setInternPopupOpen}>
                <DialogContent className="max-w-6xl! h-[95vh] p-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Interne Bodenkonstruktion</DialogTitle>
                        <DialogDescription>
                            Bearbeiten Sie die interne Bodenkonstruktion im eingebetteten Bereich.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="h-full w-full bg-white overflow-y-auto px-6 py-2">
                        <BodenkonstruktionCustomerOrderView
                            embeddedOrderId={orderId}
                            onCloseEmbedded={() => setInternPopupOpen(false)}
                            defaultCustomerName={redirectCustomerName || ""}
                            onStandaloneSave={onStandaloneSave}
                            standalonePrefillKey={standalonePrefillKey}
                            orderStepStatusForApi={stepStatus ?? 'Halbprobe_durchführen'}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

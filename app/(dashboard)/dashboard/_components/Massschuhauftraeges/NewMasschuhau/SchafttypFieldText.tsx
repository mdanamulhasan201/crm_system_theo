'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ShaftPDFPopup, { type ShaftOrderDataForPDF } from '@/components/CustomShafts/ShaftPDFPopup';
import { massschafterstellungJsonToShaftConfiguration } from '@/utils/massschafterstellungJsonToShaftConfiguration';
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
import SchafttypCustomModal, { type MassschafterstellungJson } from './SchafttypCustomModal';
import * as MassschuheAddedApis from '@/apis/MassschuheAddedApis';

/** Track API: legacy booleans or { active: { intern, extern } } or extern: { customShafts, hasData } */
function isSchafttypExternActive(schafttypBlock: any): boolean {
    if (!schafttypBlock || typeof schafttypBlock !== 'object') return false;
    if (typeof schafttypBlock.active?.extern === 'boolean') return schafttypBlock.active.extern;
    if (typeof schafttypBlock.extern === 'boolean') return schafttypBlock.extern;
    const ex = schafttypBlock.extern;
    if (ex && typeof ex === 'object') {
        return Boolean(ex.hasData || (Array.isArray(ex.customShafts) && ex.customShafts.length > 0));
    }
    return false;
}

function isSchafttypInternActive(schafttypBlock: any): boolean {
    if (!schafttypBlock || typeof schafttypBlock !== 'object') return false;
    if (typeof schafttypBlock.active?.intern === 'boolean') return schafttypBlock.active.intern;
    return Boolean(schafttypBlock.intern);
}

function collectInvoiceUrlsFromExternBlock(externBlock: unknown): string[] {
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

/** Intern-Block: Rechnungs-URLs falls vorhanden (zusätzlich zu json/image) */
function collectInvoiceUrlsFromInternBlock(internBlock: unknown): string[] {
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
    onStandaloneSubmit?: (payload: {
        imageFile?: File;
        linkerLeistenFile?: File | null;
        rechterLeistenFile?: File | null;
        zipperImageFile?: File | null;
        paintImageFile?: File | null;
        massschafterstellung_json: MassschafterstellungJson;
    }) => Promise<void>;
    /** Standalone prefill – used as initialData/initialImageUrl when not in step5 mode. */
    standaloneInitialData?: MassschafterstellungJson | null;
    standaloneInitialImageUrl?: string | null;
    /** Called on textarea blur – use for auto-save in standalone context. */
    onSchafttypInternNoteBlur?: () => void;
    onSchafttypExternNoteBlur?: () => void;
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
    onSchafttypInternNoteBlur,
    onSchafttypExternNoteBlur,
}: SchafttypFieldTextProps) {
    const router = useRouter();
    const [externOrderDialogOpen, setExternOrderDialogOpen] = useState(false);
    const [internCustomModalOpen, setInternCustomModalOpen] = useState(false);
    const [activeButtons, setActiveButtons] = useState<{ intern: boolean; extern: boolean }>({
        intern: false,
        extern: false,
    });
    const [activeButtonsLoading, setActiveButtonsLoading] = useState(false);
    const [externPdfUrls, setExternPdfUrls] = useState<string[]>([]);
    const [externPdfLoading, setExternPdfLoading] = useState(false);
    const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [schafttypInternTrack, setSchafttypInternTrack] = useState<{
        json?: MassschafterstellungJson;
        imageUrl?: string;
        hasData: boolean;
        pdfUrls: string[];
    } | null>(null);
    const [internPdfLoading, setInternPdfLoading] = useState(false);
    const [internInvoicePdfOpen, setInternInvoicePdfOpen] = useState(false);
    const [internInvoicePdfUrls, setInternInvoicePdfUrls] = useState<string[]>([]);
    const [internInvoicePdfUrl, setInternInvoicePdfUrl] = useState<string | null>(null);
    const [internShaftPdfPopupOpen, setInternShaftPdfPopupOpen] = useState(false);
    const [massschafterstellungData, setMassschafterstellungData] = useState<{
        json?: MassschafterstellungJson;
        imageUrl?: string;
    } | null>(null);
    const [massschafterstellungLoading, setMassschafterstellungLoading] = useState(false);
    const isStep5 = Boolean(orderId && stepStatus);
    const internNoteRef = useRef(schafttypInternNote);
    const externNoteRef = useRef(schafttypExternNote);

    useEffect(() => {
        internNoteRef.current = schafttypInternNote;
    }, [schafttypInternNote]);

    useEffect(() => {
        externNoteRef.current = schafttypExternNote;
    }, [schafttypExternNote]);

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
            const st = res?.data?.schafttyp;
            setActiveButtons({
                intern: isSchafttypInternActive(st),
                extern: isSchafttypExternActive(st),
            });
            const internNoteFromApi = st?.note?.intern;
            const externNoteFromApi = st?.note?.extern;
            if (
                typeof internNoteFromApi === 'string' &&
                internNoteFromApi.trim() &&
                !internNoteRef.current.trim()
            ) {
                onSchafttypInternNoteChange(internNoteFromApi);
            }
            if (
                typeof externNoteFromApi === 'string' &&
                externNoteFromApi.trim() &&
                !externNoteRef.current.trim()
            ) {
                onSchafttypExternNoteChange(externNoteFromApi);
            }
        } catch {
            setActiveButtons({ intern: false, extern: false });
        } finally {
            setActiveButtonsLoading(false);
        }
    }, [
        orderId,
        onSchafttypInternNoteChange,
        onSchafttypExternNoteChange,
    ]);

    const handleErweitertClick = () => {
        if (isStep5) {
            if (activeButtons.intern && orderId) {
                if (
                    schafttypInternTrack?.hasData &&
                    (schafttypInternTrack.json || schafttypInternTrack.imageUrl)
                ) {
                    setMassschafterstellungData({
                        json: schafttypInternTrack.json,
                        imageUrl: schafttypInternTrack.imageUrl,
                    });
                } else {
                    setMassschafterstellungData(null);
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

    const openSchafttypExternPdfPreview = () => {
        if (externPdfUrls.length === 0) return;
        setPdfPreviewUrl(externPdfUrls[0]);
        setPdfPreviewOpen(true);
    };

    const openSchafttypInternPdfPreview = () => {
        if (!schafttypInternTrack?.hasData) return;
        const { pdfUrls } = schafttypInternTrack;
        if (pdfUrls.length > 0) {
            setInternInvoicePdfUrls(pdfUrls);
            setInternInvoicePdfUrl(pdfUrls[0]);
            setInternInvoicePdfOpen(true);
            return;
        }
        setInternShaftPdfPopupOpen(true);
    };

    const shaftInternPdfOrderData: ShaftOrderDataForPDF = {
        orderNumber: orderId ? `#${orderId}` : undefined,
        customerName: redirectCustomerName?.trim() || 'Kunde',
        productName: 'Maßschaft',
        deliveryDate: new Date().toLocaleDateString('de-DE'),
    };

    const handleMassschafterstellungSubmit = async (payload: {
        imageFile?: File;
        linkerLeistenFile?: File | null;
        rechterLeistenFile?: File | null;
        zipperImageFile?: File | null;
        paintImageFile?: File | null;
        massschafterstellung_json: MassschafterstellungJson;
    }) => {
        if (!orderId) return;
        const formData = new FormData();
        if (payload.imageFile) {
            formData.append('massschafterstellung_image', payload.imageFile);
            formData.append('custom_models_image', payload.imageFile);
        }
        if (payload.rechterLeistenFile) formData.append('massschafterstellung_threeDFile', payload.rechterLeistenFile);
        if (payload.linkerLeistenFile) formData.append('massschafterstellung_threeDFile_2', payload.linkerLeistenFile);
        if (payload.zipperImageFile) formData.append('zipper_image', payload.zipperImageFile);
        if (payload.paintImageFile) formData.append('paintImage', payload.paintImageFile);
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

    // Bei „Extern“: einmal PDF-Track-API → URLs aus customShafts (leer = kein PDF-Button)
    useEffect(() => {
        if (!isStep5 || !orderId || schafttyp !== 'Extern') {
            setExternPdfUrls([]);
            setExternPdfLoading(false);
            return;
        }
        let cancelled = false;
        setExternPdfLoading(true);
        MassschuheAddedApis.getMassschuheOrderTrackActiveButtonSchafttypPdfDownload(orderId, 'extern')
            .then((res: any) => {
                if (cancelled) return;
                const st = res?.data?.schafttyp ?? res?.schafttyp;
                const ext = st?.extern;
                const urls = collectInvoiceUrlsFromExternBlock(
                    typeof ext === 'object' && ext !== null ? ext : null
                );
                setExternPdfUrls(urls);
            })
            .catch(() => {
                if (!cancelled) setExternPdfUrls([]);
            })
            .finally(() => {
                if (!cancelled) setExternPdfLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isStep5, orderId, schafttyp]);

    // Bei „Intern“: Track-PDF-API → gleiche Daten wie für erweitert / Vorschau
    useEffect(() => {
        if (!isStep5 || !orderId || schafttyp !== 'Intern') {
            setSchafttypInternTrack(null);
            setInternPdfLoading(false);
            return;
        }
        let cancelled = false;
        setInternPdfLoading(true);
        MassschuheAddedApis.getMassschuheOrderTrackActiveButtonSchafttypPdfDownload(orderId, 'intern')
            .then((res: any) => {
                if (cancelled) return;
                const st = res?.data?.schafttyp ?? res?.schafttyp;
                const internData = st?.intern;
                if (!internData || typeof internData !== 'object') {
                    setSchafttypInternTrack(null);
                    return;
                }
                const hasData = Boolean(internData.hasData);
                const json = typeof internData.json === 'string'
                    ? (() => {
                          try {
                              return JSON.parse(internData.json) as MassschafterstellungJson;
                          } catch {
                              return undefined;
                          }
                      })()
                    : (internData.json as MassschafterstellungJson | undefined);
                const pdfUrls = collectInvoiceUrlsFromInternBlock(internData);
                setSchafttypInternTrack({
                    json,
                    imageUrl: internData.image ?? undefined,
                    hasData,
                    pdfUrls,
                });
            })
            .catch(() => {
                if (!cancelled) setSchafttypInternTrack(null);
            })
            .finally(() => {
                if (!cancelled) setInternPdfLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [isStep5, orderId, schafttyp]);

    const showInternPdfVorschau =
        isStep5 &&
        activeButtons.intern &&
        schafttypInternTrack?.hasData &&
        (schafttypInternTrack.pdfUrls.length > 0 ||
            Boolean(schafttypInternTrack.imageUrl) ||
            Boolean(schafttypInternTrack.json));

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
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {showInternPdfVorschau ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-gray-700 border-gray-400 hover:bg-gray-100"
                                        onClick={openSchafttypInternPdfPreview}
                                    >
                                        <FileText className="w-4 h-4 mr-1.5" />
                                        PDF Vorschau
                                        {schafttypInternTrack.pdfUrls.length > 1
                                            ? ` (${schafttypInternTrack.pdfUrls.length})`
                                            : ''}
                                    </Button>
                                ) : isStep5 && activeButtons.intern && internPdfLoading ? (
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
                                    disabled={activeButtonsLoading}
                                >
                                    {isStep5 && activeButtons.intern ? (
                                        <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                                    ) : null}
                                    erweitert
                                </Button>
                            </div>
                        </div>
                        <textarea
                            value={schafttypInternNote}
                            onChange={(e) => onSchafttypInternNoteChange(e.target.value)}
                            onBlur={onSchafttypInternNoteBlur}
                            placeholder="Details, Besonderheiten oder Wünsche für den internen Schaft..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                        />
                    </div>
                )}
                {schafttyp === 'Extern' && (
                    <div className="mt-4 pt-4 border-t border-gray-200/80">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-800">
                            SCHAFT WIRD ZURZEIT EXTERN GEFERTIGT
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <Label className="text-sm font-medium text-gray-800">
                                Hinweise zur externen Schaftfertigung
                            </Label>
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {isStep5 && activeButtons.extern && externPdfUrls.length > 0 ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-gray-700 border-gray-400 hover:bg-gray-100"
                                        onClick={openSchafttypExternPdfPreview}
                                    >
                                        <FileText className="w-4 h-4 mr-1.5" />
                                        PDF Vorschau
                                        {externPdfUrls.length > 1 ? ` (${externPdfUrls.length})` : ''}
                                    </Button>
                                ) : isStep5 && activeButtons.extern && externPdfLoading ? (
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
                            value={schafttypExternNote}
                            onChange={(e) => onSchafttypExternNoteChange(e.target.value)}
                            onBlur={onSchafttypExternNoteBlur}
                            placeholder="Notizen für die externe Schaftfertigung..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50/80 p-3 text-sm placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 resize-none"
                        />
                    </div>
                )}
            </div>
            <Dialog open={pdfPreviewOpen} onOpenChange={setPdfPreviewOpen}>
                <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-4 py-3 border-b shrink-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
                            <DialogTitle className="m-0">PDF Vorschau — Schaft extern</DialogTitle>
                            {pdfPreviewUrl ? (
                                <a
                                    href={pdfPreviewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-emerald-700 hover:underline shrink-0"
                                >
                                    In neuem Tab öffnen / Download
                                </a>
                            ) : null}
                        </div>
                        <DialogDescription className="sr-only">
                            Vorschau der externen Schaft-Rechnungen (PDF)
                        </DialogDescription>
                        {externPdfUrls.length > 1 ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {externPdfUrls.map((url, idx) => (
                                    <Button
                                        key={url + idx}
                                        type="button"
                                        variant={pdfPreviewUrl === url ? 'default' : 'outline'}
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setPdfPreviewUrl(url)}
                                    >
                                        {idx === 0 ? 'Rechnung' : idx === 1 ? 'Rechnung 2' : `PDF ${idx + 1}`}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </DialogHeader>
                    {pdfPreviewUrl ? (
                        <iframe
                            title="PDF Vorschau"
                            src={pdfPreviewUrl}
                            className="w-full flex-1 min-h-[70vh] border-0 bg-gray-100"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>

            <Dialog open={internInvoicePdfOpen} onOpenChange={setInternInvoicePdfOpen}>
                <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="px-4 py-3 border-b shrink-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
                            <DialogTitle className="m-0">PDF Vorschau — Schaft intern (Rechnung)</DialogTitle>
                            {internInvoicePdfUrl ? (
                                <a
                                    href={internInvoicePdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-emerald-700 hover:underline shrink-0"
                                >
                                    In neuem Tab öffnen / Download
                                </a>
                            ) : null}
                        </div>
                        <DialogDescription className="sr-only">
                            Vorschau Rechnungs-PDFs zur internen Schaftfertigung
                        </DialogDescription>
                        {internInvoicePdfUrls.length > 1 ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {internInvoicePdfUrls.map((url, idx) => (
                                    <Button
                                        key={url + idx}
                                        type="button"
                                        variant={internInvoicePdfUrl === url ? 'default' : 'outline'}
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setInternInvoicePdfUrl(url)}
                                    >
                                        {idx === 0 ? 'Rechnung' : idx === 1 ? 'Rechnung 2' : `PDF ${idx + 1}`}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                    </DialogHeader>
                    {internInvoicePdfUrl ? (
                        <iframe
                            title="PDF Vorschau Schaft intern"
                            src={internInvoicePdfUrl}
                            className="w-full flex-1 min-h-[70vh] border-0 bg-gray-100"
                        />
                    ) : null}
                </DialogContent>
            </Dialog>

            {internShaftPdfPopupOpen && schafttypInternTrack && (
                <ShaftPDFPopup
                    isOpen={internShaftPdfPopupOpen}
                    onClose={() => setInternShaftPdfPopupOpen(false)}
                    onConfirm={() => setInternShaftPdfPopupOpen(false)}
                    orderData={shaftInternPdfOrderData}
                    shaftImage={schafttypInternTrack.imageUrl ?? null}
                    shaftConfiguration={massschafterstellungJsonToShaftConfiguration(
                        (schafttypInternTrack.json ?? {}) as MassschafterstellungJson
                    )}
                    hideAbschliessen={true}
                />
            )}

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
                enablePdfAfterSubmit={!isStep5}
            />
        </>
    );
}

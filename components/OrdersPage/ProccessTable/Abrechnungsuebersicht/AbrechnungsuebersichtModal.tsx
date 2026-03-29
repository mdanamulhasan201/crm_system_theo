'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getKvaData, getPriseDetails, getWerkstattzettelSheetPdfData } from '@/apis/productsOrder';
import { generatePdfFromElement, pdfPresets } from '@/lib/pdfGenerator';
import { generateFootScanPairPdfBlob } from '@/lib/footScanPairPdf';
import KvaSheet, { KvaData } from '../KvaPdf/KvaSheet';
import WerkstattzettelSheet, { WerkstattzettelSheetData } from '../WerkstattzettelPdf/WerkstattzettelSheet';
import HistoryModal from './HistoryModal';
import { FileText, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export interface PriceDetailPosition {
    id: string;
    price: number;
    description: string | { IVA?: string; title?: string; subtitle?: string; Quantità?: string; positionsnummer?: string; Seite?: string };
    vat_country?: string | null;
}

export interface PriceDetailsData {
    discount?: number;
    addonPrices?: number;
    /** Eigenanteil (AT) in EUR. When null, do NOT show the AT row in Zahlungsaufteilung. */
    austria_price?: number | null;
    insuranceTotalPrice?: number;
    privatePrice?: number | null;
    bezahlt?: string;
    orderStatus?: string;
    orderCategory?: string;
    totalPrice: number;
    fussanalysePreis?: number;
    einlagenversorgungPreis?: number;
    quantity?: number;
    /** VAT rate in percent (e.g. 19, 20). Used for net/MwSt calculation. */
    vatRate?: number | null;
    /** API may return paymnentType (typo). Values: broth | private | insurance */
    paymnentType?: string | null;
    paymentType?: string | null;
    insurance_payed?: boolean | null;
    private_payed?: boolean | null;
    Versorgungen?: {
        supplyStatus?: { price?: number; vatRate?: number };
    };
    customerOrderInsurances?: PriceDetailPosition[];
    partner?: {
        accountInfos?: Array<{
            vat_country?: string | null;
        }>;
    };
}

interface AbrechnungsuebersichtModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    customerName?: string;
    orderNumber?: string;
    onInvoiceDownload?: (orderId: string) => void;
    /** When false, Kostenvoranschlag is hidden (same rule as ProcessTable actions: `order.kva === true`). */
    kvaEligible?: boolean;
    /** When false, first action generates KVA number (table parity). Ignored when `onKvaDownload` is not passed. */
    kvaNumberAvailable?: boolean;
    /** Uses ProcessTable flow (shipping address modal + PDF). When omitted, modal keeps inline KVA PDF. */
    onKvaDownload?: (orderId: string) => void | Promise<void>;
    kvaDownloadLoading?: boolean;
    onGenerateKvaNumber?: () => void | Promise<void>;
    isGeneratingKvaNumber?: boolean;
}

function formatEuro(value: number): string {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function formatEuroLeading(value: number): string {
    return '€ ' + value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatEuroCompact(value: number): string {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';
}

function formatDescription(desc: unknown): string {
    if (desc == null) return '—';
    if (typeof desc === 'string') return desc.trim() || '—';
    if (typeof desc !== 'object') return String(desc);
    const obj = desc as Record<string, unknown>;
    const title = typeof obj.title === 'string' ? obj.title.trim() : '';
    const subtitle = typeof obj.subtitle === 'string' ? obj.subtitle.trim() : '';
    const positionsnummer = typeof obj.positionsnummer === 'string' ? obj.positionsnummer.trim() : '';
    if (title && subtitle) return `${title} - ${subtitle}`;
    return title || subtitle || positionsnummer || '—';
}

function getSeiteFromDescription(desc: unknown): string {
    if (desc == null || typeof desc !== 'object') return '—';
    const obj = desc as Record<string, unknown>;
    const seite = obj.Seite ?? obj.seite;
    return typeof seite === 'string' ? seite.trim() || '—' : '—';
}

function getPositionsnummerFromDescription(desc: unknown): string | null {
    if (desc == null || typeof desc !== 'object') return null;
    const obj = desc as Record<string, unknown>;
    const num = obj.positionsnummer;
    return typeof num === 'string' ? num.trim() || null : null;
}

const BESCHREIBUNG_MAX_LENGTH = 70;

function truncateDescription(text: string, maxLen: number = BESCHREIBUNG_MAX_LENGTH): string {
    if (!text || text.length <= maxLen) return text;
    return text.slice(0, maxLen).trim() + '…';
}

export default function AbrechnungsuebersichtModal({
    isOpen,
    onClose,
    orderId,
    customerName = '',
    orderNumber = '',
    onInvoiceDownload,
    kvaEligible = true,
    kvaNumberAvailable = true,
    onKvaDownload,
    kvaDownloadLoading = false,
    onGenerateKvaNumber,
    isGeneratingKvaNumber = false,
}: AbrechnungsuebersichtModalProps) {
    const useTableKvaFlow = onKvaDownload != null;
    const showKvaButton = !useTableKvaFlow || kvaEligible;
    const [data, setData] = useState<PriceDetailsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullDescriptionText, setFullDescriptionText] = useState<string | null>(null);
    const [isGeneratingKvaPdf, setIsGeneratingKvaPdf] = useState(false);
    const [kvaPdfData, setKvaPdfData] = useState<KvaData | null>(null);
    const [kvaPdfLogoProxy, setKvaPdfLogoProxy] = useState<string | null>(null);
    const KVA_PDF_ELEMENT_ID = 'kva-sheet-pdf-billing-modal';
    const [isGeneratingWerkPdf, setIsGeneratingWerkPdf] = useState(false);
    const [werkPdfData, setWerkPdfData] = useState<WerkstattzettelSheetData | null>(null);
    const [werkPdfLogoProxy, setWerkPdfLogoProxy] = useState<string | null>(null);
    const WERK_PDF_ELEMENT_ID = 'werk-sheet-pdf-billing-modal';
    const [showHistorieModal, setShowHistorieModal] = useState(false);

    const getProxyImageUrl = (url: string) => {
        if (!url) return url;
        if (url.startsWith('/api/proxy-image?url=')) return url;
        const abs = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
        return `/api/proxy-image?url=${encodeURIComponent(abs)}`;
    };

    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const downloadBlob = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
    };

    const handleKvaDownload = async () => {
        if (!orderId || isGeneratingKvaPdf) return;
        setIsGeneratingKvaPdf(true);
        try {
            const res = await getKvaData(orderId);
            if (!res?.success || !res?.data) {
                toast.error(res?.message || 'KVA Daten konnten nicht geladen werden');
                return;
            }
            const kvaData: KvaData = res.data;
            setKvaPdfData(kvaData);
            setKvaPdfLogoProxy(kvaData.logo ? getProxyImageUrl(kvaData.logo) : null);

            await nextFrame();
            await nextFrame();

            const pdfBlob = await generatePdfFromElement(KVA_PDF_ELEMENT_ID, pdfPresets.document);
            const safeName = (kvaData?.customerInfo?.firstName || 'KVA').toString().trim().replace(/\s+/g, '_');
            downloadBlob(pdfBlob, `Kostenvoranschlag_${safeName}.pdf`);
        } catch (e) {
            console.error('KVA PDF error:', e);
            toast.error('Fehler beim Erstellen des KVA PDFs');
        } finally {
            setIsGeneratingKvaPdf(false);
            setTimeout(() => {
                setKvaPdfData(null);
                setKvaPdfLogoProxy(null);
            }, 1500);
        }
    };

    const handleWerkstattzettelDownload = async () => {
        if (!orderId || isGeneratingWerkPdf) return;
        setIsGeneratingWerkPdf(true);
        try {
            const res = await getWerkstattzettelSheetPdfData(orderId);
            if (!res?.success || !res?.data) {
                toast.error(res?.message || 'Werkstattzettel Daten konnten nicht geladen werden');
                return;
            }
            const sheetData: WerkstattzettelSheetData = res.data;
            setWerkPdfData(sheetData);
            setWerkPdfLogoProxy(sheetData.logo ? getProxyImageUrl(sheetData.logo) : null);

            await nextFrame();
            await nextFrame();

            const pdfBlob = await generatePdfFromElement(WERK_PDF_ELEMENT_ID, pdfPresets.document);
            const safeName = (sheetData.customerName || 'Kunde').toString().trim().replace(/\s+/g, '_');
            downloadBlob(pdfBlob, `Werkstattzettel_${safeName}.pdf`);

            if (
                sheetData.otherPdfPrint === true &&
                sheetData.otherPdfData &&
                (sheetData.otherPdfData.footImage23 || sheetData.otherPdfData.footImage24)
            ) {
                try {
                    const footBlob = await generateFootScanPairPdfBlob({
                        logoUrl: sheetData.logo,
                        customerName: String(sheetData.customerName || 'Kunde'),
                        kdnr: sheetData.auftragsnr,
                        leftImageUrl: sheetData.otherPdfData.footImage23,
                        rightImageUrl: sheetData.otherPdfData.footImage24,
                        footLength: sheetData.otherPdfData.footLength,
                        autoSendToProd: sheetData.autoSendToProd === true,
                    });
                    downloadBlob(footBlob, `Fussanalyse_${safeName}.pdf`);
                } catch (footErr) {
                    console.error('Fußanalyse PDF error:', footErr);
                    toast.error('Fußanalyse-PDF (2 Seiten) konnte nicht erstellt werden.');
                }
            }
        } catch (e) {
            console.error('Werkstattzettel PDF error:', e);
            toast.error('Fehler beim Erstellen des Werkstattzettel PDFs');
        } finally {
            setIsGeneratingWerkPdf(false);
            setTimeout(() => {
                setWerkPdfData(null);
                setWerkPdfLogoProxy(null);
            }, 1500);
        }
    };

    useEffect(() => {
        if (!isOpen || !orderId) {
            setData(null);
            setError(null);
            setFullDescriptionText(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        getPriseDetails(orderId)
            .then((res: { success?: boolean; data?: PriceDetailsData }) => {
                if (cancelled) return;
                if (res?.success && res?.data) {
                    setData(res.data);
                } else {
                    setError('Keine Daten erhalten');
                }
            })
            .catch((err) => {
                if (cancelled) return;
                setError((err as Error)?.message || 'Fehler beim Laden der Abrechnungsdaten');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [isOpen, orderId]);

    const vatRate = data?.vatRate != null ? data.vatRate : 19;
    const vatDivisor = 1 + vatRate / 100;
    const netto = data ? data.totalPrice / vatDivisor : 0;
    const mwst = data ? data.totalPrice - netto : 0;

    const privatePrice = data?.privatePrice ?? 0;
    const insuranceTotalPrice = data?.insuranceTotalPrice ?? 0;
    const normalizedPaymentType = data?.paymnentType ?? data?.paymentType ?? '';

    const categoryLabel = data?.orderCategory === 'insole' ? 'Einlage' : data?.orderCategory === 'milling_block' ? 'Fräsblock' : data?.orderCategory || '';
    const bezahltValue = data?.bezahlt != null ? String(data.bezahlt).trim() : '';
    // Same color logic as Preis column: KK = blue (genehmigt/payed) or red (ungenehmigt); Privat = emerald (bezahlt) or orange (offen)
    const insurancePayed = !!data?.insurance_payed;
    const privatePayed = !!data?.private_payed;
    const insuranceAmountColorClass =
        bezahltValue.includes('Krankenkasse_Genehmigt') || insurancePayed ? 'text-blue-600' : 'text-red-600';
    const privateAmountColorClass =
        bezahltValue.includes('Privat_Bezahlt') || privatePayed ? 'text-emerald-600' : 'text-orange-600';
    const paymentTags = Array.from(
        new Set(
            bezahltValue
                .split('|')
                .map((entry) => entry.trim())
                .filter(Boolean)
                .map((entry) => {
                    if (entry.startsWith('Privat')) return 'Privat';
                    if (entry.startsWith('Krankenkasse')) return 'Krankenkasse';
                    return '';
                })
                .filter(Boolean)
        )
    );
    if (paymentTags.length === 0) {
        if (normalizedPaymentType === 'private') {
            paymentTags.push('Privat');
        } else if (normalizedPaymentType === 'insurance') {
            paymentTags.push('Krankenkasse');
        } else if (normalizedPaymentType === 'broth') {
            if (bezahltValue.includes('Krankenkasse') || insuranceTotalPrice > 0) {
                paymentTags.push('Krankenkasse');
            }
            if (bezahltValue.includes('Privat') || privatePrice > 0) {
                paymentTags.push('Privat');
            }
        }
    }
    // Only show "Genehmigt" when payment status is exactly Krankenkasse_Genehmigt (not for Privat or Ungenehmigt)
    const genehmigtTag = bezahltValue === 'Krankenkasse_Genehmigt' ? 'Genehmigt' : null;

    const positions = data?.customerOrderInsurances ?? [];
    const positionsTotalPrice = positions.reduce((sum, row) => sum + (Number(row.price) || 0), 0);
    const positionsNettoTotal = vatDivisor > 0 && vatRate > 0 ? positionsTotalPrice / vatDivisor : positionsTotalPrice;
    const positionsMwstTotal = positionsTotalPrice - positionsNettoTotal;
    const totalPrice = data?.totalPrice ?? 0;
    const quantity = Math.max(data?.quantity ?? 1, 1);
    const versorgungPrice = data?.einlagenversorgungPreis ?? ((data?.Versorgungen?.supplyStatus?.price ?? 0) * quantity);
    const footAnalysisPrice = data?.fussanalysePreis ?? 0;
    const hasAddonPrices = data?.addonPrices != null;
    const addonPrices = data?.addonPrices ?? 0;
    const discount = data?.discount ?? 0;
    const vatCountry = data?.partner?.accountInfos?.[0]?.vat_country ?? null;
    const isAustriaAccount = vatCountry === 'Österreich (AT)';
    const isInsoleCategory = data?.orderCategory === 'insole';
    const fallbackInsuranceTotal = positionsTotalPrice;
    const displayInsuranceTotal = isInsoleCategory
        ? positionsTotalPrice
        : insuranceTotalPrice > 0
            ? insuranceTotalPrice
            : bezahltValue.includes('Krankenkasse')
                ? fallbackInsuranceTotal
                : 0;
    const displayPrivateTotalDerived = Math.max(totalPrice - displayInsuranceTotal, 0);
    const displayPrivateTotalBase =
        privatePrice > 0
            ? privatePrice
            : bezahltValue.includes('Privat') && !bezahltValue.includes('Krankenkasse')
                ? totalPrice
                : displayInsuranceTotal > 0 && totalPrice > displayInsuranceTotal
                    ? (totalPrice - displayInsuranceTotal)
                    : 0;
    // For insole we need a consistent split where Privat + Versicherung = totalPrice.
    const displayPrivateTotal = isInsoleCategory ? displayPrivateTotalDerived : displayPrivateTotalBase;
    const subtotalBeforeEigenanteil = Math.max(versorgungPrice + footAnalysisPrice + addonPrices - discount, 0);
    // Use backend-provided eigenanteil (AT) as the single source of truth.
    // If austria_price is null, we treat it as "no eigenanteil" and hide the row.
    const eigenanteilAt =
        data?.austria_price != null ? Math.max(Number(data.austria_price) || 0, 0) : 0;
    const summarySubtotal = Math.max(totalPrice - eigenanteilAt, 0);

    // Backend's privatePrice already includes: Fußanalyse + Eigenanteil (AT) + Wirtschaftlicher Aufpreis
    // So we can derive Wirtschaftlicher Aufpreis reliably from the same fields.
    const wirtschaftlicherAufpreis =
        Math.max(privatePrice - eigenanteilAt - footAnalysisPrice, 0);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                    <DialogHeader className="px-6 pt-6 pb-3 border-b border-gray-100">
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            Abrechnungsübersicht
                        </DialogTitle>
                        <p className="text-sm text-gray-600 mt-1">
                            {customerName} #{orderNumber}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {categoryLabel && (
                                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                    {categoryLabel}
                                </span>
                            )}
                            {paymentTags.map((tag) => (
                                <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                    {tag}
                                </span>
                            ))}
                            {genehmigtTag && (
                                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                                    {genehmigtTag}
                                </span>
                            )}
                        </div>
                    </DialogHeader>

                    <div className="px-6 py-5 space-y-6">
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-200 border-t-emerald-600" />
                            </div>
                        )}
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                        {!loading && !error && data && (
                            <>
                                {/* GESAMTBETRAG */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                                    <h3 className="text-xs font-semibold text-black uppercase tracking-wide mb-2">
                                        Gesamtbetrag
                                    </h3>
                                    <p className="text-2xl font-bold text-black">
                                        {formatEuro(data.totalPrice)}
                                    </p>
                                    <div className="mt-3 space-y-1.5">
                                        <div className={`text-lg font-semibold ${insuranceAmountColorClass}`}>
                                            KK: {formatEuro(displayInsuranceTotal)}
                                        </div>
                                        <div className={`text-lg font-semibold ${privateAmountColorClass}`}>
                                            Privat: {formatEuro(displayPrivateTotal)}
                                        </div>
                                    </div>
                                    {/* <p className="text-sm text-gray-600 mt-1">
                                    Netto {formatEuro(netto)} · MwSt 19% ({formatEuro(mwst)})
                                </p> */}
                                </div>

                                {/* ZAHLUNGSAUFTEILUNG */}
                                <div className="rounded-xl border border-gray-200 bg-[#f6f7f8] p-0 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-gray-200 bg-white">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Zahlungsaufteilung
                                        </h3>
                                    </div>
                                    <div className="px-5 py-4">
                                        <div className="space-y-4 text-sm">
                                            {data.orderCategory === 'insole' && (
                                                <>
                                                    {positions.length > 0 && (
                                                        <>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-gray-700">Netto:</span>
                                                                <span className="font-medium text-gray-900">{formatEuroCompact(positionsNettoTotal)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-gray-700">+ {vatRate}% MwSt.:</span>
                                                                <span className="font-medium text-gray-900">{formatEuroCompact(positionsMwstTotal)}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-gray-700">Positionen (inkl. MwSt.)</span>
                                                                <span className="font-medium text-gray-900">{formatEuroCompact(positionsTotalPrice)}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Einlagenversorgung</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(versorgungPrice)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Menge</span>
                                                        <span className="font-medium text-gray-900">× {quantity}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Fußanalyse</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(footAnalysisPrice)}</span>
                                                    </div>
                                                    {discount !== 0 && (
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-gray-700">Rabatt</span>
                                                            <span className="font-medium text-gray-900">{formatEuroCompact(-discount)}</span>
                                                        </div>
                                                    )}
                                                    {hasAddonPrices ? (
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-gray-700">Aufpreis</span>
                                                            <span className="font-medium text-gray-900">{formatEuroCompact(addonPrices)}</span>
                                                        </div>
                                                    ): null}
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Enthält Eigenanteil (AT)</span>
                                                        <span className="font-medium text-amber-600">{formatEuroCompact(eigenanteilAt)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Wirtschaftlicher Aufpreis</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(wirtschaftlicherAufpreis)}</span>
                                                    </div>
                                                </>
                                            )}
                                            {data.orderCategory !== 'insole' && (
                                                <>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Privat</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(displayPrivateTotal)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Krankenkasse</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(displayInsuranceTotal)}</span>
                                                    </div>
                                                </>
                                            )}
                                            <div className="border-t border-gray-300 pt-4">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-base font-medium text-gray-700">Zwischensumme</span>
                                                    <span className="text-base font-semibold text-gray-900">{formatEuroCompact(summarySubtotal)}</span>
                                                </div>
                                            </div>
                                            {data.orderCategory === 'insole' ? (
                                                <div className="border-t border-gray-400 pt-4 space-y-2">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Privat</span>
                                                        <span className={`font-medium ${privateAmountColorClass}`}>{formatEuroCompact(displayPrivateTotal)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Versicherung</span>
                                                        <span className={`font-medium ${insuranceAmountColorClass}`}>{formatEuroCompact(displayInsuranceTotal)}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="border-t border-gray-400 pt-4">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-xl font-bold text-gray-900">Gesamt</span>
                                                        <span className="text-2xl font-bold text-emerald-600">{formatEuroCompact(totalPrice)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* POSITIONEN */}
                                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                            Positionen
                                        </h3>
                                    </div>
                                    <div className="p-4 bg-[#f5f5f5] space-y-3">
                                        {positions.length === 0 ? (
                                            <div className="rounded-lg bg-white border border-gray-100 shadow-sm p-6 text-sm text-gray-500 text-center flex items-center justify-center min-h-[96px]">
                                                Daten sind derzeit nicht verfugbar.
                                            </div>
                                        ) : (
                                            positions.map((row, idx) => {
                                                const posNum = getPositionsnummerFromDescription(row.description) ?? (idx + 1).toString().padStart(2, '0');
                                                const desc = formatDescription(row.description);
                                                const seite = getSeiteFromDescription(row.description);
                                                const rowNetto = row.price / vatDivisor;
                                                const rowMwst = row.price - rowNetto;
                                                return (
                                                    <div
                                                        key={row.id}
                                                        className="rounded-lg bg-white border border-gray-100 shadow-sm p-4 flex flex-wrap items-start justify-between gap-4"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm text-gray-800 leading-snug">
                                                                <span className="font-semibold text-gray-900">{posNum}</span>
                                                                <span className="text-gray-700"> — </span>
                                                                <span
                                                                    className="cursor-pointer hover:text-gray-600 transition-colors text-gray-700"
                                                                    onClick={() => setFullDescriptionText(desc)}
                                                                    title="Klicken für vollständige Beschreibung"
                                                                >
                                                                    {truncateDescription(desc)}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2 text-sm shrink-0">
                                                            {seite && seite !== '—' && (
                                                                <span className="inline-flex px-2.5 py-1 rounded-md text-emerald-700 bg-emerald-100 text-xs font-medium">
                                                                    Seite: {seite}
                                                                </span>
                                                            )}
                                                            <span className="text-gray-600">Netto: {formatEuroLeading(rowNetto)}</span>
                                                            <span className="text-gray-600">+ {vatRate}% MwSt.: {formatEuroLeading(rowMwst)}</span>
                                                            <span className="font-bold text-emerald-600">Gesamt: {formatEuroLeading(row.price)}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    {positions.length > 0 && (
                                        <div className="px-4 py-4 bg-white rounded-b-xl border-t border-gray-100">
                                            <div className="flex justify-between text-sm font-bold text-gray-900">
                                                <span>Gesamt:</span>
                                                <span className="text-emerald-600">{formatEuroLeading(positionsTotalPrice)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* DOKUMENTE */}
                                <div className="rounded-xl border border-gray-200 p-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Dokumente
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {/* {onInvoiceDownload && orderId && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400"
                                            disabled
                                        >
                                            <Receipt className="w-4 h-4" />
                                            Rechnung öffnen
                                        </Button>
                                    )} */}
                                        {showKvaButton &&
                                            (useTableKvaFlow ? (
                                                <TooltipProvider delayDuration={200}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className={cn(
                                                                    'gap-2 cursor-pointer',
                                                                    !kvaNumberAvailable &&
                                                                        !isGeneratingKvaNumber &&
                                                                        'opacity-50'
                                                                )}
                                                                disabled={kvaDownloadLoading || isGeneratingKvaNumber}
                                                                onClick={async () => {
                                                                    if (!orderId) return;
                                                                    if (kvaNumberAvailable) {
                                                                        await onKvaDownload(orderId);
                                                                    } else {
                                                                        await onGenerateKvaNumber?.();
                                                                    }
                                                                }}
                                                            >
                                                                {kvaDownloadLoading || isGeneratingKvaNumber ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <FileText className="w-4 h-4" />
                                                                )}
                                                                {kvaDownloadLoading
                                                                    ? 'KVA...'
                                                                    : isGeneratingKvaNumber
                                                                      ? 'KVA Nummer wird generiert...'
                                                                      : 'KVA'}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        {!kvaNumberAvailable && !isGeneratingKvaNumber && (
                                                            <TooltipContent
                                                                side="top"
                                                                align="center"
                                                                sideOffset={4}
                                                                className="text-xs px-2 py-1"
                                                            >
                                                                KVA-Nummer generieren
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 cursor-pointer"
                                                    onClick={handleKvaDownload}
                                                    disabled={isGeneratingKvaPdf}
                                                >
                                                    {isGeneratingKvaPdf ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <FileText className="w-4 h-4" />
                                                    )}
                                                    {isGeneratingKvaPdf ? 'Wird erstellt...' : 'KVA'}
                                                </Button>
                                            ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 cursor-pointer"
                                            onClick={handleWerkstattzettelDownload}
                                            disabled={isGeneratingWerkPdf}
                                        >
                                            {isGeneratingWerkPdf
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <FileText className="w-4 h-4" />
                                            }
                                            {isGeneratingWerkPdf ? 'Wird erstellt...' : 'Werkstattzettel'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 cursor-pointer"
                                            onClick={() => setShowHistorieModal(true)}
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            Historie
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden KVA sheet for PDF generation */}
            <div className="fixed left-[-10000px] top-0 opacity-0 pointer-events-none">
                <div id={KVA_PDF_ELEMENT_ID}>
                    {kvaPdfData ? <KvaSheet data={kvaPdfData} logoProxyUrl={kvaPdfLogoProxy} /> : null}
                </div>
            </div>

            {/* Hidden Werkstattzettel sheet for PDF generation */}
            <div className="fixed left-[-10000px] top-0 opacity-0 pointer-events-none">
                <div id={WERK_PDF_ELEMENT_ID}>
                    {werkPdfData ? <WerkstattzettelSheet data={werkPdfData} logoProxyUrl={werkPdfLogoProxy} /> : null}
                </div>
            </div>

            {/* Historie Modal */}
            <HistoryModal
                isOpen={showHistorieModal}
                onClose={() => setShowHistorieModal(false)}
                orderId={orderId}
                orderNumber={orderNumber}
            />

            {/* Full description popup on click */}
            <Dialog open={!!fullDescriptionText} onOpenChange={(open) => !open && setFullDescriptionText(null)}>
                <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-base">Beschreibung</DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto py-2 pr-2 -mr-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{fullDescriptionText}</p>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                        <Button variant="outline" size="sm" onClick={() => setFullDescriptionText(null)} className="cursor-pointer">
                            Schließen
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

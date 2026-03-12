'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPriseDetails } from '@/apis/productsOrder';
import { FileText, Receipt, ShieldCheck, History } from 'lucide-react';

export interface PriceDetailPosition {
    id: string;
    price: number;
    description: string | { IVA?: string; title?: string; subtitle?: string; Quantità?: string; positionsnummer?: string; Seite?: string };
    vat_country?: string | null;
}

export interface PriceDetailsData {
    discount?: number;
    addonPrices?: number;
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
}: AbrechnungsuebersichtModalProps) {
    const [data, setData] = useState<PriceDetailsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullDescriptionText, setFullDescriptionText] = useState<string | null>(null);

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
    const totalPrice = data?.totalPrice ?? 0;
    const quantity = Math.max(data?.quantity ?? 1, 1);
    const versorgungPrice = data?.einlagenversorgungPreis ?? ((data?.Versorgungen?.supplyStatus?.price ?? 0) * quantity);
    const footAnalysisPrice = data?.fussanalysePreis ?? 0;
    const addonPrices = data?.addonPrices ?? 0;
    const discount = data?.discount ?? 0;
    const vatCountry = data?.partner?.accountInfos?.[0]?.vat_country ?? null;
    const isAustriaAccount = vatCountry === 'Österreich (AT)';
    const fallbackInsuranceTotal = positions.reduce((sum, row) => sum + (Number(row.price) || 0), 0);
    const displayInsuranceTotal =
        insuranceTotalPrice > 0
            ? insuranceTotalPrice
            : bezahltValue.includes('Krankenkasse')
                ? fallbackInsuranceTotal
                : 0;
    const displayPrivateTotal =
        privatePrice > 0
            ? privatePrice
            : bezahltValue.includes('Privat') && !bezahltValue.includes('Krankenkasse')
                ? totalPrice
                : displayInsuranceTotal > 0 && totalPrice > displayInsuranceTotal
                    ? (totalPrice - displayInsuranceTotal)
                    : 0;
    const subtotalBeforeEigenanteil = Math.max(versorgungPrice + footAnalysisPrice + addonPrices - discount, 0);
    const eigenanteilAt = isAustriaAccount ? Math.max(totalPrice - subtotalBeforeEigenanteil, 0) : 0;
    const summarySubtotal = Math.max(totalPrice - eigenanteilAt, 0);

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
                                {(displayInsuranceTotal > 0 || displayPrivateTotal > 0) && (
                                    <div className="mt-3 space-y-1.5">
                                        {displayInsuranceTotal > 0 && (
                                            <div className="text-lg font-semibold text-black">
                                                KK: {formatEuro(displayInsuranceTotal)}
                                            </div>
                                        )}
                                        {displayPrivateTotal > 0 && (
                                            <div className="text-lg font-semibold text-black">
                                                Privat: {formatEuro(displayPrivateTotal)}
                                            </div>
                                        )}
                                    </div>
                                )}
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
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-gray-700">Versorgung</span>
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
                                                {addonPrices > 0 && (
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Aufpreis</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(addonPrices)}</span>
                                                    </div>
                                                )}
                                                {eigenanteilAt > 0 && (
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Enthält Eigenanteil (AT)</span>
                                                        <span className="font-medium text-amber-600">{formatEuroCompact(eigenanteilAt)}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        {data.orderCategory !== 'insole' && (
                                            <>
                                                {displayPrivateTotal > 0 && (
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Privat</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(displayPrivateTotal)}</span>
                                                    </div>
                                                )}
                                                {displayInsuranceTotal > 0 && (
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-gray-700">Krankenkasse</span>
                                                        <span className="font-medium text-gray-900">{formatEuroCompact(displayInsuranceTotal)}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="border-t border-gray-300 pt-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-base font-medium text-gray-700">Zwischensumme</span>
                                                <span className="text-base font-semibold text-gray-900">{formatEuroCompact(summarySubtotal)}</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-gray-400 pt-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-xl font-bold text-gray-900">Gesamt</span>
                                                <span className="text-2xl font-bold text-emerald-600">{formatEuroCompact(totalPrice)}</span>
                                            </div>
                                        </div>
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
                                        <span className="text-emerald-600">{formatEuroLeading(data.totalPrice)}</span>
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
                                     <Button variant="outline" size="sm" className="gap-2 cursor-pointer" disabled>
                                     <Receipt className="w-4 h-4" />
                                        Rechnung öffnen
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer" disabled>
                                        <FileText className="w-4 h-4" />
                                        KVA öffnen
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer" disabled>
                                        <ShieldCheck className="w-4 h-4" />
                                        Bewilligung öffnen
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer" disabled>
                                        <History className="w-4 h-4" />
                                        Zahlungshistorie
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>

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

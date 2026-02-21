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
    bezahlt?: string;
    orderStatus?: string;
    orderCategory?: string;
    totalPrice: number;
    fussanalysePreis?: number;
    einlagenversorgungPreis?: number;
    quantity?: number;
    Versorgungen?: {
        supplyStatus?: { price?: number; vatRate?: number };
    };
    customerOrderInsurances?: PriceDetailPosition[];
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

    const netto = data ? data.totalPrice / 1.19 : 0;
    const mwst = data ? data.totalPrice - netto : 0;
    const isPaid = data?.bezahlt === 'Privat_Bezahlt' || data?.bezahlt === 'Krankenkasse_Genehmigt';
    const paidAmount = data && isPaid ? data.totalPrice : 0;
    const restOffen = data ? data.totalPrice - paidAmount : 0;

    const categoryLabel = data?.orderCategory === 'insole' ? 'Einlage' : data?.orderCategory === 'milling_block' ? 'Fräsblock' : data?.orderCategory || '';
    const paymentTag = data?.bezahlt?.includes('Privat') ? 'Privat' : data?.bezahlt?.includes('Krankenkasse') ? 'Krankenkasse' : '';
    // Only show "Genehmigt" when payment status is exactly Krankenkasse_Genehmigt (not for Privat or Ungenehmigt)
    const bezahltValue = data?.bezahlt != null ? String(data.bezahlt).trim() : '';
    const genehmigtTag = bezahltValue === 'Krankenkasse_Genehmigt' ? 'Genehmigt' : null;

    const positions = data?.customerOrderInsurances ?? [];

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
                        {paymentTag && (
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                {paymentTag}
                            </span>
                        )}
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
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                    Gesamtbetrag
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatEuro(data.totalPrice)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Netto {formatEuro(netto)} · MwSt 19% ({formatEuro(mwst)})
                                </p>
                            </div>

                            {/* ZAHLUNGSAUFTEILUNG */}
                            <div className="rounded-xl border border-gray-200 p-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Zahlungsaufteilung
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Kunde zahlt gesamt</span>
                                        <span className="font-medium">{formatEuro(data.totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Bereits bezahlt</span>
                                        <span className={`font-medium ${paidAmount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                            {formatEuro(paidAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rest offen</span>
                                        <span className="font-medium">{formatEuro(restOffen)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* POSITIONEN */}
                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Positionen
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 bg-gray-50/80">
                                                <th className="text-left py-2.5 px-3 font-medium text-gray-600">Pos.</th>
                                                <th className="text-left py-2.5 px-3 font-medium text-gray-600">Beschreibung</th>
                                                <th className="text-left py-2.5 px-3 font-medium text-gray-600">Seite</th>
                                                <th className="text-right py-2.5 px-3 font-medium text-gray-600">Einzel</th>
                                                <th className="text-right py-2.5 px-3 font-medium text-gray-600">Gesamt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {positions.map((row, idx) => (
                                                <tr key={row.id} className="border-b border-gray-100">
                                                    <td className="py-2.5 px-3 text-gray-700">
                                                        {(idx + 1).toString().padStart(2, '0')}
                                                    </td>
                                                    <td
                                                        className="py-2.5 px-3 text-gray-900 max-w-[220px] cursor-pointer hover:bg-gray-50 rounded transition-colors"
                                                        onClick={() => setFullDescriptionText(formatDescription(row.description))}
                                                        title="Klicken für vollständige Beschreibung"
                                                    >
                                                        <span className="line-clamp-2 block text-left" title={formatDescription(row.description)}>
                                                            {truncateDescription(formatDescription(row.description))}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-gray-600">{getSeiteFromDescription(row.description)}</td>
                                                    <td className="py-2.5 px-3 text-right text-gray-900">{formatEuro(row.price)}</td>
                                                    <td className="py-2.5 px-3 text-right font-medium text-gray-900">{formatEuro(row.price)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-1 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Zwischensumme</span>
                                        <span>{formatEuro(netto)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Netto</span>
                                        <span>{formatEuro(netto)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>MwSt 19%</span>
                                        <span>{formatEuro(mwst)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-gray-900 pt-1">
                                        <span>Brutto</span>
                                        <span>{formatEuro(data.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* DOKUMENTE */}
                            <div className="rounded-xl border border-gray-200 p-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                    Dokumente
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {onInvoiceDownload && orderId && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 cursor-pointer"
                                            onClick={() => {
                                                onInvoiceDownload(orderId);
                                                onClose();
                                            }}
                                        >
                                            <Receipt className="w-4 h-4" />
                                            Rechnung öffnen
                                        </Button>
                                    )}
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

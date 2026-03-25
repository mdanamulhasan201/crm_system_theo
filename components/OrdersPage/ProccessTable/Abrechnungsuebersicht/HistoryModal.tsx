'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { getPaymentStatus } from '@/apis/productsOrder';
import { useOrderHistory } from '@/hooks/orders/useOrderHistory';
import { normalizePaymentStatus } from '@/lib/paymentStatusUtils';
import { CheckCircle, CheckCircle2, Clock, Download, Info, User, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderNumber?: string;
}

const formatDate = (dateString: string) => {
    try {
        const date =
            dateString.includes('T') || dateString.includes('Z')
                ? new Date(dateString)
                : (() => { const p = new Date(dateString); return isNaN(p.getTime()) ? null : p; })();
        if (!date) return dateString;
        const months = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
        return `${String(date.getDate()).padStart(2,'0')}. ${months[date.getMonth()]} ${date.getFullYear()}, ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    } catch { return dateString; }
};

export default function HistoryModal({ isOpen, onClose, orderId, orderNumber }: HistoryModalProps) {
    const [updatingPaymentStatusId, setUpdatingPaymentStatusId] = useState<string | null>(null);
    const { data: historyData, loading, error, refetch } = useOrderHistory(isOpen ? orderId : null);

    const handlePaymentStatusChange = async (entryId: string, currentStatus: string) => {
        if (!orderId) return;
        setUpdatingPaymentStatusId(entryId);
        try {
            const normalized = normalizePaymentStatus(currentStatus);
            let newStatus: string;
            if (normalized === 'Privat_Bezahlt') newStatus = 'Privat_offen';
            else if (normalized === 'Privat_offen') newStatus = 'Privat_Bezahlt';
            else if (normalized === 'Krankenkasse_Genehmigt') newStatus = 'Krankenkasse_Ungenehmigt';
            else if (normalized === 'Krankenkasse_Ungenehmigt') newStatus = 'Krankenkasse_Genehmigt';
            else if (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('offen')) newStatus = 'Privat_Bezahlt';
            else if (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('bezahlt')) newStatus = 'Privat_offen';
            else { toast.error('Unbekannter Zahlungsstatus'); return; }
            await getPaymentStatus([orderId], newStatus, newStatus);
            toast.success('Zahlungsstatus erfolgreich aktualisiert');
            await refetch();
        } catch {
            toast.error('Fehler beim Aktualisieren des Zahlungsstatus');
        } finally {
            setUpdatingPaymentStatusId(null);
        }
    };

    const getPaymentStatusButton = (entry: any) => {
        const currentStatus = entry.paymentTo || entry.paymentToDisplay || '';
        const normalized = normalizePaymentStatus(currentStatus);
        const isUpdating = updatingPaymentStatusId === entry.id;

        const btnBase = 'text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50';

        if (normalized === 'Privat_Bezahlt' || (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('bezahlt')))
            return <Button variant="outline" size="sm" onClick={() => handlePaymentStatusChange(entry.id, currentStatus)} disabled={isUpdating} className={`${btnBase} bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100`}>{isUpdating ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-700 mr-1.5" /> : <XCircle className="h-3 w-3 mr-1.5 shrink-0" />}Privat Offen</Button>;
        if (normalized === 'Privat_offen' || (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('offen')))
            return <Button variant="outline" size="sm" onClick={() => handlePaymentStatusChange(entry.id, currentStatus)} disabled={isUpdating} className={`${btnBase} bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100`}>{isUpdating ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-700 mr-1.5" /> : <CheckCircle2 className="h-3 w-3 mr-1.5 shrink-0" />}Privat Bezahlt</Button>;
        if (normalized === 'Krankenkasse_Genehmigt' || (currentStatus.toLowerCase().includes('krankenkasse') && currentStatus.toLowerCase().includes('genehmigt')))
            return <Button variant="outline" size="sm" onClick={() => handlePaymentStatusChange(entry.id, currentStatus)} disabled={isUpdating} className={`${btnBase} bg-red-50 border-red-300 text-red-700 hover:bg-red-100`}>{isUpdating ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700 mr-1.5" /> : <XCircle className="h-3 w-3 mr-1.5 shrink-0" />}Krankenkasse Ungenehmigt</Button>;
        if (normalized === 'Krankenkasse_Ungenehmigt' || (currentStatus.toLowerCase().includes('krankenkasse') && currentStatus.toLowerCase().includes('ungenehmigt')))
            return <Button variant="outline" size="sm" onClick={() => handlePaymentStatusChange(entry.id, currentStatus)} disabled={isUpdating} className={`${btnBase} bg-green-50 border-green-300 text-green-700 hover:bg-green-100`}>{isUpdating ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1.5" /> : <CheckCircle2 className="h-3 w-3 mr-1.5 shrink-0" />}Krankenkasse Genehmigt</Button>;
        return null;
    };

    const handleCSVExport = () => {
        if (!historyData) return;
        const rows: string[][] = [];
        rows.push(['Historie & Analyse - Export']);
        rows.push([`Bestellnummer: ${historyData.orderNumber || orderNumber || 'N/A'}`]);
        rows.push([`Exportiert am: ${new Date().toLocaleString('de-DE')}`]);
        rows.push([]);
        if (historyData.stepDurations?.length) {
            rows.push(['Schritt-Dauer Übersicht']);
            rows.push(['Status','Dauer','Bearbeiter','Bearbeiter-ID','Typ']);
            historyData.stepDurations.forEach(s => rows.push([s.statusDisplay||s.status, s.duration, s.assignee, s.assigneeId||'', s.assigneeType||'']));
            rows.push([]);
        }
        if (historyData.summary) {
            rows.push(['Zusammenfassung']);
            rows.push(['Aktueller Status', historyData.summary.currentStatus||'']);
            rows.push(['Aktueller Zahlungsstatus', historyData.summary.currentPaymentStatus||'']);
            rows.push(['Gesamtanzahl Ereignisse', String(historyData.summary.totalEvents||0)]);
            rows.push(['Anzahl Zahlungsänderungen', String(historyData.summary.totalPaymentChanges||0)]);
            rows.push([]);
        }
        if (historyData.changeLog?.length) {
            rows.push(['Änderungsprotokoll']);
            rows.push(['Datum','Zeit','Benutzer','Aktion','Beschreibung','Notiz','Typ','Partner-ID','Mitarbeiter-ID']);
            historyData.changeLog.forEach(e => {
                const d = new Date(e.timestamp||e.date);
                rows.push([d.toLocaleDateString('de-DE'), d.toLocaleTimeString('de-DE'), e.user||'', e.action||'', e.description||'', e.note||'', e.type||'', e.details?.partnerId||'', e.details?.employeeId||'']);
            });
        }
        const csv = rows.map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Historie-${orderNumber||historyData.orderNumber||'order'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-5 border-b border-gray-200 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-medium text-gray-900">
                            Historie & Analyse{orderNumber ? ` - ${orderNumber}` : ''}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
                            <p className="text-gray-600">Daten werden geladen...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-600 mb-4">Fehler: {error}</p>
                            <Button onClick={onClose} variant="outline">Schließen</Button>
                        </div>
                    ) : !historyData ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-gray-600">Keine Daten verfügbar</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Zusammenfassung */}
                            {historyData.summary && (
                                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-base font-medium text-gray-900">Zusammenfassung</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Aktueller Status</p>
                                            <p className="text-sm font-medium text-gray-900">{historyData.summary.currentStatus}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Zahlungsstatus</p>
                                            <p className="text-sm font-medium text-gray-900">{historyData.summary.currentPaymentStatus}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Gesamtanzahl Ereignisse</p>
                                            <p className="text-sm font-medium text-gray-900">{historyData.summary.totalEvents}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 mb-1">Zahlungsänderungen</p>
                                            <p className="text-sm font-medium text-gray-900">{historyData.summary.totalPaymentChanges}</p>
                                        </div>
                                    </div>
                                    {historyData.summary.hasBarcodeScan && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <p className="text-xs text-gray-600">Barcode wurde gescannt</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Zahlungsstatus Historie */}
                            {historyData.paymentStatusHistory && historyData.paymentStatusHistory.length > 0 && (
                                <div>
                                    <h3 className="text-base font-normal text-gray-900 mb-5">Zahlungsstatus Historie</h3>
                                    <div className="relative">
                                        {historyData.paymentStatusHistory.length > 1 && (
                                            <div className="absolute left-[5px] w-px bg-gray-300" style={{ top: '10px', bottom: '10px', zIndex: 0 }} />
                                        )}
                                        <div className="space-y-4">
                                            {historyData.paymentStatusHistory.map((entry, index) => (
                                                <div key={entry.id || index} className="relative flex gap-4">
                                                    <div className="relative shrink-0" style={{ width: '12px' }}>
                                                        <div className="absolute left-[3px] w-[3px] bg-white" style={{ top: '6px', height: '12px', zIndex: 6 }} />
                                                        <div className="relative z-10 flex items-center justify-center mt-2">
                                                            <div className="w-2 h-2 rounded-full bg-green-600 shadow-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-normal text-gray-500 mb-1">{formatDate(entry.timestamp || entry.date)}</p>
                                                                <p className="text-sm font-normal text-gray-900 leading-relaxed">
                                                                    <span className="font-semibold">{entry.user}</span>{' '}
                                                                    Zahlungsstatus geändert:{' '}
                                                                    <span className="text-gray-600">{entry.paymentFromDisplay || entry.paymentFrom}</span>
                                                                    {' → '}
                                                                    <span className="font-medium text-green-700">{entry.paymentToDisplay || entry.paymentTo}</span>
                                                                </p>
                                                            </div>
                                                            {index === 0 && (
                                                                <div className="shrink-0 mt-1">{getPaymentStatusButton(entry)}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Schritt-Dauer Übersicht */}
                            {historyData.stepDurations && historyData.stepDurations.length > 0 && (
                                <Accordion type="single" collapsible defaultValue="schritt-dauer" className="w-full">
                                    <AccordionItem value="schritt-dauer" className="border-none">
                                        <AccordionTrigger className="text-base font-semibold text-gray-900 py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                                            Schritt-Dauer Übersicht
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 pb-0">
                                            <div className="space-y-3">
                                                {historyData.stepDurations.map((step, index) => (
                                                    <div key={index} className="bg-gray-100 rounded-lg p-4 shadow-sm">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Clock className="h-4 w-4 text-gray-600 shrink-0" />
                                                                    <p className="text-sm font-normal text-gray-900">{step.statusDisplay}</p>
                                                                </div>
                                                                <p className="text-base font-bold text-gray-900">{step.duration}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <User className="h-4 w-4 text-gray-500" />
                                                                <p className="text-xs text-gray-600">{step.assignee}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}

                            {/* Änderungsprotokoll */}
                            {((historyData.changeLog && historyData.changeLog.length > 0) || historyData.scannerInfo?.hasScanner) && (
                                <Accordion type="single" collapsible defaultValue="aenderungsprotokoll" className="w-full">
                                    <AccordionItem value="aenderungsprotokoll" className="border-none">
                                        <div className="flex w-full items-center gap-2">
                                            <AccordionTrigger className="flex-1 text-base font-normal text-gray-900 py-0 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                                                <span className="font-semibold">Änderungsprotokoll</span>
                                            </AccordionTrigger>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="flex shrink-0 cursor-pointer items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                                onClick={handleCSVExport}
                                            >
                                                <Download className="h-4 w-4" />
                                                CSV Export
                                            </Button>
                                        </div>
                                        <AccordionContent className="pt-4 pb-0">
                                            <div className="relative">
                                                {((historyData.changeLog?.length || 0) + (historyData.scannerInfo?.hasScanner ? 1 : 0)) > 1 && (
                                                    <div className="absolute left-[5px] w-px bg-gray-300" style={{ top: '10px', bottom: '10px', zIndex: 0 }} />
                                                )}
                                                <div className="space-y-4">
                                                    {historyData.scannerInfo?.hasScanner && (
                                                        <div className="relative flex gap-4">
                                                            <div className="relative shrink-0" style={{ width: '12px' }}>
                                                                <div className="absolute left-[3px] w-[3px] bg-white" style={{ top: '6px', height: '12px', zIndex: 6 }} />
                                                                <div className="relative z-10 flex items-center justify-center mt-2">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-normal text-gray-500 mb-1">{formatDate(historyData.scannerInfo.timestamp || historyData.scannerInfo.scannedAt)}</p>
                                                                <p className="text-sm font-normal text-gray-900"><span className="font-semibold">System</span> Scan durchgeführt</p>
                                                                <p className="text-xs text-gray-600 mt-1">Scan-Datum: {historyData.scannerInfo.scannedAt}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {historyData.changeLog?.map((entry, index) => (
                                                        <div key={entry.id || index} className="relative flex gap-4">
                                                            <div className="relative shrink-0" style={{ width: '12px' }}>
                                                                <div className="absolute left-[3px] w-[3px] bg-white" style={{ top: '6px', height: '12px', zIndex: 6 }} />
                                                                <div className="relative z-10 flex items-center justify-center mt-2">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-normal text-gray-500 mb-1">{formatDate(entry.timestamp || entry.date)}</p>
                                                                <p className="text-sm font-normal text-gray-900 leading-relaxed">
                                                                    <span className="font-semibold">{entry.user}</span>{' '}{entry.action}
                                                                </p>
                                                                {entry.description && entry.description !== entry.action && (
                                                                    <p className="text-xs text-gray-600 mt-1">{entry.description}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}

                            {(!historyData.stepDurations?.length && !historyData.changeLog?.length && !historyData.paymentStatusHistory?.length && !historyData.summary) && (
                                <div className="text-center py-20">
                                    <p className="text-gray-600">Keine Historie-Daten verfügbar</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

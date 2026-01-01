'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, Clock, User, CheckCircle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderHistory } from '@/hooks/orders/useOrderHistory';
import { getPaymentStatus } from '@/apis/productsOrder';
import { normalizePaymentStatus } from '@/lib/paymentStatusUtils';
import toast from 'react-hot-toast';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderNumber?: string;
}

export default function HistorySidebar({
    isOpen,
    onClose,
    orderId,
    orderNumber,
}: HistorySidebarProps) {
    const { data, loading, error, refetch } = useOrderHistory(orderId);
    const [shouldRender, setShouldRender] = useState(false);
    const [updatingPaymentStatusId, setUpdatingPaymentStatusId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
        } else {
            // Delay unmounting to allow exit animation
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleCSVExport = () => {
        if (!data) return;

        const csvRows: string[][] = [];

        // Add header for order information
        csvRows.push(['Historie & Analyse - Export']);
        csvRows.push([`Bestellnummer: ${data.orderNumber || orderNumber || 'N/A'}`]);
        csvRows.push([`Exportiert am: ${new Date().toLocaleString('de-DE')}`]);
        csvRows.push([]);

        // Add Step Duration Overview section
        if (data.stepDurations && data.stepDurations.length > 0) {
            csvRows.push(['Schritt-Dauer Übersicht']);
            csvRows.push(['Status', 'Dauer', 'Bearbeiter', 'Bearbeiter-ID', 'Typ']);
            data.stepDurations.forEach((step) => {
                csvRows.push([
                    step.statusDisplay || step.status,
                    step.duration,
                    step.assignee,
                    step.assigneeId || '',
                    step.assigneeType || '',
                ]);
            });
            csvRows.push([]);
        }

        // Add Summary section
        if (data.summary) {
            csvRows.push(['Zusammenfassung']);
            csvRows.push(['Aktueller Status', data.summary.currentStatus || '']);
            csvRows.push(['Aktueller Zahlungsstatus', data.summary.currentPaymentStatus || '']);
            csvRows.push(['Gesamtanzahl Ereignisse', String(data.summary.totalEvents || 0)]);
            csvRows.push(['Anzahl Zahlungsänderungen', String(data.summary.totalPaymentChanges || 0)]);
            csvRows.push(['Barcode gescannt', data.summary.hasBarcodeScan ? 'Ja' : 'Nein']);
            csvRows.push([]);
        }

        // Add Payment Status History section
        if (data.paymentStatusHistory && data.paymentStatusHistory.length > 0) {
            csvRows.push(['Zahlungsstatus Historie']);
            csvRows.push([
                'Datum',
                'Zeit',
                'Benutzer',
                'Von',
                'Nach',
                'Partner-ID',
                'Mitarbeiter-ID',
            ]);

            data.paymentStatusHistory.forEach((entry) => {
                const date = entry.timestamp ? new Date(entry.timestamp) : new Date(entry.date);
                const dateStr = date.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                const timeStr = date.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                csvRows.push([
                    dateStr,
                    timeStr,
                    entry.user || '',
                    entry.paymentFromDisplay || entry.paymentFrom || '',
                    entry.paymentToDisplay || entry.paymentTo || '',
                    entry.details?.partnerId || '',
                    entry.details?.employeeId || '',
                ]);
            });
            csvRows.push([]);
        }

        // Add Barcode Info section
        if (data.barcodeInfo) {
            csvRows.push(['Barcode Informationen']);
            csvRows.push(['Erstellt am', data.barcodeInfo.createdAt || '']);
            csvRows.push(['Barcode vorhanden', data.barcodeInfo.hasBarcode ? 'Ja' : 'Nein']);
            csvRows.push([]);
        }

        // Add Change Log section
        if (data.changeLog && data.changeLog.length > 0) {
            csvRows.push(['Änderungsprotokoll']);
            csvRows.push([
                'Datum',
                'Zeit',
                'Benutzer',
                'Aktion',
                'Beschreibung',
                'Notiz',
                'Typ',
                'Partner-ID',
                'Mitarbeiter-ID',
            ]);

            data.changeLog.forEach((entry) => {
                const date = entry.timestamp ? new Date(entry.timestamp) : new Date(entry.date);
                const dateStr = date.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                });
                const timeStr = date.toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                csvRows.push([
                    dateStr,
                    timeStr,
                    entry.user || '',
                    entry.action || '',
                    entry.description || '',
                    entry.note || '',
                    entry.type || '',
                    entry.details?.partnerId || '',
                    entry.details?.employeeId || '',
                ]);
            });
        }

        // Convert to CSV format
        const csvContent = csvRows
            .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Historie-Analyse-${orderNumber || data.orderNumber || 'order'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const formatDate = (dateString: string) => {
        try {
            // Handle both formatted date strings and ISO timestamps
            let date: Date;
            if (dateString.includes('T') || dateString.includes('Z')) {
                // ISO timestamp format
                date = new Date(dateString);
            } else {
                // Try parsing as formatted date string (e.g., "20. Dezember 2025, 11:07")
                // If it's already formatted, try to parse it, otherwise use as is
                const parsed = new Date(dateString);
                if (isNaN(parsed.getTime())) {
                    // If parsing fails, return the original string
                    return dateString;
                }
                date = parsed;
            }
            
            const months = [
                'Januar',
                'Februar',
                'März',
                'April',
                'Mai',
                'Juni',
                'Juli',
                'August',
                'September',
                'Oktober',
                'November',
                'Dezember',
            ];
            const day = String(date.getDate()).padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}. ${month} ${year}, ${hours}:${minutes}`;
        } catch {
            return dateString;
        }
    };

    // Handle payment status change
    const handlePaymentStatusChange = async (entryId: string, currentStatus: string) => {
        if (!orderId) return;

        setUpdatingPaymentStatusId(entryId);
        try {
            // Normalize the current status to determine the new status
            const normalizedStatus = normalizePaymentStatus(currentStatus);
            
            let newStatus: string;
            if (normalizedStatus === 'Privat_Bezahlt') {
                newStatus = 'Privat_offen';
            } else if (normalizedStatus === 'Privat_offen') {
                newStatus = 'Privat_Bezahlt';
            } else if (normalizedStatus === 'Krankenkasse_Genehmigt') {
                newStatus = 'Krankenkasse_Ungenehmigt';
            } else if (normalizedStatus === 'Krankenkasse_Ungenehmigt') {
                newStatus = 'Krankenkasse_Genehmigt';
            } else {
                // Default: if current is "Privat offen" (display format), change to "Privat Bezahlt"
                if (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('offen')) {
                    newStatus = 'Privat_Bezahlt';
                } else if (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('bezahlt')) {
                    newStatus = 'Privat_offen';
                } else {
                    toast.error('Unbekannter Zahlungsstatus');
                    return;
                }
            }

            // Call API to update payment status
            await getPaymentStatus([orderId], newStatus, newStatus);
            toast.success('Zahlungsstatus erfolgreich aktualisiert');
            
            // Refetch history to show updated data
            await refetch();
        } catch (error) {
            console.error('Failed to update payment status:', error);
            toast.error('Fehler beim Aktualisieren des Zahlungsstatus');
        } finally {
            setUpdatingPaymentStatusId(null);
        }
    };

    // Get button for payment status change based on current status
    const getPaymentStatusButton = (entry: any) => {
        const currentStatus = entry.paymentTo || entry.paymentToDisplay || '';
        const normalizedStatus = normalizePaymentStatus(currentStatus);
        const isUpdating = updatingPaymentStatusId === entry.id;

        // If Privat_Bezahlt - show button to change back to Privat_offen
        if (normalizedStatus === 'Privat_Bezahlt' || 
            (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('bezahlt'))) {
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaymentStatusChange(entry.id, currentStatus)}
                    disabled={isUpdating}
                    className="text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap flex-shrink-0 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                >
                    {isUpdating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-700 mr-1.5"></div>
                    ) : (
                        <XCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    )}
                    Privat Offen
                </Button>
            );
        }

        // If Privat_offen - show Privat_Bezahlt button
        if (normalizedStatus === 'Privat_offen' || 
            (currentStatus.toLowerCase().includes('privat') && currentStatus.toLowerCase().includes('offen'))) {
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaymentStatusChange(entry.id, currentStatus)}
                    disabled={isUpdating}
                    className="text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap flex-shrink-0 bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                >
                    {isUpdating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-700 mr-1.5"></div>
                    ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    )}
                    Privat Bezahlt
                </Button>
            );
        }

        // If Krankenkasse_Genehmigt - show button to change back to Krankenkasse_Ungenehmigt
        if (normalizedStatus === 'Krankenkasse_Genehmigt' || 
            (currentStatus.toLowerCase().includes('krankenkasse') && currentStatus.toLowerCase().includes('genehmigt'))) {
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaymentStatusChange(entry.id, currentStatus)}
                    disabled={isUpdating}
                    className="text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap flex-shrink-0 bg-red-50 border-red-300 text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                    {isUpdating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700 mr-1.5"></div>
                    ) : (
                        <XCircle className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    )}
                    Krankenkasse Ungenehmigt
                </Button>
            );
        }

        // If Krankenkasse_Ungenehmigt - show Krankenkasse_Genehmigt button
        if (normalizedStatus === 'Krankenkasse_Ungenehmigt' || 
            (currentStatus.toLowerCase().includes('krankenkasse') && currentStatus.toLowerCase().includes('ungenehmigt'))) {
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePaymentStatusChange(entry.id, currentStatus)}
                    disabled={isUpdating}
                    className="text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap flex-shrink-0 bg-green-50 border-green-300 text-green-700 hover:bg-green-100 disabled:opacity-50"
                >
                    {isUpdating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700 mr-1.5"></div>
                    ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    )}
                    Krankenkasse Genehmigt
                </Button>
            );
        }

        return null;
    };

    if (!shouldRender) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 backdrop-blur-sm ${
                    isOpen 
                        ? 'opacity-100' 
                        : 'opacity-0'
                }`}
                style={{
                    transition: 'opacity 350ms ease-in-out',
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform ${
                    isOpen 
                        ? 'translate-x-0' 
                        : 'translate-x-full'
                }`}
                style={{
                    transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                    willChange: 'transform',
                }}
                aria-hidden={!isOpen}
            >
                <div className="h-full flex flex-col bg-white">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 bg-white">
                        <h2 className="text-lg font-medium text-gray-900">
                            Historie & Analyse{orderNumber ? ` - ${orderNumber}` : ''}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 bg-white">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                    <p className="text-gray-600">Daten werden geladen...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">Fehler: {error}</p>
                                    <Button onClick={onClose} variant="outline">
                                        Schließen
                                    </Button>
                                </div>
                            </div>
                        ) : !data ? (
                            <div className="flex items-center justify-center py-20">
                                <p className="text-gray-600">Keine Daten verfügbar</p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Summary Section */}
                                {data.summary && (
                                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Info className="h-5 w-5 text-blue-600" />
                                            <h3 className="text-base font-medium text-gray-900">
                                                Zusammenfassung
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Aktueller Status</p>
                                                <p className="text-sm font-medium text-gray-900">{data.summary.currentStatus}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Zahlungsstatus</p>
                                                <p className="text-sm font-medium text-gray-900">{data.summary.currentPaymentStatus}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Gesamtanzahl Ereignisse</p>
                                                <p className="text-sm font-medium text-gray-900">{data.summary.totalEvents}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Zahlungsänderungen</p>
                                                <p className="text-sm font-medium text-gray-900">{data.summary.totalPaymentChanges}</p>
                                            </div>
                                        </div>
                                        {data.summary.hasBarcodeScan && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <p className="text-xs text-gray-600">Barcode wurde gescannt</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Barcode Info Section */}
                                {/* {data.barcodeInfo && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Barcode Informationen</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {data.barcodeInfo.hasBarcode ? 'Barcode vorhanden' : 'Kein Barcode'}
                                                </p>
                                                {data.barcodeInfo.createdAt && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Erstellt: {data.barcodeInfo.createdAt}
                                                    </p>
                                                )}
                                            </div>
                                            {data.barcodeInfo.hasBarcode && (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </div>
                                )} */}

                                {/* Payment Status History */}
                                {data.paymentStatusHistory && data.paymentStatusHistory.length > 0 && (
                                    <div>
                                        <h3 className="text-base font-normal text-gray-900 mb-5">
                                            Zahlungsstatus Historie
                                        </h3>
                                        <div className="relative">
                                            {data.paymentStatusHistory.length > 1 && (
                                                <div 
                                                    className="absolute left-[5px] w-[1px] bg-gray-300"
                                                    style={{
                                                        top: '10px',
                                                        bottom: '10px',
                                                        zIndex: 0,
                                                    }}
                                                />
                                            )}
                                            <div className="space-y-4">
                                                {data.paymentStatusHistory.map((entry, index) => {
                                                    // Only show button for the most recent entry (index 0) which represents current status
                                                    const isCurrentStatus = index === 0;
                                                    return (
                                                        <div
                                                            key={entry.id || index}
                                                            className="relative flex gap-4"
                                                        >
                                                            <div className="relative flex-shrink-0" style={{ width: '12px' }}>
                                                                <div 
                                                                    className="absolute left-[3px] w-[3px] bg-white"
                                                                    style={{ 
                                                                        top: '6px',
                                                                        height: '12px',
                                                                        zIndex: 6,
                                                                    }}
                                                                />
                                                                <div className="relative z-10 flex items-center justify-center mt-2">
                                                                    <div className="w-2 h-2 rounded-full bg-green-600 shadow-sm"></div>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-normal text-gray-500 mb-1">
                                                                            {formatDate(entry.timestamp || entry.date)}
                                                                        </p>
                                                                        <p className="text-sm font-normal text-gray-900 leading-relaxed">
                                                                            <span className="font-semibold text-gray-900">
                                                                                {entry.user}
                                                                            </span>{' '}
                                                                            Zahlungsstatus geändert:{' '}
                                                                            <span className="text-gray-600">
                                                                                {entry.paymentFromDisplay || entry.paymentFrom}
                                                                            </span>
                                                                            {' → '}
                                                                            <span className="font-medium text-green-700">
                                                                                {entry.paymentToDisplay || entry.paymentTo}
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                    {isCurrentStatus && (
                                                                        <div className="flex-shrink-0 mt-1">
                                                                            {getPaymentStatusButton(entry)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Schritt-Dauer Übersicht */}
                                {data.stepDurations && data.stepDurations.length > 0 && (
                                    <div>
                                        <h3 className="text-base font-normal text-gray-900 mb-5">
                                            Schritt-Dauer Übersicht
                                        </h3>
                                        <div className="space-y-3">
                                            {data.stepDurations.map((step, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-gray-100 rounded-lg p-4 shadow-sm"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Clock className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                                                <p className="text-sm font-normal text-gray-900">
                                                                    {step.statusDisplay}
                                                                </p>
                                                            </div>
                                                            <p className="text-base font-bold text-gray-900">
                                                                {step.duration}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                            <p className="text-xs text-gray-600">
                                                                {step.assignee}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Änderungsprotokoll */}
                                {(data.changeLog && data.changeLog.length > 0) || (data.scannerInfo && data.scannerInfo.hasScanner) ? (
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-base font-normal text-gray-900">
                                                Änderungsprotokoll
                                            </h3>
                                            <Button
                                                onClick={handleCSVExport}
                                                variant="outline"
                                                size="sm"
                                                className="flex cursor-pointer items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                                            >
                                                <Download className="h-4 w-4" />
                                                CSV Export
                                            </Button>
                                        </div>
                                        <div className="relative">
                                            {/* Continuous background line */}
                                            {((data.changeLog && data.changeLog.length > 0) || (data.scannerInfo && data.scannerInfo.hasScanner)) && 
                                             ((data.changeLog?.length || 0) + (data.scannerInfo?.hasScanner ? 1 : 0)) > 1 && (
                                                <div 
                                                    className="absolute left-[5px] w-[1px] bg-gray-300"
                                                    style={{
                                                        top: '10px',
                                                        bottom: '10px',
                                                        zIndex: 0,
                                                    }}
                                                />
                                            )}
                                            <div className="space-y-4">
                                                {/* Scanner Info Entry - Show first if available */}
                                                {data.scannerInfo && data.scannerInfo.hasScanner && (
                                                    <div className="relative flex gap-4">
                                                        {/* Timeline Column */}
                                                        <div className="relative flex-shrink-0" style={{ width: '12px' }}>
                                                            {/* Vertical white gap - interrupts the line */}
                                                            <div 
                                                                className="absolute left-[3px] w-[3px] bg-white"
                                                                style={{ 
                                                                    top: '6px',
                                                                    height: '12px',
                                                                    zIndex: 6,
                                                                }}
                                                            />
                                                            {/* Blue Dot - centered in the gap */}
                                                            <div className="relative z-10 flex items-center justify-center mt-2">
                                                                <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
                                                            </div>
                                                        </div>
                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-normal text-gray-500 mb-1">
                                                                {formatDate(data.scannerInfo.timestamp || data.scannerInfo.scannedAt)}
                                                            </p>
                                                            <p className="text-sm font-normal text-gray-900 leading-relaxed">
                                                                <span className="font-semibold text-gray-900">
                                                                    System
                                                                </span>{' '}
                                                                Scan durchgeführt
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Scan-Datum: {data.scannerInfo.scannedAt}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Change Log Entries */}
                                                {data.changeLog && data.changeLog.map((entry, index) => (
                                                    <div
                                                        key={entry.id || index}
                                                        className="relative flex gap-4"
                                                    >
                                                        {/* Timeline Column */}
                                                        <div className="relative flex-shrink-0" style={{ width: '12px' }}>
                                                            {/* Vertical white gap - interrupts the line */}
                                                            <div 
                                                                className="absolute left-[3px] w-[3px] bg-white"
                                                                style={{ 
                                                                    top: '6px',
                                                                    height: '12px',
                                                                    zIndex: 6,
                                                                }}
                                                            />
                                                            {/* Blue Dot - centered in the gap */}
                                                            <div className="relative z-10 flex items-center justify-center mt-2">
                                                                <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
                                                            </div>
                                                        </div>
                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-normal text-gray-500 mb-1">
                                                                {formatDate(entry.timestamp || entry.date)}
                                                            </p>
                                                            <p className="text-sm font-normal text-gray-900 leading-relaxed">
                                                                <span className="font-semibold text-gray-900">
                                                                    {entry.user}
                                                                </span>{' '}
                                                                {entry.action}
                                                            </p>
                                                            {entry.description && entry.description !== entry.action && (
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    {entry.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {(!data.stepDurations || data.stepDurations.length === 0) &&
                                    (!data.changeLog || data.changeLog.length === 0) &&
                                    (!data.paymentStatusHistory || data.paymentStatusHistory.length === 0) &&
                                    !data.summary && (
                                        <div className="text-center py-20">
                                            <p className="text-gray-600">
                                                Keine Historie-Daten verfügbar
                                            </p>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

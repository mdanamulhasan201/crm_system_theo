'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSupplyInfo } from '@/hooks/orders/useSupplyInfo';

interface VersorgungModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderNumber?: string;
    customerName?: string;
}

export default function VersorgungModal({
    isOpen,
    onClose,
    orderId,
    orderNumber,
    customerName,
}: VersorgungModalProps) {
    const { data, loading, error } = useSupplyInfo(orderId);

    // Parse materials from comma-separated string
    const materials = data?.product?.material
        ? data.product.material
              .split(',')
              .map((m) => m.trim())
              .filter((m) => m.length > 0)
        : [];

    // Format date for fertigstellungBis - converts UTC to user's local timezone
    const formatDate = (dateString: string) => {
        try {
            // Create date object - automatically converts UTC to local timezone
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return dateString;
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
            
            // Use local time methods (getDate, getMonth, etc.) which automatically use user's timezone
            const day = String(date.getDate()).padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0'); // Local hours
            const minutes = String(date.getMinutes()).padStart(2, '0'); // Local minutes
            
            return `${day}. ${month} ${year}, ${hours}:${minutes}`;
        } catch {
            return dateString;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden p-0 gap-0">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-white">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                        Versorgung{orderNumber ? ` – ${orderNumber}` : ''}
                        {customerName ? ` – ${customerName}` : ''}
                    </DialogTitle>
                </div>

                {/* Content - Scrollable */}
                <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
                        <div className="space-y-8">
                            {/* Fertigstellung Bis Section */}
                            {data.fertigstellungBis && (
                                <div>
                                    <h3 className="text-sm font-normal text-gray-600 mb-3">Fertigstellung bis</h3>
                                    <p className="text-base font-medium text-gray-900">
                                        {formatDate(data.fertigstellungBis)}
                                    </p>
                                </div>
                            )}

                            {/* Versorgung Section */}
                            <div>
                                <h3 className="text-sm font-normal text-gray-600 mb-3">Versorgung</h3>
                                <p className="text-base font-normal text-gray-900 leading-relaxed">
                                    {data.product?.versorgung
                                        ? `${data.product.versorgung}${data.product?.name ? ` – ${data.product.name}` : ''}`
                                        : data.product?.name || '—'}
                                </p>
                            </div>

                            {/* Status Section */}
                            {data.product?.status && (
                                <div>
                                    <h3 className="text-sm font-normal text-gray-600 mb-3">Status</h3>
                                    <p className="text-base font-normal text-gray-900">
                                        {data.product.status}
                                    </p>
                                </div>
                            )}

                            {/* Materialien Section */}
                            <div>
                                <h3 className="text-sm font-normal text-gray-600 mb-4">Materialien</h3>
                                {materials.length > 0 ? (
                                    <div className="space-y-3">
                                        {materials.map((material, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-100 rounded-lg px-4 py-3.5 border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                            >
                                                {/* Numbered Badge */}
                                                <div className="shrink-0">
                                                    <div className="w-8 h-8 rounded-full bg-[#61A175] flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Material Name */}
                                                <p className="text-base font-normal text-gray-900 flex-1">
                                                    {material}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-base font-normal text-gray-500">Keine Materialien verfügbar</p>
                                )}
                            </div>

                            {/* Diagnosis Status Section */}
                            {data.product?.diagnosis_status && data.product.diagnosis_status.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-normal text-gray-600 mb-4">Diagnose Status</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.product.diagnosis_status.map((diagnosis, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-200"
                                            >
                                                {diagnosis}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Foot Length Section */}
                            {data.footLength && (
                                <div>
                                    <h3 className="text-sm font-normal text-gray-600 mb-4">Fußlänge</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Fußlänge 1</p>
                                                <p className="text-base font-medium text-gray-900">
                                                    {data.footLength.fusslange1} mm
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Fußlänge 2</p>
                                                <p className="text-base font-medium text-gray-900">
                                                    {data.footLength.fusslange2} mm
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Ziel-Länge</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {data.footLength.targetLength} mm
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 mb-1">Passende Größe</p>
                                                <p className="text-base font-semibold text-[#61A175]">
                                                    Größe {data.footLength.matchedSize}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rohling Hersteller Section */}
                            {data.product?.rohlingHersteller && (
                                <div>
                                    <h3 className="text-sm font-normal text-gray-600 mb-3">Rohling Hersteller</h3>
                                    <p className="text-base font-normal text-gray-900">
                                        {data.product.rohlingHersteller}
                                    </p>
                                </div>
                            )}

                            {/* Artikel Hersteller Section */}
                            {data.product?.artikelHersteller && (
                                <div>
                                    <h3 className="text-sm font-normal text-gray-600 mb-3">Artikel Hersteller</h3>
                                    <p className="text-base font-normal text-gray-900">
                                        {data.product.artikelHersteller}
                                    </p>
                                </div>
                            )}

                            {/* Längenempfehlung Section */}
                            {data.product?.langenempfehlung && Object.keys(data.product.langenempfehlung).length > 0 && (
                                <div>
                                    <h3 className="text-sm font-normal text-gray-600 mb-4">Längenempfehlung</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="space-y-2">
                                            {Object.entries(data.product.langenempfehlung).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">{key}:</span>
                                                    <span className="text-base font-medium text-gray-900">
                                                        {typeof value === 'number' ? `${value} mm` : String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
                    <Button 
                        onClick={onClose} 
                        variant="default" 
                        className="cursor-pointer bg-[#61A175] hover:bg-[#61A175]/80 text-white px-8"
                    >
                        Schließen
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

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
                            {/* Versorgung Section */}
                            <div>
                                <h3 className="text-sm font-normal text-gray-600 mb-3">Versorgung</h3>
                                <p className="text-base font-normal text-gray-900 leading-relaxed">
                                    {data.product?.versorgung
                                        ? `${data.product.versorgung}${data.product?.name ? ` – ${data.product.name}` : ''}`
                                        : data.product?.name || '—'}
                                </p>
                            </div>

                            {/* Materialien Section */}
                            <div>
                                <h3 className="text-sm font-normal text-gray-600 mb-4">Materialien</h3>
                                {materials.length > 0 ? (
                                    <div className="space-y-3">
                                        {materials.map((material, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-100 rounded-lg px-4 py-3.5  border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                            >
                                                {/* Numbered Badge */}
                                                <div className="flex-shrink-0">
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

'use client';

import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePicture2324 } from '@/hooks/orders/usePicture2324';
import Image from 'next/image';

interface ScanPictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderNumber?: string;
}

export default function ScanPictureModal({
    isOpen,
    onClose,
    orderId,
    orderNumber,
}: ScanPictureModalProps) {
    const { data, loading, error } = usePicture2324(orderId);

    const materials = data?.material
        ? data.material
              .split(',')
              .map((m) => m.trim())
              .filter((m) => m.length > 0)
        : [];

    const hasAnyImage = !!(data?.picture_23 || data?.picture_24);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-6xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden p-0 gap-0">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 bg-white flex items-center justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                        Scan-Bilder{orderNumber ? ` – ${orderNumber}` : ''}
                    </DialogTitle>
                </div>

                {/* Content */}
                <div className="px-4 py-4 overflow-y-auto max-h-[calc(95vh-180px)] bg-white">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61A175] mb-4"></div>
                                <p className="text-gray-600">Daten werden geladen...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <p className="text-red-600 mb-4">Fehler: {error}</p>
                                <Button onClick={onClose} variant="outline" className="cursor-pointer">
                                    Schließen
                                </Button>
                            </div>
                        </div>
                    ) : !data ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-gray-600">Keine Daten verfügbar</p>
                        </div>
                    ) : hasAnyImage ? (
                        <div className="flex flex-col lg:flex-row gap-1 items-start">
                            {/* Left: Images (large, column-wise, no border) */}
                            <div className="w-full lg:w-[70%] flex-shrink-0">
                                <div className="flex flex-col gap-3 w-full">
                                    {data.picture_23 && (
                                        <div className="relative w-full min-h-[300px]">
                                            <Image
                                                width={400}
                                                height={600}
                                                src={data.picture_23!}
                                                alt="Bild 23"
                                                className="w-full h-auto max-w-full object-contain"
                                                style={{ maxHeight: 'calc(95vh - 250px)' }}
                                            />
                                        </div>
                                    )}
                                    {data.picture_24 && (
                                        <div className="relative w-full min-h-[300px]">
                                            <Image
                                                width={400}
                                                height={600}
                                                src={data.picture_24!}
                                                alt="Bild 24"
                                                className="w-full h-auto max-w-full object-contain"
                                                style={{ maxHeight: 'calc(95vh - 250px)' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Meta information */}
                            <div className="w-full lg:w-[30%] lg:flex-shrink-0 space-y-4">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Kunde
                                    </h3>
                                    <p className="text-sm text-gray-900">{data.customerName || '—'}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Diagnose
                                    </h3>
                                    <p className="text-sm text-gray-900">
                                        {data.diagnosisStatus || '—'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Versorgung
                                    </h3>
                                    <p className="text-sm text-gray-900">
                                        {data.versorgungName || '—'}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Pelottenposition
                                    </h3>
                                    <p className="text-sm text-gray-900">
                                        —
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Materialien
                                    </h3>
                                    {materials.length > 0 ? (
                                        <ul className="space-y-1">
                                            {materials.map((m, idx) => (
                                                <li key={idx} className="text-sm text-gray-900">
                                                    {m}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Keine Materialien angegeben</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Notiz
                                    </h3>
                                    <p className="text-sm text-gray-900">
                                        —
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // No images at all: only meta information, full width
                        <div className="w-full space-y-4">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Kunde
                                </h3>
                                <p className="text-sm text-gray-900">{data.customerName || '—'}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Diagnose
                                </h3>
                                <p className="text-sm text-gray-900">
                                    {data.diagnosisStatus || '—'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Versorgung
                                </h3>
                                <p className="text-sm text-gray-900">
                                    {data.versorgungName || '—'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Pelottenposition
                                </h3>
                                <p className="text-sm text-gray-900">
                                    —
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Materialien
                                </h3>
                                {materials.length > 0 ? (
                                    <ul className="space-y-1">
                                        {materials.map((m, idx) => (
                                            <li key={idx} className="text-sm text-gray-900">
                                                {m}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500">Keine Materialien angegeben</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Notiz
                                </h3>
                                <p className="text-sm text-gray-900">
                                    —
                                </p>
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


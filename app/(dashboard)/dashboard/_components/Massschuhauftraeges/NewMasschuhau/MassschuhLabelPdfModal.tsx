'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import BarcodeSticker from '@/components/OrdersPage/ProccessTable/BarcodeSticker/BarcodeSticker';
import { generateBarcodeStickerPdfCanvas } from '@/lib/directPdfGenerator';
import { makeLevelPdf } from '@/apis/MassschuheAddedApis';

interface MassschuhLabelPdfModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    orderNumber?: string;
}

export default function MassschuhLabelPdfModal({
    isOpen,
    onClose,
    orderId,
    orderNumber,
}: MassschuhLabelPdfModalProps) {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    /** Normalized for preview + PDF (same as BarcodeStickerModal) */
    const [barcodeData, setBarcodeData] = useState<any>(null);
    /** Raw API payload for PDF (preserves partnerAddress object shape) */
    const [originalBarcodeData, setOriginalBarcodeData] = useState<any>(null);
    const [activeType, setActiveType] = useState<'left' | 'right'>('right');

    const getBarcodeErrorMessage = (response: any, type: 'left' | 'right') => {
        if (response?.error) return response.error;
        if (response?.message) return response.message;
        return type === 'left'
            ? 'Keine Daten für Links verfügbar'
            : 'Fehler beim Laden der Barcode-Daten';
    };

    const normalizePartnerAddress = (partnerAddress: any): any => {
        if (typeof partnerAddress === 'string') return partnerAddress;
        if (partnerAddress && typeof partnerAddress === 'object') return partnerAddress;
        return 'Address';
    };

    const fetchLabelData = useCallback(
        async (type: 'left' | 'right') => {
            if (!orderId) return;
            setLoading(true);
            try {
                const response = await makeLevelPdf(orderId, type);
                if (response?.success && response?.data) {
                    setActiveType(type);
                    const resolvedType = (response.data.type as 'left' | 'right' | undefined) ?? type;
                    setOriginalBarcodeData({
                        ...response.data,
                        type: resolvedType,
                    });
                    const normalizedData = {
                        ...response.data,
                        partnerAddress: normalizePartnerAddress(response.data.partnerAddress),
                        type: resolvedType,
                    };
                    setBarcodeData(normalizedData);
                } else {
                    setBarcodeData(null);
                    setOriginalBarcodeData(null);
                    toast.error(getBarcodeErrorMessage(response, type));
                }
            } catch (error: any) {
                console.error('Label data fetch error:', error);
                setBarcodeData(null);
                setOriginalBarcodeData(null);
                toast.error(getBarcodeErrorMessage(error?.response?.data ?? error, type));
            } finally {
                setLoading(false);
            }
        },
        [orderId],
    );

    const handleDownloadPdf = useCallback(async () => {
        if (!barcodeData || !originalBarcodeData) {
            toast.error('Bitte warten Sie, bis die Daten geladen sind');
            return;
        }
        setGenerating(true);
        try {
            const pdfBlob = await generateBarcodeStickerPdfCanvas(originalBarcodeData);
            if (!pdfBlob || pdfBlob.size === 0) {
                toast.error('PDF konnte nicht generiert werden');
                return;
            }

            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            const side = activeType === 'right' ? 'rechts' : 'links';
            link.download = `label_${orderNumber || orderId}_${side}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 100);
            toast.success('Label-PDF erfolgreich heruntergeladen');
        } catch (error) {
            console.error('Label PDF generation error:', error);
            toast.error('Fehler beim Erstellen des Label-PDFs');
        } finally {
            setGenerating(false);
        }
    }, [barcodeData, originalBarcodeData, activeType, orderId, orderNumber]);

    useEffect(() => {
        if (isOpen && orderId) {
            setActiveType('right');
            fetchLabelData('right');
        } else {
            setBarcodeData(null);
            setOriginalBarcodeData(null);
        }
    }, [isOpen, orderId, fetchLabelData]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Barcode-Sticker generieren</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#62A17C] mb-4" />
                                <p className="text-gray-600">Lade Label-Daten...</p>
                            </div>
                        </div>
                    ) : barcodeData ? (
                        <>
                            <div className="flex gap-2 mb-1">
                                <button
                                    type="button"
                                    onClick={() => fetchLabelData('right')}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${
                                        activeType === 'right'
                                            ? 'bg-[#62A17C] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Rechts
                                </button>
                                <button
                                    type="button"
                                    onClick={() => fetchLabelData('left')}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${
                                        activeType === 'left'
                                            ? 'bg-[#62A17C] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Links
                                </button>
                            </div>
                            <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                                <BarcodeSticker data={barcodeData} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={onClose} disabled={generating} className="cursor-pointer">
                                    Abbrechen
                                </Button>
                                <Button
                                    onClick={handleDownloadPdf}
                                    disabled={generating}
                                    className="bg-[#62A17C] hover:bg-[#62A17C]/90 cursor-pointer"
                                >
                                    {generating ? 'Generiere PDF...' : 'PDF herunterladen'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-600">Keine Daten verfügbar</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

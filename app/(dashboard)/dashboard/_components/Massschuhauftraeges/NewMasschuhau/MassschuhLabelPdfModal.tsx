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
    const [data, setData] = useState<any>(null);

    const normalizePartnerAddress = (partnerAddress: any): any => {
        if (typeof partnerAddress === 'string') return partnerAddress;
        if (partnerAddress && typeof partnerAddress === 'object') return partnerAddress;
        return 'Address';
    };

    const fetchLabelData = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            const response = await makeLevelPdf(orderId);
            if (response?.success && response?.data) {
                setData({
                    ...response.data,
                    partnerAddress: normalizePartnerAddress(response.data.partnerAddress),
                    // Keep sticker footer deterministic when backend returns null
                    type: response.data.type ?? 'right',
                });
            } else {
                setData(null);
                toast.error(response?.message || 'Label-Daten konnten nicht geladen werden');
            }
        } catch (error) {
            console.error('Label data fetch error:', error);
            setData(null);
            toast.error('Fehler beim Laden der Label-Daten');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const handleDownloadPdf = useCallback(async () => {
        if (!data) return;
        setGenerating(true);
        try {
            const pdfBlob = await generateBarcodeStickerPdfCanvas(data);
            if (!pdfBlob || pdfBlob.size === 0) {
                toast.error('PDF konnte nicht generiert werden');
                return;
            }

            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `label_${orderNumber || orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
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
    }, [data, orderId, orderNumber]);

    useEffect(() => {
        if (isOpen) {
            fetchLabelData();
        } else {
            setData(null);
        }
    }, [isOpen, fetchLabelData]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Barcode-Sticker generieren</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-gray-600">Lade Label-Daten...</p>
                        </div>
                    ) : data ? (
                        <>
                            <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                                <BarcodeSticker data={data} />
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

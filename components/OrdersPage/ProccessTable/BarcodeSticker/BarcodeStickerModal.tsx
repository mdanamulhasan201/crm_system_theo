'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BarcodeSticker from './BarcodeSticker';
import { getBarCodeData, sendPdfToCustomer } from '@/apis/barCodeGenerateApis';
import { generatePdfFromElement, pdfPresets } from '@/lib/pdfGenerator';
import toast from 'react-hot-toast';

interface BarcodeStickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    orderNumber?: string;
    autoGenerate?: boolean;
}

export default function BarcodeStickerModal({
    isOpen,
    onClose,
    orderId,
    orderNumber,
    autoGenerate = false,
}: BarcodeStickerModalProps) {
    const [barcodeData, setBarcodeData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const fetchBarcodeData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getBarCodeData(orderId);
            if (response.success && response.data) {
                setBarcodeData(response.data);
            } else {
                toast.error('Fehler beim Laden der Barcode-Daten');
            }
        } catch (error) {
            console.error('Error fetching barcode data:', error);
            toast.error('Fehler beim Laden der Barcode-Daten');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const generatePdf = useCallback(async () => {
        if (!barcodeData) return;

        try {
            setGenerating(true);
            
            // Wait a bit for barcode to render
            await new Promise(resolve => setTimeout(resolve, 500));

            // Use custom preset for sticker size (smaller than A4)
            const pdfBlob = await generatePdfFromElement('barcode-sticker-print-area', {
                ...pdfPresets.highQuality,
                width: 400,
                height: 250,
            });

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `barcode_sticker_${orderNumber || orderId}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            toast.success('Barcode-Sticker PDF erfolgreich generiert!');

            // Automatically send PDF to customer with file
            try {
                const fileName = `barcode_sticker_${orderNumber || orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
                const sendResponse = await sendPdfToCustomer(orderId, pdfBlob, fileName);
                if (sendResponse.success) {
                    toast.success('PDF erfolgreich an Kunden gesendet!');
                } else {
                    toast.error('PDF konnte nicht an Kunden gesendet werden');
                }
            } catch (sendError) {
                console.error('Failed to send PDF to customer:', sendError);
                toast.error('Fehler beim Senden des PDFs an Kunden');
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Fehler beim Generieren des PDFs');
        } finally {
            setGenerating(false);
        }
    }, [barcodeData, orderId, orderNumber]);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchBarcodeData();
        } else {
            setBarcodeData(null);
        }
    }, [isOpen, orderId, fetchBarcodeData]);

    // Auto-generate PDF when data is loaded and autoGenerate is true
    useEffect(() => {
        if (autoGenerate && barcodeData && !loading && !generating) {
            // Use setTimeout to ensure barcode is rendered
            const timer = setTimeout(() => {
                generatePdf().then(() => {
                    // Close modal after successful generation and send
                    if (autoGenerate) {
                        setTimeout(() => {
                            onClose();
                        }, 2000);
                    }
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [barcodeData, autoGenerate, loading, generating, generatePdf, onClose]);

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
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-600">Lade Barcode-Daten...</p>
                            </div>
                        </div>
                    ) : barcodeData ? (
                        <>
                            <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                                <BarcodeSticker data={barcodeData} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={generating}
                                >
                                    Abbrechen
                                </Button>
                                <Button
                                    onClick={generatePdf}
                                    disabled={generating}
                                    className="bg-[#62A17C] hover:bg-[#62A17C]/90"
                                >
                                    {generating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                            Generiere PDF...
                                        </>
                                    ) : (
                                        'PDF herunterladen'
                                    )}
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

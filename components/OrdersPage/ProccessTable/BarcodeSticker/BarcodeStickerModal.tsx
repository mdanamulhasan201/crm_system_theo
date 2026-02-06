'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import BarcodeSticker from './BarcodeSticker';
import { getBarCodeData, sendPdfToCustomer } from '@/apis/barCodeGenerateApis';
import { generateBarcodeStickerPdfCanvas } from '@/lib/directPdfGenerator';
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
    const [originalBarcodeData, setOriginalBarcodeData] = useState<any>(null); // Keep original for PDF
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Helper to safely convert partnerAddress to string for display
    const normalizePartnerAddress = (partnerAddress: any): string => {
        if (typeof partnerAddress === 'string') return partnerAddress;
        if (partnerAddress && typeof partnerAddress === 'object') {
            const parts = [];
            if (partnerAddress.title) parts.push(partnerAddress.title);
            if (partnerAddress.description && partnerAddress.description.trim() !== '') {
                parts.push(partnerAddress.description);
            }
            return parts.length > 0 ? parts.join(', ') : (partnerAddress.title || 'Address');
        }
        return 'Address';
    };

    const fetchBarcodeData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getBarCodeData(orderId);
            if (response.success && response.data) {
                // Store original data for PDF generation (needs object structure)
                setOriginalBarcodeData(response.data);
                // Normalize partnerAddress to string for React rendering
                const normalizedData = {
                    ...response.data,
                    partnerAddress: normalizePartnerAddress(response.data.partnerAddress)
                };
                setBarcodeData(normalizedData);
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

    // Download PDF only (no API call) - for manual download button
    const downloadPdf = useCallback(async () => {
        if (!barcodeData || !originalBarcodeData) {
            toast.error('Bitte warten Sie, bis die Daten geladen sind');
            return;
        }

        try {
            setGenerating(true);
            
            // Use original data for PDF to preserve object structure (title/description)
            const pdfBlob = await generateBarcodeStickerPdfCanvas(originalBarcodeData);
            
            if (!pdfBlob || pdfBlob.size === 0) {
                toast.error('PDF konnte nicht generiert werden');
                return;
            }
    
            // Create download link with better error handling
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `barcode_sticker_${orderNumber || orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.style.display = 'none';
            
            // Append to body
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Wait a bit before cleanup to ensure download starts
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            toast.success('Barcode-Sticker PDF erfolgreich heruntergeladen!');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Fehler beim Generieren des PDFs: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
        } finally {
            setGenerating(false);
        }
    }, [barcodeData, originalBarcodeData, orderId, orderNumber]);

    // Generate PDF and send to customer (for auto-generate when status is clicked)
    const generatePdf = useCallback(async () => {
        if (!barcodeData || !originalBarcodeData) {
            toast.error('Bitte warten Sie, bis die Daten geladen sind');
            return;
        }

        try {
            setGenerating(true);
            
            // Use original data for PDF to preserve object structure (title/description)
            const pdfBlob = await generateBarcodeStickerPdfCanvas(originalBarcodeData);
            
            if (!pdfBlob || pdfBlob.size === 0) {
                toast.error('PDF konnte nicht generiert werden');
                return;
            }
    
            // Create download link with better error handling
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `barcode_sticker_${orderNumber || orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
            link.style.display = 'none';
            
            // Append to body
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Wait a bit before cleanup to ensure download starts
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            toast.success('Barcode-Sticker PDF erfolgreich generiert!');

            // Send PDF to customer via API (only when autoGenerate is true)
            const fileName = `barcode_sticker_${orderNumber || orderId}_${new Date().toISOString().split('T')[0]}.pdf`;
            sendPdfToCustomer(orderId, pdfBlob, fileName)
                .then((sendResponse) => {
                    if (sendResponse.success) {
                        toast.success('PDF erfolgreich an Kunden gesendet!');
                    } else {
                        toast.error('PDF konnte nicht an Kunden gesendet werden');
                    }
                })
                .catch((sendError) => {
                    console.error('Failed to send PDF to customer:', sendError);
                    toast.error('Fehler beim Senden des PDFs an Kunden');
                });
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Fehler beim Generieren des PDFs: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
        } finally {
            setGenerating(false);
        }
    }, [barcodeData, originalBarcodeData, orderId, orderNumber]);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchBarcodeData();
        } else {
            setBarcodeData(null);
            setOriginalBarcodeData(null);
        }
    }, [isOpen, orderId, fetchBarcodeData]);

    // Auto-generate PDF when data is loaded and autoGenerate is true
    useEffect(() => {
        if (autoGenerate && barcodeData && !loading && !generating) {
            // Small delay to ensure component is mounted
            const timer = setTimeout(() => {
                generatePdf().then(() => {
                    // Close modal after successful generation and send
                    if (autoGenerate) {
                        setTimeout(() => {
                            onClose();
                        }, 2000);
                    }
                });
            }, 500);
            
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
                                    className="cursor-pointer"
                                >
                                    Abbrechen
                                </Button>
                                <Button
                                    onClick={downloadPdf}
                                    disabled={generating}
                                    className="bg-[#62A17C] hover:bg-[#62A17C]/90 cursor-pointer"
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
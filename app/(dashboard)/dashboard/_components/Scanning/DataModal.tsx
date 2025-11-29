import html2pdf from 'html2pdf.js';
import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PdfCustom from './PdfCustom';

interface ScanData {
    nameKunde?: string;
    Geschäftstandort?: string;
}

interface DataModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    scanData: ScanData;
    supply: string;
}

export default function DataModal({ isOpen, onOpenChange, scanData, supply }: DataModalProps) {
    const pdfRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadPDF = async () => {
        setIsLoading(true);
        if (pdfRef.current) {
            await html2pdf()
                .set({
                    margin: 0,
                    filename: 'Werkstattzettel.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                })
                .from(pdfRef.current)
                .save();
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Werkstattzettel</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Name Kunde</label>
                            <input
                                type="text"
                                value={scanData?.nameKunde || ''}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Wohnort</label>
                            <input
                                type="text"
                                value={scanData?.Geschäftstandort || ''}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">E-Mail</label>
                            <input
                                type="text"
                                value="Mustermann.Max@gmail.com"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Mitarbeiter</label>
                            <input
                                type="text"
                                value="Johannes"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Versorgung</label>
                            <input
                                type="text"
                                value={supply}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Preis zu bezahlen</label>
                            <input
                                type="text"
                                value="169.00€"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Datum des Auftrags</label>
                            <input
                                type="text"
                                value="01.02.2025"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Telefon</label>
                            <input
                                type="text"
                                value="+49 432 234 23"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Geschäftstandort</label>
                            <input
                                type="text"
                                value="Bremen"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Fertigstellung bis</label>
                            <input
                                type="text"
                                value="10.02.2025"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Bezahlt</label>
                            <input
                                type="text"
                                value="Ja"
                                readOnly
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleDownloadPDF}
                        className="px-4 py-2 cursor-pointer bg-[#62A07C] text-white rounded hover:bg-[#528e6a] transition-colors flex items-center justify-center min-w-[120px]"
                        type="button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        ) : null}
                        {isLoading ? 'PDF wird erstellt...' : 'Drucken'}
                    </button>
                </div>

                <div style={{ display: 'none' }}>
                    <div ref={pdfRef} id="pdf-content" style={{ fontFamily: 'Inter, Arial, sans-serif', color: '#111', width: '800px', height: '1122px', position: 'relative', background: '#fff', boxSizing: 'border-box' }}>
                        <PdfCustom />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePicture2324 } from '@/hooks/orders/usePicture2324';
import { Maximize2, Printer } from 'lucide-react';
import FullscreenImageModal from './FullscreenImageModal';
import Image from 'next/image';
import jsPDF from 'jspdf';

interface ScanPictureModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string | null;
    orderNumber?: string;
    customerName?: string;
}

export default function ScanPictureModal({
    isOpen,
    onClose,
    orderId,
    orderNumber,
    customerName,
}: ScanPictureModalProps) {
    const { data, loading, error } = usePicture2324(orderId);
    const [selectedFoot, setSelectedFoot] = useState<'left' | 'right' | null>(null);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const materials = data?.material
        ? data.material
            .split(',')
            .map((m) => m.trim())
            .filter((m) => m.length > 0)
        : [];

    const hasAnyImage = !!(data?.picture_23 || data?.picture_24);
    const isSonstiges = data?.category === 'sonstiges';
    const isInsole = data?.category === 'insole';
    const versorgungDisplay = isSonstiges ? data?.orderCategory?.service_name : data?.versorgungName;
    const supplyNameDisplay = isInsole ? ((data as { supplyName?: string | null } | null)?.supplyName ?? '') : '';
    const primaryVersorgungDisplay = isInsole ? supplyNameDisplay : versorgungDisplay;
    const quantityDisplay = typeof (data as { quantity?: number | null } | null)?.quantity === 'number'
        ? (data as { quantity?: number | null }).quantity
        : null;
    // Only show insole standards where at least one of left/right is not 0
    const insoleStandards = isInsole
        ? (data?.orderCategory?.insoleStandards ?? []).filter(
            (item: { left?: number; right?: number }) => (item.left ?? 0) !== 0 || (item.right ?? 0) !== 0
        )
        : [];
    const formatLeftRight = (name: string, left: number, right: number) => {
        const formatValue = (value: number) =>
            Number.isInteger(value) ? String(value) : String(value).replace('.', ',');

        const hasLeft = left > 0;
        const hasRight = right > 0;

        if (hasLeft && hasRight && left === right) {
            return `${formatValue(left)}mm ${name} BDS`;
        }

        if (hasLeft && hasRight) {
            return `${name} ${formatValue(left)}mm Links und ${formatValue(right)}mm Rechts`;
        }

        if (hasLeft) {
            return `${name} ${formatValue(left)}mm Links`;
        }

        return `${name} ${formatValue(right)}mm Rechts`;
    };

    // Format date for fertigstellungBis - converts UTC to user's local timezone
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
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

    const pdfFileName = useMemo(() => {
        const name = (data?.customerName || customerName || '').trim();
        const safeName = (name || 'Kunde').replace(/\s+/g, '_');
        return `Scan_${safeName}.pdf`;
    }, [customerName, data?.customerName]);

    const revokePdfUrl = useCallback(() => {
        setPdfUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
    }, []);

    useEffect(() => {
        if (!isOpen) {
            revokePdfUrl();
        }
    }, [isOpen, revokePdfUrl]);

    const getProxyableUrl = (url: string): string => {
        if (!url) return url;
        if (url.startsWith('data:')) return url;
        const absoluteUrl = url.startsWith('http')
            ? url
            : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
        return `/api/proxy-image?url=${encodeURIComponent(absoluteUrl)}`;
    };

    const fetchImageAsDataUrl = async (url: string): Promise<string | null> => {
        try {
            if (!url) return null;
            if (url.startsWith('data:')) return url;
            const res = await fetch(getProxyableUrl(url));
            if (!res.ok) return null;
            const blob = await res.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        } catch {
            return null;
        }
    };

    const normalizeImageDataUrlToPng = async (dataUrl: string): Promise<string | null> => {
        try {
            if (!dataUrl) return null;
            if (dataUrl.startsWith('data:image/png')) return dataUrl;
            // Convert webp/unknown formats to PNG so jsPDF always renders it
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('img load failed'));
                img.src = dataUrl;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;
            ctx.drawImage(img, 0, 0);
            return canvas.toDataURL('image/png');
        } catch {
            return null;
        }
    };

    const getImageDimensions = async (dataUrl: string): Promise<{ w: number; h: number } | null> => {
        try {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('img load failed'));
                img.src = dataUrl;
            });
            return { w: img.width, h: img.height };
        } catch {
            return null;
        }
    };

    const buildPrintableFields = (source: Record<string, any>) => {
        const excluded = new Set([
            'picture_23',
            'picture_24',
            'orderCategory',
            'priceDetails',
            'insoleStock',
        ]);

        const entries: Array<{ label: string; value: string }> = [];
        for (const [key, value] of Object.entries(source)) {
            if (excluded.has(key)) continue;
            if (value === null || value === undefined || value === '') continue;
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                entries.push({ label: key, value: String(value) });
            } else {
                try {
                    entries.push({ label: key, value: JSON.stringify(value) });
                } catch {
                    entries.push({ label: key, value: String(value) });
                }
            }
        }
        return entries;
    };

    const generateA3ScanPdf = async () => {
        if (!data) return;

        // A3 portrait: 297 x 420 mm
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a3' });
        const pageWidth = 297;
        const pageHeight = 420;
        // No page margins — images go edge-to-edge
        const marginX = 0;
        const marginTop = 0;
        const marginBottom = 0;
        const pxToMm = 0.264583; // 96 DPI pixel-to-mm (keeps 1:1 size)

        // Header overlay anchored to very top of page
        const headerY = 6; // 6mm from top edge
        const headerLineGap = 6;

        const textWithHalo = (
            text: string,
            x: number,
            y: number,
            opts?: { align?: 'left' | 'center' | 'right'; fontStyle?: 'normal' | 'bold' }
        ) => {
            const { align = 'left', fontStyle = 'normal' } = opts ?? {};
            pdf.setFont('helvetica', fontStyle);
            // Halo/outline effect: no background, just multi-draw
            const d = 0.45;
            pdf.setTextColor(255, 255, 255);
            pdf.text(text, x - d, y, { align });
            pdf.text(text, x + d, y, { align });
            pdf.text(text, x, y - d, { align });
            pdf.text(text, x, y + d, { align });
            pdf.text(text, x - d, y - d, { align });
            pdf.text(text, x + d, y + d, { align });
            pdf.text(text, x - d, y + d, { align });
            pdf.text(text, x + d, y - d, { align });
            pdf.setTextColor(0, 0, 0);
            pdf.text(text, x, y, { align });
        };

        pdf.setFontSize(11);
        const createdAtText = data?.createdAt ? formatDate(data.createdAt) : '—';
        const fertigstellungText = data?.fertigstellungBis ? formatDate(data.fertigstellungBis) : '—';
        const kundeText = (data?.customerName || customerName || '—').toString();

        // Images area — edge-to-edge, no offset
        const bottomBlockHeight = 50; // footer text height reserved at bottom
        const topImagesY = 0;         // images start from the very top
        const imagesAreaHeight = pageHeight - bottomBlockHeight - topImagesY;
        const gap = 4;
        const availableWidth = pageWidth;
        const eachWidth = (availableWidth - gap) / 2;
        const maxHeight = imagesAreaHeight;

        const leftUrl = data?.picture_23 || null;
        const rightUrl = data?.picture_24 || null;
        const [leftRaw, rightRaw] = await Promise.all([
            leftUrl ? fetchImageAsDataUrl(leftUrl) : Promise.resolve(null),
            rightUrl ? fetchImageAsDataUrl(rightUrl) : Promise.resolve(null),
        ]);
        const [leftDataUrl, rightDataUrl] = await Promise.all([
            leftRaw ? normalizeImageDataUrlToPng(leftRaw) : Promise.resolve(null),
            rightRaw ? normalizeImageDataUrlToPng(rightRaw) : Promise.resolve(null),
        ]);

        // Contain + center: scale image to fit fully within its slot, centered both axes
        const placeImageContainCenter = async (
            dataUrl: string,
            slotX: number,
            slotY: number,
            slotW: number,
            slotH: number
        ) => {
            const dim = await getImageDimensions(dataUrl);
            if (!dim) return;
            const aspect = dim.w / dim.h;
            let imgW = slotW;
            let imgH = imgW / aspect;
            if (imgH > slotH) {
                imgH = slotH;
                imgW = imgH * aspect;
            }
            const cx = slotX + (slotW - imgW) / 2;
            const cy = slotY + (slotH - imgH) / 2;
            pdf.addImage(dataUrl, 'PNG', cx, cy, imgW, imgH, undefined, 'FAST');
        };

        const frameY = topImagesY;

        if (leftDataUrl) await placeImageContainCenter(leftDataUrl, 0, frameY, eachWidth, maxHeight);
        if (rightDataUrl) await placeImageContainCenter(rightDataUrl, eachWidth + gap, frameY, eachWidth, maxHeight);

        // Header overlay must be drawn AFTER images so it stays on top
        const textPadX = 5;
        textWithHalo(`Erstellt am: ${createdAtText}`, textPadX, headerY);
        textWithHalo('Fertigstellung bis', textPadX, headerY + headerLineGap);
        textWithHalo(fertigstellungText, textPadX, headerY + headerLineGap * 2);
        textWithHalo('Kunde', textPadX, headerY + headerLineGap * 3);
        textWithHalo(kundeText, textPadX, headerY + headerLineGap * 4, { fontStyle: 'bold' });

        // No order number in header (per design requirement)

        // Footer block — anchored to very bottom of page
        const bottomY = pageHeight - bottomBlockHeight;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const footerColGap = 4;
        const leftColX = textPadX;
        const rightColX = availableWidth / 2 + footerColGap;
        const leftColWidth = availableWidth / 2 - textPadX - footerColGap;
        const rightColWidth = availableWidth / 2 - textPadX;
        const startY = bottomY + 8; // start 8mm into the footer block
        const lineGap = 5;

        const writeLines = (x: number, yStart: number, width: number, lines: string[]) => {
            let y = yStart;
            for (const raw of lines) {
                if (y > pageHeight - 4) break;
                const wrapped = pdf.splitTextToSize(raw, width);
                for (const w of wrapped) {
                    if (y > pageHeight - 4) break;
                    pdf.text(w, x, y);
                    y += lineGap;
                }
            }
        };

        const diagnosisValue = (() => {
            if (isSonstiges) return data?.orderCategory?.sonstiges_category || '—';
            if (data?.ausführliche_diagnose) return String(data.ausführliche_diagnose);
            const ds = (data as any)?.diagnosisStatus;
            if (Array.isArray(ds) && ds.length > 0) return ds.map(String).join(', ');
            return '—';
        })();

        const schuhmodell = (data as any)?.schuhmodell_wählen;

        const leftLines: string[] = [];
        leftLines.push('Diagnose:');
        leftLines.push(diagnosisValue);
        leftLines.push('');
        leftLines.push(`Versorgung: ${primaryVersorgungDisplay || '—'}`);
        if (quantityDisplay !== null) leftLines.push(`Menge: ${quantityDisplay}`);
        if (schuhmodell) leftLines.push(`schuhmodell_wählen: ${String(schuhmodell)}`);
        if (isInsole && insoleStandards.length > 0) {
            leftLines.push('');
            for (const item of insoleStandards) {
                leftLines.push(formatLeftRight(item.name, item.left, item.right));
            }
        }
        if (materials.length > 0) {
            leftLines.push('');
            leftLines.push('Materialien');
            for (const m of materials) leftLines.push(m);
        }

        const rightLines: string[] = [];
        if (data?.uberzug) {
            rightLines.push('Überzug:');
            for (const ln of String(data.uberzug).split(/\r?\n/)) rightLines.push(ln);
            rightLines.push('');
        }
        if (data?.versorgung_note) {
            rightLines.push('Notiz');
            for (const ln of String(data.versorgung_note).split(/\r?\n/)) rightLines.push(ln);
        }

        writeLines(leftColX, startY, leftColWidth, leftLines);
        writeLines(rightColX, startY, rightColWidth, rightLines);

        return pdf.output('blob') as Blob;
    };

    const handleShowPdf = async () => {
        if (!data || isGeneratingPdf) return;
        setIsGeneratingPdf(true);
        try {
            revokePdfUrl();
            const blob = await generateA3ScanPdf();
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            // One smart action: show preview + trigger download with customer-name filename
            window.open(url, '_blank', 'noopener,noreferrer');
            const a = document.createElement('a');
            a.href = url;
            a.download = pdfFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    // Determine which image to show based on selected foot
    const getCurrentImage = () => {
        if (selectedFoot === 'left') {
            return data?.picture_23 || null;
        } else if (selectedFoot === 'right') {
            return data?.picture_24 || null;
        }
        return null;
    };

    // Auto-select foot when data loads
    React.useEffect(() => {
        if (data) {
            if (data.picture_23 && !data.picture_24) {
                setSelectedFoot('left');
            } else if (data.picture_24 && !data.picture_23) {
                setSelectedFoot('right');
            } else if (data.picture_23 && data.picture_24) {
                setSelectedFoot('left'); // Default to left if both available
            }
        } else {
            setSelectedFoot(null);
        }
    }, [data]);

    const currentImage = getCurrentImage();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-6xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden p-0 gap-0 shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-[#61A175] flex items-center justify-between">
                    <div className="flex flex-col">
                        <DialogTitle className="text-lg font-semibold text-white">
                            Versorgung{orderNumber ? ` – ${orderNumber}` : ''}
                            {customerName ? ` – ${customerName}` : ''}
                        </DialogTitle>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto overflow-x-hidden max-h-[calc(95vh-180px)] bg-gray-50">
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
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            {/* Left: Images */}
                            <div className="w-full lg:w-[60%] shrink-0">
                                {/* Display Selected Image */}
                                {currentImage ? (
                                    <div className="relative w-full bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center overflow-auto group">
                                        <div className="relative w-full flex items-center justify-center p-4">
                                            <Image
                                                src={currentImage}
                                                alt={selectedFoot === 'left' ? 'Linker Fuß' : 'Rechter Fuß'}
                                                width={0}
                                                height={0}
                                                sizes="100vw"
                                                className="w-full max-w-[30vh] h-auto rounded-xl transition-transform duration-300"

                                                onError={(e) => {
                                                    console.error('Image failed to load:', currentImage);
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.error-message')) {
                                                        const errorMsg = document.createElement('p');
                                                        errorMsg.className = 'text-gray-500 error-message';
                                                        errorMsg.textContent = 'Bild konnte nicht geladen werden';
                                                        parent.appendChild(errorMsg);
                                                    }
                                                }}
                                                unoptimized
                                            />
                                        </div>
                                        {/* 1:1 Bild öffnen Button */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <Button
                                                onClick={() => setShowFullscreen(true)}
                                                variant="default"
                                                size="sm"
                                                className="cursor-pointer bg-[#61A175] hover:bg-[#4d8a5f] text-white shadow-2xl flex items-center gap-2 font-semibold"
                                            >
                                                <Maximize2 className="w-4 h-4" />
                                                1:1 Bild öffnen
                                            </Button>
                                        </div>
                                    </div>
                                ) : selectedFoot ? (
                                    <div className="relative w-full bg-white rounded-xl border-2 border-gray-200 shadow-lg flex items-center justify-center p-8">
                                        <p className="text-gray-500 text-center">Kein Bild verfügbar für {selectedFoot === 'left' ? 'linken' : 'rechten'} Fuß</p>
                                    </div>
                                ) : (
                                    <div className="relative w-full bg-white rounded-xl border-2 border-gray-200 shadow-lg flex items-center justify-center p-8">
                                        <p className="text-gray-500 text-center">Bitte wählen Sie einen Fuß aus</p>
                                    </div>
                                )}

                                {/* Foot Selection Buttons - Below Image */}
                                <div className="mt-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Fuß Auswahl
                                    </h3>
                                    <div className="flex flex-col gap-2.5">
                                        <Button
                                            onClick={() => setSelectedFoot('left')}
                                            variant={selectedFoot === 'left' ? 'default' : 'outline'}
                                            className={`cursor-pointer w-full transition-all duration-200 h-11 ${selectedFoot === 'left'
                                                ? 'bg-[#61A175] hover:bg-[#4d8a5f] text-white shadow-md font-semibold'
                                                : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#61A175] font-medium'
                                                } ${!data?.picture_23 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!data?.picture_23}
                                        >
                                            <span className="mr-2 text-lg">👣</span>
                                            Linker Fuß
                                        </Button>
                                        <Button
                                            onClick={() => setSelectedFoot('right')}
                                            variant={selectedFoot === 'right' ? 'default' : 'outline'}
                                            className={`cursor-pointer w-full transition-all duration-200 h-11 ${selectedFoot === 'right'
                                                ? 'bg-[#61A175] hover:bg-[#4d8a5f] text-white shadow-md font-semibold'
                                                : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#61A175] font-medium'
                                                } ${!data?.picture_24 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!data?.picture_24}
                                        >
                                            <span className="mr-2 text-lg">👣</span>
                                            Rechter Fuß
                                        </Button>
                                    </div>

                                    {/* PDF section under Foot selection */}
                                    <div className="mt-4 rounded-xl border-2 border-gray-200 bg-white p-4">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                            PDF Download
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                onClick={handleShowPdf}
                                                disabled={isGeneratingPdf || (!data?.picture_23 && !data?.picture_24)}
                                                variant="default"
                                                className="cursor-pointer w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold border border-gray-200 flex items-center justify-center gap-2"
                                            >
                                                <Printer className="w-5 h-5" />
                                                {isGeneratingPdf ? 'Wird vorbereitet…' : 'Drucken'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Meta information */}
                            <div className="w-full lg:w-[40%] shrink-0 bg-white rounded-xl p-6 border-2 border-gray-200 ">
                                <div className="space-y-4">
                                    {data?.createdAt && (
                                        <p className="text-sm font-semibold text-gray-900">
                                            <span className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'> Erstellt am:</span> {formatDate(data.createdAt)}
                                        </p>
                                    )}
                                    {data.fertigstellungBis && (
                                        <div className="pb-4 border-b border-gray-100">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Fertigstellung bis
                                            </h3>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatDate(data.fertigstellungBis)}
                                            </p>
                                        </div>
                                    )}
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Kunde
                                        </h3>
                                        <p className="text-sm font-medium text-gray-900">{data.customerName || '—'}</p>
                                    </div>
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Diagnose
                                        </h3>
                                        {isSonstiges ? (
                                            <p className="text-sm font-medium text-gray-900">
                                                {data.orderCategory?.sonstiges_category || '—'}
                                            </p>
                                        ) : data.ausführliche_diagnose ? (
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                    {data.ausführliche_diagnose}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">—</p>
                                        )}
                                    </div>
                                    <div className="pb-4 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">
                                            <span className="font-semibold">Versorgung:</span>{' '}
                                            <span>{primaryVersorgungDisplay || '—'}</span>
                                        </p>
                                        {quantityDisplay !== null && (
                                            <p className="mt-2 text-sm font-medium text-gray-900">
                                                <span className="font-semibold">Menge:</span>{' '}
                                                <span>{quantityDisplay}</span>
                                            </p>
                                        )}
                                        {isInsole && insoleStandards.length > 0 && (
                                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-900 marker:text-gray-500">
                                                {insoleStandards.map((item, idx) => (
                                                    <li key={idx} className="pl-1">
                                                        {formatLeftRight(item.name, item.left, item.right)}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {!isSonstiges && (
                                        <div className="pb-4 border-b border-gray-100">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Materialien
                                            </h3>
                                            {materials.length > 0 ? (
                                                <ul className="list-disc space-y-2 pl-5 text-sm text-gray-900 marker:text-gray-500">
                                                    {materials.map((m, idx) => (
                                                        <li key={idx} className="pl-1">
                                                            {m}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">Keine Materialien angegeben</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Insole Stock Section */}
                                    {data.insoleStock && (
                                        <div className="pb-4 border-b border-gray-100">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Einlagenlager
                                            </h3>
                                            <ul className="list-disc pl-5 text-sm text-gray-900 marker:text-gray-500">
                                                <li className="pl-1">
                                                    {data.insoleStock.produktname} - {data.insoleStock.size}
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {/* Versorgung Note Section */}
                                    {data.versorgung_note && (
                                        <div className="pb-4 border-b border-gray-100">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Notiz
                                            </h3>
                                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                    {data.versorgung_note}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Uberzug Section */}
                                    {data.uberzug && (
                                        <div className="pb-4 border-b border-gray-100">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Überzug
                                            </h3>
                                            <p className="text-sm font-medium text-gray-900">
                                                {data.uberzug}
                                            </p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6 items-start">
                            <div className="w-full lg:w-[60%] shrink-0">
                                <div className="relative w-full min-h-[420px] bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center p-8">
                                    <p className="text-orange-500 font-medium text-center">Im Moment kein Scan verfügbar.</p>
                                </div>
                            </div>

                            <div className="w-full lg:w-[40%] shrink-0 bg-white rounded-xl p-6 border-2 border-gray-200">
                                {data.fertigstellungBis && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Fertigstellung bis
                                        </h3>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatDate(data.fertigstellungBis)}
                                        </p>
                                    </div>
                                )}
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Kunde
                                    </h3>
                                    <p className="text-sm font-medium text-gray-900">{data.customerName || '—'}</p>
                                </div>
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Diagnose
                                    </h3>
                                    {isSonstiges ? (
                                        <p className="text-sm font-medium text-gray-900">
                                            {data.orderCategory?.sonstiges_category || '—'}
                                        </p>
                                    ) : data.ausführliche_diagnose ? (
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                {data.ausführliche_diagnose}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">—</p>
                                    )}
                                </div>
                                <div className="pb-4 border-b border-gray-100">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Versorgung
                                    </h3>
                                    <p className="text-sm  text-gray-900">
                                        <span>{primaryVersorgungDisplay || '—'}</span>
                                    </p>
                                    {isInsole && insoleStandards.length > 0 && (
                                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-900 marker:text-gray-500">
                                            {insoleStandards.map((item, idx) => (
                                                <li key={idx} className="pl-1">
                                                    {formatLeftRight(item.name, item.left, item.right)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {quantityDisplay !== null && (
                                        <p className="mt-2 text-sm font-medium text-gray-900">
                                            <span className="font-semibold">Menge:</span>{' '}
                                            <span>{quantityDisplay}</span>
                                        </p>
                                    )}
                                </div>

                                {data.uberzug && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Überzug
                                        </h3>
                                        <p className="text-sm font-medium text-gray-900">
                                            {data.uberzug}
                                        </p>
                                    </div>
                                )}

                                {!isSonstiges && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Materialien
                                        </h3>
                                        {materials.length > 0 ? (
                                            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-900 marker:text-gray-500">
                                                {materials.map((m, idx) => (
                                                    <li key={idx} className="pl-1">
                                                        {m}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">Keine Materialien angegeben</p>
                                        )}
                                    </div>
                                )}

                                {data.insoleStock && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Einlagenlager
                                        </h3>
                                        <ul className="list-disc pl-5 text-sm text-gray-900 marker:text-gray-500">
                                            <li className="pl-1">
                                                {data.insoleStock.produktname} - {data.insoleStock.size} mm
                                            </li>
                                        </ul>
                                    </div>
                                )}

                                {data.versorgung_note && (
                                    <div className="pb-4 border-b border-gray-100">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                            Notiz
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                                                {data.versorgung_note}
                                            </p>
                                        </div>
                                    </div>
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
                        className="cursor-pointer bg-[#61A175] hover:bg-[#4d8a5f] text-white px-8 py-2 font-semibold shadow-md transition-all duration-200"
                    >
                        Schließen
                    </Button>
                </div>
            </DialogContent>

            {/* Fullscreen 1:1 Image Modal */}
            {currentImage && (
                <FullscreenImageModal
                    isOpen={showFullscreen}
                    onClose={() => setShowFullscreen(false)}
                    imageUrl={currentImage}
                    imageAlt={selectedFoot === 'left' ? 'Linker Fuß - 1:1' : 'Rechter Fuß - 1:1'}
                />
            )}
        </Dialog>
    );
}


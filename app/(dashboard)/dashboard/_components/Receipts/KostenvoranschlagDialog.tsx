'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { identifyKvaData } from '@/apis/productsOrder'
import { generatePdfFromElement } from '@/lib/pdfGenerator'
import KvaSheet, { KvaData } from '@/components/OrdersPage/ProccessTable/KvaPdf/KvaSheet'

const KVA_PDF_ELEMENT_ID = 'kva-customer-history-pdf';

interface KostenvoranschlagDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customerId?: string
}

const getProxyImageUrl = (externalUrl: string): string => {
    if (!externalUrl) return externalUrl;
    if (externalUrl.startsWith('/api/proxy-image?url=')) return externalUrl;
    const absoluteUrl = externalUrl.startsWith('http')
        ? externalUrl
        : `${window.location.origin}${externalUrl.startsWith('/') ? '' : '/'}${externalUrl}`;
    return `/api/proxy-image?url=${encodeURIComponent(absoluteUrl)}`;
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export default function KostenvoranschlagDialog({ open, onOpenChange, customerId }: KostenvoranschlagDialogProps) {
    const [kvaPdfData, setKvaPdfData] = useState<KvaData | null>(null);
    const [kvaPdfLogoProxy, setKvaPdfLogoProxy] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !customerId) return;

        const generatePdf = async () => {
            try {
                const res = await identifyKvaData(customerId);
                if (!res?.success || !res?.data) {
                    toast.error(res?.message || 'KVA Daten konnten nicht geladen werden');
                    onOpenChange(false);
                    return;
                }

                const kvaData: KvaData = res.data;
                setKvaPdfData(kvaData);
                setKvaPdfLogoProxy(kvaData.logo ? getProxyImageUrl(kvaData.logo as string) : null);

                await nextFrame();

                const pdfBlob = await generatePdfFromElement(KVA_PDF_ELEMENT_ID, { scale: 1.5, quality: 0.88, format: 'jpeg' });
                const safeName = (kvaData?.customerInfo?.firstName || 'KVA')
                    .toString()
                    .trim()
                    .replace(/\s+/g, '_');
                downloadBlob(pdfBlob, `Kostenvoranschlag_${safeName}.pdf`);
                toast.success('PDF erfolgreich erstellt');
                onOpenChange(false);
            } catch (e) {
                console.error('KVA PDF error:', e);
                toast.error('Fehler beim Erstellen des KVA PDFs');
                onOpenChange(false);
            } finally {
                setTimeout(() => {
                    setKvaPdfData(null);
                    setKvaPdfLogoProxy(null);
                }, 1500);
            }
        };

        generatePdf();
    }, [open, customerId]);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">Kostenvoranschlag</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-6">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                        <p className="text-sm text-gray-600">PDF wird erstellt...</p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden element for PDF rendering */}
            <div
                id={KVA_PDF_ELEMENT_ID}
                style={{ position: 'fixed', top: '-9999px', left: '-9999px', zIndex: -1, pointerEvents: 'none' }}
            >
                {kvaPdfData ? <KvaSheet data={kvaPdfData} logoProxyUrl={kvaPdfLogoProxy} /> : null}
            </div>
        </>
    );
}

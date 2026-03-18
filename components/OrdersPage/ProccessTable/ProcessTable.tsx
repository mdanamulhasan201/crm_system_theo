import React, { useState, useEffect, useMemo, useRef } from "react";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOrders, OrderData } from "@/contexts/OrdersContext";
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import StatusFilterBar from "./StatusFilterBar";
import SearchBarIWithFilterInsole from "./SearchBarIWithFilterInsole";
import BulkActionsBar from "./BulkActionsBar";
import OrderTableHeader from "./OrderTableHeader";
import OrderTableRow from "./OrderTableRow";
import PaginationControls from "./PaginationControls";
import HistorySidebar from "./HistorySidebar";
import VersorgungModal from "./VersorgungModal";
import ScanPictureModal from "./ScanPictureModal";
import BarcodeStickerModal from "./BarcodeSticker/BarcodeStickerModal";
import StatusNoteModal from "./StatusNoteModal";
import { AbrechnungsuebersichtModal } from "./Abrechnungsuebersicht";
import { useOrderActions } from "@/hooks/orders/useOrderActions";
import { getLabelFromApiStatus } from "@/lib/orderStatusMappings";
import { getBarCodeData } from '@/apis/barCodeGenerateApis';
import { getHalbprobeData, getKrankenKasseStatus, getKvaData, getPaymentStatus, getWerkstattzettelA3Pdf, getWerkstattzettelSheetPdfData, updatePaidStatus } from '@/apis/productsOrder';
import jsPDF from 'jspdf';
import { generatePdfFromElement, pdfPresets } from '@/lib/pdfGenerator';
import WerkstattzettelSheet, { WerkstattzettelSheetData } from './WerkstattzettelPdf/WerkstattzettelSheet';
import KvaSheet, { KvaData } from './KvaPdf/KvaSheet';
import HalbprobeSheet, { HalbprobeData } from './HalbprobePdf/HalbprobeSheet';

import toast from 'react-hot-toast';

export default function ProcessTable() {
    const {
        orders,
        loading,
        error,
        pagination,
        currentPage,
        selectedDays,
        selectedStatus,
        selectedType,
        goToNextPage,
        goToPrevPage,
        setSelectedDays,
        setSelectedStatus,
        refetch,
        deleteBulkOrders,
        bulkUpdateOrderStatus,
        updateOrderPriority,
        updateBulkKrankenkasseStatus,
        updateBulkPaymentStatus,
        updateBulkPaidStatus,
        orderIdFromSearch, // Get orderId from URL
    } = useOrders();

    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // When orderId is in URL, select that order in the table
    useEffect(() => {
        if (orderIdFromSearch && orders.some(order => order.id === orderIdFromSearch)) {
            setSelectedOrderId(orderIdFromSearch);
        }
    }, [orderIdFromSearch, orders]);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [bulkStatusSelectValue, setBulkStatusSelectValue] = useState<string>("");
    const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
    const [isBulkStatusUpdating, setIsBulkStatusUpdating] = useState(false);
    const [pendingBulkStatus, setPendingBulkStatus] = useState<{
        orderIds: string[];
        newStatus: string;
    } | null>(null);
    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [priorityModalOrder, setPriorityModalOrder] = useState<OrderData | null>(null);
    const [prioritySelection, setPrioritySelection] = useState<'Dringend' | 'Normal'>('Normal');
    const [isPriorityUpdating, setIsPriorityUpdating] = useState(false);
    const [showHistorySidebar, setShowHistorySidebar] = useState(false);
    const [historyOrderId, setHistoryOrderId] = useState<string | null>(null);
    const [historyOrderNumber, setHistoryOrderNumber] = useState<string | null>(null);
    const [showVersorgungModal, setShowVersorgungModal] = useState(false);
    const [versorgungOrderId, setVersorgungOrderId] = useState<string | null>(null);
    const [versorgungOrderNumber, setVersorgungOrderNumber] = useState<string | null>(null);
    const [versorgungCustomerName, setVersorgungCustomerName] = useState<string | null>(null);
    const [showScanModal, setShowScanModal] = useState(false);
    const [scanOrderId, setScanOrderId] = useState<string | null>(null);
    const [scanOrderNumber, setScanOrderNumber] = useState<string | null>(null);
    const [scanCustomerName, setScanCustomerName] = useState<string | null>(null);
    const [showBarcodeStickerModal, setShowBarcodeStickerModal] = useState(false);
    const [barcodeStickerOrderId, setBarcodeStickerOrderId] = useState<string | null>(null);
    const [barcodeStickerOrderNumber, setBarcodeStickerOrderNumber] = useState<string | null>(null);
    const [autoGenerateBarcode, setAutoGenerateBarcode] = useState(false);
    const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
    const [isUpdatingKrankenkasseStatus, setIsUpdatingKrankenkasseStatus] = useState(false);
    const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);
    const [isUpdatingPaidStatus, setIsUpdatingPaidStatus] = useState(false);
    const [isGeneratingWerkPdf, setIsGeneratingWerkPdf] = useState(false);
    const [generatingWerkPdfOrderId, setGeneratingWerkPdfOrderId] = useState<string | null>(null);
    const [werkPdfData, setWerkPdfData] = useState<WerkstattzettelSheetData | null>(null);
    const [werkPdfLogoProxy, setWerkPdfLogoProxy] = useState<string | null>(null);
    const [isGeneratingKvaPdf, setIsGeneratingKvaPdf] = useState(false);
    const [generatingKvaOrderId, setGeneratingKvaOrderId] = useState<string | null>(null);
    const [kvaPdfData, setKvaPdfData] = useState<KvaData | null>(null);
    const [kvaPdfLogoProxy, setKvaPdfLogoProxy] = useState<string | null>(null);
    const [isGeneratingHalbprobePdf, setIsGeneratingHalbprobePdf] = useState(false);
    const [generatingHalbprobeOrderId, setGeneratingHalbprobeOrderId] = useState<string | null>(null);
    const [halbprobePdfData, setHalbprobePdfData] = useState<HalbprobeData | null>(null);
    const [halbprobePdfImages, setHalbprobePdfImages] = useState<{
        left23?: string | null;
        right24?: string | null;
        sohlenLinks16?: string | null;
        sohlenRechts17?: string | null;
        fersenneigungLinks10?: string | null;
        fersenneigungRechts11?: string | null;
    } | null>(null);
    const [isGeneratingWerkA3Pdf, setIsGeneratingWerkA3Pdf] = useState(false);
    const [generatingWerkA3OrderId, setGeneratingWerkA3OrderId] = useState<string | null>(null);
    const [openNoteModalId, setOpenNoteModalId] = useState<string | null>(null);
    const [billingModalOrderId, setBillingModalOrderId] = useState<string | null>(null);
    const [billingModalCustomerName, setBillingModalCustomerName] = useState<string>('');
    const [billingModalOrderNumber, setBillingModalOrderNumber] = useState<string>('');
    const tableWrapperRef = useRef<HTMLDivElement | null>(null);
    const dragScrollStateRef = useRef({
        isDragging: false,
        startX: 0,
        scrollLeft: 0,
    });
    const [isDraggingTable, setIsDraggingTable] = useState(false);

    const getTableScrollContainer = () => {
        return tableWrapperRef.current?.querySelector('[data-slot="table-container"]') as HTMLDivElement | null;
    };

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
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
    };

    const WERK_PDF_ELEMENT_ID = 'werkstattzettel-sheet-pdf';
    const KVA_PDF_ELEMENT_ID = 'kva-sheet-pdf';
    const HALBPROBE_PDF_ELEMENT_ID = 'halbprobe-sheet-pdf';
    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const handleWerkstattzettelDownload = async (orderId: string, kundenname?: string | null) => {
        if (isGeneratingWerkPdf) return;
        setIsGeneratingWerkPdf(true);
        setGeneratingWerkPdfOrderId(orderId);
        try {
            const res = await getWerkstattzettelSheetPdfData(orderId);
            if (!res?.success || !res?.data) {
                toast.error(res?.message || 'Werkstattzettel Daten konnten nicht geladen werden');
                return;
            }

            const sheetData: WerkstattzettelSheetData = res.data;
            setWerkPdfData(sheetData);
            setWerkPdfLogoProxy(sheetData.logo ? getProxyImageUrl(sheetData.logo) : null);

            // Let React commit the hidden sheet to the DOM before capturing
            await nextFrame();
            await nextFrame();

            // Document preset (better visual quality for A4)
            const pdfBlob = await generatePdfFromElement(WERK_PDF_ELEMENT_ID, pdfPresets.document);
            const safeName = (sheetData.customerName || kundenname || 'Kunde').toString().trim().replace(/\s+/g, '_');
            downloadBlob(pdfBlob, `Werkstattzettel_${safeName}.pdf`);
        } catch (e) {
            console.error('Werkstattzettel PDF error:', e);
            toast.error('Fehler beim Erstellen des Werkstattzettel PDFs');
        } finally {
            setIsGeneratingWerkPdf(false);
            setGeneratingWerkPdfOrderId(null);
            // Keep data around briefly so element exists until download finishes
            setTimeout(() => {
                setWerkPdfData(null);
                setWerkPdfLogoProxy(null);
            }, 1500);
        }
    };

    const handleKvaDownload = async (orderId: string) => {
        if (isGeneratingKvaPdf) return;
        setIsGeneratingKvaPdf(true);
        setGeneratingKvaOrderId(orderId);
        try {
            const res = await getKvaData(orderId);
            if (!res?.success || !res?.data) {
                toast.error(res?.message || 'KVA Daten konnten nicht geladen werden');
                return;
            }

            const kvaData: KvaData = res.data;
            setKvaPdfData(kvaData);
            setKvaPdfLogoProxy(kvaData.logo ? getProxyImageUrl(kvaData.logo) : null);

            await nextFrame();
            await nextFrame();

            const pdfBlob = await generatePdfFromElement(KVA_PDF_ELEMENT_ID, pdfPresets.document);
            const safeName = (kvaData?.customerInfo?.firstName || 'KVA')
                .toString()
                .trim()
                .replace(/\s+/g, '_');
            downloadBlob(pdfBlob, `Kostenvoranschlag_${safeName}.pdf`);
        } catch (e) {
            console.error('KVA PDF error:', e);
            toast.error('Fehler beim Erstellen des KVA PDFs');
        } finally {
            setIsGeneratingKvaPdf(false);
            setGeneratingKvaOrderId(null);
            setTimeout(() => {
                setKvaPdfData(null);
                setKvaPdfLogoProxy(null);
            }, 1500);
        }
    };

    const handleHalbprobeDownload = async (orderId: string) => {
        if (isGeneratingHalbprobePdf) return;
        setIsGeneratingHalbprobePdf(true);
        setGeneratingHalbprobeOrderId(orderId);
        try {
            const res = await getHalbprobeData(orderId);
            if (!res?.success || !res?.data) {
                toast.error(res?.message || 'Halbprobe Daten konnten nicht geladen werden');
                return;
            }

            const sheetData: HalbprobeData = res.data;
            setHalbprobePdfData(sheetData);

            const files = (sheetData as any)?.screenerFile ?? {};
            const img23 = typeof files?.picture_23 === 'string' ? files.picture_23 : null;
            const img24 = typeof files?.picture_24 === 'string' ? files.picture_24 : null;
            const img16 = typeof files?.picture_16 === 'string' ? files.picture_16 : null;
            const img17 = typeof files?.picture_17 === 'string' ? files.picture_17 : null;
            const img10 = typeof files?.picture_10 === 'string' ? files.picture_10 : null;
            const img11 = typeof files?.picture_11 === 'string' ? files.picture_11 : null;

            setHalbprobePdfImages({
                left23: img23 ? getProxyImageUrl(img23) : null,
                right24: img24 ? getProxyImageUrl(img24) : null,
                sohlenLinks16: img16 ? getProxyImageUrl(img16) : null,
                sohlenRechts17: img17 ? getProxyImageUrl(img17) : null,
                fersenneigungLinks10: img10 ? getProxyImageUrl(img10) : null,
                fersenneigungRechts11: img11 ? getProxyImageUrl(img11) : null,
            });

            await nextFrame();
            await nextFrame();

            const pdfBlob = await generatePdfFromElement(HALBPROBE_PDF_ELEMENT_ID, pdfPresets.document);
            const safeName = [
                (sheetData as any)?.customerInfo?.firstName,
                (sheetData as any)?.customerInfo?.lastName,
            ]
                .filter(Boolean)
                .join('_')
                .trim()
                .replace(/\s+/g, '_') || 'Halbprobe';
            downloadBlob(pdfBlob, `Kostenvoranschlag_${safeName}.pdf`);
        } catch (e) {
            console.error('Halbprobe PDF error:', e);
            toast.error('Fehler beim Erstellen des Kostenvoranschlag PDFs');
        } finally {
            setIsGeneratingHalbprobePdf(false);
            setGeneratingHalbprobeOrderId(null);
            setTimeout(() => {
                setHalbprobePdfData(null);
                setHalbprobePdfImages(null);
            }, 1500);
        }
    };

    const handleWerkstattzettelA3Download = async (orderId: string) => {
        if (isGeneratingWerkA3Pdf) return;
        setIsGeneratingWerkA3Pdf(true);
        setGeneratingWerkA3OrderId(orderId);
        try {
            const res = await getWerkstattzettelA3Pdf(orderId);
            if (!res?.success || !res?.data) {
                toast.error(res?.message || 'Werkstattzettel A3 Daten konnten nicht geladen werden');
                return;
            }
            const d = res.data;

            const fetchImg = async (url: string): Promise<string | null> => {
                try {
                    if (!url) return null;
                    if (url.startsWith('data:')) return url;
                    const r = await fetch(getProxyImageUrl(url));
                    if (!r.ok) return null;
                    const b = await r.blob();
                    return await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(b);
                    });
                } catch { return null; }
            };

            const toPng = async (dataUrl: string): Promise<string | null> => {
                try {
                    if (!dataUrl) return null;
                    if (dataUrl.startsWith('data:image/png')) return dataUrl;
                    const img = new window.Image();
                    img.crossOrigin = 'anonymous';
                    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = dataUrl; });
                    const c = document.createElement('canvas');
                    c.width = img.width; c.height = img.height;
                    const ctx = c.getContext('2d');
                    if (!ctx) return null;
                    ctx.drawImage(img, 0, 0);
                    return c.toDataURL('image/png');
                } catch { return null; }
            };

            const getDim = async (dataUrl: string): Promise<{ w: number; h: number } | null> => {
                try {
                    const img = new window.Image();
                    img.crossOrigin = 'anonymous';
                    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); img.src = dataUrl; });
                    return { w: img.width, h: img.height };
                } catch { return null; }
            };

            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a3' });
            const pageWidth = 297;
            const pageHeight = 420;
            const marginX = 22;
            const marginTop = 25;
            const marginBottom = 25;
            const pxToMm = 0.264583;

            const textWithHalo = (text: string, x: number, y: number, opts?: { align?: 'left' | 'center' | 'right'; fontStyle?: 'normal' | 'bold' }) => {
                const { align = 'left', fontStyle = 'normal' } = opts ?? {};
                pdf.setFont('helvetica', fontStyle);
                const delta = 0.45;
                pdf.setTextColor(255, 255, 255);
                [[-delta, 0], [delta, 0], [0, -delta], [0, delta], [-delta, -delta], [delta, delta], [-delta, delta], [delta, -delta]].forEach(([dx, dy]) => {
                    pdf.text(text, x + dx, y + dy, { align });
                });
                pdf.setTextColor(0, 0, 0);
                pdf.text(text, x, y, { align });
            };

            const bottomBlockHeight = 120;
            const imageOffsetY = 10;
            const topImagesY = marginTop + imageOffsetY;
            const gap = 10;
            const availableWidth = pageWidth - marginX * 2;
            const eachWidth = (availableWidth - gap) / 2;

            const leftUrl = d.screenerFile?.picture_23 || null;
            const rightUrl = d.screenerFile?.picture_24 || null;
            const [leftRaw, rightRaw] = await Promise.all([
                leftUrl ? fetchImg(leftUrl) : Promise.resolve(null),
                rightUrl ? fetchImg(rightUrl) : Promise.resolve(null),
            ]);
            const [leftPng, rightPng] = await Promise.all([
                leftRaw ? toPng(leftRaw) : Promise.resolve(null),
                rightRaw ? toPng(rightRaw) : Promise.resolve(null),
            ]);

            const placeImage = async (dataUrl: string, x: number, y: number, slotW: number) => {
                const dim = await getDim(dataUrl);
                if (!dim) return;
                const nw = dim.w * pxToMm;
                const nh = dim.h * pxToMm;
                const cx = Math.max(x, x + (slotW - nw) / 2);
                pdf.addImage(dataUrl, 'PNG', cx, y, nw, nh, undefined, 'FAST');
            };

            if (leftPng) await placeImage(leftPng, marginX, topImagesY, eachWidth);
            if (rightPng) await placeImage(rightPng, marginX + eachWidth + gap, topImagesY, eachWidth);

            // Header overlay (drawn after images)
            pdf.setFontSize(11);
            const headerLineGap = 6;
            const customerName = [d.customerInfo?.firstName, d.customerInfo?.lastName].filter(Boolean).join(' ').trim() || '—';
            textWithHalo(`Auftrag: ${d.orderNumber ?? '—'}`, marginX, marginTop);
            textWithHalo('Kunde', marginX, marginTop + headerLineGap);
            textWithHalo(customerName, marginX, marginTop + headerLineGap * 2, { fontStyle: 'bold' });

            // Bottom block
            const bottomY = pageHeight - marginBottom - bottomBlockHeight;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const leftColX = marginX;
            const rightColX = marginX + availableWidth / 2 - 28;
            const leftColWidth = Math.max(50, rightColX - leftColX - 3);
            const rightColWidth = Math.max(50, marginX + availableWidth - rightColX);
            const startY = bottomY + 42;
            const lineGap = 5;

            const writeLines = (x: number, yStart: number, width: number, lines: string[]) => {
                let ly = yStart;
                for (const raw of lines) {
                    if (ly > bottomY + bottomBlockHeight - 8) break;
                    for (const w of pdf.splitTextToSize(raw, width)) {
                        if (ly > bottomY + bottomBlockHeight - 8) break;
                        pdf.text(w, x, ly);
                        ly += lineGap;
                    }
                }
            };

            const leftLines: string[] = [];
            leftLines.push('Diagnose / Versorgung:');
            leftLines.push(d.diagnosisInfo?.productName || '—');
            leftLines.push('');
            leftLines.push(`Versorgung: ${d.diagnosisInfo?.versorgung || '—'}`);
            if (d.quantity) leftLines.push(`Menge: ${d.quantity}`);
            if (d.diagnosisInfo?.material) { leftLines.push(''); leftLines.push('Material:'); leftLines.push(d.diagnosisInfo.material); }
            if (d.footSize) leftLines.push(`Fußgröße: ${d.footSize}`);

            const rightLines: string[] = [];
            if (d.customerInfo?.address) { rightLines.push('Adresse:'); rightLines.push(d.customerInfo.address); rightLines.push(''); }
            if (d.customerInfo?.birthDate) rightLines.push(`Geb.: ${d.customerInfo.birthDate}`);

            writeLines(leftColX, startY, leftColWidth, leftLines);
            writeLines(rightColX, startY, rightColWidth, rightLines);

            const blob = pdf.output('blob') as Blob;
            const safeName = customerName.replace(/\s+/g, '_');
            downloadBlob(blob, `Werkstattzettel_A3_${safeName}.pdf`);
        } catch (e) {
            console.error('Werkstattzettel A3 PDF error:', e);
            toast.error('Fehler beim Erstellen des Werkstattzettel A3 PDFs');
        } finally {
            setIsGeneratingWerkA3Pdf(false);
            setGeneratingWerkA3OrderId(null);
        }
    };

    // Direct generate and send PDF when status is clicked
    const handleStatusClickGenerateAndSend = async (orderId: string, orderNumber: string) => {
        if (isGeneratingBarcode) return;

        setIsGeneratingBarcode(true);
        try {
            // Fetch barcode data
            const response = await getBarCodeData(orderId, 'right');
            if (!response.success || !response.data) {
                toast.error(response?.error || response?.message || 'Fehler beim Laden der Barcode-Daten');
                setIsGeneratingBarcode(false);
                return;
            }

            const barcodeData = response.data;

            // Open modal with auto-generate to handle PDF generation
            setBarcodeStickerOrderId(orderId);
            setBarcodeStickerOrderNumber(orderNumber);
            setAutoGenerateBarcode(true);
            setShowBarcodeStickerModal(true);

            // The modal will handle generation and sending
        } catch (error) {
            console.error('Failed to start PDF generation:', error);
            toast.error('Fehler beim Starten der PDF-Generierung');
            setIsGeneratingBarcode(false);
        }
    };

    const {
        showConfirmModal,
        setShowConfirmModal,
        isDeleting,
        pendingAction,
        deleteLoading,
        handleDeleteOrder,
        executeDeleteOrder,
        handleInvoiceDownload,
    } = useOrderActions();


    // Memoized orders
    const memoizedOrders = useMemo(() => orders, [orders]);

    // Handle status filter
    const handleStatusFilter = (status: string) => {
        if (selectedStatus === status) {
            setSelectedStatus(null);
        } else {
            setSelectedStatus(status);
        }
        setSelectedOrderId(null);
        setSelectedOrderIds([]);
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        if (newPage > currentPage) goToNextPage();
        else if (newPage < currentPage) goToPrevPage();
        setSelectedOrderId(null);
        setSelectedOrderIds([]);
    };

    // Handle select all checkbox
    const handleSelectAll = () => {
        if (selectedOrderIds.length === memoizedOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(memoizedOrders.map(order => order.id));
        }
    };

    // Handle individual checkbox
    const handleSelectOrder = (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedOrderIds(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId);
            } else {
                return [...prev, orderId];
            }
        });
    };

    // Check if all visible orders are selected
    const isAllSelected = memoizedOrders.length > 0 && selectedOrderIds.length === memoizedOrders.length;
    const isSomeSelected = selectedOrderIds.length > 0 && selectedOrderIds.length < memoizedOrders.length;

    // Clear selection when orders change (but preserve selection if orders still exist)
    useEffect(() => {
        if (orders.length > 0 && selectedOrderId) {
            const orderExists = orders.some(order => order.id === selectedOrderId);
            if (!orderExists) {
                setSelectedOrderId(null);
            }
        }

        // Clean up multiselect for orders that no longer exist
        // But preserve selection if orders still exist (to prevent unchecking during updates)
        if (selectedOrderIds.length > 0) {
            const validIds = selectedOrderIds.filter(id =>
                orders.some(order => order.id === id)
            );
            // Only update if some orders were actually removed (not just a data refresh)
            // This prevents clearing selection when orders are refetched with same IDs
            if (validIds.length < selectedOrderIds.length && validIds.length >= 0) {
                setSelectedOrderIds(validIds.length > 0 ? validIds : []);
            }
        }
    }, [orders, selectedOrderId, selectedOrderIds]);

    // Handle confirm modal actions
    const handleConfirm = async () => {
        if (pendingAction?.type === 'delete') {
            await executeDeleteOrder((id: string | null) => setSelectedOrderId(id));
        }
    };

    // Handle bulk delete
    const handleBulkDelete = (orderIds: string[]) => {
        setShowBulkDeleteModal(true);
    };

    const handleBulkStatusChange = (orderIds: string[], newStatus: string) => {
        if (orderIds.length === 0) return;
        setPendingBulkStatus({ orderIds, newStatus });
        setShowBulkStatusModal(true);
    };

    const executeBulkStatusChange = async () => {
        if (!pendingBulkStatus) return;
        setIsBulkStatusUpdating(true);
        try {
            await bulkUpdateOrderStatus(pendingBulkStatus.orderIds, pendingBulkStatus.newStatus);
            toast.success('Status erfolgreich aktualisiert');
            setShowBulkStatusModal(false);
            setPendingBulkStatus(null);
            setSelectedOrderIds([]);
            setBulkStatusSelectValue("");
        } catch (error) {
            console.error('Failed to update statuses:', error);
            toast.error('Fehler beim Aktualisieren des Status');
        } finally {
            setIsBulkStatusUpdating(false);
        }
    };

    // Handle bulk Krankenkasse status update
    const handleBulkKrankenkasseStatus = async (orderIds: string[], krankenkasseStatus: string) => {
        if (orderIds.length === 0) return;
        setIsUpdatingKrankenkasseStatus(true);
        try {
            // Optimistically update the UI immediately (no table reload needed)
            updateBulkKrankenkasseStatus(orderIds, krankenkasseStatus);

            // Then update on the server
            await getKrankenKasseStatus(orderIds, krankenkasseStatus);
            toast.success(`Krankenkasse-Status erfolgreich aktualisiert`);

            // Don't refetch - optimistic update already shows the change
            // This prevents table reload and preserves selection
            // The data is already updated in the UI via optimistic update

        } catch (error) {
            console.error('Failed to update Krankenkasse status:', error);
            toast.error('Fehler beim Aktualisieren des Krankenkasse-Status');
            // Only refetch on error to revert the optimistic update
            refetch();
        } finally {
            setIsUpdatingKrankenkasseStatus(false);
        }
    };

    // Handle bulk payment status update with optimistic update
    const handleBulkPaymentStatus = async (orderIds: string[], paymentStatus: string) => {
        if (orderIds.length === 0) return;
        setIsUpdatingPaymentStatus(true);
        try {
            // Optimistically update the UI immediately (no table reload needed)
            updateBulkPaymentStatus(orderIds, paymentStatus);

            // Then update on the server
            await getPaymentStatus(orderIds, paymentStatus, paymentStatus);
            toast.success(`${orderIds.length} ${orderIds.length === 1 ? 'Auftrag' : 'Aufträge'} Zahlungsstatus erfolgreich aktualisiert`);

            // Don't refetch - optimistic update already shows the change
            // This prevents table reload and preserves selection
            setSelectedOrderIds([]);
        } catch (error) {
            console.error('Failed to update payment status:', error);
            toast.error('Fehler beim Aktualisieren des Zahlungsstatus');
            // Only refetch on error to revert the optimistic update
            refetch();
        } finally {
            setIsUpdatingPaymentStatus(false);
        }
    };

    // Handle bulk insurance_payed / private_payed update for "broth" type orders
    const handleBulkPaidStatus = async (orderIds: string[], insurance_payed: boolean, private_payed: boolean) => {
        if (orderIds.length === 0) return;
        setIsUpdatingPaidStatus(true);
        try {
            updateBulkPaidStatus(orderIds, insurance_payed, private_payed);
            await updatePaidStatus(orderIds, insurance_payed, private_payed);
            toast.success(`Zahlungsstatus für ${orderIds.length} ${orderIds.length === 1 ? 'Auftrag' : 'Aufträge'} aktualisiert`);
        } catch (error) {
            console.error('Failed to update paid status:', error);
            toast.error('Fehler beim Aktualisieren des Zahlungsstatus');
            refetch();
        } finally {
            setIsUpdatingPaidStatus(false);
        }
    };

    useEffect(() => {
        if (selectedOrderIds.length === 0) {
            setBulkStatusSelectValue("");
        }
    }, [selectedOrderIds.length]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const container = getTableScrollContainer();
            const dragState = dragScrollStateRef.current;

            if (!container || !dragState.isDragging) return;

            const deltaX = event.clientX - dragState.startX;
            container.scrollLeft = dragState.scrollLeft - deltaX;
            event.preventDefault();
        };

        const handleMouseUp = () => {
            if (!dragScrollStateRef.current.isDragging) return;

            dragScrollStateRef.current.isDragging = false;
            setIsDraggingTable(false);
            document.body.style.userSelect = "";
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = "";
        };
    }, []);

    const executeBulkDelete = async () => {
        if (selectedOrderIds.length === 0) return;

        setIsBulkDeleting(true);
        try {
            await deleteBulkOrders(selectedOrderIds);
            toast.success(`${selectedOrderIds.length} ${selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'} erfolgreich gelöscht`);
            setSelectedOrderIds([]);
            setSelectedOrderId(null);
        } catch (error) {
            console.error('Failed to delete orders:', error);
            toast.error('Fehler beim Löschen der Aufträge');
        } finally {
            setIsBulkDeleting(false);
            setShowBulkDeleteModal(false);
        }
    };

    const handleTableMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;

        const target = event.target as HTMLElement | null;
        if (target?.closest('button, input, a, select, textarea, [role="checkbox"], [data-radix-collection-item]')) {
            return;
        }

        const container = getTableScrollContainer();
        if (!container || container.scrollWidth <= container.clientWidth) return;

        dragScrollStateRef.current = {
            isDragging: true,
            startX: event.clientX,
            scrollLeft: container.scrollLeft,
        };
        setIsDraggingTable(true);
        document.body.style.userSelect = "none";
    };

    if (error) {
        return (
            <div className="mt-6 sm:mt-10 max-w-full flex justify-center items-center py-20">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Fehler: {error}</p>
                    <Button onClick={refetch} variant="outline">
                        Erneut versuchen
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mt-5 max-w-full space-y-6">
                {selectedOrderIds.length === 0 ? (
                    <>
                      
                        <StatusFilterBar
                            selectedDays={selectedDays}
                            selectedStatus={selectedStatus}
                            selectedType={selectedType}
                            activeStep={-1}
                            onDaysChange={setSelectedDays}
                            onStatusFilter={handleStatusFilter}
                            onClearFilter={() => setSelectedStatus(null)}
                        />
                    </>
                ) : (
                    <BulkActionsBar
                        selectedOrderIds={selectedOrderIds}
                        selectedOrders={memoizedOrders.filter(order => selectedOrderIds.includes(order.id))}
                        selectedType={selectedType}
                        onClearSelection={() => setSelectedOrderIds([])}
                        onBulkDelete={handleBulkDelete}
                        onBulkStatusChange={handleBulkStatusChange}
                        statusValue={bulkStatusSelectValue}
                        onStatusValueChange={setBulkStatusSelectValue}
                        onBulkKrankenkasseStatus={handleBulkKrankenkasseStatus}
                        isUpdatingKrankenkasseStatus={isUpdatingKrankenkasseStatus}
                        onBulkPaymentStatus={handleBulkPaymentStatus}
                        isUpdatingPaymentStatus={isUpdatingPaymentStatus}
                        onBulkPaidStatus={handleBulkPaidStatus}
                        isUpdatingPaidStatus={isUpdatingPaidStatus}
                    />
                )}

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div
                        ref={tableWrapperRef}
                        className={isDraggingTable ? 'cursor-grabbing' : 'cursor-grab'}
                        onMouseDown={handleTableMouseDown}
                    >
                        <Table className="w-full min-w-[1700px]">
                            <TableHeader>
                                <OrderTableHeader
                                    isAllSelected={isAllSelected}
                                    isSomeSelected={isSomeSelected}
                                    onSelectAll={handleSelectAll}
                                />
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Aufträge werden geladen...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : memoizedOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <p className="text-gray-600 mb-4 text-lg">Keine Aufträge gefunden</p>
                                                <Button onClick={refetch} variant="outline">
                                                    Aktualisieren
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    memoizedOrders.map((order) => (
                                        <OrderTableRow
                                            key={order.id}
                                            order={order}
                                            isSelected={selectedOrderIds.includes(order.id)}
                                            isRowSelected={selectedOrderId === order.id}
                                            deleteLoading={deleteLoading}
                                            onRowClick={setSelectedOrderId}
                                            onCheckboxChange={handleSelectOrder}
                                            onDelete={(id) => handleDeleteOrder(id, (id: string | null) => setSelectedOrderId(id))}
                                            onInvoiceDownload={handleInvoiceDownload}
                                            onWerkstattzettelDownload={handleWerkstattzettelDownload}
                                            werkstattzettelLoading={isGeneratingWerkPdf && generatingWerkPdfOrderId === order.id}
                                            onKvaDownload={handleKvaDownload}
                                            kvaLoading={isGeneratingKvaPdf && generatingKvaOrderId === order.id}
                                            onHalbprobeDownload={handleHalbprobeDownload}
                                            halbprobeLoading={isGeneratingHalbprobePdf && generatingHalbprobeOrderId === order.id}
                                            onWerkstattzettelA3Download={handleWerkstattzettelA3Download}
                                            werkstattzettelA3Loading={isGeneratingWerkA3Pdf && generatingWerkA3OrderId === order.id}
                                            onBarcodeStickerClick={(orderId, orderNumber, autoGenerate) => {
                                                setBarcodeStickerOrderId(orderId);
                                                setBarcodeStickerOrderNumber(orderNumber);
                                                setAutoGenerateBarcode(autoGenerate || false);
                                                setShowBarcodeStickerModal(true);
                                            }}
                                            onStatusClickGenerateAndSend={handleStatusClickGenerateAndSend}
                                            onPriorityClick={(orderData) => {
                                                setPriorityModalOrder(orderData);
                                                setPrioritySelection(orderData.priority || 'Normal');
                                                setShowPriorityModal(true);
                                            }}
                                            onHistoryClick={(orderId, orderNumber) => {
                                                setHistoryOrderId(orderId);
                                                setHistoryOrderNumber(orderNumber);
                                                setShowHistorySidebar(true);
                                            }}
                                            onScanClick={(orderId, orderNumber, customerName) => {
                                                setScanOrderId(orderId);
                                                setScanOrderNumber(orderNumber);
                                                setScanCustomerName(customerName);
                                                setShowScanModal(true);
                                            }}
                                            onVersorgungClick={(orderId, orderNumber, customerName) => {
                                                setVersorgungOrderId(orderId);
                                                setVersorgungOrderNumber(orderNumber);
                                                setVersorgungCustomerName(customerName);
                                                setShowVersorgungModal(true);
                                            }}
                                            onNoteClick={(orderId) => {
                                                setOpenNoteModalId(orderId);
                                            }}
                                            onPriceClick={(orderId, customerName, orderNumber) => {
                                                setBillingModalOrderId(orderId);
                                                setBillingModalCustomerName(customerName);
                                                setBillingModalOrderNumber(orderNumber);
                                            }}
                                        />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <PaginationControls
                    pagination={pagination}
                    currentPage={currentPage}
                    ordersCount={memoizedOrders.length}
                    selectedStatus={selectedStatus}
                    onPageChange={handlePageChange}
                />

                <ConfirmModal
                    open={showConfirmModal}
                    onOpenChange={setShowConfirmModal}
                    title="Auftrag löschen bestätigen"
                    description="Sind Sie sicher, dass Sie den Auftrag"
                    orderName={pendingAction?.orderName}
                    currentStatus={pendingAction?.currentStatus || ''}
                    newStatus={pendingAction?.newStatus || ''}
                    onConfirm={handleConfirm}
                    confirmText="Ja, löschen"
                    isDeleteAction={true}
                    isLoading={isDeleting}
                />

                {/* Bulk Delete Confirmation Modal */}
                <ConfirmModal
                    open={showBulkDeleteModal}
                    onOpenChange={setShowBulkDeleteModal}
                    title="Mehrere Aufträge löschen bestätigen"
                    description={`Sind Sie sicher, dass Sie ${selectedOrderIds.length} ${selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'} löschen möchten?`}
                    orderName={`${selectedOrderIds.length} ${selectedOrderIds.length === 1 ? 'Auftrag' : 'Aufträge'}`}
                    currentStatus=""
                    newStatus=""
                    onConfirm={executeBulkDelete}
                    confirmText="Ja, alle löschen"
                    isDeleteAction={true}
                    isLoading={isBulkDeleting}
                />

                <ConfirmModal
                    open={showBulkStatusModal}
                    onOpenChange={(open) => {
                        setShowBulkStatusModal(open);
                        if (!open) {
                            setIsBulkStatusUpdating(false);
                            setPendingBulkStatus(null);
                        }
                    }}
                    title="Status ändern bestätigen"
                    description={`Sind Sie sicher, dass Sie den Status für ${pendingBulkStatus?.orderIds.length || 0} ${pendingBulkStatus && pendingBulkStatus.orderIds.length === 1 ? 'Auftrag' : 'Aufträge'}`}
                    orderName={`${pendingBulkStatus?.orderIds.length || 0} ${pendingBulkStatus && pendingBulkStatus.orderIds.length === 1 ? 'Auftrag' : 'Aufträge'}`}
                    currentStatus="Mehrere Statuswerte"
                    newStatus={pendingBulkStatus ? getLabelFromApiStatus(pendingBulkStatus.newStatus) : ''}
                    onConfirm={executeBulkStatusChange}
                    confirmText="Bestätigen"
                    isLoading={isBulkStatusUpdating}
                />

                <Dialog open={showPriorityModal} onOpenChange={(open) => {
                    setShowPriorityModal(open);
                    if (!open) {
                        setPriorityModalOrder(null);
                        setIsPriorityUpdating(false);
                    }
                }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Priorität ändern</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Wähle die gewünschte Priorität für <strong>{priorityModalOrder?.kundenname}</strong>
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                {(['Dringend', 'Normal'] as ('Dringend' | 'Normal')[]).map(option => (
                                    <button
                                        key={option}
                                        className={`w-full border rounded-lg py-2 px-3 text-sm font-medium cursor-pointer transition ${prioritySelection === option
                                            ? option === 'Dringend'
                                                ? 'border-red-500 bg-red-50 text-red-600'
                                                : 'border-gray-400 bg-gray-100 text-gray-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                        onClick={() => setPrioritySelection(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="cursor-pointer" onClick={() => setShowPriorityModal(false)} disabled={isPriorityUpdating}>
                                Abbrechen
                            </Button>
                            <Button
                                className="cursor-pointer"
                                onClick={async () => {
                                    if (!priorityModalOrder) return;
                                    setIsPriorityUpdating(true);
                                    try {
                                        await updateOrderPriority(priorityModalOrder.id, prioritySelection);
                                        toast.success('Priorität aktualisiert');
                                        setShowPriorityModal(false);
                                    } catch (error) {
                                        console.error('Failed to update priority:', error);
                                        toast.error('Fehler beim Aktualisieren der Priorität');
                                    } finally {
                                        setIsPriorityUpdating(false);
                                    }
                                }}
                                disabled={isPriorityUpdating}
                            >
                                {isPriorityUpdating ? 'Aktualisiere...' : 'Speichern'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* History Sidebar */}
                <HistorySidebar
                    isOpen={showHistorySidebar}
                    onClose={() => {
                        setShowHistorySidebar(false);
                        setHistoryOrderId(null);
                        setHistoryOrderNumber(null);
                    }}
                    orderId={historyOrderId}
                    orderNumber={historyOrderNumber || undefined}
                />

                {/* Versorgung Modal */}
                <VersorgungModal
                    isOpen={showVersorgungModal}
                    onClose={() => {
                        setShowVersorgungModal(false);
                        setVersorgungOrderId(null);
                        setVersorgungOrderNumber(null);
                        setVersorgungCustomerName(null);
                    }}
                    orderId={versorgungOrderId}
                    orderNumber={versorgungOrderNumber || undefined}
                    customerName={versorgungCustomerName || undefined}
                />

                {/* Scan Picture Modal */}
                <ScanPictureModal
                    isOpen={showScanModal}
                    onClose={() => {
                        setShowScanModal(false);
                        setScanOrderId(null);
                        setScanOrderNumber(null);
                        setScanCustomerName(null);
                    }}
                    orderId={scanOrderId}
                    orderNumber={scanOrderNumber || undefined}
                    customerName={scanCustomerName || undefined}
                />

                {/* Barcode Sticker Modal */}
                <BarcodeStickerModal
                    isOpen={showBarcodeStickerModal}
                    onClose={() => {
                        setShowBarcodeStickerModal(false);
                        setBarcodeStickerOrderId(null);
                        setBarcodeStickerOrderNumber(null);
                        setAutoGenerateBarcode(false);
                    }}
                    orderId={barcodeStickerOrderId || ''}
                    orderNumber={barcodeStickerOrderNumber || undefined}
                    autoGenerate={autoGenerateBarcode}
                />

                {/* Status Note Modal – fetches getStatusNote(orderId) and shows note + order/customer/product */}
                <StatusNoteModal
                    isOpen={!!openNoteModalId}
                    onClose={() => setOpenNoteModalId(null)}
                    orderId={openNoteModalId}
                />

                {/* Abrechnungsübersicht – opens on Preis click, fetches getPriseDetails(orderId) */}
                <AbrechnungsuebersichtModal
                    isOpen={!!billingModalOrderId}
                    onClose={() => {
                        setBillingModalOrderId(null);
                        setBillingModalCustomerName('');
                        setBillingModalOrderNumber('');
                    }}
                    orderId={billingModalOrderId}
                    customerName={billingModalCustomerName}
                    orderNumber={billingModalOrderNumber}
                    onInvoiceDownload={handleInvoiceDownload}
                />
            </div>

            {/* Hidden A4 sheet render for PDF generation */}
            <div className="fixed left-[-10000px] top-0 opacity-0 pointer-events-none">
                <div id={WERK_PDF_ELEMENT_ID}>
                    {werkPdfData ? <WerkstattzettelSheet data={werkPdfData} logoProxyUrl={werkPdfLogoProxy} /> : null}
                </div>
            </div>

            <div className="fixed left-[-10000px] top-0 opacity-0 pointer-events-none">
                <div id={KVA_PDF_ELEMENT_ID}>
                    {kvaPdfData ? <KvaSheet data={kvaPdfData} logoProxyUrl={kvaPdfLogoProxy} /> : null}
                </div>
            </div>

            <div className="fixed left-[-10000px] top-0 opacity-0 pointer-events-none">
                <div id={HALBPROBE_PDF_ELEMENT_ID}>
                    {halbprobePdfData && halbprobePdfImages ? (
                        <HalbprobeSheet data={halbprobePdfData} images={halbprobePdfImages} />
                    ) : null}
                </div>
            </div>
        </>
    );
}

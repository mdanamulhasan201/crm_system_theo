"use client";

import { useState } from 'react';
import { getWerkstattzettelA3Pdf } from '@/apis/productsOrder';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

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
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const useWerkstattzettelA3Download = () => {
    const [isGeneratingWerkA3Pdf, setIsGeneratingWerkA3Pdf] = useState(false);
    const [generatingWerkA3OrderId, setGeneratingWerkA3OrderId] = useState<string | null>(null);

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

            // A3 portrait: 297 x 420 mm
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a3' });
            const pageWidth = 297;
            const pageHeight = 420;

            const textWithHalo = (
                text: string,
                x: number,
                y: number,
                opts?: { align?: 'left' | 'center' | 'right'; fontStyle?: 'normal' | 'bold' },
            ) => {
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

            const now = new Date();
            const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
            const todayText = `${String(now.getDate()).padStart(2, '0')}. ${months[now.getMonth()]} ${now.getFullYear()}`;

            const formatFinishDateGerman = (iso: string | null | undefined): string | null => {
                if (!iso) return null;
                const dt = new Date(iso);
                if (Number.isNaN(dt.getTime())) return null;
                try {
                    return dt.toLocaleString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                } catch {
                    const day = String(dt.getDate()).padStart(2, '0');
                    const mon = months[dt.getMonth()];
                    const year = dt.getFullYear();
                    const h = String(dt.getHours()).padStart(2, '0');
                    const min = String(dt.getMinutes()).padStart(2, '0');
                    return `${day}. ${mon} ${year}, ${h}:${min} Uhr`;
                }
            };

            const finishDateText = formatFinishDateGerman(
                (d as { finishDate?: string | null }).finishDate
            );

            const customerName = [d.customerInfo?.firstName, d.customerInfo?.lastName].filter(Boolean).join(' ').trim() || '—';

            const bottomBlockHeight = 50;
            const topImagesY = 50;
            const imagesAreaHeight = pageHeight - bottomBlockHeight - topImagesY;
            const gap = 4;
            const availableWidth = pageWidth;
            const eachWidth = (availableWidth - gap) / 2;
            const maxHeight = imagesAreaHeight;

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

            // Place image at original size (px → mm at 96 dpi), centered in slot — no scaling
            const placeImageNaturalCenter = async (dataUrl: string, slotX: number, slotY: number, slotW: number, slotH: number) => {
                const dim = await getDim(dataUrl);
                if (!dim) return;
                const mmPerPx = 25.4 / 96;
                const imgW = dim.w * mmPerPx;
                const imgH = dim.h * mmPerPx;
                const cx = slotX + (slotW - imgW) / 2;
                const cy = slotY + (slotH - imgH) / 2;
                pdf.addImage(dataUrl, 'PNG', cx, cy, imgW, imgH, undefined, 'FAST');
            };

            if (leftPng) await placeImageNaturalCenter(leftPng, 0, topImagesY, eachWidth, maxHeight);
            if (rightPng) await placeImageNaturalCenter(rightPng, eachWidth + gap, topImagesY, eachWidth, maxHeight);

            const partnerLogoUrl = d.partnerInfo?.image || null;
            const partnerLogoRaw = partnerLogoUrl ? await fetchImg(partnerLogoUrl) : null;
            const partnerLogoPng = partnerLogoRaw ? await toPng(partnerLogoRaw) : null;

            pdf.setFontSize(11);
            const pad = 8;
            // Left header (Datum, …) — right column sits a bit higher for visual balance
            const headerY = pad + 8;
            const rightHeaderLiftMm = 4;
            const headerLineGap = 6;
            const textPadX = pad;

            // Left side: Datum first, then Fertigstellung (same line rhythm as right)
            let leftLine = 0;
            textWithHalo(`Datum: ${todayText}`, textPadX, headerY + headerLineGap * leftLine);
            leftLine += 1;
            if (finishDateText) {
                textWithHalo(`Fertigstellung: ${finishDateText}`, textPadX, headerY + headerLineGap * leftLine);
                leftLine += 1;
            }
            textWithHalo(`Auftrag: ${d.orderNumber ?? '—'}`, textPadX, headerY + headerLineGap * leftLine);
            leftLine += 1;
            const customerDisplayName = d.customerInfo?.customerNumber
                ? `${customerName} (${d.customerInfo.customerNumber})`
                : customerName;
            textWithHalo(customerDisplayName, textPadX, headerY + headerLineGap * leftLine, { fontStyle: 'bold' });
            leftLine += 1;
            if (d.customerInfo?.phone) textWithHalo(`Tel.: ${d.customerInfo.phone}`, textPadX, headerY + headerLineGap * leftLine);

            // Right side: logo + partner text slightly higher than left block
            const rightPadX = pageWidth - pad;
            const logoBoxMm = 18;
            const logoX = pageWidth - pad - logoBoxMm;
            const logoY = headerY - rightHeaderLiftMm;

            if (partnerLogoPng) {
                const logoDim = await getDim(partnerLogoPng);
                if (logoDim) {
                    const aspect = logoDim.w / logoDim.h;
                    const lw = aspect >= 1 ? logoBoxMm : logoBoxMm * aspect;
                    const lh = aspect >= 1 ? logoBoxMm / aspect : logoBoxMm;
                    pdf.addImage(
                        partnerLogoPng,
                        'PNG',
                        logoX + (logoBoxMm - lw) / 2,
                        logoY + (logoBoxMm - lh) / 2,
                        lw,
                        lh,
                        undefined,
                        'FAST'
                    );
                }
            }

            const maxPartnerTextWidth = 100;
            const partnerTextY = logoY + logoBoxMm + 6;
            const nameLines: string[] = d.partnerInfo?.busnessName
                ? (pdf.splitTextToSize(d.partnerInfo.busnessName, maxPartnerTextWidth) as string[])
                : [];
            nameLines.forEach((line: string, i: number) => {
                textWithHalo(line, rightPadX, partnerTextY + i * headerLineGap, {
                    align: 'right',
                    fontStyle: 'bold',
                });
            });
            const partnerAddress = d.partnerInfo?.storeLocations?.[0]?.address || '';
            if (partnerAddress) {
                const addrLines: string[] = pdf.splitTextToSize(partnerAddress, maxPartnerTextWidth);
                const nameLineCount = nameLines.length;
                addrLines.forEach((line: string, i: number) => {
                    textWithHalo(line, rightPadX, partnerTextY + (nameLineCount + i) * headerLineGap, {
                        align: 'right',
                    });
                });
            }

            // Footer block
            const bottomY = pageHeight - bottomBlockHeight;
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const leftColX = pad;
            const rightColX = availableWidth / 2 - 60;
            const leftColWidth = rightColX - leftColX - 4;
            const rightColWidth = availableWidth - rightColX - pad;
            const startY = bottomY + pad;
            const lineGap = 5;

            const writeLines = (x: number, yStart: number, width: number, lines: string[]) => {
                let ly = yStart;
                for (const raw of lines) {
                    if (ly > pageHeight - 4) break;
                    for (const w of pdf.splitTextToSize(raw, width)) {
                        if (ly > pageHeight - 4) break;
                        pdf.text(w, x, ly);
                        ly += lineGap;
                    }
                }
            };

            const leftLines: string[] = [];
            leftLines.push('Diagnose / Versorgung:');
            leftLines.push(d.diagnosisInfo?.productName || '—');
            if (d.diagnosisInfo?.versorgung) leftLines.push(`Versorgung: ${d.diagnosisInfo.versorgung}`);
            if (d.quantity) leftLines.push(`Menge: ${d.quantity}`);
            if (d.footSize) leftLines.push(`Fußgröße: ${d.footSize}`);
            if (d.foorSize != null) leftLines.push(`Schuhgröße: ${d.foorSize}`);

            const rightLines: string[] = [];
            if (d.uberzug) {
                rightLines.push('Überzug:');
                for (const ln of String(d.uberzug).split(/\r?\n/)) rightLines.push(ln);
            }
            if (d.diagnosisInfo?.material) {
                rightLines.push('Material:');
                rightLines.push(d.diagnosisInfo.material);
            }

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

    return {
        isGeneratingWerkA3Pdf,
        generatingWerkA3OrderId,
        handleWerkstattzettelA3Download,
    };
};

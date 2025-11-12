
import jsPDF from 'jspdf';

// Interface for PDF header information
export interface FeetImagesPdfHeader {
    logoUrl?: string | null;
    partnerName?: string | null;
    customerFullName: string;
    customerNumber?: number | string | null;
    dateOfBirthText?: string | null;
}

// Helper function to fetch image as data URL
async function fetchImageAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

async function generateCombinedFeetPdf(params: {
    leftImageUrl: string;
    rightImageUrl: string;
    header: FeetImagesPdfHeader;
    leftFootLength?: number;
    rightFootLength?: number;
}): Promise<Blob> {
    const { leftImageUrl, rightImageUrl, header, leftFootLength = 0, rightFootLength = 0 } = params;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const addHeaderOverlay = async (footLabel: string): Promise<void> => {
        const logoX = margin;
        const logoY = margin;
        const textX = margin;
        const textY = margin + 8;
        let drewLogo = false;

        if (header.logoUrl) {
            try {
                const logoDataUrl = await fetchImageAsDataUrl(header.logoUrl);
                const logoWidth = 18;
                const logoHeight = 18;
                pdf.addImage(logoDataUrl, 'JPEG', logoX, logoY, logoWidth, logoHeight);
                drewLogo = true;
            } catch (_) {
                // ignore
            }
        }

        pdf.setTextColor(0, 0, 0);
        const nameParts = [header.customerFullName, footLabel].filter(Boolean);
        let line1 = nameParts.join('   |   ');

        const adjustedTextX = drewLogo ? textX + 22 : textX;

        let fontSize = 11;
        pdf.setFontSize(fontSize);
        let textWidth = pdf.getTextWidth(line1);
        const maxWidth = pageWidth - adjustedTextX - margin;
        while (textWidth > maxWidth && fontSize > 8) {
            fontSize -= 0.5;
            pdf.setFontSize(fontSize);
            textWidth = pdf.getTextWidth(line1);
        }

        const kdnrText = header.customerNumber !== undefined && header.customerNumber !== null ? `Kdnr: ${header.customerNumber}` : '';

        const lineGap = 6;
        let yCursor = textY;

        pdf.setFontSize(fontSize);
        pdf.text(line1, adjustedTextX, yCursor);
        yCursor += lineGap;

        if (kdnrText) {
            pdf.setFontSize(10);
            pdf.text(kdnrText, adjustedTextX, yCursor);
        }
    };

    const addFooterOverlay = (footSide: 'L' | 'R'): void => {
        const footLength = footSide === 'L' ? leftFootLength : rightFootLength;
        const footerY = pageHeight - margin - 5;

        if (footLength && footLength > 0) {
            const pelottenposition = (footLength + 5) * 0.66;
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Pelottenposition ${footSide} = ${pelottenposition.toFixed(1)}mm`,
                margin, footerY, { align: 'left' });
        } else {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Pelottenposition ${footSide} = Fusslänge data not available`,
                margin, footerY, { align: 'left' });
        }
    };

    const addFootImage = async (imageUrl: string, footSide: 'L' | 'R'): Promise<void> => {
        const imageStartY = 0;
        const imageEndY = pageHeight;
        const availableHeight = imageEndY - imageStartY;
        const widthMargin = 5;
        const availableWidth = pageWidth - (widthMargin * 2);

        const imageDataUrl = await fetchImageAsDataUrl(imageUrl);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = imageDataUrl;
        });

        const imageAspectRatio = img.width / img.height;

        let imageWidth: number;
        let imageHeight: number;
        let imageX: number;
        let imageY: number = imageStartY;

        imageHeight = availableHeight;
        imageWidth = availableHeight * imageAspectRatio;

        if (imageWidth < availableWidth) {
            const scaleFactor = Math.min(1.15, availableWidth / imageWidth);
            imageWidth = imageWidth * scaleFactor;
            imageHeight = imageWidth / imageAspectRatio;

            if (imageHeight > availableHeight) {
                imageHeight = availableHeight;
                imageWidth = availableHeight * imageAspectRatio;
            }


            imageX = (pageWidth - imageWidth) / 2;
            imageY = imageStartY;
        } else {
            imageWidth = availableWidth;
            imageHeight = availableWidth / imageAspectRatio;

            if (imageHeight < availableHeight) {
                imageY = (availableHeight - imageHeight) / 2;
            } else {
                imageY = imageStartY;
            }

            imageX = widthMargin;
        }

        pdf.addImage(
            imageDataUrl,
            'PNG',
            imageX,
            imageY,
            imageWidth,
            imageHeight,
            undefined,
            'SLOW'
        );
    };

    // Page 1: Right Foot
    await addFootImage(rightImageUrl, 'R');
    await addHeaderOverlay('Right Foot');
    addFooterOverlay('R');

    // Page 2: Left Foot
    pdf.addPage();
    await addFootImage(leftImageUrl, 'L');
    await addHeaderOverlay('Left Foot');
    addFooterOverlay('L');

    return pdf.output('blob');
}

export async function generateFeetPdf(params: {
    leftImageUrl?: string | null;
    rightImageUrl?: string | null;
    header: FeetImagesPdfHeader;
    generateCombined?: boolean;
    leftFootLength?: number;
    rightFootLength?: number;
}): Promise<{ combined?: Blob; }> {
    const { leftImageUrl, rightImageUrl, header, generateCombined = false, leftFootLength, rightFootLength } = params;
    const results: { combined?: Blob; } = {};

    if (generateCombined && leftImageUrl && rightImageUrl) {
        results.combined = await generateCombinedFeetPdf({
            leftImageUrl,
            rightImageUrl,
            header,
            leftFootLength,
            rightFootLength
        });
    }

    return results;
}
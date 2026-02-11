import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';

// Icon paths
const TEMPERATURE_ICON = '/images/order/Barcode/Temperatureicon.png';
const WATER_DROP_ICON = '/images/order/Barcode/Waterdropwithcross.png';
const SUN_ICON = '/images/order/Barcode/Sunwithcross.png';
const BRAND_LOGO = '/images/order/Barcode/grap.png';
 
interface BarcodeStickerData {
    partner: {
        name: string;
        image: string;
    };
    customer: string;
    customerNumber: number;
    orderNumber: number;
    orderStatus: string;
    completedAt: string | null;
    createdAt?: string | null;
    barcodeCreatedAt?: string | null;
    partnerAddress: string | { address?: string; title?: string; description?: string };
}

// Helper to format date in German format
const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Get barcode value with padding
const getBarcodeValue = (data: BarcodeStickerData): string => {
    const value = data.orderNumber?.toString() || data.customerNumber?.toString() || '0';
    return value.padStart(10, '0');
};

// Helper to load image
const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

// Helper to wrap text within max width
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
};

// Generate PDF using canvas approach
export const generateBarcodeStickerPdfCanvas = async (data: BarcodeStickerData): Promise<Blob> => {
    const scale = 4;
    const width = 400 * scale;
    const height = 250 * scale;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 250);
    
    // Draw border around the card
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, 399, 249);
    
    ctx.textBaseline = 'top';
    
    // TOP SECTION - Logo and Company Info
    let currentY = 10;
    
    // Load all images in parallel for better performance
    const imagePromises: Promise<HTMLImageElement | null>[] = [];
    
    if (data.partner?.image) {
        imagePromises.push(loadImage(data.partner.image).catch(() => null));
    } else {
        imagePromises.push(Promise.resolve(null));
    }
    
    imagePromises.push(loadImage(BRAND_LOGO).catch(() => null));
    
    // Draw partner logo
    const logoImg = await imagePromises[0];
    if (logoImg) {
        const logoMaxWidth = 100;
        const logoMaxHeight = 45;
        const logoRatio = Math.min(logoMaxWidth / logoImg.width, logoMaxHeight / logoImg.height);
        const logoWidth = logoImg.width * logoRatio;
        const logoHeight = logoImg.height * logoRatio;
        ctx.drawImage(logoImg, 12, currentY, logoWidth, logoHeight);
    } else {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#dc2626';
        ctx.fillText('logo not found', 12, currentY + 15);
    }
    
    // Partner name (left-aligned within right section)
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(data.partner?.name || 'Partner Name', 255, currentY);
    
    // Brand logo (far right)
    const brandLogo = await imagePromises[1];
    if (brandLogo) {
        ctx.drawImage(brandLogo, 368, currentY - 5, 20, 20);
    }
    
    // Address (left-aligned within right section)
    ctx.font = '9px Arial';
    ctx.fillStyle = '#666666';
    let addressY = currentY + 14;
    
    if (typeof data.partnerAddress === 'string') {
        ctx.fillText(data.partnerAddress, 255, addressY);
    } else if (data.partnerAddress) {
        // Get address and description
        const addressText = data.partnerAddress.address || data.partnerAddress.title || '';
        const descriptionText = data.partnerAddress.description || '';
        
        // Show description on first line (top) if it exists
        if (descriptionText && descriptionText.trim() !== '') {
            ctx.fillText(descriptionText, 255, addressY);
            addressY += 12; // Move to next line for address
        }
        
        // Show address on second line (bottom) if it exists
        if (addressText && addressText.trim() !== '') {
            ctx.fillText(addressText, 255, addressY);
        } else if (!descriptionText || descriptionText.trim() === '') {
            // If no description and no address, show fallback
            ctx.fillText('Address', 255, addressY);
        }
    } else {
        ctx.fillText('Address', 255, addressY);
    }
    
    currentY += 55;
    
    // MIDDLE SECTION - Customer and Order Info
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#000000';
    
    // Customer name with line wrap (max width to avoid overlapping with Knd Nr)
    const customerName = data.customer || 'Customer Name';
    const maxCustomerWidth = 220; // Leave space for Knd Nr on right
    const customerLines = wrapText(ctx, customerName, maxCustomerWidth);
    
    customerLines.forEach((line, index) => {
        ctx.fillText(line, 12, currentY + (index * 18));
    });
    
    // Customer number (aligned with partner name section)
    ctx.textAlign = 'left';
    ctx.font = '10px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(`Customer Number: ${data.customerNumber || '-'}`, 255, currentY);
    
    // Adjust currentY based on number of lines
    currentY += Math.max(22, customerLines.length * 18);
    ctx.textAlign = 'left';
    
    // Production date - use createdAt if completedAt is not available
    const productionDate = data.completedAt || data.createdAt || '';
    ctx.font = '11px Arial';
    ctx.fillStyle = '#333333';
    ctx.fillText(`Herstelldatum: ${formatDate(productionDate)}`, 12, currentY);
    
    currentY += 18;
    
    // LOT box
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, currentY - 2, 32, 16);
    
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText('LOT', 28, currentY + 2);
    
    // Order number
    ctx.textAlign = 'left';
    ctx.font = '11px Arial';
    ctx.fillText(`Bst Nr: ${data.orderNumber || '-'}`, 52, currentY + 2);
    
    // BOTTOM SECTION
    const bottomMargin = 12;
    const blackBoxHeight = 58;
    const barcodeHeight = 50;
    const barcodeNumberHeight = 14;
    const blackBoxY = 250 - bottomMargin - blackBoxHeight;
    
    // Care icons area - aligned left within right section
    let careY = blackBoxY - 35;
    const iconSize = 20;
    const iconStartX = 255; // Start from left of the right section
    const iconGap = 28;
    
    // Load and draw care icons (already optimized with Promise.all)
    const [tempIcon, waterIcon, sunIcon] = await Promise.all([
        loadImage(TEMPERATURE_ICON).catch(() => null),
        loadImage(WATER_DROP_ICON).catch(() => null),
        loadImage(SUN_ICON).catch(() => null)
    ]);
    
    if (tempIcon && waterIcon && sunIcon) {
        // Temperature icon
        ctx.drawImage(tempIcon, iconStartX, careY - 4, iconSize, iconSize);
        
        // Water drop icon
        ctx.drawImage(waterIcon, iconStartX + iconGap, careY - 4, iconSize, iconSize);
        
        // Sun icon
        ctx.drawImage(sunIcon, iconStartX + (iconGap * 2), careY - 4, iconSize, iconSize);
    } else {
        // Fallback - draw simple circles if images fail
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(iconStartX + 10, careY + 6, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(iconStartX + iconGap + 10, careY + 6, 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(iconStartX + (iconGap * 2) + 10, careY + 6, 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    careY += 18;
    
    // Instruction text - aligned left
    ctx.textAlign = 'left';
    ctx.font = '7px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Bitte die Gebrauchsanweisung beachten.', iconStartX, careY);
    
    // Black product type box
    ctx.fillStyle = '#000000';
    ctx.fillRect(255, blackBoxY, 133, blackBoxHeight);
    
    // White text in box
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SONDERANFERTIGUNG', 321, blackBoxY + 10);
    ctx.fillText('MEDIZINPRODUKT', 321, blackBoxY + 22);
    ctx.fillText('MASSEINLAGE', 321, blackBoxY + 34);
    ctx.fillText('LINKS', 321, blackBoxY + 46);
    
    // BARCODE
    const barcodeCanvas = document.createElement('canvas');
    const barcodeValue = getBarcodeValue(data);
    JsBarcode(barcodeCanvas, barcodeValue, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: false,
        margin: 0,
        background: '#ffffff',
        lineColor: '#000000',
    });
    
    const barcodeDrawY = blackBoxY + blackBoxHeight - barcodeHeight - barcodeNumberHeight;
    ctx.drawImage(barcodeCanvas, 12, barcodeDrawY, 180, barcodeHeight);
    
    // Barcode number
    ctx.font = '500 10px Arial';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(barcodeValue, 102, barcodeDrawY + barcodeHeight + 4);
    
    // Convert to PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdfWidth = 105;
    const pdfHeight = 65;
    
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfHeight, pdfWidth],
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    return pdf.output('blob');
};

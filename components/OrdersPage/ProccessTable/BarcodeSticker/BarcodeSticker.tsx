import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

import logo from '@/public/images/order/Barcode/grap.png';

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
    barcodeCreatedAt?: string | null;
    partnerAddress: string | { address?: string; title?: string; description?: string };
}

interface BarcodeStickerProps {
    data: BarcodeStickerData;
}

export default function BarcodeSticker({ data }: BarcodeStickerProps) {
    const barcodeRef = useRef<SVGSVGElement>(null);

    const getBarcodeValue = () => {
        const value = data.orderNumber?.toString() || data.customerNumber?.toString() || '0';
        return value.padStart(10, '0');
    };

    useEffect(() => {
        if (barcodeRef.current) {
            try {
                const barcodeValue = data.orderNumber?.toString() || data.customerNumber?.toString() || '0';
                const paddedValue = barcodeValue.padStart(10, '0');
                JsBarcode(barcodeRef.current, paddedValue, {
                    format: 'CODE128',
                    width: 2,
                    height: 50,
                    displayValue: false,
                    margin: 0,
                });
            } catch (error) {
                console.error('Error generating barcode:', error);
            }
        }
    }, [data.orderNumber, data.customerNumber]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div
            id="barcode-sticker-print-area"
            style={{
                width: '400px',
                height: '250px',
                background: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                lineHeight: '1.4',
                padding: '10px 12px',
                boxSizing: 'border-box',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* Top Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ width: '100px', height: '45px', display: 'flex', alignItems: 'center' }}>
                    {data.partner?.image ? (
                        <img
                            src={data.partner.image}
                            alt={data.partner.name || 'Logo'}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    ) : (
                        <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#dc2626' }}>
                            logo not found
                        </div>
                    )}
                </div>

                <div style={{ width: '145px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
                            {data.partner?.name || 'Partner Name'}
                        </div>
                        <div style={{ fontSize: '9px', color: '#666' }}>
                            {typeof data.partnerAddress === 'string' 
                                ? data.partnerAddress 
                                : (() => {
                                    const addr = data.partnerAddress;
                                    if (!addr || typeof addr !== 'object') return 'Address';
                                    
                                    // Get address and description
                                    const addressText = addr.address || addr.title || '';
                                    const descriptionText = addr.description || '';
                                    
                                    // Show description first (top), then address (bottom)
                                    if (descriptionText && descriptionText.trim() !== '' && addressText && addressText.trim() !== '') {
                                        return (
                                            <>
                                                <div>{descriptionText}</div>
                                                <div style={{ marginTop: '2px' }}>{addressText}</div>
                                            </>
                                        );
                                    } else if (descriptionText && descriptionText.trim() !== '') {
                                        return descriptionText;
                                    } else if (addressText && addressText.trim() !== '') {
                                        return addressText;
                                    }
                                    return 'Address';
                                })()}
                        </div>
                    </div>
                    <img 
                        src={logo.src} 
                        alt="Brand" 
                        style={{ width: '20px', height: '20px', objectFit: 'contain' }} 
                    />
                </div>
            </div>

            {/* Middle Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', minHeight: '65px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {data.customer || 'Customer Name'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#333' }}>
                        Herstelldatum: {formatDate(data.completedAt || data.barcodeCreatedAt || '')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                        <span style={{
                            border: '1.5px solid #000',
                            padding: '3px 8px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '3px',
                        }}>
                            LOT
                        </span>
                        <span>Bst Nr: {data.orderNumber || '-'}</span>
                    </div>
                </div>

                <div style={{ width: '145px', flexShrink: 0 }}>
                    <div style={{ fontSize: '10px' }}>
                        Customer Number: {data.customerNumber || '-'}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', marginTop: 'auto' }}>
                <div style={{ flex: 1, maxWidth: '190px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center', width: '100%' }}>
                        <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <svg ref={barcodeRef} style={{ height: '100%', width: 'auto', maxWidth: '100%' }} />
                        </div>
                        <div style={{ fontSize: '10px', color: '#333', textAlign: 'center', letterSpacing: '1px', fontWeight: '500' }}>
                            {getBarcodeValue()}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '145px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                        <img src="/images/order/Barcode/Temperatureicon.png" alt="Temperature" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        <img src="/images/order/Barcode/Waterdropwithcross.png" alt="Keep Dry" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        <img src="/images/order/Barcode/Sunwithcross.png" alt="Keep Out of Sun" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    </div>
                    
                    <div style={{ fontSize: '7px', color: '#666', marginBottom: '3px', lineHeight: '1.3' }}>
                        Bitte die Gebrauchsanweisung beachten.
                    </div>

                    <div style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        padding: '5px 8px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        lineHeight: '1.4',
                        width: '100%',
                    }}>
                        <div>SONDERANFERTIGUNG</div>
                        <div>MEDIZINPRODUKT</div>
                        <div>MASSEINLAGE</div>
                        <div>LINKS</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeStickerData {
    partner: {
        name: string;
        image: string;
    };
    customer: string;
    customerNumber: number;
    orderNumber: number;
    orderStatus: string;
    completedAt: string;
    partnerAddress: string;
}

interface BarcodeStickerProps {
    data: BarcodeStickerData;
}

export default function BarcodeSticker({ data }: BarcodeStickerProps) {
    const barcodeRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (barcodeRef.current) {
            // Generate barcode using order number or customer number
            const barcodeValue = data.orderNumber?.toString() || data.customerNumber?.toString() || '0000';
            try {
                JsBarcode(barcodeRef.current, barcodeValue, {
                    format: 'CODE128',
                    width: 2,
                    height: 60,
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
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
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
                position: 'relative',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                lineHeight: '1.4',
                padding: '12px',
                boxSizing: 'border-box',
                border: '1px solid #e5e7eb',
            }}
        >
            {/* Top Section - Logo and Company Info */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '10px',
            }}>
                {/* Left - Logo (larger, more prominent) */}
                <div style={{
                    width: '100px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                }}>
                    {data.partner?.image ? (
                        <img
                            src={data.partner.image}
                            alt={data.partner.name || 'Logo'}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                            }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div style={{
                            fontWeight: 'bold',
                            fontSize: '24px',
                            color: '#dc2626',
                        }}>
                            Putzer
                        </div>
                    )}
                </div>

                {/* Right - Company Info with factory icon */}
                <div style={{
                    textAlign: 'right',
                    flex: 1,
                    marginLeft: '8px',
                    position: 'relative',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '4px',
                        marginBottom: '2px',
                    }}>
                        <div style={{
                            fontWeight: 'bold',
                            fontSize: '13px',
                        }}>
                            {data.partner?.name || 'Partner Name'}
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                        </svg>
                    </div>
                    <div style={{
                        fontSize: '9px',
                        color: '#666',
                        marginBottom: '2px',
                    }}>
                        {data.partnerAddress || 'Address'}
                    </div>
                    <div style={{
                        fontSize: '9px',
                        color: '#666',
                    }}>
                        Italien
                    </div>
                </div>
            </div>

            {/* Middle Section - Customer and Order Info */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
            }}>
                {/* Left - Customer Name and Production Date */}
                <div style={{
                    flex: 1,
                }}>
                    <div style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginBottom: '4px',
                    }}>
                        {data.customer || 'Customer Name'}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        marginBottom: '2px',
                    }}>
                        Herstelldatum: {formatDate(data.completedAt)}
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                    }}>
                        <span style={{
                            backgroundColor: '#000',
                            color: '#fff',
                            padding: '2px 6px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            borderRadius: '2px',
                        }}>
                            LOT
                        </span>
                        <span>Bst Nr: {data.orderNumber || '-'}</span>
                    </div>
                </div>

                {/* Right - Customer Number */}
                <div style={{
                    textAlign: 'right',
                }}>
                    <div style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                    }}>
                        Knd Nr: {data.customerNumber || '-'}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Barcode and Care Instructions */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '8px',
            }}>
                {/* Left - Barcode */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                    }}>
                        <svg ref={barcodeRef} style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div style={{
                        fontSize: '9px',
                        marginTop: '2px',
                        color: '#666',
                    }}>
                        * BCI GMBH 2016 K *
                    </div>
                </div>

                {/* Right - Care Instructions and Product Type */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px',
                }}>
                    {/* Care Instructions Icons */}
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        marginBottom: '4px',
                    }}>
                        {/* Temperature Icon - Thermometer with >50°C */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '10px',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                            </svg>
                            <span>&gt;50°C</span>
                        </div>
                        {/* Keep Dry Icon - Water drop with line through */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '10px',
                            position: 'relative',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                            </svg>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '0',
                                right: '0',
                                height: '1.5px',
                                backgroundColor: 'currentColor',
                                transform: 'rotate(-45deg)',
                            }} />
                        </div>
                        {/* Keep Out of Sun Icon - Sun with line through */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            fontSize: '10px',
                            position: 'relative',
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                            </svg>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '0',
                                right: '0',
                                height: '1.5px',
                                backgroundColor: 'currentColor',
                                transform: 'rotate(-45deg)',
                            }} />
                        </div>
                    </div>
                    <div style={{
                        fontSize: '9px',
                        color: '#666',
                        textAlign: 'right',
                        marginBottom: '4px',
                    }}>
                        Bitte die Gebrauchsanweisung beachten.
                    </div>

                    {/* Product Type Box */}
                    <div style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        padding: '6px 8px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        lineHeight: '1.3',
                        minWidth: '120px',
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

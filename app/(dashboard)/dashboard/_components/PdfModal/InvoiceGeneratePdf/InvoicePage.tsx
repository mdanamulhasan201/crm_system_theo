import React from 'react';
import toast from 'react-hot-toast';
import { generatePdfFromElement, pdfPresets } from '@/lib/pdfGenerator';
import { OrderPdfData } from '@/hooks/orders/useGeneratePdf';

interface InvoicePageProps {
    data: OrderPdfData;
    isGenerating?: boolean;
    onGenerateStart?: () => void;
    onGenerateComplete?: () => void;
}

export default function InvoicePage({ data, isGenerating = false, onGenerateStart, onGenerateComplete }: InvoicePageProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE');
    };

    const formatPrice = (price: number) => {
        return price.toFixed(2) + ' €';
    };

    const generatePdf = async () => {
        try {
            // Notify parent that generation has started
            onGenerateStart?.();

            // Use shared PDF generation utility with balanced preset
            const pdfBlob = await generatePdfFromElement('invoice-print-area', pdfPresets.balanced);

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `order_${data.customer?.vorname}_${data.customer?.nachname}_${new Date().toISOString().split('T')[0]}.pdf`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            toast.success('PDF generated successfully!');
            return true;
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Failed to generate PDF');
            return false;
        } finally {
            // Notify parent that generation has completed
            onGenerateComplete?.();
        }
    };

    return (
        <div>
            <button
                onClick={generatePdf}
                disabled={isGenerating}
                className="bg-[#62A17C] transform duration-300 cursor-pointer hover:bg-[#62A17C] text-white py-2 px-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Generating...
                    </>
                ) : (
                    'Download PDF'
                )}
            </button>

            {/* Hidden printable area - Fixed layout */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div
                    id="invoice-print-area"
                    style={{
                        width: '794px',
                        height: '1123px',
                        background: '#fff',
                        position: 'relative',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.4'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '40px 40px 20px 40px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <div style={{ width: '70px', height: '120px', marginRight: '30px', flexShrink: 0 }}>
                                <img
                                    src={data.partner?.image || "/images/pdfLogo.png"}
                                    alt={`${data.partner.busnessName || data.partner.name} Logo`}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '12px', textAlign: 'left' }}>
                                    {data.customer?.vorname} {data.customer?.nachname || '-'}
                                </div>
                                <div style={{ fontSize: '14px', marginBottom: '6px', textAlign: 'left' }}>
                                    Kdnr: {data.customer?.customerNumber}
                                </div>
                                <div style={{ fontSize: '14px', marginBottom: '6px', textAlign: 'left' }}>
                                    Geb: {data.customer?.geburtsdatum || '-'}
                                </div>
                                <div style={{ fontSize: '14px', textAlign: 'left' }}>
                                    Scan: {formatDate(data.customer?.screenerFile?.[0]?.createdAt || data.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '0 40px',
                        position: 'absolute',
                        top: '220px',
                        left: 0,
                        right: 0,
                        bottom: '60px',
                        overflow: 'hidden'
                    }}>
                        {/* Kundendaten Section */}
                        <div style={{ marginBottom: '30px', paddingTop: '20px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                color: '#333',
                                textAlign: 'left'
                            }}>
                                Kundendaten
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Email: {data.customer?.email || '-'}</p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Telefon: {((data as any)?.werkstattzettel?.telefon) || data.customer?.telefonnummer || '-'}</p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Wohnort: {data.customer?.wohnort || '-'}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Diagnose: {(data as any)?.ausführliche_diagnose || data.product?.diagnosis_status || '-'}</p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Schuhmodell: {(data as any)?.schuhmodell_wählen || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bearbeitung & Terminierung Section */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                color: '#333',
                                textAlign: 'left'
                            }}>
                                Bearbeitung & Terminierung
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>
                                            Mitarbeiter: {(
                                                (data as any)?.partner?.workshopNote?.employeeName ||
                                                (data as any)?.werkstattzettel?.mitarbeiter ||
                                                data.partner?.name
                                            )}
                                        </p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>
                                            Auftragsdatum: {formatDate(((data as any)?.werkstattzettel?.auftragsDatum) || data.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>
                                            Fertigstellung bis: {formatDate(((data as any)?.werkstattzettel?.fertigstellungBis) || ((data as any)?.partner?.workshopNote?.completionDays) || data.statusUpdate)}
                                        </p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>
                                            Abholung: {((data as any)?.werkstattzettel?.geschaeftsstandort) || (data as any)?.partner?.hauptstandort || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Versorgung & Materialien Section */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                color: '#333',
                                textAlign: 'left'
                            }}>
                                Versorgung & Materialien
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        color: '#555',
                                        textAlign: 'left'
                                    }}>
                                        Versorgung
                                    </h3>
                                    <div style={{ marginBottom: '15px' }}>
                                        {(data as any)?.menge && (
                                            <p style={{ margin: 0, marginBottom: '5px' }}>Menge: {(data as any).menge}</p>
                                        )}
                                        {(data as any)?.einlagentyp && (
                                            <p style={{ margin: 0, marginBottom: '5px' }}>Versorgung: {(data as any).einlagentyp}</p>
                                        )}
                                        <p style={{ margin: 0, marginBottom: '5px' }}>{data.product?.versorgung || data.product?.status || (data as any)?.werkstattzettel?.versorgung || '-'}</p>
                                        {(data as any)?.überzug && (
                                            <p style={{ margin: 0 }}>Überzug: {(data as any).überzug}</p>
                                        )}
                                    </div>

                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        color: '#555',
                                        textAlign: 'left'
                                    }}>
                                        Materialien
                                    </h3>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Rohling: {data.product?.rohlingHersteller} <span style={{ color: '#FF0000', fontWeight: 'bold' }}>Größe {data.customer?.recommendedSize?.size || '-'}</span></p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Pelotte: {data.product?.material || '-'}</p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Zusatz: -</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Zahlung & Abholung Section */}
                        <div style={{ marginBottom: '30px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                marginBottom: '20px',
                                color: '#333',
                                textAlign: 'left'
                            }}>
                                Zahlung & Abholung
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Einlagenversorgung: Standard {formatPrice(data?.einlagenversorgung)}</p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Fußanalyse: {formatPrice(data?.fußanalyse)}</p>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <p style={{
                                            margin: 0,
                                            fontWeight: 'bold',
                                            fontSize: '16px'
                                        }}>
                                            Gesamtpreis: {formatPrice(data?.totalPrice)}
                                        </p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Private Bezahlung am: ________________</p>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0 }}>Abgeholt am: ________________</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '8px' }}>Notizen:</p>
                                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{(data as any)?.versorgung_note || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Fixed at bottom */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#000',
                        color: '#fff',
                        height: '60px',
                        zIndex: 2
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0 40px',
                            height: '100%'
                        }}>
                            <p>{data.partner?.phone || '+43 595024330'}</p>
                            <p>{data.partner?.busnessName || 'FeetF1rst GmbH'}</p>
                            <p>{data.partner?.email || 'info@feetf1rst.com'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

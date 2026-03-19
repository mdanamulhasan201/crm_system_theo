'use client';

import React from 'react';

export interface WerkstattzettelSheetData {
  logo?: string | null;
  auftragsnr?: number | string | null;
  customerName?: string | null;
  customerAddress?: string | null;
  CustomerPhone?: string | null;
  CustomerEmail?: string | null;
  auftragsDatum?: string | null;
  auftragErstelltVon?: string | null;
  filialeAnnahmeStelle?:
    | { title?: string | null; desc?: string | null }
    | { address?: string | null; description?: string | null }
    | null;
  fertigstellungBis?: string | null;
  einlagentyp?: string | null;
  zusatzpositionen?: {
    name?: string | null;
    versorgung?: string | null;
    diagnosis_status?: Array<string> | null;
    material?: string | null;
    rohlingHersteller?: string | null;
    artikelHersteller?: string | null;
    status?: string | null;
  } | null;
  grösse?: number | string | null;
  werkstattzettel?: boolean | null;
  wirtschaftlicherAufpreis?: number | string | null;
  manage?: number | string | null;
  rabatt?: number | string | null;
  versorgungNote?: string | null;
  überzug?: string | null;
  employee?: { employeeName?: string | null } | null;
  preisuebersicht?: {
    net_price?: number | null;
    vatRate?: number | null;
    privatePrice?: number | null;
    insuranceTotalPrice?: number | null;
    totalPrice?: number | null;
    einlagenversorgungPreis?: number | null;
    fussanalysePreis?: number | null;
    addonPrices?: number | null;
    discount?: number | null;
    quantity?: number | null;
    austria_price?: number | null;
  } | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatMoney = (value: unknown) => {
  const n = typeof value === 'number' ? value : value == null ? NaN : Number(value);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
};

const formatMoneyWithEuro = (value: unknown) => {
  const formatted = formatMoney(value);
  return formatted ? `${formatted}€` : '';
};

const formatVatLabel = (value: unknown) => {
  const n = typeof value === 'number' ? value : value == null ? NaN : Number(value);
  if (!Number.isFinite(n)) return '';
  return `+ ${formatMoney(n)}% MwSt.`;
};

const PriceRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
      <div style={{ fontSize: 11, color: '#374151' }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {value}
      </div>
    </div>
  );
};

const HeaderLineField = ({ label, value }: { label: string; value: string }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, width: '100%' }}>
      <div
        style={{
          width: 110,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.8,
          color: '#6b7280',
          textAlign: 'right',
        }}
      >
        {label}
      </div>
      {/* Short underline like the original template */}
      <div style={{ width: 120, borderBottom: '1px solid #e5e7eb', paddingBottom: 3, textAlign: 'right' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#111827' }}>{value || '—'}</span>
      </div>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>
      <div style={{ fontSize: 9, letterSpacing: 0.7, color: '#6b7280', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 11, color: '#111827', minHeight: 14 }}>
        {value || <span style={{ color: '#d1d5db' }}>—</span>}
      </div>
    </div>
  );
};

export default function WerkstattzettelSheet({
  data,
  logoProxyUrl,
}: {
  data: WerkstattzettelSheetData;
  /** Pre-proxied URL to avoid CORS in html2canvas */
  logoProxyUrl?: string | null;
}) {
  const price = data.preisuebersicht ?? {};
  const todayText = formatDate(new Date().toISOString());

  const filialeText = (() => {
    const f = data.filialeAnnahmeStelle as any;
    const a = [f?.title, f?.desc].filter(Boolean).join(' – ');
    if (a) return a;
    return [f?.address, f?.description].filter(Boolean).join(' – ');
  })();
  const zusatz = data.zusatzpositionen ?? {};
  const diagnosisStatus = (zusatz.diagnosis_status ?? []).filter(Boolean).join(', ');
  const fussanalysePreis = (data as any)?.fussanalysePreis ?? (price as any)?.fussanalysePreis ?? 0;
  const quantityNum = (price as any)?.quantity ?? null;
  const insuranceGross: number | null = (price as any)?.insuranceTotalPrice ?? null;
  const vatRate: number | null = (price as any)?.vatRate ?? null;
  const discount: number | null = (price as any)?.discount ?? null;

  // Derive net price when backend returns null
  const positionsnummerNet: number | null = (() => {
    const raw = (price as any)?.net_price;
    if (raw != null && Number.isFinite(Number(raw))) return Number(raw);
    if (insuranceGross != null && vatRate != null && vatRate > 0) {
      return insuranceGross / (1 + vatRate / 100);
    }
    return null;
  })();

  const vatAmount: number | null =
    positionsnummerNet != null && insuranceGross != null
      ? insuranceGross - positionsnummerNet
      : null;

  // Zwischensumme = back-calculated pre-discount total (Gesamt = Zwischensumme × (1 - discount/100))
  const zwischensumme: number | null = (() => {
    const total = (price as any)?.totalPrice;
    if (total == null || !Number.isFinite(Number(total))) return null;
    if (discount != null && discount > 0) return Number(total) / (1 - discount / 100);
    return Number(total);
  })();

  const rabattAmount: number | null =
    zwischensumme != null && discount != null && discount > 0
      ? zwischensumme * (discount / 100)
      : null;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        width: 794, // A4 @ 96dpi
        height: 1123,
        // Print margins (96dpi): top/bottom 1in=96px, left/right 0.75in=72px
        padding: '96px 72px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            width: 190,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden',
            padding: 0,
            margin: 0,
            border: 'none',
          }}
        >
          {logoProxyUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoProxyUrl}
              alt="logo"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', margin: 0, padding: 0, border: 'none' }}
            />
          ) : (
            <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2 }}>Logo</div>
          )}
        </div>

        <div style={{ width: 360 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Werkstattzettel</div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <HeaderLineField label="AUFTRAGSNR." value={data.auftragsnr != null ? String(data.auftragsnr) : ''} />
            <HeaderLineField label="DATUM" value={todayText} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, borderTop: '1px solid #e5e7eb' }} />

      {/* Customer & order info */}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#1f2937', textTransform: 'uppercase', letterSpacing: 0.7 }}>
          Kunden- &amp; Auftragsinfo
        </div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20, rowGap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Name" value={data.customerName} />
            <Field label="Adresse / Wohnort" value={data.customerAddress} />
            <Field label="Telefon" value={data.CustomerPhone || ''} />
            <Field label="E-Mail" value={data.CustomerEmail} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Auftragsdatum" value={formatDate(data.auftragsDatum)} />
            <Field
              label="Auftrag erstellt von"
              value={data.employee?.employeeName || data.auftragErstelltVon}
            />
            <Field label="Filiale / Annahmestelle" value={filialeText} />
            <Field label="Fertigstellung bis" value={formatDate(data.fertigstellungBis)} />
          </div>
        </div>
      </div>

      {/* Versorgung & Positionen + Preisübersicht */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 290px', columnGap: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#1f2937', textTransform: 'uppercase', letterSpacing: 0.7 }}>
            Versorgung &amp; Positionen
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Einlage Typ" value={data.einlagentyp} />
            <Field
              label="Versorgung"
              value={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11 }}>{zusatz.name || zusatz.versorgung || ''}</div>
                  {/* <div style={{ fontSize: 10, color: '#4b5563' }}>
                    {[diagnosisStatus ? `Diagnose: ${diagnosisStatus}` : null, zusatz.material ? `Material: ${zusatz.material}` : null]
                      .filter(Boolean)
                      .join(' • ')}
                  </div> */}
                  <div style={{ fontSize: 10, color: '#4b5563' }}>
                    {[zusatz.rohlingHersteller ? `Rohling: ${zusatz.rohlingHersteller}` : null, zusatz.artikelHersteller ? `Artikel: ${zusatz.artikelHersteller}` : null]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                  {zusatz.status ? <div style={{ fontSize: 10, color: '#4b5563' }}>{zusatz.status}</div> : null}
                </div>
              }
            />
            {data.überzug ? <Field label="überzug" value={data.überzug} /> : null}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 20, rowGap: 10 }}>
              <Field label="Grösse" value={data.grösse != null ? String(data.grösse) : ''} />
              <Field label="Menge" value={price.quantity != null ? String(price.quantity) : ''} />
              <Field
                label="Fussanalyse (Ja / Nein)"
                value={
                  data.werkstattzettel
                    ? `Ja${fussanalysePreis != null && String(fussanalysePreis).trim() !== '' ? ` (${fussanalysePreis} €)` : ''}`
                    : 'Nein'
                }
              />
              <Field label="Rabatt" value={data.rabatt != null ? `${data.rabatt}%` : ''} />
              <Field label="Wirtschaftlicher Aufpreis" value={data.wirtschaftlicherAufpreis != null ? String(data.wirtschaftlicherAufpreis) : ''} />
              <Field label=" " value={<span style={{ color: '#d1d5db' }}> </span>} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: 14, height: 'fit-content' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#1f2937', textTransform: 'uppercase', letterSpacing: 0.7 }}>
            Preisübersicht
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Positionsnummer netto */}
            {positionsnummerNet != null && (
              <PriceRow label="Positionsnummer netto" value={formatMoneyWithEuro(positionsnummerNet)} />
            )}
            {/* + VAT% MwSt. with actual amount */}
            {vatAmount != null && vatRate != null && (
              <PriceRow
                label={`+ ${vatRate}% MwSt.`}
                value={formatMoneyWithEuro(vatAmount)}
              />
            )}
            {/* Positionsnummer inkl. MwSt. */}
            {insuranceGross != null && (
              <PriceRow label="Positionsnummer (inkl. MwSt.)" value={formatMoneyWithEuro(insuranceGross)} />
            )}
            {/* Versorgung */}
            {price.einlagenversorgungPreis != null && (
              <PriceRow label="Versorgung" value={formatMoneyWithEuro(price.einlagenversorgungPreis)} />
            )}
            {/* Menge with × symbol */}
            {quantityNum != null && (
              <PriceRow label="Menge" value={`\u00d7 ${String(quantityNum)}`} />
            )}
            {/* Fußanalyse */}
            {fussanalysePreis != null && (
              <PriceRow label="Fußanalyse" value={formatMoneyWithEuro(fussanalysePreis)} />
            )}
            {/* Eigenanteil AT — only shown when austria_price is explicitly set */}
            {price.austria_price != null && (
              <PriceRow label="Enthält Eigenanteil (AT)" value={formatMoneyWithEuro(price.austria_price)} />
            )}
            {/* Wirtschaftlicher Aufpreis */}
            {data.wirtschaftlicherAufpreis != null && Number(data.wirtschaftlicherAufpreis) !== 0 && (
              <PriceRow label="Wirtschaftlicher Aufpreis" value={formatMoneyWithEuro(data.wirtschaftlicherAufpreis)} />
            )}

            {/* Separator + Zwischensumme */}
            {zwischensumme != null && (
              <>
                <div style={{ borderTop: '1px solid #d1d5db', marginTop: 2 }} />
                <PriceRow label="Zwischensumme" value={formatMoneyWithEuro(zwischensumme)} />
              </>
            )}
            {/* Rabatt (X%): -amount */}
            {rabattAmount != null && discount != null && (
              <PriceRow
                label={`Rabatt (${discount}%)`}
                value={`-${formatMoneyWithEuro(rabattAmount)}`}
              />
            )}

            {/* Gesamt */}
            {price.totalPrice != null && (
              <>
                <div style={{ borderTop: '2px solid #9ca3af', marginTop: 4 }} />
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Gesamt</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>
                    {formatMoneyWithEuro(price.totalPrice)}
                  </div>
                </div>
                {/* Privat / Versicherung split */}
                {(price.privatePrice != null || price.totalPrice != null) && (
                  <div
                    style={{
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', whiteSpace: 'nowrap' }}>
                      {price.privatePrice != null ? `Privat ${formatMoneyWithEuro(price.privatePrice)}` : ''}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>
                      {price.privatePrice != null && price.totalPrice != null
                        ? `Versicherung ${formatMoneyWithEuro(Number(price.totalPrice) - Number(price.privatePrice))}`
                        : insuranceGross != null
                          ? `Versicherung ${formatMoneyWithEuro(insuranceGross)}`
                          : ''}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interne Informationen */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#1f2937', textTransform: 'uppercase', letterSpacing: 0.7 }}>
          Interne Informationen
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 9, letterSpacing: 0.7, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>
            Notizen / Bemerkungen
          </div>
          <div style={{ border: '1px solid #e5e7eb', height: 110, padding: 8, fontSize: 11, color: '#111827', whiteSpace: 'pre-wrap' }}>
            {data.versorgungNote || <span style={{ color: '#d1d5db' }}>—</span>}
          </div>
        </div>
      </div>
    </div>
  );
}


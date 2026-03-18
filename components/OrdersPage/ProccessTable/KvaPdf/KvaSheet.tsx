'use client';

import React, { useMemo } from 'react';

export interface KvaItem {
  price?: number | null;
  description?:
    | string
    | {
        item?: string | null;
        title?: string | null;
        positionsnummer?: string | null;
        Seite?: string | null;
      }
    | null;
  vat_country?: string | null;
}

export interface KvaData {
  logo?: string | null;
  kviNumber?: string | null;
  partnerInfo?: {
    name?: string | null;
    busnessName?: string | null;
    phone?: string | null;
    email?: string | null;
    vat_number?: string | null;
    orderLocation?: { title?: string | null; description?: string | null; desc?: string | null } | null;
    bankInfo?: { bic?: string | null; bankName?: string | null; bankNumber?: string | null } | null;
  } | null;
  customerInfo?: {
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  prescriptionInfo?: {
    doctorName?: string | null;
    doctorLocation?: string | null;
  } | null;
  shippingAddressesForKv?: string | null;
  insurancesInfo?: KvaItem[] | null;
}

const formatMoneyDE = (value: number) =>
  value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDateDE = (d = new Date()) =>
  d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const guessVatRate = (country?: string | null) => {
  if (!country) return 0.19;
  const c = country.toUpperCase();
  if (c === 'DE' || c.includes('(DE)') || c.includes(' DE')) return 0.19;
  if (c === 'AT' || c.includes('(AT)') || c.includes(' AT')) return 0.2;
  return 0.19;
};

const getItemTitle = (desc: KvaItem['description']) => {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  return desc.title || desc.item || '';
};

export default function KvaSheet({
  data,
  logoProxyUrl,
}: {
  data: KvaData;
  logoProxyUrl?: string | null;
}) {
  const items = data.insurancesInfo ?? [];
  const vatRate = guessVatRate(items?.[0]?.vat_country);

  const totals = useMemo(() => {
    const gross = items.reduce((sum, it) => sum + (Number(it?.price) || 0), 0);
    const net = vatRate > 0 ? gross / (1 + vatRate) : gross;
    const vat = gross - net;
    return { gross, net, vat };
  }, [items, vatRate]);

  const partner = data.partnerInfo ?? {};
  const customer = data.customerInfo ?? {};
  const prescription = data.prescriptionInfo ?? {};
  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        width: 794,
        height: 1123,
        padding: '96px 72px',
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* Header (logo centered, then left/right blocks) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 260, height: 90, overflow: 'hidden' }}>
            {logoProxyUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoProxyUrl}
                alt="logo"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }}
              />
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
          {/* Left block */}
          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.35, maxWidth: 320 }}>
            <div style={{ fontWeight: 700 }}>{partner.busnessName || partner.name || ''}</div>
            {(partner.orderLocation as any)?.title ? <div>{(partner.orderLocation as any).title}</div> : null}
            {(partner.orderLocation as any)?.address ? <div>{(partner.orderLocation as any).address}</div> : null}
            {(partner.orderLocation as any)?.desc ? <div>{(partner.orderLocation as any).desc}</div> : null}
            {(partner.orderLocation as any)?.description ? <div>{(partner.orderLocation as any).description}</div> : null}
            {data.shippingAddressesForKv ? <div>{data.shippingAddressesForKv}</div> : null}
            {partner.phone ? <div>Tel: {partner.phone}</div> : null}
            {partner.email ? <div>{partner.email}</div> : null}
          </div>

          {/* Right block */}
          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, textAlign: 'right', minWidth: 220 }}>
            <div>Datum: {formatDateDE()}</div>
            {partner.vat_number ? <div>Steuernummer: {partner.vat_number}</div> : null}
            {(partner.orderLocation as any)?.title ? <div style={{ color: '#6b7280' }}>{(partner.orderLocation as any).title}</div> : null}
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>KOSTENVORANSCHLAG</div>
        <div style={{ marginTop: 6, fontSize: 12, color: '#374151' }}>
          Nummer: <span style={{ fontWeight: 700 }}>{data.kviNumber || '—'}</span>
        </div>
      </div>

      {/* Recipient + Prescription side by side */}
      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
        {/* Left: EMPFÄNGER */}
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1, fontWeight: 700 }}>EMPFÄNGER</div>
          <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700 }}>{customerName || '—'}</div>
            {customer.address ? <div>{customer.address}</div> : null}
            {customer.birthDate ? <div>Geb. am: {customer.birthDate}</div> : null}
          </div>
        </div>

        {/* Right: VERORDNUNG (prescription info) */}
        {(prescription.doctorName || prescription.doctorLocation) ? (
          <div style={{ textAlign: 'right', minWidth: 220 }}>
            <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1, fontWeight: 700 }}>VERORDNUNG</div>
            <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>
              {prescription.doctorName ? <div style={{ fontWeight: 700 }}>{prescription.doctorName}</div> : null}
              {prescription.doctorLocation ? <div>{prescription.doctorLocation}</div> : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Items table */}
      <div style={{ marginTop: 26 }}>
        <div style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 70px 80px 90px 60px',
              padding: '8px 0',
              fontSize: 11,
              color: '#6b7280',
              fontWeight: 700,
            }}
          >
            <div>Pos.</div>
            <div>Bezeichnung</div>
            <div style={{ textAlign: 'right' }}>Anzahl</div>
            <div style={{ textAlign: 'right' }}>Einzel (€)</div>
            <div style={{ textAlign: 'right' }}>Gesamt (€)</div>
            <div style={{ textAlign: 'right' }}>MwSt</div>
          </div>
        </div>

        <div style={{ fontSize: 12 }}>
          {items.length ? (
            items.map((it, idx) => {
              const price = Number(it?.price) || 0;
              const pos =
                typeof it?.description === 'object' && it?.description
                  ? (it.description as any).positionsnummer
                  : null;
              const seite =
                typeof it?.description === 'object' && it?.description
                  ? (it.description as any).Seite
                  : null;
              const title = getItemTitle(it?.description) || '—';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 70px 80px 90px 60px',
                    padding: '12px 0',
                    borderBottom: '1px solid #f3f4f6',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ color: '#374151', whiteSpace: 'nowrap' }}>{pos ? String(pos) : String(idx + 1).padStart(2, '0')}</div>
                  <div
                    style={{
                      color: '#111827',
                      overflow: 'hidden',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      paddingTop: 2,
                      paddingBottom: 2,
                      lineHeight: '20px',
                      maxHeight: 40,
                      minHeight: 20,
                    }}
                  >
                    {title}
                  </div>
                  <div style={{ textAlign: 'right', color: '#111827' }}>{seite ? String(seite) : '1'}</div>
                  <div style={{ textAlign: 'right', color: '#111827' }}>{formatMoneyDE(price)}</div>
                  <div style={{ textAlign: 'right', color: '#111827' }}>{formatMoneyDE(price)}</div>
                  <div style={{ textAlign: 'right', color: '#111827' }}>{Math.round(vatRate * 100)}%</div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '12px 0', color: '#6b7280' }}>—</div>
          )}
        </div>

        {/* Totals */}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 280, fontSize: 12, color: '#111827' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ color: '#6b7280' }}>Nettobetrag:</div>
              <div style={{ fontWeight: 700 }}>{formatMoneyDE(totals.net)} €</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ color: '#6b7280' }}>MwSt {Math.round(vatRate * 100)}%:</div>
              <div style={{ fontWeight: 700 }}>{formatMoneyDE(totals.vat)} €</div>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 6, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800 }}>Endbetrag:</div>
              <div style={{ fontWeight: 800 }}>{formatMoneyDE(totals.gross)} €</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
        "Wir bitten um Genehmigung und Rückgabe des Kostenvoranschlags."
      </div>

      {/* Bank footer */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0 }} />
      <div style={{ marginTop: 26, borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div style={{ fontSize: 11, color: '#374151' }}>
          <div style={{ color: '#6b7280', fontWeight: 700 }}>Bankverbindung</div>
          <div>{partner.bankInfo?.bankName || '—'}</div>
        </div>
        <div style={{ fontSize: 11, color: '#374151' }}>
          <div style={{ color: '#6b7280', fontWeight: 700 }}>IBAN / BIC</div>
          <div>{partner.bankInfo?.bankNumber || '—'}</div>
          <div>{partner.bankInfo?.bic || ''}</div>
        </div>
        <div style={{ fontSize: 11, color: '#374151', textAlign: 'right' }}>
          <div style={{ color: '#6b7280', fontWeight: 700 }}>Kontoinhaber</div>
          <div>{partner.busnessName || partner.name || '—'}</div>
        </div>
      </div>
    </div>
  );
}

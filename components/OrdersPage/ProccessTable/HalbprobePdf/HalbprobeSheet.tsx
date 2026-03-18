'use client';

import React from 'react';

export interface HalbprobeData {
  customerInfo?: {
    gender?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    birthDate?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    customerNumber?: number | null;
  } | null;
  productInfo?: {
    diagnosisStatus?: string[] | null;
    quantity?: number | null;
    einlagentyp?: string | null;
  } | null;
  screenerFile?: Record<string, string | null> | null;
}

export default function HalbprobeSheet({
  data,
  images,
  logoUrl,
}: {
  data: HalbprobeData;
  images: {
    left23?: string | null;
    right24?: string | null;
    sohlenLinks16?: string | null;
    sohlenRechts17?: string | null;
    fersenneigungLinks10?: string | null;
    fersenneigungRechts11?: string | null;
  };
  logoUrl?: string | null;
}) {
  const customer = data.customerInfo ?? {};
  const product = data.productInfo ?? {};

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  const genderLabel = (customer.gender || '').toString().trim().toLowerCase() === 'frau' ? 'Frau' : 'Herr';
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const customerNumber = customer.customerNumber != null ? String(customer.customerNumber).padStart(6, '0') : '';

  const diagnosisLine =
    Array.isArray(product.diagnosisStatus) && product.diagnosisStatus.length
      ? product.diagnosisStatus.filter(Boolean).join(' • ')
      : '';

  const qty = product.quantity != null ? product.quantity : null;
  const einlagentyp = product.einlagentyp ?? '';

  const Img = ({ src, alt }: { src?: string | null; alt: string }) =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
    ) : null;

  const RightSlot = ({ label, src }: { label: string; src?: string | null }) => (
    <div style={{ marginBottom: 10, flex: '1 1 0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ fontSize: 11, color: '#111827', marginBottom: 5, flexShrink: 0 }}>{label}</div>
      <div
        style={{
          flex: 1,
          border: '1px solid #d1d5db',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {src ? <Img src={src} alt={label} /> : <div style={{ fontSize: 11, color: '#9ca3af' }}>No Preview</div>}
      </div>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        color: '#111827',
        width: 794,
        height: 1123,
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif',
        position: 'relative',
      }}
    >
      {/* Top header — compact */}
      <div style={{ padding: '22px 48px 8px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{genderLabel}</div>
            <div style={{ fontSize: 14, marginTop: 2 }}>{fullName || '—'}</div>
            {customer.birthDate ? <div style={{ fontSize: 9, marginTop: 2, color: '#374151' }}>Geb: {customer.birthDate}</div> : null}
            {customer.address ? (
              <div style={{ fontSize: 9, marginTop: 2, color: '#374151' }}>ADRESS: {customer.address}</div>
            ) : null}
            {customer.phone ? (
              <div style={{ fontSize: 9, marginTop: 2, color: '#374151' }}>TEL: {customer.phone}</div>
            ) : null}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11 }}>{today}</div>
            {customerNumber ? <div style={{ fontSize: 12, marginTop: 2, letterSpacing: 1 }}>{customerNumber}</div> : null}
          </div>
        </div>
        <div style={{ height: 3, background: '#111827', marginTop: 8 }} />
      </div>

      {/* Body split — fills remaining page height */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 8px 220px', height: 1000 }}>
        {/* Left */}
        <div style={{ padding: '8px 24px 16px 48px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div style={{ width: '100%', height: 320, overflow: 'hidden' }}>
              <Img src={images.left23} alt="Bild 23" />
            </div>
            <div style={{ width: '100%', height: 320, overflow: 'hidden' }}>
              <Img src={images.right24} alt="Bild 24" />
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 24, fontWeight: 900 }}>Versorgungsvorschlag</div>

          <div style={{ marginTop: 10, fontSize: 13, fontWeight: 800 }}>Bitte um Verordnung:</div>
          <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.4 }}>
            {qty != null ? (
              <div>{qty} Paar {einlagentyp || 'Maßeinlage'}</div>
            ) : einlagentyp ? (
              <div>1 Paar {einlagentyp}</div>
            ) : (
              <div>1 Paar Maßeinlage</div>
            )}
            {diagnosisLine ? <div style={{ marginTop: 4 }}>{diagnosisLine}</div> : null}
          </div>

          <div style={{ marginTop: 10, fontSize: 10, color: '#374151', lineHeight: 1.4, maxWidth: 380 }}>
            Wir weisen ausdrücklich darauf hin, dass es sich hierbei um eine Empfehlung aus handwerklich Sicht handelt.
            Über eine medizinische Notwendigkeit hat ausschließlich der Arzt zu entscheiden.
          </div>

          <div style={{ position: 'absolute', left: 48, bottom: 18 }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" style={{ height: 70, maxWidth: 200, objectFit: 'contain', display: 'block' }} />
            ) : null}
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: '#111827' }} />

        {/* Right — 4 image slots sharing the full height equally */}
        <div style={{ padding: '12px 18px 28px 16px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <RightSlot label="Sohlen Index (Links)" src={images.sohlenLinks16} />
          <RightSlot label="Sohlen Index (Rechts)" src={images.sohlenRechts17} />
          <RightSlot label="Fersenneigung (Links)" src={images.fersenneigungLinks10} />
          <RightSlot label="Fersenneigung (Rechts)" src={images.fersenneigungRechts11} />
          <div style={{ position: 'absolute', right: 18, bottom: 8, fontSize: 11, color: '#111827' }}>1</div>
        </div>
      </div>
    </div>
  );
}


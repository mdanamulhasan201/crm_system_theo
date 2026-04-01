'use client';

import React from 'react';

export interface WerkstattzettelA4V2Data {
    customerInfo?: {
        firstName?: string | null;
        lastName?: string | null;
        birthDate?: string | null;
        address?: string | null;
        phone?: string | null;
        email?: string | null;
    } | null;
    prescriptionInfo?: {
        image?: string | null;
        insurance_provider?: string | null;
        prescription_number?: string | null;
        referencen_number?: string | null;
        doctor_name?: string | null;
        doctor_location?: string | null;
        medical_diagnosis?: string | null;
        type_of_deposit?: string | null;
    } | null;
    orderInfo?: {
        orderNumber?: number | string | null;
        createdAt?: string | null;
        quantity?: number | null;
        vat_rate?: number | null;
        billing_type?: string | null;
        insurance_payed?: boolean | null;
        kva_number?: string | number | null;
        supply_note?: string | null;
        branch_location?: { title?: string | null; description?: string | null } | null;
        priseInfo?: {
            insurance_price?: number | null;
            private_price?: number | null;
            addon_price?: number | null;
            discount?: number | null;
            total_price?: number | null;
            vat_rate?: number | null;
            Netto?: number | string | null;
        } | null;
    } | null;
    employeeInfo?: {
        employeeName?: string | null;
        accountName?: string | null;
    } | null;
    half_sample?: {
        half_sample_required?: boolean | null;
        step4_halbprobenerstellung?: {
            preparation_date?: string | null;
            fitting_date?: string | null;
            notes?: string | null;
        } | null;
        step5_halbprobe_durchfuehren?: {
            fitting_date?: string | null;
            notes?: string | null;
        } | null;
    } | null;
    has_trim?: {
        has_trim_strips?: boolean | null;
        step2_leistenerstellung?: {
            material?: string | null;
            leistentyp?: string | null;
            notes?: string | null;
            leistengroesse?: string | number | null;
        } | null;
    } | null;
    bedding_required?: {
        bedding_required?: boolean | null;
        step3_bettungserstellung?: {
            step3_json?: {
                step3?: {
                    notes?: string | null;
                    material?: string | null;
                    thickness?: string | null;
                    pelotte_hoehe_l?: string | null;
                    pelotte_hoehe_r?: string | null;
                    schicht1_starke?: string | null;
                    schicht2_starke?: string | null;
                    decksohle_starke?: string | null;
                    versteifung_zone?: string | null;
                    schicht1_material?: string | null;
                    schicht2_material?: string | null;
                    decksohle_material?: string | null;
                    versteifung_material?: string | null;
                    zusätzliche_notizen?: string | null;
                } | null;
            } | null;
            zusaetzliche_notizen?: string | null;
            notes?: string | null;
        } | null;
    } | null;
}

const dash = '-';

const asText = (value: unknown): string => {
    if (value == null) return dash;
    const str = String(value).trim();
    return str.length ? str : dash;
};

const boolText = (value?: boolean | null): string => {
    if (value == null) return dash;
    return value ? 'Ja' : 'Nein';
};

const formatDate = (value?: string | null): string => {
    if (!value) return dash;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return asText(value);
    return d.toLocaleDateString('de-DE');
};

const formatMoney = (value: unknown): string => {
    if (value == null || value === '') return dash;
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return asText(value);
    return `${new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n)} €`;
};

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ borderTop: '2px solid #111', paddingTop: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
                {title}
            </div>
            <div style={{ marginTop: 6 }}>{children}</div>
        </div>
    );
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderBottom: '1px solid #d9d9d9', padding: '3px 0' }}>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</div>
            <div
                style={{
                    fontSize: 10,
                    color: '#111',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                }}
            >
                {value}
            </div>
        </div>
    );
}

function CompactFieldRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderBottom: '1px solid #d9d9d9', padding: '2px 0' }}>
            <div style={{ fontSize: 9.5, color: '#444', textTransform: 'uppercase', letterSpacing: 0.2 }}>{label}</div>
            <div
                style={{
                    fontSize: 9.5,
                    color: '#111',
                    textAlign: 'left',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                }}
            >
                {value}
            </div>
        </div>
    );
}

export default function WerkstattzettelA4V2Sheet({
    data,
    logoProxyUrl,
}: {
    data: WerkstattzettelA4V2Data;
    logoProxyUrl?: string | null;
}) {
    const TARGET_WIDTH = 940;
    const TARGET_HEIGHT = 717;
    const customer = data.customerInfo ?? {};
    const prescription = data.prescriptionInfo ?? {};
    const order = data.orderInfo ?? {};
    const branch = order.branch_location ?? {};
    const price = order.priseInfo ?? {};
    const employee = data.employeeInfo ?? {};
    const half = data.half_sample ?? {};
    const trim = data.has_trim ?? {};
    const trimStep = trim.step2_leistenerstellung ?? {};
    const bedding = data.bedding_required ?? {};
    const beddingStep = bedding.step3_bettungserstellung ?? {};
    const step3Data = beddingStep.step3_json?.step3 ?? {};
    const insurancePayed = (order as any)?.insurance_payed ?? (data as any)?.insurance_payed ?? null;
    const kvaNumber = (order as any)?.kva_number ?? (data as any)?.kva_number ?? null;

    const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || dash;
    const branchText = [branch.title, branch.description].filter(Boolean).join(' - ') || dash;
    const nettoFromTotal =
        typeof price.total_price === 'number' && typeof order.vat_rate === 'number'
            ? price.total_price / (1 + order.vat_rate / 100)
            : null;
    const nettoValue = price.Netto ?? nettoFromTotal;
    const vatAmount =
        typeof price.total_price === 'number' && typeof nettoFromTotal === 'number'
            ? price.total_price - nettoFromTotal
            : null;
    const notesText = asText(order.supply_note);
    const logoUrl = logoProxyUrl || prescription.image || null;
    const step4Info = half.step4_halbprobenerstellung ?? {};
    const materialAufbauRows = [
        { key: '1', label: 'Vorbereitung', value: formatDate(step4Info.preparation_date) },
        { key: '2', label: 'Fitting', value: formatDate(step4Info.fitting_date) },
        { key: '3', label: 'Notizen', value: asText(step4Info.notes) },
    ];

    return (
        <div
            style={{
                width: TARGET_WIDTH,
                height: TARGET_HEIGHT,
                background: '#fff',
                color: '#111',
                fontFamily: 'Arial, Helvetica, sans-serif',
                boxSizing: 'border-box',
                padding: '18px',
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                    style={{
                        width: 52,
                        height: 26,
                        border: '1px solid #cfcfcf',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoUrl}
                            alt="logo"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        />
                    ) : (
                        <span style={{ fontSize: 8, color: '#555' }}>LOGO</span>
                    )}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1 }}>Werkstattzettel</div>
                    <div style={{ marginTop: 6, fontSize: 10, textTransform: 'uppercase', color: '#555' }}>
                        Auftragsnr. {asText(order.orderNumber)}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 10, textTransform: 'uppercase', color: '#555' }}>
                        Datum {formatDate(order.createdAt)}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '57% 43%', gap: 14 }}>
                <div>
                    <Section title="Kunden- & Auftragsinfo">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <FieldRow label="Name" value={customerName} />
                                <FieldRow label="Adresse / Wohnort" value={asText(customer.address)} />
                                <FieldRow label="Telefon" value={asText(customer.phone)} />
                                <FieldRow label="E-Mail" value={asText(customer.email)} />
                            </div>
                            <div>
                                <FieldRow label="Auftragsdatum" value={formatDate(order.createdAt)} />
                                <FieldRow label="Auftrag erstellt von" value={asText(employee.employeeName || employee.accountName)} />
                                <FieldRow label="Filiale / Annahmestelle" value={branchText} />
                                <FieldRow label="Fertigstellung bis" value={formatDate(half.step5_halbprobe_durchfuehren?.fitting_date)} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Versorgung & Positionen">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <FieldRow label="Zusatzpositionen" value={asText(order.supply_note)} />
                                <FieldRow
                                    label="Rabatt"
                                    value={
                                        order.vat_rate != null && Number.isFinite(Number(order.vat_rate))
                                            ? `${Number(order.vat_rate)}%`
                                            : dash
                                    }
                                />
                            </div>
                            <div>
                                <FieldRow label="Menge" value={asText(order.quantity)} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Rezept & Abrechnung">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 4 }}>
                            <div>
                                <FieldRow label="Abrechnung" value={asText(order.billing_type)} />
                                <FieldRow label="Standort" value={asText(prescription.doctor_location)} />
                                <FieldRow label="Abprobee" value={boolText(insurancePayed)} />
                            </div>
                            <div>
                                <FieldRow label="Positionsnummer" value={asText(prescription.referencen_number)} />
                                <FieldRow label="Durchgeführt von" value={asText(employee.employeeName)} />
                                <FieldRow label="KVA" value={asText(kvaNumber)} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <FieldRow label="Ärztliche Diagnose" value={asText(prescription.medical_diagnosis)} />
                            <FieldRow label="Zusätzliche Diagnose" value={asText(prescription.medical_diagnosis)} />
                        </div>
                    </Section>

                    <Section title="Produktionsworkflow">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div>
                                <CompactFieldRow label="STEP3 MATERIAL" value={asText(step3Data.material)} />
                                <CompactFieldRow label="STEP3 THICKNESS" value={asText(step3Data.thickness)} />
                                <CompactFieldRow label="PELOTTE HÖHE LINKS" value={asText(step3Data.pelotte_hoehe_l)} />
                                <CompactFieldRow label="PELOTTE HÖHE RECHTS" value={asText(step3Data.pelotte_hoehe_r)} />
                                <CompactFieldRow label="SCHICHT1 STÄRKE" value={asText(step3Data.schicht1_starke)} />
                                <CompactFieldRow label="SCHICHT2 STÄRKE" value={asText(step3Data.schicht2_starke)} />
                                <CompactFieldRow label="DECKSOHLE STÄRKE" value={asText(step3Data.decksohle_starke)} />
                            </div>
                            <div>
                                <CompactFieldRow label="VERSTEIFUNG ZONE" value={asText(step3Data.versteifung_zone)} />
                                <CompactFieldRow label="SCHICHT1 MATERIAL" value={asText(step3Data.schicht1_material)} />
                                <CompactFieldRow label="SCHICHT2 MATERIAL" value={asText(step3Data.schicht2_material)} />
                                <CompactFieldRow label="DECKSOHLE MATERIAL" value={asText(step3Data.decksohle_material)} />
                                <CompactFieldRow label="VERSTEIFUNG MATERIAL" value={asText(step3Data.versteifung_material)} />
                                <CompactFieldRow label="STEP3 NOTES" value={asText(step3Data.notes)} />
                                <CompactFieldRow label="ZUSÄTZLICHE NOTIZEN" value={asText(step3Data.zusätzliche_notizen)} />
                            </div>
                        </div>
                    </Section>
                </div>

                <div>
                    <Section title="Material / Aufbau">
                        <div style={{ border: '1px solid #cfcfcf' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', borderBottom: '1px solid #cfcfcf', padding: '4px 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                <div>Schichtmaterial</div>
                                <div style={{ textAlign: 'right' }}>Stärke</div>
                            </div>
                            {materialAufbauRows.map((row, idx) => (
                                <div
                                    key={row.key}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 80px',
                                        borderBottom: idx < materialAufbauRows.length - 1 ? '1px solid #e3e3e3' : 'none',
                                        padding: '4px 6px',
                                        fontSize: 10,
                                        gap: 8,
                                    }}
                                >
                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                        {row.key}&nbsp;&nbsp;&nbsp;{row.label}
                                    </div>
                                    <div style={{ textAlign: 'right', whiteSpace: 'pre-wrap' }}>{row.value}</div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Zusatzelemente">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <FieldRow label="Decksohle Material" value={asText(trimStep.material)} />
                                <FieldRow label="Versteifung" value={asText(trimStep.notes)} />
                            </div>
                            <div>
                                <FieldRow label="Decksohle Stärke" value={asText(trimStep.leistentyp)} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Preisübersicht">
                        <div style={{ border: '1px solid #cfcfcf' }}>
                            <FieldRow label="Pos. Netto" value={formatMoney(nettoValue)} />
                            <FieldRow
                                label="MwSt."
                                value={
                                    order.vat_rate != null && Number.isFinite(Number(order.vat_rate))
                                        ? `${Number(order.vat_rate)}%`
                                        : dash
                                }
                            />
                            <FieldRow label="Pos. inkl. MwSt." value={formatMoney(price.total_price)} />
                            <FieldRow label="Eigenanteil" value={formatMoney(price.private_price)} />
                            <FieldRow label="Versicherung" value={formatMoney(price.insurance_price)} />
                            <FieldRow label="Zwischensumme" value={formatMoney(price.total_price)} />
                            <div style={{ borderTop: '2px solid #111' }}>
                                <FieldRow label="Gesamt" value={formatMoney(price.total_price)} />
                            </div>
                        </div>
                    </Section>

                    <Section title="Interne Informationen">
                        <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', marginBottom: 4 }}>Notizen / Bemerkungen</div>
                        <div style={{ minHeight: 88, border: '1px solid #cfcfcf', padding: 6, fontSize: 10, whiteSpace: 'pre-wrap' }}>
                            {notesText}
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}


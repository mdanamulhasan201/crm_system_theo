'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Kopfdaten, { KopfdatenRef, KopfdatenValidationErrors } from '../_components/Leistenkonfigurator/kopfdaten';
import SprengungSpitzenzugabe, { SprengungSpitzenzugabeRef } from '../_components/Leistenkonfigurator/sprengung-spitzenzugabe';
import Leistentyp, { LeistentypRef } from '../_components/Leistenkonfigurator/leistentyp';
import AllgemeineOptionen, { AllgemeineOptionenRef } from '../_components/Leistenkonfigurator/allgemeine-optionen';
import KorrekturenModellierung, { KorrekturenModellierungRef } from '../_components/Leistenkonfigurator/korrekturen-modellierung';
import Bemerkungen, { BemerkungenRef } from '../_components/Leistenkonfigurator/bemerkungen';
import LeistenkonfiguratorConfirmationModal from '../_components/Leistenkonfigurator/LeistenkonfiguratorConfirmationModal';
import HalbprobeInvoicePDFPopup, { type ChecklistItem } from '../_components/Leistenkonfigurator/HalbprobeInvoicePDFPopup';
import CompletionPopUp from '../_components/Massschuhauftraeges/Details/Completion-PopUp';
import { createLeistenkonfigurator } from '@/apis/LeistenkonfiguratorManagementApis';
import { useDeliveryDateByCategory } from '@/hooks/useDeliveryDateByCategory';
import StickyPriceSummary from '@/components/StickyPriceSummary/StickyPriceSummary';

export default function LeistenKonfiguratorPage() {
  const router = useRouter();
  const kopfdatenRef = useRef<KopfdatenRef>(null);
  const sprengungRef = useRef<SprengungSpitzenzugabeRef>(null);
  const leistentypRef = useRef<LeistentypRef>(null);
  const allgemeineOptionenRef = useRef<AllgemeineOptionenRef>(null);
  const korrekturenRef = useRef<KorrekturenModellierungRef>(null);
  const bemerkungenRef = useRef<BemerkungenRef>(null);
  const basePrice = 179.99;
  const knoechelhoherLeistenPrice = 19.99;
  const holzleistenPrice = 30;

  const [totalPrice, setTotalPrice] = useState(basePrice);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [kopfdatenErrors, setKopfdatenErrors] = useState<KopfdatenValidationErrors | undefined>(undefined);

  const { deliveryDate: deliveryDateText } = useDeliveryDateByCategory(showPDFModal ? 'Halbprobenerstellung' : null);

  // Recalculate price when leistentyp or kopfdaten (Leistenmaterial) changes.
  // When material changes, pass the new value so we don't use stale ref data.
  const handlePriceUpdate = (leistenmaterialOverride?: 'holz' | 'plastik') => {
    const kopfdatenData = kopfdatenRef.current?.getData();
    const leistentypData = leistentypRef.current?.getData();
    const leistenmaterial = leistenmaterialOverride ?? kopfdatenData?.leistenmaterial;
    const knoechelhoherLinks = leistentypData?.knoechelhoherLeistenLinks ? knoechelhoherLeistenPrice : 0;
    const knoechelhoherRechts = leistentypData?.knoechelhoherLeistenRechts ? knoechelhoherLeistenPrice : 0;
    const hasHolzleisten = leistenmaterial === 'holz';

    const calculatedPrice =
      basePrice +
      knoechelhoherLinks +
      knoechelhoherRechts +
      (hasHolzleisten ? holzleistenPrice : 0);
    setTotalPrice(calculatedPrice);
  };

  const formatPrice = (value: number) =>
    value.toFixed(2).replace('.', ',') + ' €';

  const handleLeistentypChange = handlePriceUpdate;

  /** Build checklist rows for PDF display (label + value with checkmark) */
  const buildChecklistForPDF = (): ChecklistItem[] => {
    const k = kopfdatenRef.current?.getData();
    const s = sprengungRef.current?.getData();
    const l = leistentypRef.current?.getData();
    const a = allgemeineOptionenRef.current?.getData();
    const kor = korrekturenRef.current?.getData();
    const b = bemerkungenRef.current?.getData();
    const items: ChecklistItem[] = [];

    if (k) {
      if (k.patient?.trim()) items.push({ label: 'Patient', value: k.patient.trim() });
      items.push({ label: 'Leistenmaterial', value: k.leistenmaterial === 'holz' ? 'Holzleisten' : 'Plastikleisten' });
    }
    if (s) {
      if (s.fersensprengungLinks || s.fersensprengungRechts) items.push({ label: 'Fersensprengung Links / Rechts', value: `Links: ${s.fersensprengungLinks || '–'}, Rechts: ${s.fersensprengungRechts || '–'}` });
      if (s.spitzensprengungLinks || s.spitzensprengungRechts) items.push({ label: 'Spitzensprengung Links / Rechts', value: `Links: ${s.spitzensprengungLinks || '–'}, Rechts: ${s.spitzensprengungRechts || '–'}` });
      if (s.spitzenzugabeLinks || s.spitzenzugabeRechts) items.push({ label: 'Spitzenzugabe Links / Rechts', value: `Links: ${s.spitzenzugabeLinks || '–'}, Rechts: ${s.spitzenzugabeRechts || '–'}` });
      if (s.dickeFerseLinks?.trim() || s.dickeFerseRechts?.trim()) items.push({ label: 'Dicke Ferse Links / Rechts', value: `Links: ${s.dickeFerseLinks || '–'}, Rechts: ${s.dickeFerseRechts || '–'}` });
      if (s.dickeBallenLinks?.trim() || s.dickeBallenRechts?.trim()) items.push({ label: 'Dicke Ballen Links / Rechts', value: `Links: ${s.dickeBallenLinks || '–'}, Rechts: ${s.dickeBallenRechts || '–'}` });
      if (s.dickeSpitzeLinks?.trim() || s.dickeSpitzeRechts?.trim()) items.push({ label: 'Dicke Spitze Links / Rechts', value: `Links: ${s.dickeSpitzeLinks || '–'}, Rechts: ${s.dickeSpitzeRechts || '–'}` });
    }
    if (l) {
      const leisten: string[] = [];
      if (l.knoechelhoherLeistenLinks) leisten.push('Knöchelhoher Leisten Links');
      if (l.knoechelhoherLeistenRechts) leisten.push('Knöchelhoher Leisten Rechts');
      if (l.halbschuhleistenSchmalerLinks) leisten.push('Halbschuhleisten schmaler Links');
      if (l.halbschuhleistenSchmalerRechts) leisten.push('Halbschuhleisten schmaler Rechts');
      if (l.halbschuhleistenBreiterLinks) leisten.push('Halbschuhleisten breiter Links');
      if (l.halbschuhleistenBreiterRechts) leisten.push('Halbschuhleisten breiter Rechts');
      if (leisten.length) items.push({ label: 'Leistentyp', value: leisten.join(', ') });
    }
    if (a) {
      if (a.gleicheLaenge) items.push({ label: 'Gleiche Länge', value: a.gleicheLaenge === 'ja' ? 'Ja' : 'Nein' });
      if (a.spitzenform) items.push({ label: 'Spitzenform', value: a.spitzenform });
      if (a.modelNr?.trim()) items.push({ label: 'Modell-Nr.', value: a.modelNr.trim() });
      if (a.leistenteilung) items.push({ label: 'Leistenteilung', value: a.leistenteilung === 'falte-knickschnitt' ? 'Falte/Knickschnitt' : a.leistenteilung });
    }
    if (kor) {
      if (kor.beinkorrekturLinks || kor.beinkorrekturRechts) items.push({ label: 'Beinkorrektur Links / Rechts', value: `Links: ${kor.beinkorrekturLinks || '–'}, Rechts: ${kor.beinkorrekturRechts || '–'}` });
      if (kor.anschlagkanteLinks || kor.anschlagkanteRechts) items.push({ label: 'Anschlagkante Links / Rechts', value: `Links: ${kor.anschlagkanteLinks || '–'}, Rechts: ${kor.anschlagkanteRechts || '–'}` });
    }
    if (b?.bemerkungen?.trim()) items.push({ label: 'Bemerkungen', value: b.bemerkungen.trim() });

    return items;
  };

  // All form data as single JSON for API (Halbprobenerstellung_json)
  const getHalbprobenerstellungJson = () => ({
    kopfdaten: kopfdatenRef.current?.getData() ?? null,
    sprengungSpitzenzugabe: sprengungRef.current?.getData() ?? null,
    leistentyp: leistentypRef.current?.getData() ?? null,
    allgemeineOptionen: allgemeineOptionenRef.current?.getData() ?? null,
    korrekturenModellierung: korrekturenRef.current?.getData() ?? null,
    bemerkungen: bemerkungenRef.current?.getData() ?? null,
    price: `${totalPrice.toFixed(2).replace('.', ',')}€`,
  });

  const buildFormData = (invoiceBlob: Blob | null): FormData => {
    const formData = new FormData();
    const files = kopfdatenRef.current?.getFiles();
    if (files?.leftStlFile) formData.append('image3d_1', files.leftStlFile);
    if (files?.rightStlFile) formData.append('image3d_2', files.rightStlFile);
    if (files?.pdfFile) formData.append('Halbprobenerstellung_pdf', files.pdfFile);
    formData.append('totalPrice', totalPrice.toString());
    formData.append('Halbprobenerstellung_json', JSON.stringify(getHalbprobenerstellungJson()));
    if (invoiceBlob) formData.append('invoice', invoiceBlob, 'invoice.pdf');
    return formData;
  };

  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const kopfdaten = kopfdatenRef.current?.getData();
    const files = kopfdatenRef.current?.getFiles();
    const fieldErrors: KopfdatenValidationErrors = {};

    if (!kopfdaten?.patient?.trim()) {
      errors.push('Patient');
      fieldErrors.patient = true;
    }
    if (!files?.leftStlFile) {
      errors.push('3D-Datei Linker Fuß');
      fieldErrors.leftStlFile = true;
    }
    if (!files?.rightStlFile) {
      errors.push('3D-Datei Rechter Fuß');
      fieldErrors.rightStlFile = true;
    }
    if (!files?.pdfFile) {
      errors.push('Halbprobenerstellung-PDF');
      fieldErrors.pdfFile = true;
    }

    setKopfdatenErrors(errors.length ? fieldErrors : undefined);
    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const handleContinue = () => {
    const { valid, errors } = validateForm();
    if (!valid) {
      toast.error(`Bitte füllen Sie folgende Felder aus: ${errors.join(', ')}`, { id: 'leisten-validation', duration: 5000 });
      document.getElementById('section-kopfdaten')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setKopfdatenErrors(undefined);
    setShowConfirmationModal(true);
  };

  const handleConfirmationConfirm = () => {
    setShowConfirmationModal(false);
    setShowPDFModal(true);
  };

  const handlePDFConfirm = (blob?: Blob) => {
    setPdfBlob(blob ?? null);
    setShowPDFModal(false);
    setShowCompletionModal(true);
  };

  const handleCompletionConfirm = async (_deliveryDate?: string | null) => {
    setIsCreatingOrder(true);
    try {
      const formData = buildFormData(pdfBlob);
      const response = await createLeistenkonfigurator(formData);
      toast.success((response as { message?: string })?.message ?? 'Bestellung erfolgreich erstellt!', { id: 'leisten-order' });
      setShowCompletionModal(false);
      router.push('/dashboard/balance-dashboard');
    } catch (error) {
      console.error('Error creating Halbprobenerstellung order:', error);
      toast.error('Fehler beim Erstellen der Bestellung.', { id: 'leisten-order' });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const kopfdatenData = kopfdatenRef.current?.getData();
  const customerDisplayName = kopfdatenData?.patient?.trim() || undefined;

  return (
    <div className="relative w-full min-h-screen bg-gray-50 px-4 py-8 md:px-8 ">
      {/* Sticky Price Summary - bottom-right, price only (no button) */}
      <StickyPriceSummary onWeiterClick={handleContinue} price={totalPrice} />
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Leistenkonfigurator
        </h1>
        <p className="text-sm md:text-base text-gray-500">
          Datenblatt zur individuellen Leistenerstellung
        </p>
        <p className="text-sm md:text-base text-gray-500">
          Hinweis zum Ablauf
          Vor der Leistenfräsung erhalten Sie einen Probeschuh (Halbprobe).
          Erst nach Ihrer Bestätigung, dass die Passform stimmt, starten wir mit der finalen Leistenfräsung.
          Die Produktionsdauer für die Halbprobe beträgt 10 Werktage,
          anschließend erfolgt der Versand.
        </p>
      </header>

      {/* Main content sections */}
      <main className="space-y-6 md:space-y-8">
        <Kopfdaten ref={kopfdatenRef} onChange={(material) => handlePriceUpdate(material)} errors={kopfdatenErrors} sectionId="section-kopfdaten" onClearValidationErrors={() => setKopfdatenErrors(undefined)} />
        <SprengungSpitzenzugabe ref={sprengungRef} />
        <Leistentyp ref={leistentypRef} onChange={handleLeistentypChange} />
        <AllgemeineOptionen ref={allgemeineOptionenRef} />
        <KorrekturenModellierung ref={korrekturenRef} />
        <Bemerkungen ref={bemerkungenRef} />
      </main>

      {/* Action Buttons */}
      {/* <div className="flex justify-end gap-4 mt-8">
        <Button
          onClick={handleContinue}
          className="px-6 cursor-pointer py-2 bg-[#61A178] hover:bg-[#61A178]/80 text-white"
        >
          Weiter {formatPrice(totalPrice)} excl. Lieferung
        </Button>
      </div> */}

      {/* Confirmation Modal */}
      <LeistenkonfiguratorConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmationConfirm}
        orderPrice={totalPrice}
        customerName={customerDisplayName}
      />

      {/* Invoice PDF Popup */}
      <HalbprobeInvoicePDFPopup
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        onConfirm={handlePDFConfirm}
        orderData={{
          productName: 'Halbprobenerstellung',
          customerName: customerDisplayName,
          totalPrice,
          deliveryDate: deliveryDateText,
          checklist: buildChecklistForPDF(),
        }}
      />

      {/* Completion PopUp – final confirm & submit */}
      {showCompletionModal && (
        <CompletionPopUp
          onClose={() => {
            if (!isCreatingOrder) {
              setShowCompletionModal(false);
            }
          }}
          onConfirm={handleCompletionConfirm}
          productName="Halbprobenerstellung"
          customerName={customerDisplayName}
          value={totalPrice.toFixed(2)}
          isLoading={isCreatingOrder}
          deliveryCategory="Halbprobenerstellung"
        />
      )}
    </div>
  );
}

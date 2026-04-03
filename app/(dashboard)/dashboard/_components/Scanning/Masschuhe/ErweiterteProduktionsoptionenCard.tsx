'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import SchafttypFieldText, { type SchafttypValue } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/SchafttypFieldText';
import BodenkonstruktionFiledText from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/BodenkonstruktionFiledText';
import type { MassschafterstellungJson } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/SchafttypCustomModal';
import { createSchafttypAndBodenkonstruktion, getAllSchafttypAndBodenkonstruktion } from '@/apis/MassschuheAddedApis';

// Fixed sessionStorage key used for standalone bodenkonstruktion prefill
const BODEN_STANDALONE_PREFILL_KEY = 'bodenkonstruktion-standalone-draft-prefill';

export interface ErweiterteProduktionsoptionenData {
    schafttyp: SchafttypValue;
    schafttypInternNote: string;
    schafttypExternNote: string;
    bodenkonstruktionInternNote: string;
    bodenkonstruktionExternNote: string;
}

interface ErweiterteProduktionsoptionenCardProps {
    data: ErweiterteProduktionsoptionenData;
    onChange: (data: ErweiterteProduktionsoptionenData) => void;
}

export default function ErweiterteProduktionsoptionenCard({
    data,
    onChange,
}: ErweiterteProduktionsoptionenCardProps) {
    const set = <K extends keyof ErweiterteProduktionsoptionenData>(
        key: K,
        value: ErweiterteProduktionsoptionenData[K]
    ) => onChange({ ...data, [key]: value });

    // Draft data fetched from GET /v2/shoe-orders/schaft-boden-draft
    const [schafftypInitialData, setSchafftypInitialData] = useState<MassschafterstellungJson | null>(null);
    const [schafftypInitialImageUrl, setSchafftypInitialImageUrl] = useState<string | null>(null);
    const hasFetchedRef = useRef(false);

    const fetchDraft = useCallback(async () => {
        try {
            const res: any = await getAllSchafttypAndBodenkonstruktion();
            const draft = res?.data ?? res;

            // Schafttyp prefill
            const schaft = draft?.massschafterstellung;
            if (schaft) {
                const rawJson = schaft.massschafterstellung_json;
                const parsedJson: MassschafterstellungJson | null =
                    rawJson && typeof rawJson === 'string'
                        ? (() => { try { return JSON.parse(rawJson); } catch { return null; } })()
                        : rawJson ?? null;
                setSchafftypInitialData(parsedJson);
                setSchafftypInitialImageUrl(schaft.massschafterstellung_image ?? null);

                // Sync notes into parent state if they differ
                if (schaft.schafttyp_intem_note) onChange({ ...data, schafttypInternNote: schaft.schafttyp_intem_note });
                if (schaft.schafttyp_extem_note) onChange({ ...data, schafttypExternNote: schaft.schafttyp_extem_note });
            }

            // Bodenkonstruktion prefill → write to sessionStorage so BodenkonstruktionCustomerOrderView picks it up
            const boden = draft?.bodenkonstruktion;
            if (boden) {
                const rawJson = boden.bodenkonstruktion_json;
                const parsedJson =
                    rawJson && typeof rawJson === 'string'
                        ? (() => { try { return JSON.parse(rawJson); } catch { return null; } })()
                        : rawJson ?? null;
                sessionStorage.setItem(
                    BODEN_STANDALONE_PREFILL_KEY,
                    JSON.stringify({ json: parsedJson, image: boden.bodenkonstruktion_image ?? null })
                );

                // Sync notes into parent state
                if (boden.bodenkonstruktion_intem_note) onChange({ ...data, bodenkonstruktionInternNote: boden.bodenkonstruktion_intem_note });
                if (boden.bodenkonstruktion_extem_note) onChange({ ...data, bodenkonstruktionExternNote: boden.bodenkonstruktion_extem_note });
            } else {
                sessionStorage.removeItem(BODEN_STANDALONE_PREFILL_KEY);
            }
        } catch {
            // silently ignore – empty form is fine
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch once on mount
    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchDraft();
    }, [fetchDraft]);

    // Called when Schafttyp Intern erweitert modal "Abschließen" is clicked
    const handleSchafttypStandaloneSubmit = async (payload: {
        imageFile?: File;
        massschafterstellung_json: MassschafterstellungJson;
    }) => {
        const formData = new FormData();
        if (payload.imageFile) {
            formData.append('massschafterstellung_image', payload.imageFile);
        }
        formData.append('massschafterstellung_json', JSON.stringify(payload.massschafterstellung_json));
        if (data.schafttypInternNote) formData.append('schafttyp_intem_note', data.schafttypInternNote);
        if (data.schafttypExternNote) formData.append('schafttyp_extem_note', data.schafttypExternNote);
        try {
            await createSchafttypAndBodenkonstruktion(formData);
            toast.success('Schafttyp gespeichert!');
            // Refresh draft so re-opening the modal shows updated data
            await fetchDraft();
        } catch (e) {
            console.error(e);
            toast.error('Speichern fehlgeschlagen.');
            throw e;
        }
    };

    // Called when Bodenkonstruktion Intern erweitert modal "Abschließen" is clicked
    const handleBodenkonstruktionStandaloneSubmit = async (bFormData: FormData) => {
        const renamedFormData = new FormData();
        for (const [key, value] of bFormData.entries()) {
            if (key === 'threeDFile') {
                renamedFormData.append('bodenkonstruktion_threeDFile', value);
            } else if (key === 'staticImage') {
                renamedFormData.append('bodenkonstruktion_image', value);
            } else {
                renamedFormData.append(key, value);
            }
        }
        if (data.bodenkonstruktionInternNote) renamedFormData.append('bodenkonstruktion_intem_note', data.bodenkonstruktionInternNote);
        if (data.bodenkonstruktionExternNote) renamedFormData.append('bodenkonstruktion_extem_note', data.bodenkonstruktionExternNote);
        try {
            await createSchafttypAndBodenkonstruktion(renamedFormData);
            toast.success('Bodenkonstruktion gespeichert!');
            // Refresh draft so re-opening the modal shows updated data
            await fetchDraft();
        } catch (e) {
            console.error(e);
            toast.error('Speichern fehlgeschlagen.');
            throw e;
        }
    };

    return (
        <Accordion type="single" collapsible className="w-full mb-5">
            <AccordionItem value="erweiterte-optionen" className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50 transition-colors data-[state=open]:bg-gray-50 group">
                    <span className="flex items-center gap-2.5 text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                        <Settings2 className="size-4 text-gray-400 group-hover:text-gray-500 shrink-0" />
                        Erweiterte Produktionsoptionen anzeigen
                    </span>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                    <div className="p-5 space-y-4 border-t border-gray-200">
                        {/* Schafttyp */}
                        <SchafttypFieldText
                            schafttyp={data.schafttyp}
                            schafttypInternNote={data.schafttypInternNote}
                            schafttypExternNote={data.schafttypExternNote}
                            onSchafttypChange={(v) => set('schafttyp', v)}
                            onSchafttypInternNoteChange={(v) => set('schafttypInternNote', v)}
                            onSchafttypExternNoteChange={(v) => set('schafttypExternNote', v)}
                            disableExternErweitert={true}
                            onStandaloneSubmit={handleSchafttypStandaloneSubmit}
                            standaloneInitialData={schafftypInitialData}
                            standaloneInitialImageUrl={schafftypInitialImageUrl}
                        />

                        {/* Bodenkonstruktion */}
                        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                            <BodenkonstruktionFiledText
                                bodenkonstruktionInternNote={data.bodenkonstruktionInternNote}
                                bodenkonstruktionExternNote={data.bodenkonstruktionExternNote}
                                onBodenkonstruktionInternNoteChange={(v) => set('bodenkonstruktionInternNote', v)}
                                onBodenkonstruktionExternNoteChange={(v) => set('bodenkonstruktionExternNote', v)}
                                disableExternErweitert={true}
                                onStandaloneSave={handleBodenkonstruktionStandaloneSubmit}
                                standalonePrefillKey={BODEN_STANDALONE_PREFILL_KEY}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Settings2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
} from '@/components/ui/accordion';
import SchafttypFieldText, { type SchafttypValue } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/SchafttypFieldText';
import BodenkonstruktionFiledText from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/BodenkonstruktionFiledText';
import type { MassschafterstellungJson } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/SchafttypCustomModal';
import {
    createSchafttypAndBodenkonstruktion,
    getAllSchafttypAndBodenkonstruktion,
    deleteSchafttypAndBodenkonstruktion,
} from '@/apis/MassschuheAddedApis';

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
    /** Called whenever the card's internal hasDraftData state changes */
    onHasDraftDataChange?: (hasData: boolean) => void;
}

export default function ErweiterteProduktionsoptionenCard({
    data,
    onChange,
    onHasDraftDataChange,
}: ErweiterteProduktionsoptionenCardProps) {
    const set = <K extends keyof ErweiterteProduktionsoptionenData>(
        key: K,
        value: ErweiterteProduktionsoptionenData[K]
    ) => onChange({ ...data, [key]: value });

    // Draft data fetched from GET /v2/shoe-orders/schaft-boden-draft
    const [schafftypInitialData, setSchafftypInitialData] = useState<MassschafterstellungJson | null>(null);
    const [schafftypInitialImageUrl, setSchafftypInitialImageUrl] = useState<string | null>(null);
    const [hasDraftData, setHasDraftData] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const hasFetchedRef = useRef(false);

    // Notify parent whenever hasDraftData changes
    const setHasDraftDataWithNotify = useCallback((value: boolean) => {
        setHasDraftData(value);
        onHasDraftDataChange?.(value); // notify parent
    }, [onHasDraftDataChange]);

    const fetchDraft = useCallback(async () => {
        try {
            const res: any = await getAllSchafttypAndBodenkonstruktion();

            // API returns { success: false } when no draft exists — treat as empty, not an error
            if (res?.success === false) {
                setHasDraftDataWithNotify(false);
                setSchafftypInitialData(null);
                setSchafftypInitialImageUrl(null);
                sessionStorage.removeItem(BODEN_STANDALONE_PREFILL_KEY);
                return;
            }

            const draft = res?.data ?? res;

            const schaft = draft?.massschafterstellung;
            const boden = draft?.bodenkonstruktion;
            const hasData = Boolean(schaft || boden);
            setHasDraftDataWithNotify(hasData);

            // Collect all note updates and apply in a single onChange call
            // to avoid stale-closure overwrites from multiple separate calls.
            const noteUpdates: Partial<ErweiterteProduktionsoptionenData> = {};

            // Schafttyp prefill
            if (schaft) {
                const rawJson = schaft.massschafterstellung_json;
                const parsedJson: MassschafterstellungJson | null =
                    rawJson && typeof rawJson === 'string'
                        ? (() => { try { return JSON.parse(rawJson); } catch { return null; } })()
                        : rawJson ?? null;
                setSchafftypInitialData(parsedJson);
                setSchafftypInitialImageUrl(schaft.massschafterstellung_image ?? null);

                if (schaft.schafttyp_intem_note) noteUpdates.schafttypInternNote = schaft.schafttyp_intem_note;
                if (schaft.schafttyp_extem_note) noteUpdates.schafttypExternNote = schaft.schafttyp_extem_note;
            } else {
                setSchafftypInitialData(null);
                setSchafftypInitialImageUrl(null);
            }

            // Bodenkonstruktion prefill → write to sessionStorage
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

                if (boden.bodenkonstruktion_intem_note) noteUpdates.bodenkonstruktionInternNote = boden.bodenkonstruktion_intem_note;
                if (boden.bodenkonstruktion_extem_note) noteUpdates.bodenkonstruktionExternNote = boden.bodenkonstruktion_extem_note;
            } else {
                sessionStorage.removeItem(BODEN_STANDALONE_PREFILL_KEY);
            }

            // Single merged onChange — avoids each call overwriting the previous
            if (Object.keys(noteUpdates).length > 0) {
                onChange({ ...data, ...noteUpdates });
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

    const handleClearDraft = async (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent accordion toggle
        setIsClearing(true);
        try {
            const res: any = await deleteSchafttypAndBodenkonstruktion();
            // success: false means draft was already gone — still clear the UI silently
            if (res?.success === false && res?.message !== 'Draft not found') {
                toast.error('Löschen fehlgeschlagen.');
                return;
            }
            // Reset all local draft state
            setSchafftypInitialData(null);
            setSchafftypInitialImageUrl(null);
            setHasDraftDataWithNotify(false);
            sessionStorage.removeItem(BODEN_STANDALONE_PREFILL_KEY);
            // Clear all note fields in parent state immediately
            onChange({
                ...data,
                schafttypInternNote: '',
                schafttypExternNote: '',
                bodenkonstruktionInternNote: '',
                bodenkonstruktionExternNote: '',
            });
            toast.success('Entwurf gelöscht.');
        } catch (e: any) {
            // If the server 404s (draft already deleted), still clear local state
            const isNotFound =
                e?.response?.status === 404 ||
                e?.response?.data?.message === 'Draft not found';
            if (isNotFound) {
                setSchafftypInitialData(null);
                setSchafftypInitialImageUrl(null);
                setHasDraftDataWithNotify(false);
                sessionStorage.removeItem(BODEN_STANDALONE_PREFILL_KEY);
                onChange({ ...data, schafttypInternNote: '', schafttypExternNote: '', bodenkonstruktionInternNote: '', bodenkonstruktionExternNote: '' });
                toast.success('Entwurf gelöscht.');
            } else {
                console.error(e);
                toast.error('Löschen fehlgeschlagen.');
            }
        } finally {
            setIsClearing(false);
        }
    };

    // Auto-save Schafttyp notes on textarea blur
    const handleSchafttypNoteBlur = async () => {
        if (!data.schafttypInternNote && !data.schafttypExternNote) return;
        const formData = new FormData();
        if (data.schafttypInternNote) formData.append('schafttyp_intem_note', data.schafttypInternNote);
        if (data.schafttypExternNote) formData.append('schafttyp_extem_note', data.schafttypExternNote);
        try {
            await createSchafttypAndBodenkonstruktion(formData);
            setHasDraftDataWithNotify(true);
        } catch (e) {
            console.error('Auto-save Schafttyp notes failed:', e);
        }
    };

    // Auto-save Bodenkonstruktion notes on textarea blur
    const handleBodenkonstruktionNoteBlur = async () => {
        if (!data.bodenkonstruktionInternNote && !data.bodenkonstruktionExternNote) return;
        const formData = new FormData();
        if (data.bodenkonstruktionInternNote) formData.append('bodenkonstruktion_intem_note', data.bodenkonstruktionInternNote);
        if (data.bodenkonstruktionExternNote) formData.append('bodenkonstruktion_extem_note', data.bodenkonstruktionExternNote);
        try {
            await createSchafttypAndBodenkonstruktion(formData);
            setHasDraftDataWithNotify(true);
        } catch (e) {
            console.error('Auto-save Bodenkonstruktion notes failed:', e);
        }
    };

    // Called when Schafttyp Intern erweitert modal "Abschließen" is clicked
    const handleSchafttypStandaloneSubmit = async (payload: {
        imageFile?: File;
        linkerLeistenFile?: File | null;
        rechterLeistenFile?: File | null;
        massschafterstellung_json: MassschafterstellungJson;
    }) => {
        const formData = new FormData();
        if (payload.imageFile) {
            formData.append('massschafterstellung_image', payload.imageFile);
        }
        // 3D Leisten files — rechter = image3d_1, linker = image3d_2 (matches page naming)
        if (payload.rechterLeistenFile) {
            formData.append('massschafterstellung_threeDFile', payload.rechterLeistenFile);
        }
        if (payload.linkerLeistenFile) {
            formData.append('massschafterstellung_threeDFile_2', payload.linkerLeistenFile);
        }
        formData.append('massschafterstellung_json', JSON.stringify(payload.massschafterstellung_json));
        if (data.schafttypInternNote) formData.append('schafttyp_intem_note', data.schafttypInternNote);
        if (data.schafttypExternNote) formData.append('schafttyp_extem_note', data.schafttypExternNote);
        try {
            await createSchafttypAndBodenkonstruktion(formData);
            toast.success('Schafttyp gespeichert!');
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
                {/*
                  * Custom header: AccordionPrimitive.Header renders the <h3>,
                  * AccordionPrimitive.Trigger renders the <button> as flex-1.
                  * The delete button sits as a sibling inside the <h3> — no nesting.
                  */}
                <AccordionPrimitive.Header className="flex w-full items-center">
                    <AccordionPrimitive.Trigger className="group flex flex-1 cursor-pointer items-center gap-2.5 px-5 py-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800 data-[state=open]:bg-gray-50 [&[data-state=open]>svg.chevron]:rotate-180">
                        <Settings2 className="size-4 shrink-0 text-gray-400 transition-colors group-hover:text-gray-500" />
                        Erweiterte Produktionsoptionen anzeigen
                        <ChevronDown className="chevron ml-auto size-4 shrink-0 text-gray-400 transition-transform duration-200" />
                    </AccordionPrimitive.Trigger>

                    {hasDraftData && (
                        <div className="pr-4 shrink-0">
                            <button
                                type="button"
                                onClick={handleClearDraft}
                                disabled={isClearing}
                                title="Entwurf löschen"
                                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-100 hover:border-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="size-3.5" />
                                {isClearing ? 'Löschen…' : 'Entwurf löschen'}
                            </button>
                        </div>
                    )}
                </AccordionPrimitive.Header>
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
                            onSchafttypInternNoteBlur={handleSchafttypNoteBlur}
                            onSchafttypExternNoteBlur={handleSchafttypNoteBlur}
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
                                onBodenkonstruktionInternNoteBlur={handleBodenkonstruktionNoteBlur}
                                onBodenkonstruktionExternNoteBlur={handleBodenkonstruktionNoteBlur}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

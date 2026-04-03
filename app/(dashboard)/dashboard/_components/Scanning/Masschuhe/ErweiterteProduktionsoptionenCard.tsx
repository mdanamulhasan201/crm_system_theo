'use client';

import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import SchafttypFieldText, { type SchafttypValue } from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/SchafttypFieldText';
import BodenkonstruktionFiledText from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/NewMasschuhau/BodenkonstruktionFiledText';

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
                        />

                        {/* Bodenkonstruktion */}
                        <div className="rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
                            <BodenkonstruktionFiledText
                                bodenkonstruktionInternNote={data.bodenkonstruktionInternNote}
                                bodenkonstruktionExternNote={data.bodenkonstruktionExternNote}
                                onBodenkonstruktionInternNoteChange={(v) => set('bodenkonstruktionInternNote', v)}
                                onBodenkonstruktionExternNoteChange={(v) => set('bodenkonstruktionExternNote', v)}
                                disableExternErweitert={true}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

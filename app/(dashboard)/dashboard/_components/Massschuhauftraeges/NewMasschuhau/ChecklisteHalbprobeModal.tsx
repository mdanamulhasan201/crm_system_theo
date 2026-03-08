'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Check, ThumbsUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const CHECKLIST_QUESTIONS = [
    'Ist die Ferse stabil ohne zu rutschen?',
    'Gibt es genügend Platz im Vorfuß- und Zehenbereich?',
    'Liegt der Rist angenehm an, ohne Druck oder Spiel?',
    'Ist die Fußgewölbeunterstützung korrekt (nicht zu stark, nicht zu schwach)?',
    'Passt die Weite im Ballen-/Zehenbereich ohne Druckstellen?',
    'Empfindet der Kunde den Sitz als bequem?',
    'Müssen Anpassungen vorgenommen werden?',
] as const;

export type ChecklisteHalbprobeItem = { question: string; value: 'Ja' | 'Nein' };
export type ChecklisteHalbprobeData = ChecklisteHalbprobeItem[];

export interface ChecklisteHalbprobeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Previously saved checklist data (e.g. parsed from checkliste_halbprobe JSON) */
    initialData?: ChecklisteHalbprobeData;
    /** Called when user clicks Weiter – pass the checklist answers to save */
    onWeiter?: (data: ChecklisteHalbprobeData) => void;
    /** Called when user clicks "Kleine Nacharbeit freigeben" (approve minor rework) */
    onApproveMinorRework?: () => void;
    /** Called when user clicks "Komplett neu" (completely new) */
    onCompletelyNew?: () => void;
}

const emptyAnswers: ('Ja' | 'Nein' | null)[] = Array(7).fill(null);

export default function ChecklisteHalbprobeModal({
    open,
    onOpenChange,
    initialData,
    onWeiter,
    onApproveMinorRework,
    onCompletelyNew,
}: ChecklisteHalbprobeModalProps) {
    const [answers, setAnswers] = useState<('Ja' | 'Nein' | null)[]>(emptyAnswers);

    useEffect(() => {
        if (open) {
            if (initialData && initialData.length === CHECKLIST_QUESTIONS.length) {
                setAnswers(initialData.map((item) => item.value));
            } else {
                setAnswers([...emptyAnswers]);
            }
        }
    }, [open, initialData]);

    const handleWeiter = () => {
        const data: ChecklisteHalbprobeData = CHECKLIST_QUESTIONS.map((question, index) => ({
            question,
            value: answers[index] ?? 'Ja',
        }));
        onWeiter?.(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'sm:!max-w-2xl max-h-[90vh] overflow-y-auto',
                    'rounded-xl border border-gray-200 bg-white shadow-xl',
                    'p-0 gap-0 [&>button]:right-4 [&>button]:top-4 [&>button]:text-gray-500 [&>button]:hover:text-gray-700'
                )}
            >
                <DialogHeader className="px-6 pt-6 pb-4 text-left">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900">
                        Checkliste Halbprobe
                    </DialogTitle>
                    <DialogDescription asChild>
                        <p className="mt-2 text-sm font-normal leading-snug text-gray-500">
                            Überprüfen Sie während der Anprobe die wichtigsten Punkte zur Stabilität und zum Komfort und notieren Sie eventuelle Änderungswünsche.
                        </p>
                    </DialogDescription>
                </DialogHeader>

                {/* button */}
                <div className="flex flex-wrap items-center gap-3 px-6 pb-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-900"
                        onClick={() => {
                            onApproveMinorRework?.();
                            onOpenChange(false);
                        }}
                    >
                        <ThumbsUp className="h-4 w-4 mr-2 shrink-0" />
                        Kleine Nacharbeit freigeben
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-xl border-amber-300 bg-amber-50/80 text-amber-800 hover:bg-amber-100 hover:border-amber-400 hover:text-amber-900"
                        onClick={() => {
                            onCompletelyNew?.();
                            onOpenChange(false);
                        }}
                    >
                        <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
                        Komplett neu
                    </Button>
                </div>

                <div className="px-6 pb-6">
                    {CHECKLIST_QUESTIONS.map((question, index) => (
                        <div
                            key={index}
                            className={cn(
                                'py-4',
                                index > 0 && 'border-t border-gray-100'
                            )}
                        >
                            <p className="text-sm font-semibold text-gray-900 mb-3">
                                {question}
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <label className="flex cursor-pointer items-center gap-2.5">
                                    <input
                                        type="radio"
                                        name={`checklist-${index}`}
                                        value="Ja"
                                        checked={answers[index] === 'Ja'}
                                        onChange={() => {
                                            setAnswers((prev) => {
                                                const next = [...prev];
                                                next[index] = 'Ja';
                                                return next;
                                            });
                                        }}
                                        className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0 accent-emerald-600"
                                    />
                                    <span className="text-sm font-normal text-gray-700">Ja</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2.5">
                                    <input
                                        type="radio"
                                        name={`checklist-${index}`}
                                        value="Nein"
                                        checked={answers[index] === 'Nein'}
                                        onChange={() => {
                                            setAnswers((prev) => {
                                                const next = [...prev];
                                                next[index] = 'Nein';
                                                return next;
                                            });
                                        }}
                                        className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-0 accent-emerald-600"
                                    />
                                    <span className="text-sm font-normal text-gray-700">
                                        Nein, bitte detailliert angeben
                                    </span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="flex flex-row flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <p className="text-xs text-gray-500">
                        {answers.filter((a) => a !== null).length} von {CHECKLIST_QUESTIONS.length} Punkte beantwortet
                        {answers.every((a) => a !== null) && (
                            <span className="ml-1.5 text-emerald-600 font-medium">· Alle ausgefüllt</span>
                        )}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-lg border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800"
                            onClick={() => onOpenChange(false)}
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm inline-flex items-center gap-2"
                            onClick={handleWeiter}
                        >
                            <Check className="h-4 w-4" />
                            Speichern & Weiter
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-lg border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                            aria-label="Drucken"
                        >
                            <Printer className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

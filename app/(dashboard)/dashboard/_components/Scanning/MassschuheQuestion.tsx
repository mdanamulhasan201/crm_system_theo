"use client";

import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    getMassschuheQuestionWithOption,
    saveMassschuheQuestionWithOptionByCustomerId,
} from "@/apis/customerApis";
import toast from "react-hot-toast";

interface OptionType {
    id: number;
    option: string;
    ownText: string;
    current: boolean;
}

interface QuestionType {
    question: string;
    options: OptionType[];
}

interface SectionType {
    id: number;
    title?: string;
    questions: QuestionType[];
}

interface ApiResponse {
    success: boolean;
    data: SectionType[];
}

export default function MassschuheQuestions({ customer }: { customer: any }) {
    const [sections, setSections] = useState<SectionType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const loadQuestions = async () => {
        if (!customer?.id) return;
        setIsLoading(true);
        try {
            const res: ApiResponse = await getMassschuheQuestionWithOption(customer.id);
            if (res?.success && Array.isArray(res.data)) {
                setSections(res.data);
            } else {
                toast.error("Fragen konnten nicht geladen werden.");
            }
        } catch (error) {
            toast.error("Fehler beim Laden der Fragen.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer?.id]);

    const updateOption = (
        sectionId: number,
        questionIndex: number,
        optionId: number,
        changes: Partial<OptionType>,
        isMultiSelect: boolean
    ) => {
        setHasChanges(true);
        setSections(prev =>
            prev.map(section => {
                if (section.id !== sectionId) return section;

                const questions = [...section.questions];
                const q = questions[questionIndex];
                if (!q) return section;

                const opts = q.options.map(o => {
                    if (o.id !== optionId) {
                        // single select (radio): only one current per question
                        if (!isMultiSelect && changes.current) {
                            return { ...o, current: false };
                        }
                        return o;
                    }

                    if (isMultiSelect && changes.current !== undefined) {
                        // multi select (checkbox): toggle current
                        return { ...o, current: !o.current };
                    }

                    return { ...o, ...changes };
                });

                questions[questionIndex] = { ...q, options: opts };
                return { ...section, questions };
            })
        );
    };

    const renderOptionInput = (
        section: SectionType,
        question: QuestionType,
        questionIndex: number,
        option: OptionType,
        isMultiSelect: boolean
    ) => {
        const label = option.option.toLowerCase();

        const hasOwnTextField =
            label.includes("sonstiges") ||
            label.includes("anderes") ||
            label.includes("andere") ||
            label.includes("_______") ||
            (section.id === 4 && label.includes("kg")) ||
            (section.id === 5 && label.startsWith("ja")) ||
            (section.id === 6 && label.includes("sonstige")) ||
            option.ownText?.trim() !== "";

        if (!hasOwnTextField) return null;

        return (
            <Input
                className="ml-2 max-w-xs h-7 text-xs"
                placeholder="Bitte angeben"
                value={option.ownText || ""}
                onChange={e =>
                    updateOption(
                        section.id,
                        questionIndex,
                        option.id,
                        isMultiSelect ? { ownText: e.target.value } : { ownText: e.target.value, current: true },
                        isMultiSelect
                    )
                }
            />
        );
    };

    const renderQuestionOptions = (section: SectionType, question: QuestionType, questionIndex: number) => {
        // section 7 = multi-select expectations
        const isMultiSelect = section.id === 7;

        return (
            <div className="flex flex-col gap-1.5 text-xs">
                {question.options.map(opt => (
                    <label
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-md px-2 py-1 border ${
                            opt.current
                                ? "border-blue-500 bg-blue-50 text-blue-800"
                                : "border-gray-200 bg-white text-gray-800"
                        }`}
                    >
                        <input
                            type={isMultiSelect ? "checkbox" : "radio"}
                            name={`q-${section.id}-${questionIndex}`}
                            checked={opt.current}
                            onChange={() =>
                                updateOption(
                                    section.id,
                                    questionIndex,
                                    opt.id,
                                    { current: true },
                                    isMultiSelect
                                )
                            }
                            className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-xs">{opt.option}</span>
                        {renderOptionInput(section, question, questionIndex, opt, isMultiSelect)}
                    </label>
                ))}
            </div>
        );
    };

    const buildAnswerPayload = () => {
        const answer: any = {};

        sections.forEach(section => {
            const sectionKey = String(section.id);
            const selectedIds: number[] = [];
            const ownText: Record<string, string> = {};

            section.questions.forEach(q => {
                q.options.forEach(opt => {
                    if (opt.current) {
                        selectedIds.push(opt.id);
                    }
                    if (opt.ownText && opt.ownText.trim() !== "") {
                        ownText[String(opt.id)] = opt.ownText.trim();
                    }
                });
            });

            if (selectedIds.length > 0 || Object.keys(ownText).length > 0) {
                answer[sectionKey] = {
                    id: selectedIds,
                    ownText,
                };
            }
        });

        return { answer };
    };

    const handleSave = async () => {
        if (!customer?.id) return;
        const payload = buildAnswerPayload();
        setIsSaving(true);
        try {
            await saveMassschuheQuestionWithOptionByCustomerId(customer.id, payload);
            toast.success("Antworten erfolgreich gespeichert.");
        } catch (error) {
            toast.error("Fehler beim Speichern der Antworten.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="text-sm">
            <h1 className="text-xl font-semibold mb-3">Kundenspezifische Antworten – Maßschuhe</h1>

            {sections.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500">Keine Fragen gefunden.</p>
            )}

            <div className="space-y-4">
                <Accordion type="single" collapsible className="">
                    {sections.map((section, sectionIndex) => (
                        <AccordionItem key={section.id} value={`section-${section.id}`}>
                            <AccordionTrigger className="px-4 py-2 text-left text-sm">
                                <span className="font-semibold">
                                    {sectionIndex + 1}.{" "}
                                    {section.title || "Fragebereich"}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 pt-0 text-xs">
                                <Accordion type="single" collapsible className="w-full space-y-1.5 mt-2">
                                    {section.questions.map((q, qIndex) => (
                                        <AccordionItem
                                            key={qIndex}
                                            value={`section-${section.id}-q-${qIndex}`}
                                        >
                                            <AccordionTrigger className="text-left text-xs">
                                                <span className="flex-1 text-xs">
                                                    {qIndex + 1}. {q.question}
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="mt-2 ml-7">
                                                    {renderQuestionOptions(section, q, qIndex)}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {hasChanges && (
                    <div className="pt-2">
                        <Button
                            className="w-full"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                        >
                            {isSaving ? "Speichern..." : "Antworten speichern"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

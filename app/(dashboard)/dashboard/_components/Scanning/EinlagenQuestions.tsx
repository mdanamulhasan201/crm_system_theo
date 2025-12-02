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
import { getEinlagenQuestionWithOption, saveEinlagenQuestionWithOptionByCustomerId } from "@/apis/customerApis";
import toast from "react-hot-toast";

interface OptionType {
    id: number;
    option: string;
    ownText: string;
    current: boolean;
}

interface NestedQuestionType {
    id: number;
    question: string;
    options: OptionType[];
}

interface QuestionType {
    question: string;
    // normal question: OptionType[]
    // special pain block (id 4): NestedQuestionType[]
    options: OptionType[] | NestedQuestionType[];
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

export default function EinlagenQuestions({ customer }: { customer: any }) {
    const [sections, setSections] = useState<SectionType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const loadQuestions = async () => {
        if (!customer?.id) return;
        setIsLoading(true);
        try {
            const res: ApiResponse = await getEinlagenQuestionWithOption(customer.id);
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
        optionIds: { nestedQuestionId?: number; optionId: number },
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

                // nested pain block (section id 4)
                if (Array.isArray(q.options) && q.options.length > 0 && "question" in (q.options[0] as any)) {
                    const nestedOptions = (q.options as NestedQuestionType[]).map(nq => {
                        if (nq.id !== optionIds.nestedQuestionId) return nq;
                        const opts = nq.options.map(o => {
                            if (o.id !== optionIds.optionId) {
                                // radio behaviour: only one current = true per nested question
                                if (!isMultiSelect) {
                                    return { ...o, current: false };
                                }
                                return o;
                            }
                            return { ...o, ...changes };
                        });
                        return { ...nq, options: opts };
                    });

                    questions[questionIndex] = { ...q, options: nestedOptions };
                } else {
                    // normal question
                    const opts = (q.options as OptionType[]).map(o => {
                        if (o.id !== optionIds.optionId) {
                            // radio behaviour (single select) – only one current per question
                            if (!isMultiSelect) {
                                return { ...o, current: false };
                            }
                            return o;
                        }
                        // checkbox behaviour (multi select) – toggle current
                        if (isMultiSelect && changes.current !== undefined) {
                            return { ...o, current: !o.current };
                        }
                        return { ...o, ...changes };
                    });

                    questions[questionIndex] = { ...q, options: opts };
                }

                return { ...section, questions };
            })
        );
    };

    const buildAnswerPayload = () => {
        const answer: any = {};

        sections.forEach(section => {
            const sectionKey = String(section.id);

            // special nested pain section (id === 4)
            if (section.id === 4) {
                const nestedBlock: any = {};
                const nestedQuestions = (section.questions[0]?.options || []) as NestedQuestionType[];

                nestedQuestions.forEach(nq => {
                    const selectedIds: number[] = [];
                    const ownText: Record<string, string> = {};

                    nq.options.forEach(opt => {
                        if (opt.current) {
                            selectedIds.push(opt.id);
                            if (opt.ownText && opt.ownText.trim() !== "") {
                                ownText[String(opt.id)] = opt.ownText.trim();
                            }
                        }
                    });

                    if (selectedIds.length > 0 || Object.keys(ownText).length > 0) {
                        nestedBlock[String(nq.id)] = {
                            id: selectedIds,
                            ownText,
                        };
                    }
                });

                if (Object.keys(nestedBlock).length > 0) {
                    answer[sectionKey] = nestedBlock;
                }
            } else {
                const selectedIds: number[] = [];
                const ownText: Record<string, string> = {};

                section.questions.forEach(q => {
                    (q.options as OptionType[]).forEach(opt => {
                        if (opt.current) {
                            selectedIds.push(opt.id);
                            if (opt.ownText && opt.ownText.trim() !== "") {
                                ownText[String(opt.id)] = opt.ownText.trim();
                            }
                        }
                    });
                });

                if (selectedIds.length > 0 || Object.keys(ownText).length > 0) {
                    answer[sectionKey] = {
                        id: selectedIds,
                        ownText,
                    };
                }
            }
        });

        return { answer };
    };

    const handleSave = async () => {
        if (!customer?.id) return;
        const payload = buildAnswerPayload();
        setIsSaving(true);
        try {
            await saveEinlagenQuestionWithOptionByCustomerId(customer.id, payload);
            toast.success("Antworten erfolgreich gespeichert.");
        } catch (error) {
            toast.error("Fehler beim Speichern der Antworten.");
        } finally {
            setIsSaving(false);
        }
    };

    const renderOptionInput = (
        section: SectionType,
        question: QuestionType,
        questionIndex: number,
        option: OptionType,
        isMultiSelect: boolean,
        nestedQuestionId?: number
    ) => {
        const hasOwnTextField =
            option.option.toLowerCase().includes("bitte eingeben") ||
            option.option.toLowerCase().includes("bitte angeben");

        if (!hasOwnTextField) return null;

        return (
            <Input
                className="ml-2 max-w-xs"
                placeholder="Bitte angeben"
                value={option.ownText || ""}
                onChange={e =>
                    updateOption(
                        section.id,
                        questionIndex,
                        { nestedQuestionId, optionId: option.id },
                        // for multi-select (z.B. Frage 7) nur ownText setzen,
                        // current wird über Checkbox gesteuert
                        isMultiSelect
                            ? { ownText: e.target.value }
                            : { ownText: e.target.value, current: true },
                        isMultiSelect
                    )
                }
            />
        );
    };

    const renderQuestionOptions = (section: SectionType, question: QuestionType, questionIndex: number) => {
        // question with id 7 => multiple Auswahl (checkbox)
        const isMultiSelect = section.id === 7;

        // nested pain block (section id 4)
        if (Array.isArray(question.options) && question.options.length > 0 && "question" in (question.options[0] as any)) {
            const nested = question.options as NestedQuestionType[];

            return (
                <Accordion type="multiple" className="w-full space-y-1 text-xs">
                    {nested.map(nq => (
                        <AccordionItem key={nq.id} value={`nested-${section.id}-${nq.id}`}>
                            <AccordionTrigger className="text-left text-sm bg-gray-50 px-3 py-1 rounded-lg hover:bg-blue-100">
                                <span className="font-medium">
                                    {nq.id}. {nq.question}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-3">
                                <div className="pl-4 border-l-2 border-blue-200 flex flex-col gap-2">
                                    {nq.options.map(opt => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 border ${
                                                opt.current
                                                    ? "border-blue-500 bg-blue-50 text-blue-800"
                                                    : "border-gray-200 bg-white text-gray-800"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`nested-${section.id}-${nq.id}`}
                                                checked={opt.current}
                                                onChange={() =>
                                                    updateOption(
                                                        section.id,
                                                        questionIndex,
                                                        { nestedQuestionId: nq.id, optionId: opt.id },
                                                        { current: true },
                                                        false
                                                    )
                                                }
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-xs">{opt.option}</span>
                                            {renderOptionInput(section, question, questionIndex, opt, false, nq.id)}
                                        </label>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            );
        }

        const opts = question.options as OptionType[];

        return (
            <div className="flex flex-col gap-1.5 text-xs">
                {opts.map(opt => (
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
                                    { optionId: opt.id },
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

    return (
        <div className="text-sm">
            <h1 className="text-xl font-semibold mb-3">Kundenspezifische Antworten – Einlagenfinder</h1>

            {sections.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500">Keine Fragen gefunden.</p>
            )}

            <div className="space-y-4">
                <Accordion
                    type="single"
                    collapsible
                    className=""
                >
                    {sections.map((section, sectionIndex) => (
                        <AccordionItem key={section.id} value={`section-${section.id}`}>
                            <AccordionTrigger className="px-4 py-2 text-left text-sm">
                                <span className="font-semibold">
                                    {sectionIndex + 1}.{" "}
                                    {section.title || `Bereich ${section.id}`}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3 pt-0 text-xs">
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full space-y-1.5 mt-2"
                                >
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


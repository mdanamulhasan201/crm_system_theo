"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getAllQuestions, questionController } from "@/apis/questionsApis";
import toast from "react-hot-toast";

interface InsoleQuestion {
    id: number;
    question: string;
    active: boolean;
}

interface ShoeQuestion {
    id: number;
    title?: string;
    question: string;
    active: boolean;
}

interface QuestionsResponse {
    success: boolean;
    data: {
        insoles: InsoleQuestion[];
        shoes: ShoeQuestion[];
    };
}

export default function FragenPage() {
    const [selectedType, setSelectedType] = useState<"insoles" | "shoes">("insoles");
    const [insoles, setInsoles] = useState<InsoleQuestion[]>([]);
    const [shoes, setShoes] = useState<ShoeQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingId, setPendingId] = useState<number | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const res = (await getAllQuestions()) as QuestionsResponse;
                if (res?.success && res.data) {
                    setInsoles(res.data.insoles || []);
                    setShoes(res.data.shoes || []);
                }
            } finally {
                setIsLoading(false);
            }
        };
        void load();
    }, []);

    const currentList = selectedType === "insoles" ? insoles : shoes;

    const handleToggle = async (questionId: number, nextActive: boolean) => {
        if (isSaving) return;
        setIsSaving(true);
        setPendingId(questionId);

        try {
            if (selectedType === "insoles") {
                const prev = insoles;
                const updated = prev.map(q =>
                    q.id === questionId ? { ...q, active: nextActive } : q
                );
                setInsoles(updated);

                const activeIds = updated.filter(q => q.active).map(q => q.id);
                await questionController({ controlInsolesQuestions: activeIds });
            } else {
                const prev = shoes;
                const updated = prev.map(q =>
                    q.id === questionId ? { ...q, active: nextActive } : q
                );
                setShoes(updated);

                const activeIds = updated.filter(q => q.active).map(q => q.id);
                await questionController({ controlShoeQuestions: activeIds });
            }
            toast.success("Fragen-Einstellungen aktualisiert.");
        } catch (error) {
            toast.error("Fehler beim Aktualisieren der Fragen.");

            // Reload from server to be safe
            try {
                const res = (await getAllQuestions()) as QuestionsResponse;
                if (res?.success && res.data) {
                    setInsoles(res.data.insoles || []);
                    setShoes(res.data.shoes || []);
                }
            } catch {
                // ignore
            }
        } finally {
            setIsSaving(false);
            setPendingId(null);
        }
    };

    return (
        <div className=" mt-10 font-sans">
            <h1 className="text-3xl font-semibold mb-2">Fragen</h1>
            <p className="mb-6 text-sm text-gray-600">
                Übersicht aller Fragen für Einlagen- und Maßschuh-Versorgung.
            </p>

            <div className="flex gap-3 mb-6">
                <Button
                    type="button"
                    onClick={() => setSelectedType("insoles")}
                    className={`px-6 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-colors ${
                        selectedType === "insoles"
                            ? "bg-[#62A17C] text-white hover:bg-[#4A8A5F]"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    Einlagen
                </Button>
                <Button
                    type="button"
                    onClick={() => setSelectedType("shoes")}
                    className={`px-6 py-2 cursor-pointer rounded-lg text-sm font-semibold transition-colors ${
                        selectedType === "shoes"
                            ? "bg-[#62A17C] text-white hover:bg-[#4A8A5F]"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    Massschuhe
                </Button>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4">
                    {selectedType === "insoles"
                        ? "Fragen für Einlagen-Versorgung"
                        : "Fragen für Maßschuh-Versorgung"}
                </h2>

                {isLoading && (
                    <p className="text-sm text-gray-500">Fragen werden geladen...</p>
                )}

                {!isLoading && currentList.length === 0 && (
                    <p className="text-sm text-gray-500">Keine Fragen gefunden.</p>
                )}

                {!isLoading && currentList.length > 0 && (
                    <div className="space-y-3">
                        {currentList.map((q, index) => (
                            <div
                                key={`${selectedType}-${q.id}`}
                                className="flex items-center justify-between border-b last:border-b-0 pb-2"
                            >
                                <div className="pr-4">
                                    <p className="text-sm font-medium text-gray-900">
                                        {index + 1}.{" "}
                                        {selectedType === "shoes" && "title" in q && q.title
                                            ? `${(q as ShoeQuestion).title} – ${q.question}`
                                            : q.question}
                                    </p>
                                </div>
                                <Switch
                                    checked={q.active}
                                    disabled={isSaving && pendingId === q.id}
                                    onCheckedChange={(checked) => handleToggle(q.id, checked)}
                                    className="scale-90"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

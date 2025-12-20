"use client";

import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

interface SettingOption {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

const DEFAULT_SETTINGS: SettingOption[] = [
    {
        id: "pelottenposition",
        title: "Pelottenposition automatisch berechnen",
        description: "Berechnet beim Erstellen automatisch die Pelottenposition",
        enabled: false,
    },
    {
        id: "fertigung-senden",
        title: "Auftrag nach Erstellung direkt in die Fertigung senden",
        description: "Markiert neue Aufträge automatisch als \"In Produktion\"",
        enabled: false,
    },
    {
        id: "fußscans-drucken",
        title: "Fußscans automatisch mit ausdrucken",
        description: "Fügt Fußscan-Bilder dem Auftragszettel hinzu",
        enabled: false,
    },
    {
        id: "messpunkte-drucken",
        title: "Messpunkte 10 und 11 mit ausdrucken",
        description: "Erweitert den Auftragszettel um die zusätzlichen Messpunkte",
        enabled: false,
    },
    {
        id: "kundeninformationen",
        title: "Kundeninformationen automatisch hinzufügen",
        description: "Fügt automatisch alle relevanten Kundeninformationen zum Auftragszettel hinzu",
        enabled: false,
    },
    {
        id: "liefertermin",
        title: "Liefertermin automatisch berechnen",
        description: "Berechnet automatisch den voraussichtlichen Liefertermin basierend auf Produktionszeit",
        enabled: false,
    },
];

export default function Einstellungen() {
    const [settings, setSettings] = useState<SettingOption[]>(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingId, setPendingId] = useState<string | null>(null);

    const handleToggle = async (settingId: string, nextEnabled: boolean) => {
        if (isSaving) return;
        setIsSaving(true);
        setPendingId(settingId);

        try {
            const updated = settings.map(s =>
                s.id === settingId ? { ...s, enabled: nextEnabled } : s
            );
            setSettings(updated);

            // TODO: Add API call here when backend is ready
            // await updateOrderSlipSettings({ [settingId]: nextEnabled });

            toast.success("Einstellung aktualisiert.");
        } catch (error) {
            toast.error("Fehler beim Aktualisieren der Einstellung.");
            // Revert on error
            setSettings(settings);
        } finally {
            setIsSaving(false);
            setPendingId(null);
        }
    };

    return (
        <div className="w-full font-sans">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold mb-2 text-gray-900">
                    Globale Optionen für Auftragszettel
                </h1>
                <p className="text-sm text-gray-600">
                    Definieren Sie das Standardverhalten bei der Erstellung von Auftragszetteln
                </p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 sm:p-5 md:p-6">
                    <ul className="space-y-4 sm:space-y-5 md:space-y-6">
                        {settings.map((setting) => (
                            <li
                                key={setting.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 md:pb-6 last:pb-0 border-b last:border-b-0 border-gray-200"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 wrap-break-word">
                                        {setting.title}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 wrap-break-word">
                                        {setting.description}
                                    </p>
                                </div>
                                <div className="shrink-0 sm:ml-4">
                                    <Switch
                                        checked={setting.enabled}
                                        disabled={isSaving && pendingId === setting.id}
                                        onCheckedChange={(checked) => handleToggle(setting.id, checked)}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

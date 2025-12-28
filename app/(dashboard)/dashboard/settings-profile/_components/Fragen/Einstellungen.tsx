"use client";

import React, { useState, useEffect } from 'react';
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { getAuftragszettel, createAuftragszettel } from '@/apis/auftragszettelApis';

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

// Map setting IDs to API field names
const SETTING_TO_API_FIELD: Record<string, string> = {
    "pelottenposition": "autoCalcPelottePos",
    "fertigung-senden": "autoSendToProd",
    "fußscans-drucken": "printFootScans",
    "messpunkte-drucken": "showMeasPoints10_11",
    // "kundeninformationen" and "liefertermin" are not in API, will be handled separately
};

// Map API field names to setting IDs
const API_FIELD_TO_SETTING: Record<string, string> = {
    "autoCalcPelottePos": "pelottenposition",
    "autoSendToProd": "fertigung-senden",
    "printFootScans": "fußscans-drucken",
    "showMeasPoints10_11": "messpunkte-drucken",
    "attachFootScans": "fußscans-drucken", // Alternative field name
    "showMeasPoints10_11_Det": "messpunkte-drucken", // Alternative field name
};

export default function Einstellungen() {
    const [settings, setSettings] = useState<SettingOption[]>(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingId, setPendingId] = useState<string | null>(null);

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const response = await getAuftragszettel();
                
                if (response?.success && response?.data) {
                    const apiData = response.data;
                    
                    // Update settings based on API response
                    setSettings(prevSettings => 
                        prevSettings.map(setting => {
                            const apiField = SETTING_TO_API_FIELD[setting.id];
                            if (apiField && apiData.hasOwnProperty(apiField)) {
                                return { ...setting, enabled: apiData[apiField] };
                            }
                            return setting;
                        })
                    );
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                toast.error("Fehler beim Laden der Einstellungen.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleToggle = async (settingId: string, nextEnabled: boolean) => {
        if (isSaving) return;
        
        // Check if this setting is mapped to an API field
        const apiField = SETTING_TO_API_FIELD[settingId];
        if (!apiField) {
            // Settings not in API (kundeninformationen, liefertermin) - just update locally
            const updated = settings.map(s =>
                s.id === settingId ? { ...s, enabled: nextEnabled } : s
            );
            setSettings(updated);
            toast.success("Einstellung aktualisiert.");
            return;
        }

        setIsSaving(true);
        setPendingId(settingId);

        // Optimistically update UI
        const previousSettings = settings;
        const updated = settings.map(s =>
            s.id === settingId ? { ...s, enabled: nextEnabled } : s
        );
        setSettings(updated);

        try {
            // Build request body with all current settings
            const requestBody: any = {};
            
            // Get all settings that map to API fields
            updated.forEach(setting => {
                const field = SETTING_TO_API_FIELD[setting.id];
                if (field) {
                    requestBody[field] = setting.enabled;
                }
            });

            const response = await createAuftragszettel(requestBody);
            
            if (response?.success) {
                toast.success("Einstellung aktualisiert.");
            } else {
                throw new Error(response?.message || "Update failed");
            }
        } catch (error: any) {
            console.error('Failed to update settings:', error);
            toast.error(error?.response?.data?.message || "Fehler beim Aktualisieren der Einstellung.");
            // Revert on error
            setSettings(previousSettings);
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
                    {isLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}

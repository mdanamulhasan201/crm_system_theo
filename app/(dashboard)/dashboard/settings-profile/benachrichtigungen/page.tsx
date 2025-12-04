'use client';

import React, { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Benachrichtigungen() {
    const [email, setEmail] = useState("");
    const [frequency, setFrequency] = useState("daily");
    const [enabled, setEnabled] = useState(true);

    return (
        <div className="max-w-3xl mx-auto mt-10 font-sans">
            <h1 className="text-4xl font-bold mb-2">Benachrichtigungseinstellungen</h1>
            <p className="mb-8">
                Verwalten Sie hier, wie und wann Sie Benachrichtigungen aus dem System erhalten möchten.
            </p>

            {/* Empfänger */}
            <div className="mb-6">
                <label className="font-semibold text-lg block mb-2">
                    Empfänger-E-Mail
                </label>
                <Input
                    type="email"
                    placeholder="z.B. info@meinbetrieb.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-600"
                />
            </div>

            {/* Häufigkeit */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="font-medium min-w-[180px]">
                    Benachrichtigungshäufigkeit
                </span>
                <div className="min-w-[220px]">
                    <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="instant">Sofort bei Ereignis</SelectItem>
                            <SelectItem value="hourly">Stündliche Zusammenfassung</SelectItem>
                            <SelectItem value="daily">Tägliche Zusammenfassung</SelectItem>
                            <SelectItem value="weekly">Wöchentliche Zusammenfassung</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Aktivieren / deaktivieren */}
            <div className="mb-8">
                <div className="font-semibold text-base mb-3">
                    Benachrichtigungen aktivieren
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                    <Checkbox
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                    />
                    <span>
                        Ich möchte Systembenachrichtigungen für Bestände, Aufträge und wichtige
                        Ereignisse erhalten.
                    </span>
                </label>
            </div>

            <Button type="button" className="w-full mt-8 cursor-pointer">
                Speichern
            </Button>
        </div>
    );
}

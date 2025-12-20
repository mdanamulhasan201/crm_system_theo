"use client";

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface LocationEmployee {
    locationId: string;
    locationName: string;
    employeeId: string | null;
}

export default function AutomatischePage() {
    // Section 1: Abholung (Pickup)
    const [pickupOption, setPickupOption] = useState<string>("order-creator");
    const [locationEmployees, setLocationEmployees] = useState<LocationEmployee[]>([
        { locationId: "berlin", locationName: "Standort Berlin", employeeId: null },
        { locationId: "munich", locationName: "Standort München", employeeId: null },
        { locationId: "hamburg", locationName: "Standort Hamburg", employeeId: null },
    ]);

    // Section 2: KV (Cash Order)
    const [kvOption, setKvOption] = useState<string>("fixed-employee");
    const [kvEmployeeId, setKvEmployeeId] = useState<string | null>(null);

    // Mock employee data - replace with actual API call
    const employees = [
        { id: "1", name: "Max Mustermann" },
        { id: "2", name: "Anna Schmidt" },
        { id: "3", name: "Peter Müller" },
        { id: "4", name: "Lisa Weber" },
    ];

    const handleLocationEmployeeChange = (locationId: string, employeeId: string) => {
        setLocationEmployees(prev =>
            prev.map(loc =>
                loc.locationId === locationId ? { ...loc, employeeId } : loc
            )
        );
    };

    const handleSave = async () => {
        try {
            // TODO: Add API call here when backend is ready
            // await saveAutomaticAssignmentSettings({
            //     pickup: {
            //         option: pickupOption,
            //         locationEmployees: locationEmployees,
            //     },
            //     kv: {
            //         option: kvOption,
            //         employeeId: kvEmployeeId,
            //     },
            // });
            toast.success("Einstellungen gespeichert.");
        } catch (error) {
            toast.error("Fehler beim Speichern der Einstellungen.");
        }
    };

    return (
        <div className="w-full font-sans space-y-8">
            {/* Section 1: Automatische Zuweisung bei Abholung */}
            <div>
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold mb-2 text-gray-900">
                        Automatische Zuweisung bei Abholung
                    </h1>
                    <p className="text-sm text-gray-600">
                        Legt fest welcher Mitarbeiter automatisch im Terminkalender eingetragen wird, wenn ein Auftrag als „Abholung" markiert wird.
                    </p>
                </div>

                <div className="bg-white border rounded-lg shadow-sm">
                    <div className="p-4 sm:p-5 md:p-6">
                        <div className="space-y-6" role="radiogroup">
                            {/* Option 1 */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="relative inline-flex items-center justify-center h-4 w-4 mt-1">
                                        <input
                                            type="radio"
                                            id="pickup-1"
                                            name="pickup-option"
                                            value="order-creator"
                                            checked={pickupOption === "order-creator"}
                                            onChange={(e) => setPickupOption(e.target.value)}
                                            className={cn(
                                                "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition-all",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                pickupOption === "order-creator" && "border-primary"
                                            )}
                                        />
                                        {pickupOption === "order-creator" && (
                                            <span 
                                                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary pointer-events-none"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="pickup-1" className="text-sm sm:text-base font-medium text-gray-900 cursor-pointer">
                                            Auftragsersteller übernimmt die Abholung
                                        </Label>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Der Mitarbeiter, der den Auftrag erstellt hat, wird automatisch für die Abholung eingeteilt.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Option 2 */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="relative inline-flex items-center justify-center h-4 w-4 mt-1">
                                        <input
                                            type="radio"
                                            id="pickup-2"
                                            name="pickup-option"
                                            value="fixed-per-location"
                                            checked={pickupOption === "fixed-per-location"}
                                            onChange={(e) => setPickupOption(e.target.value)}
                                            className={cn(
                                                "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition-all",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                pickupOption === "fixed-per-location" && "border-primary"
                                            )}
                                        />
                                        {pickupOption === "fixed-per-location" && (
                                            <span 
                                                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary pointer-events-none"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="pickup-2" className="text-sm sm:text-base font-medium text-gray-900 cursor-pointer">
                                            Fester Mitarbeiter pro Standort
                                        </Label>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-4">
                                            Legen Sie für den Standort einen festen Mitarbeiter fest, der alle Abholungen übernimmt.
                                        </p>
                                        {pickupOption === "fixed-per-location" && (
                                            <div className="space-y-4 mt-4 pl-0 sm:pl-4">
                                                {locationEmployees.map((location) => (
                                                    <div key={location.locationId} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                        <Label className="text-sm text-gray-700 min-w-[140px] sm:min-w-[160px]">
                                                            {location.locationName}
                                                        </Label>
                                                        <Select
                                                            value={location.employeeId || ""}
                                                            onValueChange={(value) => handleLocationEmployeeChange(location.locationId, value)}
                                                        >
                                                            <SelectTrigger className="w-full sm:w-[250px]">
                                                                <SelectValue placeholder="Mitarbeiter auswählen" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {employees.map((employee) => (
                                                                    <SelectItem key={employee.id} value={employee.id}>
                                                                        {employee.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Option 3 */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="relative inline-flex items-center justify-center h-4 w-4 mt-1">
                                        <input
                                            type="radio"
                                            id="pickup-3"
                                            name="pickup-option"
                                            value="manual"
                                            checked={pickupOption === "manual"}
                                            onChange={(e) => setPickupOption(e.target.value)}
                                            className={cn(
                                                "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition-all",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                pickupOption === "manual" && "border-primary"
                                            )}
                                        />
                                        {pickupOption === "manual" && (
                                            <span 
                                                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary pointer-events-none"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="pickup-3" className="text-sm sm:text-base font-medium text-gray-900 cursor-pointer">
                                            Mitarbeiter manuell auswählen
                                        </Label>
                                        <p className="text-xs sm:text-sm text-gray-500">
                                            Es erfolgt keine automatische Zuweisung. Der Mitarbeiter muss bei jedem Auftrag manuell ausgewählt werden.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Automatische Zuweisung für Kassenverordnung (KV) */}
            <div>
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold mb-2 text-gray-900">
                        Automatische Zuweisung für Kassenverordnung (KV)
                    </h1>
                    <p className="text-sm text-gray-600">
                        Die Software erstellt abhängig von dieser Einstellung automatisch passende Aufgaben und weist sie dem entsprechenden Mitarbeiter oder Team zu.
                    </p>
                </div>

                <div className="bg-white border rounded-lg shadow-sm">
                    <div className="p-4 sm:p-5 md:p-6">
                        <div className="space-y-6" role="radiogroup">
                            {/* Option 1 */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="relative inline-flex items-center justify-center h-4 w-4 mt-1">
                                        <input
                                            type="radio"
                                            id="kv-1"
                                            name="kv-option"
                                            value="fixed-employee"
                                            checked={kvOption === "fixed-employee"}
                                            onChange={(e) => setKvOption(e.target.value)}
                                            className={cn(
                                                "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition-all",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                kvOption === "fixed-employee" && "border-primary"
                                            )}
                                        />
                                        {kvOption === "fixed-employee" && (
                                            <span 
                                                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary pointer-events-none"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="kv-1" className="text-sm sm:text-base font-medium text-gray-900 cursor-pointer">
                                            Fester Mitarbeiter für KV-Erstellungen
                                        </Label>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-4">
                                            Alle KV-Aufträge werden automatisch einem festgelegten Mitarbeiter zugewiesen.
                                        </p>
                                        {kvOption === "fixed-employee" && (
                                            <div className="mt-4 pl-0 sm:pl-4">
                                                <Select
                                                    value={kvEmployeeId || ""}
                                                    onValueChange={setKvEmployeeId}
                                                >
                                                    <SelectTrigger className="w-full sm:w-[250px]">
                                                        <SelectValue placeholder="Mitarbeiter auswählen" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {employees.map((employee) => (
                                                            <SelectItem key={employee.id} value={employee.id}>
                                                                {employee.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Option 2 */}
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <div className="relative inline-flex items-center justify-center h-4 w-4 mt-1">
                                        <input
                                            type="radio"
                                            id="kv-2"
                                            name="kv-option"
                                            value="order-creator-kv"
                                            checked={kvOption === "order-creator-kv"}
                                            onChange={(e) => setKvOption(e.target.value)}
                                            className={cn(
                                                "h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition-all",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                                kvOption === "order-creator-kv" && "border-primary"
                                            )}
                                        />
                                        {kvOption === "order-creator-kv" && (
                                            <span 
                                                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary pointer-events-none"
                                                style={{ borderRadius: '50%' }}
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label htmlFor="kv-2" className="text-sm sm:text-base font-medium text-gray-900 cursor-pointer">
                                            Auftragsersteller nimmt den KV-Auftrag
                                        </Label>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                            Der Mitarbeiter, der den Auftrag erstellt hat, ist automatisch für die KV-Erstellung verantwortlich.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

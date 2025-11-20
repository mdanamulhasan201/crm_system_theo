import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { useCreateMassschuhe } from '@/hooks/massschuhe/useCreateMassschuhe';
import { ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';


interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
}

interface MassschuheFormProps {
    customer?: Customer;
    onCustomerUpdate?: (updatedCustomer: Customer) => void;
    onDataRefresh?: () => void;
}

export default function MassschuheForm({ customer, onCustomerUpdate, onDataRefresh }: MassschuheFormProps) {
    // Form state
    const [ärztlicheDiagnose, setÄrztlicheDiagnose] = useState<string>('');
    const [ausführlicheDiagnose, setAusführlicheDiagnose] = useState<string>('');
    const [rezeptnummer, setRezeptnummer] = useState<string>('');
    const [versorgungNote, setVersorgungNote] = useState<string>('');
    const [halbprobeGeplant, setHalbprobeGeplant] = useState<boolean | null>(null);
    const [kostenvoranschlag, setKostenvoranschlag] = useState<boolean | null>(null);

    // Employee search
    const {
        searchText,
        suggestions: employeeSuggestions,
        loading: employeeLoading,
        setShowSuggestions,
        handleChange: handleEmployeeSearchChange,
    } = useSearchEmployee();
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    // Massschuhe hook
    const { createMassschuhe, isLoading } = useCreateMassschuhe();

    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<any>(null);





    // Handle employee selection
    const handleEmployeeSelect = (employee: { employeeName: string; id: string }) => {
        setSelectedEmployee(employee.employeeName);
        setSelectedEmployeeId(employee.id);
        setIsEmployeeDropdownOpen(false);
    };

    const handleEmployeeDropdownChange = (open: boolean) => {
        setIsEmployeeDropdownOpen(open);
        setShowSuggestions(open);
    };

    // Handle form submission - Show confirmation modal
    const handleSubmit = () => {
        // Validation
        if (!customer?.id) {
            toast.error('Kunde-ID fehlt');
            return;
        }

        if (!selectedEmployeeId) {
            toast.error('Bitte wählen Sie einen Mitarbeiter aus');
            return;
        }

        if (!ärztlicheDiagnose.trim()) {
            toast.error('Bitte geben Sie eine ärztliche Diagnose ein');
            return;
        }

        // Prepare data for API
        const formData = {
            customerId: customer.id,
            employeeId: selectedEmployeeId,
            arztliche_diagnose: ärztlicheDiagnose,
            usführliche_diagnose: ausführlicheDiagnose,
            rezeptnummer: rezeptnummer,
            durchgeführt_von: selectedEmployee,
            note: versorgungNote,
            halbprobe_geplant: halbprobeGeplant === true,
            kostenvoranschlag: kostenvoranschlag === true,
        };

        // Store form data and show confirmation modal
        setPendingFormData(formData);
        setShowConfirmModal(true);
    };

    // Confirm and submit to API
    const confirmSubmit = async () => {
        if (!pendingFormData) return;

        // Submit to API
        const result = await createMassschuhe(pendingFormData);

        if (result.success) {
            // Close modal
            setShowConfirmModal(false);
            setPendingFormData(null);

            // Reset form
            setÄrztlicheDiagnose('');
            setAusführlicheDiagnose('');
            setRezeptnummer('');
            setVersorgungNote('');
            setHalbprobeGeplant(null);
            setKostenvoranschlag(null);
            setSelectedEmployee('');
            setSelectedEmployeeId('');

            // Refresh data if callback provided
            if (onDataRefresh) {
                onDataRefresh();
            }
        }
    };

    // Cancel confirmation
    const cancelSubmit = () => {
        setShowConfirmModal(false);
        setPendingFormData(null);
    };


    return (
        <div>
            <div className='mt-10'>
                {/* Two text areas for diagnosis */}
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
                    {/* Ärztliche Diagnose */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Ärztliche Diagnose</h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={ärztlicheDiagnose}
                                onChange={(e) => setÄrztlicheDiagnose(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Textfeld..."
                            />
                        </div>
                    </div>

                    {/* Ausführliche Diagnose */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Ausführliche Diagnose</h3>
                        </div>
                        <div className="relative">
                            <textarea
                                value={ausführlicheDiagnose}
                                onChange={(e) => setAusführlicheDiagnose(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Textfeld..."
                            />
                        </div>
                    </div>
                </div>

                {/* Rezeptnummer and Durchgeführt von */}
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
                    {/* Rezeptnummer */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Rezeptnummer</h3>
                        </div>
                        <Input
                            type="text"
                            placeholder="Rezeptnummer eingeben"
                            value={rezeptnummer}
                            onChange={(e) => setRezeptnummer(e.target.value)}
                        />
                    </div>

                    {/* Durchgeführt von */}
                    <div className="w-full xl:w-1/2">
                        <div className="mb-2">
                            <h3 className="text-sm font-semibold">Durchgeführt von:</h3>
                        </div>
                        <div className="relative">
                            <Popover open={isEmployeeDropdownOpen} onOpenChange={handleEmployeeDropdownChange}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isEmployeeDropdownOpen}
                                        className="w-full justify-between font-normal min-h-[44px]"
                                    >
                                        <span className={`truncate ${selectedEmployee ? '' : 'text-gray-400'}`}>
                                            {selectedEmployee || "Auswählen"}
                                        </span>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                    <div className="p-2">
                                        <Input
                                            placeholder="Mitarbeiter suchen..."
                                            value={searchText}
                                            onChange={(e) => handleEmployeeSearchChange(e.target.value)}
                                            className="w-full"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {employeeLoading ? (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                Lade Mitarbeiter...
                                            </div>
                                        ) : employeeSuggestions.length > 0 ? (
                                            <div className="py-1">
                                                {employeeSuggestions.map((employee) => (
                                                    <div
                                                        key={employee.id}
                                                        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${selectedEmployee === employee.employeeName
                                                            ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                                                            : 'hover:bg-gray-100'
                                                            }`}
                                                        onClick={() => handleEmployeeSelect({ employeeName: employee.employeeName, id: employee.id })}
                                                    >
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <span className={`text-sm font-medium truncate ${selectedEmployee === employee.employeeName
                                                                ? 'text-blue-900'
                                                                : 'text-gray-900'
                                                                }`}>
                                                                {employee.employeeName}
                                                            </span>
                                                            {employee.email && (
                                                                <span className={`text-xs truncate ${selectedEmployee === employee.employeeName
                                                                    ? 'text-blue-600'
                                                                    : 'text-gray-500'
                                                                    }`}>
                                                                    {employee.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {selectedEmployee === employee.employeeName && (
                                                            <Check className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                Keine Mitarbeiter gefunden
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Versorgung Note */}
                <div className="mb-10 w-full">
                    <div className="mb-2">
                        <h3 className="text-sm font-semibold">Notizen zur Versorgung</h3>
                    </div>
                    <textarea
                        value={versorgungNote}
                        onChange={(e) => setVersorgungNote(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Hast du sonstige Anmerkungen oder Notizen zur Versorgung..."
                    />
                </div>

                {/* Radio Button Sections */}
                <div className="flex flex-col  gap-6 mb-10 w-full">
                    {/* Halbprobe Geplant */}
                    <div className="w-full">
                        <div className="flex items-center gap-10 pb-2 border-b border-gray-300">
                            <h3 className="text-lg font-semibold">Halbprobe Geplant?</h3>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="halbprobeGeplant"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={halbprobeGeplant === true}
                                        onChange={() => setHalbprobeGeplant(true)}
                                    />
                                    <span className="text-sm">Ja</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="halbprobeGeplant"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={halbprobeGeplant === false}
                                        onChange={() => setHalbprobeGeplant(false)}
                                    />
                                    <span className="text-sm">Nein</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Kostenvoranschlag */}
                    <div className="w-full mt-5">
                        <div className="flex items-center gap-10 pb-2 border-b border-gray-300">
                            <h3 className="text-lg font-semibold">Kostenvoranschlag</h3>
                            <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="kostenvoranschlag"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={kostenvoranschlag === true}
                                        onChange={() => setKostenvoranschlag(true)}
                                    />
                                    <span className="text-sm">Ja</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="kostenvoranschlag"
                                        className="w-5 h-5 cursor-pointer"
                                        checked={kostenvoranschlag === false}
                                        onChange={() => setKostenvoranschlag(false)}
                                    />
                                    <span className="text-sm">Nein</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Speichern Button */}
                <div className="flex justify-center my-10">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-black cursor-pointer transform duration-300 text-white rounded-full px-12 py-2 text-sm font-semibold focus:outline-none hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Speichern...
                            </>
                        ) : (
                            'Speichern'
                        )}
                    </Button>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Bestellung bestätigen</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-gray-700 mb-4">
                            Möchten Sie diese Massschuhe-Bestellung wirklich absenden?
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-semibold">Kunde:</span>
                                <span>{customer?.vorname} {customer?.nachname}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Mitarbeiter:</span>
                                <span>{selectedEmployee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Diagnose:</span>
                                <span className="truncate ml-2">{ärztlicheDiagnose}</span>
                            </div>
                            {rezeptnummer && (
                                <div className="flex justify-between">
                                    <span className="font-semibold">Rezeptnummer:</span>
                                    <span>{rezeptnummer}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelSubmit}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmSubmit}
                            disabled={isLoading}
                            className="flex-1 bg-[#62A07C] hover:bg-[#62a07c98]"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Wird gespeichert...
                                </>
                            ) : (
                                'Bestätigen'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}


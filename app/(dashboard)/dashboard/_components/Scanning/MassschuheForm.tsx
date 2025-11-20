import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { ChevronDown, Check } from 'lucide-react';
import UserInfoUpdateModal from './UserInfoUpdateModal';
import { ScanData } from '@/types/scan';
import OrderConfirmationModal from './OrderConfirmationModal';
import { useCreateOrder } from '@/hooks/orders/useCreateOrder';
import InvoiceGeneratePdfModal from '../PdfModal/InvoiceGeneratePdf/InvoiceGeneratePdfModal';

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

    // Modals
    const [showUserInfoUpdateModal, setShowUserInfoUpdateModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formDataForOrder, setFormDataForOrder] = useState<any>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | undefined>(undefined);

    const { createOrderAndGeneratePdf, isCreating } = useCreateOrder();

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

    // Collect form data
    const collectFormData = () => {
        return {
            ärztliche_diagnose: ärztlicheDiagnose || '',
            ausführliche_diagnose: ausführlicheDiagnose || '',
            rezeptnummer: rezeptnummer || '',
            versorgung_note: versorgungNote || '',
            halbprobe_geplant: halbprobeGeplant === true,
            kostenvoranschlag: kostenvoranschlag === true,
            employeeName: selectedEmployee || '',
            employeeId: selectedEmployeeId || '',
        };
    };

    const handleSpeichernClick = () => {
        const formData = collectFormData();
        setFormDataForOrder(formData);
        setShowUserInfoUpdateModal(true);
    };

    const handleConfirmOrder = async () => {
        const werkstattzettelId = typeof window !== 'undefined' ? localStorage.getItem('werkstattzettelId') || undefined : undefined;

        if (customer?.id && formDataForOrder) {
            try {
                // Exclude employee fields from payload
                const { employeeName, employeeId, ...formFields } = formDataForOrder;

                const orderPayload = {
                    customerId: customer.id,
                    werkstattzettelId: werkstattzettelId,
                    ...formFields
                };

                // For Massschuhe, we don't have versorgungId, so we'll use empty string
                // Create order with form data
                const result = await createOrderAndGeneratePdf(customer.id, '', false, orderPayload);
                const orderId = (result as any)?.data?.id ?? (result as any)?.id ?? result?.orderId;
                if (orderId) {
                    setCurrentOrderId(orderId);
                    setShowPdfModal(true);
                }
            } catch (error) {
                // Error toast is already handled inside useCreateOrder.createOrderAndGeneratePdf
            }
        }
        setShowConfirmModal(false);
    };

    const handleClosePdfModal = () => {
        setShowPdfModal(false);
        setCurrentOrderId(undefined);
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
                        className="bg-black cursor-pointer transform duration-300 text-white rounded-full px-12 py-2 text-sm font-semibold focus:outline-none hover:bg-gray-800 transition-colors flex items-center justify-center min-w-[160px]"
                        onClick={handleSpeichernClick}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Speichern...' : 'Speichern'}
                    </Button>
                </div>
            </div>

            {/* User Info Update Modal */}
            <UserInfoUpdateModal
                isOpen={showUserInfoUpdateModal}
                onOpenChange={setShowUserInfoUpdateModal}
                scanData={customer as ScanData}
                formData={formDataForOrder}
                onInfoUpdate={() => {
                    onDataRefresh?.()
                }}
                onShowOrderConfirmation={(formData) => {
                    setFormDataForOrder(formData || formDataForOrder);
                    setShowConfirmModal(true);
                }}
            />

            {/* Order Confirmation Modal */}
            <OrderConfirmationModal
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
                handleConfirmOrder={handleConfirmOrder}
                isCreating={isCreating}
                formData={formDataForOrder}
                customerId={customer?.id}
                versorgungId={undefined}
            />

            {/* PDF Generation Modal */}
            <InvoiceGeneratePdfModal
                isOpen={showPdfModal}
                onClose={handleClosePdfModal}
                orderId={currentOrderId}
            />
        </div>
    );
}


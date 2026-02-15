'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import { ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getTaxRatesByCountry } from '@/utils/taxRates';
import SonstigesOrderModal from './SonstigesOrderModal';

interface Customer {
    id: string;
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    telefonnummer?: string;
    wohnort?: string;
}

interface SonstigesFormProps {
    customer?: Customer;
    onCustomerUpdate?: (updatedCustomer: Customer) => void;
    onDataRefresh?: () => void;
}

export default function SonstigesForm({ customer, onCustomerUpdate, onDataRefresh }: SonstigesFormProps) {
    const { user } = useAuth();
    const vatCountry = user?.accountInfo?.vat_country;
    
    // Get tax rates based on country
    const taxRates = getTaxRatesByCountry(vatCountry);
    const defaultTaxRate = useMemo(() => {
        return taxRates?.find(rate => rate.isDefault) || { rate: 22, name: 'Standard', description: 'Standard' };
    }, [taxRates]);
    
    // Form state
    const [leistungsname, setLeistungsname] = useState<string>('');
    const [kategorie, setKategorie] = useState<string>('');
    const [menge, setMenge] = useState<string>('1');
    const [nettoPreis, setNettoPreis] = useState<string>('0.00');
    const [rabatt, setRabatt] = useState<string>('0');
    const [steuersatz, setSteuersatz] = useState<number>(defaultTaxRate.rate);
    const [isNetto, setIsNetto] = useState<boolean>(true); // true = Preis ist Netto, false = Preis ist Brutto
    const [leistungsnotiz, setLeistungsnotiz] = useState<string>('');

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

    // Modal state
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [formDataForModal, setFormDataForModal] = useState<any>(null);

    // Update tax rate when country changes
    useEffect(() => {
        if (defaultTaxRate?.rate) {
            setSteuersatz(defaultTaxRate.rate);
        }
    }, [vatCountry, defaultTaxRate]);

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

    // Price calculations
    const priceCalculations = useMemo(() => {
        const priceInput = parseFloat(nettoPreis) || 0;
        const discountPercent = parseFloat(rabatt) || 0;
        const taxRate = steuersatz / 100;

        // Calculate price after discount
        const priceAfterDiscount = priceInput * (1 - discountPercent / 100);

        let netto, mwst, brutto;

        if (isNetto) {
            // Price input is Netto
            netto = priceAfterDiscount;
            mwst = netto * taxRate;
            brutto = netto + mwst;
        } else {
            // Price input is Brutto
            brutto = priceAfterDiscount;
            netto = brutto / (1 + taxRate);
            mwst = brutto - netto;
        }

        return {
            netto: Math.round(netto * 100) / 100,
            mwst: Math.round(mwst * 100) / 100,
            brutto: Math.round(brutto * 100) / 100,
        };
    }, [nettoPreis, rabatt, steuersatz, isNetto]);

    // Handle form submission
    const handleSubmit = () => {
        // Validation
        if (!customer?.id) {
            toast.error('Kunde-ID fehlt');
            return;
        }

        if (!leistungsname.trim()) {
            toast.error('Bitte geben Sie einen Leistungsnamen ein');
            return;
        }

        if (!selectedEmployeeId) {
            toast.error('Bitte wählen Sie einen Mitarbeiter aus');
            return;
        }

        // Prepare form data for modal
        const formData = {
            customerId: customer.id,
            leistungsname: leistungsname.trim(),
            kategorie: kategorie.trim() || null,
            menge: parseInt(menge) || 1,
            nettoPreis: priceCalculations.netto,
            bruttoPreis: priceCalculations.brutto,
            mwst: priceCalculations.mwst,
            rabatt: parseFloat(rabatt) || 0,
            steuersatz: steuersatz,
            isNetto: isNetto,
            leistungsnotiz: leistungsnotiz.trim() || null,
            selectedEmployee: selectedEmployee,
            selectedEmployeeId: selectedEmployeeId,
            kundenName: `${customer.vorname || ''} ${customer.nachname || ''}`.trim(),
            email: customer.email || '',
            telefon: customer.telefon || customer.telefonnummer || '',
            wohnort: customer.wohnort || '',
        };

        setFormDataForModal(formData);
        setShowOrderModal(true);
    };

    const handleModalClose = () => {
        setShowOrderModal(false);
        setFormDataForModal(null);
    };

    const handleOrderComplete = () => {
        toast.success('Sonstige Leistung erfolgreich erfasst');
        
        // Reset form
        setLeistungsname('');
        setKategorie('');
        setMenge('1');
        setNettoPreis('0.00');
        setRabatt('0');
        setLeistungsnotiz('');
        setSelectedEmployee('');
        setSelectedEmployeeId('');

        // Close modal
        setShowOrderModal(false);
        setFormDataForModal(null);

        // Refresh data if callback provided
        if (onDataRefresh) {
            onDataRefresh();
        }
    };

    return (
        <div className="">
            <div className="">
                <h1 className="text-xl font-bold mb-6 text-gray-900">Sonstige Leistung erfassen</h1>

                {/* LEISTUNGSDETAILS Section */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wide">LEISTUNGSDETAILS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Leistungsname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Leistungsname<span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                placeholder="z.B. Sonderanpassung"
                                value={leistungsname}
                                onChange={(e) => setLeistungsname(e.target.value)}
                                className="w-full h-10"
                            />
                        </div>

                        {/* Kategorie */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategorie
                            </label>
                            <Input
                                type="text"
                                placeholder="Optional..."
                                value={kategorie}
                                onChange={(e) => setKategorie(e.target.value)}
                                className="w-full h-10"
                            />
                        </div>

                        {/* Durchgeführt von */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durchgeführt von
                            </label>
                        <Popover open={isEmployeeDropdownOpen} onOpenChange={handleEmployeeDropdownChange}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isEmployeeDropdownOpen}
                                    className="w-full cursor-pointer justify-between font-normal h-10 bg-white border-gray-300"
                                >
                                    <span className={`truncate ${selectedEmployee ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {selectedEmployee || "Mitarbeiter..."}
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
                                                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${
                                                        selectedEmployee === employee.employeeName
                                                            ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                                    onClick={() => handleEmployeeSelect({ employeeName: employee.employeeName, id: employee.id })}
                                                >
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span
                                                            className={`text-sm font-medium truncate ${
                                                                selectedEmployee === employee.employeeName
                                                                    ? 'text-blue-900'
                                                                    : 'text-gray-900'
                                                            }`}
                                                        >
                                                            {employee.employeeName}
                                                        </span>
                                                        {employee.email && (
                                                            <span
                                                                className={`text-xs truncate ${
                                                                    selectedEmployee === employee.employeeName
                                                                        ? 'text-blue-600'
                                                                        : 'text-gray-500'
                                                                }`}
                                                            >
                                                                {employee.email}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {selectedEmployee === employee.employeeName && (
                                                        <Check className="h-4 w-4 text-blue-600 ml-2 shrink-0" />
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

                        {/* Menge */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Menge
                            </label>
                            <Select value={menge} onValueChange={setMenge}>
                                <SelectTrigger className="w-full h-10">
                                    <SelectValue placeholder="Menge wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                    <SelectItem value="7">7</SelectItem>
                                    <SelectItem value="8">8</SelectItem>
                                    <SelectItem value="9">9</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* PREIS & STEUER Section */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wide">PREIS & STEUER</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left side - Input fields */}
                        <div className="space-y-4">
                            {/* Netto-Preis / Brutto-Preis */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isNetto ? 'Netto-Preis (€)' : 'Brutto-Preis (€)'}
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={nettoPreis}
                                    onChange={(e) => setNettoPreis(e.target.value)}
                                    className="w-full h-10"
                                />
                            </div>

                            {/* Rabatt */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rabatt (% - wechseln)
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        value={rabatt}
                                        onChange={(e) => setRabatt(e.target.value)}
                                        className="w-full h-10"
                                    />
                                    <span className="text-sm text-gray-600 font-medium">%</span>
                                </div>
                            </div>

                            {/* Steuersatz */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Steuersatz
                                </label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded h-10 flex items-center">
                                    <span className="text-sm text-gray-700">
                                        {steuersatz}% ({defaultTaxRate.name})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Price Summary Box */}
                        <div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                {/* Toggle buttons */}
                                <div className="flex gap-2 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsNetto(true)}
                                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                            isNetto
                                                ? 'bg-[#62A17C] text-white shadow-sm'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Preis ist Netto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsNetto(false)}
                                        className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                            !isNetto
                                                ? 'bg-[#62A17C] text-white shadow-sm'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Preis ist Brutto
                                    </button>
                                </div>

                                {/* Price summary */}
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">Netto:</span>
                                        <span className="text-sm font-medium text-gray-900">€{priceCalculations.netto.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">MwSt ({steuersatz}%):</span>
                                        <span className="text-sm font-medium text-gray-900">€{priceCalculations.mwst.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2.5 border-t border-gray-300">
                                        <span className="text-sm font-semibold text-gray-900">Brutto:</span>
                                        <span className="text-sm font-semibold text-gray-900">€{priceCalculations.brutto.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leistungsnotiz Section */}
                <div className="mb-8">
                    <h2 className="text-base font-semibold mb-4 text-gray-600">Leistungsnotiz</h2>
                    <Textarea
                        placeholder="Anmerkungen zur Leistung..."
                        value={leistungsnotiz}
                        onChange={(e) => setLeistungsnotiz(e.target.value)}
                        className="w-full min-h-[120px] border-gray-300 resize-none"
                        rows={4}
                    />
                </div>

                {/* Abschliessen Button */}
                <div className="flex justify-center pt-4">
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-[#62A17C] cursor-pointer hover:bg-[#4A8A5F] text-white px-12 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        Abschliessen
                    </Button>
                </div>
            </div>

            {/* Sonstiges Order Modal */}
            <SonstigesOrderModal
                isOpen={showOrderModal}
                onOpenChange={handleModalClose}
                customer={customer}
                formData={formDataForModal}
                onOrderComplete={handleOrderComplete}
            />
        </div>
    );
}

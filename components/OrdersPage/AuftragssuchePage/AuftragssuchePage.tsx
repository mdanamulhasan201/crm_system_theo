'use client'

import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrdersContext';

type SearchForm = {
    bestellnummer: string;
    kundennummer: string;
    name: string;
};

export default function AuftragssuchePage() {
    const { register, handleSubmit, watch, reset } = useForm<SearchForm>();
    const { searchParams, setSearchParams, clearSearchParams } = useOrders();

    // Watch form values for button disable state
    const bestellnummer = watch('bestellnummer') || '';
    const kundennummer = watch('kundennummer') || '';
    const name = watch('name') || '';

    // Handler to allow only numbers
    const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow: backspace, delete, tab, escape, enter
        if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
            return;
        }
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        if ((e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x') && e.ctrlKey) {
            return;
        }
        // Allow: Arrow keys, Home, End
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
            return;
        }
        // Only allow numbers (0-9)
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    // Handler to prevent non-numeric characters on paste
    const handleNumberPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const paste = e.clipboardData.getData('text');
        if (!/^\d*$/.test(paste)) {
            e.preventDefault();
        }
    };

    const onSubmit = (data: SearchForm) => {
        const { bestellnummer, kundennummer, name } = data;
        
        // Only set search params if at least one field has a value
        if (bestellnummer.trim() || kundennummer.trim() || name.trim()) {
            setSearchParams({
                orderNumber: bestellnummer.trim() || '',
                customerNumber: kundennummer.trim() || '',
                customerName: name.trim() || '',
            });
        }
    };

    const handleClear = () => {
        reset();
        clearSearchParams();
    };

    const allFieldsEmpty = !bestellnummer && !kundennummer && !name;
    const hasActiveSearch = searchParams.customerNumber || searchParams.orderNumber || searchParams.customerName;

    return (
        <div className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="text-lg font-bold mb-2 text-center">Auftragssuche</div>
            <form className="w-full flex flex-col items-center" onSubmit={handleSubmit(onSubmit)}>
                <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full max-w-xs mb-2"
                    placeholder="Bestellnummer"
                    onKeyDown={handleNumberInput}
                    onPaste={handleNumberPaste}
                    {...register('bestellnummer')}
                />
                <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full max-w-xs mb-2"
                    placeholder="Kundennummer"
                    onKeyDown={handleNumberInput}
                    onPaste={handleNumberPaste}
                    {...register('kundennummer')}
                />
                <Input
                    className="w-full max-w-xs mb-4"
                    placeholder="Name"
                    {...register('name')}
                />
                <div className="flex gap-2 w-full max-w-xs">
                    <Button 
                        type="submit" 
                        className="flex-1 cursor-pointer" 
                        disabled={allFieldsEmpty}
                    >
                        Suchen
                    </Button>
                    {hasActiveSearch && (
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleClear}
                            className="flex-1 cursor-pointer"
                        >
                            Zurücksetzen
                        </Button>
                    )}
                </div>
            </form>
            {hasActiveSearch && (
                <div className="w-full max-w-xs mt-4 text-center text-sm text-gray-600">
                    <p>Aktive Suche:</p>
                    {searchParams.orderNumber && <p>Bestellnummer: {searchParams.orderNumber}</p>}
                    {searchParams.customerNumber && <p>Kundennummer: {searchParams.customerNumber}</p>}
                    {searchParams.customerName && <p>Name: {searchParams.customerName}</p>}
                </div>
            )}
        </div>
    );
}


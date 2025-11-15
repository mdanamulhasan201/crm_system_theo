'use client'
import React, { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function BasicSettings() {
    // Define the type for the field keys
    type FieldKey = 'firstName' | 'lastName' | 'dob' | 'email' | 'phone' | 'address';
    
    // Initial state for required fields
    const initialRequiredFields = {
        firstName: false,
        lastName: false,
        dob: false,
        email: false,
        phone: false,
        address: false,
    };

    // Initial state for shipping settings
    const initialShippingSettings = {
        shippingTime: '',
        shippingCost: '',
        shippingReminder: '',
        productionTime: '',
        lowStockThreshold: '',
        employees: '',
        prices: '',
        businessLocation: ''
    };

    // State for required fields
    const [requiredFields, setRequiredFields] = useState<Record<FieldKey, boolean>>(initialRequiredFields);

    // State for shipping settings
    const [shippingSettings, setShippingSettings] = useState(initialShippingSettings);

    // State to track if there are any changes
    const [hasChanges, setHasChanges] = useState(false);

    // Check for changes whenever states change
    useEffect(() => {
        const requiredFieldsChanged = JSON.stringify(requiredFields) !== JSON.stringify(initialRequiredFields);
        const shippingSettingsChanged = JSON.stringify(shippingSettings) !== JSON.stringify(initialShippingSettings);
        
        setHasChanges(requiredFieldsChanged || shippingSettingsChanged);
    }, [requiredFields, shippingSettings]);

    const handleCheckboxChange = (field: FieldKey) => {
        setRequiredFields(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleShippingSettingChange = (setting: keyof typeof shippingSettings, value: string) => {
        setShippingSettings(prev => ({
            ...prev,
            [setting]: value,
        }));
    };

    const handleSaveSettings = () => {
        // Here you would typically save to your backend/API
        // console.log('Saving settings:', { requiredFields, shippingSettings });
        // Add your API call here
        alert('Einstellungen gespeichert!');
        setHasChanges(false);
    };

    const handleResetSettings = () => {
        setRequiredFields(initialRequiredFields);
        setShippingSettings(initialShippingSettings);
        setHasChanges(false);
    };

    return (
        <div className="py-8">
            {/* Customer Data & Management – Required Fields */}
            <div className="bg-white p-6 rounded-lg mb-10 shadow-sm">
                <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    Kundendaten & Verwaltung
                </h1>
                <p className="text-base font-semibold mb-3 mt-2">Pflichtfelder definieren</p>
                <div className="space-y-2 ml-2">
                    <label className="flex items-center text-base">
                        <input type="checkbox" checked={requiredFields.firstName} onChange={() => handleCheckboxChange('firstName')} className="mr-2 w-4 h-4" />
                        Vorname
                    </label>
                    <label className="flex items-center text-base">
                        <input type="checkbox" checked={requiredFields.lastName} onChange={() => handleCheckboxChange('lastName')} className="mr-2 w-4 h-4" />
                        Nachname
                    </label>
                    <label className="flex items-center text-base">
                        <input type="checkbox" checked={requiredFields.dob} onChange={() => handleCheckboxChange('dob')} className="mr-2 w-4 h-4" />
                        Geburtsdatum
                    </label>
                    <label className="flex items-center text-base">
                        <input type="checkbox" checked={requiredFields.email} onChange={() => handleCheckboxChange('email')} className="mr-2 w-4 h-4" />
                        E-Mail Adresse
                    </label>
                    <label className="flex items-center text-base">
                        <input type="checkbox" checked={requiredFields.phone} onChange={() => handleCheckboxChange('phone')} className="mr-2 w-4 h-4" />
                        Telefonnummer
                    </label>
                    <label className="flex items-center text-base">
                        <input type="checkbox" checked={requiredFields.address} onChange={() => handleCheckboxChange('address')} className="mr-2 w-4 h-4" />
                        Adresse
                    </label>
                </div>
            </div>

            {/* Dashboard & Basic Configuration (Shipping Settings) */}
            
        </div>
    )
}

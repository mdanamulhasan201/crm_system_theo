'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { postBasicSettings, getBasicSettings } from '@/apis/setting/basicSettingsApis'
import toast from 'react-hot-toast'

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

    // State for required fields
    const [requiredFields, setRequiredFields] = useState<Record<FieldKey, boolean>>(initialRequiredFields);
    const [initialRequiredFieldsState, setInitialRequiredFieldsState] = useState<Record<FieldKey, boolean>>(initialRequiredFields);

    // State to track if there are any changes
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load existing settings from API on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await getBasicSettings();
                const data = response?.data;
                if (data) {
                    const mapped: Record<FieldKey, boolean> = {
                        firstName: !!data.vorname,
                        lastName: !!data.nachname,
                        dob: !!data.geburtsdatum,
                        email: !!data.email,
                        phone: !!data.telefon,
                        address: !!data.adresse,
                    };
                    setRequiredFields(mapped);
                    setInitialRequiredFieldsState(mapped);
                }
            } catch (error) {
                console.error('Fehler beim Laden der Einstellungen:', error);
            }
        };

        fetchSettings();
    }, []);

    // Check for changes whenever required fields change
    useEffect(() => {
        const requiredFieldsChanged = JSON.stringify(requiredFields) !== JSON.stringify(initialRequiredFieldsState);
        setHasChanges(requiredFieldsChanged);
    }, [requiredFields, initialRequiredFieldsState]);

    const handleCheckboxChange = (field: FieldKey) => {
        setRequiredFields(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSaveSettings = async () => {
        try {
            setIsSaving(true);

            const payload = {
                vorname: requiredFields.firstName,
                nachname: requiredFields.lastName,
                geburtsdatum: requiredFields.dob,
                email: requiredFields.email,
                telefon: requiredFields.phone,
                adresse: requiredFields.address,
            };

            const response = await postBasicSettings(payload);
            if (response?.success) {
                // Update initial state baseline so hasChanges resets
                setInitialRequiredFieldsState(requiredFields);
                toast.success('Einstellungen gespeichert!');
                setHasChanges(false);
            } else {
                toast.error('Speichern fehlgeschlagen.');
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Einstellungen:', error);
            toast.error('Fehler beim Speichern der Einstellungen.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetSettings = () => {
        setRequiredFields(initialRequiredFields);
        setInitialRequiredFieldsState(initialRequiredFields);
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
            
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetSettings}
                    disabled={!hasChanges}
                >
                    Zurücksetzen
                </Button>
                <Button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={!hasChanges || isSaving}
                >
                    {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
            </div>
        </div>
    )
}

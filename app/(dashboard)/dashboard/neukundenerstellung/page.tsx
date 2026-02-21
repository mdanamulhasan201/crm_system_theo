'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
import { CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import toast from 'react-hot-toast';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { addCustomer } from '@/apis/customerApis';
import { getBasicSettings } from '@/apis/setting/basicSettingsApis';
import WohnortInput from '../_components/Customers/WohnortInput';

interface RequiredFields {
    vorname: boolean;
    nachname: boolean;
    geburtsdatum: boolean;
    email: boolean;
    telefon: boolean;
    adresse: boolean;
    land: boolean;
    billingType: boolean;
}

export default function Neukundenerstellung() {
    const router = useRouter();
    const [gender, setGender] = useState<'mann' | 'frau' | 'keine'>('mann');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [insuranceNumber, setInsuranceNumber] = useState('');
    const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
    const [birthDateInput, setBirthDateInput] = useState('');
    const [billingType, setBillingType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requiredFields, setRequiredFields] = useState<RequiredFields>({
        vorname: false,
        nachname: false,
        geburtsdatum: false,
        email: false,
        telefon: false,
        adresse: false,
        land: false,
        billingType: false,
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Fetch required fields settings
    useEffect(() => {
        const fetchRequiredFields = async () => {
            try {
                const response = await getBasicSettings();
                if (response?.success && response?.data) {
                    setRequiredFields({
                        vorname: Boolean(response.data.vorname ?? false),
                        nachname: Boolean(response.data.nachname ?? false),
                        geburtsdatum: Boolean(response.data.geburtsdatum ?? false),
                        email: Boolean(response.data.email ?? false),
                        telefon: Boolean(response.data.telefon ?? false),
                        adresse: Boolean(response.data.adresse ?? false),
                        land: Boolean(response.data.land ?? false),
                        billingType: Boolean(response.data.billingType ?? false),
                    });
                }
            } catch (error) {
                console.error('Fehler beim Laden der Pflichtfelder:', error);
            }
        };
        fetchRequiredFields();
    }, []);

    // Validate form based on required fields
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (requiredFields.vorname && !firstName.trim()) {
            errors.firstName = 'Vorname ist erforderlich';
        }
        if (requiredFields.nachname && !lastName.trim()) {
            errors.lastName = 'Nachname ist erforderlich';
        }
        if (requiredFields.geburtsdatum && !birthDate) {
            errors.birthDate = 'Geburtsdatum ist erforderlich';
        }
        if (requiredFields.email && !email.trim()) {
            errors.email = 'E-Mail ist erforderlich';
        }
        if (requiredFields.telefon && !phone.trim()) {
            errors.phone = 'Telefonnummer ist erforderlich';
        }
        if (requiredFields.adresse && !address.trim()) {
            errors.address = 'Adresse ist erforderlich';
        }
        if (requiredFields.land && !insuranceNumber.trim()) {
            errors.insuranceNumber = 'Versicherungsnummer ist erforderlich';
        }
        if (requiredFields.billingType && !billingType.trim()) {
            errors.billingType = 'Abrechnungstyp ist erforderlich';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        // Validate form before submitting
        if (!validateForm()) {
            toast.error('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('gender', gender);
            // API expects German field names
            formData.append('vorname', firstName);
            formData.append('nachname', lastName);
            formData.append('wohnort', address);
            formData.append('email', email);
            formData.append('telefon', phone);
            if (birthDate) {
                // API expects field name "geburtsdatum"
                formData.append('geburtsdatum', birthDate.toISOString().split('T')[0]);
            }
            formData.append('land', insuranceNumber);
            formData.append('billingType', billingType);

            await addCustomer(formData);
            toast.success('Kunde wurde erfolgreich erstellt.');
            router.push('/dashboard/customers');
        } catch (error: any) {
            console.error(error);
            // Versuche, die Fehlermeldung der API zu lesen
            const apiMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Kunde konnte nicht erstellt werden.';
            toast.error(apiMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Clear errors when fields become valid
    useEffect(() => {
        setFieldErrors((prev) => {
            const next = { ...prev };
            if (firstName.trim() && next.firstName) delete next.firstName;
            if (lastName.trim() && next.lastName) delete next.lastName;
            if (birthDate && next.birthDate) delete next.birthDate;
            if (email.trim() && next.email) delete next.email;
            if (phone.trim() && next.phone) delete next.phone;
            if (address.trim() && next.address) delete next.address;
            if (insuranceNumber.trim() && next.insuranceNumber) delete next.insuranceNumber;
            if (billingType.trim() && next.billingType) delete next.billingType;
            return next;
        });
    }, [firstName, lastName, birthDate, email, phone, address, insuranceNumber, billingType]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Neuer Kunde / Scanprozess</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Bevor wir mit dem Scanvorgang starten, geben Sie bitte die persönlichen Daten des Kunden ein.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => history.back()}
                        className="rounded-full p-1 hover:bg-gray-100 cursor-pointer"
                    >
                        <IoClose className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body – full form like design */}
                <div className="px-6 py-5 space-y-6 overflow-y-auto flex-1">
                    {/* Geschlecht */}
                    <div>
                        <p className="block text-sm font-medium text-gray-700 mb-2">Geschlecht</p>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            {['Mann', 'Frau', 'Keine Angabe'].map((label) => {
                                const value =
                                    label === 'Mann' ? 'mann' : label === 'Frau' ? 'frau' : 'keine';
                                const selected = gender === value;
                                return (
                                <label
                                    key={label}
                                    className={`flex items-center justify-between rounded-lg border px-4 py-2 cursor-pointer text-sm ${
                                        selected
                                            ? 'border-[#61A175] bg-[#E9F5EF]'
                                            : 'border-gray-200 hover:border-[#61A175]'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="gender"
                                        className="hidden"
                                        value={value}
                                        checked={selected}
                                        onChange={() =>
                                            setGender(value as 'mann' | 'frau' | 'keine')
                                        }
                                >
                                    </input>
                                    <span className="text-gray-800">{label}</span>
                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300">
                                        {selected && (
                                            <span className="w-2 h-2 rounded-full bg-[#61A175]" />
                                        )}
                                    </span>
                                </label>
                            )})}
                        </div>
                    </div>

                    {/* Name fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vorname {requiredFields.vorname && <span className="text-red-500">*</span>}
                            </label>
                            <Input
                                type="text"
                                className={cn("w-full", fieldErrors.firstName && "border-red-500")}
                                placeholder="Ex. john....."
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            {fieldErrors.firstName && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nachname {requiredFields.nachname && <span className="text-red-500">*</span>}
                            </label>
                            <Input
                                type="text"
                                className={cn("w-full", fieldErrors.lastName && "border-red-500")}
                                placeholder="Ex. De....."
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            {fieldErrors.lastName && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>
                            )}
                        </div>
                    </div>

                    {/* Wohnort with full address (Location + Exact Address) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse {requiredFields.adresse && <span className="text-red-500">*</span>}
                        </label>
                        <WohnortInput value={address} onChange={setAddress} />
                        {fieldErrors.address && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                        )}
                    </div>

                    {/* Telefonnummer & Geburtsdatum */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telefonnummer {requiredFields.telefon && <span className="text-red-500">*</span>}
                            </label>
                            <Input
                                type="tel"
                                className={cn("w-full", fieldErrors.phone && "border-red-500")}
                                placeholder="0049 123 456789"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            {fieldErrors.phone && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Geburtsdatum {requiredFields.geburtsdatum && <span className="text-red-500">*</span>}
                            </label>
                            <div className="flex items-center gap-2">
                                {/* Manuelle Eingabe */}
                                <Input
                                    type="text"
                                    className={cn(
                                        "w-full",
                                        fieldErrors.birthDate && "border-red-500"
                                    )}
                                    placeholder="z.B. 02.03.2002"
                                    value={birthDateInput}
                                    onChange={(e) => {
                                        const input = e.target.value;
                                        // Nur Ziffern extrahieren
                                        const digits = input.replace(/\D/g, '');

                                        let formatted = digits;
                                        if (digits.length > 2 && digits.length <= 4) {
                                            // ddMM -> dd.MM
                                            formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
                                        } else if (digits.length > 4) {
                                            // ddMMyyyy -> dd.MM.yyyy (max 8 Ziffern)
                                            const d = digits.slice(0, 2);
                                            const m = digits.slice(2, 4);
                                            const y = digits.slice(4, 8);
                                            formatted = y ? `${d}.${m}.${y}` : `${d}.${m}`;
                                        }

                                        setBirthDateInput(formatted);

                                        // Nur parsen, wenn wir ein komplettes Datum dd.MM.yyyy haben
                                        if (formatted.length === 10) {
                                            const parsed = parse(formatted, 'dd.MM.yyyy', new Date());
                                            if (!isNaN(parsed.getTime())) {
                                                setBirthDate(parsed);
                                                return;
                                            }
                                        }
                                        setBirthDate(undefined);
                                    }}
                                />

                                {/* Kalender-Auswahl */}
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="px-2 py-2"
                                        >
                                            <CalendarIcon className="h-4 w-4 opacity-80" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            captionLayout="dropdown"
                                            fromYear={1900}
                                            toYear={new Date().getFullYear()}
                                            defaultMonth={birthDate ?? new Date(1990, 0, 1)}
                                            selected={birthDate}
                                            onSelect={(date) => {
                                                setBirthDate(date);
                                                if (date) {
                                                    setBirthDateInput(format(date, 'dd.MM.yyyy'));
                                                } else {
                                                    setBirthDateInput('');
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {fieldErrors.birthDate && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.birthDate}</p>
                            )}
                        </div>
                    </div>

                    {/* E-Mail & Versicherungsnummer */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                E-Mail {requiredFields.email && <span className="text-red-500">*</span>}
                            </label>
                            <Input
                                type="email"
                                className={cn("w-full", fieldErrors.email && "border-red-500")}
                                placeholder="Ex. johngmail.com.."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {fieldErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Versicherungsnummer {requiredFields.land && <span className="text-red-500">*</span>}
                            </label>
                            <Input
                                type="text"
                                className={cn("w-full", fieldErrors.insuranceNumber && "border-red-500")}
                                placeholder="65 120692 M 123"
                                value={insuranceNumber}
                                onChange={(e) => setInsuranceNumber(e.target.value)}
                            />
                            {fieldErrors.insuranceNumber && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.insuranceNumber}</p>
                            )}
                        </div>
                    </div>

                    {/* Abrechnungstyp */}
                    <div className="text-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Abrechnungstyp {requiredFields.billingType && <span className="text-red-500">*</span>}
                        </label>
                        <Select value={billingType} onValueChange={setBillingType}>
                            <SelectTrigger className={cn("w-full", fieldErrors.billingType && "border-red-500")}>
                                <SelectValue placeholder="Auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="privat">Privat</SelectItem>
                                <SelectItem value="krankenkasse">Krankenkasse</SelectItem>
                            </SelectContent>
                        </Select>
                        {fieldErrors.billingType && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.billingType}</p>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
                    <button
                        type="button"
                        onClick={() => history.back()}
                        className="px-4 py-2 rounded-lg border cursor-pointer border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Zurück
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        className={`px-5 py-2 rounded-lg cursor-pointer text-sm font-semibold ${
                            !isSubmitting
                                ? 'bg-[#61A175] text-white hover:bg-[#4f8360]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Wird gespeichert...' : 'Weiter'}
                    </button>
                </div>
            </div>
        </div>
    );
}

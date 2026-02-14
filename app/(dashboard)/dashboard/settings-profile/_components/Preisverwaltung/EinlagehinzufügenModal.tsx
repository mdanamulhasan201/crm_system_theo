"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "./ImageUplaod";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

interface EinlagehinzufügenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (data: { id?: string; name: string; description: string; price: number; image?: string; imageFile?: File }) => Promise<void> | void;
    editingInsole?: { id: string; name: string; description?: string; price: number; image?: string } | null;
    isLoading?: boolean;
}

const VAT_OPTIONS = ["0", "7", "10", "19", "20", "22"];

interface TaxRate {
    id: string;
    name: string;
    rate: number;
    description: string;
    isDefault: boolean;
}

// Tax rates configuration by country
const getTaxRatesByCountry = (country: string | null | undefined): TaxRate[] | null => {
    if (!country) return null;

    // Germany (Deutschland)
    if (country.includes('Deutschland') || country.includes('Germany') || country.includes('(DE)')) {
        return [
            {
                id: '1',
                name: 'Standard VAT',
                rate: 19,
                description: 'Standard German VAT rate',
                isDefault: true
            },
            {
                id: '2',
                name: 'Reduced VAT',
                rate: 7,
                description: 'Reduced VAT rate for specific goods',
                isDefault: false
            },
            {
                id: '3',
                name: 'Tax Free',
                rate: 0,
                description: 'No VAT applied',
                isDefault: false
            }
        ];
    }

    // Austria (Österreich)
    if (country.includes('Österreich') || country.includes('Austria') || country.includes('(AT)')) {
        return [
            {
                id: '1',
                name: 'Umsatzsteuer (USt)',
                rate: 20,
                description: 'Normalsteuersatz',
                isDefault: true
            }
        ];
    }

    // Italy (Italien)
    if (country.includes('Italien') || country.includes('Italy') || country.includes('(IT)')) {
        return [
            {
                id: '1',
                name: 'Mehrwertsteuer (IVA)',
                rate: 22,
                description: 'Standard',
                isDefault: true
            },
            {
                id: '2',
                name: 'Ermäßigt',
                rate: 10,
                description: 'Ermäßigt',
                isDefault: false
            },
            {
                id: '3',
                name: 'Stark ermäßigt',
                rate: 4,
                description: 'Stark ermäßigt',
                isDefault: false
            }
        ];
    }

    // Country not configured
    return null;
};

export default function EinlagehinzufügenModal({ open, onOpenChange, onSubmit, editingInsole, isLoading = false }: EinlagehinzufügenModalProps) {
    const { user } = useAuth();
    const vatCountry = user?.accountInfo?.vat_country;
    
    // Get VAT rates based on country for bottom dropdown
    const taxRates = getTaxRatesByCountry(vatCountry);
    const countryWiseVatOptions = taxRates ? taxRates.map(rate => rate.rate.toString()) : VAT_OPTIONS;
    const defaultCountryVat = taxRates?.find(rate => rate.isDefault)?.rate.toString() || "20";
    
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priceGross, setPriceGross] = useState("");
    const [vatPercentageMain, setVatPercentageMain] = useState("20"); // Top dropdown
    const [vatPercentageCountry, setVatPercentageCountry] = useState(defaultCountryVat); // Bottom dropdown (country-wise)
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [nameError, setNameError] = useState("");
    const [priceError, setPriceError] = useState("");

    // Calculate prices based on gross price and VAT
    const calculatePrices = (gross: string, vat: string) => {
        const grossValue = parseFloat(gross) || 0;
        const vatValue = parseFloat(vat) || 0;
        
        if (grossValue === 0) {
            return { netto: 0, vatAmount: 0, brutto: 0 };
        }
        
        // Calculate netto from gross: netto = gross / (1 + vat/100)
        const netto = grossValue / (1 + vatValue / 100);
        const vatAmount = grossValue - netto;
        const brutto = grossValue; // Brutto is the same as entered gross price
        
        return {
            netto: Math.round(netto * 100) / 100,
            vatAmount: Math.round(vatAmount * 100) / 100,
            brutto: Math.round(brutto * 100) / 100,
        };
    };

    // Use country-wise VAT for calculation
    const prices = calculatePrices(priceGross, vatPercentageCountry);

    // Update country-wise VAT when country changes
    useEffect(() => {
        if (defaultCountryVat) {
            setVatPercentageCountry(defaultCountryVat);
        }
    }, [defaultCountryVat]);

    // Update form when editingInsole changes
    useEffect(() => {
        if (!open) {
            // Reset form when modal closes
            setName("");
            setDescription("");
            setPriceGross("");
            setVatPercentageMain("20");
            setVatPercentageCountry(defaultCountryVat);
            setImagePreview(null);
            setImageFile(null);
            setNameError("");
            setPriceError("");
            return;
        }

        if (editingInsole) {
            setName(editingInsole.name);
            setDescription(editingInsole.description || "");
            setPriceGross(editingInsole.price.toString());
            setVatPercentageMain("20"); // Default VAT when editing
            setVatPercentageCountry(defaultCountryVat);
            const imageUrl = editingInsole.image;
            if (imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
                setImagePreview(imageUrl);
            } else {
                setImagePreview(null);
            }
            setImageFile(null);
        } else {
            // Reset form when opening new modal
            setName("");
            setDescription("");
            setPriceGross("");
            setVatPercentageMain("20");
            setVatPercentageCountry(defaultCountryVat);
            setImagePreview(null);
            setImageFile(null);
            setNameError("");
            setPriceError("");
        }
    }, [editingInsole, open, defaultCountryVat]);

    const handleImageChange = (preview: string | null, file: File | null) => {
        setImagePreview(preview);
        setImageFile(file);
    };

    const validateForm = () => {
        let isValid = true;
        setNameError("");
        setPriceError("");

        // Validate EINLAGE (name) - required
        if (!name.trim()) {
            setNameError("EINLAGE ist erforderlich");
            isValid = false;
        }

        // Validate Preis (price) - optional, but if provided must be a valid number >= 0
        if (priceGross.trim()) {
            const priceValue = parseFloat(priceGross);
            if (isNaN(priceValue) || priceValue < 0) {
                setPriceError("Preis muss eine gültige Zahl sein (0 oder größer)");
                isValid = false;
            }
        }

        return isValid;
    };

    const handleSubmit = async () => {
        // Clear previous errors
        setNameError("");
        setPriceError("");

        // Validate form
        if (!validateForm()) {
            toast.error("Bitte füllen Sie alle erforderlichen Felder aus");
            return;
        }
        
        if (onSubmit) {
            try {
                // Use brutto price (default to 0 if empty)
                const finalPrice = priceGross.trim() ? prices.brutto : 0;
                await onSubmit({
                    id: editingInsole?.id,
                    name: name.trim(),
                    description,
                    price: finalPrice,
                    image: imagePreview || editingInsole?.image || undefined,
                    imageFile: imageFile || undefined,
                });
                // Reset form only if onSubmit succeeds
                setName("");
                setDescription("");
                setPriceGross("");
                setVatPercentageMain("20");
                setVatPercentageCountry(defaultCountryVat);
                setImagePreview(null);
                setImageFile(null);
                setNameError("");
                setPriceError("");
            } catch (error) {
                // Error handling is done in the parent component/hook
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center font-bold uppercase text-lg">
                        {editingInsole ? "EINLAGE BEARBEITEN" : "EINLAGE HINZUFÜGEN"}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="bg-white border border-gray-300 rounded-[5px] p-6 relative mt-4">
                    <div className="flex gap-6">
                        {/* Image Upload - Left Side */}
                        <div className="w-[280px] shrink-0">
                            <ImageUpload
                                onImageChange={handleImageChange}
                                initialImage={imagePreview}
                                size="md"
                            />
                        </div>

                        {/* Input Fields - Right Side */}
                        <div className="flex-1 space-y-4">
                            {/* Name der Einlage Input */}
                            <div>
                                <label className="block font-bold text-sm mb-2 text-black uppercase">
                                    Name der Einlage <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (nameError) setNameError("");
                                    }}
                                    className={`border-gray-300 rounded-[5px] bg-white ${nameError ? "border-red-500" : ""}`}
                                    placeholder="z.B. Alltagseinlage"
                                />
                                {nameError && (
                                    <p className="text-red-500 text-xs mt-1">{nameError}</p>
                                )}
                            </div>

                            {/* Eigenschaften Input */}
                            <div>
                                <label className="block font-bold text-sm mb-2 text-black uppercase">
                                    Eigenschaften
                                </label>
                                <Input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border-gray-300 rounded-[5px] bg-white"
                                    placeholder="z.B. stabil, weich, Sport..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Drücke Enter um eine Eigenschaft hinzuzufügen
                                </p>
                            </div>

                            {/* Preisberechnung Section */}
                            <div className="bg-gray-100 rounded-[5px] p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <label className="block font-bold text-sm text-black uppercase whitespace-nowrap">
                                    MwSt. main
                                    </label>
                                    <Select value={vatPercentageMain} onValueChange={setVatPercentageMain}>
                                        <SelectTrigger className="w-[100px] border-gray-300 rounded-[5px] bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VAT_OPTIONS.map((vat) => (
                                                <SelectItem key={vat} value={vat} className="cursor-pointer">
                                                    {vat}%
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Preis (Brutto) */}
                                <div>
                                    <label className="block font-bold text-sm mb-2 text-black uppercase">
                                        Preis (Brutto)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={priceGross}
                                            onChange={(e) => {
                                                setPriceGross(e.target.value);
                                                if (priceError) setPriceError("");
                                            }}
                                            className={`border-gray-300 rounded-[5px] bg-white flex-1 ${priceError ? "border-red-500" : ""}`}
                                            placeholder="0,00"
                                            step="0.01"
                                            min="0"
                                        />
                                        <span className="text-black font-medium">EUR</span>
                                    </div>
                                    {priceError && (
                                        <p className="text-red-500 text-xs mt-1">{priceError}</p>
                                    )}
                                </div>

                                {/* Netto */}
                                <div>
                                    <label className="block font-bold text-sm mb-2 text-black uppercase">
                                        Netto
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={prices.netto.toFixed(2).replace('.', ',')}
                                            readOnly
                                            className="border-gray-300 rounded-[5px] bg-gray-50 flex-1 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* MwSt. country wise */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="block font-bold text-sm text-black uppercase whitespace-nowrap">
                                            MwSt.
                                        </label>
                                        <Select value={vatPercentageCountry} onValueChange={setVatPercentageCountry}>
                                            <SelectTrigger className="w-[100px] border-gray-300 rounded-[5px] bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countryWiseVatOptions.map((vat) => (
                                                    <SelectItem key={vat} value={vat} className="cursor-pointer">
                                                        {vat}%
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={`${prices.vatAmount.toFixed(2).replace('.', ',')} €`}
                                            readOnly
                                            className="border-gray-300 rounded-[5px] bg-gray-50 flex-1 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Brutto */}
                                <div>
                                    <label className="block font-bold text-sm mb-2 text-black uppercase">
                                        Brutto
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={prices.brutto.toFixed(2).replace('.', ',')}
                                            readOnly
                                            className="border-gray-300 rounded-[5px] bg-green-100 flex-1 cursor-not-allowed text-green-700 font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-300 bg-white text-gray-700 cursor-pointer rounded-[5px] px-4 py-2 hover:bg-gray-50"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-[#61A175] hover:bg-[#61A175]/90 text-white cursor-pointer rounded-[5px] px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Speichern..." : "Speichern"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

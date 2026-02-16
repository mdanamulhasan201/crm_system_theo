"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "./ImageUplaod";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getTaxRatesByCountry } from "@/utils/taxRates";

interface EinlagehinzufügenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (data: { id?: string; name: string; description: string; price: number; vatRate: number; profitPercentage: number; image?: string; imageFile?: File }) => Promise<void> | void;
    editingInsole?: { id: string; name: string; description?: string; price: number; image?: string } | null;
    isLoading?: boolean;
}

const VAT_OPTIONS = ["0", "7", "10", "19", "20", "22"];

export default function EinlagehinzufügenModal({ open, onOpenChange, onSubmit, editingInsole, isLoading = false }: EinlagehinzufügenModalProps) {
    const { user } = useAuth();
    const vatCountry = user?.accountInfo?.vat_country;
    
    // Get VAT rates based on country
    const taxRates = getTaxRatesByCountry(vatCountry);
    const countryWiseVatOptions = taxRates || VAT_OPTIONS.map((vat: string) => ({
        id: vat,
        name: `MwSt.`,
        rate: parseFloat(vat),
        description: '',
        isDefault: vat === "20"
    }));
    const defaultCountryVat = taxRates?.find(rate => rate.isDefault)?.rate.toString() || "20";
    
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [basePrice, setBasePrice] = useState(""); // Base Service Price
    const [vatPercentageCountry, setVatPercentageCountry] = useState(defaultCountryVat); // VAT %
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [nameError, setNameError] = useState("");
    const [priceError, setPriceError] = useState("");

    // Calculate prices: Brutto (input) → Netto (Brutto - VAT)
    const calculatePrices = (brutto: string, vat: string) => {
        const bruttoValue = parseFloat(brutto) || 0;
        const vatValue = parseFloat(vat) || 0;
        
        if (bruttoValue === 0) {
            return { 
                bruttoPrice: 0,
                netBeforeVat: 0,
                vatAmount: 0,
            };
        }
        
        // Reverse calculation: Brutto is input, calculate Netto
        // Netto = Brutto / (1 + VAT/100)
        const netBeforeVat = bruttoValue / (1 + vatValue / 100);
        
        // VAT Amount = Brutto - Netto
        const vatAmount = bruttoValue - netBeforeVat;
        
        return {
            bruttoPrice: Math.round(bruttoValue * 100) / 100,
            netBeforeVat: Math.round(netBeforeVat * 100) / 100,
            vatAmount: Math.round(vatAmount * 100) / 100,
        };
    };

    // Calculate prices using base price and VAT
    const prices = calculatePrices(basePrice, vatPercentageCountry);

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
            setBasePrice("");
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
            setBasePrice(editingInsole.price.toString());
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
            setBasePrice("");
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

        // Validate Base Price - optional, but if provided must be a valid number >= 0
        if (basePrice.trim()) {
            const priceValue = parseFloat(basePrice);
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
                // Use brutto price as the main price (default to 0 if empty)
                const finalPrice = basePrice.trim() ? prices.bruttoPrice : 0;
                const vatRate = parseFloat(vatPercentageCountry) || 0;
                const profitPercentage = 0; // No commission anymore
                
                await onSubmit({
                    id: editingInsole?.id,
                    name: name.trim(),
                    description,
                    price: finalPrice,
                    vatRate: vatRate,
                    profitPercentage: profitPercentage,
                    image: imagePreview || editingInsole?.image || undefined,
                    imageFile: imageFile || undefined,
                });
                // Reset form only if onSubmit succeeds
                setName("");
                setDescription("");
                setBasePrice("");
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
                                {/* MwSt. country wise */}
                                <div>
                                    <label className="block font-bold text-sm mb-2 text-black uppercase">
                                        {(() => {
                                            const selectedRate = countryWiseVatOptions.find(
                                                (rate: { id: string; name: string; rate: number; description: string; isDefault?: boolean }) => rate.rate.toString() === vatPercentageCountry
                                            );
                                            return selectedRate 
                                                ? `MwSt (${selectedRate.rate}%)`
                                                : `MwSt. (${vatPercentageCountry}%)`;
                                        })()}
                                    </label>
                                    <Select value={vatPercentageCountry} onValueChange={setVatPercentageCountry}>
                                        <SelectTrigger className="w-full border-gray-300 rounded-[5px] bg-white">
                                            <SelectValue>
                                                {(() => {
                                                    const selectedRate = countryWiseVatOptions.find(
                                                        (rate: { id: string; name: string; rate: number; description: string; isDefault?: boolean }) => rate.rate.toString() === vatPercentageCountry
                                                    );
                                                    return selectedRate 
                                                        ? `${selectedRate.name} (${selectedRate.rate}%)`
                                                        : `${vatPercentageCountry}%`;
                                                })()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryWiseVatOptions.map((rate: { id: string; name: string; rate: number; description: string; isDefault?: boolean }) => (
                                                <SelectItem key={rate.id} value={rate.rate.toString()} className="cursor-pointer">
                                                    {rate.name} ({rate.rate}%)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                  {/* Base Service Price */}
                                  <div>
                                    <label className="block font-bold text-sm mb-2 text-black uppercase">
                                        Preis (Brutto)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={basePrice}
                                            onChange={(e) => {
                                                setBasePrice(e.target.value);
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

                                {/* Net before VAT */}
                                <div>
                                    <label className="block font-bold text-sm mb-2 text-black uppercase">
                                        Netto
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="text"
                                            value={`${prices.netBeforeVat.toFixed(2).replace('.', ',')} €`}
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
                                            value={`${prices.bruttoPrice.toFixed(2).replace('.', ',')} €`}
                                            readOnly
                                            className="border-green-300 rounded-[5px] bg-green-50 flex-1 cursor-not-allowed"
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

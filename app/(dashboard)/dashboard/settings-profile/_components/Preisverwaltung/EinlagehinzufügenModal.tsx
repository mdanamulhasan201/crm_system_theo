"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "./ImageUplaod";
import toast from "react-hot-toast";

interface EinlagehinzufügenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (data: { id?: string; name: string; description: string; price: number; image?: string; imageFile?: File }) => Promise<void> | void;
    editingInsole?: { id: string; name: string; description?: string; price: number; image?: string } | null;
    isLoading?: boolean;
}

const VAT_OPTIONS = ["0", "7", "10", "19", "20", "22"];

export default function EinlagehinzufügenModal({ open, onOpenChange, onSubmit, editingInsole, isLoading = false }: EinlagehinzufügenModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priceGross, setPriceGross] = useState("");
    const [vatPercentage, setVatPercentage] = useState("20");
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

    const prices = calculatePrices(priceGross, vatPercentage);

    // Update form when editingInsole changes
    useEffect(() => {
        if (!open) {
            // Reset form when modal closes
            setName("");
            setDescription("");
            setPriceGross("");
            setVatPercentage("20");
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
            setVatPercentage("20"); // Default VAT when editing
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
            setVatPercentage("20");
            setImagePreview(null);
            setImageFile(null);
            setNameError("");
            setPriceError("");
        }
    }, [editingInsole, open]);

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
                setVatPercentage("20");
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
                                        Preisberechnung
                                    </label>
                                    <Select value={vatPercentage} onValueChange={setVatPercentage}>
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

                                {/* MwSt. */}
                                <div>
                                    <label className="block font-bold text-sm mb-2 text-black uppercase">
                                        MwSt. ({vatPercentage}%)
                                    </label>
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

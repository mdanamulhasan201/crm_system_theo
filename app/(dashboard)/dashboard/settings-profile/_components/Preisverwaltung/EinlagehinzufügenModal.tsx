"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ImageUpload from "./ImageUplaod";
import toast from "react-hot-toast";

interface EinlagehinzufügenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (data: { id?: string; name: string; description: string; price: number; image?: string; imageFile?: File }) => Promise<void> | void;
    editingInsole?: { id: string; name: string; description?: string; price: number; image?: string } | null;
    isLoading?: boolean;
}

export default function EinlagehinzufügenModal({ open, onOpenChange, onSubmit, editingInsole, isLoading = false }: EinlagehinzufügenModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [nameError, setNameError] = useState("");
    const [priceError, setPriceError] = useState("");

    // Update form when editingInsole changes
    useEffect(() => {
        if (editingInsole) {
            setName(editingInsole.name);
            setDescription(editingInsole.description || "");
            setPrice(editingInsole.price.toString());
            const imageUrl = editingInsole.image;
            if (imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
                setImagePreview(imageUrl);
            } else {
                setImagePreview(null);
            }
            setImageFile(null);
        } else {
            // Reset form when not editing
            setName("");
            setDescription("");
            setPrice("");
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

        // Validate Preis (price) - required and must be a valid positive number
        if (!price.trim()) {
            setPriceError("Preis ist erforderlich");
            isValid = false;
        } else {
            const priceValue = parseFloat(price);
            if (isNaN(priceValue) || priceValue <= 0) {
                setPriceError("Preis muss eine gültige positive Zahl sein");
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
                await onSubmit({
                    id: editingInsole?.id,
                    name: name.trim(),
                    description,
                    price: parseFloat(price),
                    image: imagePreview || editingInsole?.image || undefined,
                    imageFile: imageFile || undefined,
                });
                // Reset form only if onSubmit succeeds
                setName("");
                setDescription("");
                setPrice("");
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
            <DialogContent className="sm:max-w-2xl bg-white">
                <DialogHeader>
                    <DialogTitle className="text-center font-bold uppercase text-lg">
                        {editingInsole ? "EINLAGE BEARBEITEN" : "EINLAGE HINZUFÜGEN"}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="bg-white border border-gray-300 rounded-[5px] p-6 relative mt-4">
                    <div className="flex gap-6">
                        {/* Image Upload - Left Side */}
                        <ImageUpload
                            onImageChange={handleImageChange}
                            initialImage={imagePreview}
                            size="md"
                        />

                        {/* Input Fields - Right Side */}
                        <div className="flex-1 space-y-4">
                            {/* EINLAGE Input */}
                            <div>
                                <label className="block font-bold text-sm mb-2 text-black uppercase">
                                    EINLAGE <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (nameError) setNameError("");
                                    }}
                                    className={`border-gray-300 rounded-[5px] bg-white ${nameError ? "border-red-500" : ""}`}
                                    placeholder=""
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
                                    placeholder=""
                                />
                            </div>

                            {/* Preis Input */}
                            <div>
                                <label className="block font-bold text-sm mb-2 text-black uppercase">
                                    Preis  <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => {
                                            setPrice(e.target.value);
                                            if (priceError) setPriceError("");
                                        }}
                                        className={`border-gray-300 rounded-[5px] bg-white flex-1 ${priceError ? "border-red-500" : ""}`}
                                        placeholder=""
                                        step="0.01"
                                        min="0"
                                    />
                                    <span className="text-black font-medium">EUR</span>
                                </div>
                                {priceError && (
                                    <p className="text-red-500 text-xs mt-1">{priceError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-black cursor-pointer rounded-[5px] px-4 py-2"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="bg-black text-white cursor-pointer rounded-[5px] px-4 py-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Speichern..." : "Speichern"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

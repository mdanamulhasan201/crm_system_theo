"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ImageUpload from "./ImageUplaod";

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
        }
    }, [editingInsole, open]);

    const handleImageChange = (preview: string | null, file: File | null) => {
        setImagePreview(preview);
        setImageFile(file);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !price) {
            return;
        }
        
        if (!editingInsole && !imageFile && !imagePreview) {
            return; 
        }
        
        if (onSubmit) {
            try {
                await onSubmit({
                    id: editingInsole?.id,
                    name: name.trim(),
                    description,
                    price: parseFloat(price) || 0,
                    image: imagePreview || editingInsole?.image || undefined,
                    imageFile: imageFile || undefined,
                });
                // Reset form only if onSubmit succeeds
                setName("");
                setDescription("");
                setPrice("");
                setImagePreview(null);
                setImageFile(null);
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
                                <label className="block font-bold text-sm mb-2 text-black">
                                    EINLAGE
                                </label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="border-gray-300 rounded-[5px] bg-white"
                                    placeholder=""
                                />
                            </div>

                            {/* Eigenschaften Input */}
                            <div>
                                <label className="block font-normal text-sm mb-2 text-black">
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
                                <label className="block font-bold text-sm mb-2 text-black">
                                    Preis
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="border-gray-300 rounded-[5px] bg-white flex-1"
                                        placeholder=""
                                        step="0.01"
                                    />
                                    <span className="text-black font-medium">EUR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-black rounded-[5px] px-4 py-2"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !name.trim() || !price || (!editingInsole && !imageFile && !imagePreview)}
                            className="bg-black text-white rounded-[5px] px-4 py-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Speichern..." : "Speichern"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

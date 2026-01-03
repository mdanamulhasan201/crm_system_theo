"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageUploadProps {
    onImageChange?: (imagePreview: string | null, imageFile: File | null) => void;
    initialImage?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function ImageUpload({
    onImageChange,
    initialImage = null,
    size = "md",
    className = "",
}: ImageUploadProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(initialImage);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: "w-24 h-24",
        md: "w-32 h-32",
        lg: "w-40 h-40",
    };

    const iconSizes = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16",
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setImagePreview(result);
                if (onImageChange) {
                    onImageChange(result, file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImagePreview(null);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (onImageChange) {
            onImageChange(null, null);
        }
    };

    // Sync initialImage with state when it changes
    useEffect(() => {
        setImagePreview(initialImage);
    }, [initialImage]);

    return (
        <div className={`flex-shrink-0 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
            <div
                onClick={handleImageClick}
                className={`${sizeClasses[size]} border border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden rounded-[5px]`}
            >
                {imagePreview ? (
                    <>
                        <Image
                            src={imagePreview}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                        >
                            ×
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-2">
                        <svg
                            className={`${iconSizes[size]} text-gray-400`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-xs text-gray-500 font-medium text-center px-1">
                            Bild hochladen
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

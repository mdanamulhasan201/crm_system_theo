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
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const processFile = (file: File) => {
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

    // Use imagePreview (internal state) if available, otherwise use initialImage prop
    // This ensures uploaded images show immediately
    const displayImage = imagePreview || initialImage;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
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

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    // Sync initialImage with state when it changes
    useEffect(() => {
        setImagePreview(initialImage);
        if (initialImage === null) {
            setImageFile(null);
        }
    }, [initialImage]);

    return (
        <div className={`shrink-0 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
            <div
                ref={dropZoneRef}
                onClick={handleImageClick}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`w-full aspect-square border-2 border-dashed ${
                    isDragging ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"
                } rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden`}
            >
                {displayImage ? (
                    <>
                        <div className="relative w-full h-full aspect-square">
                            <Image
                                src={displayImage}
                                alt="Uploaded image"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-lg z-10 transition-colors"
                        >
                            ×
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                        {/* Upload Icon - upward arrow in square */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            {/* Square border */}
                            <div className="absolute inset-0 border-2 border-gray-400 rounded-sm"></div>
                            {/* Upward arrow icon */}
                            <svg
                                className="w-8 h-8 text-gray-400 relative z-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                            <span className="text-base font-medium text-gray-700">
                                Bild hochladen
                            </span>
                            <span className="text-sm text-gray-500">
                                Drag & Drop oder Klicken
                            </span>
                        </div>
                        
                        {/* Recommendation text */}
                        <p className="text-xs text-gray-400 mt-2">
                            Empfohlen: quadratisch, min. 800x800
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

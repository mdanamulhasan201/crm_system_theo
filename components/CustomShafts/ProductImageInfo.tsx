'use client';
import React, { useRef } from 'react';
import Image from 'next/image';

interface ProductImageInfoProps {
  shaft: {
    name: string;
    ide: string;
    description: string;
    price: number;
    image: string;
  };
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
}

export default function ProductImageInfo({ shaft, uploadedImage, setUploadedImage }: ProductImageInfoProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only handle image files
    if (!file.type.startsWith('image/')) {
      // Silently ignore non-image files; toast not available in this component
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the upload click
    setUploadedImage(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-10 items-start">
      {/* Image */}
      <div className="w-full md:w-1/2 flex justify-start mb-8">
        <div className="relative group">
          <button
            type="button"
            onClick={handleImageClick}
            className="relative block focus:outline-none cursor-pointer"
          >
            <Image
              src={uploadedImage || shaft.image}
              alt={shaft.name}
              width={1000}
              height={1000}
              className="w-[400px] h-auto object-cover rounded-md border border-gray-200"
              priority
            />
            <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="px-3 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-md">
                Bild hochladen
              </span>
            </div>
          </button>
          
          {/* Remove button - only show when image is uploaded */}
          {uploadedImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-10"
              title="Bild entfernen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Product info section */}
      <div className="w-full md:w-1/2 flex flex-col">
        <h2 className="text-2xl font-bold mb-1">{shaft.name}</h2>
        <p className="text-gray-500 text-sm font-medium mb-4">#{shaft.ide}</p>
        <p className="text-lg font-medium mb-6">{shaft.description}</p>
        <div className="mt-2">
          <span className="text-xs text-gray-500 block mb-1">
            Preis <span className="text-[10px]">(wird automatisch aktualisiert)</span>
          </span>
          <span className="text-3xl font-extrabold tracking-tight">
            {shaft.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>
    </div>
  );
}

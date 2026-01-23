'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface ProductImageUploadInfoProps {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  productDescription: string;
  setProductDescription: (description: string) => void;
  basePrice: number;
}

export default function ProductImageUploadInfo({
  uploadedImage,
  setUploadedImage,
  productDescription,
  setProductDescription,
  basePrice,
}: ProductImageUploadInfoProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only handle image files
    if (!file.type.startsWith('image/')) {
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
    e.stopPropagation();
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
            className="relative block focus:outline-none cursor-pointer w-full"
          >
            {uploadedImage ? (
              <div className="relative">
                <Image
                  src={uploadedImage}
                  alt="Product image"
                  width={1000}
                  height={1000}
                  className="w-[400px] h-auto object-cover rounded-md border border-gray-200"
                  priority
                />
                {/* Custom Made #1000 overlay - centered on image */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-white uppercase tracking-wide bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm">
                    Custom Made #1000
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-[400px] h-[300px] border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 font-medium">Bild hochladen</span>
                <span className="text-xs text-gray-400 mt-1">Klicken Sie hier, um ein Bild auszuwählen</span>
              </div>
            )}
            <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-md">
                {uploadedImage ? 'Bild ändern' : 'Bild hochladen'}
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
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="productDescription" className="text-sm font-medium text-gray-700">
            Beschreibung:
          </Label>
          <textarea
            id="productDescription"
            placeholder="Produktbeschreibung eingeben..."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="min-h-[100px] p-3 border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div className="mt-2">
          <span className="text-xs text-gray-500 block mb-1">
            Preis <span className="text-[10px]">(wird automatisch aktualisiert)</span>
          </span>
          <span className="text-3xl font-extrabold tracking-tight">
            {basePrice > 0 
              ? basePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
              : '0,00 €'}
          </span>
        </div>
      </div>
    </div>
  );
}


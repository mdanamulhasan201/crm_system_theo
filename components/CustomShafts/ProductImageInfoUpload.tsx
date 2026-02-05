'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shouldUnoptimizeImage } from '@/lib/imageUtils';

interface ProductImageInfoUploadProps {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  productName: string;
  setProductName: (name: string) => void;
  productId: string;
  setProductId: (id: string) => void;
  productDescription: string;
  setProductDescription: (description: string) => void;
  productPrice: number;
  setProductPrice: (price: number) => void;
}

export default function ProductImageInfoUpload({
  uploadedImage,
  setUploadedImage,
  productName,
  setProductName,
  productId,
  setProductId,
  productDescription,
  setProductDescription,
  productPrice,
  setProductPrice,
}: ProductImageInfoUploadProps) {
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
              <Image
                src={uploadedImage}
                alt="Product"
                width={1000}
                height={1000}
                className="w-[400px] h-auto object-cover rounded-md border border-gray-200"
                priority
                unoptimized={shouldUnoptimizeImage(uploadedImage)}
              />
            ) : (
              <div className="w-[400px] h-[300px] border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Bild hochladen</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
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
          <Label className="text-sm font-medium text-gray-700">Produktname:</Label>
          <Input
            type="text"
            placeholder="Produktname eingeben..."
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="border-gray-300"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-gray-700">Produkt-ID:</Label>
          <Input
            type="text"
            placeholder="Produkt-ID eingeben..."
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="border-gray-300"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-gray-700">Beschreibung:</Label>
          <Input
            type="text"
            placeholder="Beschreibung eingeben..."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            className="border-gray-300"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-gray-700">Preis:</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={productPrice || ''}
            onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
            className="border-gray-300"
            step="0.01"
            min="0"
          />
          <span className="text-xs text-gray-500">
            Preis <span className="text-[10px]">(wird automatisch aktualisiert)</span>
          </span>
        </div>
      </div>
    </div>
  );
}


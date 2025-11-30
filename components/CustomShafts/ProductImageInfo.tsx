'use client';
import React from 'react';
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

export default function ProductImageInfo({ shaft, uploadedImage }: ProductImageInfoProps) {
  return (
    <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
      {/* Image */}
      <div className="w-full md:w-1/2 flex justify-center my-10">
        <div className="w-full h-full">
          <Image
            src={uploadedImage || shaft.image}
            alt={shaft.name}
            width={1000}
            height={1000}
            className="w-[550px] h-full object-cover"
            priority
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

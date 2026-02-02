'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageInfoProps {
  shaft: {
    name: string;
    ide: string;
    description: string;
    price: number;
    image: string;
  };
}

export default function ProductImageInfo({ shaft }: ProductImageInfoProps) {
  const [useFallback, setUseFallback] = useState(false);

  // Ensure image URL is valid
  const imageUrl = shaft?.image || '';

  if (!imageUrl) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start">
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
          <div className="w-full max-w-[400px] aspect-square bg-gray-200 rounded-md border border-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Kein Bild verfügbar</span>
          </div>
        </div>
        {/* Product info section */}
        <div className="w-full lg:w-1/2 flex flex-col text-center lg:text-left">
          <h2 className="text-xl md:text-2xl font-bold mb-1">{shaft.name}</h2>
          <p className="text-gray-500 text-sm font-medium mb-4">#{shaft.ide}</p>
          <p className="text-base md:text-lg font-medium mb-6">{shaft.description}</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500 block mb-1">
              Preis <span className="text-[10px]">(wird automatisch aktualisiert)</span>
            </span>
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {shaft.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center mb-10">
      {/* Image - Read only, only from backend */}
      <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
        <div className="relative w-full max-w-[400px]">
          {!useFallback ? (
            <Image
              src={imageUrl}
              alt={shaft.name || 'Product image'}
              width={1000}
              height={1000}
              className="w-full h-auto object-cover rounded-md border border-gray-200"
              priority
              unoptimized={true}
              onError={() => {
                console.warn('Next.js Image failed, using fallback img tag');
                setUseFallback(true);
              }}
            />
          ) : (
            <img
              src={imageUrl}
              alt={shaft.name || 'Product image'}
              className="w-full h-auto object-cover rounded-md border border-gray-200"
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </div>

      {/* Product info section */}
      <div className="w-full lg:w-1/2 flex flex-col text-center lg:text-left">
        <h2 className="text-xl md:text-2xl font-bold mb-1">{shaft.name}</h2>
        <p className="text-gray-500 text-sm font-medium mb-4">#{shaft.ide}</p>
        <p className="text-base md:text-lg font-medium mb-6">{shaft.description}</p>
        <div className="mt-2">
          <span className="text-xs text-gray-500 block mb-1">
            Preis <span className="text-[10px]">(wird automatisch aktualisiert)</span>
          </span>
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {shaft.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>
    </div>
  );
}

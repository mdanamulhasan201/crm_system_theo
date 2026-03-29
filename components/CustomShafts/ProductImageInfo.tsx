'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { shouldUnoptimizeImage } from '@/lib/imageUtils';

interface ProductImageInfoProps {
  shaft: {
    name: string;
    ide: string;
    description: string;
    price: number;
    image: string;
  };
  /** CAD + Kategorie in the same card below a divider */
  footer?: React.ReactNode;
}

export default function ProductImageInfo({ shaft, footer }: ProductImageInfoProps) {
  const [useFallback, setUseFallback] = useState(false);

  const showPrices =
    typeof window !== 'undefined' ? localStorage.getItem('customShafts_showPrices') !== 'false' : true;

  const imageUrl = shaft?.image || '';

  const productBlock = (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
      {/* Image */}
      <div className="flex w-full justify-center lg:w-[42%] lg:max-w-[min(100%,380px)] lg:justify-start lg:shrink-0">
        {!imageUrl ? (
          <div className="flex aspect-square w-full max-w-[400px] items-center justify-center rounded-xl border border-gray-200 bg-[#faf9f7]">
            <span className="text-sm text-gray-400">Kein Bild verfügbar</span>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 ">
            {!useFallback ? (
              <Image
                src={imageUrl}
                alt={shaft.name || 'Product image'}
                width={1000}
                height={1000}
                className="h-auto w-full rounded-lg object-contain"
                priority
                unoptimized={shouldUnoptimizeImage(imageUrl)}
                onError={() => {
                  console.warn('Next.js Image failed, using fallback img tag');
                  setUseFallback(true);
                }}
              />
            ) : (
              <img
                src={imageUrl}
                alt={shaft.name || 'Product image'}
                className="h-auto w-full rounded-lg object-contain"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex min-w-0 flex-1 flex-col text-center lg:text-left">
        <h2 className="mb-1 text-xl font-bold text-gray-900 md:text-2xl">{shaft.name}</h2>
        <p className="mb-3 text-sm font-medium text-gray-500">#{shaft.ide}</p>
        <p className="mx-auto mb-6 w-full max-w-[min(100%,34rem)] text-pretty text-base font-medium leading-relaxed text-gray-600 sm:max-w-xl sm:text-[17px] md:max-w-2xl md:text-lg lg:mx-0 lg:max-w-[min(100%,40rem)]">
          {shaft.description}
        </p>
        {showPrices && (
          <div className="mt-auto">
            <span className="mb-1 block text-xs text-gray-500">Preis</span>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
              {shaft.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {productBlock}
      {footer ? (
        <>
          <div className="my-6 border-t border-gray-200" />
          {footer}
        </>
      ) : null}
    </div>
  );
}

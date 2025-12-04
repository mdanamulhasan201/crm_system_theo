"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageWithShimmerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  index?: number;
}

const ImageWithShimmer: React.FC<ImageWithShimmerProps> = ({
  src,
  alt,
  width = 500,
  height = 500,
  className = "w-full h-full object-contain",
  priority = false,
  index = 0,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-64 mx-auto h-full object-contain p-4 flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-400">
          <svg
            className="w-16 h-16 mx-auto mb-2"
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
          <p className="text-xs">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 mx-auto h-full object-contain p-4 relative min-h-[256px] flex items-center justify-center">
      {/* Shimmer effect - always visible while loading, prevents blank space */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded z-20"></div>
      )}
      
      {/* Actual Image - shimmer hides when image fully loads */}
      <div className={`relative w-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    </div>
  );
};

export default ImageWithShimmer;

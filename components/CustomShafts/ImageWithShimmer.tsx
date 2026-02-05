"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { shouldUnoptimizeImage } from '@/lib/imageUtils';

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
  const [useFallback, setUseFallback] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setHasError(false);
      setUseFallback(false);
    }
  }, [src]);

  // Check if image is already loaded (cached) - SSR SAFE
  useEffect(() => {
    // Only run on client-side
    if (!src || typeof window === 'undefined') return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      const img = new window.Image();
      
      img.onload = () => {
        // Image is already cached/loaded, reduce loading time
        if (isMounted) {
          timeoutId = setTimeout(() => {
            if (isMounted) {
              setIsLoading(false);
            }
          }, 100);
        }
      };
      
      img.onerror = () => {
        // Don't set error here, let Next.js Image handle it first
        // Just don't update loading state
      };
      
      img.src = src;

      // Cleanup function
      return () => {
        isMounted = false;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // Safely remove event handlers
        if (img) {
          img.onload = null;
          img.onerror = null;
          img.src = ''; // Cancel image loading
        }
      };
    } catch (error) {
      // Silently fail if Image constructor is not available (SSR or browser compatibility)
      // Don't break the component
      if (process.env.NODE_ENV === 'development') {
        console.warn('Image preload failed (non-critical):', error);
      }
    }
  }, [src]);

  // Fallback to regular img tag if Next.js Image fails
  if (useFallback) {
    return (
      <div className="w-64 mx-auto h-full object-contain p-4 relative min-h-[256px] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded z-20"></div>
        )}
      </div>
    );
  }

  // Error state - show fallback img tag instead of error message
  if (hasError) {
    return (
      <div className="w-64 mx-auto h-full object-contain p-4 relative min-h-[256px] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={className}
          onError={(e) => {
            // Final fallback - hide image if it still fails
            e.currentTarget.style.display = 'none';
          }}
        />
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
          unoptimized={shouldUnoptimizeImage(src)}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
          }}
          onError={() => {
            // Try fallback img tag instead of showing error immediately
            setIsLoading(false);
            setUseFallback(true);
          }}
        />
      </div>
    </div>
  );
};

export default ImageWithShimmer;

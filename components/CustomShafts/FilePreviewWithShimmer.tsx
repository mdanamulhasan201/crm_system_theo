"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface FilePreviewWithShimmerProps {
  file: File | null;
  fileName: string;
}

const baseShimmer = "animate-pulse bg-gray-200 rounded";

const FilePreviewWithShimmer: React.FC<FilePreviewWithShimmerProps> = ({ file, fileName }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Check if it's an image file
    if (file.type.startsWith('image/')) {
      setIsLoading(true);
      setHasError(false);
      
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    } else {
      // For 3D files or other file types, no preview
      setPreviewUrl(null);
      setIsLoading(false);
    }
  }, [file]);

  if (!file) return null;

  // Only show preview for image files
  if (!file.type.startsWith('image/')) {
    return null;
  }

  if (hasError) {
    return (
      <div className="mt-2 p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600">Fehler beim Laden der Vorschau</p>
      </div>
    );
  }

  return (
    <div className="mt-2 relative">
      {/* Shimmer effect - shows while image is loading */}
      {isLoading && (
        <div className={`${baseShimmer} w-full h-48 rounded-lg`} />
      )}
      
      {/* Image preview - shimmer disappears immediately when image loads */}
      {previewUrl && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <Image
            src={previewUrl}
            alt={fileName}
            width={500}
            height={200}
            className="w-full h-auto max-h-48 object-contain"
            unoptimized={true}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FilePreviewWithShimmer;

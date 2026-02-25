// Shoe image with clickable markers

import React, { useState, useLayoutEffect, useCallback } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { LeatherColorAssignment } from '../types';
import { shouldUnoptimizeImage } from '@/lib/imageUtils';
import { getContainedImageRect, imagePercentToContainerPercent } from '../utils/imageCoordinates';

interface ShoeImageCanvasProps {
  shoeImage: string;
  imageRef: React.RefObject<HTMLDivElement | null>;
  assignments: LeatherColorAssignment[];
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRemoveAssignment: (index: number) => void;
}

/** Display rect for object-contain conversion (image % → container % for overlay) */
interface DisplayRect {
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
  containerW: number;
  containerH: number;
}

/**
 * Component for the clickable shoe image with markers.
 * Assignments use image percentage (0-100); we convert to container % for correct overlay position.
 */
export const ShoeImageCanvas: React.FC<ShoeImageCanvasProps> = ({
  shoeImage,
  imageRef,
  assignments,
  onImageClick,
  onRemoveAssignment,
}) => {
  const [displayRect, setDisplayRect] = useState<DisplayRect | null>(null);

  const updateRect = useCallback(() => {
    if (!imageRef.current) return;
    const container = imageRef.current.getBoundingClientRect();
    const img = imageRef.current.querySelector('img') as HTMLImageElement | null;
    if (!img?.naturalWidth || !img?.naturalHeight) return;
    const rect = getContainedImageRect(
      container.width,
      container.height,
      img.naturalWidth,
      img.naturalHeight
    );
    setDisplayRect({
      ...rect,
      containerW: container.width,
      containerH: container.height,
    });
  }, [imageRef]);

  useLayoutEffect(() => {
    if (!imageRef.current) return;
    updateRect();
    const container = imageRef.current;
    const img = container.querySelector('img') as HTMLImageElement | null;
    if (img && !img.complete) img.addEventListener('load', updateRect);
    const ro = new ResizeObserver(updateRect);
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (img) img.removeEventListener('load', updateRect);
    };
  }, [imageRef, updateRect, shoeImage]);

  // Image % (0-100) → container % for overlay so markers match painted image position
  const getMarkerStyle = (assignment: LeatherColorAssignment) => {
    if (!displayRect) {
      return { left: `${assignment.x}%`, top: `${assignment.y}%` };
    }
    const { left, top } = imagePercentToContainerPercent(
      assignment.x,
      assignment.y,
      displayRect,
      displayRect.containerW,
      displayRect.containerH
    );
    return { left: `${left}%`, top: `${top}%` };
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Schuhbild - Bereiche zuordnen:</Label>
      
      {/* Clickable Shoe Image */}
      <div
        ref={imageRef}
        className="relative w-full border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair bg-gray-100"
        onClick={onImageClick}
        style={{ minHeight: '400px' }}
      >
        <Image
          src={shoeImage}
          alt="Schuhbild"
          fill
          className="object-contain"
          unoptimized={shouldUnoptimizeImage(shoeImage)}
        />

        {/* Render assignment markers (position = container % from image %) */}
        {assignments.map((assignment, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={getMarkerStyle(assignment)}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveAssignment(index);
            }}
            title={`Leder ${assignment.leatherNumber} - ${assignment.color} (Klicken zum Entfernen)`}
          >
            <div className="w-11 h-11 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-base bg-emerald-500">
              {assignment.leatherNumber}
            </div>
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {assignment.color}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Anleitung:</strong> Wählen Sie für jeden Ledertyp einen Typ und einen Farbnamen aus dem Dropdown aus,
          dann klicken Sie auf das Schuhbild, um Bereiche zuzuordnen.
          Klicken Sie auf einen Marker, um ihn zu entfernen.
        </p>
      </div>
    </div>
  );
};

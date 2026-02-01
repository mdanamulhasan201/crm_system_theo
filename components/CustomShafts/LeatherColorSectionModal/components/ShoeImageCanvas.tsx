// Shoe image with clickable markers

import React from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { LeatherColorAssignment } from '../types';

interface ShoeImageCanvasProps {
  shoeImage: string;
  imageRef: React.RefObject<HTMLDivElement | null>;
  assignments: LeatherColorAssignment[];
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onRemoveAssignment: (index: number) => void;
}

/**
 * Component for the clickable shoe image with markers
 */
export const ShoeImageCanvas: React.FC<ShoeImageCanvasProps> = ({
  shoeImage,
  imageRef,
  assignments,
  onImageClick,
  onRemoveAssignment,
}) => {
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
          unoptimized={false}
        />

        {/* Render assignment markers */}
        {assignments.map((assignment, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${assignment.x}%`,
              top: `${assignment.y}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveAssignment(index);
            }}
            title={`Leder ${assignment.leatherNumber} - ${assignment.color} (Klicken zum Entfernen)`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs bg-emerald-500">
              {assignment.leatherNumber}
            </div>
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
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

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import Image from 'next/image';

export interface LeatherColorAssignment {
  x: number; // Percentage from left
  y: number; // Percentage from top
  leatherNumber: number; // 1, 2, or 3
  color: string;
}

interface LeatherColorSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignments: LeatherColorAssignment[], leatherColors: string[]) => void;
  numberOfColors: number; // 2 or 3
  shoeImage: string | null; // The uploaded shoe image
  initialAssignments?: LeatherColorAssignment[];
  initialLeatherColors?: string[];
}

// Color palette for visualization
const COLOR_PALETTE: Record<string, string> = {
  'Schwarz': '#000000',
  'Braun': '#8B4513',
  'Beige': '#F5F5DC',
  'Weiß': '#FFFFFF',
  'Grau': '#808080',
  'Blau': '#0000FF',
  'Rot': '#FF0000',
  'Grün': '#008000',
  'Navy': '#000080',
  'Burgundy': '#800020',
  'Tan': '#D2B48C',
  'Cognac': '#9F381D',
};

const getColorHex = (colorName: string): string => {
  if (COLOR_PALETTE[colorName]) {
    return COLOR_PALETTE[colorName];
  }
  const lowerColor = colorName.toLowerCase();
  for (const [key, value] of Object.entries(COLOR_PALETTE)) {
    if (key.toLowerCase() === lowerColor) {
      return value;
    }
  }
  const defaults = ['#8B4513', '#000000', '#F5F5DC'];
  return defaults[0] || '#CCCCCC';
};

export default function LeatherColorSectionModal({
  isOpen,
  onClose,
  onSave,
  numberOfColors,
  shoeImage,
  initialAssignments = [],
  initialLeatherColors = [],
}: LeatherColorSectionModalProps) {
  const [leatherColors, setLeatherColors] = useState<string[]>(() => {
    if (initialLeatherColors.length === numberOfColors) {
      return initialLeatherColors;
    }
    return Array(numberOfColors).fill('');
  });

  const [assignments, setAssignments] = useState<LeatherColorAssignment[]>(() => {
    return [...initialAssignments];
  });

  const [selectedLeatherNumber, setSelectedLeatherNumber] = useState<number>(1);
  const imageRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes or numberOfColors changes
  useEffect(() => {
    if (isOpen) {
      if (initialLeatherColors.length === numberOfColors) {
        setLeatherColors(initialLeatherColors);
      } else {
        setLeatherColors(Array(numberOfColors).fill(''));
      }
      setAssignments([...initialAssignments]);
      setSelectedLeatherNumber(1);
    }
  }, [isOpen, numberOfColors, initialAssignments, initialLeatherColors]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !shoeImage) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if color is defined for selected leather number
    const colorIndex = selectedLeatherNumber - 1;
    if (!leatherColors[colorIndex] || !leatherColors[colorIndex].trim()) {
      toast.error(`Bitte geben Sie zuerst eine Farbe für Leder ${selectedLeatherNumber} ein.`);
      return;
    }

    // Add new assignment
    const newAssignment: LeatherColorAssignment = {
      x,
      y,
      leatherNumber: selectedLeatherNumber,
      color: leatherColors[colorIndex],
    };

    setAssignments([...assignments, newAssignment]);
  };

  const handleLeatherColorChange = (index: number, color: string) => {
    const newColors = [...leatherColors];
    newColors[index] = color;
    setLeatherColors(newColors);
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate that all leather colors are filled
    if (leatherColors.some((color) => !color.trim())) {
      toast.error('Bitte geben Sie für alle Ledertypen eine Farbe ein.');
      return;
    }

    if (assignments.length === 0) {
      toast.error('Bitte klicken Sie auf das Schuhbild, um Bereiche zuzuordnen.');
      return;
    }

    onSave(assignments, leatherColors);
    onClose();
  };

  const getColorForLeather = (leatherNumber: number): string => {
    const colorIndex = leatherNumber - 1;
    const colorName = leatherColors[colorIndex];
    if (!colorName) return '#CCCCCC';
    return getColorHex(colorName);
  };

  if (!shoeImage) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ledertypen den Schuhbereichen zuordnen</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-gray-500">
            Bitte laden Sie zuerst ein Schuhbild hoch.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ledertypen den Schuhbereichen zuordnen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Leather Color Inputs */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Ledertypen definieren:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: numberOfColors }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`leather-${index + 1}`} className="text-sm font-medium">
                    Leder {index + 1}:
                  </Label>
                  <Input
                    id={`leather-${index + 1}`}
                    type="text"
                    placeholder={`Lederfarbe ${index + 1} eingeben...`}
                    value={leatherColors[index] || ''}
                    onChange={(e) => handleLeatherColorChange(index, e.target.value)}
                    className="w-full"
                  />
                  {leatherColors[index] && (
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: getColorHex(leatherColors[index]) }}
                      />
                      <span className="text-xs text-gray-600">{leatherColors[index]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Color Selection Buttons */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Aktiver Ledertyp zum Zuweisen:</Label>
            <div className="flex gap-3">
              {Array.from({ length: numberOfColors }, (_, index) => {
                const leatherNum = index + 1;
                const isSelected = selectedLeatherNumber === leatherNum;
                const colorName = leatherColors[index];
                return (
                  <Button
                    key={index}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => setSelectedLeatherNumber(leatherNum)}
                    className={`flex items-center gap-2 ${
                      isSelected ? 'bg-black text-white' : ''
                    }`}
                    disabled={!colorName || !colorName.trim()}
                  >
                    {colorName && (
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: getColorHex(colorName) }}
                      />
                    )}
                    Leder {leatherNum}
                    {isSelected && ' ✓'}
                  </Button>
                );
              })}
            </div>
            <p className="text-sm text-gray-600">
              Klicken Sie auf das Schuhbild, um Bereiche dem ausgewählten Ledertyp zuzuordnen.
            </p>
          </div>

          {/* Shoe Image with Clickable Areas */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Schuhbild - Bereiche zuordnen:</Label>
            <div
              ref={imageRef}
              className="relative w-full border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair bg-gray-100"
              onClick={handleImageClick}
              style={{ minHeight: '400px' }}
            >
              <Image
                src={shoeImage}
                alt="Schuhbild"
                fill
                className="object-contain"
                unoptimized
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
                    handleRemoveAssignment(index);
                  }}
                  title={`Leder ${assignment.leatherNumber} - ${assignment.color} (Klicken zum Entfernen)`}
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
                    style={{
                      backgroundColor: getColorForLeather(assignment.leatherNumber),
                    }}
                  >
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
                <strong>Anleitung:</strong> Wählen Sie einen Ledertyp aus, geben Sie die Farbe ein, 
                dann klicken Sie auf das Schuhbild, um Bereiche zuzuordnen. 
                Klicken Sie auf einen Marker, um ihn zu entfernen.
              </p>
            </div>

            {/* Assignments Summary */}
            {assignments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Zugeordnete Bereiche ({assignments.length}):</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {assignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded border bg-gray-50"
                    >
                      <div
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: getColorForLeather(assignment.leatherNumber),
                        }}
                      />
                      <span>
                        Leder {assignment.leatherNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

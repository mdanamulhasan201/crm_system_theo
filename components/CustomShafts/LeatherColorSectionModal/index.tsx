'use client';

/**
 * LeatherColorSectionModal
 * 
 * A modal for assigning leather types and colors to different areas of a shoe image.
 * Users can:
 * 1. Define leather types and color names for each leather (2 or 3 types)
 * 2. Click on the shoe image to mark areas with specific leather types
 * 3. Remove markers by clicking on them
 * 4. Generate a painted image with all markers for visual reference
 * 
 * The modal uses a sophisticated image loading strategy to handle CORS issues
 * and ensure the painted image can be generated successfully.
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

// Types
import { LeatherColorSectionModalProps, LeatherColorAssignment } from './types';

// Utilities
import { getColorHex } from './constants';
import { validateLeatherColors } from './utils/validation';

// Custom Hooks
import { useCanvasPainting } from './hooks/useCanvasPainting';

// Sub-components
import {
  LeatherTypeSelector,
  LeatherTypeSelectorButtons,
  ShoeImageCanvas,
  AssignmentsSummary,
} from './components';

export type { LeatherColorAssignment } from './types';

/**
 * Main modal component for leather color assignment
 */
export default function LeatherColorSectionModal({
  isOpen,
  onClose,
  onSave,
  numberOfColors,
  shoeImage,
  initialAssignments = [],
  initialLeatherColors = [],
}: LeatherColorSectionModalProps) {
  // ===== State Management =====
  const [leatherColors, setLeatherColors] = useState<string[]>(() => {
    if (initialLeatherColors.length === numberOfColors) {
      return initialLeatherColors;
    }
    return Array(numberOfColors).fill('');
  });

  const [leatherColorNames, setLeatherColorNames] = useState<string[]>(() => {
    return Array(numberOfColors).fill('');
  });

  const [assignments, setAssignments] = useState<LeatherColorAssignment[]>(() => {
    return [...initialAssignments];
  });

  const [selectedLeatherNumber, setSelectedLeatherNumber] = useState<number>(1);

  // ===== Custom Hooks =====
  const { imageRef, createPaintedImage } = useCanvasPainting({
    shoeImage,
    assignments,
    getColorForLeather: (leatherNumber: number) => {
      const colorIndex = leatherNumber - 1;
      const colorName = leatherColors[colorIndex];
      if (!colorName) return '#CCCCCC';
      return getColorHex(colorName);
    },
  });

  // ===== Effects =====
  // Reset state when modal opens/closes or numberOfColors changes
  useEffect(() => {
    if (isOpen) {
      if (initialLeatherColors.length === numberOfColors) {
        setLeatherColors(initialLeatherColors);
      } else {
        setLeatherColors(Array(numberOfColors).fill(''));
      }
      setLeatherColorNames(Array(numberOfColors).fill(''));
      setAssignments([...initialAssignments]);
      setSelectedLeatherNumber(1);
    }
  }, [isOpen, numberOfColors, initialAssignments, initialLeatherColors]);

  // ===== Event Handlers =====
  
  /**
   * Handle click on shoe image to add assignment marker
   */
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !shoeImage) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Validate leather type is selected
    const colorIndex = selectedLeatherNumber - 1;
    if (!leatherColors[colorIndex] || !leatherColors[colorIndex].trim()) {
      toast.error(`Bitte wählen Sie zuerst einen Ledertyp für Leder ${selectedLeatherNumber} aus.`);
      return;
    }

    // Validate color name is entered
    if (!leatherColorNames[colorIndex] || !leatherColorNames[colorIndex].trim()) {
      toast.error(`Bitte wählen Sie zuerst einen Farbnamen für Leder ${selectedLeatherNumber} aus.`);
      return;
    }

    // Create new assignment
    const colorName = leatherColorNames[colorIndex] || '';
    const newAssignment: LeatherColorAssignment = {
      x,
      y,
      leatherNumber: selectedLeatherNumber,
      color: colorName ? `${leatherColors[colorIndex]} - ${colorName}` : leatherColors[colorIndex],
    };

    setAssignments([...assignments, newAssignment]);
  };

  /**
   * Handle leather type change
   */
  const handleLeatherColorChange = (index: number, color: string) => {
    const newColors = [...leatherColors];
    newColors[index] = color;
    setLeatherColors(newColors);
  };

  /**
   * Handle leather color name change
   */
  const handleLeatherColorNameChange = (index: number, colorName: string) => {
    const newColorNames = [...leatherColorNames];
    newColorNames[index] = colorName;
    setLeatherColorNames(newColorNames);
  };

  /**
   * Handle removing an assignment marker
   */
  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  /**
   * Handle save - validate and generate painted image
   */
  const handleSave = async () => {
    // Validate leather types
    if (!validateLeatherColors(leatherColors)) {
      toast.error('Bitte wählen Sie für alle Ledertypen einen Typ aus.');
      return;
    }

    // Validate color names
    if (!validateLeatherColors(leatherColorNames)) {
      toast.error('Bitte geben Sie für alle Ledertypen einen Farbnamen ein.');
      return;
    }

    // Validate assignments exist
    if (assignments.length === 0) {
      toast.error('Bitte klicken Sie auf das Schuhbild, um Bereiche zuzuordnen.');
      return;
    }

    // Combine leather type and color name
    const leatherColorsWithNames = leatherColors.map((type, index) => {
      const colorName = leatherColorNames[index] || '';
      return colorName ? `${type} - ${colorName}` : type;
    });

    // Generate painted image
    let paintedImage: string | null = null;
    if (shoeImage && imageRef.current) {
      paintedImage = await createPaintedImage();
    }

    // Show success message only if image generation succeeded without CORS issues
    if (paintedImage) {
      toast.success('Ledertypen-Zuordnung erfolgreich gespeichert!');
    }

    // Always save - even if painted image failed
    onSave(assignments, leatherColorsWithNames, paintedImage);
    onClose();
  };

  // ===== Render =====

  // Handle case where no shoe image is provided
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
          {/* Leather Type Selector */}
          <LeatherTypeSelector
            numberOfColors={numberOfColors}
            leatherColors={leatherColors}
            leatherColorNames={leatherColorNames}
            onLeatherColorChange={handleLeatherColorChange}
            onLeatherColorNameChange={handleLeatherColorNameChange}
          />

          {/* Active Leather Type Selector Buttons */}
          <LeatherTypeSelectorButtons
            numberOfColors={numberOfColors}
            selectedLeatherNumber={selectedLeatherNumber}
            leatherColors={leatherColors}
            leatherColorNames={leatherColorNames}
            onSelectLeatherNumber={setSelectedLeatherNumber}
          />

          {/* Shoe Image Canvas */}
          <ShoeImageCanvas
            shoeImage={shoeImage}
            imageRef={imageRef}
            assignments={assignments}
            onImageClick={handleImageClick}
            onRemoveAssignment={handleRemoveAssignment}
          />

          {/* Assignments Summary */}
          <AssignmentsSummary assignments={assignments} />
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


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
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Types
import { LeatherColorSectionModalProps, LeatherColorAssignment } from './types';

// Utilities
import { getColorHex } from './constants';
import { validateLeatherColors } from './utils/validation';
import { getContainedImageRect, containerClickToImagePercent } from './utils/imageCoordinates';

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

  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(false);
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
   * Handle click on shoe image to add assignment marker.
   * Converts click to image percentage (0-100) so payload and painted image use same position.
   */
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !shoeImage) return;

    const containerRect = imageRef.current.getBoundingClientRect();
    const img = imageRef.current.querySelector('img') as HTMLImageElement | null;
    if (!img?.naturalWidth || !img?.naturalHeight) {
      // Fallback to container % if img not ready
      const x = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const y = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      return addAssignmentAt(x, y);
    }

    const displayed = getContainedImageRect(
      containerRect.width,
      containerRect.height,
      img.naturalWidth,
      img.naturalHeight
    );
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    const { x, y } = containerClickToImagePercent(
      clickX,
      clickY,
      displayed,
      containerRect.width,
      containerRect.height
    );
    addAssignmentAt(x, y);
  };

  const addAssignmentAt = (x: number, y: number) => {
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

    // Create new assignment (x, y are image percentage 0-100 so payload matches position)
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

    setIsSaving(true);
    try {
      // Combine leather type and color name (index 0 = Leder 1, index 1 = Leder 2, index 2 = Leder 3)
      const leatherColorsWithNames = leatherColors.map((type, index) => {
        const colorName = leatherColorNames[index] || '';
        return colorName ? `${type} - ${colorName}` : type;
      });

      // Sort assignments by leatherNumber (1, 2, 3) then position so payload and image use same order
      const sortedAssignments = [...assignments].sort(
        (a, b) =>
          a.leatherNumber - b.leatherNumber ||
          a.y - b.y ||
          a.x - b.x
      );

      // Generate painted image with sorted order so image matches payload numbering
      let paintedImage: string | null = null;
      if (shoeImage && imageRef.current) {
        paintedImage = await createPaintedImage(sortedAssignments);
      }

      // Show success message only if image generation succeeded without CORS issues
      if (paintedImage) {
        toast.success('Ledertypen-Zuordnung erfolgreich gespeichert!');
      }

      // Always save with sorted assignments so payload order matches numbering (1, 2, 3)
      onSave(sortedAssignments, leatherColorsWithNames, paintedImage);
      onClose();
    } finally {
      setIsSaving(false);
    }
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
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-black text-white hover:bg-gray-800 min-w-[120px]">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              'Speichern'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


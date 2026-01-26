'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  onSave: (assignments: LeatherColorAssignment[], leatherColors: string[], paintedImage?: string | null) => void;
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

// Map leather type values to display names
const LEATHER_TYPE_DISPLAY: Record<string, string> = {
  'kalbleder-vitello': 'Kalbleder Vitello',
  'nappa': 'Nappa (weiches Glattleder)',
  'nubukleder': 'Nubukleder',
  'softvelourleder': 'Softvelourleder',
  'hirschleder-gemustert': 'Hirschleder Gemustert',
  'performance-textil': 'Performance Textil',
  'fashion-mesh-gepolstert': 'Fashion Mesh Gepolstert',
  'soft-touch-material-gepraegt': 'Soft Touch Material - Geprägt',
  'textil-python-effekt': 'Textil Python-Effekt',
  'glitter': 'Glitter',
  'luxury-glitter-fabric': 'Luxury Glitter Fabric',
  'metallic-finish': 'Metallic Finish',
};

const getLeatherTypeDisplayName = (value: string): string => {
  return LEATHER_TYPE_DISPLAY[value] || value;
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

  const [leatherColorNames, setLeatherColorNames] = useState<string[]>(() => {
    // Initialize with empty strings for each leather
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
      setLeatherColorNames(Array(numberOfColors).fill(''));
      setAssignments([...initialAssignments]);
      setSelectedLeatherNumber(1);
    }
  }, [isOpen, numberOfColors, initialAssignments, initialLeatherColors]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !shoeImage) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if leather type is defined for selected leather number
    const colorIndex = selectedLeatherNumber - 1;
    if (!leatherColors[colorIndex] || !leatherColors[colorIndex].trim()) {
      toast.error(`Bitte wählen Sie zuerst einen Ledertyp für Leder ${selectedLeatherNumber} aus.`);
      return;
    }

    // Check if color name is defined for selected leather number
    if (!leatherColorNames[colorIndex] || !leatherColorNames[colorIndex].trim()) {
      toast.error(`Bitte wählen Sie zuerst einen Farbnamen für Leder ${selectedLeatherNumber} aus.`);
      return;
    }

    // Add new assignment with color name
    const colorName = leatherColorNames[colorIndex] || '';
    const newAssignment: LeatherColorAssignment = {
      x,
      y,
      leatherNumber: selectedLeatherNumber,
      color: colorName ? `${leatherColors[colorIndex]} - ${colorName}` : leatherColors[colorIndex],
    };

    setAssignments([...assignments, newAssignment]);
  };

  const handleLeatherColorChange = (index: number, color: string) => {
    const newColors = [...leatherColors];
    newColors[index] = color;
    setLeatherColors(newColors);
  };

  const handleLeatherColorNameChange = (index: number, colorName: string) => {
    const newColorNames = [...leatherColorNames];
    newColorNames[index] = colorName;
    setLeatherColorNames(newColorNames);
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validate that all leather types are selected
    if (leatherColors.some((color) => !color.trim())) {
      toast.error('Bitte wählen Sie für alle Ledertypen einen Typ aus.');
      return;
    }

    // Validate that all color names are entered
    if (leatherColorNames.some((colorName) => !colorName.trim())) {
      toast.error('Bitte geben Sie für alle Ledertypen einen Farbnamen ein.');
      return;
    }

    if (assignments.length === 0) {
      toast.error('Bitte klicken Sie auf das Schuhbild, um Bereiche zuzuordnen.');
      return;
    }

    // Combine leather type and color name for each leather
    const leatherColorsWithNames = leatherColors.map((type, index) => {
      const colorName = leatherColorNames[index] || '';
      return colorName ? `${type} - ${colorName}` : type;
    });

    // Generate painted image with all assignments
    let paintedImage: string | null = null;
    
    if (shoeImage && imageRef.current) {
      try {
        paintedImage = await generatePaintedImage();
      } catch (error) {
        console.error('Error generating painted image:', error);
        toast.error('Fehler beim Erstellen des markierten Bildes.');
      }
    }

    onSave(assignments, leatherColorsWithNames, paintedImage);
    onClose();
  };

  const generatePaintedImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!shoeImage || !imageRef.current) {
        console.error('No shoe image or imageRef available');
        reject('No image available');
        return;
      }

      const canvas = document.createElement('canvas');
      // Use native browser Image constructor, not Next.js Image component
      const img = new window.Image();
      
      // Only set crossOrigin for external URLs, not for data URLs or local paths
      if (shoeImage.startsWith('http') && !shoeImage.includes(window.location.hostname)) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject('Could not get canvas context');
          return;
        }

        // Draw base image
        ctx.drawImage(img, 0, 0);

        // Draw all assignments on top
        assignments.forEach((assignment) => {
          const x = (assignment.x / 100) * canvas.width;
          const y = (assignment.y / 100) * canvas.height;
          const color = getColorForLeather(assignment.leatherNumber);

          // Draw marker circle
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, 2 * Math.PI);
          ctx.fill();

          // Draw white border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Draw leather number
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(assignment.leatherNumber.toString(), x, y);
        });

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject('Failed to load image');
      };

      img.src = shoeImage;
    });
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
          {/* Leather Type Dropdowns */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Ledertypen definieren:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: numberOfColors }, (_, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`leather-${index + 1}`} className="text-sm font-medium">
                    Leder {index + 1}:
                  </Label>
                  <Select
                    value={leatherColors[index] || ''}
                    onValueChange={(value) => handleLeatherColorChange(index, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Ledertyp ${index + 1} wählen...`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className='cursor-pointer' value="kalbleder-vitello">Kalbleder Vitello</SelectItem>
                      <SelectItem className='cursor-pointer' value="nappa">Nappa (weiches Glattleder)</SelectItem>
                      <SelectItem className='cursor-pointer' value="nubukleder">Nubukleder</SelectItem>
                      <SelectItem className='cursor-pointer' value="softvelourleder">Softvelourleder</SelectItem>
                      <SelectItem className='cursor-pointer' value="hirschleder-gemustert">Hirschleder Gemustert</SelectItem>
                      <SelectItem className='cursor-pointer' value="performance-textil">Performance Textil</SelectItem>
                      <SelectItem className='cursor-pointer' value="fashion-mesh-gepolstert">Fashion Mesh Gepolstert</SelectItem>
                      <SelectItem className='cursor-pointer' value="soft-touch-material-gepraegt">Soft Touch Material - Geprägt</SelectItem>
                      <SelectItem className='cursor-pointer' value="textil-python-effekt">Textil Python-Effekt</SelectItem>
                      <SelectItem className='cursor-pointer' value="glitter">Glitter</SelectItem>
                      <SelectItem className='cursor-pointer' value="luxury-glitter-fabric">Luxury Glitter Fabric</SelectItem>
                      <SelectItem className='cursor-pointer' value="metallic-finish">Metallic Finish</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Color Name Field - Text Input */}
                  <div className="space-y-1">
                    <Label htmlFor={`color-${index + 1}`} className="text-sm font-medium">
                      Farbname:
                    </Label>
                    <Input
                      id={`color-${index + 1}`}
                      type="text"
                      placeholder={`Farbe ${index + 1} eingeben...`}
                      value={leatherColorNames[index] || ''}
                      onChange={(e) => handleLeatherColorNameChange(index, e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leather Type Selection Buttons */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Aktiver Ledertyp zum Zuweisen:</Label>
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: numberOfColors }, (_, index) => {
                const leatherNum = index + 1;
                const isSelected = selectedLeatherNumber === leatherNum;
                const leatherTypeValue = leatherColors[index];
                const colorName = leatherColorNames[index] || '';
                const displayName = leatherTypeValue ? getLeatherTypeDisplayName(leatherTypeValue) : '';
                const displayText = colorName ? `${displayName} (${colorName})` : displayName;
                return (
                  <Button
                    key={index}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => setSelectedLeatherNumber(leatherNum)}
                    className={`flex items-center gap-2 ${
                      isSelected ? 'bg-black text-white' : ''
                    }`}
                    disabled={!leatherTypeValue || !leatherTypeValue.trim() || !colorName || !colorName.trim()}
                  >
                    Leder {leatherNum}
                    {displayText && ` - ${displayText}`}
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
                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs bg-emerald-500"
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
                <strong>Anleitung:</strong> Wählen Sie für jeden Ledertyp einen Typ und einen Farbnamen aus dem Dropdown aus, 
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
                        className="w-4 h-4 rounded border bg-emerald-500"
                      />
                      <span>
                        Leder {assignment.leatherNumber} - {assignment.color}
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

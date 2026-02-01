// Leather type selector component

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_LEATHER_TYPES, getLeatherTypeDisplayName } from '../constants';

interface LeatherTypeSelectorProps {
  numberOfColors: number;
  leatherColors: string[];
  leatherColorNames: string[];
  onLeatherColorChange: (index: number, color: string) => void;
  onLeatherColorNameChange: (index: number, colorName: string) => void;
}

/**
 * Component for selecting leather types and color names
 */
export const LeatherTypeSelector: React.FC<LeatherTypeSelectorProps> = ({
  numberOfColors,
  leatherColors,
  leatherColorNames,
  onLeatherColorChange,
  onLeatherColorNameChange,
}) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Ledertypen definieren:</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: numberOfColors }, (_, index) => (
          <div key={index} className="space-y-2">
            {/* Leather Type Dropdown */}
            <Label htmlFor={`leather-${index + 1}`} className="text-sm font-medium">
              Leder {index + 1}:
            </Label>
            <Select
              value={leatherColors[index] || ''}
              onValueChange={(value) => onLeatherColorChange(index, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={`Ledertyp ${index + 1} wählen...`} />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_LEATHER_TYPES.map((type) => (
                  <SelectItem 
                    key={type} 
                    className="cursor-pointer" 
                    value={type}
                  >
                    {getLeatherTypeDisplayName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Color Name Field */}
            <div className="space-y-1">
              <Label htmlFor={`color-${index + 1}`} className="text-sm font-medium">
                Farbname:
              </Label>
              <Input
                id={`color-${index + 1}`}
                type="text"
                placeholder={`Farbe ${index + 1} eingeben...`}
                value={leatherColorNames[index] || ''}
                onChange={(e) => onLeatherColorNameChange(index, e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


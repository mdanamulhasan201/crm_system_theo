// Active leather type selector buttons

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getLeatherTypeDisplayName } from '../constants';

interface LeatherTypeSelectorButtonsProps {
  numberOfColors: number;
  selectedLeatherNumber: number;
  leatherColors: string[];
  leatherColorNames: string[];
  onSelectLeatherNumber: (num: number) => void;
}

/**
 * Component for selecting the active leather type for marking
 */
export const LeatherTypeSelectorButtons: React.FC<LeatherTypeSelectorButtonsProps> = ({
  numberOfColors,
  selectedLeatherNumber,
  leatherColors,
  leatherColorNames,
  onSelectLeatherNumber,
}) => {
  return (
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
              onClick={() => onSelectLeatherNumber(leatherNum)}
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
  );
};


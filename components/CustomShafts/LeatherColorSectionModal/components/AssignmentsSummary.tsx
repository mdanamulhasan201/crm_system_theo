// Summary display of leather assignments

import React from 'react';
import { Label } from '@/components/ui/label';
import { LeatherColorAssignment } from '../types';

interface AssignmentsSummaryProps {
  assignments: LeatherColorAssignment[];
}

/**
 * Component to display a summary of all assignments
 */
export const AssignmentsSummary: React.FC<AssignmentsSummaryProps> = ({ assignments }) => {
  if (assignments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Zugeordnete Bereiche ({assignments.length}):
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {assignments.map((assignment, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 rounded border bg-gray-50"
          >
            <div className="w-4 h-4 rounded border bg-emerald-500" />
            <span>
              Leder {assignment.leatherNumber} - {assignment.color}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

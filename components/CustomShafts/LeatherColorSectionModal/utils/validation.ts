// Validation utilities for leather color assignments

import { LeatherColorAssignment } from '../types';

/**
 * Validate that all required leather assignments exist
 * @param assignments - Array of assignments to validate
 * @param numberOfColors - Expected number of leather types (2 or 3)
 * @returns true if valid, false otherwise
 */
export const validateAssignments = (
  assignments: LeatherColorAssignment[],
  numberOfColors: number
): boolean => {
  const requiredLeathers = Array.from({ length: numberOfColors }, (_, i) => i + 1);
  const assignedLeathers = new Set(assignments.map(a => a.leatherNumber));
  
  return requiredLeathers.every(num => assignedLeathers.has(num));
};

/**
 * Get missing leather numbers from assignments
 * @param assignments - Array of assignments to check
 * @param numberOfColors - Expected number of leather types (2 or 3)
 * @returns Array of missing leather numbers
 */
export const getMissingLeatherNumbers = (
  assignments: LeatherColorAssignment[],
  numberOfColors: number
): number[] => {
  const requiredLeathers = Array.from({ length: numberOfColors }, (_, i) => i + 1);
  const assignedLeathers = new Set(assignments.map(a => a.leatherNumber));
  
  return requiredLeathers.filter(num => !assignedLeathers.has(num));
};

/**
 * Validate that all leather colors are selected
 * @param leatherColors - Array of leather color strings
 * @returns true if all colors are selected, false otherwise
 */
export const validateLeatherColors = (leatherColors: string[]): boolean => {
  return leatherColors.every(color => color && color.trim() !== '');
};


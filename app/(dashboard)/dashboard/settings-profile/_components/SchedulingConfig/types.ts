export interface Room {
  id: string;
  name: string;
  isActive: boolean;
  storeLocationId?: string | null;
  /** From API `storeLocation.address` for table display */
  storeLocationAddress?: string | null;
  /** Current occupancy count from API */
  occupancy?: number | null;
}

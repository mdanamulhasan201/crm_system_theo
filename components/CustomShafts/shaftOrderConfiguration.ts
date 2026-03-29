import type { LeatherColorAssignment } from '@/components/CustomShafts/LeatherColorSectionModal/types';

/** Einzelzeile Beinmaß (Payload/PDF) */
export type UmfangRow = { title: string; value: string };

export interface VersendenAddressPdf {
  company?: string;
  street?: string;
  city?: string;
  country?: string;
}

/**
 * Shared shape for shaft configuration passed to PDF modal and completion popup.
 */
export interface ShaftConfiguration {
  customCategory?: string;
  cadModeling?: '1x' | '2x';
  lederType?: string;
  lederfarbe?: string;
  numberOfLeatherColors?: string;
  leatherColors?: string[];
  /** Zuordnung Lederfarben zu Bereichen (2–3 Farben) */
  leatherColorAssignments?: LeatherColorAssignment[];
  innenfutter?: string;
  schafthohe?: string;
  schafthoheLinks?: string;
  schafthoheRechts?: string;
  umfangmasseLinks?: string;
  umfangmasseRechts?: string;
  /** Strukturierte Beinmaße Links (PDF-Zeilen) */
  umfangmasseLinksDetailed?: UmfangRow[];
  /** Strukturierte Beinmaße Rechts */
  umfangmasseRechtsDetailed?: UmfangRow[];
  polsterung?: string[];
  verstarkungen?: string[];
  polsterungText?: string;
  verstarkungenText?: string;
  nahtfarbe?: string;
  nahtfarbeOption?: string;
  /** Nein / Ja — decorative stitching */
  ziernahtVorhanden?: boolean;
  closureType?: string;
  offenstandSchnuerungMm?: string;
  anzahlOesen?: string;
  anzahlHaken?: string;
  anzahlKlettstreifen?: string;
  breiteKlettstreifenMm?: string;
  passendenSchnursenkel?: boolean;
  osenEinsetzen?: boolean;
  zipperExtra?: boolean;
  zipperPosition?: 'inside' | 'outside' | 'both' | null;
  additionalNotes?: string;
  deliveryMethod?: string;
  /** Versandadresse wenn „Selber versenden“ */
  versendenAddress?: VersendenAddressPdf | null;
  /** Kurier-/Abholadresse (Freitext für PDF) */
  courierPickupSummary?: string | null;
}

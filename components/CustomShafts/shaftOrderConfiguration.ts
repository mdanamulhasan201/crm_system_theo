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
  innenfutter?: string;
  schafthohe?: string;
  schafthoheLinks?: string;
  schafthoheRechts?: string;
  umfangmasseLinks?: string;
  umfangmasseRechts?: string;
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
}

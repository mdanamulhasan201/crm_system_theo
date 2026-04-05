'use client';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import LeatherColorSectionModal, { LeatherColorAssignment } from './LeatherColorSectionModal';
import ZipperPlacementModal, { type ZipperPosition } from './ZipperPlacementModal';
import ProductCadCategoryFields from './ProductCadCategoryFields';
import SchafthoheCard, { type SchafthoheFieldKey } from './SchafthoheCard';
import VerschlussCard from './VerschlussCard';
import PolsterungCard from './PolsterungCard';
import VerstarkungenCard from './VerstarkungenCard';
import ZusaetzeOptionenCard from './ZusaetzeOptionenCard';
import SectionCardHeader from './SectionCardHeader';
import type { PolsterungMmFields } from './polsterungPayload';
import type { LucideIcon } from 'lucide-react';
import { ClipboardList, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const SELECT_FIELD_CLASS =
  'h-9 w-full border-gray-300 bg-white text-sm shadow-sm';

const SHAFT_FIELD_SCROLL_ORDER: SchafthoheFieldKey[] = [
  'schafthoheLinks',
  'schafthoheRechts',
  'knoechelumfangLinks',
  'umfangBei14Links',
  'umfangBei16Links',
  'umfangBei18Links',
  'knoechelumfangRechts',
  'umfangBei14Rechts',
  'umfangBei16Rechts',
  'umfangBei18Rechts',
];

const FIELD_SCROLL_IDS: Record<SchafthoheFieldKey, string> = {
  schafthoheLinks: 'field-schafthohe-links',
  schafthoheRechts: 'field-schafthohe-rechts',
  knoechelumfangLinks: 'field-knoechelumfang-links',
  umfangBei14Links: 'field-umfang-14-links',
  umfangBei16Links: 'field-umfang-16-links',
  umfangBei18Links: 'field-umfang-18-links',
  knoechelumfangRechts: 'field-knoechelumfang-rechts',
  umfangBei14Rechts: 'field-umfang-14-rechts',
  umfangBei16Rechts: 'field-umfang-16-rechts',
  umfangBei18Rechts: 'field-umfang-18-rechts',
};

function ConfigCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      {icon ? (
        <SectionCardHeader icon={icon} title={title} subtitle={subtitle} />
      ) : (
        <header className="mb-5">
          <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
        </header>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold text-gray-900 sm:text-sm">{children}</span>
  );
}

const ACTIVE_SEGMENT_SLATE = 'bg-[#1e293b] text-white shadow-sm';
/** Muted green — matches Verschluss / site accent */
const ACTIVE_SEGMENT_GREEN = 'bg-[#679C7A] text-white shadow-sm';

/** Nein / Ja — value `undefined` = keine Auswahl; `variant="green"` uses green active (not slate) */
function SegmentedNeinJa({
  value,
  onChange,
  className,
  variant = 'default',
  disabled = false,
}: {
  value: boolean | undefined;
  onChange: (next: boolean | undefined) => void;
  className?: string;
  variant?: 'default' | 'green';
  disabled?: boolean;
}) {
  const activeClass = variant === 'green' ? ACTIVE_SEGMENT_GREEN : ACTIVE_SEGMENT_SLATE;
  return (
    <div
      className={cn(
        'flex w-full rounded-lg border border-gray-200 bg-gray-100 p-0.5 sm:max-w-md',
        disabled && 'opacity-60',
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
        onClick={() => !disabled && onChange(value === false ? undefined : false)}
        className={cn(
          'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
          value === false ? activeClass : 'text-gray-700 hover:bg-white/60',
          disabled && 'cursor-not-allowed'
        )}
      >
        Nein
      </button>
      <button
        type="button"
        disabled={disabled}
        aria-disabled={disabled}
        onClick={() => !disabled && onChange(value === true ? undefined : true)}
        className={cn(
          'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
          value === true ? activeClass : 'text-gray-700 hover:bg-white/60',
          disabled && 'cursor-not-allowed'
        )}
      >
        Ja
      </button>
    </div>
  );
}

interface ProductConfigurationProps {
  // CAD Modeling selection
  cadModeling?: '1x' | '2x';
  setCadModeling?: (value: '1x' | '2x') => void;
  // Custom category and price
  customCategory: string;
  setCustomCategory: (value: string) => void;
  customCategoryPrice: number | null;
  setCustomCategoryPrice: (price: number | null) => void;
  nahtfarbeOption: string;
  setNahtfarbeOption: (option: string) => void;
  customNahtfarbe: string;
  setCustomNahtfarbe: (color: string) => void;
  ziernahtVorhanden: boolean | undefined;
  setZiernahtVorhanden: (value: boolean | undefined) => void;
  passendenSchnursenkel?: boolean | undefined;
  setPassendenSchnursenkel?: (value: boolean | undefined) => void;
  osenEinsetzen?: boolean | undefined;
  setOsenEinsetzen?: (value: boolean | undefined) => void;
  zipperExtra?: boolean | undefined;
  setZipperExtra?: (value: boolean | undefined) => void;
  /** Zipper position when zipper extra is selected: inside/outside = +9.99€, both = +19.99€. Single selection (radio). */
  zipperPosition?: ZipperPosition | null;
  setZipperPosition?: (value: ZipperPosition | null) => void;
  closureType: string;
  setClosureType: (type: string) => void;
  offenstandSchnuerungMm: string;
  setOffenstandSchnuerungMm: (v: string) => void;
  anzahlOesen: string;
  setAnzahlOesen: (v: string) => void;
  anzahlHaken: string;
  setAnzahlHaken: (v: string) => void;
  anzahlKlettstreifen: string;
  setAnzahlKlettstreifen: (v: string) => void;
  breiteKlettstreifenMm: string;
  setBreiteKlettstreifenMm: (v: string) => void;
  lederType: string;
  setLederType: (type: string) => void;
  lederfarbe: string;
  setLederfarbe: (color: string) => void;
  innenfutter: string;
  setInnenfutter: (futter: string) => void;
  schafthohe: string;
  setSchafthohe: (hohe: string) => void;
  // Separate shaft heights for left and right
  schafthoheLinks: string;
  setSchafthoheLinks: (hohe: string) => void;
  schafthoheRechts: string;
  setSchafthoheRechts: (hohe: string) => void;
  // Umfangmaße (circumference) - dynamic per shaft height; ankle required when height > 15cm
  umfangBei14Links: string;
  setUmfangBei14Links: (v: string) => void;
  umfangBei16Links: string;
  setUmfangBei16Links: (v: string) => void;
  umfangBei18Links: string;
  setUmfangBei18Links: (v: string) => void;
  knoechelumfangLinks: string;
  setKnoechelumfangLinks: (v: string) => void;
  umfangBei14Rechts: string;
  setUmfangBei14Rechts: (v: string) => void;
  umfangBei16Rechts: string;
  setUmfangBei16Rechts: (v: string) => void;
  umfangBei18Rechts: string;
  setUmfangBei18Rechts: (v: string) => void;
  knoechelumfangRechts: string;
  setKnoechelumfangRechts: (v: string) => void;
  polsterung: string[];
  setPolsterung: (items: string[]) => void;
  polsterungMm: PolsterungMmFields;
  setPolsterungMm: Dispatch<SetStateAction<PolsterungMmFields>>;
  verstarkungen: string[];
  setVerstarkungen: Dispatch<SetStateAction<string[]>>;
  polsterungText: string;
  setPolsterungText: (text: string) => void;
  verstarkungenText: string;
  setVerstarkungenText: (text: string) => void;
  numberOfLeatherColors: string;
  setNumberOfLeatherColors: (value: string) => void;
  leatherColorAssignments: LeatherColorAssignment[];
  setLeatherColorAssignments: (assignments: LeatherColorAssignment[]) => void;
  leatherColors: string[];
  setLeatherColors: (colors: string[]) => void;
  shoeImage: string | null; // The shoe image to use in the modal
  /** Rückgabe `false` bricht ab (z. B. fehlende 3D-Uploads); Parent kann Bereiche rot markieren. */
  onOrderComplete: () => void | boolean;
  /** Wenn Abholen/Versenden Pflicht ist aber nichts gewählt — z. B. Kundenauswahl-Bereich hervorheben */
  onDeliveryChoiceRequired?: () => void;
  category?: string; // Category from the shaft data
  allowCategoryEdit?: boolean; // If true, show dropdown; if false, show read-only field
  zipperImage?: string | null;
  setZipperImage?: (image: string | null) => void;
  paintImage?: string | null;
  setPaintImage?: (image: string | null) => void;
  // Validation props for Abholen/Versenden
  requireAbholenOrVersenden?: boolean; // If true, require at least one option to be selected
  isAbholenSelected?: boolean; // Whether Abholen is selected
  isVersendenSelected?: boolean; // Whether Versenden is selected
  // Additional notes

  additionalNotes?: string;
  setAdditionalNotes?: (notes: string) => void;
  /** When true, CAD + Kategorie are rendered in the product hero card (parent); omit here */
  hideCadAndCategory?: boolean;
  /** Kollektion details: API `ziernaht === false` — „Ziernaht vorhanden?“ deaktivieren */
  disableZiernahtVorhanden?: boolean;
  /** Maßschuh step-5 intern modal: hide € suffixes on Verschluss / Reißverschluss UI */
  hideShopPriceLabels?: boolean;
  /** Replace leather type count select with plain text input (page-specific modal variant). */
  useTextFieldForLeatherTypeCount?: boolean;
}

export type ProductConfigurationHandle = {
  /** Gleiche Logik wie bisher „Abschließen“: Validierung + `onOrderComplete`. */
  submitOrder: () => void;
};

const ProductConfiguration = forwardRef<ProductConfigurationHandle, ProductConfigurationProps>(function ProductConfiguration({
  cadModeling = '1x',
  setCadModeling,
  customCategory,
  setCustomCategory,
  customCategoryPrice,
  setCustomCategoryPrice,
  nahtfarbeOption,
  setNahtfarbeOption,
  customNahtfarbe,
  setCustomNahtfarbe,
  ziernahtVorhanden,
  setZiernahtVorhanden,
  passendenSchnursenkel,
  setPassendenSchnursenkel,
  osenEinsetzen,
  setOsenEinsetzen,
  zipperExtra,
  setZipperExtra,
  zipperPosition = null,
  setZipperPosition,
  closureType,
  setClosureType,
  offenstandSchnuerungMm,
  setOffenstandSchnuerungMm,
  anzahlOesen,
  setAnzahlOesen,
  anzahlHaken,
  setAnzahlHaken,
  anzahlKlettstreifen,
  setAnzahlKlettstreifen,
  breiteKlettstreifenMm,
  setBreiteKlettstreifenMm,
  lederType,
  setLederType,
  lederfarbe,
  setLederfarbe,
  innenfutter,
  setInnenfutter,
  schafthohe,
  setSchafthohe,
  schafthoheLinks,
  setSchafthoheLinks,
  schafthoheRechts,
  setSchafthoheRechts,
  umfangBei14Links,
  setUmfangBei14Links,
  umfangBei16Links,
  setUmfangBei16Links,
  umfangBei18Links,
  setUmfangBei18Links,
  knoechelumfangLinks,
  setKnoechelumfangLinks,
  umfangBei14Rechts,
  setUmfangBei14Rechts,
  umfangBei16Rechts,
  setUmfangBei16Rechts,
  umfangBei18Rechts,
  setUmfangBei18Rechts,
  knoechelumfangRechts,
  setKnoechelumfangRechts,
  polsterung,
  setPolsterung,
  polsterungMm,
  setPolsterungMm,
  verstarkungen,
  setVerstarkungen,
  polsterungText,
  setPolsterungText,
  verstarkungenText,
  setVerstarkungenText,
  numberOfLeatherColors,
  setNumberOfLeatherColors,
  leatherColorAssignments,
  setLeatherColorAssignments,
  leatherColors,
  setLeatherColors,
  shoeImage,
  onOrderComplete,
  onDeliveryChoiceRequired,
  category,
  allowCategoryEdit,
  zipperImage,
  setZipperImage,
  paintImage,
  setPaintImage,
  requireAbholenOrVersenden = false,
  isAbholenSelected = false,
  isVersendenSelected = false,
  additionalNotes = '',
  setAdditionalNotes,
  hideCadAndCategory = false,
  disableZiernahtVorhanden = false,
  hideShopPriceLabels = false,
  useTextFieldForLeatherTypeCount = false,
}: ProductConfigurationProps,
ref: React.Ref<ProductConfigurationHandle>
) {
  // Default value for allowCategoryEdit
  const isCategoryEditable = allowCategoryEdit ?? false;
  // Local fallbacks if parent does not control these fields
  const [localCadModeling, setLocalCadModeling] = useState<'1x' | '2x'>('1x');
  const [localSchnursenkel, setLocalSchnursenkel] = useState<boolean | undefined>(undefined);
  const [localOsenEinsetzen, setLocalOsenEinsetzen] = useState<boolean | undefined>(undefined);
  const [localZipperExtra, setLocalZipperExtra] = useState<boolean | undefined>(undefined);
  const [showLeatherColorModal, setShowLeatherColorModal] = useState(false);
  const [shaftFieldErrors, setShaftFieldErrors] = useState<Partial<Record<SchafthoheFieldKey, boolean>>>(
    {}
  );
  const [showZipperPlacementModal, setShowZipperPlacementModal] = useState(false);
  const [zipperPlacementImage, setZipperPlacementImage] = useState<string | null>(zipperImage || null);
  const [localZipperPosition, setLocalZipperPosition] = useState<ZipperPosition | null>(null);
  const [leatherPaintImage, setLeatherPaintImage] = useState<string | null>(paintImage || null);
  const isSavingZipperRef = useRef(false);

  const effectiveZipperPosition = zipperPosition ?? localZipperPosition;
  const updateZipperPosition = (value: ZipperPosition | null) => {
    if (setZipperPosition) setZipperPosition(value);
    else setLocalZipperPosition(value);
  };

  // Use parent state if provided, otherwise use local state
  const effectiveCadModeling = cadModeling || localCadModeling;
  const updateCadModeling = (value: '1x' | '2x') => {
    if (setCadModeling) {
      setCadModeling(value);
    } else {
      setLocalCadModeling(value);
    }
  };

  // Sync zipper image from parent prop
  useEffect(() => {
    if (zipperImage !== undefined && zipperImage !== zipperPlacementImage) {
      setZipperPlacementImage(zipperImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipperImage]);

  // Sync paint image from parent prop
  useEffect(() => {
    if (paintImage !== undefined && paintImage !== leatherPaintImage) {
      setLeatherPaintImage(paintImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintImage]);

  useEffect(() => {
    if (!disableZiernahtVorhanden) return;
    setZiernahtVorhanden(false);
  }, [disableZiernahtVorhanden, setZiernahtVorhanden]);

  // Zipper is now controlled by the "Zusätzlicher Reißverschluss" checkbox, not by closureType

  // Shaft circumference fields to show by height (from ground). Knöchelumfang at top when height > 13.
  const getCircumferenceFieldsForHeight = (heightCm: number) => {
    const h = heightCm;
    return {
      showUmfang15: h > 15,
      showUmfang16: h > 17,
      showUmfang18: h > 19,
      showKnoechelumfang: h > 13,
      requireCircumference: h > 13,
    };
  };

  // Clear hidden circumference fields so stale values are not kept in state/payload.
  useEffect(() => {
    const leftH = parseFloat(schafthoheLinks);
    if (Number.isNaN(leftH) || leftH <= 13) {
      if (knoechelumfangLinks) setKnoechelumfangLinks('');
      if (umfangBei14Links) setUmfangBei14Links('');
      if (umfangBei16Links) setUmfangBei16Links('');
      if (umfangBei18Links) setUmfangBei18Links('');
      return;
    }

    const leftFields = getCircumferenceFieldsForHeight(leftH);
    if (!leftFields.showKnoechelumfang && knoechelumfangLinks) setKnoechelumfangLinks('');
    if (!leftFields.showUmfang15 && umfangBei14Links) setUmfangBei14Links('');
    if (!leftFields.showUmfang16 && umfangBei16Links) setUmfangBei16Links('');
    if (!leftFields.showUmfang18 && umfangBei18Links) setUmfangBei18Links('');
  }, [
    schafthoheLinks,
    knoechelumfangLinks,
    umfangBei14Links,
    umfangBei16Links,
    umfangBei18Links,
    setKnoechelumfangLinks,
    setUmfangBei14Links,
    setUmfangBei16Links,
    setUmfangBei18Links,
  ]);

  useEffect(() => {
    const rightH = parseFloat(schafthoheRechts);
    if (Number.isNaN(rightH) || rightH <= 13) {
      if (knoechelumfangRechts) setKnoechelumfangRechts('');
      if (umfangBei14Rechts) setUmfangBei14Rechts('');
      if (umfangBei16Rechts) setUmfangBei16Rechts('');
      if (umfangBei18Rechts) setUmfangBei18Rechts('');
      return;
    }

    const rightFields = getCircumferenceFieldsForHeight(rightH);
    if (!rightFields.showKnoechelumfang && knoechelumfangRechts) setKnoechelumfangRechts('');
    if (!rightFields.showUmfang15 && umfangBei14Rechts) setUmfangBei14Rechts('');
    if (!rightFields.showUmfang16 && umfangBei16Rechts) setUmfangBei16Rechts('');
    if (!rightFields.showUmfang18 && umfangBei18Rechts) setUmfangBei18Rechts('');
  }, [
    schafthoheRechts,
    knoechelumfangRechts,
    umfangBei14Rechts,
    umfangBei16Rechts,
    umfangBei18Rechts,
    setKnoechelumfangRechts,
    setUmfangBei14Rechts,
    setUmfangBei16Rechts,
    setUmfangBei18Rechts,
  ]);

  const buildShaftFieldErrors = useCallback((): Partial<Record<SchafthoheFieldKey, boolean>> => {
    const err: Partial<Record<SchafthoheFieldKey, boolean>> = {};
    const leftH = parseFloat(schafthoheLinks);
    const rightH = parseFloat(schafthoheRechts);
    if (!schafthoheLinks?.trim() || Number.isNaN(leftH)) err.schafthoheLinks = true;
    if (!schafthoheRechts?.trim() || Number.isNaN(rightH)) err.schafthoheRechts = true;
    if (Number.isNaN(leftH) || Number.isNaN(rightH)) return err;

    const leftFields = getCircumferenceFieldsForHeight(leftH);
    const rightFields = getCircumferenceFieldsForHeight(rightH);

    if (leftFields.requireCircumference) {
      if (leftFields.showUmfang15 && !umfangBei14Links?.trim()) err.umfangBei14Links = true;
      if (leftFields.showUmfang16 && !umfangBei16Links?.trim()) err.umfangBei16Links = true;
      if (leftFields.showUmfang18 && !umfangBei18Links?.trim()) err.umfangBei18Links = true;
      if (leftFields.showKnoechelumfang && !knoechelumfangLinks?.trim()) err.knoechelumfangLinks = true;
    }
    if (rightFields.requireCircumference) {
      if (rightFields.showUmfang15 && !umfangBei14Rechts?.trim()) err.umfangBei14Rechts = true;
      if (rightFields.showUmfang16 && !umfangBei16Rechts?.trim()) err.umfangBei16Rechts = true;
      if (rightFields.showUmfang18 && !umfangBei18Rechts?.trim()) err.umfangBei18Rechts = true;
      if (rightFields.showKnoechelumfang && !knoechelumfangRechts?.trim()) err.knoechelumfangRechts = true;
    }
    return err;
  }, [
    schafthoheLinks,
    schafthoheRechts,
    umfangBei14Links,
    umfangBei16Links,
    umfangBei18Links,
    knoechelumfangLinks,
    umfangBei14Rechts,
    umfangBei16Rechts,
    umfangBei18Rechts,
    knoechelumfangRechts,
  ]);

  const effektSchnursenkel = typeof passendenSchnursenkel === 'boolean' ? passendenSchnursenkel : localSchnursenkel;
  const updateSchnursenkel = (value: boolean | undefined) => {
    if (setPassendenSchnursenkel) {
      // Keep undefined as undefined, don't convert to false
      setPassendenSchnursenkel(value);
    } else {
      setLocalSchnursenkel(value);
    }
  };

  const effektOsen = typeof osenEinsetzen === 'boolean' ? osenEinsetzen : localOsenEinsetzen;
  const updateOsen = (value: boolean | undefined) => {
    if (setOsenEinsetzen) {
      // Keep undefined as undefined, don't convert to false
      setOsenEinsetzen(value);
    } else {
      setLocalOsenEinsetzen(value);
    }
  };

  const handleClosureTypeChange = (value: string) => {
    setClosureType(value);
    if (value === 'Velcro') {
      updateSchnursenkel(undefined);
      updateOsen(undefined);
      setAnzahlOesen('');
      setAnzahlHaken('');
      setOffenstandSchnuerungMm('');
      return;
    }

    if (value === 'Eyelets') {
      setAnzahlKlettstreifen('');
      setBreiteKlettstreifenMm('');
      setOffenstandSchnuerungMm('');
    }
  };

  const effektZipperExtra = typeof zipperExtra === 'boolean' ? zipperExtra : localZipperExtra;
  const updateZipperExtra = (value: boolean | undefined) => {
    if (setZipperExtra) {
      // Keep undefined as undefined, don't convert to false
      setZipperExtra(value);
    } else {
      setLocalZipperExtra(value);
    }
  };

  // Category is read-only from backend, no handler needed

  // Handle number of leather colors change
  const handleNumberOfColorsChange = (value: string) => {
    const prevValue = numberOfLeatherColors;
    setNumberOfLeatherColors(value);

    // If 1 color is selected, clear assignments and reset to single-color mode (no popup)
    if (value === '1') {
      setLeatherColorAssignments([]);
      setLeatherColors([]);
      setShowLeatherColorModal(false);
    }

    // When 2 or 3 are selected, use only the popup flow
    if (value === '2' || value === '3') {
      // Clear single-color fields to avoid stale data in preview/PDF.
      setLederType('');
      setLederfarbe('');
      // When switching between multi-color modes (2 <-> 3),
      // reset previous modal selections so old assignments don't carry over.
      if ((prevValue === '2' || prevValue === '3') && prevValue !== value) {
        setLeatherColorAssignments([]);
        setLeatherColors([]);
      }
      setShowLeatherColorModal(true);
    }
  };

  // Handle modal save
  const handleModalSave = (assignments: LeatherColorAssignment[], colors: string[], paintedImage?: string | null) => {
    setLeatherColorAssignments(assignments);
    setLeatherColors(colors);
    // Save painted image locally
    if (paintedImage) {
      setLeatherPaintImage(paintedImage);
      // Also update parent state if provided
      if (setPaintImage) {
        setPaintImage(paintedImage);
      }
    }
    setShowLeatherColorModal(false);
  };

  const submitOrder = useCallback(() => {
    const shaftErr = buildShaftFieldErrors();
    setShaftFieldErrors(shaftErr);

    if (Object.keys(shaftErr).length > 0) {
      toast.error('Bitte füllen Sie alle rot markierten Pflichtfelder aus.');
      requestAnimationFrame(() => {
        for (const key of SHAFT_FIELD_SCROLL_ORDER) {
          if (shaftErr[key]) {
            document.getElementById(FIELD_SCROLL_IDS[key])?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            break;
          }
        }
      });
      return;
    }

    if (requireAbholenOrVersenden && !isAbholenSelected && !isVersendenSelected) {
      onDeliveryChoiceRequired?.();
      toast.error('Bitte wählen Sie entweder "Abholen" oder "Versenden" aus.');
      requestAnimationFrame(() => {
        document.getElementById('field-delivery-choice')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
      return;
    }

    const proceed = onOrderComplete();
    if (proceed === false) {
      requestAnimationFrame(() => {
        document.getElementById('field-3d-leisten-uploads')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    }
  }, [
    buildShaftFieldErrors,
    requireAbholenOrVersenden,
    isAbholenSelected,
    isVersendenSelected,
    onOrderComplete,
    onDeliveryChoiceRequired,
  ]);

  useEffect(() => {
    setShaftFieldErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      return buildShaftFieldErrors();
    });
  }, [buildShaftFieldErrors]);

  useImperativeHandle(ref, () => ({ submitOrder }), [submitOrder]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5">
        {!hideCadAndCategory && (
          <div className="flex flex-col gap-5">
            <ProductCadCategoryFields
              layout="stacked"
              cadModeling={effectiveCadModeling}
              setCadModeling={updateCadModeling}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              setCustomCategoryPrice={setCustomCategoryPrice}
              category={category}
              allowCategoryEdit={isCategoryEditable}
            />
          </div>
        )}

        <ConfigCard icon={Palette} title="Material & Ausführung" subtitle="Leder, Futter und Naht">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-5 md:gap-y-4 mt-5">
            <div className="flex min-w-0 flex-col">
              {useTextFieldForLeatherTypeCount ? (
                <>
                  <FieldLabel>Ledertypen</FieldLabel>
                  <Input
                    type="text"
                    placeholder="Ledertypen eingeben…"
                    className="h-9 border-gray-300 text-sm"
                    value={numberOfLeatherColors}
                    onChange={(e) => setNumberOfLeatherColors(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <FieldLabel>Anzahl der Ledertypen</FieldLabel>
                  <Select value={numberOfLeatherColors} onValueChange={handleNumberOfColorsChange}>
                    <SelectTrigger className={SELECT_FIELD_CLASS}>
                      <SelectValue placeholder="Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="1">
                        1
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="2">
                        2
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="3">
                        3
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            <div className="flex min-w-0 flex-col">
              <FieldLabel>Innenfutter</FieldLabel>
              <Select value={innenfutter} onValueChange={setInnenfutter}>
                <SelectTrigger className={SELECT_FIELD_CLASS}>
                  <SelectValue placeholder="Innenfutter wählen…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="ziegenleder-hellbraun">
                    Ziegenleder hellbraun
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="kalbsleder-beige">
                    Kalbsleder Beige
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="sport-mesh-nero-schwarz">
                    Sport Mesh Nero/Schwarz
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="sport-mesh-grau-grigio">
                    Sport Mesh Grau/Grigio
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="sport-mesh-weiss-bianco">
                    Sport Mesh Weiß/Bianco
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="comfort-line-nero-schwarz">
                    Comfort Line Nero/Schwarz
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="comfort-line-blau-blu">
                    Comfort Line Blau/Blu
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="comfort-line-braun-marrone">
                    Comfort Line Braun/Marrone
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex min-w-0 flex-col">
              <FieldLabel>Nahtfarbe</FieldLabel>
              <div className="flex flex-col gap-2">
                <Select value={nahtfarbeOption} onValueChange={setNahtfarbeOption}>
                  <SelectTrigger className={SELECT_FIELD_CLASS}>
                    <SelectValue placeholder="Passend zur Lederfarbe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="default">
                      Passend zur Lederfarbe
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="personal">
                      Passendste Nahtfarbe nach Personal
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="custom">
                      Eigene Farbe angeben
                    </SelectItem>
                  </SelectContent>
                </Select>
                {nahtfarbeOption === 'custom' && (
                  <Input
                    type="text"
                    placeholder="Eigene Nahtfarbe angeben…"
                    className="h-9 border-gray-300 text-sm"
                    value={customNahtfarbe}
                    onChange={(e) => setCustomNahtfarbe(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col">
              <FieldLabel>Ziernaht vorhanden?</FieldLabel>
              <SegmentedNeinJa
                variant="green"
                value={ziernahtVorhanden}
                onChange={setZiernahtVorhanden}
                disabled={disableZiernahtVorhanden}
              />
            </div>
          </div>

          {!useTextFieldForLeatherTypeCount && numberOfLeatherColors === '1' && (
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-start sm:gap-5">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <FieldLabel>Ledertyp</FieldLabel>
                <Select value={lederType} onValueChange={setLederType}>
                  <SelectTrigger className={SELECT_FIELD_CLASS}>
                    <SelectValue placeholder="Ledertyp wählen…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="kalbleder-vitello">
                      Kalbleder Vitello
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="nappa">
                      Nappa (weiches Glattleder)
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="nubukleder">
                      Nubukleder
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="softvelourleder">
                      Softvelourleder
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="hirschleder-gemustert">
                      Hirschleder Gemustert
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="performance-textil">
                      Performance Textil
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="fashion-mesh-gepolstert">
                      Fashion Mesh Gepolstert
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="soft-touch-material-gepraegt">
                      Soft Touch Material - Geprägt
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="textil-python-effekt">
                      Textil Python-Effekt
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="glitter">
                      Glitter
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="luxury-glitter-fabric">
                      Luxury Glitter Fabric
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="metallic-finish">
                      Metallic Finish
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <FieldLabel>Lederfarbe</FieldLabel>
                <Input
                  type="text"
                  placeholder="Lederfarbe wählen…"
                  className="h-9 border-gray-300 text-sm"
                  value={lederfarbe}
                  onChange={(e) => setLederfarbe(e.target.value)}
                />
              </div>
            </div>
          )}

          {!useTextFieldForLeatherTypeCount && (numberOfLeatherColors === '2' || numberOfLeatherColors === '3') && leatherColorAssignments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <FieldLabel>Ledertypen-Zuordnung</FieldLabel>
              <div className="mt-2 space-y-2">
                <div className="mb-2 text-sm font-medium text-gray-700">
                  {leatherColors.map((color, index) => (
                    <span key={index} className="mr-4 inline-block">
                      Leder {index + 1}: <span className="font-normal">{color || 'Nicht definiert'}</span>
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-600">{leatherColorAssignments.length} Bereich(e) zugeordnet</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeatherColorModal(true)}
                  className="mt-2"
                >
                  Zuordnung bearbeiten
                </Button>
              </div>
            </div>
          )}
        </ConfigCard>

        <SchafthoheCard
          schafthoheLinks={schafthoheLinks}
          setSchafthoheLinks={setSchafthoheLinks}
          schafthoheRechts={schafthoheRechts}
          setSchafthoheRechts={setSchafthoheRechts}
          knoechelumfangLinks={knoechelumfangLinks}
          setKnoechelumfangLinks={setKnoechelumfangLinks}
          umfangBei14Links={umfangBei14Links}
          setUmfangBei14Links={setUmfangBei14Links}
          umfangBei16Links={umfangBei16Links}
          setUmfangBei16Links={setUmfangBei16Links}
          umfangBei18Links={umfangBei18Links}
          setUmfangBei18Links={setUmfangBei18Links}
          knoechelumfangRechts={knoechelumfangRechts}
          setKnoechelumfangRechts={setKnoechelumfangRechts}
          umfangBei14Rechts={umfangBei14Rechts}
          setUmfangBei14Rechts={setUmfangBei14Rechts}
          umfangBei16Rechts={umfangBei16Rechts}
          setUmfangBei16Rechts={setUmfangBei16Rechts}
          umfangBei18Rechts={umfangBei18Rechts}
          setUmfangBei18Rechts={setUmfangBei18Rechts}
          fieldErrors={shaftFieldErrors}
        />

        <VerschlussCard
          closureType={closureType}
          onClosureTypeChange={handleClosureTypeChange}
          passendenSchnursenkel={effektSchnursenkel}
          onPassendenSchnursenkelChange={updateSchnursenkel}
          osenEinsetzen={effektOsen}
          onOsenEinsetzenChange={updateOsen}
          offenstandSchnuerungMm={offenstandSchnuerungMm}
          setOffenstandSchnuerungMm={setOffenstandSchnuerungMm}
          anzahlOesen={anzahlOesen}
          setAnzahlOesen={setAnzahlOesen}
          anzahlHaken={anzahlHaken}
          setAnzahlHaken={setAnzahlHaken}
          anzahlKlettstreifen={anzahlKlettstreifen}
          setAnzahlKlettstreifen={setAnzahlKlettstreifen}
          breiteKlettstreifenMm={breiteKlettstreifenMm}
          setBreiteKlettstreifenMm={setBreiteKlettstreifenMm}
          hideShopPriceLabels={hideShopPriceLabels}
        />

        <PolsterungCard
          polsterung={polsterung}
          setPolsterung={setPolsterung}
          polsterungText={polsterungText}
          setPolsterungText={setPolsterungText}
          polsterungMm={polsterungMm}
          setPolsterungMm={setPolsterungMm}
        />

        <VerstarkungenCard
          verstarkungen={verstarkungen}
          setVerstarkungen={setVerstarkungen}
          verstarkungenText={verstarkungenText}
          setVerstarkungenText={setVerstarkungenText}
        />

        <ZusaetzeOptionenCard
          value={effektZipperExtra}
          effectiveZipperPosition={effectiveZipperPosition}
          zipperJaDisabled={false}
          zipperLocked={false}
          onZipperSegmentChange={(v) => {
            if (v === false) {
              updateZipperExtra(false);
              return;
            }
            if (v === true) {
              if (zipperPlacementImage) {
                updateZipperExtra(true);
              } else {
                if (!shoeImage) {
                  toast.error('Bitte laden Sie zuerst ein Schuhbild hoch.');
                  return;
                }
                setShowZipperPlacementModal(true);
              }
              return;
            }
            updateZipperExtra(undefined);
          }}
          effektZipperExtra={effektZipperExtra === true}
          zipperPlacementImage={zipperPlacementImage}
          shoeImage={shoeImage}
          onEditZipperPosition={() => setShowZipperPlacementModal(true)}
          hideShopPriceLabels={hideShopPriceLabels}
        />

        <ConfigCard icon={ClipboardList} title="Notizen" subtitle="Optional — erscheinen in Rechnung/PDF">
        <div className="flex flex-col gap-2 mt-5">
          <FieldLabel>Sonstige Notizen</FieldLabel>
          <Textarea
            placeholder="Zusätzliche Informationen, Sonderwünsche, Produktionshinweise, etc. (optional)"
            className="min-h-[100px] w-full border-gray-300 text-sm"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes?.(e.target.value)}
          />
        </div>
        </ConfigCard>

        {/* Leather Color Section Modal */}
        {!useTextFieldForLeatherTypeCount && (numberOfLeatherColors === '2' || numberOfLeatherColors === '3') && (
          <LeatherColorSectionModal
            key={`leather-color-modal-${numberOfLeatherColors}`}
            isOpen={showLeatherColorModal}
            onClose={() => setShowLeatherColorModal(false)}
            onSave={handleModalSave}
            numberOfColors={parseInt(numberOfLeatherColors)}
            shoeImage={shoeImage}
            initialAssignments={leatherColorAssignments}
            initialLeatherColors={leatherColors}
          />
        )}

        {/* Zipper Placement Modal */}
        <ZipperPlacementModal
          isOpen={showZipperPlacementModal}
          onClose={() => {
            isSavingZipperRef.current = false;
            setShowZipperPlacementModal(false);
          }}
          onSave={(imageDataUrl) => {
            isSavingZipperRef.current = true;
            setZipperPlacementImage(imageDataUrl);
            if (setZipperImage) setZipperImage(imageDataUrl);
            updateZipperExtra(true);
            setShowZipperPlacementModal(false);
            setTimeout(() => { isSavingZipperRef.current = false; }, 100);
          }}
          imageUrl={shoeImage}
          savedDrawing={zipperPlacementImage}
          zipperPosition={effectiveZipperPosition}
          onZipperPositionChange={(position) => updateZipperPosition(position)}
          hideShopPriceLabels={hideShopPriceLabels}
        />
      </div>
    </TooltipProvider>
  );
});

export default ProductConfiguration;

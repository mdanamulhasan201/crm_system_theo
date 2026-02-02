'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import LeatherColorSectionModal, { LeatherColorAssignment } from './LeatherColorSectionModal';
import ZipperPlacementModal from './ZipperPlacementModal';
import toast from 'react-hot-toast';

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
  passendenSchnursenkel?: boolean | undefined;
  setPassendenSchnursenkel?: (value: boolean | undefined) => void;
  osenEinsetzen?: boolean | undefined;
  setOsenEinsetzen?: (value: boolean | undefined) => void;
  zipperExtra?: boolean | undefined;
  setZipperExtra?: (value: boolean | undefined) => void;
  closureType: string;
  setClosureType: (type: string) => void;
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
  // Umfangmaße (circumference) - only required when shaft height > 15cm
  umfangmasseLinks: string;
  setUmfangmasseLinks: (masse: string) => void;
  umfangmasseRechts: string;
  setUmfangmasseRechts: (masse: string) => void;
  polsterung: string[];
  setPolsterung: (items: string[]) => void;
  verstarkungen: string[];
  setVerstarkungen: (items: string[]) => void;
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
  onOrderComplete: () => void;
  category?: string; // Category from the shaft data
  allowCategoryEdit?: boolean; // If true, show dropdown; if false, show read-only field
  zipperImage?: string | null;
  setZipperImage?: (image: string | null) => void;
  paintImage?: string | null;
  setPaintImage?: (image: string | null) => void;
}

export default function ProductConfiguration({
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
  passendenSchnursenkel,
  setPassendenSchnursenkel,
  osenEinsetzen,
  setOsenEinsetzen,
  zipperExtra,
  setZipperExtra,
  closureType,
  setClosureType,
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
  umfangmasseLinks,
  setUmfangmasseLinks,
  umfangmasseRechts,
  setUmfangmasseRechts,
  polsterung,
  setPolsterung,
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
  category,
  allowCategoryEdit,
  zipperImage,
  setZipperImage,
  paintImage,
  setPaintImage,
}: ProductConfigurationProps) {
  // Default value for allowCategoryEdit
  const isCategoryEditable = allowCategoryEdit ?? false;
  // Local fallbacks if parent does not control these fields
  const [localCadModeling, setLocalCadModeling] = useState<'1x' | '2x'>('1x');
  const [localSchnursenkel, setLocalSchnursenkel] = useState<boolean | undefined>(undefined);
  const [localOsenEinsetzen, setLocalOsenEinsetzen] = useState<boolean | undefined>(undefined);
  const [localZipperExtra, setLocalZipperExtra] = useState<boolean | undefined>(undefined);
  const [showLeatherColorModal, setShowLeatherColorModal] = useState(false);
  const [showZipperPlacementModal, setShowZipperPlacementModal] = useState(false);
  const [zipperPlacementImage, setZipperPlacementImage] = useState<string | null>(zipperImage || null);
  const [leatherPaintImage, setLeatherPaintImage] = useState<string | null>(paintImage || null);
  const isSavingZipperRef = useRef(false);

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

  // Zipper is now controlled by the "Zusätzlicher Reißverschluss" checkbox, not by closureType

  const CATEGORY_OPTIONS = [
    { value: 'Halbschuhe', label: 'Halbschuhe', price: 209.99 },
    { value: 'Stiefel', label: 'Stiefel', price: 314.99 },
    { value: 'Knöchelhoch', label: 'Knöchelhoch', price: 219.99 },
    { value: 'Sandalen', label: 'Sandalen', price: 189.99 },
    { value: 'Bergschuhe', label: 'Bergschuhe', price: 234.99 },
    { value: 'Businessschuhe', label: 'Businessschuhe', price: 224.99 },
  ];

  const handleCategoryChange = (value: string) => {
    setCustomCategory(value);
    const found = CATEGORY_OPTIONS.find((opt) => opt.value === value);
    if (found) {
      setCustomCategoryPrice(found.price);
    } else {
      setCustomCategoryPrice(null);
    }
  };

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
    setNumberOfLeatherColors(value);

    // If 1 color is selected, clear assignments and reset to single-color mode (no popup)
    if (value === '1') {
      setLeatherColorAssignments([]);
      setLeatherColors([]);
      setShowLeatherColorModal(false);
    }

    // When 2 or 3 are selected, use only the popup flow
    if (value === '2' || value === '3') {
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

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* CAD-Modellierung Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 md:w-1/3">
            <Label className="font-medium text-base">CAD-Modellierung</Label>
            <div className="relative group">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-help hover:bg-gray-300 transition-colors">
                <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute left-0 bottom-full mb-2 w-80 p-3 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Bei deutlich unterschiedlichen Füßen bzw. Leisten empfehlen wir zwei separate CAD-Modellierungen. So kann jede Seite individuell angepasst werden und die Passform wird präziser.
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 flex-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="cadModeling"
                value="1x"
                checked={effectiveCadModeling === '1x'}
                onChange={() => updateCadModeling('1x')}
                className="w-4 h-4 text-green-500 focus:ring-green-500"
              />
              <span className="text-base text-gray-700">1× CAD-Modellierung (Standard)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="radio"
                name="cadModeling"
                value="2x"
                checked={effectiveCadModeling === '2x'}
                onChange={() => updateCadModeling('2x')}
                className="w-4 h-4 text-green-500 focus:ring-green-500"
              />
              <span className="text-base text-gray-700">2× CAD-Modellierung (separat) <span className="text-green-600 font-semibold">+6,99 €</span></span>
            </label>
          </div>
        </div>

        {/* Kategorie - Conditional: Dropdown if isCategoryEditable, Read-only if not */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Kategorie:</Label>
          {isCategoryEditable ? (
            <Select value={customCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full md:w-1/2 border-gray-300">
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} className="cursor-pointer" value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="text"
              readOnly
              value={category || ''}
              className="w-full md:w-1/2 bg-gray-50 cursor-not-allowed border-gray-300"
            />
          )}
        </div>

        {/* Number of Leather Colors */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Anzahl der Ledertypen:</Label>
          <Select value={numberOfLeatherColors} onValueChange={handleNumberOfColorsChange}>
            <SelectTrigger className="w-full md:w-1/2 border-gray-300">
              <SelectValue placeholder="Auswählen " />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className='cursor-pointer' value="1">1</SelectItem>
              <SelectItem className='cursor-pointer' value="2">2</SelectItem>
              <SelectItem className='cursor-pointer' value="3">3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ledertyp - only show when exactly 1 leather type is selected, directly under Anzahl */}
        {numberOfLeatherColors === '1' && (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-medium text-base md:w-1/3">Ledertyp:</Label>
            <Select value={lederType} onValueChange={setLederType}>
              <SelectTrigger className="w-full md:w-1/2 border-gray-300">
                <SelectValue placeholder="Ledertyp wählen..." />
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
          </div>
        )}

        {/* Lederfarbe - Show only when 1 color is selected */}
        {numberOfLeatherColors === '1' && (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-medium text-base md:w-1/3">Lederfarbe:</Label>
            <Input
              type="text"
              placeholder="Lederfarbe wählen..."
              className="w-full md:w-1/2 border-gray-300"
              value={lederfarbe}
              onChange={(e) => setLederfarbe(e.target.value)}
            />
          </div>
        )}

        {/* Show summary when multiple colors are configured */}
        {(numberOfLeatherColors === '2' || numberOfLeatherColors === '3') && leatherColorAssignments.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 rounded-lg border">
            <Label className="font-medium text-base md:w-1/3">Ledertypen-Zuordnung:</Label>
            <div className="flex-1 space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {leatherColors.map((color, index) => (
                  <span key={index} className="inline-block mr-4">
                    Leder {index + 1}: <span className="font-normal">{color || 'Nicht definiert'}</span>
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-600">
                {leatherColorAssignments.length} Bereich(e) zugeordnet
              </div>
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

        {/* Innenfutter */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Innenfutter:</Label>
          <Select value={innenfutter} onValueChange={setInnenfutter}>
            <SelectTrigger className="w-full md:w-1/2 border-gray-300">
              <SelectValue placeholder="Innenfutter wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className='cursor-pointer' value="ziegenleder-hellbraun">Ziegenleder hellbraun</SelectItem>
              <SelectItem className='cursor-pointer' value="kalbsleder-beige">Kalbsleder Beige</SelectItem>
              <SelectItem className='cursor-pointer' value="sport-mesh-nero-schwarz">Sport Mesh Nero/Schwarz</SelectItem>
              <SelectItem className='cursor-pointer' value="sport-mesh-grau-grigio">Sport Mesh Grau/Grigio</SelectItem>
              <SelectItem className='cursor-pointer' value="sport-mesh-weiss-bianco">Sport Mesh Weiß/Bianco</SelectItem>
              <SelectItem className='cursor-pointer' value="comfort-line-nero-schwarz">Comfort Line Nero/Schwarz</SelectItem>
              <SelectItem className='cursor-pointer' value="comfort-line-blau-blu">Comfort Line Blau/Blu</SelectItem>
              <SelectItem className='cursor-pointer' value="comfort-line-braun-marrone">Comfort Line Braun/Marrone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nahtfarbe */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Nahtfarbe:</Label>
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <Select value={nahtfarbeOption} onValueChange={setNahtfarbeOption}>
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Passend zur Lederfarbe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='cursor-pointer' value="default">Passend zur Lederfarbe</SelectItem>
                <SelectItem className='cursor-pointer' value="personal">Passendste Nahtfarbe nach Personal</SelectItem>
                <SelectItem className='cursor-pointer' value="custom">Eigene Farbe angeben</SelectItem>
              </SelectContent>
            </Select>
            {nahtfarbeOption === 'custom' && (
              <Input
                type="text"
                placeholder="Eigene Nahtfarbe angeben..."
                className="w-full border-gray-300"
                value={customNahtfarbe}
                onChange={e => setCustomNahtfarbe(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Schafthöhe Links (Left) */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <Label className="font-medium text-base md:w-1/3 md:mt-2">Schafthöhe Links:</Label>
          <div className="flex flex-col gap-3 w-full md:w-2/3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="z.B. 15"
                className="flex-1 border-gray-300"
                value={schafthoheLinks}
                onChange={e => setSchafthoheLinks(e.target.value)}
              />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">cm</span>
            </div>
            
            {/* Show Umfangmaße field only if shaft height > 15cm */}
            {parseFloat(schafthoheLinks) > 15 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <Label className="text-sm font-medium text-yellow-900 mb-2 block">
                  Umfangmaße Links (erforderlich bei Schafthöhe {'>'} 15cm):
                </Label>
                <Input
                  type="text"
                  placeholder="z.B. 35cm"
                  className="w-full border-yellow-300 bg-white"
                  value={umfangmasseLinks}
                  onChange={e => setUmfangmasseLinks(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Schafthöhe Rechts (Right) */}
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <Label className="font-medium text-base md:w-1/3 md:mt-2">Schafthöhe Rechts:</Label>
          <div className="flex flex-col gap-3 w-full md:w-2/3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="z.B. 15"
                className="flex-1 border-gray-300"
                value={schafthoheRechts}
                onChange={e => setSchafthoheRechts(e.target.value)}
              />
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">cm</span>
            </div>
            
            {/* Show Umfangmaße field only if shaft height > 15cm */}
            {parseFloat(schafthoheRechts) > 15 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <Label className="text-sm font-medium text-yellow-900 mb-2 block">
                  Umfangmaße Rechts (erforderlich bei Schafthöhe {'>'} 15cm):
                </Label>
                <Input
                  type="text"
                  placeholder="z.B. 35cm"
                  className="w-full border-yellow-300 bg-white"
                  value={umfangmasseRechts}
                  onChange={e => setUmfangmasseRechts(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>



        {/* Polsterung */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Polsterung:</Label>
          <div className="flex gap-4 flex-wrap">
            {['Standard', 'Lasche', 'Ferse', 'Innen-Außenknöchel', 'Vorderfuß'].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={polsterung.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPolsterung([...polsterung, option]);
                    } else {
                      setPolsterung(polsterung.filter(item => item !== option));
                    }
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Polsterung Anmerkung */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3"> </Label>
          <Textarea
            placeholder="Spezielle Anmerkung (z.B. Polsterdicke in mm, asymmetrisch, extraweich..)"
            className="w-full md:w-1/2 border-gray-300"
            value={polsterungText}
            onChange={(e) => setPolsterungText(e.target.value)}
          />
        </div>

        {/* Verstärkungen */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Verstärkungen:</Label>
          <div className="flex gap-4 flex-wrap">
            {['Standard', 'Fersenverstärkung', 'Innen-Außenknöchel', 'Vorderfuß'].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={verstarkungen.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setVerstarkungen([...verstarkungen, option]);
                    } else {
                      setVerstarkungen(verstarkungen.filter(item => item !== option));
                    }
                  }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Verstärkungen Anmerkung */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3"> </Label>
          <Textarea
            placeholder="Besondere Anmerkung zu den Verstärkungen (z.B. Material, Stärke, Position)"
            className="w-full md:w-1/2 border-gray-300"
            value={verstarkungenText}
            onChange={(e) => setVerstarkungenText(e.target.value)}
          />
        </div>

        {/* Verschlussart */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Verschlussart:</Label>
          <Select 
            value={closureType} 
            onValueChange={(value) => {
              setClosureType(value);
              // Clear checkbox states when switching closure types
              // Only Eyelets supports Schnürsenkel and Ösen, so clear them for Velcro
              if (value === 'Velcro') {
                updateSchnursenkel(undefined);
                updateOsen(undefined);
              }
            }}
          >
            <SelectTrigger className="w-full md:w-1/2 border-gray-300">
              <SelectValue placeholder="Verschlussart wählen..." />
            </SelectTrigger>
              <SelectContent>
                <SelectItem className='cursor-pointer' value="Eyelets">Ösen (Schnürung)</SelectItem>
                <SelectItem className='cursor-pointer' value="Velcro">Klettverschluss</SelectItem>
              </SelectContent>
          </Select>
        </div>


        {/* Zusätze: Schnürsenkel - Only show for Eyelets */}
        {closureType === 'Eyelets' && (
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-5">
            <Label className="font-medium text-base md:w-1/3">
              Möchten Sie passende Schnürsenkel zum Schuh?
            </Label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektSchnursenkel === false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateSchnursenkel(false);
                    } else {
                      updateSchnursenkel(undefined);
                    }
                  }}
                />
                <span>Nein, ohne</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektSchnursenkel === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateSchnursenkel(true);
                    } else {
                      updateSchnursenkel(undefined);
                    }
                  }}
                />
                <span>Ja mit passenden Schnürsenkel
                  <span className="text-green-600 font-semibold"> (+4,49€)</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Zusätze: Ösen einsetzen - Only show for Eyelets */}
        {closureType === 'Eyelets' && (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-medium text-base md:w-1/3">
              Möchten Sie den Schaft bereits mit eingesetzten Ösen?
            </Label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektOsen === false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateOsen(false);
                    } else {
                      updateOsen(undefined);
                    }
                  }}
                />
                <span>Nein, ohne Ösen</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektOsen === true}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateOsen(true);
                    } else {
                      updateOsen(undefined);
                    }
                  }}
                />
                <span>Ja, Ösen einsetzen
                  <span className="text-green-600 font-semibold"> (+8,99€)</span>
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Zusätze: Zusätzlicher Reißverschluss - Always visible */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">
            Möchten Sie einen zusätzlichen Reißverschluss?
          </Label>
          <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektZipperExtra === false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateZipperExtra(false);
                    } else {
                      updateZipperExtra(undefined);
                    }
                  }}
                />
                <span>Nein, ohne zusätzlichen Reißverschluss</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektZipperExtra === true}
                  onChange={(e) => {
                    // If checking the box (turning it on)
                    if (e.target.checked) {
                      // Check if there's already a zipper image
                      if (zipperPlacementImage) {
                        // Just update the checkbox
                        updateZipperExtra(true);
                      } else {
                        // Need to show modal to mark zipper placement
                        if (!shoeImage) {
                          toast.error('Bitte laden Sie zuerst ein Schuhbild hoch.');
                          return;
                        }
                        // Show modal first, then update checkbox after save
                        setShowZipperPlacementModal(true);
                      }
                    } else {
                      // Unchecking - just update the checkbox
                      updateZipperExtra(undefined);
                    }
                  }}
                />
                <span>Ja, zusätzlichen Reißverschluss 
                  <span className="text-green-600 font-semibold"> (+9,99€)</span>
                </span>
              </label>
          </div>
        </div>

        {/* Display Zipper Drawing Image if exists */}
        {effektZipperExtra === true && zipperPlacementImage && (
          <div className="flex flex-col md:flex-row md:items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Label className="font-medium text-base md:w-1/3 md:mt-2">Reißverschluss-Position:</Label>
            <div className="flex-1 space-y-3">
              <div className="relative inline-block">
                {/* Show shoe image as background if available, otherwise just the drawing */}
                {shoeImage ? (
                  <div className="relative">
                    <img 
                      src={shoeImage} 
                      alt="Shoe base" 
                      className="max-w-full h-auto max-h-[300px] rounded border border-gray-300"
                    />
                    <img 
                      src={zipperPlacementImage} 
                      alt="Zipper placement" 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <img 
                    src={zipperPlacementImage} 
                    alt="Zipper placement" 
                    className="max-w-full h-auto max-h-[300px] rounded border border-gray-300"
                  />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowZipperPlacementModal(true)}
                className="mt-2"
              >
                Position bearbeiten
              </Button>
            </div>
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => {
              // Validate shaft height fields
              if (!schafthoheLinks || !schafthoheRechts) {
                toast.error('Bitte geben Sie die Schafthöhe für beide Füße ein.');
                return;
              }

              // Validate Umfangmaße if shaft height > 15cm
              const leftHeight = parseFloat(schafthoheLinks);
              const rightHeight = parseFloat(schafthoheRechts);

              if (leftHeight > 15 && !umfangmasseLinks) {
                toast.error('Bitte geben Sie die Umfangmaße Links ein (erforderlich bei Schafthöhe > 15cm).');
                return;
              }

              if (rightHeight > 15 && !umfangmasseRechts) {
                toast.error('Bitte geben Sie die Umfangmaße Rechts ein (erforderlich bei Schafthöhe > 15cm).');
                return;
              }

              onOrderComplete();
            }}
            className="w-full cursor-pointer md:w-1/3 px-8 py-5 rounded-full bg-black text-white hover:bg-gray-800 text-base font-semibold"
          >
            Abschließen
          </Button>
        </div>

        {/* Leather Color Section Modal */}
        {(numberOfLeatherColors === '2' || numberOfLeatherColors === '3') && (
          <LeatherColorSectionModal
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
            // Reset flag and close modal
            isSavingZipperRef.current = false;
            setShowZipperPlacementModal(false);
          }}
          onSave={(imageDataUrl) => {
            // Mark that we're saving to prevent onClose from resetting closureType
            isSavingZipperRef.current = true;
            // Save the zipper placement image locally
            setZipperPlacementImage(imageDataUrl);
            // Also update parent state if provided
            if (setZipperImage) {
              setZipperImage(imageDataUrl);
            }
            // Set the checkbox to true when zipper placement is saved
            updateZipperExtra(true);
            setShowZipperPlacementModal(false);
            // Reset flag after a brief delay
            setTimeout(() => {
              isSavingZipperRef.current = false;
            }, 100);
          }}
          imageUrl={shoeImage}
          savedDrawing={zipperPlacementImage}
        />
      </div>
    </TooltipProvider>
  );
}

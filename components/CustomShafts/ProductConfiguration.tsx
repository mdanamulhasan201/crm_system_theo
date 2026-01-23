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
  passendenSchnursenkel?: boolean;
  setPassendenSchnursenkel?: (value: boolean) => void;
  osenEinsetzen?: boolean;
  setOsenEinsetzen?: (value: boolean) => void;
  zipperExtra?: boolean;
  setZipperExtra?: (value: boolean) => void;
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
  const [zipperPlacementImage, setZipperPlacementImage] = useState<string | null>(null);
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

  // Ensure closureType is 'Zipper' when zipperPlacementImage exists
  useEffect(() => {
    if (zipperPlacementImage && closureType !== 'Zipper') {
      setClosureType('Zipper');
    }
  }, [zipperPlacementImage, closureType, setClosureType]);

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
      // If parent manages state, fallback to boolean only
      setPassendenSchnursenkel(value ?? false);
    } else {
      setLocalSchnursenkel(value);
    }
  };

  const effektOsen = typeof osenEinsetzen === 'boolean' ? osenEinsetzen : localOsenEinsetzen;
  const updateOsen = (value: boolean | undefined) => {
    if (setOsenEinsetzen) {
      setOsenEinsetzen(value ?? false);
    } else {
      setLocalOsenEinsetzen(value);
    }
  };

  const effektZipperExtra = typeof zipperExtra === 'boolean' ? zipperExtra : localZipperExtra;
  const updateZipperExtra = (value: boolean | undefined) => {
    if (setZipperExtra) {
      setZipperExtra(value ?? false);
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
  const handleModalSave = (assignments: LeatherColorAssignment[], colors: string[]) => {
    setLeatherColorAssignments(assignments);
    setLeatherColors(colors);
    setShowLeatherColorModal(false);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* CAD-Modellierung Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
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
          <div className="flex flex-col gap-3 ml-0 md:ml-[calc(33.333%-0.5rem)]">
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
            <label className="flex items-center gap-2 cursor-pointer">
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

        {/* Schafthöhe */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Schafthöhe:</Label>
          <div className="flex items-center gap-2 w-full md:w-1/2">
            <Input
              type="number"
              placeholder="z.B. 5"
              className="flex-1 border-gray-300"
              value={schafthohe}
              onChange={e => setSchafthohe(e.target.value)}
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">cm</span>
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-medium text-base md:w-1/3">Verschlussart:</Label>
            <Select 
              value={closureType} 
              onValueChange={(value) => {
                if (value === 'Zipper') {
                  // If there's already a saved drawing, allow selection
                  if (zipperPlacementImage) {
                    setClosureType('Zipper');
                  } else {
                    // Show zipper placement modal when Zipper is selected
                    // Don't set closureType yet - wait for user to save the drawing
                    if (!shoeImage) {
                      // Need an image to draw the zipper on
                      toast.error('Bitte laden Sie zuerst ein Schuhbild hoch.');
                      return;
                    }
                    setShowZipperPlacementModal(true);
                  }
                } else {
                  setClosureType(value);
                  // Clear zipper placement when switching to other closure types
                  setZipperPlacementImage(null);
                }
              }}
            >
              <SelectTrigger className="w-full md:w-1/2 border-gray-300">
                <SelectValue placeholder="Verschlussart wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='cursor-pointer' value="Eyelets">Eyelets</SelectItem>
                <SelectItem className='cursor-pointer' value="Zipper">Zipper</SelectItem>
                <SelectItem className='cursor-pointer' value="Velcro">Velcro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Zipper Placement Indicator */}
          {closureType === 'Zipper' && (
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Label className="font-medium text-base md:w-1/3"></Label>
              <div className="w-full md:w-1/2">
                {zipperPlacementImage ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700">✓ Zipper placement marked</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowZipperPlacementModal(true)}
                      className="ml-auto h-8 text-xs"
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-sm text-yellow-700">⚠ Please mark zipper placement</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowZipperPlacementModal(true)}
                      className="ml-auto h-8 text-xs"
                    >
                      Mark Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


        {/* Zusätze: Schnürsenkel - Only show for Eyelets and Zipper */}
        {(closureType === 'Eyelets' || closureType === 'Zipper') && (
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-5">
            <Label className="font-medium text-base md:w-1/3">
              Möchten Sie passende Schnürsenkel zum Schuh? (+4,49€)
            </Label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektSchnursenkel === false}
                  onChange={() => updateSchnursenkel(effektSchnursenkel === false ? undefined : false)}
                />
                <span>Nein, ohne</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektSchnursenkel === true}
                  onChange={() => updateSchnursenkel(effektSchnursenkel === true ? undefined : true)}
                />
                <span>Ja mit passenden Schnürsenkel (+4,49€)</span>
              </label>
            </div>
          </div>
        )}

        {/* Zusätze: Ösen einsetzen - Only show for Eyelets and Zipper */}
        {(closureType === 'Eyelets' || closureType === 'Zipper') && (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-medium text-base md:w-1/3">
              Möchten Sie den Schaft bereits mit eingesetzten Ösen? (+8,99€)
            </Label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektOsen === false}
                  onChange={() => updateOsen(effektOsen === false ? undefined : false)}
                />
                <span>Nein, ohne Ösen</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektOsen === true}
                  onChange={() => updateOsen(effektOsen === true ? undefined : true)}
                />
                <span>Ja, Ösen einsetzen (+8,99€)</span>
              </label>
            </div>
          </div>
        )}

        {/* Zusätze: Zusätzlicher Reißverschluss - Only show for Zipper */}
        {closureType === 'Zipper' && (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-medium text-base md:w-1/3">
              Möchten Sie einen zusätzlichen Reißverschluss? (+9,99€)
            </Label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektZipperExtra === false}
                  onChange={() => updateZipperExtra(effektZipperExtra === false ? undefined : false)}
                />
                <span>Nein, ohne zusätzlichen Reißverschluss</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={effektZipperExtra === true}
                  onChange={() => updateZipperExtra(effektZipperExtra === true ? undefined : true)}
                />
                <span>Ja, zusätzlichen Reißverschluss (+9,99€)</span>
              </label>
            </div>
          </div>
        )}
        {/* Submit Button */}
        <div className="flex justify-center mt-4">
          <Button
            onClick={onOrderComplete}
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
            // Only reset closureType if modal is closed without saving AND no image exists
            // Don't reset if we just saved (check ref for immediate value)
            if (!isSavingZipperRef.current) {
              if (!zipperPlacementImage) {
                setClosureType('');
              }
            }
            isSavingZipperRef.current = false;
            setShowZipperPlacementModal(false);
          }}
          onSave={(imageDataUrl) => {
            // Mark that we're saving to prevent onClose from resetting closureType
            isSavingZipperRef.current = true;
            // Save the zipper placement image
            setZipperPlacementImage(imageDataUrl);
            // Always set closureType to Zipper when image is saved (even when editing)
            // This ensures the dropdown shows Zipper as selected
            setClosureType('Zipper');
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

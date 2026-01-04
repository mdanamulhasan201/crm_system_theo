'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import colorPlate from '@/public/images/color.png';
import LeatherColorSectionModal, { LeatherColorAssignment } from './LeatherColorSectionModal';

interface ProductConfigurationProps {
  nahtfarbeOption: string;
  setNahtfarbeOption: (option: string) => void;
  customNahtfarbe: string;
  setCustomNahtfarbe: (color: string) => void;
  passendenSchnursenkel?: boolean;
  setPassendenSchnursenkel?: (value: boolean) => void;
  osenEinsetzen?: boolean;
  setOsenEinsetzen?: (value: boolean) => void;
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
}

export default function ProductConfiguration({
  nahtfarbeOption,
  setNahtfarbeOption,
  customNahtfarbe,
  setCustomNahtfarbe,
  passendenSchnursenkel,
  setPassendenSchnursenkel,
  osenEinsetzen,
  setOsenEinsetzen,
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
}: ProductConfigurationProps) {
  // Local fallbacks if parent does not control these fields
  const [localSchnursenkel, setLocalSchnursenkel] = useState<boolean | undefined>(undefined);
  const [localOsenEinsetzen, setLocalOsenEinsetzen] = useState<boolean | undefined>(undefined);
  const [showLeatherColorModal, setShowLeatherColorModal] = useState(false);

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

  // Handle number of leather colors change
  const handleNumberOfColorsChange = (value: string) => {
    setNumberOfLeatherColors(value);
    
    // If 1 color is selected, clear assignments and reset to single color mode
    if (value === '1') {
      setLeatherColorAssignments([]);
      setLeatherColors([]);
      setShowLeatherColorModal(false);
    } else if (value === '2' || value === '3') {
      // Open modal when 2 or 3 colors are selected
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
        {/* Ledertyp */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Ledertyp:</Label>
          <Select value={lederType} onValueChange={setLederType}>
            <SelectTrigger className="w-full md:w-1/2">
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

        {/* Number of Leather Colors */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Anzahl der Ledertypen:</Label>
          <Select value={numberOfLeatherColors} onValueChange={handleNumberOfColorsChange}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="Anzahl wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className='cursor-pointer' value="1">1</SelectItem>
              <SelectItem className='cursor-pointer' value="2">2</SelectItem>
              <SelectItem className='cursor-pointer' value="3">3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lederfarbe - Show only when 1 color is selected */}
        {numberOfLeatherColors === '1' && (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Label className="font-medium text-base md:w-1/3">Lederfarbe:</Label>
            <Input
              type="text"
              placeholder="Lederfarbe wählen..."
              className="w-full md:w-1/2"
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
            <SelectTrigger className="w-full md:w-1/2">
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
          <div className="flex flex-col md:w-1/3">
            <Label className="font-medium text-base">Nahtfarbe:</Label>
            <Dialog>
              <DialogContent className="max-w-3xl flex flex-col items-center">
                <DialogTitle>Nahtfarben Katalog</DialogTitle>
                <Image src={colorPlate} alt="Nahtfarben Katalog" className="w-full h-auto rounded shadow" />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <Select value={nahtfarbeOption} onValueChange={setNahtfarbeOption}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Passend zur Lederfarbe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Passend zur Lederfarbe</SelectItem>
                <SelectItem value="personal">Passendste Nahtfarbe nach Personal</SelectItem>
                <SelectItem value="custom">Eigene Farbe angeben</SelectItem>
              </SelectContent>
            </Select>
            {nahtfarbeOption === 'custom' && (
              <Input
                type="text"
                placeholder="Eigene Nahtfarbe angeben..."
                className="w-full md:w-1/2 mt-1"
                value={customNahtfarbe}
                onChange={e => setCustomNahtfarbe(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Schafthöhe */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Label className="font-medium text-base md:w-1/3">Schafthöhe:</Label>
          <div className="flex items-center gap-2 w-fit ">
            <Input
              type="number"
              placeholder="z.B. 5 cm"
              className="flex-1"
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
            className="w-full md:w-2/3"
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
            className="w-full md:w-2/3"
            value={verstarkungenText}
            onChange={(e) => setVerstarkungenText(e.target.value)}
          />
        </div>


        {/* Zusätze: Schnürsenkel */}
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

        {/* Zusätze: Ösen einsetzen */}
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
      </div>
    </TooltipProvider>
  );
}

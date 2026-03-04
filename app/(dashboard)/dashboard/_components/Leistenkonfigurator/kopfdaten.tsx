'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

export type LeistenmaterialType = 'holz' | 'plastik';

export interface KopfdatenData {
  patient: string;
  auftraggeber: string;
  leistenmaterial: LeistenmaterialType;
  leftStlFile: string | null;
  rightStlFile: string | null;
  pdfFile: string | null;
}

export interface KopfdatenRef {
  getData: () => KopfdatenData;
}

interface KopfdatenProps {
  onChange?: () => void;
}

const Kopfdaten = forwardRef<KopfdatenRef, KopfdatenProps>(({ onChange }, ref) => {
  const [patient, setPatient] = useState<string>('');
  const [auftraggeber, setAuftraggeber] = useState<string>('');
  const [leistenmaterial, setLeistenmaterial] = useState<LeistenmaterialType>('plastik');
  const [leftFileName, setLeftFileName] = useState<string | null>(null);
  const [rightFileName, setRightFileName] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const leftInputRef = useRef<HTMLInputElement | null>(null);
  const rightInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    getData: () => ({
      patient,
      auftraggeber,
      leistenmaterial,
      leftStlFile: leftFileName,
      rightStlFile: rightFileName,
      pdfFile: pdfFileName,
    }),
  }));

  const handleLeftFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLeftFileName(file.name);
    } else {
      setLeftFileName(null);
    }
  };

  const handleRightFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRightFileName(file.name);
    } else {
      setRightFileName(null);
    }
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
    } else {
      setPdfFileName(null);
    }
  };

  return (
    <section className="relative w-full rounded-2xl border border-gray-200 bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden">
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#6B9B87] rounded-r-full" />

      {/* Section title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Kopfdaten
      </h2>

      {/* Two-column grid for the basic fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
        {/* Patient / Kommission */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <Input
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Name des Patienten"
            className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300"
          />
        </div>

        {/* Firma und Ansprechpartner */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
          Auftraggeber
          </label>
          <Input
            value={auftraggeber}
            onChange={(e) => setAuftraggeber(e.target.value)}
            placeholder="Firmenname und Kontaktperson"
            className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300"
          />
        </div>
      </div>

      {/* Upload buttons row */}
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Left STL upload */}
        <div className="flex-1">
          <input
            type="file"
            accept=".stl,model/stl"
            className="hidden"
            onChange={handleLeftFileChange}
            ref={leftInputRef}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => leftInputRef.current?.click()}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 text-sm font-normal text-gray-700 hover:bg-gray-100"
          >
            <UploadCloud className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {leftFileName
                ? leftFileName
                : 'Upload 3D-Datei Linker Fuß'}
            </span>
          </Button>
        </div>

        {/* Right STL upload */}
        <div className="flex-1">
          <input
            type="file"
            accept=".stl,model/stl"
            className="hidden"
            onChange={handleRightFileChange}
            ref={rightInputRef}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => rightInputRef.current?.click()}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 text-sm font-normal text-gray-700 hover:bg-gray-100"
          >
            <UploadCloud className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {rightFileName
                ? rightFileName
                : 'Upload 3D-Datei Rechter Fuß'}
            </span>
          </Button>
        </div>

        {/* PDF upload */}
        <div className="flex-1">
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfFileChange}
            ref={pdfInputRef}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => pdfInputRef.current?.click()}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 text-sm font-normal text-gray-700 hover:bg-gray-100"
          >
            <UploadCloud className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {pdfFileName ? pdfFileName : 'Upload PDF'}
            </span>
          </Button>
        </div>
      </div>

      {/* Leistenmaterial - bottom */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Leistenmaterial
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Aus welchem Material soll der Leisten gefertigt werden?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-3 cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#6B9B87]/50 has-[:checked]:border-[#6B9B87] has-[:checked]:bg-[#6B9B87]/5">
            <input
              type="radio"
              name="leistenmaterial"
              value="holz"
              checked={leistenmaterial === 'holz'}
              onChange={() => {
                setLeistenmaterial('holz');
                onChange?.();
              }}
              className="h-4 w-4 border-gray-300 text-[#6B9B87] focus:ring-[#6B9B87]"
            />
            <span className="text-sm font-medium text-gray-800">Holzleisten</span>
            <span className="text-sm text-emerald-600 font-medium">+ 30 €</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#6B9B87]/50 has-[:checked]:border-[#6B9B87] has-[:checked]:bg-[#6B9B87]/5">
            <input
              type="radio"
              name="leistenmaterial"
              value="plastik"
              checked={leistenmaterial === 'plastik'}
              onChange={() => {
                setLeistenmaterial('plastik');
                onChange?.();
              }}
              className="h-4 w-4 border-gray-300 text-[#6B9B87] focus:ring-[#6B9B87]"
            />
            <span className="text-sm font-medium text-gray-800">Plastikleisten</span>
          </label>
        </div>
      </div>
    </section>
  );
});

Kopfdaten.displayName = 'Kopfdaten';

export default Kopfdaten;



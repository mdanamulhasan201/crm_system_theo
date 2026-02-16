'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

export interface KopfdatenData {
  patient: string;
  auftraggeber: string;
  leftStlFile: string | null;
  rightStlFile: string | null;
  pdfFile: string | null;
}

export interface KopfdatenRef {
  getData: () => KopfdatenData;
}

const Kopfdaten = forwardRef<KopfdatenRef>((props, ref) => {
  const [patient, setPatient] = useState<string>('');
  const [auftraggeber, setAuftraggeber] = useState<string>('');
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
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#2563eb] rounded-r-full" />

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
                : 'Upload 3D-Datei Linker Leisten (.stl)'}
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
                : 'Upload 3D-Datei Rechter Leisten (.stl)'}
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
    </section>
  );
});

Kopfdaten.displayName = 'Kopfdaten';

export default Kopfdaten;



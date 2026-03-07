'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

export type LeistenmaterialType = 'holz' | 'plastik';

export interface KopfdatenData {
  patient: string;
  leistenmaterial: LeistenmaterialType;
  leftStlFile: string | null;
  rightStlFile: string | null;
  pdfFile: string | null;
}

export interface KopfdatenFiles {
  leftStlFile: File | null;
  rightStlFile: File | null;
  pdfFile: File | null;
}

export interface KopfdatenRef {
  getData: () => KopfdatenData;
  getFiles: () => KopfdatenFiles;
}

export interface KopfdatenValidationErrors {
  patient?: boolean;
  leftStlFile?: boolean;
  rightStlFile?: boolean;
  pdfFile?: boolean;
}

interface KopfdatenProps {
  onChange?: (leistenmaterial: LeistenmaterialType) => void;
  errors?: KopfdatenValidationErrors;
  sectionId?: string;
  /** Call when user edits any validated field so parent can clear red errors */
  onClearValidationErrors?: () => void;
}

const Kopfdaten = forwardRef<KopfdatenRef, KopfdatenProps>(({ onChange, errors, sectionId = 'section-kopfdaten', onClearValidationErrors }, ref) => {
  const [patient, setPatient] = useState<string>('');
  const [leistenmaterial, setLeistenmaterial] = useState<LeistenmaterialType>('holz');
  const [leftFileName, setLeftFileName] = useState<string | null>(null);
  const [rightFileName, setRightFileName] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const leftInputRef = useRef<HTMLInputElement | null>(null);
  const rightInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    getData: () => ({
      patient,
      leistenmaterial,
      leftStlFile: leftFileName,
      rightStlFile: rightFileName,
      pdfFile: pdfFileName,
    }),
    getFiles: () => ({
      leftStlFile: leftFile,
      rightStlFile: rightFile,
      pdfFile,
    }),
  }));

  const handleLeftFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLeftFileName(file.name);
      setLeftFile(file);
    } else {
      setLeftFileName(null);
      setLeftFile(null);
    }
    onClearValidationErrors?.();
  };

  const handleRightFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRightFileName(file.name);
      setRightFile(file);
    } else {
      setRightFileName(null);
      setRightFile(null);
    }
    onClearValidationErrors?.();
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      setPdfFile(file);
    } else {
      setPdfFileName(null);
      setPdfFile(null);
    }
    onClearValidationErrors?.();
  };

  return (
    <section id={sectionId} className={`relative w-full rounded-2xl border bg-white px-6 py-6 md:px-8 md:py-8 shadow-sm overflow-hidden ${errors && (errors.patient || errors.leftStlFile || errors.rightStlFile || errors.pdfFile) ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-200'}`}>
      {/* Left blue accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-[3px] bg-[#6B9B87] rounded-r-full" />

      {/* Section title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Kopfdaten
      </h2>

      {/* Patient field – full width */}
      <div className="mb-6">
        {/* Patient / Kommission */}
        <div className="space-y-2 w-full">
          <label className="block text-sm font-medium text-gray-700">
            Patient <span className="text-red-500">*</span>
          </label>
          <Input
            value={patient}
            onChange={(e) => {
              setPatient(e.target.value);
              onClearValidationErrors?.();
            }}
            placeholder="Name des Patienten"
            className={`h-11 rounded-lg bg-gray-50 text-sm focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:border-gray-300 ${errors?.patient ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-200'}`}
          />
          {errors?.patient && <p className="text-xs text-red-600">Bitte geben Sie den Namen des Patienten ein.</p>}
        </div>
      </div>

      {/* Upload buttons row */}
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Left STL upload */}
        <div className="flex-1 space-y-1">
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
            className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-gray-50 px-4 text-sm font-normal text-gray-700 hover:bg-gray-100 ${errors?.leftStlFile ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300'}`}
          >
            <UploadCloud className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {leftFileName
                ? leftFileName
                : 'Upload 3D-Datei Linker Fuß'}
            </span>
          </Button>
          {errors?.leftStlFile && <p className="text-xs text-red-600">Bitte 3D-Datei Linker Fuß hochladen.</p>}
        </div>

        {/* Right STL upload */}
        <div className="flex-1 space-y-1">
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
            className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-gray-50 px-4 text-sm font-normal text-gray-700 hover:bg-gray-100 ${errors?.rightStlFile ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300'}`}
          >
            <UploadCloud className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {rightFileName
                ? rightFileName
                : 'Upload 3D-Datei Rechter Fuß'}
            </span>
          </Button>
          {errors?.rightStlFile && <p className="text-xs text-red-600">Bitte 3D-Datei Rechter Fuß hochladen.</p>}
        </div>

        {/* PDF upload */}
        <div className="flex-1 space-y-1">
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
            className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-gray-50 px-4 text-sm font-normal text-gray-700 hover:bg-gray-100 ${errors?.pdfFile ? 'border-red-500 ring-1 ring-red-200' : 'border-gray-300'}`}
          >
            <UploadCloud className="h-4 w-4 text-gray-500" />
            <span className="truncate">
              {pdfFileName ? pdfFileName : 'Upload PDF'}
            </span>
          </Button>
          {errors?.pdfFile && <p className="text-xs text-red-600">Bitte Halbprobenerstellung-PDF hochladen.</p>}
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
                onChange?.('holz');
              }}
              className="h-4 w-4 border-gray-300 text-[#6B9B87] focus:ring-[#6B9B87]"
            />
            <span className="text-sm font-medium text-gray-800">Holzleisten</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#6B9B87]/50 has-[:checked]:border-[#6B9B87] has-[:checked]:bg-[#6B9B87]/5">
            <input
              type="radio"
              name="leistenmaterial"
              value="plastik"
              checked={leistenmaterial === 'plastik'}
              onChange={() => {
                setLeistenmaterial('plastik');
                onChange?.('plastik');
              }}
              className="h-4 w-4 border-gray-300 text-[#6B9B87] focus:ring-[#6B9B87]"
            />
            <span className="text-sm font-medium text-gray-800">Plastikleisten</span>
            <span className="text-sm text-emerald-600 font-medium">- 20 €</span>
          </label>
        </div>
      </div>
    </section>
  );
});

Kopfdaten.displayName = 'Kopfdaten';

export default Kopfdaten;



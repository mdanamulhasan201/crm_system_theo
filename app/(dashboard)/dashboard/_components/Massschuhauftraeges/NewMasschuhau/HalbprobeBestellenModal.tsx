'use client';

import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Box, Check, RefreshCw, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALLOWED_EXTENSIONS = '.stl,.obj,.step';
const MAX_SIZE_MB = 200;

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

export interface HalbprobeBestellenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Called when user clicks "Weiter zur Bestellung" with both files selected; open review modal after closing this one */
    onWeiterZurBestellung?: (data: { fileLeftName: string; fileRightName: string }) => void;
}

function UploadBlock({
    label,
    file,
    onFileChange,
    inputRef,
    onTriggerClick,
}: {
    label: string;
    file: File | null;
    onFileChange: (f: File | null) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onTriggerClick: () => void;
}) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const f = e.dataTransfer.files?.[0];
        if (f && /\.(stl|obj|step)$/i.test(f.name) && f.size <= MAX_SIZE_MB * 1024 * 1024) {
            onFileChange(f);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        onFileChange(f ?? null);
        e.target.value = '';
    };

    if (file) {
        return (
            <div className="min-w-0 space-y-2">
                <label className="text-sm font-bold text-gray-900">
                    {label} <span className="text-red-500">*</span>
                </label>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED_EXTENSIONS}
                    className="hidden"
                    onChange={handleInputChange}
                />
                <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 py-3.5 pl-4 pr-4 shadow-sm ring-1 ring-emerald-100/50">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                            <Check className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)} · Erfolgreich hochgeladen
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onTriggerClick}
                        className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        <RefreshCw className="size-4" aria-hidden />
                        Ersetzen
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900">
                {label} <span className="text-red-500">*</span>
            </label>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                className={cn(
                    'rounded-xl border-2 border-dashed bg-white p-6 transition-all duration-200 shadow-sm',
                    dragActive ? 'border-[#62A07C]/50 bg-[#62A07C]/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED_EXTENSIONS}
                    className="hidden"
                    onChange={handleInputChange}
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#62A07C]/15 text-[#62A07C] ring-2 ring-[#62A07C]/10">
                        <Upload className="size-6" aria-hidden />
                    </div>
                    <button
                        type="button"
                        onClick={onTriggerClick}
                        className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 transition-all hover:bg-gray-200 hover:border-gray-300 cursor-pointer shadow-sm"
                    >
                        3D-Datei hochladen
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                        Erlaubte Formate: STL, OBJ, STEP. Maximale Dateigröße: {MAX_SIZE_MB} MB.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function HalbprobeBestellenModal({
    open,
    onOpenChange,
    onWeiterZurBestellung,
}: HalbprobeBestellenModalProps) {
    const [fileLeft, setFileLeft] = useState<File | null>(null);
    const [fileRight, setFileRight] = useState<File | null>(null);
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        setFileLeft(null);
        setFileRight(null);
        onOpenChange(false);
    };

    const canProceed = !!fileLeft && !!fileRight;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-x-hidden overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl ring-1 ring-gray-200/90 sm:max-w-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:text-gray-400 [&>button]:hover:text-gray-600 [&>button]:hover:bg-gray-100 [&>button]:rounded-full">
                <div className="min-w-0 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white p-6 sm:p-8">
                    <DialogHeader className="space-y-3">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#62A07C]/15 text-[#62A07C] shadow-sm ring-1 ring-[#62A07C]/10">
                                <Box className="size-6" aria-hidden />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                                    Halbprobe bestellen
                                </DialogTitle>
                                <DialogDescription asChild>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                    Bitte laden Sie den linken und Rechten Leisten als 3D Datei hoch. Erst danach können Sie fortfahren...
                                    </p>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:gap-6">
                        <div className="min-w-0 flex-1">
                            <UploadBlock
                                label="Leiste links"
                                file={fileLeft}
                                onFileChange={setFileLeft}
                                inputRef={leftInputRef}
                                onTriggerClick={() => leftInputRef.current?.click()}
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <UploadBlock
                                label="Leiste rechts"
                                file={fileRight}
                                onFileChange={setFileRight}
                                inputRef={rightInputRef}
                                onTriggerClick={() => rightInputRef.current?.click()}
                            />
                        </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-4 sm:px-5 sm:py-4 shadow-sm ring-1 ring-gray-100">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-bold text-gray-900">Preis Halbprobe</p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    zzgl. Versandgebühren (werden im nächsten Schritt angezeigt).
                                </p>
                            </div>
                            <p className="text-xl font-bold text-[#62A07C]">49,99 €</p>
                        </div>
                    </div>

                    <p className="mt-5 text-sm leading-relaxed text-gray-600">
                        Durch das Fortfahren bestätigen Sie, dass die hochgeladenen Dateien für die Fertigung verwendet werden dürfen.
                    </p>

                    <div className="mt-7 flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!canProceed || !fileLeft || !fileRight) return;
                                onOpenChange(false);
                                onWeiterZurBestellung?.({ fileLeftName: fileLeft.name, fileRightName: fileRight.name });
                            }}
                            disabled={!canProceed}
                            className={cn(
                                'rounded-xl cursor-pointer px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all',
                                canProceed
                                    ? 'bg-[#62A07C] hover:bg-[#4A8A5F] hover:shadow-lg hover:-translate-y-0.5'
                                    : 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-none'
                            )}
                        >
                            Weiter zur Bestellung
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

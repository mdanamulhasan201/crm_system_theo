'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface SchnellAuftragModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PERFORMED_BY_OPTIONS = ['Max Mustermann'];
const LOCATION_OPTIONS = ['Innsbruck – Maximilianstraße 23'];
const LEISTENTYP_OPTIONS = ['Standard', 'Schmal', 'Weit', 'Maßlast'];

function toISODateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDateForDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function SchnellAuftragModal({ isOpen, onClose }: SchnellAuftragModalProps) {
    const [performedBy, setPerformedBy] = useState('Max Mustermann');
    const [standort, setStandort] = useState('Innsbruck – Maximilianstraße 23');
    const [kundenname, setKundenname] = useState('');
    const [halbprobe, setHalbprobe] = useState<'nein' | 'ja'>('nein');
    const [vorbereitungsdatum, setVorbereitungsdatum] = useState('');
    const [notizenVorbereitung, setNotizenVorbereitung] = useState('');
    const [anprobedatum, setAnprobedatum] = useState('');
    const [notizenAnprobe, setNotizenAnprobe] = useState('');
    const [leisten, setLeisten] = useState<'nein' | 'ja'>('ja');
    const [leistenMaterial, setLeistenMaterial] = useState('');
    const [leistentyp, setLeistentyp] = useState('');
    const [notizenLeisten, setNotizenLeisten] = useState('');
    const [bettung, setBettung] = useState<'nein' | 'ja'>('nein');
    const [bettungMaterial, setBettungMaterial] = useState('');
    const [bettungDicke, setBettungDicke] = useState('');
    const [notizenBettung, setNotizenBettung] = useState('');
    const [preisKrankenkassa, setPreisKrankenkassa] = useState<'nein' | 'ja'>('nein');

    const handleCreate = () => {
        // TODO: submit order
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:!max-w-4xl p-0 gap-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white h-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200/80">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Schnell Auftrag erstellen
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-0.5">
                        Schneller Produktionsstart
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Basisinformationen */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Basisinformationen
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                        Durchgeführt von <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={performedBy} onValueChange={setPerformedBy}>
                                        <SelectTrigger className="rounded-lg border-gray-200 focus:ring-2 focus:ring-[#61A175]/30 focus:border-[#61A175] h-9">
                                            <SelectValue placeholder="Auswählen..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PERFORMED_BY_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                        Standort <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={standort} onValueChange={setStandort}>
                                        <SelectTrigger className="rounded-lg border-gray-200 focus:ring-2 focus:ring-[#61A175]/30 focus:border-[#61A175] h-9">
                                            <SelectValue placeholder="Auswählen..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LOCATION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                        Kundenname <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={kundenname}
                                        onChange={(e) => setKundenname(e.target.value)}
                                        placeholder="Name des Kunden..."
                                        className="rounded-lg border-gray-200 focus-visible:ring-[#61A175]/30 focus-visible:border-[#61A175]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Halbprobe */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                Halbprobe
                            </p>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Halbprobe eingeplant?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setHalbprobe('nein')}
                                    className={cn(
                                        'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        halbprobe === 'nein'
                                            ? 'bg-[#61A175] text-white'
                                            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    )}
                                >
                                    Nein
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHalbprobe('ja')}
                                    className={cn(
                                        'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        halbprobe === 'ja'
                                            ? 'bg-[#61A175] text-white'
                                            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    )}
                                >
                                    Ja
                                </button>
                            </div>

                            {halbprobe === 'ja' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Vorbereitungsdatum
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'h-10 w-full justify-start gap-2 rounded-lg border-gray-200 bg-white pl-3 text-left text-sm font-normal hover:bg-gray-50',
                                                        !vorbereitungsdatum && 'text-gray-500'
                                                    )}
                                                >
                                                    <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                                    {vorbereitungsdatum
                                                        ? formatDateForDisplay(vorbereitungsdatum)
                                                        : 'Datum wählen'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        vorbereitungsdatum
                                                            ? new Date(vorbereitungsdatum + 'T00:00:00')
                                                            : undefined
                                                    }
                                                    onSelect={(date) =>
                                                        date && setVorbereitungsdatum(toISODateString(date))
                                                    }
                                                    initialFocus
                                                    captionLayout="dropdown"
                                                    fromYear={new Date().getFullYear() - 2}
                                                    toYear={new Date().getFullYear() + 5}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Notizen Vorbereitung
                                        </label>
                                        <textarea
                                            value={notizenVorbereitung}
                                            onChange={(e) => setNotizenVorbereitung(e.target.value)}
                                            placeholder="Hinweise zur Vorbereitung..."
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#61A175]/30 focus:border-[#61A175] resize-y"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Anprobedatum
                                        </label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'h-10 w-full justify-start gap-2 rounded-lg border-gray-200 bg-white pl-3 text-left text-sm font-normal hover:bg-gray-50',
                                                        !anprobedatum && 'text-gray-500'
                                                    )}
                                                >
                                                    <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
                                                    {anprobedatum
                                                        ? formatDateForDisplay(anprobedatum)
                                                        : 'Datum wählen'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        anprobedatum
                                                            ? new Date(anprobedatum + 'T00:00:00')
                                                            : undefined
                                                    }
                                                    onSelect={(date) =>
                                                        date && setAnprobedatum(toISODateString(date))
                                                    }
                                                    initialFocus
                                                    captionLayout="dropdown"
                                                    fromYear={new Date().getFullYear() - 2}
                                                    toYear={new Date().getFullYear() + 5}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Notizen Anprobe
                                        </label>
                                        <textarea
                                            value={notizenAnprobe}
                                            onChange={(e) => setNotizenAnprobe(e.target.value)}
                                            placeholder="Hinweise zur Anprobe..."
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#61A175]/30 focus:border-[#61A175] resize-y"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Leisten */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                Leisten
                            </p>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Leisten vorhanden?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setLeisten('nein')}
                                    className={cn(
                                        'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        leisten === 'nein'
                                            ? 'bg-[#61A175] text-white'
                                            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    )}
                                >
                                    Nein
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLeisten('ja')}
                                    className={cn(
                                        'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        leisten === 'ja'
                                            ? 'bg-[#61A175] text-white'
                                            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    )}
                                >
                                    Ja
                                </button>
                            </div>

                            {leisten === 'nein' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Material
                                        </label>
                                        <Input
                                            value={leistenMaterial}
                                            onChange={(e) => setLeistenMaterial(e.target.value)}
                                            placeholder="z.B. Buche, Kunststoff..."
                                            className="rounded-lg border-gray-200 focus-visible:ring-[#61A175]/30 focus-visible:border-[#61A175]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Leistentyp
                                        </label>
                                        <Select value={leistentyp} onValueChange={setLeistentyp}>
                                            <SelectTrigger className="rounded-lg border-gray-200 focus:ring-2 focus:ring-[#61A175]/30 focus:border-[#61A175] h-9">
                                                <SelectValue placeholder="Typ wählen" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LEISTENTYP_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Notizen
                                        </label>
                                        <textarea
                                            value={notizenLeisten}
                                            onChange={(e) => setNotizenLeisten(e.target.value)}
                                            placeholder="Hinweise zu Leisten..."
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#61A175]/30 focus:border-[#61A175] resize-y"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bettung */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                                Bettung
                            </p>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Bettung erforderlich?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setBettung('nein')}
                                    className={cn(
                                        'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        bettung === 'nein'
                                            ? 'bg-[#61A175] text-white'
                                            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    )}
                                >
                                    Nein
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBettung('ja')}
                                    className={cn(
                                        'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                        bettung === 'ja'
                                            ? 'bg-[#61A175] text-white'
                                            : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                    )}
                                >
                                    Ja
                                </button>
                            </div>

                            {bettung === 'ja' && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Material
                                        </label>
                                        <Input
                                            value={bettungMaterial}
                                            onChange={(e) => setBettungMaterial(e.target.value)}
                                            placeholder="z.B. Kork, EVA..."
                                            className="rounded-lg border-gray-200 focus-visible:ring-[#61A175]/30 focus-visible:border-[#61A175]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Dicke (mm)
                                        </label>
                                        <Input
                                            value={bettungDicke}
                                            onChange={(e) => setBettungDicke(e.target.value)}
                                            placeholder="z.B. 4"
                                            className="rounded-lg border-gray-200 focus-visible:ring-[#61A175]/30 focus-visible:border-[#61A175]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                            Notizen
                                        </label>
                                        <textarea
                                            value={notizenBettung}
                                            onChange={(e) => setNotizenBettung(e.target.value)}
                                            placeholder="Hinweise zur Bettung..."
                                            rows={2}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#61A175]/30 focus:border-[#61A175] resize-y"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preis/Krankenkassa */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                            Preis / Krankenkassa
                        </p>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Preis/Krankenkassa?
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPreisKrankenkassa('nein')}
                                className={cn(
                                    'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                    preisKrankenkassa === 'nein'
                                        ? 'bg-[#61A175] text-white'
                                        : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                )}
                            >
                                Nein
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreisKrankenkassa('ja')}
                                className={cn(
                                    'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                                    preisKrankenkassa === 'ja'
                                        ? 'bg-[#61A175] text-white'
                                        : 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                )}
                            >
                                Ja
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-3 border-t border-gray-200/80 bg-white/50 rounded-b-xl gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="rounded-md cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-4 text-xs font-medium"
                    >
                        Abbrechen
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleCreate}
                        className="rounded-md cursor-pointer bg-[#61A175] hover:bg-[#61A175]/80 text-white font-semibold h-8 px-4 text-xs"
                    >
                        Auftrag erstellen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

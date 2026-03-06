'use client';

import React, { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Info, X } from 'lucide-react';

const CATEGORY_OPTIONS = [
    { value: 'Halbschuhe', label: 'Halbschuhe' },
    { value: 'Stiefel', label: 'Stiefel' },
    { value: 'Knöchelhoch', label: 'Knöchelhoch' },
    { value: 'Sandalen', label: 'Sandalen' },
    { value: 'Bergschuhe', label: 'Bergschuhe' },
    { value: 'Businessschuhe', label: 'Businessschuhe' },
];

const INNENFUTTER_OPTIONS = [
    { value: 'ziegenleder-hellbraun', label: 'Ziegenleder hellbraun' },
    { value: 'kalbsleder-beige', label: 'Kalbsleder Beige' },
    { value: 'sport-mesh-nero-schwarz', label: 'Sport Mesh Nero/Schwarz' },
    { value: 'comfort-line-nero-schwarz', label: 'Comfort Line Nero/Schwarz' },
];

const VERSCHLUSS_OPTIONS = [
    { value: 'Eyelets', label: 'Ösen (Schnürung)' },
    { value: 'Velcro', label: 'Klettverschluss' },
];

const POLSTERUNG_OPTIONS = ['Standard', 'Lasche', 'Ferse', 'Innen-Außenknöchel', 'Vorderfuß'];
const VERSTAERKUNGEN_OPTIONS = ['Standard', 'Fersenverstärkung', 'Innen-Außenknöchel', 'Vorderfuß'];

export interface SchafttypConfiguratorPageProps {
    onClose: () => void;
}

export default function SchafttypConfiguratorPage({ onClose }: SchafttypConfiguratorPageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [cadModeling, setCadModeling] = useState<'1x' | '2x'>('1x');
    const [kategorie, setKategorie] = useState('');
    const [anzahlLedertypen, setAnzahlLedertypen] = useState('');
    const [innenfutter, setInnenfutter] = useState('');
    const [nahtfarbe, setNahtfarbe] = useState('');
    const [schafthoheLinks, setSchafthoheLinks] = useState('');
    const [schafthoheRechts, setSchafthoheRechts] = useState('');
    const [polsterung, setPolsterung] = useState<string[]>([]);
    const [polsterungText, setPolsterungText] = useState('');
    const [verstarkungen, setVerstarkungen] = useState<string[]>([]);
    const [verstarkungenText, setVerstarkungenText] = useState('');
    const [verschlussart, setVerschlussart] = useState('');
    const [zipperExtra, setZipperExtra] = useState<boolean>(false);
    const [sonstigeNotizen, setSonstigeNotizen] = useState('');

    const handleImageClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file?.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === 'string' && setUploadedImage(reader.result);
        reader.readAsDataURL(file);
    };

    const togglePolsterung = (opt: string) => {
        setPolsterung((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
    };
    const toggleVerstarkungen = (opt: string) => {
        setVerstarkungen((prev) => (prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]));
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header */}
            <header className="relative shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-200 pr-14">
                <h1 className="text-lg font-bold text-gray-800">Massschaftkonfigurator</h1>
                <p className="text-sm font-medium text-gray-600">Custom Made #1000</p>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 rounded-full hover:bg-gray-100"
                    onClick={onClose}
                    aria-label="Schließen"
                >
                    <X className="h-5 w-5" />
                </Button>
            </header>

            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full space-y-6">
                <div>
                    <button
                        type="button"
                        onClick={handleImageClick}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {uploadedImage ? (
                            <img src={uploadedImage} alt="Upload" className="max-h-32 object-contain rounded" />
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Bild hochladen</span>
                                <span className="text-xs text-gray-400">Klicken Sie hier, um ein Bild auszuwählen</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label className="font-medium text-base">CAD-Modellierung</Label>
                        <div className="relative group">
                            <Info className="w-5 h-5 text-gray-400 cursor-help" />
                            <div className="absolute left-0 bottom-full mb-1 w-72 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Bei deutlich unterschiedlichen Füßen empfehlen wir zwei separate CAD-Modellierungen.
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={cadModeling === '1x'} onChange={() => setCadModeling('1x')} />
                            <span className="text-sm">1× CAD-Modellierung (Standard)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={cadModeling === '2x'} onChange={() => setCadModeling('2x')} />
                            <span className="text-sm">2× CAD-Modellierung (separat) <span className="text-emerald-600 font-semibold">+6,99 €</span></span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:items-center">
                    <Label className="font-medium text-base">Kategorie:</Label>
                    <Select value={kategorie} onValueChange={setKategorie}>
                        <SelectTrigger className="col-span-2 border-gray-300">
                            <SelectValue placeholder="Kategorie wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORY_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:items-center">
                    <Label className="font-medium text-base">Anzahl der Ledertypen:</Label>
                    <Select value={anzahlLedertypen} onValueChange={setAnzahlLedertypen}>
                        <SelectTrigger className="col-span-2 border-gray-300">
                            <SelectValue placeholder="Auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:items-center">
                    <Label className="font-medium text-base">Innenfutter:</Label>
                    <Select value={innenfutter} onValueChange={setInnenfutter}>
                        <SelectTrigger className="col-span-2 border-gray-300">
                            <SelectValue placeholder="Innenfutter wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                            {INNENFUTTER_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:items-center">
                    <Label className="font-medium text-base">Nahtfarbe:</Label>
                    <Input
                        type="text"
                        placeholder="Passende Nahtfarbe / Passend zur Lederfarbe"
                        className="col-span-2 border-gray-300"
                        value={nahtfarbe}
                        onChange={(e) => setNahtfarbe(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:items-center">
                    <Label className="font-medium text-base">Schafthöhe Links:</Label>
                    <div className="col-span-2 flex items-center gap-2">
                        <Input type="text" placeholder="z.B. 14" className="border-gray-300" value={schafthoheLinks} onChange={(e) => setSchafthoheLinks(e.target.value)} />
                        <span className="text-sm text-gray-600">cm</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:items-center">
                    <Label className="font-medium text-base">Schafthöhe Rechts:</Label>
                    <div className="col-span-2 flex items-center gap-2">
                        <Input type="text" placeholder="z.B. 14" className="border-gray-300" value={schafthoheRechts} onChange={(e) => setSchafthoheRechts(e.target.value)} />
                        <span className="text-sm text-gray-600">cm</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="font-medium text-base">Polsterung:</Label>
                    <div className="flex flex-wrap gap-4">
                        {POLSTERUNG_OPTIONS.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox checked={polsterung.includes(opt)} onChange={() => togglePolsterung(opt)} />
                                <span className="text-sm">{opt}</span>
                            </label>
                        ))}
                    </div>
                    <Textarea placeholder="Spezielle Anmerkung (z.B. Polsterdicke in mm, asymmetrisch, extraweich..)" className="border-gray-300 mt-2" rows={2} value={polsterungText} onChange={(e) => setPolsterungText(e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label className="font-medium text-base">Verstärkungen:</Label>
                    <div className="flex flex-wrap gap-4">
                        {VERSTAERKUNGEN_OPTIONS.map((opt) => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox checked={verstarkungen.includes(opt)} onChange={() => toggleVerstarkungen(opt)} />
                                <span className="text-sm">{opt}</span>
                            </label>
                        ))}
                    </div>
                    <Textarea placeholder="Besondere Anmerkung zu den Verstärkungen (z.B. Material, Stärke, Position)" className="border-gray-300 mt-2" rows={2} value={verstarkungenText} onChange={(e) => setVerstarkungenText(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:items-center">
                    <Label className="font-medium text-base">Verschlussart:</Label>
                    <Select value={verschlussart} onValueChange={setVerschlussart}>
                        <SelectTrigger className="col-span-2 border-gray-300">
                            <SelectValue placeholder="Verschlussart wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                            {VERSCHLUSS_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="font-medium text-base">Möchten Sie einen zusätzlichen Reißverschluss?</Label>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={!zipperExtra} onChange={() => setZipperExtra(false)} />
                            <span className="text-sm">Nein, ohne zusätzlichen Reißverschluss</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox checked={zipperExtra} onChange={() => setZipperExtra(true)} />
                            <span className="text-sm">Ja, zusätzlicher Reißverschluss <span className="text-emerald-600 font-semibold">(+9,99 €)</span></span>
                        </label>
                    </div>
                </div>

                <div className="space-y-1">
                    <Label className="font-medium text-base">Sonstige Notizen:</Label>
                    <Textarea placeholder="Zusätzliche Informationen, Sonderwünsche, Produktionshinweise, etc. (optional)" className="border-gray-300" rows={3} value={sonstigeNotizen} onChange={(e) => setSonstigeNotizen(e.target.value)} />
                    <p className="text-xs text-gray-500">Diese Notizen erscheinen in der Rechnung/PDF</p>
                </div>

                <div className="pt-2">
                    <Button type="button" className="w-full bg-gray-900 hover:bg-gray-800 text-white" onClick={onClose}>
                        Abschließen
                    </Button>
                </div>
            </div>
        </div>
    );
}

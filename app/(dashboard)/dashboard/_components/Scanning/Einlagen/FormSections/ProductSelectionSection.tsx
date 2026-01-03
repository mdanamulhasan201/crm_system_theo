import React from 'react';
import SimpleDropdown from '../Dropdowns/SimpleDropdown';
import type { EinlageType } from '@/hooks/customer/useScanningFormData';

interface EinlageOption {
    name: string;
    price?: number;
}

interface ProductSelectionSectionProps {
    // Einlage
    einlagentyp: string;
    selectedEinlage: EinlageType | string;
    einlageOptions: EinlageType[] | EinlageOption[];
    showEinlageDropdown: boolean;
    onEinlageToggle: () => void;
    onEinlageSelect: (value: EinlageType) => void;
    einlagentypError?: string;
    // Überzug
    überzug: string;
    uberzugOptions: string[];
    showUberzugDropdown: boolean;
    onUberzugToggle: () => void;
    onUberzugSelect: (value: string) => void;
    überzugError?: string;
    // Menge
    menge: string;
    mengeOptions: string[];
    showMengeDropdown: boolean;
    onMengeToggle: () => void;
    onMengeSelect: (value: string) => void;
    mengeError?: string;
}

export default function ProductSelectionSection({
    einlagentyp,
    selectedEinlage,
    einlageOptions,
    showEinlageDropdown,
    onEinlageToggle,
    onEinlageSelect,
    einlagentypError,
    überzug,
    uberzugOptions,
    showUberzugDropdown,
    onUberzugToggle,
    onUberzugSelect,
    überzugError,
    menge,
    mengeOptions,
    showMengeDropdown,
    onMengeToggle,
    onMengeSelect,
    mengeError,
}: ProductSelectionSectionProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
            <div className="w-full xl:w-1/2">
                <SimpleDropdown
                    label="Einlagentyp"
                    value={einlagentyp || (selectedEinlage as string)}
                    placeholder="Einlage auswählen"
                    options={einlageOptions}
                    isOpen={showEinlageDropdown}
                    onToggle={onEinlageToggle}
                    onSelect={(value) => onEinlageSelect(value as EinlageType)}
                    error={einlagentypError}
                />
            </div>

            <div className="w-full xl:w-1/2">
                <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center w-full">
                    <div className="w-full xl:w-8/12">
                        <SimpleDropdown
                            label="Überzug"
                            value={überzug}
                            placeholder="Überzug auswählen"
                            options={uberzugOptions}
                            isOpen={showUberzugDropdown}
                            onToggle={onUberzugToggle}
                            onSelect={onUberzugSelect}
                            error={überzugError}
                        />
                    </div>

                    <div className="w-full xl:w-4/12">
                        <SimpleDropdown
                            label="Menge"
                            value={menge}
                            placeholder="Menge auswählen"
                            options={mengeOptions}
                            isOpen={showMengeDropdown}
                            onToggle={onMengeToggle}
                            onSelect={onMengeSelect}
                            error={mengeError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


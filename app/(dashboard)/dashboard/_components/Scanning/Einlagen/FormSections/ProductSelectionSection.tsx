import React from 'react';
import SimpleDropdown from '../Dropdowns/SimpleDropdown';
import type { EinlageType } from '@/hooks/customer/useScanningFormData';

interface ProductSelectionSectionProps {
    // Einlage
    einlagentyp: string;
    selectedEinlage: EinlageType | string;
    einlageOptions: EinlageType[];
    showEinlageDropdown: boolean;
    onEinlageToggle: () => void;
    onEinlageSelect: (value: EinlageType) => void;
    // Überzug
    überzug: string;
    uberzugOptions: string[];
    showUberzugDropdown: boolean;
    onUberzugToggle: () => void;
    onUberzugSelect: (value: string) => void;
    // Menge
    menge: string;
    mengeOptions: string[];
    showMengeDropdown: boolean;
    onMengeToggle: () => void;
    onMengeSelect: (value: string) => void;
}

export default function ProductSelectionSection({
    einlagentyp,
    selectedEinlage,
    einlageOptions,
    showEinlageDropdown,
    onEinlageToggle,
    onEinlageSelect,
    überzug,
    uberzugOptions,
    showUberzugDropdown,
    onUberzugToggle,
    onUberzugSelect,
    menge,
    mengeOptions,
    showMengeDropdown,
    onMengeToggle,
    onMengeSelect,
}: ProductSelectionSectionProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
            <div className="w-full xl:w-1/2">
                <SimpleDropdown
                    label="Einlagentyp"
                    value={einlagentyp || (selectedEinlage as string)}
                    placeholder="Einlage auswählen"
                    options={einlageOptions as string[]}
                    isOpen={showEinlageDropdown}
                    onToggle={onEinlageToggle}
                    onSelect={(value) => onEinlageSelect(value as EinlageType)}
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
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


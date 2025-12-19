import React from 'react';
import { Input } from '@/components/ui/input';

interface AdditionalFieldsSectionProps {
    schuhmodell_wählen: string;
    onSchuhmodellChange: (value: string) => void;
    kostenvoranschlag: boolean | null;
    onKostenvoranschlagChange: (value: boolean) => void;
}

export default function AdditionalFieldsSection({
    schuhmodell_wählen,
    onSchuhmodellChange,
    kostenvoranschlag,
    onKostenvoranschlagChange,
}: AdditionalFieldsSectionProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center w-full">
            <div className="w-full xl:w-1/2">
                <div className="mb-2">
                    <h3 className="text-lg font-semibold">Schuhmodell</h3>
                </div>
                <Input
                    type="text"
                    placeholder="Schuhmodell bessa mit bilder fa modellarten usw einfacher"
                    value={schuhmodell_wählen}
                    onChange={(e) => onSchuhmodellChange(e.target.value)}
                />
            </div>

            <div className="w-full xl:w-1/2 mt-5">
                <div className="flex items-center gap-10 pb-2 border-b border-gray-300">
                    <h3 className="text-lg font-semibold">Kostenvoranschlag</h3>
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="kostenvoranschlag"
                                className="w-5 h-5 cursor-pointer"
                                checked={kostenvoranschlag === true}
                                onChange={() => onKostenvoranschlagChange(true)}
                            />
                            <span className="text-sm">Ja</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="kostenvoranschlag"
                                className="w-5 h-5 cursor-pointer"
                                checked={kostenvoranschlag === false}
                                onChange={() => onKostenvoranschlagChange(false)}
                            />
                            <span className="text-sm">Nein</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}


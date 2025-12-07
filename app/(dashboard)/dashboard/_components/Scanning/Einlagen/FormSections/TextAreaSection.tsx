import React from 'react';

interface TextAreaSectionProps {
    leftLabel: string;
    leftValue: string;
    leftPlaceholder: string;
    leftOnChange: (value: string) => void;
    rightLabel: string;
    rightValue: string;
    rightPlaceholder: string;
    rightOnChange: (value: string) => void;
    leftError?: string;
    rightError?: string;
}

export default function TextAreaSection({
    leftLabel,
    leftValue,
    leftPlaceholder,
    leftOnChange,
    rightLabel,
    rightValue,
    rightPlaceholder,
    rightOnChange,
    leftError,
    rightError,
}: TextAreaSectionProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
            <div className="w-full xl:w-1/2">
                <div className="mb-2">
                    <h3 className="text-sm font-semibold">{leftLabel}</h3>
                </div>
                <div className="relative">
                    <textarea
                        value={leftValue}
                        onChange={(e) => leftOnChange(e.target.value)}
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                            leftError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        rows={4}
                        placeholder={leftPlaceholder}
                    />
                    {leftError && (
                        <p className="text-red-500 text-sm mt-1">{leftError}</p>
                    )}
                </div>
            </div>

            <div className="w-full xl:w-1/2">
                <div className="mb-2">
                    <h3 className="text-sm font-semibold">{rightLabel}</h3>
                </div>
                <div className="relative">
                    <textarea
                        value={rightValue}
                        onChange={(e) => rightOnChange(e.target.value)}
                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${
                            rightError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        rows={4}
                        placeholder={rightPlaceholder}
                    />
                    {rightError && (
                        <p className="text-red-500 text-sm mt-1">{rightError}</p>
                    )}
                </div>
            </div>
        </div>
    );
}


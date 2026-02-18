'use client';
import React, { useState } from 'react';
import MasschuProgressTable, { SHOE_STEPS } from './MasschuProgressTable';

export default function ProgressTab() {
    const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

    const handleStepClick = (stepIndex: number) => {
        if (selectedStepIndex === stepIndex) {
            setSelectedStepIndex(null);
        } else {
            setSelectedStepIndex(stepIndex);
        }
    };

    const handleRowClick = (stepIndex: number) => {
        setSelectedStepIndex(stepIndex);
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Fortschritt</h2>

            {/* Horizontal Progress Stepper */}
            <div className="">
                <div className="w-full overflow-x-auto">
                    <div
                        className="flex items-center relative"
                        style={{ minWidth: `${SHOE_STEPS.length * 140}px` }}
                    >
                        {SHOE_STEPS.map((step, index) => {
                            const isLast = index === SHOE_STEPS.length - 1;

                            // Only green when explicitly selected
                            const isCompleted =
                                selectedStepIndex !== null
                                    ? index < selectedStepIndex
                                    : false;
                            const isSelected = selectedStepIndex === index;

                            return (
                                <React.Fragment key={index}>
                                    {/* Step node */}
                                    <div
                                        className="flex flex-col items-center cursor-pointer flex-shrink-0"
                                        // style={{ width: '80px' }}
                                        onClick={() => handleStepClick(index)}
                                    >
                                        {/* Circle */}
                                        <div
                                            className={`
                                                w-3.5 h-3.5 rounded-full transition-all duration-200
                                                ${isCompleted || isSelected
                                                    ? 'bg-emerald-500'
                                                    : 'bg-gray-300'
                                                }
                                                ${isSelected ? ' ring-emerald-400 ring-offset-1' : ''}
                                            `}
                                        />
                                        {/* Label */}
                                        <div
                                            className="mt-2 text-xs text-gray-500 text-center leading-tight"
                                            style={{
                                                width: '90px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                            title={step}
                                        >
                                            {step}
                                        </div>
                                    </div>

                                    {/* Connecting line — fixed short width, centered */}
                                    {!isLast && (
                                        <div className="flex-1 flex justify-center">
                                            <div
                                                className={`
                                                    h-0.5 transition-colors duration-200
                                                    ${isCompleted ? 'bg-emerald-500' : 'bg-gray-300'}
                                                `}
                                                style={{ width: '36px' }}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Table */}
            <MasschuProgressTable
                selectedStepIndex={selectedStepIndex}
                onRowClick={handleRowClick}
            />
        </div>
    );
}
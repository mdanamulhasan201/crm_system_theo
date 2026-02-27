'use client';
import React, { useState } from 'react';
import MasschuProgressTable, { SHOE_STEPS } from './MasschuProgressTable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import SchnellAuftragModal from './SchnellAuftragModal';

export default function ProgressTab() {
    const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(0);
    const [schnellModalOpen, setSchnellModalOpen] = useState(false);

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
            <div className='flex flex-col sm:flex-row items-center justify-between mb-6'>
                <h2 className="text-xl font-semibold text-gray-900 ">Fortschritt</h2>
                <Button
                    variant="outline"
                    size="default"
                    className='cursor-pointer bg-[#61A175] hover:bg-[#61A175]/80 text-white font-semibold rounded-lg px-6 py-2.5 flex items-center gap-2'
                    onClick={() => setSchnellModalOpen(true)}
                >
                    <PlusIcon className='w-4 h-4' />
                    Schnell Auftrag
                </Button>
            </div>

            {/* Horizontal Progress Stepper */}
            <TooltipProvider delayDuration={300}>
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
                                            {/* Label - tooltip shows full name on hover */}
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className="mt-2 text-xs text-gray-500 text-center leading-tight"
                                                        style={{
                                                            width: '90px',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {step}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" className="max-w-[240px]">
                                                    {step}
                                                </TooltipContent>
                                            </Tooltip>
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
            </TooltipProvider>

            {/* Table */}
            <MasschuProgressTable
                selectedStepIndex={selectedStepIndex}
                onRowClick={handleRowClick}
            />

            <SchnellAuftragModal
                isOpen={schnellModalOpen}
                onClose={() => setSchnellModalOpen(false)}
            />
        </div>
    );
}
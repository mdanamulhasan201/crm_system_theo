import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getStatusOptions } from "@/lib/orderStatusMappings";

interface StatusFilterBarProps {
    selectedDays: number;
    selectedStatus: string | null;
    selectedType: string | null;
    activeStep: number;
    onDaysChange: (days: number) => void;
    onStatusFilter: (status: string) => void;
    onClearFilter: () => void;
}

export default function StatusFilterBar({
    selectedDays,
    selectedStatus,
    selectedType,
    activeStep,
    onDaysChange,
    onStatusFilter,
    onClearFilter,
}: StatusFilterBarProps) {
    const statusOptions = getStatusOptions(selectedType);
    const selectedIndex = statusOptions.findIndex(option => option.value === selectedStatus);
    
    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-3 sm:mb-4 gap-3 border-b border-gray-200 pb-3">
            {/* Status Bar */}
            <div className="flex items-center w-full overflow-x-auto">
                {statusOptions.map((status, idx) => {
                    const isActive = selectedStatus === status.value;
                    const isCompleted = selectedIndex !== -1 && idx < selectedIndex;
                    const isUpcoming = !isActive && !isCompleted;

                    const dotColor = isActive || isCompleted ? 'bg-emerald-600' : 'bg-gray-200';
                    const textColor = isActive
                        ? 'text-emerald-700 font-semibold'
                        : isCompleted
                            ? 'text-gray-700'
                            : 'text-gray-400';
                    const lineColor = isCompleted
                        ? 'bg-emerald-500'
                        : selectedIndex !== -1 && idx <= selectedIndex
                            ? 'bg-emerald-200'
                            : 'bg-gray-200';

                    return (
                        <React.Fragment key={status.value}>
                            <div
                                className={`flex flex-col items-center flex-shrink-0 cursor-pointer px-1 sm:px-2`}
                                onClick={() => onStatusFilter(status.value)}
                                title={`Click to filter by ${status.label}${isActive ? ' (click again to clear)' : ''}`}
                            >
                                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mb-1 ${dotColor}`} />
                                <span className={`text-xs sm:text-sm text-center px-0.5 leading-snug ${textColor}`}>
                                    {status.label}
                                </span>
                            </div>
                            {idx < statusOptions.length - 1 && (
                                <div className={`h-0.5 w-6 sm:w-10 mx-1 sm:mx-2 rounded-full ${isUpcoming ? 'bg-gray-200' : lineColor}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Days Selector */}
            <div className="flex-shrink-0">
                <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide">
                        Zeitraum
                    </span>
                    <div className="flex items-center gap-2">
                        <Select value={selectedDays.toString()} onValueChange={(value) => onDaysChange(parseInt(value))}>
                            <SelectTrigger className="h-8 w-28 sm:w-32 rounded-full border-gray-300 bg-gray-50 text-[11px] sm:text-xs font-medium px-3 py-0 cursor-pointer focus:ring-0 focus:outline-none">
                                <SelectValue placeholder="Tage wählen" />
                            </SelectTrigger>
                            <SelectContent className="text-[11px] sm:text-xs">
                                <SelectItem value="7" className="text-[11px] sm:text-xs cursor-pointer">
                                    7 Tage
                                </SelectItem>
                                <SelectItem value="30" className="text-[11px] sm:text-xs cursor-pointer">
                                    30 Tage
                                </SelectItem>
                                <SelectItem value="40" className="text-[11px] sm:text-xs cursor-pointer">
                                    40 Tage
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {selectedStatus && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilter}
                                className="h-8 px-2 text-[11px] sm:text-xs text-gray-600 border-gray-300 hover:bg-gray-100 cursor-pointer"
                            >
                                Filter löschen
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


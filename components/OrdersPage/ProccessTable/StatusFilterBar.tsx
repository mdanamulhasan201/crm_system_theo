import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STATUS_OPTIONS } from "@/lib/orderStatusMappings";

interface StatusFilterBarProps {
    selectedDays: number;
    selectedStatus: string | null;
    activeStep: number;
    onDaysChange: (days: number) => void;
    onStatusFilter: (status: string) => void;
    onClearFilter: () => void;
}

export default function StatusFilterBar({
    selectedDays,
    selectedStatus,
    activeStep,
    onDaysChange,
    onStatusFilter,
    onClearFilter,
}: StatusFilterBarProps) {
    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4 border-b-2 border-gray-400 pb-4">
            {/* Status Bar */}
            <div className="flex items-center w-full overflow-x-auto">
                {STATUS_OPTIONS.map((status, idx) => {
                    const isFilterActive = selectedStatus === status.value;

                    return (
                        <React.Fragment key={status.value}>
                            <div
                                className={`flex flex-col items-center min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[140px] xl:min-w-[160px] flex-shrink-0 cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors ${isFilterActive ? 'bg-blue-100 border-2 border-blue-500' : ''
                                    }`}
                                onClick={() => onStatusFilter(status.value)}
                                title={`Click to filter by ${status.label}${isFilterActive ? ' (click again to clear)' : ''}`}
                            >
                                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mb-1 sm:mb-2 ${isFilterActive ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}></div>
                                <span className={`text-xs sm:text-sm text-center px-1 leading-tight ${isFilterActive ? 'text-blue-700 font-semibold' : 'text-gray-600'
                                    }`}>
                                    {status.label}
                                </span>
                            </div>
                            {idx < STATUS_OPTIONS.length - 1 && (
                                <div className={`flex-1 h-px mx-1 sm:mx-2 ${isFilterActive ? 'bg-blue-300' : 'bg-gray-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Days Selector */}
            <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Zeitraum:</span>
                    <Select value={selectedDays.toString()} onValueChange={(value) => onDaysChange(parseInt(value))}>
                        <SelectTrigger className="w-32 text-xs sm:text-sm cursor-pointer">
                            <SelectValue placeholder="Tage wählen" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 Tage</SelectItem>
                            <SelectItem value="30">30 Tage</SelectItem>
                            <SelectItem value="40">40 Tage</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedStatus && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilter}
                            className="text-xs h-8 px-2 cursor-pointer"
                        >
                            Filter löschen
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}


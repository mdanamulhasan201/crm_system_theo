import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, X } from 'lucide-react';

interface Employee {
    id: string;
    employeeName: string;
    email?: string;
}

interface EmployeeDropdownProps {
    selectedEmployee: string;
    employeeSearchText: string;
    /** Ignored when layout is "inline". */
    isEmployeeDropdownOpen: boolean;
    employeeSuggestions: Employee[];
    employeeLoading: boolean;
    onEmployeeSearchChange: (value: string) => void;
    /** Ignored when layout is "inline". */
    onEmployeeDropdownChange: (open: boolean) => void;
    onEmployeeSelect: (employee: { employeeName: string; id: string }) => void;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
    error?: string;
    /**
     * `inline`: search + list inside parent (e.g. Dialog) — avoids Popover scroll/focus issues.
     * `popover`: combobox + floating panel (default).
     */
    layout?: 'popover' | 'inline';
}

export default function EmployeeDropdown({
    selectedEmployee,
    employeeSearchText,
    isEmployeeDropdownOpen,
    employeeSuggestions,
    employeeLoading,
    onEmployeeSearchChange,
    onEmployeeDropdownChange,
    onEmployeeSelect,
    onClear,
    placeholder = "Mitarbeiter...",
    className = "w-full",
    error,
    layout = 'popover',
}: EmployeeDropdownProps) {
    const listBody = (
        <>
            {employeeLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                    Lade Mitarbeiter...
                </div>
            ) : employeeSuggestions.length > 0 ? (
                <div className="py-1">
                    {employeeSuggestions.map((employee) => (
                        <div
                            key={employee.id}
                            className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors duration-150 ${
                                selectedEmployee === employee.employeeName
                                    ? 'bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-500'
                                    : 'hover:bg-gray-100'
                            }`}
                            onClick={() => onEmployeeSelect({ employeeName: employee.employeeName, id: employee.id })}
                        >
                            <div className="flex flex-col min-w-0 flex-1">
                                <span
                                    className={`text-sm font-medium truncate ${
                                        selectedEmployee === employee.employeeName
                                            ? 'text-blue-900'
                                            : 'text-gray-900'
                                    }`}
                                >
                                    {employee.employeeName}
                                </span>
                                {employee.email && (
                                    <span
                                        className={`text-xs truncate ${
                                            selectedEmployee === employee.employeeName
                                                ? 'text-blue-600'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {employee.email}
                                    </span>
                                )}
                            </div>
                            {selectedEmployee === employee.employeeName && (
                                <Check className="h-4 w-4 text-blue-600 ml-2 shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                    Keine Mitarbeiter gefunden
                </div>
            )}
        </>
    );

    if (layout === 'inline') {
        return (
            <div className={cn('flex flex-col gap-2 w-full', className)}>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Mitarbeiter suchen..."
                        value={employeeSearchText}
                        onChange={(e) => onEmployeeSearchChange(e.target.value)}
                        className={cn('w-full flex-1', error && 'border-red-500')}
                    />
                    {selectedEmployee && onClear ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 h-10 px-2"
                            onClick={onClear}
                        >
                            <X className="h-4 w-4" aria-hidden />
                            <span className="sr-only">Auswahl löschen</span>
                        </Button>
                    ) : null}
                </div>
                <div
                    className={cn(
                        'rounded-md border border-gray-200 bg-white shadow-sm',
                        'min-h-0 max-h-[min(45vh,280px)] overflow-y-auto overscroll-y-contain',
                        '[scrollbar-gutter:stable]'
                    )}
                >
                    {listBody}
                </div>
            </div>
        );
    }

    return (
        <Popover modal={false} open={isEmployeeDropdownOpen} onOpenChange={onEmployeeDropdownChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isEmployeeDropdownOpen}
                    className={`${className} cursor-pointer justify-between font-normal h-10 bg-white ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                >
                    <span className={`truncate flex-1 text-left ${selectedEmployee ? 'text-gray-900' : 'text-gray-400'}`}>
                        {selectedEmployee || placeholder}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        {selectedEmployee && onClear ? (
                            <span
                                role="button"
                                tabIndex={-1}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onClear();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onClear();
                                    }
                                }}
                                className="rounded p-0.5 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-200"
                                aria-label="Auswahl löschen"
                            >
                                <X className="h-4 w-4" />
                            </span>
                        ) : (
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        )}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="z-[200] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0 flex flex-col overflow-hidden"
                align="start"
            >
                <div className="p-2 shrink-0 border-b border-gray-100">
                    <Input
                        placeholder="Mitarbeiter suchen..."
                        value={employeeSearchText}
                        onChange={(e) => onEmployeeSearchChange(e.target.value)}
                        className="w-full"
                        autoFocus
                    />
                </div>
                <div
                    className="min-h-0 max-h-[min(50vh,280px)] overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]"
                >
                    {listBody}
                </div>
            </PopoverContent>
        </Popover>
    );
}


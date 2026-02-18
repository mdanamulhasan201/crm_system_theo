import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Check } from 'lucide-react';

interface Employee {
    id: string;
    employeeName: string;
    email?: string;
}

interface EmployeeDropdownProps {
    selectedEmployee: string;
    employeeSearchText: string;
    isEmployeeDropdownOpen: boolean;
    employeeSuggestions: Employee[];
    employeeLoading: boolean;
    onEmployeeSearchChange: (value: string) => void;
    onEmployeeDropdownChange: (open: boolean) => void;
    onEmployeeSelect: (employee: { employeeName: string; id: string }) => void;
    placeholder?: string;
    className?: string;
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
    placeholder = "Mitarbeiter...",
    className = "w-full",
}: EmployeeDropdownProps) {
    return (
        <Popover open={isEmployeeDropdownOpen} onOpenChange={onEmployeeDropdownChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isEmployeeDropdownOpen}
                    className={`${className} cursor-pointer justify-between font-normal h-10 bg-white border-gray-300`}
                >
                    <span className={`truncate ${selectedEmployee ? 'text-gray-900' : 'text-gray-400'}`}>
                        {selectedEmployee || placeholder}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="p-2">
                    <Input
                        placeholder="Mitarbeiter suchen..."
                        value={employeeSearchText}
                        onChange={(e) => onEmployeeSearchChange(e.target.value)}
                        className="w-full"
                        autoFocus
                    />
                </div>
                <div className="max-h-60 overflow-y-auto">
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
                </div>
            </PopoverContent>
        </Popover>
    );
}


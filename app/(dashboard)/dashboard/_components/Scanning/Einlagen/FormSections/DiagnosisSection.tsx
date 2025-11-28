import React from 'react';
import DiagnosisDropdown from '../Dropdowns/DiagnosisDropdown';
import EmployeeDropdown from '../Dropdowns/EmployeeDropdown';

interface DiagnosisSectionProps {
    // Diagnosis dropdown
    diagnosisOptions: readonly string[];
    showDiagnosisDropdown: boolean;
    setShowDiagnosisDropdown: (show: boolean) => void;
    selectedDiagnosis: string;
    onDiagnosisSelect: (value: string) => void;
    onDiagnosisClear: () => void;
    // Employee dropdown
    selectedEmployee: string;
    isEmployeeDropdownOpen: boolean;
    employeeSearchText: string;
    employeeSuggestions: Array<{ id: string; employeeName: string; email?: string }>;
    employeeLoading: boolean;
    onEmployeeDropdownChange: (open: boolean) => void;
    onEmployeeSearchChange: (value: string) => void;
    onEmployeeSelect: (employee: { employeeName: string; id: string }) => void;
}

export default function DiagnosisSection({
    diagnosisOptions,
    showDiagnosisDropdown,
    setShowDiagnosisDropdown,
    selectedDiagnosis,
    onDiagnosisSelect,
    onDiagnosisClear,
    selectedEmployee,
    isEmployeeDropdownOpen,
    employeeSearchText,
    employeeSuggestions,
    employeeLoading,
    onEmployeeDropdownChange,
    onEmployeeSearchChange,
    onEmployeeSelect,
}: DiagnosisSectionProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-6 lg:justify-between lg:items-center mb-10 w-full">
            <div className="w-full xl:w-1/2">
                <DiagnosisDropdown
                    label="Diagnose"
                    selectedValue={selectedDiagnosis}
                    placeholder="Diagnose auswählen"
                    options={diagnosisOptions}
                    isOpen={showDiagnosisDropdown}
                    onToggle={() => setShowDiagnosisDropdown(!showDiagnosisDropdown)}
                    onSelect={onDiagnosisSelect}
                    onClear={onDiagnosisClear}
                />
            </div>

            <div className="w-full xl:w-1/2">
                <EmployeeDropdown
                    label="Durchgeführt von:"
                    selectedEmployee={selectedEmployee}
                    placeholder="Mitarbeiter auswählen..."
                    isOpen={isEmployeeDropdownOpen}
                    searchText={employeeSearchText}
                    suggestions={employeeSuggestions}
                    loading={employeeLoading}
                    onOpenChange={onEmployeeDropdownChange}
                    onSearchChange={onEmployeeSearchChange}
                    onSelect={onEmployeeSelect}
                />
            </div>
        </div>
    );
}


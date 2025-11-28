import { useState, useEffect } from 'react';
import { useSearchEmployee } from '@/hooks/employee/useSearchEmployee';
import type { EinlageType } from '@/hooks/customer/useScanningFormData';

export interface EinlagenFormData {
    versorgung_note: string;
    versorgung_laut_arzt: string;
    ausführliche_diagnose: string;
    einlagentyp: string;
    überzug: string;
    menge: string;
    schuhmodell_wählen: string;
    kostenvoranschlag: boolean | null;
    selectedEmployee: string;
    selectedEmployeeId: string;
}

export interface UseEinlagenFormProps {
    selectedEinlage?: EinlageType | string;
}

export function useEinlagenForm({ selectedEinlage }: UseEinlagenFormProps = {}) {
    // Form fields state
    const [versorgung_note, setVersorgung_note] = useState<string>('');
    const [versorgung_laut_arzt, setVersorgung_laut_arzt] = useState<string>('');
    const [ausführliche_diagnose, setAusführliche_diagnose] = useState<string>('');
    const [einlagentyp, setEinlagentyp] = useState<string>('');
    const [überzug, setÜberzug] = useState<string>('');
    const [menge, setMenge] = useState<string>('1 paar');
    const [schuhmodell_wählen, setSchuhmodell_wählen] = useState<string>('');
    const [kostenvoranschlag, setKostenvoranschlag] = useState<boolean | null>(null);

    // Dropdown states
    const [showEinlageDropdown, setShowEinlageDropdown] = useState(false);
    const [showUberzugDropdown, setShowUberzugDropdown] = useState(false);
    const [showMengeDropdown, setShowMengeDropdown] = useState(false);

    // Employee search functionality
    const {
        searchText,
        suggestions: employeeSuggestions,
        loading: employeeLoading,
        setShowSuggestions,
        handleChange: handleEmployeeSearchChange,
    } = useSearchEmployee();

    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    // Sync einlagentyp when selectedEinlage changes
    useEffect(() => {
        if (selectedEinlage && !einlagentyp) {
            setEinlagentyp(selectedEinlage as string);
        }
    }, [selectedEinlage, einlagentyp]);

    // Handle employee selection
    const handleEmployeeSelect = (employee: { employeeName: string; id: string }) => {
        setSelectedEmployee(employee.employeeName);
        setSelectedEmployeeId(employee.id);
        setIsEmployeeDropdownOpen(false);
    };

    const handleEmployeeDropdownChange = (open: boolean) => {
        setIsEmployeeDropdownOpen(open);
        setShowSuggestions(open);
    };

    // Get all form data
    const getFormData = (): EinlagenFormData => ({
        versorgung_note,
        versorgung_laut_arzt,
        ausführliche_diagnose,
        einlagentyp,
        überzug,
        menge,
        schuhmodell_wählen,
        kostenvoranschlag,
        selectedEmployee,
        selectedEmployeeId,
    });

    // Reset form
    const resetForm = () => {
        setVersorgung_note('');
        setVersorgung_laut_arzt('');
        setAusführliche_diagnose('');
        setEinlagentyp('');
        setÜberzug('');
        setMenge('1 paar');
        setSchuhmodell_wählen('');
        setKostenvoranschlag(null);
        setSelectedEmployee('');
        setSelectedEmployeeId('');
    };

    return {
        // Form fields
        versorgung_note,
        setVersorgung_note,
        versorgung_laut_arzt,
        setVersorgung_laut_arzt,
        ausführliche_diagnose,
        setAusführliche_diagnose,
        einlagentyp,
        setEinlagentyp,
        überzug,
        setÜberzug,
        menge,
        setMenge,
        schuhmodell_wählen,
        setSchuhmodell_wählen,
        kostenvoranschlag,
        setKostenvoranschlag,
        // Dropdown states
        showEinlageDropdown,
        setShowEinlageDropdown,
        showUberzugDropdown,
        setShowUberzugDropdown,
        showMengeDropdown,
        setShowMengeDropdown,
        // Employee
        employeeSearchText: searchText,
        employeeSuggestions,
        employeeLoading,
        isEmployeeDropdownOpen,
        selectedEmployee,
        selectedEmployeeId,
        handleEmployeeSearchChange,
        handleEmployeeSelect,
        handleEmployeeDropdownChange,
        // Utilities
        getFormData,
        resetForm,
    };
}


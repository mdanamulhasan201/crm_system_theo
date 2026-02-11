export interface StatusOption {
    label: string;
    value: string;
}

// Status options for Rady Insole (5 statuses)
export const RADY_INSOLE_STATUS_OPTIONS: StatusOption[] = [
    { label: "Warten auf Versorgungsstart", value: "Warten_auf_Versorgungsstart" },
    { label: "In Fertigung", value: "In_Fertigung" },
    { label: "Verpacken/Qualitätssicherung", value: "Verpacken_Qualitätssicherung" },
    { label: "Abholbereit/Versandt", value: "Abholbereit_Versandt" },
    { label: "Ausgeführt", value: "Ausgeführt" },
];

// Status options for Milling Block (8 statuses)
export const MILLING_BLOCK_STATUS_OPTIONS: StatusOption[] = [
    { label: "Warten auf Versorgungsstart", value: "Warten_auf_Versorgungsstart" },
    { label: "In Modellierung", value: "In_Modellierung" },
    { label: "Warten auf Fräsvorgang", value: "Warten_auf_Fraesvorgang" },
    { label: "Fräsvorgang", value: "Fraesvorgang" },
    { label: "Feinschliff", value: "Feinschliff" },
    { label: "Verpacken/Qualitätssicherung", value: "Verpacken_Qualitätssicherung" },
    { label: "Abholbereit/Versandt", value: "Abholbereit_Versandt" },
    { label: "Ausgeführt", value: "Ausgeführt" },
];

// Legacy export for backward compatibility (defaults to rady_insole)
export const STATUS_OPTIONS: StatusOption[] = RADY_INSOLE_STATUS_OPTIONS;

/**
 * Get status options based on order type
 * @param type - 'rady_insole' | 'milling_block' | null | undefined
 * @returns Array of status options
 */
export const getStatusOptions = (type: string | null | undefined): StatusOption[] => {
    if (type === 'milling_block') {
        return MILLING_BLOCK_STATUS_OPTIONS;
    }
    // Default to rady_insole (including null/undefined)
    return RADY_INSOLE_STATUS_OPTIONS;
};

export const getApiStatusFromLabel = (label: string, type?: string | null): string => {
    const options = getStatusOptions(type);
    return options.find(option => option.label === label)?.value || label;
};

export const getLabelFromApiStatus = (apiStatus: string, type?: string | null): string => {
    const options = getStatusOptions(type);
    return options.find(option => option.value === apiStatus)?.label || apiStatus;
};

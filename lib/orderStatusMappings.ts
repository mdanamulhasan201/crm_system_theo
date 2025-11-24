export interface StatusOption {
    label: string;
    value: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
    { label: "Warten auf Versorgungsstart", value: "Warten_auf_Versorgungsstart" },
    { label: "In Fertigung", value: "In_Fertigung" },
    { label: "Verpacken/Qualitätssicherung", value: "Verpacken_Qualitätssicherung" },
    { label: "Abholbereit/Versandt", value: "Abholbereit_Versandt" },
    { label: "Ausgeführt", value: "Ausgeführt" },
];

export const getApiStatusFromLabel = (label: string): string => {
    return STATUS_OPTIONS.find(option => option.label === label)?.value || label;
};

export const getLabelFromApiStatus = (apiStatus: string): string => {
    return STATUS_OPTIONS.find(option => option.value === apiStatus)?.label || apiStatus;
};

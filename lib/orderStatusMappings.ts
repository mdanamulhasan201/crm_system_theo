// Order status mapping utilities

export const STEP_TO_API_STATUS: Record<string, string> = {
    "Einlage vorbereiten": "Einlage_vorbereiten",
    "Einlage in Fertigung": "Einlage_in_Fertigung",
    "Einlage verpacken": "Einlage_verpacken",
    "Einlage Abholbereit": "Einlage_Abholbereit",
    "Einlage versandt": "Einlage_versandt",
    "Ausgeführte Einlagen": "Ausgeführte_Einlagen"
};

export const API_STATUS_TO_GERMAN: Record<string, string> = {
    "Einlage_vorbereiten": "Einlage vorbereiten",
    "Einlage_in_Fertigung": "Einlage in Fertigung",
    "Einlage_verpacken": "Einlage verpacken",
    "Einlage_Abholbereit": "Einlage Abholbereit",
    "Einlage_versandt": "Einlage versandt",
    "Ausgeführte_Einlagen": "Ausgeführte Einlagen"
};

export const getApiStatusFromStep = (step: string): string => {
    return STEP_TO_API_STATUS[step] || step;
};

export const getGermanStatusFromApi = (apiStatus: string): string => {
    return API_STATUS_TO_GERMAN[apiStatus] || apiStatus;
};

export const getStepColor = (stepIndex: number, isActive: boolean): string => {
    const colors = [
        'bg-[#FF0000]',
        'bg-[#FFA617]',
        'bg-[#96F30080]',
        'bg-[#4CAF50]',
        'bg-[#2196F3]',
        'bg-[#9C27B0]',
    ];

    if (isActive) {
        return `font-bold ${colors[stepIndex] || 'text-black'}`;
    }
    return 'text-gray-400 font-normal';
};


// Shared color configuration for appointments based on customer
export const EVENT_COLORS = [
    { bg: 'bg-green-50', border: '#4CAF50' },
    { bg: 'bg-orange-50', border: '#FF9800' },
    { bg: 'bg-purple-50', border: '#9C27B0' },
    { bg: 'bg-pink-50', border: '#E91E63' },
    { bg: 'bg-blue-50', border: '#2196F3' },
    { bg: 'bg-yellow-50', border: '#FFC107' },
    { bg: 'bg-red-50', border: '#F44336' },
    { bg: 'bg-teal-50', border: '#009688' },
    { bg: 'bg-indigo-50', border: '#3F51B5' },
    { bg: 'bg-rose-50', border: '#E91E63' },
    { bg: 'bg-cyan-50', border: '#00BCD4' },
    { bg: 'bg-amber-50', border: '#FFC107' },
    { bg: 'bg-lime-50', border: '#CDDC39' },
    { bg: 'bg-emerald-50', border: '#4CAF50' },
    { bg: 'bg-violet-50', border: '#9C27B0' }
];

// Hash function for consistent color assignment
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

// Get color for a customer based on customerId or customer_name
// This ensures the same customer always gets the same color across all pages
export const getCustomerColor = (
    customerId: string | null | undefined,
    customer_name: string | undefined,
    fallbackIndex: number = 0
) => {
    // Priority: customerId > customer_name > fallback
    let identifier = '';
    
    if (customerId && customerId.trim().length > 0) {
        identifier = customerId.trim();
    } else if (customer_name && customer_name.trim().length > 0) {
        identifier = customer_name.trim().toLowerCase();
    } else {
        // No customer identifier - use fallback color
        return EVENT_COLORS[fallbackIndex % EVENT_COLORS.length];
    }
    
    // Use hash to consistently map identifier to color
    const idx = hashString(identifier) % EVENT_COLORS.length;
    return EVENT_COLORS[idx];
};

// Get color for assignedTo (employee) - deterministic color per assignedTo
// This is the old color system used in calendar page
export const getAssignedToColor = (
    assignedTo: string | undefined,
    fallbackIndex: number = 0
) => {
    if (assignedTo && assignedTo.trim().length > 0) {
        const idx = hashString(assignedTo.trim()) % EVENT_COLORS.length;
        return EVENT_COLORS[idx];
    }
    return EVENT_COLORS[fallbackIndex % EVENT_COLORS.length];
};


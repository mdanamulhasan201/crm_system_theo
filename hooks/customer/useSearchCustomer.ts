'use client'

import { useState, useEffect, useRef } from 'react'
import { searchCustomers, getSingleCustomer } from '@/apis/customerApis'
import useDebounce from '@/hooks/useDebounce'

interface CustomerData {
    nameKunde: string;
    Telefon: string;
    Geburtsdatum: string;
    Geschäftstandort: string;
    createdAt: string;
    id: string;
    email: string;
}

interface SuggestionItem {
    id: string;
    name: string;
    phone: string;
    email: string;
    location: string;
}

export const useSearchCustomer = () => {
    // Search input states
    const [searchName, setSearchName] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchLocation, setSearchLocation] = useState('');

    // Search result states
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    // Auto-suggestion states
    const [nameSuggestions, setNameSuggestions] = useState<SuggestionItem[]>([]);
    const [phoneSuggestions, setPhoneSuggestions] = useState<SuggestionItem[]>([]);
    const [emailSuggestions, setEmailSuggestions] = useState<SuggestionItem[]>([]);
    const [locationSuggestions, setLocationSuggestions] = useState<SuggestionItem[]>([]);
    const [showNameSuggestions, setShowNameSuggestions] = useState(false);
    const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);
    const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null);

    // Debounced search values
    const debouncedName = useDebounce(searchName, 300);
    const debouncedPhone = useDebounce(searchPhone, 300);
    const debouncedEmail = useDebounce(searchEmail, 300);
    const debouncedLocation = useDebounce(searchLocation, 300);

    // Refs for dropdown positioning
    const nameInputRef = useRef<HTMLInputElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);

    // Fetch suggestions for name field
    useEffect(() => {
        if (debouncedName && debouncedName.length > 1) {
            fetchSuggestions(debouncedName, 'name');
        } else {
            setNameSuggestions([]);
            setShowNameSuggestions(false);
        }
    }, [debouncedName]);

    // Fetch suggestions for phone field
    useEffect(() => {
        if (debouncedPhone && debouncedPhone.length > 2 && !selectedSuggestion) {
            fetchSuggestions(debouncedPhone, 'phone');
        } else {
            setPhoneSuggestions([]);
            setShowPhoneSuggestions(false);
        }
    }, [debouncedPhone, selectedSuggestion]);

    // Fetch suggestions for email field
    useEffect(() => {
        if (debouncedEmail && debouncedEmail.length > 2 && !selectedSuggestion) {
            fetchSuggestions(debouncedEmail, 'email');
        } else {
            setEmailSuggestions([]);
            setShowEmailSuggestions(false);
        }
    }, [debouncedEmail, selectedSuggestion]);

    // Fetch suggestions for location field
    useEffect(() => {
        if (debouncedLocation && debouncedLocation.length > 1 && !selectedSuggestion) {
            fetchSuggestions(debouncedLocation, 'location');
        } else {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
        }
    }, [debouncedLocation, selectedSuggestion]);

    // Function to fetch suggestions from API
    const fetchSuggestions = async (searchTerm: string, type: 'name' | 'phone' | 'email' | 'location') => {
        try {
            setSuggestionLoading(true);
            const nameParam = type === 'name' ? searchTerm : '';
            const phoneParam = type === 'phone' ? searchTerm : '';
            const emailParam = type === 'email' ? searchTerm : '';
            const locationParam = type === 'location' ? searchTerm : '';

            const response = await searchCustomers(searchTerm, 1, 10, nameParam, emailParam, phoneParam, '', '');

            if (response && response.data && response.data.length > 0) {
                const suggestions = response.data.map((customer: any) => {
                    const mappedCustomer = {
                        id: customer.id,
                        name: customer.name || customer.nameKunde || `${customer.vorname || ''} ${customer.nachname || ''}`.trim(),
                        phone: customer.phone || customer.Telefon || customer.telefon || '',
                        email: customer.email || '',
                        location: customer.location || customer.Geschäftstandort || customer.wohnort || ''
                    };
                    return mappedCustomer;
                });

                if (type === 'name') {
                    setNameSuggestions(suggestions);
                    setShowNameSuggestions(suggestions.length > 0);
                } else if (type === 'phone') {
                    setPhoneSuggestions(suggestions);
                    setShowPhoneSuggestions(suggestions.length > 0);
                } else if (type === 'email') {
                    setEmailSuggestions(suggestions);
                    setShowEmailSuggestions(suggestions.length > 0);
                } else if (type === 'location') {
                    setLocationSuggestions(suggestions);
                    setShowLocationSuggestions(suggestions.length > 0);
                }
            } else {
                // Clear suggestions if no results
                if (type === 'name') {
                    setNameSuggestions([]);
                    setShowNameSuggestions(false);
                } else if (type === 'phone') {
                    setPhoneSuggestions([]);
                    setShowPhoneSuggestions(false);
                } else if (type === 'email') {
                    setEmailSuggestions([]);
                    setShowEmailSuggestions(false);
                } else if (type === 'location') {
                    setLocationSuggestions([]);
                    setShowLocationSuggestions(false);
                }
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            // Clear suggestions on error
            if (type === 'name') {
                setNameSuggestions([]);
                setShowNameSuggestions(false);
            } else if (type === 'phone') {
                setPhoneSuggestions([]);
                setShowPhoneSuggestions(false);
            } else if (type === 'email') {
                setEmailSuggestions([]);
                setShowEmailSuggestions(false);
            } else if (type === 'location') {
                setLocationSuggestions([]);
                setShowLocationSuggestions(false);
            }
        } finally {
            setSuggestionLoading(false);
        }
    };

    // Main search function
    const handleSearch = async () => {
        setLoading(true);
        setNotFound(false);

        try {
            if (!searchName && !searchPhone && !searchEmail && !searchLocation) {
                setSelectedCustomer(null);
                setNotFound(false);
                setLoading(false);
                return;
            }

            // If we have a selected suggestion, fetch full customer data
            if (selectedSuggestion) {
                await fetchFullCustomerData(selectedSuggestion.id);
                return;
            }

            // If no suggestion selected, try API search
            let response = null;

            // First try: Search by name if available
            if (searchName) {
                response = await searchCustomers(searchName, 1, 10, searchName, '', '', '', '');
            }

            // If no result and phone available, try phone search
            if ((!response || !response.data || response.data.length === 0) && searchPhone) {
                response = await searchCustomers(searchPhone, 1, 10, '', '', searchPhone, '', '');
            }

            // If no result and email available, try email search  
            if ((!response || !response.data || response.data.length === 0) && searchEmail) {
                response = await searchCustomers(searchEmail, 1, 10, '', searchEmail, '', '', '');
            }

            // If no result and location available, try location search
            if ((!response || !response.data || response.data.length === 0) && searchLocation) {
                response = await searchCustomers(searchLocation, 1, 10, '', '', '', '', '');
            }

            // If still no result, try general search
            if (!response || !response.data || response.data.length === 0) {
                const searchTerm = searchName || searchPhone || searchEmail || searchLocation;
                response = await searchCustomers(searchTerm, 1, 10, searchName || '', searchEmail || '', searchPhone || '', '', '');
            }

            if (response && response.data && response.data.length > 0) {
                const customer = response.data[0];
                // Fetch full customer data using getSingleCustomer
                if (customer.id) {
                    await fetchFullCustomerData(customer.id);
                } else {
                    // Fallback: use search result if no ID available
                    const foundCustomer: CustomerData = {
                        id: customer.id,
                        nameKunde: customer.name || customer.nameKunde || `${customer.vorname || ''} ${customer.nachname || ''}`.trim(),
                        Telefon: customer.phone || customer.Telefon || customer.telefon || '',
                        email: customer.email || '',
                        Geburtsdatum: customer.Geburtsdatum || customer.geburtsdatum || '',
                        Geschäftstandort: customer.location || customer.Geschäftstandort || customer.wohnort || '',
                        createdAt: customer.createdAt || new Date().toISOString()
                    };
                    setSelectedCustomer(foundCustomer);
                    setNotFound(false);
                }
            } else {
                setSelectedCustomer(null);
                setNotFound(true);
            }
        } catch (error) {
            console.error('Error searching customers:', error);
            setSelectedCustomer(null);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle suggestion selection - only fill fields, don't search automatically
    const handleSuggestionSelect = (suggestion: SuggestionItem) => {
        // Set all field values
        setSearchName(suggestion.name || '');
        setSearchPhone(suggestion.phone || '');
        setSearchEmail(suggestion.email || '');
        setSearchLocation(suggestion.location || '');

        // Store the selected suggestion for later use
        setSelectedSuggestion(suggestion);

        // Hide all suggestions
        setShowNameSuggestions(false);
        setShowPhoneSuggestions(false);
        setShowEmailSuggestions(false);
        setShowLocationSuggestions(false);

        // Clear suggestion arrays to prevent auto-showing
        setNameSuggestions([]);
        setPhoneSuggestions([]);
        setEmailSuggestions([]);
        setLocationSuggestions([]);

        // Don't fetch customer data here - wait for "Suchen" button click
        // Clear any previous customer display
        setSelectedCustomer(null);
        setNotFound(false);
    };

    // Fetch full customer data by ID
    const fetchFullCustomerData = async (customerId: string) => {
        setLoading(true);
        setNotFound(false);
        try {
            const response = await getSingleCustomer(customerId);
            const customer = Array.isArray((response as any)?.data)
                ? (response as any).data[0]
                : Array.isArray(response)
                    ? (response as any)[0]
                    : (response as any)?.data ?? response;

            if (customer) {
                const foundCustomer: CustomerData = {
                    id: customer.id,
                    nameKunde: customer.name || customer.nameKunde || `${customer.vorname || ''} ${customer.nachname || ''}`.trim(),
                    Telefon: customer.phone || customer.Telefon || customer.telefon || '',
                    email: customer.email || '',
                    Geburtsdatum: customer.Geburtsdatum || customer.geburtsdatum || '',
                    Geschäftstandort: customer.location || customer.Geschäftstandort || customer.wohnort || '',
                    createdAt: customer.createdAt || new Date().toISOString()
                };
                setSelectedCustomer(foundCustomer);
                setNotFound(false);
            } else {
                setSelectedCustomer(null);
                setNotFound(true);
            }
        } catch (error) {
            console.error('Error fetching customer:', error);
            setSelectedCustomer(null);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle clicking outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                nameInputRef.current && !nameInputRef.current.contains(event.target as Node) &&
                phoneInputRef.current && !phoneInputRef.current.contains(event.target as Node) &&
                emailInputRef.current && !emailInputRef.current.contains(event.target as Node) &&
                locationInputRef.current && !locationInputRef.current.contains(event.target as Node)
            ) {
                setShowNameSuggestions(false);
                setShowPhoneSuggestions(false);
                setShowEmailSuggestions(false);
                setShowLocationSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Clear search results
    const clearSearch = () => {
        setSelectedCustomer(null);
        setNotFound(false);
        setSelectedSuggestion(null);
        setSearchName('');
        setSearchPhone('');
        setSearchEmail('');
        setSearchLocation('');
        setNameSuggestions([]);
        setPhoneSuggestions([]);
        setEmailSuggestions([]);
        setLocationSuggestions([]);
        setShowNameSuggestions(false);
        setShowPhoneSuggestions(false);
        setShowEmailSuggestions(false);
        setShowLocationSuggestions(false);
    };

    // Handle name input change
    const handleNameChange = (value: string) => {
        setSearchName(value);
        setShowNameSuggestions(true);
        setSelectedSuggestion(null);
    };

    // Handle phone input change
    const handlePhoneChange = (value: string) => {
        setSearchPhone(value);
        setSelectedSuggestion(null);
    };

    // Handle email input change
    const handleEmailChange = (value: string) => {
        setSearchEmail(value);
        setSelectedSuggestion(null);
    };

    // Handle location input change
    const handleLocationChange = (value: string) => {
        setSearchLocation(value);
        setSelectedSuggestion(null);
    };

    return {
        // Search input states
        searchName,
        searchPhone,
        searchEmail,
        searchLocation,
        
        // Search result states
        selectedCustomer,
        notFound,
        loading,
        
        // Suggestion states
        nameSuggestions,
        phoneSuggestions,
        emailSuggestions,
        locationSuggestions,
        showNameSuggestions,
        showPhoneSuggestions,
        showEmailSuggestions,
        showLocationSuggestions,
        suggestionLoading,
        selectedSuggestion,
        
        // Refs
        nameInputRef,
        phoneInputRef,
        emailInputRef,
        locationInputRef,
        
        // Actions
        setSearchName,
        setSearchPhone,
        setSearchEmail,
        setSearchLocation,
        setSelectedCustomer,
        handleSearch,
        handleSuggestionSelect,
        clearSearch,
        handleNameChange,
        handlePhoneChange,
        handleEmailChange,
        handleLocationChange,
        
        // Suggestion visibility controls
        setShowNameSuggestions,
        setShowPhoneSuggestions,
        setShowEmailSuggestions,
        setShowLocationSuggestions
    };
};

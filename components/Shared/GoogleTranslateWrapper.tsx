'use client';

import { useEffect, useRef, memo } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        google: {
            translate: {
                TranslateElement: new (
                    config: {
                        pageLanguage: string;
                        includedLanguages: string;
                        autoDisplay: boolean;
                    },
                    elementId: string
                ) => void;
            };
        };
    }
}

const LANGUAGE_STORAGE_KEY = 'tdhaemoi_selected_language';

// Get saved language from localStorage
const getSavedLanguage = (): string => {
    if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLang && (savedLang === 'de' || savedLang === 'en')) {
            return savedLang;
        }
    }
    return 'de';
};

// DOM patch is now imported in app/layout.tsx before React loads
// This ensures the patch is applied before React uses DOM methods

const GoogleTranslateWrapper = memo(function GoogleTranslateWrapper() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Global error handler to catch and suppress DOM manipulation errors from Google Translate
        const handleError = (event: ErrorEvent) => {
            const errorMessage = event.error?.message || event.message || '';
            const isDOMError = 
                errorMessage.includes('removeChild') ||
                errorMessage.includes('insertBefore') ||
                errorMessage.includes('not a child of this node') ||
                errorMessage.includes('Failed to execute \'removeChild\'') ||
                errorMessage.includes('Failed to execute \'insertBefore\'');
            
            if (isDOMError) {
                // Suppress Google Translate DOM manipulation errors
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        };

        // Global unhandled rejection handler
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const errorMessage = event.reason?.message || String(event.reason) || '';
            const isDOMError = 
                errorMessage.includes('removeChild') ||
                errorMessage.includes('insertBefore') ||
                errorMessage.includes('not a child of this node') ||
                errorMessage.includes('Failed to execute \'removeChild\'') ||
                errorMessage.includes('Failed to execute \'insertBefore\'');
            
            if (isDOMError) {
                // Suppress Google Translate DOM manipulation errors
                event.preventDefault();
            }
        };

        window.addEventListener('error', handleError, true);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError, true);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return (
        <>
            {/* 
                Use dangerouslySetInnerHTML to tell React not to manage this element's children.
                This prevents React from trying to remove children that Google Translate manages.
            */}
            <div
                ref={containerRef}
                key="google-translate-container"
                id="google_translate_element"
                style={{ display: 'none' }}
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: '' }}
            />
            <Script
                id="google-translate-init"
                strategy="afterInteractive"
            >
                {`
                    function googleTranslateElementInit() {
                        // Wait for Google Translate to be fully loaded
                        function initTranslate() {
                            try {
                                if (typeof window === 'undefined' || 
                                    !window.google || 
                                    !window.google.translate) {
                                    return false;
                                }
                                
                                // More robust check for TranslateElement
                                const TranslateElement = window.google.translate.TranslateElement;
                                if (!TranslateElement || typeof TranslateElement !== 'function') {
                                    return false;
                                }
                                
                                const element = document.getElementById('google_translate_element');
                                if (!element) {
                                    return false;
                                }
                                
                                // Check if already initialized
                                if (element.querySelector('.goog-te-combo')) {
                                    // Already initialized, just apply saved language
                                    applySavedLanguage();
                                    return true;
                                }
                                
                                // Initialize Google Translate - use try-catch around constructor
                                try {
                                    // Double-check it's still a function before calling
                                    if (typeof window.google.translate.TranslateElement === 'function') {
                                        new window.google.translate.TranslateElement({
                                            pageLanguage: 'de',
                                            includedLanguages: 'en,de',
                                            autoDisplay: false
                                        }, 'google_translate_element');
                                        
                                        // Apply saved language preference after initialization
                                        setTimeout(applySavedLanguage, 500);
                                        return true;
                                    } else {
                                        return false;
                                    }
                                } catch (initError) {
                                    // Silently fail - will retry on next interval
                                    return false;
                                }
                            } catch (error) {
                                // Silently fail - will retry on next interval
                                return false;
                            }
                        }
                        
                        function applySavedLanguage() {
                            try {
                                const savedLang = localStorage.getItem('${LANGUAGE_STORAGE_KEY}');
                                if (savedLang && (savedLang === 'de' || savedLang === 'en')) {
                                    const selectElement = document.querySelector('.goog-te-combo');
                                    if (selectElement && selectElement.nodeName === 'SELECT') {
                                        selectElement.value = savedLang;
                                        selectElement.dispatchEvent(new Event('change'));
                                    }
                                }
                            } catch (error) {
                                console.error('Error applying saved language:', error);
                            }
                        }
                        
                        // Try to initialize immediately
                        if (!initTranslate()) {
                            // If not ready, wait and retry
                            let retries = 0;
                            const maxRetries = 50; // 5 seconds max wait
                            const checkInterval = setInterval(function() {
                                retries++;
                                if (initTranslate() || retries >= maxRetries) {
                                    clearInterval(checkInterval);
                                }
                            }, 100);
                        }
                    }
                `}
            </Script>
            <Script
                src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
                strategy="afterInteractive"
            />
        </>
    );
});

export default GoogleTranslateWrapper;

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

// Patch DOM methods IMMEDIATELY when module loads (before React uses them)
if (typeof window !== 'undefined') {
    // Patch removeChild
    const originalRemoveChild = Node.prototype.removeChild;
    const removeChildProto: any = Node.prototype.removeChild;

    if (!removeChildProto.__googleTranslatePatched) {
        (Node.prototype as any).removeChild = function(child: Node) {
            try {
                // Always check if child is actually a child before removing
                if (child.parentNode !== this) {
                    // Child's parent is not this node - it was moved, return without error
                    return child;
                }
                // Child is actually a child - proceed with normal removal
                return originalRemoveChild.call(this, child);
            } catch (error: unknown) {
                // Catch any errors and return child silently
                const err = error as { name?: string; code?: number; message?: string };
                const errorMessage = err?.message || String(error) || '';
                const errorName = err?.name || '';
                const errorCode = err?.code;
                
                if (
                    errorName === 'NotFoundError' ||
                    errorCode === 8 ||
                    errorMessage.includes('not a child') ||
                    errorMessage.includes('removeChild')
                ) {
                    return child;
                }
                throw error;
            }
        };
        removeChildProto.__googleTranslatePatched = true;
    }

    // Patch insertBefore
    const originalInsertBefore = Node.prototype.insertBefore;
    const insertBeforeProto: any = Node.prototype.insertBefore;

    if (!insertBeforeProto.__googleTranslatePatched) {
        (Node.prototype as any).insertBefore = function(newNode: Node, referenceNode: Node | null) {
            try {
                // Check if referenceNode is actually a child of this node (if provided)
                if (referenceNode !== null && referenceNode.parentNode !== this) {
                    // Reference node was moved - append instead
                    return this.appendChild(newNode);
                }
                // Reference node is valid - proceed with normal insertion
                return originalInsertBefore.call(this, newNode, referenceNode);
            } catch (error: unknown) {
                const err = error as { name?: string; code?: number; message?: string };
                const errorMessage = err?.message || String(error) || '';
                const errorName = err?.name || '';
                const errorCode = err?.code;
                
                if (
                    errorName === 'NotFoundError' ||
                    errorCode === 8 ||
                    errorMessage.includes('not a child') ||
                    errorMessage.includes('insertBefore')
                ) {
                    // Fallback to appendChild
                    try {
                        return this.appendChild(newNode);
                    } catch {
                        return newNode;
                    }
                }
                throw error;
            }
        };
        insertBeforeProto.__googleTranslatePatched = true;
    }
}

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
                                    !window.google.translate || 
                                    typeof window.google.translate.TranslateElement !== 'function') {
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
                                
                                // Initialize Google Translate
                                try {
                                    new window.google.translate.TranslateElement({
                                        pageLanguage: 'de',
                                        includedLanguages: 'en,de',
                                        autoDisplay: false
                                    }, 'google_translate_element');
                                    
                                    // Apply saved language preference after initialization
                                    setTimeout(applySavedLanguage, 500);
                                    return true;
                                } catch (initError) {
                                    console.error('Error initializing Google Translate:', initError);
                                    return false;
                                }
                            } catch (error) {
                                console.error('Error in initTranslate:', error);
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

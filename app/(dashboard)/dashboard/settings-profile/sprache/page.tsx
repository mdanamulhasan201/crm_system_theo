"use client"
import LanguageSwitcher from '@/components/Shared/LanguageSwitcher';
import React from 'react'

export default function SprachePage() {
    const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const handleLanguageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLanguageDropdown((prev) => !prev);
    };

    React.useEffect(() => {
        if (!showLanguageDropdown) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowLanguageDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLanguageDropdown]);

    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowLanguageDropdown(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div className="relative min-h-[240px] px-4 py-8">
            <div className="mx-auto max-w-xl">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Sprache & Übersetzung</h1>
                <p className="mt-2 text-sm text-gray-500">Wählen Sie Ihre bevorzugte Sprache für das Dashboard. Änderungen werden sofort übernommen.</p>

                <div ref={containerRef} className="relative inline-block mt-6">
                    <button
                        onClick={handleLanguageClick}
                        aria-haspopup="menu"
                        aria-expanded={showLanguageDropdown}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/30 px-4 py-2 shadow-sm transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="h-4 w-4"
                            aria-hidden
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h19.5M12 2.25c2.485 2.485 3.75 5.265 3.75 9.75s-1.265 7.265-3.75 9.75c-2.485-2.485-3.75-5.265-3.75-9.75S9.515 4.735 12 2.25z" />
                        </svg>
                        <span className="text-sm font-medium">Sprache ändern</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4 text-gray-500"
                            aria-hidden
                        >
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {showLanguageDropdown && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                            <div className="relative w-72 rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm shadow-lg">
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-200 shadow-[-1px_-1px_1px_rgba(0,0,0,0.05)]"></div>
                                <div className="p-3">
                                    <div className="mb-2">
                                        <p className="text-sm font-medium text-gray-900">Sprache auswählen</p>
                                        <p className="text-xs text-gray-500">Wählen Sie aus den verfügbaren Sprachen.</p>
                                    </div>
                                    <LanguageSwitcher
                                        variant="minimal"
                                        className="mt-1"
                                        onLanguageChange={() => setShowLanguageDropdown(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

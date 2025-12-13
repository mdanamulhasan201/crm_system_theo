'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { HiPlus } from 'react-icons/hi'
import { X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import LastScans, { LastScansRef } from '@/components/LastScans/LastScans'
import AddCustomerModal from '@/components/CustomerModal/AddCustomerModal'
import { useSearchCustomer } from '@/hooks/customer/useSearchCustomer'
import legsImg from '@/public/Kunden/legs.png'
import scanner3D from '@/public/Kunden/3d.png'
import userImg from '@/public/Kunden/user.png'
import LastScanTable from '@/components/LastScans/LastScanTable'

export default function Customers() {
    const router = useRouter()
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
    const lastScansRef = useRef<LastScansRef>(null)

    const {
        // Search Input States
        searchName,
        searchPhone,
        searchEmail,
        searchLocation,

        // Search Result States
        selectedCustomer,
        notFound,
        loading,

        // Suggestion States
        nameSuggestions,
        phoneSuggestions,
        emailSuggestions,
        locationSuggestions,
        showNameSuggestions,
        showPhoneSuggestions,
        showEmailSuggestions,
        showLocationSuggestions,
        suggestionLoading,

        // Refs for Input Focus Management
        nameInputRef,
        phoneInputRef,
        emailInputRef,
        locationInputRef,

        // Search Actions
        handleSearch,
        handleSuggestionSelect,
        setSelectedCustomer,

        // Input Change Handlers
        handleNameChange,
        handlePhoneChange,
        handleEmailChange,
        handleLocationChange,

        // Suggestion Visibility Controls
        setShowNameSuggestions,
        setShowPhoneSuggestions,
        setShowEmailSuggestions,
        setShowLocationSuggestions
    } = useSearchCustomer()

    // ===== EVENT HANDLERS =====

    const handleScanView = (customerId: string) => {
        router.push(`/dashboard/customer-info/${customerId}`)
    }

    const handleAddCustomerClick = () => {
        setIsAddCustomerModalOpen(true)
    }

    const handleCustomerSubmit = async (customerData: any) => {
        try {
            setIsAddCustomerModalOpen(false)
            setTimeout(() => {
                if (lastScansRef.current) {
                    lastScansRef.current.refreshData()
                }
            }, 1000)
        } catch (error) {
        }
    }

    const handleCustomerDeleted = () => {
        if (lastScansRef.current) {
            lastScansRef.current.refreshData()
        }
    }

    const handleCloseCustomerCard = () => {
        setSelectedCustomer(null)
    }

    const clearNameField = () => {
        handleNameChange('')
        setShowNameSuggestions(false)
    }

    const clearPhoneField = () => {
        handlePhoneChange('')
        setShowPhoneSuggestions(false)
    }

    const clearEmailField = () => {
        handleEmailChange('')
        setShowEmailSuggestions(false)
    }

    const clearLocationField = () => {
        handleLocationChange('')
        setShowLocationSuggestions(false)
    }

    const handleCustomerInfo = (customerId: string) => {
        router.push(`/dashboard/customer-info/${customerId}`)
    }

    // ===== RENDER HELPERS =====

    const renderSearchInput = (
        ref: React.RefObject<HTMLInputElement | null>,
        placeholder: string,
        value: string,
        onChange: (value: string) => void,
        onFocus: () => void,
        suggestions: any[],
        showSuggestions: boolean,
        clearField: () => void
    ) => (
        <div className="relative">
            <div className="relative">
                <Input
                    ref={ref}
                    placeholder={placeholder}
                    className='border border-gray-500 rounded-md pr-10'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                />

                {/* Clear Button (X icon) */}
                {value && (
                    <button
                        type="button"
                        onClick={clearField}
                        className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Clear field"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className="px-4 py-3 hover:bg-[#61A175]/10 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                            onMouseDown={(e) => {
                                e.preventDefault() // Prevent input blur
                                handleSuggestionSelect(suggestion)
                            }}
                        >
                            <div className="font-semibold text-sm text-slate-900">{suggestion.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                                {suggestion.email && <span>Email: {suggestion.email}</span>}
                                {suggestion.phone && (
                                    <span className="ml-2">Telefon: {suggestion.phone}</span>
                                )}
                                {suggestion.location && (
                                    <span className="ml-2">Ort: {suggestion.location}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Loading State */}
            {suggestionLoading && showSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span className="ml-2 text-sm text-gray-500">Suche...</span>
                    </div>
                </div>
            )}
        </div>
    )

    const renderCustomerCard = () => {
        if (!selectedCustomer) return null

        return (
            <Card className="relative shadow-none border border-gray-500 bg-transparent">
                <button
                    className="absolute cursor-pointer right-2 top-2"
                    onClick={handleCloseCustomerCard}
                >
                    <X className="h-4 w-4" />
                </button>

                <CardContent className="pt-6 text-center">
                    {/* Customer Image */}
                    <div className="flex justify-center mb-4">
                        <Image
                            src={legsImg}
                            alt="Foot scan"
                            width={200}
                            height={100}
                            className="object-contain"
                        />
                    </div>

                    {/* Customer Name */}
                    <h2 className="text-xl font-semibold text-green-600 mb-4">
                        {selectedCustomer.nameKunde}
                    </h2>

                    {/* Customer Details */}
                    <div className="space-y-2 mb-6">
                        {selectedCustomer.email && (
                            <p>Email: {selectedCustomer.email}</p>
                        )}
                        {selectedCustomer.Telefon && (
                            <p>Telefon: {selectedCustomer.Telefon}</p>
                        )}
                        <p>Erstellt am: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                        {selectedCustomer.Geschäftstandort && (
                            <p>Ort: {selectedCustomer.Geschäftstandort}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={() => handleScanView(selectedCustomer.id)}
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Image src={scanner3D} alt="Scan" width={20} height={20} />
                            <span>Scan ansehen</span>
                        </Button>
                        <Button
                            onClick={() => handleCustomerInfo(selectedCustomer.id)}
                            variant="outline"
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Image src={userImg} alt="User" width={20} height={20} />
                            <span>Kundeninfo</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // ===== MAIN RENDER =====

    return (
        <div className="">
            {/* ===== HEADER SECTION ===== */}
            <div className='flex items-center justify-between gap-2 mb-6'>
                <h1 className="text-2xl font-bold">Kunden & Scans</h1>
                <div className='flex items-center gap-4'>
                    <div
                        className='flex items-center gap-2 cursor-pointer'
                        onClick={handleAddCustomerClick}
                    >
                        <h1 className='text-xl font-semibold'>Kunde hinzufügen</h1>
                        <HiPlus className='text-4xl font-semibold text-black border border-gray-500 rounded-full p-1' />
                    </div>
                </div>
            </div>

            {/* ===== MAIN CONTENT GRID ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-center">

                {/* ===== LEFT SIDE - SEARCH FORM ===== */}
                <div className="space-y-5">
                    {/* Name Input */}
                    {renderSearchInput(
                        nameInputRef,
                        "Name",
                        searchName,
                        handleNameChange,
                        () => setShowNameSuggestions(nameSuggestions.length > 0),
                        nameSuggestions,
                        showNameSuggestions,
                        clearNameField
                    )}

                    {/* Phone Input */}
                    {renderSearchInput(
                        phoneInputRef,
                        "Telefon",
                        searchPhone,
                        handlePhoneChange,
                        () => setShowPhoneSuggestions(phoneSuggestions.length > 0),
                        phoneSuggestions,
                        showPhoneSuggestions,
                        clearPhoneField
                    )}

                    {/* Email Input */}
                    {renderSearchInput(
                        emailInputRef,
                        "Email",
                        searchEmail,
                        handleEmailChange,
                        () => setShowEmailSuggestions(emailSuggestions.length > 0),
                        emailSuggestions,
                        showEmailSuggestions,
                        clearEmailField
                    )}

                    {/* Location Input */}
                    {renderSearchInput(
                        locationInputRef,
                        "Ort",
                        searchLocation,
                        handleLocationChange,
                        () => setShowLocationSuggestions(locationSuggestions.length > 0),
                        locationSuggestions,
                        showLocationSuggestions,
                        clearLocationField
                    )}

                    {/* Search Button */}
                    <div className='flex justify-center'>
                        <Button
                            className="w-32 cursor-pointer flex items-center justify-center gap-2"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Lädt...
                                </>
                            ) : (
                                "Suchen"
                            )}
                        </Button>
                    </div>
                </div>

                {/* ===== RIGHT SIDE - CUSTOMER DISPLAY ===== */}
                <div>
                    {selectedCustomer ? (
                        renderCustomerCard()
                    ) : notFound ? (
                        <div className="text-center text-red-500">
                            Keine Ergebnisse gefunden
                        </div>
                    ) : null}
                </div>
            </div>

            {/* ===== LAST SCANS SECTION ===== */}
            {/* No extra timer: shimmer is handled inside LastScans based on real loading state */}
            <LastScans ref={lastScansRef} />

            <LastScanTable onCustomerDeleted={handleCustomerDeleted} />

            {/* ===== ADD CUSTOMER MODAL ===== */}
            <AddCustomerModal
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                onSubmit={handleCustomerSubmit}
            />
        </div>
    )
}



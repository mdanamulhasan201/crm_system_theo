"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiPlus } from "react-icons/hi";
import { X, Mail, Phone, MapPin, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LastScans, { LastScansRef } from "@/components/LastScans/LastScans";
import AddCustomerModal from "@/components/CustomerModal/AddCustomerModal";
import { useSearchCustomer } from "@/hooks/customer/useSearchCustomer";
import legsImg from "@/public/Kunden/legs.png";
import scanner3D from "@/public/Kunden/3d.png";
import userImg from "@/public/Kunden/user.png";
import LastScanTable from "@/components/LastScans/LastScanTable";

export default function Customers() {
  const router = useRouter();
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const lastScansRef = useRef<LastScansRef>(null);

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
    setShowLocationSuggestions,
  } = useSearchCustomer();

  // ===== EVENT HANDLERS =====

  const handleScanView = (customerId: string) => {
    router.push(`/dashboard/scanning-data/${customerId}`);
  };

  const handleAddCustomerClick = () => {
    setIsAddCustomerModalOpen(true);
  };

  const handleCustomerSubmit = async (customerData: any) => {
    try {
      setIsAddCustomerModalOpen(false);
      setTimeout(() => {
        if (lastScansRef.current) {
          lastScansRef.current.refreshData();
        }
      }, 1000);
    } catch (error) {}
  };

  const handleCustomerDeleted = () => {
    if (lastScansRef.current) {
      lastScansRef.current.refreshData();
    }
  };

  const handleCloseCustomerCard = () => {
    setSelectedCustomer(null);
  };

  const clearNameField = () => {
    handleNameChange("");
    setShowNameSuggestions(false);
  };

  const clearPhoneField = () => {
    handlePhoneChange("");
    setShowPhoneSuggestions(false);
  };

  const clearEmailField = () => {
    handleEmailChange("");
    setShowEmailSuggestions(false);
  };

  const clearLocationField = () => {
    handleLocationChange("");
    setShowLocationSuggestions(false);
  };

  const handleCustomerInfo = (customerId: string) => {
    router.push(`/dashboard/scanning-data/${customerId}`);
  };

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
          className="border border-gray-500 rounded-md pr-10"
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
                e.preventDefault(); // Prevent input blur
                handleSuggestionSelect(suggestion);
              }}
            >
              <div className="font-semibold text-sm text-slate-900">
                {suggestion.name}
              </div>
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
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span className="ml-2 text-sm text-gray-500">Suche...</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderCustomerCard = () => {
    if (!selectedCustomer) return null;

    // Get first letter of customer name for avatar
    const firstLetter =
      selectedCustomer.nameKunde?.charAt(0)?.toUpperCase() || "C";

    return (
      <Card className="relative shadow-lg border border-gray-200 bg-white">
        <CardContent className="p-6">
          {/* Customer Avatar and Name */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-semibold mb-3">
              {firstLetter}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCustomer.nameKunde}
            </h2>
          </div>

          {/* Customer Details */}
          <div className="space-y-3 mb-6">
            {selectedCustomer.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{selectedCustomer.email}</span>
              </div>
            )}
            {selectedCustomer.Telefon && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{selectedCustomer.Telefon}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span>
                Kunden-ID:{" "}
                {selectedCustomer.id}
              </span>
            </div>
            {selectedCustomer.Geschäftstandort && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Ort: Pichlarn Adr. Terantien...</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleScanView(selectedCustomer.id)}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer border-gray-300 hover:bg-gray-50"
            >
              <Image src={scanner3D} alt="Scan" width={16} height={16} />
              <span className="text-sm">Scan Ansehen</span>
            </Button>
            <Button
              onClick={() => handleCustomerInfo(selectedCustomer.id)}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer border-gray-300 hover:bg-gray-50"
            >
              <Image src={userImg} alt="User" width={16} height={16} />
              <span className="text-sm">Kundeninfo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <div className="">
      {/* ===== HEADER SECTION ===== */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <h1 className="text-2xl font-bold">Kundensuche</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 cursor-pointer border-[#62A07C] text-[#62A07C] hover:bg-[#62A07C]/10"
            onClick={handleAddCustomerClick}
          >
            + Kunde hinzufügen
          </Button>
        </div>
      </div>

      {/* ===== SEARCH SECTION WITH GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-8">
        {/* Left Side - Search Form */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* First Row: Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Input */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Name
                  </label>
                  {renderSearchInput(
                    nameInputRef,
                    "James Smith",
                    searchName,
                    handleNameChange,
                    () => setShowNameSuggestions(nameSuggestions.length > 0),
                    nameSuggestions,
                    showNameSuggestions,
                    clearNameField
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Email
                  </label>
                  {renderSearchInput(
                    emailInputRef,
                    "james3424@gmail.com",
                    searchEmail,
                    handleEmailChange,
                    () => setShowEmailSuggestions(emailSuggestions.length > 0),
                    emailSuggestions,
                    showEmailSuggestions,
                    clearEmailField
                  )}
                </div>
              </div>

              {/* Second Row: Phone Input - Full Width */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Telefon
                </label>
                {renderSearchInput(
                  phoneInputRef,
                  "+379 658 63 045",
                  searchPhone,
                  handlePhoneChange,
                  () => setShowPhoneSuggestions(phoneSuggestions.length > 0),
                  phoneSuggestions,
                  showPhoneSuggestions,
                  clearPhoneField
                )}
              </div>

              {/* Third Row: Location Input - Full Width */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Ort
                </label>
                {renderSearchInput(
                  locationInputRef,
                  "München",
                  searchLocation,
                  handleLocationChange,
                  () =>
                    setShowLocationSuggestions(locationSuggestions.length > 0),
                  locationSuggestions,
                  showLocationSuggestions,
                  clearLocationField
                )}
              </div>
            </div>

            {/* Search Button - Full Width */}
            <Button
              className="w-full bg-[#62A07C] hover:bg-[#62a07c98] cursor-pointer flex items-center justify-center gap-2 mt-4 col-span-full"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Lädt...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  Suchen
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Side - Customer Display or Empty State */}
        <Card className="bg-white shadow-sm border border-gray-200 h-full">
          <CardContent className="p-6 flex items-center justify-center h-full">
            {selectedCustomer ? (
              renderCustomerCard()
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-32 h-32 text-gray-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm max-w-xs">
                  Geben Sie Suchkriterien ein, um
                  <br />
                  Kunden zu finden
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== SCAN HISTORY VIEW SECTION ===== */}
      <LastScans ref={lastScansRef} />

      {/* ===== KUNDENAUFTRÄGE ÜBERSICHT SECTION ===== */}
      <LastScanTable onCustomerDeleted={handleCustomerDeleted} />

      {/* ===== ADD CUSTOMER MODAL ===== */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onSubmit={handleCustomerSubmit}
      />
    </div>
  );
}


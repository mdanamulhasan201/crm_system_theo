'use client';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, UploadCloud, Search, X, Copy } from 'lucide-react';
import CustomerSearchModal from './CustomerSearchModal';
import OtherCustomerModal from './OtherCustomerModal';
import BusinessAddressModal from './BusinessAddressModal';
import FilePreviewWithShimmer from './FilePreviewWithShimmer';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  createdAt: string;
}

interface BusinessAddressData {
  companyName: string;
  address: string;
  price: number;
  phone: string;
  email: string;
}

interface VersendenData {
  company: string;
  street: string;
  city: string;
  country: string;
}

interface FileUploadSectionProps {
  linkerLeistenFileName: string;
  setLinkerLeistenFileName: (fileName: string) => void;
  rechterLeistenFileName: string;
  setRechterLeistenFileName: (fileName: string) => void;
  linkerLeistenFile: File | null;
  setLinkerLeistenFile: (file: File | null) => void;
  rechterLeistenFile: File | null;
  setRechterLeistenFile: (file: File | null) => void;
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  otherCustomerNumber: string;
  setOtherCustomerNumber: (name: string) => void;
  hideCustomerSearch?: boolean;
  hideFileUploads?: boolean;
  businessAddress?: BusinessAddressData | null;
  onBusinessAddressSave?: (data: BusinessAddressData) => void;
  versendenData?: VersendenData | null;
  onVersendenChange?: (data: VersendenData | null) => void;
  orderId?: string | null;
  /** Nach fehlgeschlagener „Weiter“-Validierung: Abholen/Versenden hervorheben */
  highlightDeliveryChoice?: boolean;
  /** Nach fehlgeschlagener Validierung: 3D-Upload-Spalten hervorheben */
  highlight3dUploads?: boolean;
  /** Lock customer field and prevent editing */
  lockCustomerSelection?: boolean;
  /** Hide external customer input */
  hideExternalCustomer?: boolean;
}

export default function FileUploadSection({
  linkerLeistenFileName,
  setLinkerLeistenFileName,
  rechterLeistenFileName,
  setRechterLeistenFileName,
  linkerLeistenFile,
  setLinkerLeistenFile,
  rechterLeistenFile,
  setRechterLeistenFile,
  selectedCustomer,
  onSelectCustomer,
  otherCustomerNumber,
  setOtherCustomerNumber,
  hideCustomerSearch = false,
  hideFileUploads = false,
  businessAddress,
  onBusinessAddressSave,
  versendenData,
  onVersendenChange,
  orderId,
  highlightDeliveryChoice = false,
  highlight3dUploads = false,
  lockCustomerSelection = false,
  hideExternalCustomer = false,
}: FileUploadSectionProps) {
  const linkerLeistenInputRef = useRef<HTMLInputElement>(null);
  const rechterLeistenInputRef = useRef<HTMLInputElement>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Truncate long filenames so they don't overflow the button (show start...end)
  const truncateFileName = (name: string, maxChars = 36) => {
    if (!name || name.length <= maxChars) return name;
    const half = Math.floor(maxChars / 2) - 2;
    return name.slice(0, half) + '…' + name.slice(-half);
  };
  const [showOtherCustomerModal, setShowOtherCustomerModal] = useState(false);
  const [showBusinessAddressModal, setShowBusinessAddressModal] = useState(false);

  // Disable one customer input when the other is filled
  const isCustomerSelectDisabled = !!otherCustomerNumber || lockCustomerSelection;
  const isExternalCustomerDisabled = !!selectedCustomer || lockCustomerSelection;
  
  // Check if buttons are active
  const isAbholenActive = !!(businessAddress && (businessAddress.companyName || businessAddress.address));
  const isVersendenActive = !!(versendenData && (versendenData.company || versendenData.street));

  // Default shipping address
  const defaultShippingAddress: VersendenData = {
    company: 'FeetF1rst S.R.L.S.',
    street: 'Via Pipen, 5',
    city: '39031 Brunico (BZ)',
    country: 'Italien'
  };

  // Use versendenData from props
  const shippingAddress = versendenData;

  const handleCopyAddress = () => {
    if (!shippingAddress) return;
    const fullAddress = `${shippingAddress.company}\n${shippingAddress.street}\n${shippingAddress.city}\n${shippingAddress.country}`;
    navigator.clipboard.writeText(fullAddress);
    toast.success('Adresse in die Zwischenablage kopiert');
  };

  const handleLinkerLeistenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLinkerLeistenFile(file);
      setLinkerLeistenFileName(file.name);
    }
  };

  const handleRechterLeistenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRechterLeistenFile(file);
      setRechterLeistenFileName(file.name);
    }
  };

  const handleSelectCustomer = (customer: Customer | null) => {
    onSelectCustomer(customer);
    // Clear other customer number when selecting from list
    if (customer) {
      setOtherCustomerNumber('');
    }
  };

  const handleOtherCustomerConfirm = (customerName: string) => {
    setOtherCustomerNumber(customerName);
    // Clear selected customer when entering custom name
    onSelectCustomer(null);
  };

  return (
    <div className="w-full mb-8">
      {/* Header with Title and History Icon */}
      <div className="flex items-center justify-center relative mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Kundenauswahl</h2>
        {/* {!hideCustomerSearch && (
          <div className="absolute right-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
            <History className="w-5 h-5 text-green-600" />
          </div>
        )} */}
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className={`grid gap-4 md:gap-6 ${
          hideFileUploads 
            ? (hideCustomerSearch ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4') 
            : (hideCustomerSearch ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4')
        }`}>
          {/* Kunde auswählen Section */}
          {!hideCustomerSearch && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Kunde auswählen</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Suche..."
                  value={selectedCustomer ? selectedCustomer.name : ''}
                  readOnly
                  disabled={isCustomerSelectDisabled}
                  onClick={() => {
                    if (!isCustomerSelectDisabled) {
                      setShowCustomerModal(true);
                    }
                  }}
                  className={`pl-10 pr-10 border-gray-300 rounded-md h-12 text-base ${
                    isCustomerSelectDisabled
                      ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                      : 'bg-white cursor-pointer'
                  }`}
                />
                {/* Clear button for selected customer */}
                {selectedCustomer && !isCustomerSelectDisabled && (
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(null)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Hide customer search display when hideCustomerSearch is true */}
          {hideCustomerSearch && selectedCustomer && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Kunde</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md h-12 flex items-center">
                <div className="text-base text-gray-900">{selectedCustomer.name}</div>
              </div>
            </div>
          )}

          {/* Kunden Extern Section */}
          {!hideCustomerSearch && !hideExternalCustomer && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Kunden Extern</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Textfeld..."
                  value={otherCustomerNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    setOtherCustomerNumber(value);
                    if (value) {
                      onSelectCustomer(null);
                    }
                  }}
                  onClick={() => {
                    if (!isExternalCustomerDisabled) {
                      setShowOtherCustomerModal(true);
                    }
                  }}
                  disabled={isExternalCustomerDisabled}
                  className={`pr-10 border-gray-300 rounded-md h-12 text-base ${
                    isExternalCustomerDisabled
                      ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                      : 'bg-white cursor-pointer'
                  }`}
                  readOnly={false}
                />
                {/* Clear button for external customer text */}
                {otherCustomerNumber && !isExternalCustomerDisabled && (
                  <button
                    type="button"
                    onClick={() => setOtherCustomerNumber('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 3D Leisten — gemeinsamer Bereich für Validierungshinweis */}
          {!hideFileUploads && (
            <div
              id="field-3d-leisten-uploads"
              className={cn(
                'col-span-1 sm:col-span-2 lg:col-span-2 2xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6',
                highlight3dUploads && 'rounded-lg ring-2 ring-red-500 ring-offset-2 p-2 -m-0.5'
              )}
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Linker Leisten <span className="text-red-500">*</span>
                </label>
                <Button
                  variant="outline"
                  className="justify-start cursor-pointer w-full h-12 text-base font-normal border border-gray-300 rounded-md hover:bg-gray-50 gap-3 bg-white min-w-0"
                  onClick={() => linkerLeistenInputRef.current?.click()}
                  title={linkerLeistenFileName || undefined}
                >
                  <UploadCloud className="w-5 h-5 shrink-0" />
                  <span className="truncate min-w-0">
                    {linkerLeistenFileName
                      ? truncateFileName(linkerLeistenFileName)
                      : 'Upload 3D-File Linker Leisten'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".stl,.obj,.ply,.3ds,.dae,.fbx,.x3d,image/*"
                  ref={linkerLeistenInputRef}
                  onChange={handleLinkerLeistenFileChange}
                  className="hidden"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Rechter Leisten <span className="text-red-500">*</span>
                </label>
                <Button
                  variant="outline"
                  className="justify-start cursor-pointer w-full h-12 text-base font-normal border border-gray-300 rounded-md hover:bg-gray-50 gap-3 bg-white min-w-0"
                  onClick={() => rechterLeistenInputRef.current?.click()}
                  title={rechterLeistenFileName || undefined}
                >
                  <UploadCloud className="w-5 h-5 shrink-0" />
                  <span className="truncate min-w-0">
                    {rechterLeistenFileName
                      ? truncateFileName(rechterLeistenFileName)
                      : 'Upload 3D-File Rechter Leisten'}
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".stl,.obj,.ply,.3ds,.dae,.fbx,.x3d,image/*"
                  ref={rechterLeistenInputRef}
                  onChange={handleRechterLeistenFileChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Abholen / Versenden — gemeinsamer Bereich für Pflicht-Validierung */}
          {hideFileUploads && (
            <div
              id="field-delivery-choice"
              className={cn(
                'col-span-1 sm:col-span-2 lg:col-span-2 2xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6',
                highlightDeliveryChoice && 'rounded-lg ring-2 ring-red-500 ring-offset-2 p-2 -m-0.5'
              )}
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Abholen</label>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isVersendenActive}
                  className={`w-full justify-center h-12 text-base font-normal border border-gray-300 rounded-md gap-2 ${
                    isVersendenActive
                      ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                      : 'cursor-pointer hover:bg-gray-50 bg-white'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isVersendenActive) return;

                    if (businessAddress && (businessAddress.companyName || businessAddress.address)) {
                      if (onBusinessAddressSave) {
                        onBusinessAddressSave({
                          companyName: '',
                          address: '',
                          phone: '',
                          email: '',
                          price: 0,
                        } as any);
                      }
                    } else {
                      if (onVersendenChange) {
                        onVersendenChange(null);
                      }
                      setShowBusinessAddressModal(true);
                    }
                  }}
                >
                  {businessAddress && (businessAddress.companyName || businessAddress.address) ? (
                    <>
                      <X className="w-4 h-4 text-gray-700" />
                    </>
                  ) : (
                    'Leisten abholen lassen'
                  )}
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Versenden</label>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isAbholenActive}
                  className={`w-full justify-center h-12 text-base font-normal border border-gray-300 rounded-md gap-2 ${
                    isAbholenActive
                      ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                      : 'cursor-pointer hover:bg-gray-50 bg-white'
                  }`}
                  onClick={() => {
                    if (isAbholenActive) return;

                    if (!isVersendenActive) {
                      if (onVersendenChange) {
                        onVersendenChange(defaultShippingAddress);
                      }
                      if (onBusinessAddressSave) {
                        onBusinessAddressSave({
                          companyName: '',
                          address: '',
                          phone: '',
                          email: '',
                          price: 0,
                        } as any);
                      }
                    } else {
                      if (onVersendenChange) {
                        onVersendenChange(null);
                      }
                    }
                  }}
                >
                  {isVersendenActive ? (
                    <>
                      <X className="w-4 h-4 text-gray-700" />
                    </>
                  ) : (
                    ' Leisten selber versenden'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Shipping Address Display - Outside grid but inside card - Only show when hideFileUploads is true */}
        {hideFileUploads && isVersendenActive && shippingAddress && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {shippingAddress.company}
                </p>
                <p className="text-sm text-gray-700">
                  {shippingAddress.street}
                </p>
                <p className="text-sm text-gray-700">
                  {shippingAddress.city}
                </p>
                <p className="text-sm text-gray-700">
                  {shippingAddress.country}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAddress}
                className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-100"
                title="Adresse kopieren"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
        )}

        {/* Business Address Display - Show saved courier pickup address - Only show when hideFileUploads is true */}
        {hideFileUploads && businessAddress && (businessAddress.companyName || businessAddress.address) && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Kurieradresse für Leistenabholung
                </p>
                {businessAddress.companyName && (
                  <p className="text-sm text-gray-900 font-medium">
                    {businessAddress.companyName}
                  </p>
                )}
                {businessAddress.address && (
                  <p className="text-sm text-gray-700">
                    {businessAddress.address}
                  </p>
                )}
                {businessAddress.phone && (
                  <p className="text-sm text-gray-700">
                    Tel: {businessAddress.phone}
                  </p>
                )}
                {businessAddress.email && (
                  <p className="text-sm text-gray-700">
                    Email: {businessAddress.email}
                  </p>
                )}
                {Number.isFinite(businessAddress.price) && businessAddress.price > 0 && (
                  <p className="text-sm text-gray-900 font-semibold mt-2">
                    Preis: {businessAddress.price.toFixed(2)} €
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBusinessAddressModal(true)}
                className="h-8 px-3 border-blue-300 hover:bg-blue-100 text-blue-700"
                title="Bearbeiten"
              >
                Bearbeiten
              </Button>
            </div>
          </div>
        )}

        {/* File Preview Sections - Hide when hideFileUploads is true */}
        {!hideFileUploads && (
          <>
            {linkerLeistenFileName && (
              <div className="mt-4">
                <div className="text-sm text-green-600 font-medium mb-2 truncate" title={linkerLeistenFileName}>
                  ✓ Datei hochgeladen: {truncateFileName(linkerLeistenFileName)}
                </div>
                <FilePreviewWithShimmer file={linkerLeistenFile} fileName={linkerLeistenFileName} />
              </div>
            )}

            {rechterLeistenFileName && (
              <div className="mt-4">
                <div className="text-sm text-green-600 font-medium mb-2 truncate" title={rechterLeistenFileName}>
                  ✓ Datei hochgeladen: {truncateFileName(rechterLeistenFileName)}
                </div>
                <FilePreviewWithShimmer file={rechterLeistenFile} fileName={rechterLeistenFileName} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Customer Search Modal */}
      <CustomerSearchModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelectCustomer={handleSelectCustomer}
        selectedCustomer={selectedCustomer}
      />

      {/* Other Customer Modal */}
      <OtherCustomerModal
        isOpen={showOtherCustomerModal}
        onClose={() => setShowOtherCustomerModal(false)}
        onConfirm={handleOtherCustomerConfirm}
        currentValue={otherCustomerNumber}
      />

      {/* Business Address Modal - Only show when hideFileUploads is true (PHYSISCH flow) */}
      {hideFileUploads && (
        <BusinessAddressModal
          isOpen={showBusinessAddressModal}
          onClose={() => setShowBusinessAddressModal(false)}
          onSave={(data) => {
            if (onBusinessAddressSave) {
              onBusinessAddressSave(data);
            }
            setShowBusinessAddressModal(false);
          }}
          savedAddress={businessAddress}
          // Old system: customer ID-based data fetching - DISABLED for new courier system
          // customerId={selectedCustomer?.id}
          // orderId={orderId}
          customerId={undefined}
          orderId={undefined}
        />
      )}
    </div>
  );
}

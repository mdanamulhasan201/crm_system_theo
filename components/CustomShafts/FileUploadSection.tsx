'use client';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { History, UploadCloud, Search, X, Copy } from 'lucide-react';
import CustomerSearchModal from './CustomerSearchModal';
import OtherCustomerModal from './OtherCustomerModal';
import BusinessAddressModal from './BusinessAddressModal';
import FilePreviewWithShimmer from './FilePreviewWithShimmer';
import toast from 'react-hot-toast';

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
  orderId?: string | null;
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
  orderId,
}: FileUploadSectionProps) {
  const linkerLeistenInputRef = useRef<HTMLInputElement>(null);
  const rechterLeistenInputRef = useRef<HTMLInputElement>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOtherCustomerModal, setShowOtherCustomerModal] = useState(false);
  const [showBusinessAddressModal, setShowBusinessAddressModal] = useState(false);
  const [showAbholungUnavailableModal, setShowAbholungUnavailableModal] = useState(false);
  const [showShippingAddress, setShowShippingAddress] = useState(false);

  // Disable one customer input when the other is filled
  const isCustomerSelectDisabled = !!otherCustomerNumber;
  const isExternalCustomerDisabled = !!selectedCustomer;

  const shippingAddress = {
    company: 'FeetF1rst S.R.L.S.',
    street: 'Via Pipen, 5',
    city: '39031 Brunico (BZ)',
    country: 'Italien'
  };

  const handleCopyAddress = () => {
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
            ? (hideCustomerSearch ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3') 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
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
          {!hideCustomerSearch && (
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

          {/* Linker Leisten Section - Hide when hideFileUploads is true */}
          {!hideFileUploads && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Linker Leisten</label>
              <Button 
                variant="outline" 
                className="justify-start cursor-pointer w-full h-12 text-base font-normal border border-gray-300 rounded-md hover:bg-gray-50 gap-3 bg-white"
                onClick={() => linkerLeistenInputRef.current?.click()}
              >
                <UploadCloud className="w-5 h-5" />
                {linkerLeistenFileName || "Upload 3D-File"}
              </Button>
              <input
                type="file"
                accept=".stl,.obj,.ply,.3ds,.dae,.fbx,.x3d,image/*"
                ref={linkerLeistenInputRef}
                onChange={handleLinkerLeistenFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Rechter Leisten Section - Hide when hideFileUploads is true */}
          {!hideFileUploads && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Rechter Leisten</label>
              <Button 
                variant="outline" 
                className="justify-start cursor-pointer w-full h-12 text-base font-normal border border-gray-300 rounded-md hover:bg-gray-50 gap-3 bg-white"
                onClick={() => rechterLeistenInputRef.current?.click()}
              >
                <UploadCloud className="w-5 h-5" />
                {rechterLeistenFileName || "Upload 3D-File"}
              </Button>
              <input
                type="file"
                accept=".stl,.obj,.ply,.3ds,.dae,.fbx,.x3d,image/*"
                ref={rechterLeistenInputRef}
                onChange={handleRechterLeistenFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Leisten abholen & Versenden Section - Show when hideFileUploads is true */}
          {hideFileUploads && (
            <div className="flex flex-col gap-3 mt-7">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 justify-center cursor-pointer h-10 text-sm font-normal border border-gray-300 rounded-md hover:bg-gray-50 gap-2 bg-white ${businessAddress ? 'items-center' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (businessAddress && (businessAddress.companyName || businessAddress.address)) {
                      // If address is set, clear it when clicked (set to null)
                      if (onBusinessAddressSave) {
                        onBusinessAddressSave({
                          companyName: '',
                          address: '',
                          price: 13,
                          phone: '',
                          email: '',
                        });
                      }
                    } else {
                      // Show unavailable message popup
                      setShowAbholungUnavailableModal(true);
                    }
                  }}
                >
                  {businessAddress && (businessAddress.companyName || businessAddress.address) ? (
                    <X className="w-4 h-4 text-gray-700" />
                  ) : (
                    'Leisten abholen lassen'
                  )}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className={`flex-1 justify-center cursor-pointer h-10 text-sm font-normal border border-gray-300 rounded-md hover:bg-gray-50 gap-2 bg-white ${showShippingAddress ? 'items-center' : ''}`}
                  onClick={() => setShowShippingAddress(!showShippingAddress)}
                >
                  {showShippingAddress ? (
                    <X className="w-4 h-4 text-gray-700" />
                  ) : (
                    'Leisten selber versenden'
                  )}
                </Button>
              </div>

              {/* Shipping Address Display */}
              {showShippingAddress && (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
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
            </div>
          )}
        </div>

        {/* File Preview Sections - Hide when hideFileUploads is true */}
        {!hideFileUploads && (
          <>
            {linkerLeistenFileName && (
              <div className="mt-4">
                <div className="text-sm text-green-600 font-medium mb-2">
                  ✓ Datei hochgeladen: {linkerLeistenFileName}
                </div>
                <FilePreviewWithShimmer file={linkerLeistenFile} fileName={linkerLeistenFileName} />
              </div>
            )}

            {rechterLeistenFileName && (
              <div className="mt-4">
                <div className="text-sm text-green-600 font-medium mb-2">
                  ✓ Datei hochgeladen: {rechterLeistenFileName}
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

      {/* Business Address Modal - Always show when hideFileUploads is true */}
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
          customerId={selectedCustomer?.id}
          orderId={orderId}
        />
      )}

      {/* Abholung Unavailable Modal */}
      <Dialog open={showAbholungUnavailableModal} onOpenChange={setShowAbholungUnavailableModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Abholung derzeit nicht verfügbar
            </DialogTitle>
            <DialogDescription className="text-gray-600 pt-4">
              Die Abholung der Leisten ist aktuell noch nicht möglich.
              <br /><br />
              Bitte senden Sie die Leisten derzeit selbstständig an uns.
              <br /><br />
              Sobald die Abholfunktion verfügbar ist, informieren wir Sie.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowAbholungUnavailableModal(false)}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

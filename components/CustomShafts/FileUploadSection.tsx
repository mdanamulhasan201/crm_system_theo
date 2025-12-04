'use client';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, UploadCloud, UserPlus } from 'lucide-react';
import CustomerSearchModal from './CustomerSearchModal';
import OtherCustomerModal from './OtherCustomerModal';
import FilePreviewWithShimmer from './FilePreviewWithShimmer';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  createdAt: string;
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
}: FileUploadSectionProps) {
  const linkerLeistenInputRef = useRef<HTMLInputElement>(null);
  const rechterLeistenInputRef = useRef<HTMLInputElement>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOtherCustomerModal, setShowOtherCustomerModal] = useState(false);

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
    <div className="flex flex-col gap-4 w-fit mb-8">
      {!otherCustomerNumber && (
        <Button 
          variant="outline" 
          className="justify-start w-full h-12 text-base font-normal border border-black gap-3"
          onClick={() => setShowCustomerModal(true)}
        >
          <User className="w-5 h-5" />
          {selectedCustomer ? selectedCustomer.name : "Kunde auswählen"}
        </Button>
      )}

      {!selectedCustomer && (
        <Button 
          variant="outline" 
          className="justify-start w-full h-12 text-base font-normal border border-black gap-3"
          onClick={() => setShowOtherCustomerModal(true)}
        >
          <UserPlus className="w-5 h-5" />
          {otherCustomerNumber ? otherCustomerNumber : "Anderer Kunde"}
        </Button>
      )}
      
      {/* Left Side Upload */}
      <div className="relative">
        <Button 
          variant="outline" 
          className="justify-start cursor-pointer w-full h-12 text-base font-normal border border-black gap-3 hover:bg-gray-100"
          onClick={() => linkerLeistenInputRef.current?.click()}
        >
          <UploadCloud className="w-5 h-5" />
          {linkerLeistenFileName ? linkerLeistenFileName : "Upload 3D-Datei Linker Leisten"}
        </Button>
        <input
          type="file"
          accept=".stl,.obj,.ply,.3ds,.dae,.fbx,.x3d,image/*"
          ref={linkerLeistenInputRef}
          onChange={handleLinkerLeistenFileChange}
          className="hidden"
        />
        {linkerLeistenFileName && (
          <>
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✓ Datei hochgeladen: {linkerLeistenFileName}
            </div>
            {/* Image preview with shimmer while loading */}
            <FilePreviewWithShimmer file={linkerLeistenFile} fileName={linkerLeistenFileName} />
          </>
        )}
      </div>

      {/* Right Side Upload */}
      <div className="relative">
        <Button 
          variant="outline" 
          className="justify-start cursor-pointer w-full h-12 text-base font-normal border border-black gap-3 hover:bg-gray-100"
          onClick={() => rechterLeistenInputRef.current?.click()}
        >
          <UploadCloud className="w-5 h-5" />
          {rechterLeistenFileName ? rechterLeistenFileName : "Upload 3D-Datei Rechter Leisten"}
        </Button>
        <input
          type="file"
          accept=".stl,.obj,.ply,.3ds,.dae,.fbx,.x3d,image/*"
          ref={rechterLeistenInputRef}
          onChange={handleRechterLeistenFileChange}
          className="hidden"
        />
        {rechterLeistenFileName && (
          <>
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✓ Datei hochgeladen: {rechterLeistenFileName}
            </div>
            {/* Image preview with shimmer while loading */}
            <FilePreviewWithShimmer file={rechterLeistenFile} fileName={rechterLeistenFileName} />
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
    </div>
  );
}

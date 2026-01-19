'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface BusinessAddressData {
  companyName: string;
  address: string;
}

interface BusinessAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BusinessAddressData) => void;
  savedAddress?: BusinessAddressData | null;
}

export default function BusinessAddressModal({
  isOpen,
  onClose,
  onSave,
  savedAddress,
}: BusinessAddressModalProps) {
  const [formData, setFormData] = useState<BusinessAddressData>({
    companyName: '',
    address: '',
  });

  // Load saved address when modal opens
  useEffect(() => {
    if (isOpen && savedAddress) {
      setFormData(savedAddress);
    } else if (isOpen) {
      // Reset form when modal opens without saved address
      setFormData({
        companyName: '',
        address: '',
      });
    }
  }, [isOpen, savedAddress]);

  const handleInputChange = (field: keyof BusinessAddressData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.companyName || !formData.address) {
      return;
    }

    // Just save to state, no localStorage storage
    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    // Reset to saved address on close without saving
    if (savedAddress) {
      setFormData(savedAddress);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Leisten abholen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-4">
            {/* Business Name */}
            <div>
              <Label htmlFor="companyName">Business Name *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Firmenname eingeben"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="mt-1 h-12"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                type="text"
                placeholder="Vollständige Adresse eingeben"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="mt-1 h-12"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.companyName || !formData.address}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


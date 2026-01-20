'use client';
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
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
import { getAllLocations } from '@/apis/setting/locationManagementApis';
import { createBusinessAddress, getBusinessAddress } from '@/apis/MassschuheManagemantApis';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface BusinessAddressData {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  price: number;
  addressPayload?: {
    address: string;
    description: string;
  };
}

interface LocationItem {
  id?: string;
  description?: string;
  address?: string;
  companyName?: string;
  isPrimary?: boolean;
}

interface BusinessAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BusinessAddressData) => void;
  savedAddress?: BusinessAddressData | null;
  customerId?: string | null;
  orderId?: string | null;
}

export default function BusinessAddressModal({
  isOpen,
  onClose,
  onSave,
  savedAddress,
  customerId,
  orderId,
}: BusinessAddressModalProps) {
  const [formData, setFormData] = useState<BusinessAddressData>({
    companyName: '',
    phone: '',
    email: '',
    address: '',
    price: 13,
  });
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const addressTriggerRef = useRef<HTMLDivElement | null>(null);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);
  const [emailError, setEmailError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Load saved address when modal opens
  useEffect(() => {
    if (isOpen && savedAddress) {
      setFormData({
        companyName: savedAddress.companyName ?? '',
        phone: savedAddress.phone ?? '',
        email: savedAddress.email ?? '',
        address: savedAddress.address ?? '',
        price: savedAddress.price ?? 13,
        addressPayload: savedAddress.addressPayload,
      });
    } else if (isOpen) {
      // Reset form when modal opens without saved address
      setFormData({
        companyName: '',
        phone: '',
        email: '',
        address: '',
        price: 13,
        addressPayload: undefined,
      });
    }
  }, [isOpen, savedAddress]);

  // Prefill from backend for selected customer when opening, if no savedAddress
  useEffect(() => {
    const fetchBusinessAddress = async () => {
      if (!isOpen || savedAddress || !customerId) return;
      try {
        const response = await getBusinessAddress(customerId);
        const item = Array.isArray(response?.data) ? response.data[0] : response?.data;
        if (!item) return;

        const addrObj = item.address || {};
        const description = addrObj.description || item.companyName || '';
        const addrStr = addrObj.address || '';
        const combined = description && addrStr ? `${description} - ${addrStr}` : (addrStr || description);

        setFormData((prev) => ({
          ...prev,
          companyName: item.companyName || prev.companyName || '',
          phone: item.phone || prev.phone || '',
          email: item.email || prev.email || '',
          address: combined || prev.address || '',
          price: typeof item.price === 'number' ? item.price : (prev.price || 13),
          addressPayload: addrObj.address || addrObj.description ? {
            address: addrStr,
            description,
          } : prev.addressPayload,
        }));
      } catch (error) {
        console.error('Failed to fetch business address', error);
      }
    };

    fetchBusinessAddress();
  }, [isOpen, customerId, savedAddress]);

  // Fetch locations on open
  useEffect(() => {
    const fetchLocations = async () => {
      if (!isOpen) return;
      setLocationsLoading(true);
      try {
        const response = await getAllLocations(1, 100);
        if (response?.success && Array.isArray(response?.data)) {
          setLocations(response.data);
        } else if (Array.isArray(response?.data)) {
          setLocations(response.data);
        } else {
          setLocations([]);
        }
      } catch (error) {
        console.error('Failed to fetch locations', error);
        setLocations([]);
      } finally {
        setLocationsLoading(false);
      }
    };
    fetchLocations();
  }, [isOpen]);

  const filteredLocations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return locations;
    return locations.filter((loc) => {
      const text = `${loc.description || ''} ${loc.address || ''}`.toLowerCase();
      return text.includes(term);
    });
  }, [locations, searchTerm]);

  const handleInputChange = (field: keyof BusinessAddressData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const isValidEmail = (email: string) => {
    const value = email.trim();
    if (!value) return true; // optional field
    // Simple, pragmatic validation (RFC-perfect not needed for UI validation)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSelectLocation = (loc: LocationItem) => {
    const title = loc.description || loc.companyName || '';
    const addr = loc.address || '';
    const combined = title && addr ? `${title} - ${addr}` : (title || addr);

    setFormData((prev) => ({
      ...prev,
      // Do NOT overwrite companyName; keep whatever the user entered
      address: combined || prev.address,
      addressPayload: {
        address: addr,
        description: title,
      },
    }));
    setIsAddressDropdownOpen(false);
    setSearchTerm(combined || '');
  };

  // Keep popover width equal to trigger width
  useLayoutEffect(() => {
    if (isAddressDropdownOpen && addressTriggerRef.current) {
      const rect = addressTriggerRef.current.getBoundingClientRect();
      setTriggerWidth(rect.width);
    }
  }, [isAddressDropdownOpen]);

  // Sync search term with current address when dropdown opens
  useEffect(() => {
    if (isAddressDropdownOpen) {
      setSearchTerm(formData.address || '');
    }
  }, [isAddressDropdownOpen, formData.address]);

  const handleSave = async () => {
    // Validate required fields
    if (!formData.companyName || !formData.address) {
      return;
    }

    // Validate email if provided
    if (!isValidEmail(formData.email)) {
      setEmailError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }

    // Call backend to create business address (courier-contact)
    try {
      setIsSaving(true);
      const payload: any = {
        companyName: formData.companyName,
        phone: formData.phone,
        email: formData.email,
        price: formData.price,
        address: formData.addressPayload ?? {
          address: formData.address,
          description: formData.companyName,
        },
      };
      if (customerId) {
        payload.customerId = customerId;
      }
      if (orderId) {
        payload.orderId = orderId;
      }
      await createBusinessAddress(payload);
    } catch (error) {
      console.error('Failed to create business address', error);
      // We still close modal and save locally so user flow is not blocked
    } finally {
      setIsSaving(false);
    }

    // Save to parent state (used for pricing + summary)
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

            {/* Phone */}
            <div>
              <Label htmlFor="businessPhone">Telefon</Label>
              <Input
                id="businessPhone"
                type="tel"
                placeholder="+49 12345 67890"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1 h-12"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="businessEmail">E-Mail</Label>
              <Input
                id="businessEmail"
                type="email"
                placeholder="contact@example.com"
                value={formData.email}
                onChange={(e) => {
                  const next = e.target.value;
                  if (emailError) setEmailError('');
                  handleInputChange('email', next);
                }}
                className="mt-1 h-12"
              />
              {emailError && (
                <div className="text-xs text-red-600 mt-1">{emailError}</div>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address *</Label>
              <Popover open={isAddressDropdownOpen} onOpenChange={setIsAddressDropdownOpen}>
                <PopoverTrigger asChild>
                  <div className="relative mt-1" ref={addressTriggerRef}>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Vollständige Adresse eingeben"
                      value={formData.address}
                      onChange={(e) => {
                        handleInputChange('address', e.target.value);
                        setSearchTerm(e.target.value);
                      }}
                      className="h-12 pr-10 cursor-pointer"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      aria-label="Toggle locations"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAddressDropdownOpen((v) => !v);
                      }}
                    >
                      <span className="text-gray-500 text-lg leading-none">▾</span>
                    </button>
                  </div>
                </PopoverTrigger>
            <PopoverContent
              className="p-0"
              align="start"
              sideOffset={8}
              style={{ width: triggerWidth ? `${triggerWidth}px` : undefined, minWidth: '260px' }}
            >
              <div className="p-2 border-b border-gray-100">
                <Input
                  type="text"
                  placeholder="Standort suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                  autoFocus
                />
              </div>
              <div className="max-h-56 overflow-y-auto divide-y">
                {locationsLoading && (
                  <div className="px-3 py-2 text-sm text-gray-500">Lade Standorte...</div>
                )}
                {!locationsLoading && filteredLocations.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">Keine Standorte gefunden</div>
                )}
                {!locationsLoading &&
                  filteredLocations.map((loc) => {
                    const title = loc.description || loc.companyName || 'Ohne Beschreibung';
                    const addr = loc.address || '';
                    const isSelected =
                      formData.companyName === (loc.description || loc.companyName || loc.address || '') &&
                      formData.address === (loc.address || loc.description || '');
                    return (
                      <button
                        key={`${loc.id || title}-${addr}`}
                        type="button"
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                        onClick={() => handleSelectLocation(loc)}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-800">{title}</span>
                          {addr && <span className="text-xs text-gray-600">{addr}</span>}
                        </div>
                      </button>
                    );
                  })}
              </div>
              <div className="flex justify-end gap-2 p-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  onClick={() => setIsAddressDropdownOpen(false)}
                >
                  Schließen
                </Button>
              </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="abholungPrice">Preis (Abholung) *</Label>
              <Input
                id="abholungPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="13"
                value={Number.isFinite(formData.price) ? String(formData.price) : ''}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    price: Number.isFinite(next) ? next : prev.price,
                  }));
                }}
                className="mt-1 h-12"
              />
              <div className="text-xs text-gray-500 mt-1">
                 13,00 €
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.companyName || !formData.address || !isValidEmail(formData.email)}
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


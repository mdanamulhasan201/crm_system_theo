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
import { useAuth } from '@/contexts/AuthContext';
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

interface NominatimResult {
  place_id: number;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    county?: string;
    municipality?: string;
    postcode?: string;
    country_code?: string;
    country?: string;
    road?: string;
    house_number?: string;
  };
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
  const { user } = useAuth();
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
  const hasSetPrimaryLocation = useRef<boolean>(false);
  const [nominatimResults, setNominatimResults] = useState<NominatimResult[]>([]);
  const [nominatimLoading, setNominatimLoading] = useState(false);
  const [nominatimError, setNominatimError] = useState<string | null>(null);
  const popoverContentRef = useRef<HTMLDivElement | null>(null);

  // Reset primary location flag when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      hasSetPrimaryLocation.current = false;
    }
  }, [isOpen]);

  // Load saved address when modal opens, or prefill from auth user data
  useEffect(() => {
    if (isOpen && savedAddress) {
      setFormData({
        companyName: savedAddress.companyName ?? '',
        phone: savedAddress.phone ?? '',
        email: savedAddress.email ?? '',
        address: savedAddress.address ?? '',
        price: 13, // Always use 13 as fixed price
        addressPayload: savedAddress.addressPayload,
      });
    } else if (isOpen && user) {
      // Prefill from auth user data when modal opens without saved address
      const userCompanyName = user?.busnessName ?? '';
      const userPhone = user?.phone ?? '';
      const userEmail = user?.email ?? '';
      
      // Get address from storeLocations (first location) or hauptstandort
      let userAddress = '';
      if (user?.storeLocations && user.storeLocations.length > 0) {
        const firstLocation = user.storeLocations[0];
        const addressParts = [
          firstLocation.address,
          firstLocation.description
        ].filter(Boolean);
        userAddress = addressParts.join(' - ');
      } else if (user?.hauptstandort && user.hauptstandort.length > 0) {
        userAddress = user.hauptstandort[0];
      }
      
      setFormData({
        companyName: userCompanyName,
        phone: userPhone,
        email: userEmail,
        address: userAddress,
        price: 13, // Fixed price always 13
        addressPayload: undefined,
      });
    } else if (isOpen) {
      // Reset form when modal opens without saved address and no user data
      setFormData({
        companyName: '',
        phone: '',
        email: '',
        address: '',
        price: 13, // Fixed price always 13
        addressPayload: undefined,
      });
    }
  }, [isOpen, savedAddress, user]);

  // Prefill from backend for selected customer when opening, if no savedAddress
  // OLD SYSTEM - COMMENTED OUT: Customer ID-wise data fetching disabled
  /*
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
          price: 13, // Always use fixed price 13
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
  */

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

  // Set primary location as default address when locations are loaded and no savedAddress exists
  useEffect(() => {
    if (!isOpen || savedAddress || locations.length === 0 || locationsLoading || hasSetPrimaryLocation.current) return;
    
    // Find the primary location (isPrimary: true)
    const primaryLocation = locations.find((loc) => loc.isPrimary === true);
    
    if (primaryLocation) {
      const title = primaryLocation.description || primaryLocation.companyName || '';
      const addr = primaryLocation.address || '';
      const combined = title && addr ? `${title} - ${addr}` : (title || addr);
      
      if (combined) {
        setFormData((prev) => ({
          ...prev,
          address: combined,
          addressPayload: {
            address: addr,
            description: title,
          },
        }));
        hasSetPrimaryLocation.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, isOpen, savedAddress, locationsLoading]);

  const filteredLocations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return locations;
    return locations.filter((loc) => {
      const text = `${loc.description || ''} ${loc.address || ''}`.toLowerCase();
      return text.includes(term);
    });
  }, [locations, searchTerm]);

  // Search Nominatim API when user types (similar to WohnortInput)
  useEffect(() => {
    const query = searchTerm.trim();
    
    // Don't search if dropdown is closed or query is too short
    if (!isAddressDropdownOpen || !query || query.length < 2) {
      setNominatimResults([]);
      setNominatimError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setNominatimLoading(true);
        setNominatimError(null);

        // Search Nominatim API (OpenStreetMap) for addresses in DE, IT, AT
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&extratags=1&limit=10&countrycodes=de,it,at&q=${encodeURIComponent(query)}`;

        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'MyAppName/1.0 (myemail@example.com)', // policy-compliant
          },
        });

        if (!res.ok) throw new Error('Failed to load addresses');

        const data = (await res.json()) as NominatimResult[];
        setNominatimResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Nominatim search failed', err);
        setNominatimResults([]);
        setNominatimError('Adressen konnten nicht geladen werden.');
      } finally {
        setNominatimLoading(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isAddressDropdownOpen]);

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

  const handleSelectNominatimResult = (result: NominatimResult) => {
    const fullAddress = result.display_name || '';
    
    setFormData((prev) => ({
      ...prev,
      address: fullAddress,
      addressPayload: undefined, // Nominatim results don't have structured payload
    }));
    setIsAddressDropdownOpen(false);
    setSearchTerm(fullAddress);
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

  // Close dropdown when clicking outside (both trigger and popover content)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = addressTriggerRef.current?.contains(target);
      const isInsidePopover = popoverContentRef.current?.contains(target);
      
      // Only close if click is outside both trigger and popover content
      if (!isInsideTrigger && !isInsidePopover) {
        setIsAddressDropdownOpen(false);
      }
    };

    if (isAddressDropdownOpen) {
      // Use a small delay to avoid immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isAddressDropdownOpen]);

  const handleSave = () => {
    // Validate required fields
    if (!formData.companyName || !formData.address) {
      return;
    }

    // Validate email if provided
    if (!isValidEmail(formData.email)) {
      setEmailError('Bitte eine gültige E-Mail-Adresse eingeben.');
      return;
    }

    // NO API CALL - Just save to state
    // The courier data will be sent with the final order submission
    // Save to parent state (used for pricing + summary + sending with order data)
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
          <p className='text-sm text-gray-500'>Unser Logistikpartner holt die Leisten so schnell wie möglich bei Ihnen ab.
            Bitte stellen Sie sicher, dass die Leisten verpackt und abholbereit sind.</p>
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
              <Popover 
                open={isAddressDropdownOpen} 
                onOpenChange={(open) => {
                  // We control opening/closing manually
                  // Only update state if it's different to prevent unnecessary re-renders
                  if (open !== isAddressDropdownOpen) {
                    setIsAddressDropdownOpen(open);
                  }
                }}
                modal={false}
              >
                <PopoverTrigger asChild>
                  <div className="relative mt-1" ref={addressTriggerRef}>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Vollständige Adresse eingeben oder suchen..."
                      value={formData.address}
                      onChange={(e) => {
                        handleInputChange('address', e.target.value);
                        setSearchTerm(e.target.value);
                        setIsAddressDropdownOpen(true);
                      }}
                      onFocus={() => setIsAddressDropdownOpen(true)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAddressDropdownOpen(true);
                      }}
                      className="h-12 pr-10"
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
                  ref={popoverContentRef}
                  className="p-0"
                  align="start"
                  sideOffset={8}
                  onInteractOutside={(e) => {
                    // Prevent closing when clicking on the trigger input or inside popover
                    const target = e.target as Node;
                    if (addressTriggerRef.current?.contains(target) || popoverContentRef.current?.contains(target)) {
                      e.preventDefault();
                    }
                  }}
                  onEscapeKeyDown={(e) => {
                    // Allow closing with Escape key
                    setIsAddressDropdownOpen(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ width: triggerWidth ? `${triggerWidth}px` : undefined, minWidth: '260px' }}
                >
                  <div 
                    className="p-2 border-b border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Input
                      type="text"
                      placeholder="Standort suchen..."
                      value={searchTerm}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSearchTerm(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="h-10"
                      autoFocus
                    />
                  </div>
                  <div 
                    className="max-h-56 overflow-y-auto divide-y"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {/* Store Locations Section */}
                    {locationsLoading && searchTerm.trim().length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">Lade Standorte...</div>
                    )}
                    {!locationsLoading && filteredLocations.length > 0 && (
                      <>
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <span className="text-xs font-semibold text-gray-700">Gespeicherte Standorte</span>
                        </div>
                        {filteredLocations.map((loc) => {
                          const title = loc.description || loc.companyName || 'Ohne Beschreibung';
                          const addr = loc.address || '';
                          const isSelected =
                            formData.companyName === (loc.description || loc.companyName || loc.address || '') &&
                            formData.address === (loc.address || loc.description || '');
                          return (
                            <button
                              key={`store-${loc.id || title}-${addr}`}
                              type="button"
                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50' : ''
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectLocation(loc);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800">{title}</span>
                                {addr && <span className="text-xs text-gray-600">{addr}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}

                    {/* Nominatim Search Results Section */}
                    {searchTerm.trim().length >= 2 && (
                      <>
                        {nominatimLoading && (
                          <div className="px-3 py-2 text-sm text-gray-500">Suche Adressen...</div>
                        )}
                        {!nominatimLoading && nominatimError && (
                          <div className="px-3 py-2 text-xs text-red-500">{nominatimError}</div>
                        )}
                        {!nominatimLoading && !nominatimError && nominatimResults.length > 0 && (
                          <>
                            <div className="px-3 py-2 bg-blue-50 border-b border-gray-200 border-t border-gray-200">
                              <span className="text-xs font-semibold text-blue-700">Suchergebnisse (OpenStreetMap)</span>
                            </div>
                            {nominatimResults.map((result) => {
                              const fullAddress = result.display_name || '';
                              const address = result.address || {};
                              const countryCode = (address.country_code || '').toUpperCase();
                              const cityLabel =
                                address.city ||
                                address.town ||
                                address.village ||
                                address.municipality ||
                                '';
                              const stateLabel = address.state || address.county || '';
                              const displayParts = [];
                              if (cityLabel) displayParts.push(cityLabel);
                              if (stateLabel) displayParts.push(stateLabel);
                              if (countryCode) displayParts.push(countryCode);
                              const displayLabel = displayParts.join(', ');

                              return (
                                <button
                                  key={`nominatim-${result.place_id}`}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectNominatimResult(result);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-800">
                                      {fullAddress}
                                    </span>
                                    {displayLabel && (
                                      <span className="mt-0.5 text-xs text-gray-500">
                                        {displayLabel}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </>
                        )}
                        {!nominatimLoading && !nominatimError && nominatimResults.length === 0 && filteredLocations.length === 0 && searchTerm.trim().length >= 2 && (
                          <div className="px-3 py-2 text-sm text-gray-500">Keine Ergebnisse gefunden</div>
                        )}
                      </>
                    )}

                    {/* Show default locations when no search term */}
                    {!locationsLoading && searchTerm.trim().length === 0 && filteredLocations.length === 0 && locations.length > 0 && (
                      <>
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                          <span className="text-xs font-semibold text-gray-700">Gespeicherte Standorte</span>
                        </div>
                        {locations.map((loc) => {
                          const title = loc.description || loc.companyName || 'Ohne Beschreibung';
                          const addr = loc.address || '';
                          const isSelected =
                            formData.companyName === (loc.description || loc.companyName || loc.address || '') &&
                            formData.address === (loc.address || loc.description || '');
                          return (
                            <button
                              key={`store-default-${loc.id || title}-${addr}`}
                              type="button"
                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-green-50' : ''
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectLocation(loc);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-800">{title}</span>
                                {addr && <span className="text-xs text-gray-600">{addr}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}
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

            {/* Price - Hidden field, fixed value 13 will be sent to backend */}
            {/* Price field is hidden but price: 13 is maintained in state for backend submission */}
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


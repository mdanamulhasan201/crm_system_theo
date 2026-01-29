'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useCustomerSearch } from '@/hooks/customer/useCustomerSearch';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  createdAt: string;
}

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export default function CustomerSearchModal({
  isOpen,
  onClose,
  onSelectCustomer,
  selectedCustomer,
}: CustomerSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { customers, loading, error, searchCustomers, clearCustomers } = useCustomerSearch();

  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(() => {
        searchCustomers(searchTerm);
      }, 300); 

      return () => clearTimeout(timeoutId);
    } else {
      clearCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Highlight search term in text
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Kunde auswählen</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search Input */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-opacity ${loading ? 'opacity-50' : ''}`} />
            <Input
              type="text"
              placeholder="Kunde suchen (Name, Email, Telefon)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${loading ? 'pr-10' : ''}`}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Selected Customer Display */}
          {selectedCustomer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <User className="w-4 h-4" />
                  Ausgewählter Kunde: {selectedCustomer.name}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectCustomer(null)}
                  className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                >
                  Entfernen
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto">
            {loading && searchTerm.trim() ? (
              // Skeleton Loading
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : customers.length > 0 ? (
              <>
                {/* Result Count */}
                <div className="text-sm text-gray-500 mb-3 px-1">
                  {customers.length} {customers.length === 1 ? 'Kunde gefunden' : 'Kunden gefunden'}
                </div>
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 hover:shadow-sm ${
                        selectedCustomer?.id === customer.id ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200'
                      }`}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {highlightText(customer.name, searchTerm)}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 shrink-0" />
                              <span>{highlightText(customer.email, searchTerm)}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 shrink-0" />
                                <span>{highlightText(customer.phone, searchTerm)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span>{highlightText(customer.location, searchTerm)}</span>
                            </div>
                          </div>
                        </div>
                        {selectedCustomer?.id === customer.id && (
                          <div className="text-green-600 font-medium text-sm ml-4 shrink-0">
                            ✓ Ausgewählt
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : searchTerm.trim() && !loading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto opacity-50" />
                </div>
                <p className="text-gray-500 font-medium">Keine Kunden gefunden</p>
                <p className="text-sm text-gray-400 mt-1">für "{searchTerm}"</p>
              </div>
            ) : !searchTerm.trim() ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto opacity-30" />
                </div>
                <p className="text-gray-500">Geben Sie einen Suchbegriff ein</p>
                <p className="text-sm text-gray-400 mt-1">um Kunden zu finden</p>
              </div>
            ) : null}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="cursor-pointer">
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface OtherCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerName: string) => void;
  currentValue?: string;
}

export default function OtherCustomerModal({
  isOpen,
  onClose,
  onConfirm,
  currentValue = '',
}: OtherCustomerModalProps) {
  const [customerName, setCustomerName] = useState(currentValue);

  React.useEffect(() => {
    if (isOpen) {
      setCustomerName(currentValue);
    }
  }, [isOpen, currentValue]);

  const handleConfirm = () => {
    if (customerName.trim()) {
      onConfirm(customerName.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setCustomerName(currentValue);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Anderer Kunde</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Kundenname eingeben..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="cursor-pointer">
              Abbrechen
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!customerName.trim()}
              className="cursor-pointer"
            >
              Bestätigen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


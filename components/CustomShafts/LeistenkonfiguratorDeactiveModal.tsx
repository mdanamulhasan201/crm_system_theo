'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { safeToastMessage } from '@/lib/toastUtils';
import { requestForLeistenerstellungAccess } from '@/apis/MassschuheManagemantApis';

import feetF1rstLogo from '@/public/images/FeetF1rstLogo.png';

type LeistenkonfiguratorDeactiveModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LeistenkonfiguratorDeactiveModal({
  open,
  onOpenChange,
}: LeistenkonfiguratorDeactiveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestAccess = async () => {
    setIsSubmitting(true);
    try {
      const response = await requestForLeistenerstellungAccess();
      const message =
        response?.message ?? 'Ihre Anfrage wurde erfolgreich übermittelt.';
      toast.success(message);
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? (err as Error)?.message;
      toast.error(safeToastMessage(msg) || 'Anfrage fehlgeschlagen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        <DialogTitle className="sr-only">
          Digitale Leistenerstellung – Zugang anfragen
        </DialogTitle>
        {/* Top – Image only (image already has black bg); full width */}
        <div className="w-full block">
          <Image
            width={500}
            height={100}
            src={feetF1rstLogo}
            alt="FEET F1RST"
            className="w-full h-auto object-contain block"
            priority
          />
        </div>

        {/* Main – White content */}
        <div className="bg-white px-6 py-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Die Zukunft der Leistenerstellung
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Erleben Sie die nächste Generation der Leistenerstellung. Ihre
            Leisten entstehen direkt aus Ihrem 3D-Scan – vollständig digital,
            präzise und reproduzierbar.
          </p>

          {/* Alert */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-50 border border-blue-100 p-4">
            <Shield className="h-5 w-5 text-[#62A07C] shrink-0 mt-0.5" />
            <p className="text-sm text-[#62A07C]">
              Die digitale Leistenerstellung ist aktuell nur für eine limitierte
              Anzahl an Partnern verfügbar.
            </p>
          </div>

          <p className="text-sm font-medium text-gray-800">
            Möchten Sie die Funktion aktivieren?
          </p>

          <Button
            type="button"
            onClick={handleRequestAccess}
            disabled={isSubmitting}
            className="w-full bg-[#62A07C] hover:bg-[#62A07C]/80 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Wird gesendet…
              </>
            ) : (
              <>
                Jetzt Zugang anfragen
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center pt-1">
            Nur für Kunden mit aktivem FeetF1rst 3D-Scanner verfügbar.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

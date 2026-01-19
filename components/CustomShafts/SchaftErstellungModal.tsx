'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import shoes from '@/public/snekars.png';
import clouds from '@/public/clouds.png';

interface SchaftErstellungModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect3DUpload: () => void;
  onSelectAbholung: () => void;
}

export default function SchaftErstellungModal({
  isOpen,
  onClose,
  onSelect3DUpload,
  onSelectAbholung,
}: SchaftErstellungModalProps) {
  const [loading3D, setLoading3D] = useState(false);
  const [loadingAbholung, setLoadingAbholung] = useState(false);

  const handle3DUpload = () => {
    setLoading3D(true);
    // Small delay to show loading state
    setTimeout(() => {
      onSelect3DUpload();
      onClose();
      setLoading3D(false);
    }, 300);
  };

  const handleAbholung = () => {
    setLoadingAbholung(true);
    // Small delay to show loading state
    setTimeout(() => {
      onSelectAbholung();
      onClose();
      setLoadingAbholung(false);
    }, 300);
  };

  // Reset loading states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoading3D(false);
      setLoadingAbholung(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg p-8">
        <DialogHeader className="space-y-4">
          {/* Illustration - Shoe image floating above clouds */}
          <div className="relative flex items-center justify-center my-10 ">
            {/* Clouds image as background */}
            <div className="absolute inset-0 flex items-end justify-center z-0">
              <Image
                src={clouds}
                alt="Clouds"
                width={300}
                height={150}
                className="w-64 h-auto object-contain opacity-50"
              />
            </div>
           
           
            {/* Shoe image floating above clouds */}
            <div className="relative z-20 flex items-center justify-center">
              <Image
                src={shoes}
                alt="Shoe"
                width={120}
                height={120}
                className="w-40 object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-center text-2xl md:text-3xl font-bold text-green-700 mb-2">
            SCHAFTERSTELLUNG
          </DialogTitle>

          {/* Subtitle */}
          <p className="text-center text-sm md:text-base text-gray-600 mb-6">
            Wählen Sie aus wie Sie ihren Leisten versenden werden
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button
              onClick={handle3DUpload}
              disabled={loading3D || loadingAbholung}
              className="w-full sm:flex-1 cursor-pointer bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-5 px-10 rounded-full transition-all duration-200 text-base uppercase relative overflow-hidden group border-0 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 0 25px rgba(34, 197, 94, 0.6), 0 0 50px rgba(34, 197, 94, 0.4)',
              }}
            >
              {loading3D ? (
                <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Lade...
                </span>
              ) : (
                <span className="relative z-10 tracking-wide">3D-UPLOAD</span>
              )}
            </Button>
            <Button
              onClick={handleAbholung}
              disabled={loading3D || loadingAbholung}
              className="w-full sm:flex-1 cursor-pointer bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold py-5 px-10 rounded-full transition-all duration-200 text-base uppercase relative overflow-hidden group border-0 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 0 25px rgba(34, 197, 94, 0.6), 0 0 50px rgba(34, 197, 94, 0.4)',
              }}
            >
              {loadingAbholung ? (
                <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Lade...
                </span>
              ) : (
                <span className="relative z-10 tracking-wide">ABHOLUNG</span>
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}


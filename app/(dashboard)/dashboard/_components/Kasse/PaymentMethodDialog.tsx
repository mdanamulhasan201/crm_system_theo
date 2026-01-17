"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Banknote, CreditCard, Shield } from "lucide-react";

interface PaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCash: () => void;
  onSelectCard: () => void;
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  insuranceAmount: string;
  customerPayment: string;
}

export default function PaymentMethodDialog({
  isOpen,
  onClose,
  onSelectCash,
  onSelectCard,
  orderNumber,
  customerName,
  totalAmount,
  insuranceAmount,
  customerPayment,
}: PaymentMethodDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Bezahlen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Order Details - Light Background with Border */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Auftrag</span>
              <span className="font-semibold text-gray-900">
                {orderNumber} – {customerName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gesamtbetrag</span>
              <span className="font-semibold text-gray-900">{totalAmount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-gray-500">Krankenkasse zahlt</span>
              </div>
              <span className="font-semibold text-blue-600">
                {insuranceAmount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Eigenanteil / Zuzahlung</span>
              <span className="font-semibold text-gray-900">
                {customerPayment}
              </span>
            </div>

            {/* Restbetrag Kunde - Inside the box */}
            <div className="pt-3 mt-3 border-t border-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">
                  Restbetrag Kunde
                </span>
                <span className="text-xl font-bold text-[#61A175]">
                  {customerPayment}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <p className="text-base font-semibold text-gray-900">
              Zahlungsart wählen
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-3 hover:border-[#61A175] hover:bg-gray-50 border-gray-300"
                onClick={onSelectCash}
              >
                <Banknote
                  className="w-10 h-10 text-gray-700"
                  strokeWidth={1.5}
                />
                <span className="text-base font-semibold text-gray-900">
                  Bar
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-3 hover:border-[#61A175] hover:bg-gray-50 border-gray-300"
                onClick={onSelectCard}
              >
                <CreditCard
                  className="w-10 h-10 text-gray-700"
                  strokeWidth={1.5}
                />
                <span className="text-base font-semibold text-gray-900">
                  Karte
                </span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

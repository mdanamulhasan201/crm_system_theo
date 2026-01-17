"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, Shield } from "lucide-react";

interface CashPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onComplete: () => void;
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  insuranceAmount: string;
  customerPayment: string;
  remainingAmount: number; // numeric value for calculations
}

export default function CashPaymentDialog({
  isOpen,
  onClose,
  onBack,
  onComplete,
  orderNumber,
  customerName,
  totalAmount,
  insuranceAmount,
  customerPayment,
  remainingAmount,
}: CashPaymentDialogProps) {
  const [customerGives, setCustomerGives] = useState<string>("");
  const [change, setChange] = useState<number>(0);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Calculate change whenever customer gives amount changes
  useEffect(() => {
    const givenAmount = parseFloat(customerGives) || 0;
    const changeAmount = givenAmount - remainingAmount;
    setChange(changeAmount >= 0 ? changeAmount : 0);
    setIsPaymentComplete(givenAmount >= remainingAmount);
  }, [customerGives, remainingAmount]);

  const addAmount = (amount: number) => {
    const current = parseFloat(customerGives) || 0;
    setCustomerGives((current + amount).toFixed(2));
  };

  const handleComplete = () => {
    if (isPaymentComplete) {
      onComplete();
    }
  };

  const quickAmounts = [5, 10, 20, 50, 100, 200];
  const passendClicked = () => {
    setCustomerGives(remainingAmount.toFixed(2));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Abholen & Bezahlen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Auftrag wird nach Zahlung als abgeholt markiert
            </p>
          </div>

          {/* Order Details - With Border */}
          <div className="border-2 border-gray-200 rounded-lg p-4 space-y-2">
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

            {/* Restbetrag Kunde - Inside the border */}
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

          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück</span>
          </button>

          {/* Payment Section - With Border */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-lg">💵</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                Barzahlung
              </span>
            </div>
          </div>

          {/* Customer Gives - Outside green box */}
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Kunde gibt (€)
            </label>
            <Input
              type="text"
              value={customerGives}
              onChange={(e) => setCustomerGives(e.target.value)}
              className="h-12 text-right text-xl font-semibold"
              placeholder="0,00"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-7 gap-1.5">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => addAmount(amount)}
                className="h-9 text-xs font-medium bg-white hover:bg-gray-50 hover:border-gray-400"
              >
                {amount}€
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={passendClicked}
              className="h-9 text-xs font-medium bg-white hover:bg-gray-50 hover:border-gray-400"
            >
              Passend
            </Button>
          </div>

          {/* Remaining Amount and Change */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Restbetrag</span>
              <span className="text-lg font-bold text-gray-900">
                {remainingAmount.toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Rückgeld
              </span>
              <span className="text-2xl font-bold text-[#61A175]">
                {change.toFixed(2).replace(".", ",")} €
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" className="w-full" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              className={`w-full ${
                isPaymentComplete
                  ? "bg-[#61A175] hover:bg-[#4f8a61] text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleComplete}
              disabled={!isPaymentComplete}
            >
              Zahlung abschließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

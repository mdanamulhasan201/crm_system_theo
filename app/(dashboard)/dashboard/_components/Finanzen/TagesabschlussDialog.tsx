"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, AlertTriangle } from "lucide-react";

interface TagesabschlussDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TagesabschlussDialog({
  isOpen,
  onClose,
  onConfirm,
}: TagesabschlussDialogProps) {
  // Bills
  const [bills, setBills] = useState({
    five: "0,00",
    ten: "0,00",
    twenty: "0,00",
    fifty: "0,00",
    hundred: "0,00",
    twoHundred: "0,00",
    fiveHundred: "0,00",
  });

  // Coins
  const [coins, setCoins] = useState({
    oneCent: "",
    twoCent: "",
    fiveCent: "",
    tenCent: "",
    twentyCent: "",
    fiftyCent: "",
    oneEuro: "",
    twoEuro: "",
  });

  // Summary data
  const summaryData = {
    cashIncome: "100,00",
    cardIncome: "0,00",
    totalRevenue: "100,00",
    initialBalance: "100,00",
    cashRevenue: "100,00",
    cashExpenses: "0,00",
    targetBalance: "200,00",
    actualBalance: "0,00",
    difference: "-200,00",
  };

  const handleBillChange = (key: string, value: string) => {
    setBills({ ...bills, [key]: value });
  };

  const handleCoinChange = (key: string, value: string) => {
    setCoins({ ...coins, [key]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1200px] !w-[90vw] sm:!max-w-[1200px]">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-gray-700" />
            <DialogTitle className="text-lg font-bold text-gray-900">
              Tagesabschluss
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="border border-gray-200 rounded-2xl px-3 py-1 inline-flex items-center gap-3">
              <p className="text-sm text-gray-700 font-medium">
                Donnerstag, 8. Januar 2026
              </p>
            </div>
            <p className="text-sm text-gray-600">1 Zahlungen</p>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-3">
          {/* Left Column - Kassensturz */}
          <div className="border-2 border-gray-200 rounded-lg bg-gray-50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-700" />
                <h3 className="text-base font-semibold text-gray-900">
                  Kassensturz
                </h3>
              </div>
              <span className="text-base font-bold text-gray-900">0,00 €</span>
            </div>

            {/* Scheine (Bills) */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Scheine</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "5 €", key: "five" },
                  { label: "10 €", key: "ten" },
                  { label: "20 €", key: "twenty" },
                  { label: "50 €", key: "fifty" },
                  { label: "100 €", key: "hundred" },
                  { label: "200 €", key: "twoHundred" },
                  { label: "500 €", key: "fiveHundred" },
                ].map((bill) => (
                  <div key={bill.key}>
                    <label className="text-xs text-gray-600 mb-0.5 block">
                      {bill.label}
                    </label>
                    <Input
                      type="text"
                      value={bills[bill.key as keyof typeof bills]}
                      onChange={(e) =>
                        handleBillChange(bill.key, e.target.value)
                      }
                      className="h-8 text-xs text-right"
                      placeholder="0,00 €"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Münzen (Coins) */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Münzen</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "1 Cent", key: "oneCent" },
                  { label: "2 Cent", key: "twoCent" },
                  { label: "5 Cent", key: "fiveCent" },
                  { label: "10 Cent", key: "tenCent" },
                  { label: "20 Cent", key: "twentyCent" },
                  { label: "50 Cent", key: "fiftyCent" },
                  { label: "1 €", key: "oneEuro" },
                  { label: "2 €", key: "twoEuro" },
                ].map((coin) => (
                  <div key={coin.key}>
                    <label className="text-xs text-gray-600 mb-0.5 block">
                      {coin.label}
                    </label>
                    <Input
                      type="text"
                      value={coins[coin.key as keyof typeof coins]}
                      onChange={(e) =>
                        handleCoinChange(coin.key, e.target.value)
                      }
                      className="h-8 text-xs text-right"
                      placeholder=""
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tagesübersicht */}
          <div className="border-2 border-gray-200 rounded-lg bg-white p-4 space-y-3">
            <h3 className="text-base font-semibold text-gray-900">
              Tagesübersicht
            </h3>

            {/* Einnahmen nach Zahlungsart */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-gray-700">
                Einnahmen nach Zahlungsart
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">d</span>
                  </div>
                  <span className="text-sm text-gray-700">Bar</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {summaryData.cashIncome} €
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-600 font-medium">d</span>
                  </div>
                  <span className="text-sm text-gray-700">Karte</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {summaryData.cardIncome} €
                </span>
              </div>
            </div>

            {/* Gesamtumsatz */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Gesamtumsatz
                </span>
                <span className="text-lg font-bold text-green-700">
                  {summaryData.totalRevenue} €
                </span>
              </div>
            </div>

            {/* Kassenberechnung (Bar) */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-gray-700">
                Kassenberechnung (Bar)
              </h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Anfangsbestand</span>
                  <span className="text-sm font-medium text-gray-900">
                    {summaryData.initialBalance} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">
                    + Bar-Einnahmen
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    +{summaryData.cashRevenue} €
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">- Bar-Ausgaben</span>
                  <span className="text-sm font-medium text-red-600">
                    -{summaryData.cashExpenses} €
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-semibold text-gray-900">
                    = Soll-Bestand
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {summaryData.targetBalance} €
                  </span>
                </div>
              </div>
            </div>

            {/* Soll-Ist-Vergleich */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium text-gray-700">
                Soll-Ist-Vergleich
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 mb-0.5">Soll</p>
                  <p className="text-lg font-bold text-gray-900">
                    {summaryData.targetBalance} €
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-600 mb-0.5">Ist (gezählt)</p>
                  <p className="text-lg font-bold text-gray-900">
                    {summaryData.actualBalance} €
                  </p>
                </div>
              </div>
            </div>

            {/* Differenz */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-900">
                  Differenz
                </span>
              </div>
              <p className="text-xl font-bold text-red-600 mb-0.5">
                {summaryData.difference} €
              </p>
              <p className="text-xs text-red-700">Kassenfehlbetrag</p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-3 border-t justify-end">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            className="bg-[#61A175] hover:bg-[#4f8a61] text-white"
            onClick={onConfirm}
          >
            Weiter zur Bestätigung
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

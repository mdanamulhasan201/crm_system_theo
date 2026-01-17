"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, AlertTriangle, Eye } from "lucide-react";

interface TagesdetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    date: string;
    time: string;
    user: string;
    cashAmount: string;
    cardAmount: string;
    totalRevenue: string;
    cashExpenses: string;
    difference: string;
    notes: string;
  } | null;
}

export default function TagesdetailsDialog({
  isOpen,
  onClose,
  transaction,
}: TagesdetailsDialogProps) {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[700px] !w-[90vw] sm:!max-w-[700px]">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-700" />
            <DialogTitle className="text-lg font-bold text-gray-900">
              Tagesdetails
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="border border-gray-200 rounded-2xl px-3 py-1 inline-block">
              <p className="text-sm text-gray-700 font-medium">
                {transaction.date}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Abgeschlossen um {transaction.time} von {transaction.user}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Payment Method Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">d</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Bar</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {transaction.cashAmount} €
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">d</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Karte</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {transaction.cardAmount} €
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Gesamtumsatz */}
            <div className="border border-green-200 rounded-lg bg-green-50 p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Gesamtumsatz</p>
              <p className="text-2xl font-bold text-green-700">
                {transaction.totalRevenue} €
              </p>
            </div>

            {/* Bar-Ausgaben */}
            <div className="border border-red-200 rounded-lg bg-red-50 p-4 text-center">
              <p className="text-xs text-gray-600 mb-1">Bar-Ausgaben</p>
              <p className="text-2xl font-bold text-red-600">
                {transaction.cashExpenses} €
              </p>
            </div>

            {/* Differenz */}
            <div className="border border-red-200 rounded-lg bg-red-50 p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <p className="text-xs text-gray-600">Differenz</p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {transaction.difference} €
              </p>
            </div>
          </div>

          {/* Anmerkungen */}
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Anmerkungen
            </h4>
            <p className="text-sm text-gray-700">{transaction.notes}</p>
          </div>

          {/* Zahlungen */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-gray-700" />
              <h4 className="text-sm font-semibold text-gray-900">
                Zahlungen (0)
              </h4>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-gray-500">Keine Zahlungen</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

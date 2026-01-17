"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Printer,
  Download,
  Mail,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface CashPaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProblem: () => void;
  amount: string;
  receiptNumber: string;
}

export default function CashPaymentSuccessDialog({
  isOpen,
  onClose,
  onProblem,
  amount,
  receiptNumber,
}: CashPaymentSuccessDialogProps) {
  const handlePrint = () => {
    // Placeholder for print functionality
    console.log("Print receipt");
  };

  const handlePDF = () => {
    // Placeholder for PDF functionality
    console.log("Generate PDF");
  };

  const handleEmail = () => {
    // Placeholder for email functionality
    console.log("Send email");
  };

  const handleFeedbackGood = () => {
    // Just close the dialog
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Zahlung erfolgreich
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Success Icon and Message */}
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle
                className="w-12 h-12 text-green-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Zahlung erfolgreich
            </h3>
            <p className="text-base font-bold text-gray-500 mb-1">
              {amount} <span className="text-base font-normal ">per Bar</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Beleg-Nr: {receiptNumber}
            </p>
          </div>

          {/* Receipt Options */}
          <div className="space-y-3">
            <p className="text-base font-semibold text-gray-900">Beleg</p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-gray-50"
                onClick={handlePrint}
              >
                <Printer className="w-5 h-5 text-gray-700" />
                <span className="text-sm text-gray-700">Drucken</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-gray-50"
                onClick={handlePDF}
              >
                <Download className="w-5 h-5 text-gray-700" />
                <span className="text-sm text-gray-700">PDF</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-gray-50"
                onClick={handleEmail}
              >
                <Mail className="w-5 h-5 text-gray-700" />
                <span className="text-sm text-gray-700">E-Mail</span>
              </Button>
            </div>
          </div>

          {/* Feedback Section - With Border */}
          <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
            <p className="text-base font-semibold text-gray-900">
              Hat alles gepasst?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 h-11 hover:bg-gray-50"
                onClick={handleFeedbackGood}
              >
                <ThumbsUp className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  Ja, alles gut
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 h-11 hover:bg-gray-50"
                onClick={onProblem}
              >
                <ThumbsDown className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-medium text-gray-700">
                  Nein, Problem
                </span>
              </Button>
            </div>
          </div>

          {/* Done Button */}
          <div className="pt-2">
            <Button
              className="w-full h-12 bg-[#61A175] hover:bg-[#4f8a61] text-white font-semibold"
              onClick={onClose}
            >
              Fertig
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

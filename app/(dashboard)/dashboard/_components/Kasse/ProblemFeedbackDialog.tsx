"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Printer, Download, Mail } from "lucide-react";

interface ProblemFeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  receiptNumber: string;
}

export default function ProblemFeedbackDialog({
  isOpen,
  onClose,
  amount,
  receiptNumber,
}: ProblemFeedbackDialogProps) {
  const [problem, setProblem] = useState("");

  // Reset problem text when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setProblem("");
    }
  }, [isOpen]);

  const handlePrint = () => {
    console.log("Print receipt");
  };

  const handlePDF = () => {
    console.log("Generate PDF");
  };

  const handleEmail = () => {
    console.log("Send email");
  };

  const handleSendFeedback = () => {
    console.log("Send feedback:", problem);
    setProblem("");
    onClose();
  };

  const handleCancel = () => {
    setProblem("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Zahlung erfolgreich
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* Success Icon and Message */}
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle
                className="w-10 h-10 text-green-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Zahlung erfolgreich
            </h3>
            <p className="text-base font-semibold text-gray-500">
              {amount}{" "}
              <span className="text-sm font-normal text-gray-500">per Bar</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Beleg-Nr: {receiptNumber}
            </p>
          </div>

          {/* Receipt Options */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Beleg</p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-2.5 hover:bg-gray-50"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 text-gray-700" />
                <span className="text-xs text-gray-700">Drucken</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-2.5 hover:bg-gray-50"
                onClick={handlePDF}
              >
                <Download className="w-4 h-4 text-gray-700" />
                <span className="text-xs text-gray-700">PDF</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1.5 h-auto py-2.5 hover:bg-gray-50"
                onClick={handleEmail}
              >
                <Mail className="w-4 h-4 text-gray-700" />
                <span className="text-xs text-gray-700">E-Mail</span>
              </Button>
            </div>
          </div>

          {/* Problem Feedback Section */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              Was war das Problem?
            </p>
            <Textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Beschreiben Sie das Problem..."
              className="min-h-[80px] resize-none text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-9 text-sm"
                onClick={handleCancel}
              >
                Abbrechen
              </Button>
              <Button
                className="h-9 bg-[#61A175] hover:bg-[#4f8a61] text-white text-sm"
                onClick={handleSendFeedback}
                disabled={!problem.trim()}
              >
                Feedback senden
              </Button>
            </div>
          </div>

          {/* Done Button */}
          <div className="pt-1">
            <Button
              className="w-full h-10 bg-[#61A175] hover:bg-[#4f8a61] text-white font-semibold"
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

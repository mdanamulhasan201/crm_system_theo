"use client";
import React, { useState } from "react";
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
  Loader2,
  XCircle,
} from "lucide-react";
import { submitOrderFeedback, emailReceipt, cancelReceipt } from "@/apis/pickupsApis";
import type { PosReceipt } from "@/apis/pickupsApis";
import { generateReceiptHTML, generateReceiptPDF } from "@/utils/receiptUtils";
import toast from "react-hot-toast";

interface CashPaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProblem: () => void;
  amount: string;
  receiptNumber: string;
  orderId: string;
  orderType: "insole" | "shoes";
  receipt: PosReceipt | null;
}

export default function CashPaymentSuccessDialog({
  isOpen,
  onClose,
  onProblem,
  amount,
  receiptNumber,
  orderId,
  orderType,
  receipt,
}: CashPaymentSuccessDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storniertReceipt, setStorniertReceipt] = useState<PosReceipt | null>(null);
  const [isStornierungProcessing, setIsStornierungProcessing] = useState(false);
  const [showStornoConfirm, setShowStornoConfirm] = useState(false);

  const activeReceipt = storniertReceipt ?? receipt;

  const handleStornierung = () => {
    if (!activeReceipt?.fiskalyRecordId || activeReceipt.storniert) return;
    setShowStornoConfirm(true);
  };

  const confirmStornierung = async () => {
    setShowStornoConfirm(false);
    setIsStornierungProcessing(true);
    try {
      const res = await cancelReceipt(activeReceipt!.id);
      setStorniertReceipt(res.data);
      toast.success("Beleg erfolgreich storniert");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Stornierung fehlgeschlagen";
      toast.error(msg);
    } finally {
      setIsStornierungProcessing(false);
    }
  };

  const handlePrint = () => {
    if (!activeReceipt) {
      toast.error("Kein Beleg verfügbar");
      return;
    }
    const html = generateReceiptHTML(activeReceipt);
    const printWindow = window.open("", "_blank", "width=350,height=600");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  const handlePDF = () => {
    if (!activeReceipt) {
      toast.error("Kein Beleg verfügbar");
      return;
    }
    const blob = generateReceiptPDF(activeReceipt);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Kassenbon-${receiptNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmail = async () => {
    if (!activeReceipt) {
      toast.error("Kein Beleg verfügbar");
      return;
    }
    const email = prompt("E-Mail-Adresse eingeben:");
    if (!email) return;
    try {
      await emailReceipt(activeReceipt.id, email);
      toast.success("Beleg per E-Mail gesendet");
    } catch {
      toast.error("E-Mail konnte nicht gesendet werden");
    }
  };

  const handleFeedbackGood = async () => {
    setIsSubmitting(true);
    try {
      await submitOrderFeedback(orderId, orderType, "Like");
      toast.success("Feedback gesendet");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Feedback konnte nicht gesendet werden";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4 text-gray-700" />
                )}
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

          {/* Stornierung — only visible when a fiscal receipt exists */}
          {activeReceipt?.fiskalyRecordId && (
            <div className={`rounded-lg border p-3 ${activeReceipt.storniert ? "border-red-200 bg-red-50" : "border-orange-100 bg-orange-50"}`}>
              {activeReceipt.storniert ? (
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">Beleg storniert</p>
                    {activeReceipt.storniertAt && (
                      <p className="text-xs">{new Date(activeReceipt.storniertAt).toLocaleString("de-DE")}</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-orange-800 mb-2">
                    Produkt zurückgeben / Rückgabe? Fiskalbeleg stornieren:
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-50"
                    onClick={handleStornierung}
                    disabled={isStornierungProcessing}
                  >
                    {isStornierungProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Stornierung
                  </Button>
                </>
              )}
            </div>
          )}

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

    {/* ── Stornierung confirmation dialog ── */}
    <Dialog open={showStornoConfirm} onOpenChange={() => setShowStornoConfirm(false)}>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Beleg stornieren?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-700 leading-relaxed">
            Diese Aktion kann <strong>nicht rückgängig</strong> gemacht werden. Der Beleg wird
            bei der Agenzia delle Entrate als storniert gemeldet.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowStornoConfirm(false)}
            >
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmStornierung}
            >
              Ja, stornieren
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

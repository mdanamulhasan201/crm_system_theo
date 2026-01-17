"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Lock } from "lucide-react";

interface TagesabschlussConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onConfirm: () => void;
}

export default function TagesabschlussConfirmDialog({
  isOpen,
  onClose,
  onBack,
  onConfirm,
}: TagesabschlussConfirmDialogProps) {
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[900px] !w-[85vw] sm:!max-w-[900px]">
        <DialogHeader className="border-b pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-700" />
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

        <div className="space-y-4 py-3">
          {/* Anmerkungen */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Anmerkungen (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Besondere Vorkommnisse, Erklärungen zur Differenz..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Warning Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">
                  Achtung: Tag wird gesperrt
                </h4>
                <p className="text-sm text-red-700">
                  Nach dem Abschluss können keine Änderungen mehr an den
                  heutigen Zahlungen vorgenommen werden.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-3 border-t justify-end">
          <Button variant="outline" onClick={onBack}>
            Zurück
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
            onClick={onConfirm}
          >
            <Lock className="w-4 h-4" />
            Tag abschließen & sperren
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

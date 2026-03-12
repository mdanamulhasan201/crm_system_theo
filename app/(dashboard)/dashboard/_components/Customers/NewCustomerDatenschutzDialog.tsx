"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pen, FileText, Printer, Upload, CheckCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAllLocations } from "@/apis/setting/locationManagementApis";
import toast from "react-hot-toast";

interface Location {
  id: string;
  address: string;
  description: string;
  isPrimary: boolean;
}

interface NewCustomerDatenschutzDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerData: {
    vorname: string;
    nachname: string;
  };
  onAccepted: (data: {
    acceptedPrivacy: boolean;
    wantsNewsletter: boolean;
    signature?: string;
    uploadedPdf?: File;
  }) => void;
}

export default function NewCustomerDatenschutzDialog({
  open,
  onOpenChange,
  customerData,
  onAccepted,
}: NewCustomerDatenschutzDialogProps) {
  const { user } = useAuth();
  const [showSignaturePrompt, setShowSignaturePrompt] = useState(true);
  const [needsSignature, setNeedsSignature] = useState<boolean | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [wantsNewsletter, setWantsNewsletter] = useState(false);
  const [primaryAddress, setPrimaryAddress] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Manual signature flow states
  const [hasPrinted, setHasPrinted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (needsSignature && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [needsSignature]);

  // Fetch primary address when dialog opens
  useEffect(() => {
    const fetchPrimaryAddress = async () => {
      if (open) {
        try {
          const response = await getAllLocations(1, 100);
          let locations: Location[] = [];

          if (response?.data) {
            if (Array.isArray(response.data)) {
              locations = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              locations = response.data.data;
            }
          } else if (Array.isArray(response)) {
            locations = response;
          }

          const primary = locations.find((loc) => loc.isPrimary);
          if (primary) {
            setPrimaryAddress(primary.address);
          } else if (locations.length > 0) {
            setPrimaryAddress(locations[0].address);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      }
    };

    fetchPrimaryAddress();
  }, [open]);

  const resetState = () => {
    setShowSignaturePrompt(true);
    setNeedsSignature(null);
    setAcceptedPrivacy(false);
    setWantsNewsletter(false);
    setHasSignature(false);
    setHasPrinted(false);
    setUploadedFile(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleDigitalSignature = () => {
    setNeedsSignature(true);
    setShowSignaturePrompt(false);
  };

  const handleNoSignature = () => {
    setNeedsSignature(false);
    setShowSignaturePrompt(false);
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleReset = () => {
    if (needsSignature) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      toast.success("Unterschrift zurückgesetzt");
    } else {
      setAcceptedPrivacy(false);
      setWantsNewsletter(false);
      setUploadedFile(null);
      toast.success("Auswahl zurückgesetzt");
    }
  };

  const handleSave = () => {
    if (!acceptedPrivacy) {
      toast.error(
        "Bitte bestätigen Sie, dass Sie die Datenschutzerklärung gelesen und akzeptiert haben",
      );
      return;
    }

    if (needsSignature && !hasSignature) {
      toast.error("Bitte unterschreiben Sie im Feld oben");
      return;
    }

    // For manual flow: require uploaded signed PDF
    if (needsSignature === false && !uploadedFile) {
      toast.error("Bitte laden Sie das unterschriebene PDF hoch");
      return;
    }

    // Get signature data if digital signature was used
    let signatureData: string | undefined;
    if (needsSignature && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL("image/png");
    }

    // Notify parent that privacy was accepted
    onAccepted({
      acceptedPrivacy: true,
      wantsNewsletter,
      signature: signatureData,
      uploadedPdf: uploadedFile || undefined,
    });

    onOpenChange(false);
    setTimeout(resetState, 300);
  };

  const handleBack = () => {
    if (!showSignaturePrompt) {
      setShowSignaturePrompt(true);
      setNeedsSignature(null);
      setAcceptedPrivacy(false);
      setWantsNewsletter(false);
      setHasSignature(false);
      setHasPrinted(false);
      setUploadedFile(null);
    } else {
      onOpenChange(false);
      setTimeout(resetState, 300);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept PDF and image files
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Bitte laden Sie eine PDF- oder Bilddatei hoch");
      return;
    }

    setUploadedFile(file);
    toast.success("Datei erfolgreich hochgeladen");
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getPrintHtml = () => {
    const logoHtml = user?.image
      ? `<img src="${user.image}" alt="Company Logo" style="max-width: 150px; max-height: 80px; object-fit: contain;" />`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Datenschutzhinweis für Kund:innen</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            margin: 0;
            color: #000;
            line-height: 1.6;
          }
          .header {
            background: #2C2C2C;
            color: white;
            padding: 30px;
            margin: -40px -40px 30px -40px;
            display: flex;
            justify-content: space-between;
            align-items: start;
          }
          h2 {
            font-size: 1.25rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
          }
          h3 {
            font-size: 1.125rem;
            font-weight: bold;
            margin: 25px 0 15px 0;
          }
          p {
            margin-bottom: 12px;
            font-size: 0.875rem;
          }
          ul {
            margin: 10px 0;
            padding-left: 25px;
          }
          li {
            margin-bottom: 8px;
            font-size: 0.875rem;
          }
          .section {
            margin-bottom: 25px;
          }
          .checkbox-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .signature-box {
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            height: 120px;
            background: white;
            margin-top: 10px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          @media print {
            body { padding: 20px; }
            .header { margin: -20px -20px 20px -20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="font-size: 1.125rem; font-weight: bold;">${user?.busnessName || "Firmenname"}</div>
            ${primaryAddress ? `<div style="font-size: 0.875rem; margin-top: 5px;">${primaryAddress}</div>` : ''}
          </div>
          ${logoHtml ? `<div style="background: white; padding: 10px; border-radius: 5px;">${logoHtml}</div>` : ''}
        </div>

        <h2>Datenschutzhinweis für Kund:innen</h2>
        <p style="text-align: center; font-size: 0.875rem; color: #6b7280;">(nach Art. 13 DSGVO — gültig für Deutschland & Österreich)</p>

        <div class="section">
          <h3>1. Verantwortliche Stelle</h3>
          <p>Verantwortlich für die Verarbeitung Ihrer personenbezogenen Daten ist:</p>
          <div style="margin-left: 20px;">
            <p>${user?.busnessName || "FEETF1RST VGMBH"}</p>
            <p>Pipenstrasse 5, 39031 Bruneck - Südtirol</p>
            <p>Italien</p>
            ${user?.phone ? `<p>Tel: ${user.phone}</p>` : ''}
            <p>PEC: feetfrst@legalmail.it</p>
            <p>${user?.email || "info@feetf1rst.com"}</p>
            ${user?.accountInfo?.vat_number ? `<p>USt-IdNr: ${user.accountInfo.vat_number}</p>` : ''}
          </div>
          <p>Zur technischen Umsetzung nutzen wir die Softwareplattform FeetF1rst.</p>
        </div>

        <div class="section">
          <h3>2. Welche Daten verarbeiten wir?</h3>
          <p>Wir verarbeiten nur jene Daten, die für Ihre Versorgung und die Nutzung unserer Services erforderlich sind, insbesondere:</p>
          <ul>
            <li>Kontaktdaten (Name, Adresse, Telefonnummer, E-Mail)</li>
            <li>Gesundheits- und Versorgungsdaten (Rezepte, Diagnosen, Maße, 3D-Scans)</li>
            <li>Dokumente zur Versorgung (Aufträge, Mess- und Scanprotokolle, Patientenakte)</li>
            <li>Abrechnungsdaten (Krankenkasse, Versicherungsdaten, Rechnungen)</li>
            <li>Nutzungsdaten der FeetF1rst-App (z. B. Scan-Uploads, gewählte Services, Anfragen)</li>
            <li>Kommunikationsdaten (Terminabsprachen, Rückfragen, Benachrichtigungen)</li>
          </ul>
        </div>

        <div class="section">
          <h3>3. Zweck der Verarbeitung</h3>
          <p>Ihre Daten werden verarbeitet, um:</p>
          <ul>
            <li>Ihre orthopädische bzw. medizinische Versorgung durchzuführen</li>
            <li>Hilfsmittel anzufertigen, anzupassen und zu dokumentieren</li>
            <li>3D-Scans zu speichern und für zukünftige Versorgungen zu nutzen</li>
            <li>Ihnen personalisierte Empfehlungen (z. B. Schuh-Empfehlungen, Übungspläne) bereitzustellen</li>
            <li>Ihnen einen personalisierten Zugang zur FeetF1rst-App zu ermöglichen</li>
            <li>Termine zu planen und Ihre Anfragen zu bearbeiten</li>
            <li>Leistungen abzurechnen und gesetzliche Pflichten zu erfüllen</li>
            <li>Sie — sofern gewünscht — über relevante Services oder neue Versorgungen zu informieren</li>
          </ul>
        </div>

        <div class="section">
          <h3>4. Rechtsgrundlage der Verarbeitung</h3>
          <p>Die Verarbeitung erfolgt auf Grundlage von:</p>
          <ul>
            <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
            <li>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)</li>
            <li>Art. 6 Abs. 1 lit. a DSGVO (Ihre Einwilligung), soweit erforderlich</li>
            <li>Art. 9 Abs. 2 lit. a DSGVO bei besonderen Kategorien personenbezogener Daten (ausdrückliche Einwilligung)</li>
          </ul>
        </div>

        <div class="section">
          <h3>5. Weitergabe von Daten</h3>
          <p>Ihre Daten werden nur weitergegeben, soweit dies erforderlich ist, insbesondere an:</p>
          <ul>
            <li>Krankenkassen, Versicherungen oder Kostenträger (falls zutreffend)</li>
            <li>Steuerberater, Buchhaltung oder Behörden im Rahmen gesetzlicher Pflichten</li>
            <li>Technische Dienstleister (IT, Hosting), die vertraglich zur Vertraulichkeit verpflichtet sind</li>
          </ul>
          <p>Eine Weitergabe an Dritte zu Werbezwecken erfolgt nicht.</p>
        </div>

        <div class="section">
          <h3>6. Speicherdauer</h3>
          <p>Ihre Daten werden nur so lange gespeichert, wie dies für die genannten Zwecke erforderlich ist bzw. wie es gesetzliche Aufbewahrungsfristen vorsehen.</p>
        </div>

        <div class="section">
          <h3>7. Ihre Rechte</h3>
          <p>Sie haben jederzeit das Recht auf:</p>
          <ul>
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO), soweit keine gesetzlichen Pflichten entgegenstehen</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft</li>
            <li>Beschwerde bei einer Datenschutzaufsichtsbehörde</li>
          </ul>
        </div>

        <div class="section">
          <h3>8. Einwilligung</h3>
          <p style="font-weight: 600; margin-bottom: 15px;">Ich habe die Datenschutzerklärung gelesen und bin mit der Verarbeitung meiner personenbezogenen Daten gemäß dieser Erklärung einverstanden.</p>

          <div class="checkbox-section">
            <p style="margin-bottom: 10px;">☐ Ich habe die Datenschutzerklärung gelesen und akzeptiere sie.</p>
            <p>☐ Ich möchte den Newsletter erhalten.</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="text-align: center; font-size: 0.875rem; color: #6b7280; margin-bottom: 25px;">
              Bei Fragen zum Datenschutz wenden Sie sich jederzeit an unser Team.
            </p>

            <div class="info-row">
              <div>
                <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 5px;">Name:</p>
                <p style="font-weight: 600;">${customerData?.vorname || "Miss"} ${customerData?.nachname || "Musterfrau"}</p>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 5px;">Datum:</p>
                <p style="font-weight: 600;">${new Date().toLocaleDateString("de-DE")}</p>
              </div>
            </div>

            <div>
              <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 10px;">Unterschrift</h4>
              <div class="signature-box"></div>
              <p style="font-size: 0.75rem; color: #6b7280; text-align: center; margin-top: 8px;">
                Bitte unterschreiben Sie im Feld oben
              </p>
            </div>
          </div>
        </div>

        <div style="border-top: 4px solid #2C2C2C; padding-top: 15px; margin-top: 30px; text-align: center; font-size: 0.75rem; color: #6b7280;">
          <p>PEC: feetfrst@legalmail.it &nbsp;&nbsp;&nbsp; ${user?.busnessName || "FeetF1rst VGmbH"} &nbsp;&nbsp;&nbsp; ${user?.email || "info@feetf1rst.com"}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(getPrintHtml());
    printWindow.document.close();
    setHasPrinted(true);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        setTimeout(resetState, 300);
      }
      onOpenChange(val);
    }}>
      <DialogContent
        className={
          showSignaturePrompt
            ? "max-w-md"
            : needsSignature
              ? "max-w-2xl"
              : "max-w-2xl"
        }
      >
        {(showSignaturePrompt || needsSignature || needsSignature === false) && (
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-semibold text-center">
              Datenschutzerklärung
            </DialogTitle>
          </DialogHeader>
        )}

        {showSignaturePrompt ? (
          // Initial Signature Prompt
          <div className="space-y-4 py-4 px-6">
            <p className="text-sm text-gray-600 mb-6">
              Soll die Datenschutzerklärung digital unterzeichnet werden?
            </p>

            <button
              onClick={handleDigitalSignature}
              className="w-full p-4 bg-[#61A07B] hover:bg-[#528c68] text-white rounded-lg flex items-start gap-3 cursor-pointer transition-colors"
            >
              <Pen className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Ja, digital unterschreiben</p>
                <p className="text-sm text-white/90">
                  Unterschrift direkt im System erfassen
                </p>
              </div>
            </button>

            <button
              onClick={handleNoSignature}
              className="w-full p-4 border-2 border-gray-300 hover:bg-gray-50 rounded-lg flex items-start gap-3 cursor-pointer transition-colors"
            >
              <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold">
                  Nein, manuell unterschreiben
                </p>
                <p className="text-sm text-gray-600">
                  PDF drucken, unterschreiben und hochladen
                </p>
              </div>
            </button>
          </div>
        ) : needsSignature ? (
          // Digital Signature View
          <div className="space-y-6 py-4 px-6 pb-6">
            {/* Customer Info and Date */}
            <div className="flex justify-between items-start px-2 py-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name:</p>
                <p className="font-semibold text-gray-900">
                  {customerData?.vorname || "Miss"}{" "}
                  {customerData?.nachname || "Musterfrau"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Datum:</p>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString("de-DE")}
                </p>
              </div>
            </div>

            {/* Confirmation Text and Checkboxes */}
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-medium mb-3">
                Mit Ihrer Auswahl bestätigen Sie den Datenschutz.
              </p>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 cursor-pointer accent-[#61A07B]"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Ich habe die Datenschutzerklärung gelesen und akzeptiere sie.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={wantsNewsletter}
                  onChange={(e) => setWantsNewsletter(e.target.checked)}
                  className="mt-0.5 w-4 h-4 cursor-pointer accent-[#61A07B]"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Ich möchte den Newsletter erhalten.
                </span>
              </label>
            </div>

            {/* Signature Section */}
            <div className="px-2">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Unterschrift
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={200}
                  className="w-full h-[200px] touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Bitte unterschreiben Sie im Feld oben
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="cursor-pointer px-6"
              >
                Zurücksetzen
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#61A07B] hover:bg-[#528c68] text-white cursor-pointer px-6"
              >
                Speichern & erstellen
              </Button>
            </div>

            {/* Back Link */}
            <div className="text-center pt-2">
              <button
                onClick={handleBack}
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Zurück
              </button>
            </div>
          </div>
        ) : (
          // Manual Signature Flow: Print PDF → Upload signed PDF
          <div className="space-y-6 py-4 px-6 pb-6">
            {/* Customer Info and Date */}
            <div className="flex justify-between items-start px-2 py-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Name:</p>
                <p className="font-semibold text-gray-900">
                  {customerData?.vorname || "Miss"}{" "}
                  {customerData?.nachname || "Musterfrau"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Datum:</p>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString("de-DE")}
                </p>
              </div>
            </div>

            {/* Step 1: Download/Print PDF */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${hasPrinted ? 'bg-[#61A07B] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {hasPrinted ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Datenschutzerklärung drucken
                  </p>
                  <p className="text-xs text-gray-500">
                    Drucken Sie das PDF aus und lassen Sie es vom Kunden unterschreiben
                  </p>
                </div>
              </div>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="cursor-pointer ml-11 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                {hasPrinted ? 'Erneut drucken' : 'PDF drucken'}
              </Button>
            </div>

            {/* Step 2: Upload signed PDF */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${uploadedFile ? 'bg-[#61A07B] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {uploadedFile ? <CheckCircle className="w-5 h-5" /> : '2'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Unterschriebenes PDF hochladen
                  </p>
                  <p className="text-xs text-gray-500">
                    Laden Sie das unterschriebene Dokument hoch (PDF oder Bild)
                  </p>
                </div>
              </div>

              <div className="ml-11">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#61A07B] hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="text-sm text-gray-600 font-medium">
                      Klicken Sie hier zum Hochladen
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, PNG oder JPG
                    </p>
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#61A07B]" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1 hover:bg-green-100 rounded cursor-pointer"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Confirm */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${acceptedPrivacy ? 'bg-[#61A07B] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {acceptedPrivacy ? <CheckCircle className="w-5 h-5" /> : '3'}
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Bestätigung
                </p>
              </div>
              <div className="ml-11 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-0.5 w-4 h-4 cursor-pointer accent-[#61A07B]"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Ich habe die Datenschutzerklärung gelesen und akzeptiere sie.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={wantsNewsletter}
                    onChange={(e) => setWantsNewsletter(e.target.checked)}
                    className="mt-0.5 w-4 h-4 cursor-pointer accent-[#61A07B]"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    Ich möchte den Newsletter erhalten.
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 pt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="cursor-pointer px-6"
              >
                Zurücksetzen
              </Button>
              <Button
                onClick={handleSave}
                disabled={!uploadedFile || !acceptedPrivacy}
                className="bg-[#61A07B] hover:bg-[#528c68] text-white cursor-pointer px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Speichern & erstellen
              </Button>
            </div>

            {/* Back Link */}
            <div className="text-center pt-2">
              <button
                onClick={handleBack}
                className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer underline"
              >
                Zurück
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

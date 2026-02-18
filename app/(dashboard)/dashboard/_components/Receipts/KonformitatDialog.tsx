"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getAllLocations } from "@/apis/setting/locationManagementApis";
import { Printer } from "lucide-react";
import Image from "next/image";

interface KonformitatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerData?: any;
}

interface Location {
  id: string;
  address: string;
  description: string;
  isPrimary: boolean;
}

export default function KonformitatDialog({
  open,
  onOpenChange,
  customerData,
}: KonformitatDialogProps) {
  const { user } = useAuth();
  const [primaryAddress, setPrimaryAddress] = useState<string>("");

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

  const companyName = user?.busnessName || "Firma";
  const customerAddress = customerData?.wohnort || customerData?.straße || "";
  const currentDate = new Date().toLocaleDateString("de-DE");

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const logoHtml = user?.image
      ? `<img src="${user.image}" alt="Company Logo" style="max-width: 150px; max-height: 80px; object-fit: contain;" />`
      : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lieferschein & Konformitätserklärung</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            margin: 0;
            color: #000;
            line-height: 1.6;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2C2C2C;
          }
          h2 {
            font-size: 1.125rem;
            font-weight: bold;
            margin: 25px 0 15px 0;
            color: #2C2C2C;
            border-bottom: 2px solid #6B9B87;
            padding-bottom: 5px;
          }
          .section {
            margin-bottom: 30px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #6B9B87;
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: 600;
            min-width: 180px;
            color: #374151;
          }
          .info-value {
            color: #1f2937;
          }
          .checkbox-group {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin: 10px 0;
          }
          .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
            margin: 0 10px;
          }
          .declaration-text {
            background: #fff;
            padding: 15px;
            border-left: 3px solid #2C2C2C;
            margin: 15px 0;
            font-size: 0.9rem;
          }
          ul {
            margin: 10px 0;
            padding-left: 25px;
          }
          li {
            margin-bottom: 8px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoHtml}
          <div style="text-align: right;">
            <div style="font-size: 1.25rem; font-weight: bold; color: #2C2C2C;">Lieferschein & Konformitätserklärung</div>
            <div style="font-size: 0.9rem; color: #6B7280; margin-top: 5px;">Sonderanfertigung gemäß MDR</div>
          </div>
        </div>

        <div class="section">
          <h2>Hersteller / Leistungserbringer</h2>
          <div class="info-row">
            <span class="info-label">Firma:</span>
            <span class="info-value">${companyName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Adresse:</span>
            <span class="info-value">${primaryAddress || 'Adresse nicht verfügbar'}</span>
          </div>
        </div>

        <div class="section">
          <h2>Patient</h2>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${customerData?.vorname || 'Patient'} ${customerData?.nachname || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Geburtsdatum:</span>
            <span class="info-value">${customerData?.geburtsdatum ? new Date(customerData.geburtsdatum).toLocaleDateString('de-DE') : 'Geburtsdatum'}</span>
          </div>
          ${customerAddress ? `
            <div class="info-row">
              <span class="info-label">Adresse:</span>
              <span class="info-value">${customerAddress}</span>
            </div>
          ` : ''}
        </div>

        <div class="section">
          <h2>Produkt</h2>
          <div class="info-row">
            <span class="info-label">Bezeichnung:</span>
            <span class="info-value">Orthopädische Einlagen (Sonderanfertigung)</span>
          </div>
          <div class="checkbox-group">
            <div class="checkbox-item">
              <input type="checkbox" checked /> <span>Einlage</span>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" /> <span>Kompressionsstrumpf</span>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" /> <span>Maßschuh</span>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" /> <span>Sonstiges: _______</span>
            </div>
          </div>
          <div class="info-row">
            <span class="info-label">Auftragsnr:</span>
            <span class="info-value">${customerData?.customerNumber || customerData?.id || '---'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Herstellungsdatum:</span>
            <span class="info-value">${currentDate}</span>
          </div>
        </div>

        <div class="section">
          <h2>Konformitätserklärung</h2>
          <div class="declaration-text">
            Wir erklären hiermit in alleiniger Verantwortung, dass das oben genannte Medizinprodukt als Sonderanfertigung gemäß Art. 2 und Anhang XIII der Verordnung (EU) 2017/745 (MDR) für die genannte Person hergestellt wurde und den grundlegenden Sicherheits- und Leistungsanforderungen entspricht.
          </div>
          <div style="margin-top: 30px;">
            <strong>Datum:</strong> ${currentDate}<br/>
            <strong>Unterschrift Hersteller / Verantwortliche Person:</strong> <span class="signature-line"></span>
          </div>
        </div>

        <div class="section">
          <h2>Übergabe & Einweisung</h2>
          <p style="font-weight: 600; margin-bottom: 10px;">Der/die Patient:in bestätigt hiermit:</p>
          <ul>
            <li>das oben genannte Produkt erhalten zu haben,</li>
            <li>in Gebrauch, Pflege und Wartung durch geschultes Fachpersonal eingewiesen worden zu sein,</li>
            <li>und die Hinweise verstanden zu haben.</li>
          </ul>
          <div style="margin-top: 30px;">
            <div style="margin-bottom: 15px;">
              <strong>Unterschrift Patient:in:</strong> <span class="signature-line"></span>
              <strong>Datum:</strong> <span class="signature-line" style="min-width: 120px;"></span>
            </div>
            <div>
              <strong>Unterschrift Einweisende Person:</strong> <span class="signature-line"></span>
              <strong>Datum:</strong> <span class="signature-line" style="min-width: 120px;"></span>
            </div>
          </div>
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
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Lieferschein & Konformitätserklärung
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Header with Logo */}
          <div className="flex justify-between items-center pb-6 border-b-2 border-gray-800">
            {user?.image && (
              <div className="relative w-32 h-16">
                <Image
                  src={user.image}
                  alt="Company Logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-right">
              <p className="text-sm text-gray-600">Sonderanfertigung gemäß MDR</p>
              <p className="text-xs text-gray-500 mt-1">Datum: {currentDate}</p>
            </div>
          </div>

          {/* Hersteller Section */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Hersteller / Leistungserbringer</h3>
            <div className="space-y-2 text-sm">
              <div className="flex"><span className="font-semibold w-32">Firma:</span><span>{companyName}</span></div>
              <div className="flex"><span className="font-semibold w-32">Adresse:</span><span>{primaryAddress || "Adresse nicht verfügbar"}</span></div>
            </div>
          </div>

          {/* Patient Section */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Patient</h3>
            <div className="space-y-2 text-sm">
              <div className="flex"><span className="font-semibold w-32">Name:</span><span>{customerData?.vorname || "Patient"} {customerData?.nachname || ""}</span></div>
              <div className="flex"><span className="font-semibold w-32">Geburtsdatum:</span><span>{customerData?.geburtsdatum ? new Date(customerData.geburtsdatum).toLocaleDateString("de-DE") : "Geburtsdatum"}</span></div>
              {customerAddress && <div className="flex"><span className="font-semibold w-32">Adresse:</span><span>{customerAddress}</span></div>}
            </div>
          </div>

          {/* Product Section */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Produkt</h3>
            <div className="space-y-3 text-sm">
              <div className="flex"><span className="font-semibold w-32">Bezeichnung:</span><span>Orthopädische Einlagen (Sonderanfertigung)</span></div>
              <div className="flex gap-3 flex-wrap items-center">
                <span className="font-semibold">Art:</span>
                <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked className="w-4 h-4" /><span>Einlage</span></label>
                <label className="flex items-center gap-1.5"><input type="checkbox" className="w-4 h-4" /><span>Kompressionsstrumpf</span></label>
                <label className="flex items-center gap-1.5"><input type="checkbox" className="w-4 h-4" /><span>Maßschuh</span></label>
                <label className="flex items-center gap-1.5"><input type="checkbox" className="w-4 h-4" /><span>Sonstiges:</span></label>
              </div>
              <div className="flex"><span className="font-semibold w-32">Auftragsnr:</span><span>{customerData?.customerNumber || customerData?.id || "---"}</span></div>
              <div className="flex"><span className="font-semibold w-32">Herstellungsdatum:</span><span>{currentDate}</span></div>
            </div>
          </div>

          {/* Declaration Section */}
          <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-gray-800">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Konformitätserklärung</h3>
            <p className="text-sm leading-relaxed mb-4">
              Wir erklären hiermit in alleiniger Verantwortung, dass das oben genannte Medizinprodukt als Sonderanfertigung gemäß Art. 2 und Anhang XIII der Verordnung (EU) 2017/745 (MDR) für die genannte Person hergestellt wurde und den grundlegenden Sicherheits- und Leistungsanforderungen entspricht.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-300">
              <p className="text-sm mb-2"><span className="font-semibold">Datum:</span> {currentDate}</p>
              <p className="text-sm">Unterschrift Hersteller / Verantwortliche Person: ____________________</p>
            </div>
          </div>

          {/* Handover Section */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Übergabe & Einweisung</h3>
            <p className="text-sm font-semibold mb-2">Der/die Patient:in bestätigt hiermit:</p>
            <ul className="text-sm space-y-1 pl-5 list-disc mb-4">
              <li>das oben genannte Produkt erhalten zu haben,</li>
              <li>in Gebrauch, Pflege und Wartung durch geschultes Fachpersonal eingewiesen worden zu sein,</li>
              <li>und die Hinweise verstanden zu haben.</li>
            </ul>
            <div className="space-y-2 text-sm mt-4 pt-4 border-t border-gray-300">
              <p>Unterschrift Patient:in: ____________________ Datum: _________</p>
              <p>Unterschrift Einweisende Person: ____________________ Datum: _________</p>
            </div>
          </div>

          {/* Print Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handlePrint}
              className="bg-[#61A07B] hover:bg-[#528c68] text-white px-6 py-2 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              PDF drucken
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

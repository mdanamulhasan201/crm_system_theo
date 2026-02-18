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

interface MehrkostenVereinbarungDialogProps {
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

export default function MehrkostenVereinbarungDialog({
  open,
  onOpenChange,
  customerData,
}: MehrkostenVereinbarungDialogProps) {
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
        <title>Mehrkosten-Vereinbarung</title>
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
          .signature-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 200px;
            margin: 0 10px;
          }
          .highlight-box {
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
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #f3f4f6;
            font-weight: 600;
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
            <div style="font-size: 1.25rem; font-weight: bold; color: #2C2C2C;">Mehrkosten-Vereinbarung</div>
            <div style="font-size: 0.9rem; color: #6B7280; margin-top: 5px;">gemäß Hilfsmittelversorgung</div>
          </div>
        </div>

        <div class="section">
          <h2>Leistungserbringer</h2>
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
          <h2>Versicherte Person / Patient:in</h2>
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
          <h2>Vereinbarung über Mehrkosten</h2>
          <div class="highlight-box">
            <p style="margin-bottom: 10px;">
              Der/die Patient:in wünscht ausdrücklich eine Versorgung, die über das medizinisch Notwendige bzw. das von der gesetzlichen Krankenversicherung (GKV) vorgesehene Versorgungsmaß hinausgeht.
            </p>
            <p>
              Die entstehenden <strong>Mehrkosten</strong> werden hiermit transparent dargelegt und sind vom/von der Versicherten selbst zu tragen.
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Beschreibung</th>
                <th>Betrag (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Mehraufwand Material / Design</td>
                <td>_____________</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Zusätzliche Anpassungen</td>
                <td>_____________</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Sonstige Mehrleistungen</td>
                <td>_____________</td>
              </tr>
              <tr style="font-weight: bold; background: #f9fafb;">
                <td colspan="2">Gesamte Mehrkosten</td>
                <td>_____________</td>
              </tr>
            </tbody>
          </table>

          <p style="font-size: 0.85rem; margin-top: 15px; color: #4b5563;">
            <strong>Hinweis:</strong> Die gesetzliche Krankenversicherung übernimmt die Kosten für die medizinisch notwendige Versorgung. Die hier aufgeführten Mehrkosten sind privatrechtlich zu zahlen.
          </p>
        </div>

        <div class="section">
          <h2>Zahlungsbedingungen</h2>
          <ul style="font-size: 0.9rem;">
            <li>Die Mehrkosten sind nach Fertigstellung und vor Übergabe zu entrichten.</li>
            <li>Zahlungsfrist: 14 Tage nach Rechnungsstellung.</li>
            <li>Bei verspäteter Zahlung werden Verzugszinsen gemäß § 288 BGB berechnet.</li>
          </ul>
        </div>

        <div class="section">
          <h2>Einverständniserklärung</h2>
          <div class="highlight-box">
            <p style="font-weight: 600; margin-bottom: 10px;">Hiermit bestätige ich:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>über die entstehenden Mehrkosten aufgeklärt worden zu sein,</li>
              <li>die oben genannten Mehrkosten zur Kenntnis genommen zu haben,</li>
              <li>diese Mehrkosten selbst zu tragen und fristgerecht zu bezahlen.</li>
            </ul>
          </div>

          <div style="margin-top: 30px;">
            <div style="margin-bottom: 20px;">
              <strong>Ort, Datum:</strong> <span class="signature-line" style="min-width: 250px;"></span>
            </div>
            <div style="margin-bottom: 20px;">
              <strong>Unterschrift Patient:in:</strong> <span class="signature-line"></span>
            </div>
            <div>
              <strong>Unterschrift Leistungserbringer:</strong> <span class="signature-line"></span>
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 0.75rem; color: #6b7280;">
          <p><strong>Rechtliche Grundlagen:</strong></p>
          <p>§ 33 SGB V (Hilfsmittelversorgung), § 12 SGB V (Wirtschaftlichkeitsgebot), Hilfsmittel-Richtlinie des G-BA</p>
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
            Mehrkosten-Vereinbarung
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
              <p className="text-sm text-gray-600">gemäß Hilfsmittelversorgung</p>
              <p className="text-xs text-gray-500 mt-1">Datum: {currentDate}</p>
            </div>
          </div>

          {/* Leistungserbringer Section */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Leistungserbringer</h3>
            <div className="space-y-2 text-sm">
              <div className="flex"><span className="font-semibold w-32">Firma:</span><span>{companyName}</span></div>
              <div className="flex"><span className="font-semibold w-32">Adresse:</span><span>{primaryAddress || "Adresse nicht verfügbar"}</span></div>
            </div>
          </div>

          {/* Patient Section */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Versicherte Person / Patient:in</h3>
            <div className="space-y-2 text-sm">
              <div className="flex"><span className="font-semibold w-32">Name:</span><span>{customerData?.vorname || "Patient"} {customerData?.nachname || ""}</span></div>
              <div className="flex"><span className="font-semibold w-32">Geburtsdatum:</span><span>{customerData?.geburtsdatum ? new Date(customerData.geburtsdatum).toLocaleDateString("de-DE") : "Geburtsdatum"}</span></div>
              {customerAddress && <div className="flex"><span className="font-semibold w-32">Adresse:</span><span>{customerAddress}</span></div>}
            </div>
          </div>

          {/* Agreement Section */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Vereinbarung über Mehrkosten</h3>
            <div className="bg-white p-4 border-l-2 border-gray-800 mb-4">
              <p className="text-sm mb-2">
                Der/die Patient:in wünscht ausdrücklich eine Versorgung, die über das medizinisch Notwendige bzw. das von der gesetzlichen Krankenversicherung (GKV) vorgesehene Versorgungsmaß hinausgeht.
              </p>
              <p className="text-sm">
                Die entstehenden <strong>Mehrkosten</strong> werden hiermit transparent dargelegt und sind vom/von der Versicherten selbst zu tragen.
              </p>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Position</th>
                  <th className="border border-gray-300 p-2 text-left">Beschreibung</th>
                  <th className="border border-gray-300 p-2 text-left">Betrag (€)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">1</td>
                  <td className="border border-gray-300 p-2">Mehraufwand Material / Design</td>
                  <td className="border border-gray-300 p-2">_____________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">2</td>
                  <td className="border border-gray-300 p-2">Zusätzliche Anpassungen</td>
                  <td className="border border-gray-300 p-2">_____________</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">3</td>
                  <td className="border border-gray-300 p-2">Sonstige Mehrleistungen</td>
                  <td className="border border-gray-300 p-2">_____________</td>
                </tr>
                <tr className="font-bold bg-gray-50">
                  <td className="border border-gray-300 p-2" colSpan={2}>Gesamte Mehrkosten</td>
                  <td className="border border-gray-300 p-2">_____________</td>
                </tr>
              </tbody>
            </table>

            <p className="text-xs mt-3 text-gray-600">
              <strong>Hinweis:</strong> Die gesetzliche Krankenversicherung übernimmt die Kosten für die medizinisch notwendige Versorgung. Die hier aufgeführten Mehrkosten sind privatrechtlich zu zahlen.
            </p>
          </div>

          {/* Payment Terms */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-[#6B9B87]">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Zahlungsbedingungen</h3>
            <ul className="text-sm space-y-2 pl-5 list-disc">
              <li>Die Mehrkosten sind nach Fertigstellung und vor Übergabe zu entrichten.</li>
              <li>Zahlungsfrist: 14 Tage nach Rechnungsstellung.</li>
              <li>Bei verspäteter Zahlung werden Verzugszinsen gemäß § 288 BGB berechnet.</li>
            </ul>
          </div>

          {/* Consent Section */}
          <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-gray-800">
            <h3 className="text-lg font-bold mb-3 text-gray-800">Einverständniserklärung</h3>
            <div className="bg-white p-4 border-l-2 border-gray-800 mb-4">
              <p className="text-sm font-semibold mb-2">Hiermit bestätige ich:</p>
              <ul className="text-sm space-y-1 pl-5 list-disc">
                <li>über die entstehenden Mehrkosten aufgeklärt worden zu sein,</li>
                <li>die oben genannten Mehrkosten zur Kenntnis genommen zu haben,</li>
                <li>diese Mehrkosten selbst zu tragen und fristgerecht zu bezahlen.</li>
              </ul>
            </div>

            <div className="space-y-3 text-sm mt-4 pt-4 border-t border-gray-300">
              <p>Ort, Datum: _________________________________</p>
              <p>Unterschrift Patient:in: ____________________</p>
              <p>Unterschrift Leistungserbringer: ____________________</p>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-gray-100 p-4 rounded text-xs text-gray-600">
            <p className="font-semibold mb-1">Rechtliche Grundlagen:</p>
            <p>§ 33 SGB V (Hilfsmittelversorgung), § 12 SGB V (Wirtschaftlichkeitsgebot), Hilfsmittel-Richtlinie des G-BA</p>
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

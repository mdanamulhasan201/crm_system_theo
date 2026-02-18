"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Share2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { getAllLocations } from "@/apis/setting/locationManagementApis";

interface RechnungDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerData?: any;
  rechnungData?: any;
}

interface Location {
  id: string;
  address: string;
  description: string;
  isPrimary: boolean;
}

export default function RechnungDialog({
  open,
  onOpenChange,
  customerData,
  rechnungData,
}: RechnungDialogProps) {
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
  const companyEmail = user?.email || "info@firma.com";
  const lineItems = rechnungData?.lineItems || [];
  const totals = rechnungData?.totals || { zwischensumme: "0.00", mwst: "0.00", gesamtsumme: "0.00" };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const subject = encodeURIComponent(
      `Rechnung für ${customerData?.vorname || ""} ${customerData?.nachname || ""}`,
    );
    const body = encodeURIComponent(
      `Sehr geehrte/r ${customerData?.vorname || ""} ${customerData?.nachname || ""},\n\nanbei erhalten Sie Ihre Rechnung.\n\nMit freundlichen Grüßen\n${companyName}`,
    );
    window.location.href = `mailto:${customerData?.email || ""}?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Rechnung (Firma)</DialogTitle>
        </DialogHeader>

        {/* Green Header Section */}
        <div className="bg-[#5BA888] text-white p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/30 pb-4">
            <div className="flex items-center gap-2">
              {user?.image ? (
                <div className="relative w-32 h-16">
                  <Image
                    src={user.image}
                    alt="Company Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-2xl font-bold">{companyName}</div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">Rechnung Nr. {Math.floor(Math.random() * 10000)}</p>
            </div>
          </div>

          {/* Company and Date Info */}
          <div className="flex justify-between text-sm">
            <div>
              {primaryAddress && <p>{primaryAddress}</p>}
              <p>{companyEmail}</p>
            </div>
            <div className="text-right">
              <p>
                <span className="font-semibold">Datum:</span>{" "}
                {new Date().toLocaleDateString("de-DE")}
              </p>
              <p>
                <span className="font-semibold">Gültig bis:</span>{" "}
                {new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000,
                ).toLocaleDateString("de-DE")}
              </p>
            </div>
          </div>
        </div>

        {/* White Content Section */}
        <div className="bg-white p-6 space-y-6">
          {/* Customer Section */}
          <div className="flex justify-between border-l-4 border-[#5BA888] pl-4">
            <div>
              <p className="font-bold mb-2">KUNDEN</p>
              <p className="text-sm">
                {customerData?.vorname || "Kunde"}{" "}
                {customerData?.nachname || ""}
              </p>
              {customerData?.straße && (
                <p className="text-sm">{customerData.straße}</p>
              )}
              {(customerData?.ort || customerData?.wohnort) && (
                <p className="text-sm">{customerData.ort || customerData.wohnort}</p>
              )}
              {customerData?.land && (
                <p className="text-sm">{customerData.land}</p>
              )}
              {(customerData?.telefonnummer || customerData?.telefon) && (
                <p className="text-sm">
                  {customerData.telefonnummer || customerData.telefon}
                </p>
              )}
            </div>
          </div>

          {/* Services Table */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-bold">BESCHREIBUNG</th>
                  <th className="text-center p-3 font-bold">ANZAHL</th>
                  <th className="text-right p-3 font-bold">PREIS</th>
                  <th className="text-center p-3 font-bold">MwSt.</th>
                  <th className="text-right p-3 font-bold">SUMME</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length > 0 ? (
                  lineItems.map((item: any, index: number) => (
                    <tr key={item.id || index} className="border-b border-gray-200">
                      <td className="p-3">{item.beschreibung}</td>
                      <td className="text-center p-3">{item.menge}</td>
                      <td className="text-right p-3">{item.einzelpreis.toFixed(2)} €</td>
                      <td className="text-center p-3">{item.mwst}</td>
                      <td className="text-right p-3">
                        {(item.menge * item.einzelpreis).toFixed(2)} €
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-gray-200">
                    <td className="p-3" colSpan={5}>
                      Keine Positionen vorhanden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Terms and Totals */}
          <div className="flex justify-between gap-6">
            <div className="w-1/2 text-xs">
              <p className="font-bold mb-2">ALLGEMEINE GESCHÄFTSBEDINGUNGEN</p>
              <ul className="space-y-1 text-gray-700">
                <li>
                  • Die oben genannten Informationen sind keine Rechnung,
                  sondern eine Schätzung von Waren/Dienstleistungen.
                </li>
                <li>
                  • Die Zahlung wird vor der Bereitstellung oder Lieferung von
                  Waren/Dienstleistungen fällig
                </li>
              </ul>
            </div>
            <div className="w-1/3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ZWISCHEN-SUMME:</span>
                  <span className="font-bold">{totals.zwischensumme} €</span>
                </div>
                <div className="flex justify-between">
                  <span>MwSt.:</span>
                  <span className="font-bold">{totals.mwst} €</span>
                </div>
                <div className="flex justify-between">
                  <span>SONSTIGES:</span>
                  <span className="font-bold">0 €</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t-2 border-gray-300">
                  <span className="font-bold">GESAMT-SUMME</span>
                  <span className="font-bold">{totals.gesamtsumme} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="pt-4">
            <p className="text-center mb-6 text-sm">
              Bitte bestätige deine Zustimmung zu diesem Angebot:
            </p>
            <div className="flex justify-between items-end gap-6">
              <div className="flex-1">
                <div className="border-b-2 border-gray-400 pb-2 mb-1"></div>
                <span className="text-xs text-gray-500">
                  Unterschrift über gedruckten Namen
                </span>
              </div>
              <div className="w-1/3">
                <div className="border-b-2 border-gray-400 pb-2 mb-1"></div>
                <span className="text-xs text-gray-500">Datum</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Drucken
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Teilen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

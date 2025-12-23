// components/ScansPromoted.tsx
import React from "react";
import Image from "next/image";
import legImage from "@/public/Kunden/legs.png";
import { ScanData } from "@/types/scan";
import { useRouter } from "next/navigation";

interface ScansPromotedProps {
    customerData: ScanData | null;
}

export default function ScansPromoted({ customerData }: ScansPromotedProps) {
    const router = useRouter();

    // Format date from ISO string to DD.MM.YYYY format
    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch {
            return dateString;
        }
    };

    // Extract location from wohnort (e.g., "Ahrntalerstrasse 28, Bruneck, Südtirol, Italien" -> "Bruneck")
    const getLocation = (wohnort: string | undefined): string => {
        if (!wohnort) return "N/A";
        const parts = wohnort.split(',');
        return parts.length > 1 ? parts[1].trim() : wohnort;
    };

    if (!customerData) {
        return (
            <div className="py-8 px-4 md:px-10">
                <h1 className="text-2xl font-bold capitalize">DURCHGEFÜHRTE SCANS</h1>
                <p className="text-gray-600 mt-4">No customer data available</p>
            </div>
        );
    }

    const screenerFiles = customerData.screenerFile || [];
    const customerName = `${customerData.vorname || ''} ${customerData.nachname || ''}`.trim();

    if (screenerFiles.length === 0) {
        return (
            <div className="py-8 px-4 md:px-10">
                <h1 className="text-2xl font-bold capitalize">DURCHGEFÜHRTE SCANS</h1>
                <p className="text-gray-600 mt-4">No scans available</p>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 md:px-10">
            <h1 className="text-2xl font-bold capitalize">DURCHGEFÜHRTE SCANS</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {screenerFiles.map((scan) => {
                    const location = getLocation(customerData.wohnort);
                    const targetDate = scan.updatedAt || scan.createdAt;

                    return (
                        <div
                            key={scan.id}
                            className="flex flex-col"
                        >
                            <Image
                                src={legImage}
                                alt="Leg Scan"
                                className="mb-4"
                                width={160}
                                height={100}
                            />

                            <h3 className="text-lg font-semibold text-[#62A07C]">
                                {customerName || "Unknown"}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                Erstellt am: {formatDate(scan.createdAt)}
                            </p>
                            <p className="text-gray-600 text-sm mb-4">
                                {/* Ort: {location} */}
                                Ort: -
                            </p>

                            <div>
                                <button
                                    onClick={() => {
                                        const query = targetDate ? `?scanDate=${encodeURIComponent(targetDate)}` : ''
                                        router.push(`/dashboard/scanning-data/${customerData.id}${query}`)
                                    }}
                                    className="bg-[#62A07C] px-10 hover:bg-[#62a07c77] cursor-pointer text-white text-sm py-2 rounded transition"
                                >
                                    Scan ansehen
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

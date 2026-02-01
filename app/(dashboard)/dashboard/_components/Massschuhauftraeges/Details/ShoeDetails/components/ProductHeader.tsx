import React from "react";
import { Upload } from "lucide-react";

interface ProductHeaderProps {
  shoeImage: string;
  shoeName: string;
  customerName: string;
  orderNumber: string;
  deliveryDate: string;
  linkerLeistenFileName: string;
  rechterLeistenFileName: string;
  onLinkerLeistenClick: () => void;
  onRechterLeistenClick: () => void;
  linkerLeistenInputRef: React.RefObject<HTMLInputElement | null>;
  rechterLeistenInputRef: React.RefObject<HTMLInputElement | null>;
  onLinkerLeistenChange: (file: File | null, fileName: string) => void;
  onRechterLeistenChange: (file: File | null, fileName: string) => void;
}

export default function ProductHeader({
  shoeImage,
  shoeName,
  customerName,
  orderNumber,
  deliveryDate,
  linkerLeistenFileName,
  rechterLeistenFileName,
  onLinkerLeistenClick,
  onRechterLeistenClick,
  linkerLeistenInputRef,
  rechterLeistenInputRef,
  onLinkerLeistenChange,
  onRechterLeistenChange,
}: ProductHeaderProps) {
  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">Willkommen zurück!</h1>
      </div>

      {/* Product Card */}
      <div className="bg-gray-100 p-4">
        <div className="flex justify-center items-center gap-6">
          {/* Image Section */}
          <div className="bg-white rounded-lg p-4 shrink-0">
            <img
              src={shoeImage || "/placeholder.svg"}
              alt={shoeName}
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Product Info Section */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-black mb-2">{shoeName}</h2>
            <p className="text-lg text-black mb-2">
              Kunde: <span className="font-medium">{customerName}</span>
            </p>
            <p className="text-base text-black mb-4">
              Bestellnr: <span className="font-bold">{orderNumber}</span>{" "}
              &nbsp; Liefertermin: <span className="font-bold">{deliveryDate}</span>
            </p>

            {/* STL File Upload Buttons */}
            <div className="flex flex-col gap-3 mt-4">
              {/* Left Side Upload Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={onLinkerLeistenClick}
                  className="w-fit flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-base text-gray-700">
                    {linkerLeistenFileName || "Upload 3D-Datei Linker Leisten"}
                  </span>
                </button>
                <input
                  type="file"
                  accept=".stl,.obj"
                  ref={linkerLeistenInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onLinkerLeistenChange(file, file.name);
                    }
                  }}
                  className="hidden"
                />
                {linkerLeistenFileName && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✓ {linkerLeistenFileName}
                  </div>
                )}
              </div>

              {/* Right Side Upload Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={onRechterLeistenClick}
                  className="w-fit flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <span className="text-base text-gray-700">
                    {rechterLeistenFileName || "Upload 3D-Datei Rechter Leisten"}
                  </span>
                </button>
                <input
                  type="file"
                  accept=".stl,.obj"
                  ref={rechterLeistenInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onRechterLeistenChange(file, file.name);
                    }
                  }}
                  className="hidden"
                />
                {rechterLeistenFileName && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    ✓ {rechterLeistenFileName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


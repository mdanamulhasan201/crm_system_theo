import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Footprints,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import ProductDetailsDialog from "./ProductDetailsDialog";

interface InsoleProduct {
  id: string;
  name: string;
  size: string;
  matchPercentage: number;
  description: string;
  image: string;
}

interface SpringerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerSize?: string;
}

// Dummy data - will be replaced with real API data
const INSOLE_PRODUCTS: InsoleProduct[] = [
  {
    id: "1",
    name: "ComfortPlus Classic",
    size: "EU 42",
    matchPercentage: 96,
    description: "Premium cushioning for all-day comfort and everyday wear",
    image: "/images/insole-comfort.png",
  },
  {
    id: "2",
    name: "DiabetoCare Soft",
    size: "EU 42",
    matchPercentage: 94,
    description: "Specialized pressure distribution for sensitive feet",
    image: "/images/insole-diabeto.png",
  },
  {
    id: "3",
    name: "SportElite Pro",
    size: "EU 42",
    matchPercentage: 92,
    description: "High-performance support designed for athletic activities",
    image: "/images/insole-comfort.png",
  },
  {
    id: "4",
    name: "KidsActive",
    size: "EU 42",
    matchPercentage: 91,
    description: "Growing feet support with sensorimotor technology",
    image: "/images/insole-diabeto.png",
  },
  {
    id: "5",
    name: "MedTech Advanced",
    size: "EU 42",
    matchPercentage: 89,
    description:
      "Clinical-grade support for heel spur and metatarsalgia relief",
    image: "/images/insole-comfort.png",
  },
  {
    id: "6",
    name: "AllRound Premium",
    size: "EU 42",
    matchPercentage: 88,
    description: "Versatile support for multiple activities and shoe types",
    image: "/images/insole-diabeto.png",
  },
];

const FILTER_CATEGORIES = {
  STÜTZEND: ["Fersensporn", "Metatarsalgie", "Sport", "Business", "Comfort"],
  BETTEND: [
    "Hallux Rigidus",
    "Diabetes / Rheuma",
    "Kinder",
    "Alltag",
    "Allround",
  ],
  SCHALIG: [],
  SENSOMOTORISCH: [],
  SAFETY: [],
  Risikofuß: [],
};

export default function SpringerDialog({
  isOpen,
  onClose,
  customerSize = "EU 42",
}: SpringerDialogProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Function",
    "Application",
    "Form",
  ]);
  const [sortBy, setSortBy] = useState<"match" | "name">("match");
  const [pelotteConfig, setPelotteConfig] = useState<"with" | "without">(
    "without",
  );
  const [selectedProduct, setSelectedProduct] = useState<InsoleProduct | null>(
    null,
  );
  const [showProductDetails, setShowProductDetails] = useState(false);

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const handleProductClick = (product: InsoleProduct) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const sortedProducts = [...INSOLE_PRODUCTS].sort((a, b) => {
    if (sortBy === "match") {
      return b.matchPercentage - a.matchPercentage;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-lg w-[90vw] h-[90vh] max-w-[90vw] p-0 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Close Button */}
          <DialogPrimitive.Close className="absolute top-4 right-4 z-10 rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>

          {/* Main Content */}
          <div className="flex h-full overflow-hidden">
            {/* Sidebar - Filters */}
            <div className="w-96 border-r bg-gray-50 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* Icon Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-500 rounded-2xl p-4">
                  <Footprints className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Find Your Insole</h2>
                  <p className="text-sm text-gray-500">
                    Personalized recommendations
                  </p>
                </div>
              </div>

              {/* STEP 1 - Pelotte Configuration */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded text-red-600"
                    style={{ backgroundColor: "#FCE8E8" }}
                  >
                    STEP 1
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-6">
                  Pelotte Configuration
                </h3>

                <div className="space-y-4">
                  {/* With Pelotte */}
                  <label className="flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="pelotte"
                      value="with"
                      checked={pelotteConfig === "with"}
                      onChange={() => setPelotteConfig("with")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-lg mb-1">
                        With Pelotte
                      </div>
                      <div className="text-sm text-gray-600">
                        Enhanced metatarsal support pad
                      </div>
                    </div>
                  </label>

                  {/* Without Pelotte */}
                  <label className="flex items-start gap-3 cursor-pointer p-4 border-2 rounded-lg hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="pelotte"
                      value="without"
                      checked={pelotteConfig === "without"}
                      onChange={() => setPelotteConfig("without")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-lg mb-1">
                        Without Pelotte
                      </div>
                      <div className="text-sm text-gray-600">
                        Classic insole design
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* STEP 2 - Function */}
              <div className="mb-6 pb-6 border-b">
                <button
                  onClick={() => toggleSection("Function")}
                  className="flex items-center justify-between w-full text-left mb-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded text-red-600"
                      style={{ backgroundColor: "#FCE8E8" }}
                    >
                      STEP 2
                    </span>
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93 0 4.08-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95s-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                    </svg>
                    <span className="font-semibold text-lg">Function</span>
                  </div>
                  {expandedSections.includes("Function") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedSections.includes("Function") && (
                  <div className="grid grid-cols-2 gap-3 ml-2">
                    {[
                      "STÜTZEND",
                      "BETTEND",
                      "SCHALIG",
                      "SENSOMOTORISCH",
                      "SAFETY",
                      "Risikofuß",
                    ].map((filter) => (
                      <label
                        key={filter}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(filter)}
                          onChange={() => handleFilterToggle(filter)}
                          className="rounded border-gray-300"
                        />
                        <span>{filter}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3 - Application */}
              <div className="mb-6 pb-6 border-b">
                <button
                  onClick={() => toggleSection("Application")}
                  className="flex items-center justify-between w-full text-left mb-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded text-red-600"
                      style={{ backgroundColor: "#FCE8E8" }}
                    >
                      STEP 3
                    </span>
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span className="font-semibold text-lg">Application</span>
                  </div>
                  {expandedSections.includes("Application") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedSections.includes("Application") && (
                  <div className="grid grid-cols-2 gap-3 ml-2">
                    {[
                      "Fersensporn",
                      "Hallux Rigidus",
                      "Metatarsalgie",
                      "Diabetes / Rheuma",
                      "Sensomotorisch",
                      "Sport",
                      "Kinder",
                      "ESD-Arbeitsschuh",
                      "Pumps",
                      "Ballerinas",
                      "Business",
                      "Allround",
                      "Comfort",
                      "Alltag",
                    ].map((filter) => (
                      <label
                        key={filter}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(filter)}
                          onChange={() => handleFilterToggle(filter)}
                          className="rounded border-gray-300"
                        />
                        <span>{filter}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4 - Form */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection("Form")}
                  className="flex items-center justify-between w-full text-left mb-4"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded text-red-600"
                      style={{ backgroundColor: "#FCE8E8" }}
                    >
                      STEP 4
                    </span>
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                    </svg>
                    <span className="font-semibold text-lg">Form</span>
                  </div>
                  {expandedSections.includes("Form") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {expandedSections.includes("Form") && (
                  <div className="grid grid-cols-2 gap-3 ml-2">
                    {[
                      "Bequem",
                      "Schmal",
                      "Mittel",
                      "Breit",
                      "Anatomische Pelotte",
                      "Retrocapitale",
                      "Bequem / FINN",
                    ].map((filter) => (
                      <label
                        key={filter}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(filter)}
                          onChange={() => handleFilterToggle(filter)}
                          className="rounded border-gray-300"
                        />
                        <span>{filter}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area - Products */}
            <div className="flex-1 overflow-y-auto p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Recommended Insoles
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {INSOLE_PRODUCTS.length} products match your criteria · Your
                    size: {customerSize}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSortBy(sortBy === "match" ? "name" : "match")
                  }
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">
                    Sorted by {sortBy === "match" ? "match" : "name"}
                  </span>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="relative bg-gray-50 p-6 flex items-center justify-center h-64">
                      <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded text-sm font-medium">
                        {product.size}
                      </div>
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <span>⚡</span>
                        <span>{product.matchPercentage}% match</span>
                      </div>
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                          onError={(e) => {
                            // Fallback to a placeholder
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Recommended size: {product.size} (from scan)
                      </p>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <button
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm group"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                      >
                        <span>View details</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <ProductDetailsDialog
          isOpen={showProductDetails}
          onClose={() => setShowProductDetails(false)}
          product={selectedProduct}
        />
      )}
    </DialogPrimitive.Root>
  );
}

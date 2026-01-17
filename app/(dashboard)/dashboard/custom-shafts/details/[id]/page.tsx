"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSingleCustomShaft } from "@/hooks/customShafts/useSingleCustomShaft";
import { useGetSingleMassschuheOrder } from "@/hooks/massschuhe/useGetSingleMassschuheOrder";
import toast from "react-hot-toast";
import CustomShaftDetailsShimmer from "@/components/ShimmerEffect/Maßschäfte/CustomShaftDetailsShimmer";
import { createCustomShaft } from "@/apis/customShaftsApis";
import { sendMassschuheOrderToAdmin2 } from "@/apis/MassschuheManagemantApis";

// Import separated components
import ConfirmationModal from "@/components/CustomShafts/ConfirmationModal";
import SuccessMessage from "@/components/CustomShafts/SuccessMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeatherColorAssignment } from "@/components/CustomShafts/LeatherColorSectionModal";


interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  createdAt: string;
}

export default function DetailsPage() {
  // Router for navigation
  const router = useRouter();

  // State management
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [nahtfarbeOption, setNahtfarbeOption] = useState("default");
  const [customNahtfarbe, setCustomNahtfarbe] = useState("");
  const [lederType, setLederType] = useState("");
  const [lederfarbe, setLederfarbe] = useState("");
  const [innenfutter, setInnenfutter] = useState("");
  const [schafthohe, setSchafthohe] = useState("");
  const [linkerLeistenFileName, setLinkerLeistenFileName] = useState("");
  const [rechterLeistenFileName, setRechterLeistenFileName] = useState("");
  const [linkerLeistenFile, setLinkerLeistenFile] = useState<File | null>(null);
  const [rechterLeistenFile, setRechterLeistenFile] = useState<File | null>(
    null
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [otherCustomerNumber, setOtherCustomerNumber] = useState<string>("");
  const [polsterung, setPolsterung] = useState<string[]>([]);
  const [verstarkungen, setVerstarkungen] = useState<string[]>([]);
  const [polsterungText, setPolsterungText] = useState("");
  const [verstarkungenText, setVerstarkungenText] = useState("");

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  // Add-ons
  const [passendenSchnursenkel, setPassendenSchnursenkel] = useState<
    boolean | undefined
  >(undefined);
  const [osenEinsetzen, setOsenEinsetzen] = useState<boolean | undefined>(
    undefined
  );

  // Leather color configuration
  const [numberOfLeatherColors, setNumberOfLeatherColors] =
    useState<string>("1");
  const [leatherColorAssignments, setLeatherColorAssignments] = useState<
    LeatherColorAssignment[]
  >([]);

  const [leatherColors, setLeatherColors] = useState<string[]>([]);

  // Get params and search params
  const params = useParams();
  const searchParams = useSearchParams();
  const shaftId = params.id as string;
  const orderId = searchParams.get("orderId");

  // Fetch order data if orderId is present
  const { order: massschuheOrder, loading: orderLoading } =
    useGetSingleMassschuheOrder(orderId);

  // Fetch shaft data
  const {
    data: apiData,
    loading: shaftLoading,
    error: shaftError,
  } = useSingleCustomShaft(shaftId);
  const shaft = apiData?.data;


  const loading = orderLoading || shaftLoading;
  const error = shaftError;

  useEffect(() => {
    if (shaft) {
      // Image loaded successfully
    }
  }, [shaftId, shaft]);

  // Pre-fill customer when orderId is present
  useEffect(() => {
    if (massschuheOrder) {
      // API returns customer object even though type doesn't include it
      const orderWithCustomer = massschuheOrder as any;
      if (orderWithCustomer.customer) {
        const customer = orderWithCustomer.customer;
        setSelectedCustomer({
          id: customer.id,
          name: `${customer.vorname || ""} ${customer.nachname || ""}`.trim(),
          email: customer.email || "",
          phone: null,
          location: "",
          createdAt: "",
        });
      } else if (
        massschuheOrder.customerId &&
        massschuheOrder.kunde &&
        massschuheOrder.email
      ) {

        // Fallback: use order data if customer object not available
        setSelectedCustomer({
          id: massschuheOrder.customerId,
          name: massschuheOrder.kunde,
          email: massschuheOrder.email,
          phone: massschuheOrder.telefon || null,
          location: massschuheOrder.location || "",
          createdAt: "",

        });
      }
    }
  }, [massschuheOrder]);

  // Order handling
  const basePrice = shaft?.price || 0;


  const SCHNURSENKEL_PRICE = 4.49;
  const OSEN_EINSETZEN_PRICE = 8.99;

  const calculateTotalPrice = () => {
    let total = basePrice;

    if (passendenSchnursenkel) {
      total += SCHNURSENKEL_PRICE;
    }

    if (osenEinsetzen) {
      total += OSEN_EINSETZEN_PRICE;
    }

    return total;
  };

  const orderPrice = calculateTotalPrice();

  // Function to prepare form data for sendMassschuheOrderToAdmin2 API
  const prepareFormDataForAdmin2 = (): FormData => {
    const formData = new FormData();

    // Add files
    if (rechterLeistenFile) {
      formData.append("image3d_1", rechterLeistenFile);
    }
    if (linkerLeistenFile) {
      formData.append("image3d_2", linkerLeistenFile);
    }

    // Add mabschaftKollektionId
    formData.append("mabschaftKollektionId", shaftId);

    // Add lederfarbe only if 1 color is selected
    if (numberOfLeatherColors === "1") {
      formData.append("lederfarbe", lederfarbe);
    } else if (numberOfLeatherColors === "2" || numberOfLeatherColors === "3") {
      // Add multiple leather colors
      formData.append("numberOfLeatherColors", numberOfLeatherColors);

      leatherColors.forEach((color, index) => {
        formData.append(`leatherColor_${index + 1}`, color);
      });
      // Add section assignments as JSON
      formData.append(
        "leatherColorAssignments",
        JSON.stringify(leatherColorAssignments)
      );
    }

    // Add other fields
    formData.append("innenfutter", innenfutter);
    formData.append("schafthohe", schafthohe);
    formData.append("polsterung", polsterung.join(","));
    formData.append("vestarkungen", verstarkungen.join(","));
    formData.append("polsterung_text", polsterungText);
    formData.append("vestarkungen_text", verstarkungenText);
    formData.append(
      "nahtfarbe",
      nahtfarbeOption === "custom" ? customNahtfarbe : "default"
    );
    formData.append(
      "nahtfarbe_text",
      nahtfarbeOption === "custom" ? customNahtfarbe : ""
    );
    formData.append("lederType", lederType);

    // Add prices only if options are selected
    if (passendenSchnursenkel === true) {
      formData.append("passenden_schnursenkel", "true");
      formData.append("passenden_schnursenkel_price", "4.49");
    }
    if (osenEinsetzen === true) {
      formData.append("osen_einsetzen", "true");
      formData.append("osen_einsetzen_price", "8.99");
    }

    // Add total price
    formData.append("totalPrice", orderPrice.toString());


    return formData;
  };

  // Handle Boden Konfigurieren - stores form data and redirects to Bodenkonstruktion (no API call)
  const handleBodenKonfigurieren = () => {
    if (!orderId) {
      toast.error("Order ID is required");
      return;
    }

    // Store custom shaft form data in sessionStorage for later use
    const customShaftData = {
      image3d_1: rechterLeistenFile,
      image3d_2: linkerLeistenFile,
      mabschaftKollektionId: shaftId,
      lederfarbe: numberOfLeatherColors === "1" ? lederfarbe : null,
      numberOfLeatherColors,
      leatherColors: numberOfLeatherColors !== "1" ? leatherColors : [],
      leatherColorAssignments:
        numberOfLeatherColors !== "1" ? leatherColorAssignments : [],

      innenfutter,
      schafthohe,
      polsterung,
      verstarkungen,
      polsterung_text: polsterungText,
      verstarkungen_text: verstarkungenText,
      nahtfarbe: nahtfarbeOption === "custom" ? customNahtfarbe : "default",
      nahtfarbe_text: nahtfarbeOption === "custom" ? customNahtfarbe : "",
      lederType,
      passenden_schnursenkel: passendenSchnursenkel === true,
      passenden_schnursenkel_price:
        passendenSchnursenkel === true ? "4.49" : null,
      osen_einsetzen: osenEinsetzen === true,
      osen_einsetzen_price: osenEinsetzen === true ? "8.99" : null,

      totalPrice: orderPrice,
      // Store file names for reference
      linkerLeistenFileName,
      rechterLeistenFileName,
    };

    // Store in sessionStorage (we'll need to handle files separately)
    sessionStorage.setItem(
      `customShaftData_${orderId}`,
      JSON.stringify({
        ...customShaftData,
        // Store file references (we'll need to recreate FormData in Bodenkonstruktion)
        hasImage3d_1: !!rechterLeistenFile,
        hasImage3d_2: !!linkerLeistenFile,
      })
    );


    // Store files in a way that can be accessed later
    // Note: Files can't be stored in sessionStorage, so we'll need to handle them differently
    // For now, we'll store the form data and handle files when calling API

    // Close modal
    setShowConfirmationModal(false);


    // Redirect to Bodenkonstruktion page
    router.push(`/dashboard/massschuhauftraege-deatils/2?orderId=${orderId}`);
  };

  // Function to clear all form data
  const clearFormData = () => {
    setUploadedImage(null);
    setNahtfarbeOption("default");
    setCustomNahtfarbe("");
    setLederType("");
    setLederfarbe("");
    setInnenfutter("");
    setSchafthohe("");
    setLinkerLeistenFileName("");
    setRechterLeistenFileName("");
    setLinkerLeistenFile(null);
    setRechterLeistenFile(null);
    setSelectedCustomer(null);
    setOtherCustomerNumber("");
    setPolsterung([]);
    setVerstarkungen([]);
    setPolsterungText("");
    setVerstarkungenText("");
    setNumberOfLeatherColors("1");

    setLeatherColorAssignments([]);
    setLeatherColors([]);
  };

  const handleOrderConfirmation = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error(
        "Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein."
      );

      return;
    }

    setIsCreatingOrder(true);
    try {
      const formData = new FormData();

      // Use selected customer ID if available, otherwise use other_customer_number
      if (selectedCustomer) {
        formData.append("customerId", selectedCustomer.id);
      } else if (otherCustomerNumber.trim()) {
        formData.append("other_customer_number", otherCustomerNumber.trim());
      }

      if (rechterLeistenFile) {
        formData.append("image3d_1", rechterLeistenFile);
      }
      if (linkerLeistenFile) {
        formData.append("image3d_2", linkerLeistenFile);
      }

      formData.append("lederType", lederType);

      // Handle leather color based on number of colors
      if (numberOfLeatherColors === "1") {
        formData.append("lederfarbe", lederfarbe);
      } else if (
        numberOfLeatherColors === "2" ||
        numberOfLeatherColors === "3"
      ) {
        // Add multiple leather colors
        formData.append("numberOfLeatherColors", numberOfLeatherColors);

        leatherColors.forEach((color, index) => {
          formData.append(`leatherColor_${index + 1}`, color);
        });
        // Add section assignments as JSON
        formData.append(
          "leatherColorAssignments",
          JSON.stringify(leatherColorAssignments)
        );
      }

      formData.append("innenfutter", innenfutter);
      formData.append(
        "nahtfarbe",
        nahtfarbeOption === "custom" ? customNahtfarbe : "default"
      );
      formData.append(
        "nahtfarbe_text",
        nahtfarbeOption === "custom" ? customNahtfarbe : ""
      );
      formData.append("schafthohe", schafthohe);
      formData.append("polsterung", polsterung.join(","));
      formData.append("vestarkungen", verstarkungen.join(","));

      formData.append("polsterung_text", polsterungText);
      formData.append("vestarkungen_text", verstarkungenText);
      if (passendenSchnursenkel === true) {
        formData.append("passenden_schnursenkel", "true");

        formData.append("Passenden_schnursenkel_price", "4.49");
      }
      if (osenEinsetzen === true) {
        formData.append("osen_einsetzen", "true");

        formData.append("osen_einsetzen_price", "8.99");
      }
      formData.append("mabschaftKollektionId", shaftId);
      formData.append("totalPrice", orderPrice.toString());


      // Use orderId if present, otherwise show error (orderId is required for this flow)
      if (!orderId) {
        toast.error("Order ID is required");
        setIsCreatingOrder(false);
        return;
      }

      const response = await createCustomShaft(orderId, formData);
      clearFormData();
      setShowSuccessMessage(true);
      setShowConfirmationModal(false);
      toast.success(response.message || "Bestellung erfolgreich erstellt!", {
        id: "creating-order",
      });

      // Navigate back to custom-shafts page after success
      setTimeout(() => {
        router.push("/dashboard/custom-shafts");
      }, 200);
    } catch (error) {
      toast.error("Fehler beim Erstellen der Bestellung.", {
        id: "creating-order",
      });

    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Loading state - show shimmer effect
  if (loading) {
    return <CustomShaftDetailsShimmer />;
  }

  // Error state
  if (error) {
    return (
      <div className="px-2 md:px-6 py-8 w-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-lg font-medium mb-2">
          Fehler beim Laden der Daten
        </div>
        <div className="text-gray-400 text-sm text-center">{error}</div>

      </div>
    );
  }

  // Product not found
  if (!shaft) {
    return (
      <div className="px-2 md:px-6 py-8 w-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-lg font-medium mb-2">
          Produkt nicht gefunden
        </div>

        <div className="text-gray-400 text-sm text-center">
          Das angeforderte Produkt konnte nicht gefunden werden.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full px-4 md:px-8 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Kundenauswahl</h1>
        </div>

        {/* Search and Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 mb-8 bg-white border p-6 rounded-lg">
          {/* Kunde auswählen */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Kunde auswählen
            </label>
            <Input
              placeholder="Suche..."
              className="w-full"
              value={selectedCustomer?.name || ""}
              readOnly
            />
          </div>

          {/* Kunden Extern */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Kunden Extern
            </label>
            <Input
              placeholder="Textfeld..."
              className="w-full"
              value={otherCustomerNumber}
              onChange={(e) => setOtherCustomerNumber(e.target.value)}
            />
          </div>

          {/* Linker Leisten */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Linker Leisten
            </label>
            <div className="relative">
              <input
                type="file"
                id="linkerLeisten"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLinkerLeistenFile(file);
                    setLinkerLeistenFileName(file.name);
                  }
                }}
                accept=".stl,.obj,.3ds"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() =>
                  document.getElementById("linkerLeisten")?.click()
                }
              >
                Upload 3D-File
              </Button>
              {linkerLeistenFileName && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {linkerLeistenFileName}
                </p>
              )}
            </div>
          </div>

          {/* Rechter Leisten */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Rechter Leisten
            </label>
            <div className="relative">
              <input
                type="file"
                id="rechterLeisten"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setRechterLeistenFile(file);
                    setRechterLeistenFileName(file.name);
                  }
                }}
                accept=".stl,.obj,.3ds"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() =>
                  document.getElementById("rechterLeisten")?.click()
                }
              >
                Upload 3D-File
              </Button>
              {rechterLeistenFileName && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {rechterLeistenFileName}
                </p>
              )}
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button className="bg-[#62A07C] hover:bg-[#62a07c98] text-white px-6 h-10 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              Suchen
            </Button>
          </div>
        </div>
        <div className="border p-8 rounded-lg shadow-lg">
          {/* Main Title */}
          <h2 className="text-2xl font-bold mb-6 border-b pb-4">
            Masschaftkonfigurator
          </h2>

          {/* Single Card Container */}
          <div className="bg-white mb-8">
            {/* Product Display Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
              {/* Product Image */}
              <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
                <img
                  src={uploadedImage || shaft?.image || "/placeholder-shoe.png"}
                  alt={shaft?.name || "Product"}
                  className="max-w-full h-auto object-contain"
                  style={{ maxHeight: "300px" }}
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-2">
                  {shaft?.name || "Product Name"}
                </h3>
                <p className="text-gray-500 mb-4">#{shaft?.id || "5229"}</p>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {shaft?.description ||
                    "Ein leichter, weicher Alltagsschuh mit doppeltem Klettverschluss für komfortables An- und Ausziehen und entspanntes Gehen."}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {basePrice.toFixed(2)} €
                  </span>
                  <span className="text-sm text-gray-500">
                    (Preis kann automatisiert aktualisiert)
                  </span>
                </div>
              </div>
            </div>

            {/* Configuration Fields */}
            {/* Ledertyp - Inline Layout */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-6">
              <label className="text-sm font-medium text-gray-700">
                Ledertyp:
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={lederType}
                onChange={(e) => setLederType(e.target.value)}
              >
                <option value="">Herschleder Gemustert</option>
                <option value="Herschleder Gemustert">
                  Herschleder Gemustert
                </option>
                <option value="Glattleder">Glattleder</option>
                <option value="Rauleder">Rauleder</option>
                <option value="Nubukleder">Nubukleder</option>
              </select>
            </div>

            {/* Anzahl der Ledertypen - Inline Layout */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-6">
              <label className="text-sm font-medium text-gray-700">
                Anzahl der Ledertypen:
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={numberOfLeatherColors}
                onChange={(e) => {
                  const value = e.target.value;
                  setNumberOfLeatherColors(value);
                  // Initialize leather colors array based on selection
                  if (value === "2") {
                    setLeatherColors(["", ""]);
                  } else if (value === "3") {
                    setLeatherColors(["", "", ""]);
                  } else {
                    setLeatherColors([]);
                  }
                }}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>

            {/* Leather Type Assignment Section */}
            {numberOfLeatherColors !== "1" && (
              <div className="grid grid-cols-[200px_1fr] gap-4 items-start mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Ledertypen-Zuordnung:
                </label>
                <div className="space-y-3">
                  {/* Display leather types inline */}
                  <div className="flex flex-wrap gap-4">
                    {Array.from({
                      length: parseInt(numberOfLeatherColors),
                    }).map((_, index) => (
                      <span key={index} className="text-sm">
                        <span className="font-medium">Leder {index + 1}:</span>{" "}
                        {leatherColors[index] ||
                          (index === 0
                            ? "nubuckleder"
                            : index === 1
                            ? "nappa"
                            : "softveloursleder")}
                      </span>
                    ))}
                  </div>

                  {/* 9 Bereiche zugeordnet text */}
                  <div className="text-sm text-gray-600">
                    9 Bereiche zugeordnet
                  </div>

                  {/* Zuordnung bearbeiten button */}
                  <Button variant="outline" className="cursor-pointer">
                    Zuordnung bearbeiten
                  </Button>
                </div>
              </div>
            )}

            {/* Single Leather Color - Inline Layout */}
            {numberOfLeatherColors === "1" && (
              <div className="grid grid-cols-[200px_1fr] gap-4 items-center mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Lederfarbe:
                </label>
                <Input
                  placeholder="Lederfarbe eingeben"
                  value={lederfarbe}
                  onChange={(e) => setLederfarbe(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>


        {/* Success Message */}
        <SuccessMessage
          isVisible={showSuccessMessage}
          onClose={() => setShowSuccessMessage(false)}
          orderPrice={orderPrice}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleOrderConfirmation}
          onSendToAdmin2={async () => {
            if (!orderId) {
              toast.error("Order ID is required");
              return;
            }
            setIsCreatingOrder(true);
            try {
              const formData = prepareFormDataForAdmin2();
              const response = await sendMassschuheOrderToAdmin2(
                orderId,
                formData
              );
              clearFormData();
              setShowSuccessMessage(true);
              setShowConfirmationModal(false);
              toast.success(
                response.message || "Bestellung erfolgreich gesendet!",
                { id: "sending-order" }
              );
              setTimeout(() => {
                router.push("/dashboard/custom-shafts");
              }, 200);
            } catch (error) {
              toast.error("Fehler beim Senden der Bestellung.", {
                id: "sending-order",
              });

            } finally {
              setIsCreatingOrder(false);
            }
          }}
          onBodenKonfigurieren={handleBodenKonfigurieren}
          orderPrice={orderPrice}
          passendenSchnursenkel={passendenSchnursenkel}
          osenEinsetzen={osenEinsetzen}
          selectedCustomer={selectedCustomer}
          otherCustomerNumber={otherCustomerNumber}
          shaftName={shaft?.name}
          isCreatingOrder={isCreatingOrder}
          orderId={orderId}
        />
      </div>
    </>
  );
}


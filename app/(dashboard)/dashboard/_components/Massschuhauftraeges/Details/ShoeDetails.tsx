"use client";
import React, { useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GroupDef2 } from "./Types";
import { parseEuroFromText } from "./HelperFunctions";
import { GROUPS, shoe } from "./ShoeData";
import PDFPopup, { OrderDataForPDF } from "./PDFPopup";
import CompletionPopUp from "./Completion-PopUp";
import { useGetSingleMassschuheOrder } from "@/hooks/massschuhe/useGetSingleMassschuheOrder";
import { sendMassschuheOrderToAdmin1 } from "@/apis/MassschuheManagemantApis";
import toast from "react-hot-toast";

// Import components
import TextField from "./ShoeDetails/components/TextField";
import TextAreaField from "./ShoeDetails/components/TextAreaField";
import SectionHeader from "./ShoeDetails/components/SectionHeader";
import OptionGroup from "./ShoeDetails/components/OptionGroup";
import ProductHeader from "./ShoeDetails/components/ProductHeader";

// Import helpers
import { prepareFormDataForAdmin1 } from "./ShoeDetails/helpers/formHelpers";

// ==================== Types ====================
type SelectedState = {
  [groupId: string]: string | null;
};

type OptionInputsState = {
  [groupId: string]: {
    [optionId: string]: string[];
  };
};

type TextAreasState = {
  [key: string]: string;
};

interface ShoeDetailsProps {
  orderId?: string | null;
}

// ==================== Main Component ====================
export default function ShoeDetails({ orderId: orderIdProp }: ShoeDetailsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get orderId from prop or URL search params
  const orderId = orderIdProp || searchParams?.get("orderId") || null;

  // ==================== State Management ====================
  const [selected, setSelected] = useState<SelectedState>({});
  const [optionInputs, setOptionInputs] = useState<OptionInputsState>({});
  const [textAreas, setTextAreas] = useState<TextAreasState>({
    korrektur_bereich: "",
    fussproblem_bettung: "",
    bettung_wuensche: "",
    fussproblem_leisten: "",
    leisten_wuensche: "",
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [checkboxError, setCheckboxError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload states
  const [linkerLeistenFile, setLinkerLeistenFile] = useState<File | null>(null);
  const [rechterLeistenFile, setRechterLeistenFile] = useState<File | null>(null);
  const [linkerLeistenFileName, setLinkerLeistenFileName] = useState<string>("");
  const [rechterLeistenFileName, setRechterLeistenFileName] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Refs for file inputs
  const linkerLeistenInputRef = useRef<HTMLInputElement>(null);
  const rechterLeistenInputRef = useRef<HTMLInputElement>(null);

  // Fetch order data
  const { order } = useGetSingleMassschuheOrder(orderId ?? null);

  // ==================== Prepare Order Data for PDF ====================
  const orderDataForPDF: OrderDataForPDF = useMemo(() => {
    if (!order) return {};

    let formattedDeliveryDate = "-";
    if (order.delivery_date) {
      try {
        const date = new Date(order.delivery_date);
        formattedDeliveryDate = date.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } catch {
        formattedDeliveryDate = order.delivery_date;
      }
    }

    const fußanalysePrice = order.fußanalyse ?? 0;
    const einlagenversorgungPrice = order.einlagenversorgung ?? 0;
    const totalPrice = fußanalysePrice + einlagenversorgungPrice;
    const partnerData = (order as any).partner || (order as any).user;

    return {
      orderNumber: order.orderNumber
        ? `#${order.orderNumber}`
        : `#${order.id?.slice(0, 8) || "000000"}`,
      customerName: order.kunde || "Kunde",
      productName: "Halbprobenerstellung",
      deliveryDate: formattedDeliveryDate,
      status: order.status,
      filiale: order.filiale,
      totalPrice: totalPrice > 0 ? totalPrice : undefined,
      footerPhone: partnerData?.phone || undefined,
      footerEmail: partnerData?.email || undefined,
      footerBusinessName: partnerData?.busnessName || undefined,
      footerImage: partnerData?.image || null,
    };
  }, [order]);

  // ==================== Handlers ====================
  const setGroup = (groupId: string, optId: string | null) => {
    setSelected((prev) => ({ ...prev, [groupId]: optId }));
  };

  // ==================== Price Calculations ====================
  const extraPriceTotal = useMemo(() => {
    let sum = 0;
    for (const group of GROUPS) {
      if (
        group.fieldType === "section" ||
        group.fieldType === "textarea" ||
        group.fieldType === "text"
      ) {
        continue;
      }

      const selectedOptId = selected[group.id];
      if (!selectedOptId) continue;

      const opt = group.options.find((o) => o.id === selectedOptId);
      if (!opt) continue;

      const price = parseEuroFromText(opt.label);
      if (price > 0) {
        sum += price;
      }
    }
    return sum;
  }, [selected]);

  const grandTotal = useMemo(() => {
    if (order) {
      const fußanalysePrice = order.fußanalyse ?? 0;
      const einlagenversorgungPrice = order.einlagenversorgung ?? 0;
      const orderTotalPrice = fußanalysePrice + einlagenversorgungPrice;

      if (orderTotalPrice > 0) {
        return orderTotalPrice + extraPriceTotal;
      }
    }
    return shoe.price + extraPriceTotal;
  }, [order, extraPriceTotal]);

  // ==================== Validation ====================
  const requiredCheckboxGroups = useMemo(
    () =>
      GROUPS.filter((g) => !g.fieldType || g.fieldType === "checkbox").filter(
        (g) => g.fieldType !== "section" && g.fieldType !== "textarea",
      ),
    [],
  );

  const isAllCheckboxAnswered = requiredCheckboxGroups.every((g) => {
    const sel = selected[g.id];
    return sel !== undefined && sel !== null && sel !== "";
  });

  const handleWeiterClick = () => {
    if (!isAllCheckboxAnswered) {
      setCheckboxError(true);
      return;
    }
    setCheckboxError(false);
    setShowModal(true);
    localStorage.setItem("currentBalance", String(grandTotal.toFixed(2)));
  };

  // ==================== Form Submission ====================
  const handleOrderSubmit = async () => {
    if (!orderId) {
      toast.error("Bestellungs-ID fehlt. Bitte versuchen Sie es erneut.");
      setShowModal2(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare FormData using helper function
      const formData = prepareFormDataForAdmin1(
        linkerLeistenFile,
        rechterLeistenFile,
        pdfFile,
        selected,
        textAreas,
        optionInputs,
        grandTotal
      );

      console.log("Calling API with orderId:", orderId);

      const response = await sendMassschuheOrderToAdmin1(orderId, formData);

      if (response && response.success === false && response.message) {
        toast.error(response.message);
        return;
      }

      toast.success("Bestellung erfolgreich gesendet!");
      router.push("/dashboard/balance-dashboard");
      setShowModal2(false);
    } catch (error: any) {
      console.error("Error sending order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Fehler beim Senden der Bestellung";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== Render ====================
  return (
    <div className="relative bg-white">
      {/* Product Header with File Upload */}
      <ProductHeader
        shoeImage={shoe.imageUrl}
        shoeName={orderDataForPDF.productName || shoe.name}
        customerName={orderDataForPDF.customerName || shoe.brand}
        orderNumber={orderDataForPDF.orderNumber || "#123456789"}
        deliveryDate={orderDataForPDF.deliveryDate || "12.04.2024"}
        linkerLeistenFileName={linkerLeistenFileName}
        rechterLeistenFileName={rechterLeistenFileName}
        onLinkerLeistenClick={() => linkerLeistenInputRef.current?.click()}
        onRechterLeistenClick={() => rechterLeistenInputRef.current?.click()}
        linkerLeistenInputRef={linkerLeistenInputRef}
        rechterLeistenInputRef={rechterLeistenInputRef}
        onLinkerLeistenChange={(file, fileName) => {
          setLinkerLeistenFile(file);
          setLinkerLeistenFileName(fileName);
        }}
        onRechterLeistenChange={(file, fileName) => {
          setRechterLeistenFile(file);
          setRechterLeistenFileName(fileName);
        }}
      />

      {/* Checklist Section */}
      <div className="bg-white rounded-lg p-4 mx-auto">
        {GROUPS.map((g) => (
          <React.Fragment key={g.id}>
            {g.fieldType === "section" ? (
              <SectionHeader title={g.question} />
            ) : g.fieldType === "textarea" ? (
              <>
                <TextAreaField
                  def={g}
                  value={textAreas[g.id] ?? ""}
                  onChange={(value) =>
                    setTextAreas((prev) => ({ ...prev, [g.id]: value }))
                  }
                />
                <hr className="border-gray-200 my-4" />
              </>
            ) : g.fieldType === "text" ? (
              <>
                <TextField
                  def={g}
                  selected={selected[g.id] ?? null}
                  onSelect={(value) => setGroup(g.id, value)}
                />
                <hr className="border-gray-200 my-4" />
              </>
            ) : (
              <>
                <OptionGroup
                  def={g}
                  selected={selected[g.id] ?? null}
                  onSelect={(optId) => setGroup(g.id, optId)}
                  optionInputs={optionInputs}
                  setOptionInputs={setOptionInputs}
                />
                <hr className="border-gray-200 my-4" />
              </>
            )}
          </React.Fragment>
        ))}

        {/* Error Message */}
        {checkboxError && (
          <div className="mb-4 text-red-600 text-sm">
            Bitte beantworten Sie alle Pflichtfragen (Checkbox-Gruppen).
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            className="px-6 py-2 cursor-pointer border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            onClick={() => router.back()}
          >
            Abbrechen
          </button>
          <button
            className="px-6 py-2 cursor-pointer bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold"
            onClick={handleWeiterClick}
          >
            Weiter €{grandTotal.toFixed(2)}
          </button>
        </div>
      </div>

      {/* PDF Popup */}
      {showModal && (
        <PDFPopup
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={(pdfBlob?: Blob) => {
            if (pdfBlob) {
              const pdfFileObj = new File([pdfBlob], "invoice.pdf", {
                type: "application/pdf",
              });
              setPdfFile(pdfFileObj);
            }
            setShowModal(false);
            setShowModal2(true);
          }}
          allGroups={
            GROUPS.filter(
              (g) => g.fieldType !== "section" && g.fieldType !== "textarea",
            ) as GroupDef2[]
          }
          selected={selected}
          optionInputs={optionInputs}
          textAreas={textAreas}
          showDetails={true}
          orderData={orderDataForPDF}
        />
      )}

      {/* Completion Popup */}
      {showModal2 && (
        <CompletionPopUp
          onClose={() => setShowModal2(false)}
          productName={shoe.name}
          value={grandTotal.toFixed(2)}
          isLoading={isSubmitting}
          onConfirm={handleOrderSubmit}
        />
      )}
    </div>
  );
}

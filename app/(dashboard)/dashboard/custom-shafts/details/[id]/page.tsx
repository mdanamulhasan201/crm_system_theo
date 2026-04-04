'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSingleCustomShaft } from '@/hooks/customShafts/useSingleCustomShaft';
import { useGetSingleMassschuheOrder } from '@/hooks/massschuhe/useGetSingleMassschuheOrder';
import { useCustomShaftData } from '@/contexts/CustomShaftDataContext';
import { createMassschuheWithoutOrderIdWithoutCustomModels } from '@/apis/MassschuheAddedApis';
// import { prepareStep1FormData } from '@/utils/customShoeOrderHelpers';
import toast from 'react-hot-toast';
import CustomShaftDetailsShimmer from '@/components/ShimmerEffect/Maßschäfte/CustomShaftDetailsShimmer';
import StickyPriceSummary from '@/components/StickyPriceSummary/StickyPriceSummary';

// Import components
import FileUploadSection from '@/components/CustomShafts/FileUploadSection';
import ProductImageInfo from '@/components/CustomShafts/ProductImageInfo';
import ProductCadCategoryFields from '@/components/CustomShafts/ProductCadCategoryFields';
import ProductConfiguration, {
  type ProductConfigurationHandle,
} from '@/components/CustomShafts/ProductConfiguration';
import ConfirmationModal from '@/components/CustomShafts/ConfirmationModal';
import ShaftPDFPopup, { ShaftOrderDataForPDF, type ShaftConfiguration } from '@/components/CustomShafts/ShaftPDFPopup';
import CompletionPopUp from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Completion-PopUp';
import { LeatherColorAssignment } from '@/components/CustomShafts/LeatherColorSectionModal';
import type { ZipperPosition } from '@/components/CustomShafts/ZipperPlacementModal';
import {
  EMPTY_POLSTERUNG_MM,
  buildPolsterungTextPayload,
  type PolsterungMmFields,
} from '@/components/CustomShafts/polsterungPayload';
import { buildUmfangmasseWithTitles } from '@/utils/customShoeOrderHelpers';

function normalizeCustomerNameParam(raw: string | null): string {
  if (raw == null) return '';
  const t = raw.trim();
  if (!t) return '';
  try {
    return decodeURIComponent(t.replace(/\+/g, ' '));
  } catch {
    return t.replace(/\+/g, ' ');
  }
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  createdAt: string;
}

interface BusinessAddressData {
  companyName: string;
  address: string;
  price: number;
  phone: string;
  email: string;
}

interface VersendenData {
  company: string;
  street: string;
  city: string;
  country: string;
}

export default function CollectionShaftDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { setCustomShaftData: setContextData } = useCustomShaftData();

  // Get params
  const shaftId = params.id as string;
  const orderId = searchParams.get('orderId');
  const prefilledCustomerId = searchParams.get('customerId');
  const prefilledCustomerName = searchParams.get('customerName');
  const type = searchParams.get('type');
  const source = searchParams.get('source');
  const isAbholung = type === 'abholung';
  const isFrom3DUpload = source === '3dupload';
  const hasPrefilledCustomer = Boolean(
    prefilledCustomerId?.trim() || prefilledCustomerName?.trim()
  );

  const isUuidOrderId = typeof orderId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId);

  // Fetch data
  const { data: apiData, loading: shaftLoading, error: shaftError } = useSingleCustomShaft(shaftId);
  const { order: massschuheOrder, loading: orderLoading } = useGetSingleMassschuheOrder(isUuidOrderId ? orderId : null);
  
  const shaft = apiData?.data;
  const loading = shaftLoading || (isUuidOrderId && orderLoading);
  const error = shaftError;

  // Customer selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [otherCustomerNumber, setOtherCustomerNumber] = useState<string>('');

  // 3D Model files
  const [linkerLeistenFileName, setLinkerLeistenFileName] = useState('');
  const [rechterLeistenFileName, setRechterLeistenFileName] = useState('');
  const [linkerLeistenFile, setLinkerLeistenFile] = useState<File | null>(null);
  const [rechterLeistenFile, setRechterLeistenFile] = useState<File | null>(null);

  // Product configuration
  const [customCategory, setCustomCategory] = useState<string>('');
  const [customCategoryPrice, setCustomCategoryPrice] = useState<number | null>(null);
  const [cadModeling, setCadModeling] = useState<'1x' | '2x'>('1x');

  // Leather configuration
  const [lederType, setLederType] = useState('');
  const [lederfarbe, setLederfarbe] = useState('');
  const [numberOfLeatherColors, setNumberOfLeatherColors] = useState<string>('');
  const [leatherColorAssignments, setLeatherColorAssignments] = useState<LeatherColorAssignment[]>([]);
  const [leatherColors, setLeatherColors] = useState<string[]>([]);

  // Shaft configuration
  const [innenfutter, setInnenfutter] = useState('');
  const [schafthohe, setSchafthohe] = useState('');
  const [schafthoheLinks, setSchafthoheLinks] = useState('');
  const [schafthoheRechts, setSchafthoheRechts] = useState('');
  const [umfangBei14Links, setUmfangBei14Links] = useState('');
  const [umfangBei16Links, setUmfangBei16Links] = useState('');
  const [umfangBei18Links, setUmfangBei18Links] = useState('');
  const [knoechelumfangLinks, setKnoechelumfangLinks] = useState('');
  const [umfangBei14Rechts, setUmfangBei14Rechts] = useState('');
  const [umfangBei16Rechts, setUmfangBei16Rechts] = useState('');
  const [umfangBei18Rechts, setUmfangBei18Rechts] = useState('');
  const [knoechelumfangRechts, setKnoechelumfangRechts] = useState('');
  const [polsterung, setPolsterung] = useState<string[]>(['Standard']);
  const [verstarkungen, setVerstarkungen] = useState<string[]>(['Standard']);
  const [polsterungText, setPolsterungText] = useState('');
  const [polsterungMm, setPolsterungMm] = useState<PolsterungMmFields>(EMPTY_POLSTERUNG_MM);
  const [verstarkungenText, setVerstarkungenText] = useState('');

  // Seam color
  const [nahtfarbeOption, setNahtfarbeOption] = useState('default');
  const [customNahtfarbe, setCustomNahtfarbe] = useState('');
  const [ziernahtVorhanden, setZiernahtVorhanden] = useState<boolean | undefined>(undefined);

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Closure type
  const [closureType, setClosureType] = useState<string>('Eyelets');
  const [offenstandSchnuerungMm, setOffenstandSchnuerungMm] = useState('');
  const [anzahlOesen, setAnzahlOesen] = useState('');
  const [anzahlHaken, setAnzahlHaken] = useState('');
  const [anzahlKlettstreifen, setAnzahlKlettstreifen] = useState('');
  const [breiteKlettstreifenMm, setBreiteKlettstreifenMm] = useState('');

  // Add-ons
  const [passendenSchnursenkel, setPassendenSchnursenkel] = useState<boolean | undefined>(undefined);
  const [osenEinsetzen, setOsenEinsetzen] = useState<boolean | undefined>(undefined);
  const [zipperExtra, setZipperExtra] = useState<boolean | undefined>(undefined);
  const [zipperPosition, setZipperPosition] = useState<ZipperPosition | null>(null);

  // Additional images
  const [zipperImage, setZipperImage] = useState<string | null>(null);
  const [paintImage, setPaintImage] = useState<string | null>(null);

  // Business address for courier (abholung)
  const [businessAddress, setBusinessAddress] = useState<BusinessAddressData | null>(null);
  // Versenden data (shipping address)
  const [versendenData, setVersendenData] = useState<VersendenData | null>(null);
  const [highlightDeliveryChoice, setHighlightDeliveryChoice] = useState(false);
  const [highlight3dUploads, setHighlight3dUploads] = useState(false);

  // Modal states
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isLoadingBodenKonfigurieren, setIsLoadingBodenKonfigurieren] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pendingAction, setPendingAction] = useState<'boden' | 'ohne-boden' | null>(null);
  const productConfigRef = useRef<ProductConfigurationHandle>(null);

  // Pricing constants
  const SCHNURSENKEL_PRICE = 4.49;
  const OSEN_EINSETZEN_PRICE = 8.99;
  const ZIPPER_EXTRA_PRICE = 9.99;   // Inside or Outside
  const ZIPPER_BOTH_PRICE = 19.99;   // Both sides
  const CAD_MODELING_2X_PRICE = 6.99;
  const COURIER_PRICE_DEFAULT = 13.0;

  useEffect(() => {
    const deliveryOk =
      !!(businessAddress?.companyName || businessAddress?.address) || !!versendenData;
    if (deliveryOk) setHighlightDeliveryChoice(false);
  }, [businessAddress, versendenData]);

  useEffect(() => {
    if (linkerLeistenFile && rechterLeistenFile) setHighlight3dUploads(false);
  }, [linkerLeistenFile, rechterLeistenFile]);

  // Pre-fill customer from URL or linked Massschuh order (never use empty id — API needs customerId or other_customer_name)
  useEffect(() => {
    const urlId = prefilledCustomerId?.trim();
    const urlName = normalizeCustomerNameParam(prefilledCustomerName);

    if (urlId || urlName) {
      if (urlId) {
        setSelectedCustomer({
          id: urlId,
          name: urlName || urlId,
          email: '',
          phone: null,
          location: '',
          createdAt: '',
        });
        setOtherCustomerNumber('');
      } else {
        setSelectedCustomer(null);
        setOtherCustomerNumber(urlName || '');
      }
      return;
    }
    if (massschuheOrder) {
      const orderWithCustomer = massschuheOrder as any;
      if (orderWithCustomer.customer) {
        const customer = orderWithCustomer.customer;
        setSelectedCustomer({
          id: customer.id,
          name: `${customer.vorname || ''} ${customer.nachname || ''}`.trim(),
          email: customer.email || '',
          phone: null,
          location: '',
          createdAt: '',
        });
      } else if (massschuheOrder.customerId && massschuheOrder.kunde && massschuheOrder.email) {
        setSelectedCustomer({
          id: massschuheOrder.customerId,
          name: massschuheOrder.kunde,
          email: massschuheOrder.email,
          phone: massschuheOrder.telefon || null,
          location: massschuheOrder.location || '',
          createdAt: '',
        });
      }
    }
  }, [prefilledCustomerId, prefilledCustomerName, massschuheOrder]);

  // Pre-fill category from shaft
  useEffect(() => {
    if (!shaft) return;
    if (customCategory) return;

    const initialCategory = shaft?.catagoary || '';
    if (initialCategory) {
      setCustomCategory(initialCategory);
    }
  }, [shaft, customCategory]);

  // Pre-fill closure type from shaft when API provides it (default remains Ösen / Eyelets)
  useEffect(() => {
    if (!shaft?.verschlussart) return;
    setClosureType(shaft.verschlussart);
  }, [shaft?.id, shaft?.verschlussart]);

  // Reißverschluss: API `is_zipper` — true → default „Ja +9,99 €“, false → default „Nein“ (beide Optionen bleiben wählbar)
  useEffect(() => {
    if (!shaft) return;
    if (shaft.is_zipper === true) {
      setZipperExtra(true);
    } else if (shaft.is_zipper === false) {
      setZipperExtra(false);
      setZipperPosition(null);
      setZipperImage(null);
    }
  }, [shaft]);

  // Reset business address when not in abholung mode
  useEffect(() => {
    if (!isAbholung) {
      setBusinessAddress(null);
    }
  }, [isAbholung]);

  // Determine delivery method for PDF display
  const getDeliveryMethod = (): string => {
    // Check if 3D Upload was selected (from URL source parameter or if 3D files exist)
    if (isFrom3DUpload || linkerLeistenFile || rechterLeistenFile) {
      return '3D-Upload';
    }
    // Check if Abholung (pickup) is selected
    if (isAbholung && businessAddress && (businessAddress.companyName || businessAddress.address)) {
      return 'Leisten abholen lassen';
    }
    // Check if Versenden (shipping) is selected
    if (versendenData && (versendenData.company || versendenData.street || versendenData.city)) {
      return 'Selber versenden';
    }
    // Default fallback
    return '3D-Upload';
  };

  const deliveryMethod = getDeliveryMethod();

  // Build formatted circumference strings for PDF/display (from structured fields)
  const formatUmfangmasseSide = (u15: string, u16: string, u18: string, knoechel: string) => {
    const parts: string[] = [];
    if (u15?.trim()) parts.push(`Umfang 15 cm: ${u15.trim()} cm`);
    if (u16?.trim()) parts.push(`Umfang 16 cm: ${u16.trim()} cm`);
    if (u18?.trim()) parts.push(`Umfang 18 cm: ${u18.trim()} cm`);
    if (knoechel?.trim()) parts.push(`Knöchelumfang: ${knoechel.trim()} cm`);
    return parts.length ? parts.join(', ') : '';
  };
  const umfangmasseLinksDisplay = formatUmfangmasseSide(umfangBei14Links, umfangBei16Links, umfangBei18Links, knoechelumfangLinks);
  const umfangmasseRechtsDisplay = formatUmfangmasseSide(umfangBei14Rechts, umfangBei16Rechts, umfangBei18Rechts, knoechelumfangRechts);
  const umfangmasseLinksDetailed = buildUmfangmasseWithTitles(
    knoechelumfangLinks,
    umfangBei14Links,
    umfangBei16Links,
    umfangBei18Links
  );
  const umfangmasseRechtsDetailed = buildUmfangmasseWithTitles(
    knoechelumfangRechts,
    umfangBei14Rechts,
    umfangBei16Rechts,
    umfangBei18Rechts
  );
  const courierPickupSummary =
    businessAddress && (businessAddress.companyName || businessAddress.address)
      ? [
          businessAddress.companyName,
          businessAddress.address,
          businessAddress.phone ? `Tel: ${businessAddress.phone}` : '',
          businessAddress.email ? `E-Mail: ${businessAddress.email}` : '',
        ]
          .filter(Boolean)
          .join(' · ')
      : null;

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = (shaft?.price ?? customCategoryPrice) || 0;

    // CAD modeling surcharge
    if (cadModeling === '2x') {
      total += CAD_MODELING_2X_PRICE;
    }

    // Add-ons
    if (passendenSchnursenkel) total += SCHNURSENKEL_PRICE;
    if (osenEinsetzen) total += OSEN_EINSETZEN_PRICE;
    if (zipperExtra) {
      total += zipperPosition === 'both' ? ZIPPER_BOTH_PRICE : ZIPPER_EXTRA_PRICE;
    }

    // Courier price
    if (isAbholung && businessAddress) {
      total += Number.isFinite(businessAddress.price) ? businessAddress.price : COURIER_PRICE_DEFAULT;
    }

    return total;
  };

  const orderPrice = calculateTotalPrice();

  const polsterungTextForPdf = buildPolsterungTextPayload(
    polsterungText,
    polsterungMm,
    polsterung.includes('Erweitert')
  );
  const isSingleLeatherMode = numberOfLeatherColors === '1';
  const normalizedLeatherType = isSingleLeatherMode ? lederType : '';
  const normalizedLeatherColor = isSingleLeatherMode ? lederfarbe : '';
  const normalizedLeatherColors = !isSingleLeatherMode ? leatherColors.filter(Boolean) : [];
  const normalizedLeatherColorAssignments =
    !isSingleLeatherMode ? leatherColorAssignments : [];
  const shaftConfigurationForOutput: ShaftConfiguration = {
    customCategory,
    cadModeling,
    lederType: normalizedLeatherType,
    lederfarbe: normalizedLeatherColor,
    numberOfLeatherColors,
    leatherColors: normalizedLeatherColors,
    leatherColorAssignments:
      numberOfLeatherColors === '2' || numberOfLeatherColors === '3'
        ? normalizedLeatherColorAssignments
        : undefined,
    innenfutter,
    schafthohe,
    schafthoheLinks,
    schafthoheRechts,
    umfangmasseLinks: umfangmasseLinksDisplay,
    umfangmasseRechts: umfangmasseRechtsDisplay,
    umfangmasseLinksDetailed: umfangmasseLinksDetailed.length > 0 ? umfangmasseLinksDetailed : undefined,
    umfangmasseRechtsDetailed: umfangmasseRechtsDetailed.length > 0 ? umfangmasseRechtsDetailed : undefined,
    versendenAddress: versendenData ?? undefined,
    courierPickupSummary,
    polsterung,
    verstarkungen,
    polsterungText: polsterungTextForPdf,
    verstarkungenText,
    nahtfarbe: nahtfarbeOption === 'custom' ? customNahtfarbe : (nahtfarbeOption || 'default'),
    nahtfarbeOption,
    ziernahtVorhanden,
    closureType,
    offenstandSchnuerungMm,
    anzahlOesen,
    anzahlHaken,
    anzahlKlettstreifen,
    breiteKlettstreifenMm,
    passendenSchnursenkel,
    osenEinsetzen,
    zipperExtra,
    zipperPosition,
    additionalNotes,
    deliveryMethod,
  };

  // Prepare order data for PDF
  const orderDataForPDF: ShaftOrderDataForPDF = {
    orderNumber: orderId ? `#${orderId}` : undefined,
    customerName: selectedCustomer?.name || otherCustomerNumber.trim() || 'Kunde',
    productName: shaft?.name || 'Maßschaft',
    deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'), // 2 weeks from now
    totalPrice: orderPrice,
  };

  // Validate customer selection (registered customer must have a non-empty id)
  const validateCustomer = (): boolean => {
    const hasRegisteredId = !!selectedCustomer?.id?.trim();
    const hasOtherName = !!otherCustomerNumber.trim();
    if (!hasRegisteredId && !hasOtherName) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return false;
    }
    return true;
  };

  // Prepare collection shaft data
  const prepareCollectionShaftData = () => {
    return {
      // Customer info
      customerId: selectedCustomer?.id?.trim() || undefined,
      other_customer_name: otherCustomerNumber.trim() || null,
      customerName: selectedCustomer?.name || otherCustomerNumber.trim(),

      // Collection product ID (instead of custom images)
      mabschaftKollektionId: shaftId,

      // Images
      uploadedImage: null, // No custom image for collection
      zipperImage,
      paintImage,

      // Files
      image3d_1_file: rechterLeistenFile,
      image3d_2_file: linkerLeistenFile,

      // Product info (from collection, not custom)
      productDescription: shaft?.name || '',
      customCategory,
      customCategoryPrice: shaft?.price || customCategoryPrice,

      // CAD modeling
      cadModeling,
      cadModeling_2x_price: cadModeling === '2x' ? CAD_MODELING_2X_PRICE : null,

      // Leather configuration
      lederType: normalizedLeatherType,
      lederfarbe: normalizedLeatherColor,
      numberOfLeatherColors,
      leatherColors: normalizedLeatherColors,
      leatherColorAssignments: normalizedLeatherColorAssignments,

      // Shaft configuration
      innenfutter,
      schafthohe,
      schafthoheLinks,
      schafthoheRechts,
      umfangmasseLinks: umfangmasseLinksDisplay,
      umfangmasseRechts: umfangmasseRechtsDisplay,
      umfangBei14Links,
      umfangBei16Links,
      umfangBei18Links,
      knoechelumfangLinks,
      umfangBei14Rechts,
      umfangBei16Rechts,
      umfangBei18Rechts,
      knoechelumfangRechts,
      polsterung,
      verstarkungen,
      polsterung_text: buildPolsterungTextPayload(
        polsterungText,
        polsterungMm,
        polsterung.includes('Erweitert')
      ),
      verstarkungen_text: verstarkungenText,

      // Seam and closure – send selected Nahtfarbe option (default | personal | custom value)
      nahtfarbe: nahtfarbeOption === 'custom' ? (customNahtfarbe?.trim() || '') : (nahtfarbeOption || 'default'),
      nahtfarbe_text: nahtfarbeOption === 'custom' ? (customNahtfarbe?.trim() || '') : '',
      ziernahtVorhanden: typeof ziernahtVorhanden === 'boolean' ? ziernahtVorhanden : undefined,
      closureType,
      offenstandSchnuerungMm: offenstandSchnuerungMm.trim() || undefined,
      anzahlOesen: anzahlOesen.trim() || undefined,
      anzahlHaken: anzahlHaken.trim() || undefined,
      anzahlKlettstreifen: anzahlKlettstreifen.trim() || undefined,
      breiteKlettstreifenMm: breiteKlettstreifenMm.trim() || undefined,

      // Add-ons
      passenden_schnursenkel: passendenSchnursenkel === true,
      moechten_sie_passende_schnuersenkel_zum_schuh_price: passendenSchnursenkel === true ? '4.49' : null,
      osen_einsetzen: osenEinsetzen === true,
      moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: osenEinsetzen === true ? '8.99' : null,
      zipper_extra: zipperExtra === true,
      zipper_position: zipperPosition ?? undefined,
      moechten_sie_einen_zusaetzlichen_reissverschluss_price: zipperExtra === true
        ? (zipperPosition === 'both' ? '19.99' : '9.99')
        : null,

      // Business address
      businessAddress,
      isAbholung,
      versendenData,

      // Additional notes
      additionalNotes: additionalNotes.trim() || null,

      // Lieferweg für Payload / meta
      deliveryMethod,

      // Pricing
      totalPrice: orderPrice,
    };
  };

  // Prepare FormData for collection products (custom_models=false)
  // Key difference from custom orders: Sends mabschaftKollektionId instead of custom_models_image
  const prepareCollectionFormData = async (data: any, pdfBlobData: Blob | null = null): Promise<FormData> => {
    const formData = new FormData();

    // Customer info (customerId OR other_customer_name)
    const cid = typeof data.customerId === 'string' ? data.customerId.trim() : '';
    if (cid) {
      formData.append('customerId', cid);
    } else if (data.other_customer_name?.trim()) {
      formData.append('other_customer_name', data.other_customer_name.trim());
    }

    // Add PDF invoice if available
    if (pdfBlobData) {
      console.log('📎 Adding invoice to FormData:', pdfBlobData.size, 'bytes');
      formData.append('invoice', pdfBlobData, 'invoice.pdf');
    } else {
      console.warn('⚠️ No PDF blob provided to prepareCollectionFormData');
    }

    // 3D model files (optional)
    if (data.image3d_1_file) {
      formData.append('image3d_1', data.image3d_1_file);
    }
    if (data.image3d_2_file) {
      formData.append('image3d_2', data.image3d_2_file);
    }

    // ⭐ Collection product ID (REQUIRED for collection orders)
    // This is the key field that identifies which collection product was selected
    formData.append('mabschaftKollektionId', data.mabschaftKollektionId);

    // Additional images (optional)
    if (data.zipperImage) {
      const { convertImageToFile } = require('@/utils/customShoeOrderHelpers');
      const zipperImageFile = await convertImageToFile(data.zipperImage, 'zipper_image.png');
      if (zipperImageFile) {
        formData.append('zipper_image', zipperImageFile);
      }
    }

    if (data.paintImage) {
      const { convertImageToFile } = require('@/utils/customShoeOrderHelpers');
      const paintImageFile = await convertImageToFile(data.paintImage, 'paint_image.png');
      if (paintImageFile) {
        formData.append('paintImage', paintImageFile);
      }
    }

    // Massschafterstellung_json1 (all shaft configuration: leather, height, closures, add-ons, etc.)
    const { prepareMassschafterstellungJson1 } = require('@/utils/customShoeOrderHelpers');
    const massschafterstellungJson1 = prepareMassschafterstellungJson1(data);
    formData.append('Massschafterstellung_json1', JSON.stringify(massschafterstellungJson1));

    // Total price (including add-ons and courier if applicable)
    formData.append('totalPrice', data.totalPrice.toString());

    // Courier/Business address (if Abholung/pickup option selected)
    if (data.isAbholung && data.businessAddress) {
      // Send individual courier fields
      formData.append('courier_companyName', data.businessAddress.companyName);
      formData.append('courier_phone', data.businessAddress.phone);
      formData.append('courier_email', data.businessAddress.email);
      formData.append(
        'courier_price',
        String(
          Number.isFinite(data.businessAddress.price) ? data.businessAddress.price : COURIER_PRICE_DEFAULT
        )
      );
      
      // Only courier_address as JSON object
      const courierAddressObj = {
        address: data.businessAddress.address,
      };
      formData.append('courier_address', JSON.stringify(courierAddressObj));
    }

    // Versenden data (if Versenden/shipping option selected)
    if (data.versendenData) {
      formData.append('versenden', JSON.stringify(data.versendenData));
    }

    // Additional notes are now only in Massschafterstellung_json1, not as separate field

    return formData;
  };

  // Handle "JA, BODEN KONFIGURIEREN" - Show PDF popup to generate PDF, then redirect
  const handleBodenKonfigurieren = async () => {
    if (!validateCustomer()) return;

    setIsLoadingBodenKonfigurieren(true);
    
    // Close confirmation modal and show PDF popup
    setShowConfirmationModal(false);
    setPendingAction('boden');
    setShowPDFModal(true);
  };

  // Handle "NEIN, WEITER OHNE BODEN" - Show PDF first, then submit
  const handleOrderWithoutBoden = async () => {
    if (!validateCustomer()) return;

    // Show PDF modal first
    setPendingAction('ohne-boden');
    setShowPDFModal(true);
  };

  // After PDF is confirmed, proceed with order creation - Optimized function
  const proceedWithOrderWithoutBoden = async (blobToUse?: Blob | null, deliveryDate?: string | null) => {
    setIsCreatingOrder(true);

    try {
      // Use the passed blob or fall back to state
      const finalBlob = blobToUse !== undefined ? blobToUse : pdfBlob;
      
      // Determine isCourierContact FIRST (synchronous, fast) - before async operations
      const has3DFiles = !!(linkerLeistenFile || rechterLeistenFile);
      const isAbholenSelected = !!(businessAddress && (businessAddress.companyName || businessAddress.address));
      const isVersendenSelected = !!versendenData;
      
      const isCourierContact: 'yes' | 'no' = has3DFiles 
        ? 'no' 
        : (isAbholenSelected ? 'yes' : (isVersendenSelected ? 'no' : 'yes'));

      // Prepare collection shaft data (synchronous)
      const collectionShaftData = prepareCollectionShaftData();

      // Prepare FormData with mabschaftKollektionId and all configuration (async operation)
      const formData = await prepareCollectionFormData(collectionShaftData, finalBlob);

      // Add delivery date to payload when provided (DD.MM.YYYY from modal -> ISO)
      if (deliveryDate && /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(deliveryDate)) {
        const [d, m, y] = deliveryDate.split('.').map(Number);
        formData.append('deliveryDate', new Date(y, m - 1, d).toISOString());
      }

      // Existing shoe order linkage must go in body, not URL params.
      if (orderId) {
        formData.append('shoe_order_id', orderId);
      }
      const response = await createMassschuheWithoutOrderIdWithoutCustomModels(formData, isCourierContact);

      toast.success(response.message || (orderId ? "Bestellung erfolgreich aktualisiert!" : "Bestellung erfolgreich erstellt!"), { id: "creating-order" });

      // Order completed without Bodenkonstruktion → Close modals and redirect to balance dashboard
      setShowPDFModal(false);
      setShowConfirmationModal(false);
      setShowCompletionModal(false);
      router.push('/dashboard/balance-dashboard');
    } catch (error) {
      console.error('Error creating/updating order:', error);
      toast.error("Fehler beim Erstellen/Aktualisieren der Bestellung.", { id: "creating-order" });
      setIsCreatingOrder(false);
    }
  };

  // Loading state
  if (loading) {
    return <CustomShaftDetailsShimmer />;
  }

  // Error state
  if (error) {
    return (
      <div className="px-2 md:px-6 py-8 w-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 text-lg font-medium mb-2">Fehler beim Laden der Daten</div>
        <div className="text-gray-400 text-sm text-center">{error}</div>
      </div>
    );
  }

  // Product not found
  if (!shaft) {
    return (
      <div className="px-2 md:px-6 py-8 w-full flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-lg font-medium mb-2">Produkt nicht gefunden</div>
        <div className="text-gray-400 text-sm text-center">
          Das angeforderte Produkt konnte nicht gefunden werden.
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-2 md:px-6 py-8 w-full pb-24">
      <StickyPriceSummary
        price={orderPrice}
        onWeiterClick={() => productConfigRef.current?.submitOrder()}
        isSubmitting={isCreatingOrder}
      />

      {/* File Upload Section */}
      <FileUploadSection
        linkerLeistenFileName={linkerLeistenFileName}
        setLinkerLeistenFileName={setLinkerLeistenFileName}
        rechterLeistenFileName={rechterLeistenFileName}
        setRechterLeistenFileName={setRechterLeistenFileName}
        linkerLeistenFile={linkerLeistenFile}
        setLinkerLeistenFile={setLinkerLeistenFile}
        rechterLeistenFile={rechterLeistenFile}
        setRechterLeistenFile={setRechterLeistenFile}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        otherCustomerNumber={otherCustomerNumber}
        setOtherCustomerNumber={setOtherCustomerNumber}
        hideCustomerSearch={false}
        lockCustomerSelection={hasPrefilledCustomer}
        hideExternalCustomer={hasPrefilledCustomer}
        hideFileUploads={isAbholung}
        businessAddress={businessAddress}
        onBusinessAddressSave={(data) => {
          if (!data.companyName && !data.address) {
            setBusinessAddress(null);
          } else {
            setBusinessAddress({
              companyName: data.companyName,
              address: data.address,
              price: Number.isFinite(data.price) ? data.price : COURIER_PRICE_DEFAULT,
              phone: data.phone || '',
              email: data.email || '',
            });
          }
        }}
        versendenData={versendenData}
        onVersendenChange={setVersendenData}
        orderId={orderId}
        highlightDeliveryChoice={highlightDeliveryChoice}
        highlight3dUploads={highlight3dUploads}
      />

      <div className="flex flex-col ">
        {/* Heading */}
        <div className="text-left mb-6">
          <h1 className="text-lg md:text-xl font-bold text-gray-800 mb-4 uppercase">
            Massschaftkonfigurator
          </h1>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        {/* Product image, details, CAD & Kategorie — one card */}
        <ProductImageInfo
          shaft={shaft}
          footer={
            <ProductCadCategoryFields
              layout="card"
              cadModeling={cadModeling}
              setCadModeling={setCadModeling}
              customCategory={customCategory}
              setCustomCategory={setCustomCategory}
              setCustomCategoryPrice={setCustomCategoryPrice}
              category={shaft?.catagoary}
              allowCategoryEdit={false}
            />
          }
        />

        {/* Product Configuration */}
        <ProductConfiguration
          ref={productConfigRef}
          hideCadAndCategory
          disableZiernahtVorhanden={shaft?.ziernaht === false}
          cadModeling={cadModeling}
          setCadModeling={setCadModeling}
          customCategory={customCategory}
          setCustomCategory={setCustomCategory}
          customCategoryPrice={customCategoryPrice}
          setCustomCategoryPrice={setCustomCategoryPrice}
          nahtfarbeOption={nahtfarbeOption}
          setNahtfarbeOption={setNahtfarbeOption}
          customNahtfarbe={customNahtfarbe}
          setCustomNahtfarbe={setCustomNahtfarbe}
          ziernahtVorhanden={ziernahtVorhanden}
          setZiernahtVorhanden={setZiernahtVorhanden}
          passendenSchnursenkel={passendenSchnursenkel}
          setPassendenSchnursenkel={setPassendenSchnursenkel}
          osenEinsetzen={osenEinsetzen}
          setOsenEinsetzen={setOsenEinsetzen}
          zipperExtra={zipperExtra}
          setZipperExtra={(v) => {
            setZipperExtra(v);
            if (v === false) {
              setZipperPosition(null);
              setZipperImage(null);
            }
          }}
          zipperPosition={zipperPosition}
          setZipperPosition={setZipperPosition}
          closureType={closureType}
          setClosureType={setClosureType}
          offenstandSchnuerungMm={offenstandSchnuerungMm}
          setOffenstandSchnuerungMm={setOffenstandSchnuerungMm}
          anzahlOesen={anzahlOesen}
          setAnzahlOesen={setAnzahlOesen}
          anzahlHaken={anzahlHaken}
          setAnzahlHaken={setAnzahlHaken}
          anzahlKlettstreifen={anzahlKlettstreifen}
          setAnzahlKlettstreifen={setAnzahlKlettstreifen}
          breiteKlettstreifenMm={breiteKlettstreifenMm}
          setBreiteKlettstreifenMm={setBreiteKlettstreifenMm}
          lederType={lederType}
          setLederType={setLederType}
          lederfarbe={lederfarbe}
          setLederfarbe={setLederfarbe}
          innenfutter={innenfutter}
          setInnenfutter={setInnenfutter}
          schafthohe={schafthohe}
          setSchafthohe={setSchafthohe}
          schafthoheLinks={schafthoheLinks}
          setSchafthoheLinks={setSchafthoheLinks}
          schafthoheRechts={schafthoheRechts}
          setSchafthoheRechts={setSchafthoheRechts}
          umfangBei14Links={umfangBei14Links}
          setUmfangBei14Links={setUmfangBei14Links}
          umfangBei16Links={umfangBei16Links}
          setUmfangBei16Links={setUmfangBei16Links}
          umfangBei18Links={umfangBei18Links}
          setUmfangBei18Links={setUmfangBei18Links}
          knoechelumfangLinks={knoechelumfangLinks}
          setKnoechelumfangLinks={setKnoechelumfangLinks}
          umfangBei14Rechts={umfangBei14Rechts}
          setUmfangBei14Rechts={setUmfangBei14Rechts}
          umfangBei16Rechts={umfangBei16Rechts}
          setUmfangBei16Rechts={setUmfangBei16Rechts}
          umfangBei18Rechts={umfangBei18Rechts}
          setUmfangBei18Rechts={setUmfangBei18Rechts}
          knoechelumfangRechts={knoechelumfangRechts}
          setKnoechelumfangRechts={setKnoechelumfangRechts}
          polsterung={polsterung}
          setPolsterung={setPolsterung}
          polsterungMm={polsterungMm}
          setPolsterungMm={setPolsterungMm}
          verstarkungen={verstarkungen}
          setVerstarkungen={setVerstarkungen}
          polsterungText={polsterungText}
          setPolsterungText={setPolsterungText}
          verstarkungenText={verstarkungenText}
          setVerstarkungenText={setVerstarkungenText}
          numberOfLeatherColors={numberOfLeatherColors}
          setNumberOfLeatherColors={setNumberOfLeatherColors}
          leatherColorAssignments={leatherColorAssignments}
          setLeatherColorAssignments={setLeatherColorAssignments}
          leatherColors={leatherColors}
          setLeatherColors={setLeatherColors}
          shoeImage={shaft?.image || null}
          onDeliveryChoiceRequired={() => setHighlightDeliveryChoice(true)}
          onOrderComplete={() => {
            if (!isAbholung) {
              if (!linkerLeistenFile || !rechterLeistenFile) {
                setHighlight3dUploads(true);
                toast.error('Bitte laden Sie beide 3D-Dateien hoch (Linker Leisten und Rechter Leisten).');
                return false;
              }
            }
            setShowConfirmationModal(true);
          }}
          category={shaft?.catagoary}
          allowCategoryEdit={false}
          zipperImage={zipperImage}
          setZipperImage={setZipperImage}
          paintImage={paintImage}
          setPaintImage={setPaintImage}
          requireAbholenOrVersenden={isAbholung}
          isAbholenSelected={!!(businessAddress && (businessAddress.companyName || businessAddress.address))}
          isVersendenSelected={!!versendenData}
          additionalNotes={additionalNotes}
          setAdditionalNotes={setAdditionalNotes}
        />
      </div>

      {/* PDF Popup */}
      {showPDFModal && (
        <ShaftPDFPopup
          isOpen={showPDFModal}
          onClose={() => {
            setShowPDFModal(false);
            setPendingAction(null);
            setIsLoadingBodenKonfigurieren(false);
          }}
          onConfirm={(blob) => {
            console.log('📄 PDF Blob received in page:', blob ? `${blob.size} bytes` : 'null');
            setPdfBlob(blob || null);
            setShowPDFModal(false);

            // If this is for Boden configuration, redirect immediately
            if (pendingAction === 'boden') {
              const collectionShaftData = prepareCollectionShaftData();
              
              // Store data in context INCLUDING the shaft PDF blob and product image for header
              setContextData({
                ...collectionShaftData,
                shaftPdfBlob: blob || null,
                productImage: shaft?.image || null,
                productId: shaftId,
              } as any);

              setIsLoadingBodenKonfigurieren(false);
              
              // Redirect to Bodenkonstruktion page (Step 2) with orderId and productId in URL
              const params = new URLSearchParams();
              if (orderId) params.set('orderId', orderId);
              params.set('productId', shaftId);
              const redirectUrl = `/dashboard/massschuhauftraege-deatils/2?${params.toString()}`;
              
              router.push(redirectUrl);
            } else {
              // Otherwise show completion popup for "ohne-boden" flow
              setShowCompletionModal(true);
            }
          }}
          orderData={orderDataForPDF}
          shaftImage={shaft?.image || null}
          deliveryCategory={pendingAction === 'boden' ? 'Komplettfertigung' : pendingAction === 'ohne-boden' ? 'Massschafterstellung' : undefined}
          shaftConfiguration={shaftConfigurationForOutput}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleOrderWithoutBoden}
        onSendToAdmin2={() => {
          // Admin2 function placeholder (not needed for collection orders)
        }}
        onBodenKonfigurieren={handleBodenKonfigurieren}
        orderPrice={orderPrice}
        isVersenden={!!versendenData}
        versandPrice={COURIER_PRICE_DEFAULT}
        passendenSchnursenkel={passendenSchnursenkel}
        osenEinsetzen={osenEinsetzen}
        zipperExtra={zipperExtra}
        zipperPosition={zipperPosition}
        selectedCustomer={selectedCustomer}
        otherCustomerNumber={otherCustomerNumber}
        shaftName={shaft?.name}
        isCreatingWithoutBoden={isCreatingOrder}
        isLoadingBodenKonfigurieren={isLoadingBodenKonfigurieren}
        orderId={orderId}
        isFrom3DUpload={isFrom3DUpload}
      />

      {/* Completion Popup - Shows after PDF confirmation for "ohne-boden" only */}
      {showCompletionModal && (
        <CompletionPopUp
          onClose={() => {
            // Don't allow closing modal while order is being processed
            if (isCreatingOrder) {
              return;
            }
            setShowCompletionModal(false);
            setIsCreatingOrder(false);
          }}
          productName={shaft?.name || 'Maßschaft'}
          customerName={selectedCustomer?.name || otherCustomerNumber.trim() || 'Kunde'}
          value={orderPrice.toFixed(2)}
          isLoading={isCreatingOrder}
          deliveryCategory="Massschafterstellung"
          shaftConfiguration={shaftConfigurationForOutput}
          onConfirm={(deliveryDate) => {
            // Only "ohne-boden" flow uses completion popup now
            // Call function directly (no await - function handles async internally)
            // Modal will be closed after order is successfully completed in proceedWithOrderWithoutBoden
            if (pendingAction === 'ohne-boden') {
              proceedWithOrderWithoutBoden(pdfBlob, deliveryDate);
            }
            // Don't close modal here - let proceedWithOrderWithoutBoden handle it after success
          }}
        />
      )}
    </div>
  );
}

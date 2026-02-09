'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSingleCustomShaft } from '@/hooks/customShafts/useSingleCustomShaft';
import { useGetSingleMassschuheOrder } from '@/hooks/massschuhe/useGetSingleMassschuheOrder';
import { useCustomShaftData } from '@/contexts/CustomShaftDataContext';
import { createMassschuheWithoutOrderIdWithoutCustomModels } from '@/apis/MassschuheAddedApis';
import { sendMassschuheOrderToAdmin2 } from '@/apis/MassschuheManagemantApis';
// import { prepareStep1FormData } from '@/utils/customShoeOrderHelpers';
import toast from 'react-hot-toast';
import CustomShaftDetailsShimmer from '@/components/ShimmerEffect/Maßschäfte/CustomShaftDetailsShimmer';

// Import components
import FileUploadSection from '@/components/CustomShafts/FileUploadSection';
import ProductImageInfo from '@/components/CustomShafts/ProductImageInfo';
import ProductConfiguration from '@/components/CustomShafts/ProductConfiguration';
import ConfirmationModal from '@/components/CustomShafts/ConfirmationModal';
import ShaftPDFPopup, { ShaftOrderDataForPDF } from '@/components/CustomShafts/ShaftPDFPopup';
import CompletionPopUp from '@/app/(dashboard)/dashboard/_components/Massschuhauftraeges/Details/Completion-PopUp';
import { LeatherColorAssignment } from '@/components/CustomShafts/LeatherColorSectionModal';

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
  const type = searchParams.get('type');
  const source = searchParams.get('source');
  const isAbholung = type === 'abholung';
  const isFrom3DUpload = source === '3dupload';

  // Fetch data
  const { data: apiData, loading: shaftLoading, error: shaftError } = useSingleCustomShaft(shaftId);
  const { order: massschuheOrder, loading: orderLoading } = useGetSingleMassschuheOrder(orderId);
  
  const shaft = apiData?.data;
  const loading = orderLoading || shaftLoading;
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
  const [umfangmasseLinks, setUmfangmasseLinks] = useState('');
  const [umfangmasseRechts, setUmfangmasseRechts] = useState('');
  const [polsterung, setPolsterung] = useState<string[]>([]);
  const [verstarkungen, setVerstarkungen] = useState<string[]>([]);
  const [polsterungText, setPolsterungText] = useState('');
  const [verstarkungenText, setVerstarkungenText] = useState('');

  // Seam color
  const [nahtfarbeOption, setNahtfarbeOption] = useState('default');
  const [customNahtfarbe, setCustomNahtfarbe] = useState('');

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Closure type
  const [closureType, setClosureType] = useState<string>('');

  // Add-ons
  const [passendenSchnursenkel, setPassendenSchnursenkel] = useState<boolean | undefined>(undefined);
  const [osenEinsetzen, setOsenEinsetzen] = useState<boolean | undefined>(undefined);
  const [zipperExtra, setZipperExtra] = useState<boolean | undefined>(undefined);

  // Additional images
  const [zipperImage, setZipperImage] = useState<string | null>(null);
  const [paintImage, setPaintImage] = useState<string | null>(null);

  // Business address for courier (abholung)
  const [businessAddress, setBusinessAddress] = useState<BusinessAddressData | null>(null);
  // Versenden data (shipping address)
  const [versendenData, setVersendenData] = useState<VersendenData | null>(null);

  // Modal states
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isLoadingBodenKonfigurieren, setIsLoadingBodenKonfigurieren] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pendingAction, setPendingAction] = useState<'boden' | 'ohne-boden' | null>(null);

  // Pricing constants
  const SCHNURSENKEL_PRICE = 4.49;
  const OSEN_EINSETZEN_PRICE = 8.99;
  const ZIPPER_EXTRA_PRICE = 9.99;
  const CAD_MODELING_2X_PRICE = 6.99;
  const COURIER_PRICE_DEFAULT = 13.0;

  // Pre-fill customer from order
  useEffect(() => {
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
  }, [massschuheOrder]);

  // Pre-fill category from shaft
  useEffect(() => {
    if (!shaft) return;
    if (customCategory) return;

    const initialCategory = shaft?.catagoary || '';
    if (initialCategory) {
      setCustomCategory(initialCategory);
    }
  }, [shaft, customCategory]);

  // Pre-fill closure type from shaft
  useEffect(() => {
    if (!shaft) return;
    if (closureType) return;

    const initialClosureType = shaft?.verschlussart || '';
    if (initialClosureType) {
      setClosureType(initialClosureType);
    }
  }, [shaft, closureType]);

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
    if (zipperExtra) total += ZIPPER_EXTRA_PRICE;

    // Courier price
    if (isAbholung && businessAddress) {
      total += Number.isFinite(businessAddress.price) ? businessAddress.price : COURIER_PRICE_DEFAULT;
    }

    return total;
  };

  const orderPrice = calculateTotalPrice();

  // Prepare order data for PDF
  const orderDataForPDF: ShaftOrderDataForPDF = {
    orderNumber: orderId ? `#${orderId}` : undefined,
    customerName: selectedCustomer?.name || otherCustomerNumber.trim() || 'Kunde',
    productName: shaft?.name || 'Maßschaft',
    deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'), // 2 weeks from now
    totalPrice: orderPrice,
  };

  // Validate customer selection
  const validateCustomer = (): boolean => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return false;
    }
    return true;
  };

  // Prepare collection shaft data
  const prepareCollectionShaftData = () => {
    return {
      // Customer info
      customerId: selectedCustomer?.id,
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
      lederType,
      lederfarbe: numberOfLeatherColors === '1' ? lederfarbe : '',
      numberOfLeatherColors,
      leatherColors: numberOfLeatherColors !== '1' ? leatherColors : [],
      leatherColorAssignments: numberOfLeatherColors !== '1' ? leatherColorAssignments : [],

      // Shaft configuration
      innenfutter,
      schafthohe,
      schafthoheLinks,
      schafthoheRechts,
      umfangmasseLinks,
      umfangmasseRechts,
      polsterung,
      verstarkungen,
      polsterung_text: polsterungText,
      verstarkungen_text: verstarkungenText,

      // Seam and closure
      nahtfarbe: nahtfarbeOption === 'custom' ? customNahtfarbe : 'default',
      nahtfarbe_text: nahtfarbeOption === 'custom' ? customNahtfarbe : '',
      closureType,

      // Add-ons
      passenden_schnursenkel: passendenSchnursenkel === true,
      moechten_sie_passende_schnuersenkel_zum_schuh_price: passendenSchnursenkel === true ? '4.49' : null,
      osen_einsetzen: osenEinsetzen === true,
      moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: osenEinsetzen === true ? '8.99' : null,
      zipper_extra: zipperExtra === true,
      moechten_sie_einen_zusaetzlichen_reissverschluss_price: zipperExtra === true ? '9.99' : null,

      // Business address
      businessAddress,
      isAbholung,
      versendenData,

      // Additional notes
      additionalNotes: additionalNotes.trim() || null,

      // Pricing
      totalPrice: orderPrice,
    };
  };

  // Prepare FormData for collection products (custom_models=false)
  // Key difference from custom orders: Sends mabschaftKollektionId instead of custom_models_image
  const prepareCollectionFormData = async (data: any, pdfBlobData: Blob | null = null): Promise<FormData> => {
    const formData = new FormData();

    // Customer info (customerId OR other_customer_name)
    if (data.customerId) {
      formData.append('customerId', data.customerId);
    } else if (data.other_customer_name) {
      formData.append('other_customer_name', data.other_customer_name);
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
      formData.append('courier_price', '13');
      
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
  const proceedWithOrderWithoutBoden = async (blobToUse?: Blob | null) => {
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

      // Call appropriate API based on context
      const response = orderId
        ? await sendMassschuheOrderToAdmin2(orderId, formData, isCourierContact)
        : await createMassschuheWithoutOrderIdWithoutCustomModels(formData, isCourierContact);

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
    <div className="px-2 md:px-6 py-8 w-full">
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
        hideCustomerSearch={!!orderId}
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
      />

      <div className="flex flex-col border-2 border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-md">
        {/* Heading */}
        <div className="text-left mb-6">
          <h1 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            Massschaftkonfigurator
          </h1>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        {/* Product Image and Info */}
        <ProductImageInfo shaft={shaft} />

        {/* Product Configuration */}
        <ProductConfiguration
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
          passendenSchnursenkel={passendenSchnursenkel}
          setPassendenSchnursenkel={setPassendenSchnursenkel}
          osenEinsetzen={osenEinsetzen}
          setOsenEinsetzen={setOsenEinsetzen}
          zipperExtra={zipperExtra}
          setZipperExtra={setZipperExtra}
          closureType={closureType}
          setClosureType={setClosureType}
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
          umfangmasseLinks={umfangmasseLinks}
          setUmfangmasseLinks={setUmfangmasseLinks}
          umfangmasseRechts={umfangmasseRechts}
          setUmfangmasseRechts={setUmfangmasseRechts}
          polsterung={polsterung}
          setPolsterung={setPolsterung}
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
          onOrderComplete={() => setShowConfirmationModal(true)}
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
              
              // Store data in context INCLUDING the shaft PDF blob
              setContextData({
                ...collectionShaftData,
                shaftPdfBlob: blob || null,
              } as any);

              setIsLoadingBodenKonfigurieren(false);
              
              // Redirect to Bodenkonstruktion page (Step 2)
              const redirectUrl = orderId 
                ? `/dashboard/massschuhauftraege-deatils/2?orderId=${orderId}`
                : `/dashboard/massschuhauftraege-deatils/2`;
              
              router.push(redirectUrl);
            } else {
              // Otherwise show completion popup for "ohne-boden" flow
              setShowCompletionModal(true);
            }
          }}
          orderData={orderDataForPDF}
          shaftImage={shaft?.image || null}
          shaftConfiguration={{
            customCategory,
            cadModeling,
            lederType,
            lederfarbe,
            numberOfLeatherColors,
            leatherColors,
            innenfutter,
            schafthohe,
            schafthoheLinks,
            schafthoheRechts,
            umfangmasseLinks,
            umfangmasseRechts,
            polsterung,
            verstarkungen,
            polsterungText,
            verstarkungenText,
            nahtfarbe: nahtfarbeOption === 'custom' ? customNahtfarbe : (nahtfarbeOption || 'default'),
            nahtfarbeOption: nahtfarbeOption,
            closureType,
            passendenSchnursenkel,
            osenEinsetzen,
            zipperExtra,
            additionalNotes,
            deliveryMethod,
          }}
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
        passendenSchnursenkel={passendenSchnursenkel}
        osenEinsetzen={osenEinsetzen}
        zipperExtra={zipperExtra}
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
          shaftConfiguration={{
            customCategory,
            cadModeling,
            lederType,
            lederfarbe,
            numberOfLeatherColors,
            leatherColors,
            innenfutter,
            schafthohe,
            schafthoheLinks,
            schafthoheRechts,
            umfangmasseLinks,
            umfangmasseRechts,
            polsterung,
            verstarkungen,
            polsterungText,
            verstarkungenText,
            nahtfarbe: nahtfarbeOption === 'custom' ? customNahtfarbe : (nahtfarbeOption || 'default'),
            nahtfarbeOption: nahtfarbeOption,
            closureType,
            passendenSchnursenkel,
            osenEinsetzen,
            zipperExtra,
            additionalNotes,
            deliveryMethod,
          }}
          onConfirm={() => {
            // Only "ohne-boden" flow uses completion popup now
            // Call function directly (no await - function handles async internally)
            // Modal will be closed after order is successfully completed in proceedWithOrderWithoutBoden
            if (pendingAction === 'ohne-boden') {
              proceedWithOrderWithoutBoden(pdfBlob);
            }
            // Don't close modal here - let proceedWithOrderWithoutBoden handle it after success
          }}
        />
      )}
    </div>
  );
}

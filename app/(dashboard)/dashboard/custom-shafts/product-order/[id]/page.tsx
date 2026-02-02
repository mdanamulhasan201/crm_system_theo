'use client';
import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCustomShaftData } from '@/contexts/CustomShaftDataContext';
import { createMassschuheWithoutOrderId } from '@/apis/MassschuheAddedApis';
import { sendMassschuheCustomShaftOrderToAdmin2 } from '@/apis/MassschuheManagemantApis';
import { prepareStep1FormData } from '@/utils/customShoeOrderHelpers';
import toast from 'react-hot-toast';

// Import components
import FileUploadSection from '@/components/CustomShafts/FileUploadSection';
import ProductImageUploadInfo from '@/components/CustomShafts/ProductImageUploadInfo';
import ProductConfiguration from '@/components/CustomShafts/ProductConfiguration';
import ConfirmationModal from '@/components/CustomShafts/ConfirmationModal';
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

export default function CustomShoeOrderPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { setCustomShaftData: setContextData } = useCustomShaftData();

  // Get type from URL (abholung or null)
  const type = searchParams.get('type');
  const isAbholung = type === 'abholung';

  // Get orderId from URL (for existing order customization)
  const existingOrderId = searchParams.get('orderId');

  // Customer selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [otherCustomerNumber, setOtherCustomerNumber] = useState<string>('');

  // 3D Model files
  const [linkerLeistenFileName, setLinkerLeistenFileName] = useState('');
  const [rechterLeistenFileName, setRechterLeistenFileName] = useState('');
  const [linkerLeistenFile, setLinkerLeistenFile] = useState<File | null>(null);
  const [rechterLeistenFile, setRechterLeistenFile] = useState<File | null>(null);

  // Product image and description
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState<string>('');
  const [zipperImage, setZipperImage] = useState<string | null>(null);
  const [paintImage, setPaintImage] = useState<string | null>(null);

  // Custom category and price
  const [customCategory, setCustomCategory] = useState<string>('');
  const [customCategoryPrice, setCustomCategoryPrice] = useState<number | null>(null);

  // CAD Modeling
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

  // Closure type
  const [closureType, setClosureType] = useState<string>('');

  // Add-ons
  const [passendenSchnursenkel, setPassendenSchnursenkel] = useState<boolean | undefined>(undefined);
  const [osenEinsetzen, setOsenEinsetzen] = useState<boolean | undefined>(undefined);
  const [zipperExtra, setZipperExtra] = useState<boolean | undefined>(undefined);

  // Business address for courier (abholung)
  const [businessAddress, setBusinessAddress] = useState<BusinessAddressData | null>(null);
  // Versenden data (shipping address)
  const [versendenData, setVersendenData] = useState<VersendenData | null>(null);

  // Modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Pricing constants
  const SCHNURSENKEL_PRICE = 4.49;
  const OSEN_EINSETZEN_PRICE = 8.99;
  const ZIPPER_EXTRA_PRICE = 9.99;
  const CAD_MODELING_2X_PRICE = 6.99;
  const COURIER_PRICE_DEFAULT = 13.0;

  // Calculate total price
  const calculateTotalPrice = () => {
    let total = customCategoryPrice || 0;

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

  // Validate customer selection
  const validateCustomer = (): boolean => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return false;
    }
    return true;
  };

  // Prepare custom shaft data object
  const prepareCustomShaftData = () => {
    return {
      // Customer info
      customerId: selectedCustomer?.id,
      other_customer_name: otherCustomerNumber.trim() || null,
      customerName: selectedCustomer?.name || otherCustomerNumber.trim(),

      // Images
      uploadedImage,
      zipperImage,
      paintImage,

      // Files
      image3d_1_file: rechterLeistenFile,
      image3d_2_file: linkerLeistenFile,

      // Product info
      productDescription: productDescription || 'Custom Made #1000',
      customCategory,
      customCategoryPrice,

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

      // Pricing
      totalPrice: orderPrice,
    };
  };

  // Handle "JA, BODEN KONFIGURIEREN" - Save to context and redirect to Step 2
  const handleBodenKonfigurieren = async () => {
    if (!validateCustomer()) return;

    const customShaftData = prepareCustomShaftData();

    // Store data in context
    setContextData(customShaftData as any);

    // Close modal
    setShowConfirmationModal(false);

    // Redirect to Bodenkonstruktion page (Step 2)
    // If orderId exists, pass it in the URL for existing order customization
    const redirectUrl = existingOrderId 
      ? `/dashboard/massschuhauftraege-deatils/2?orderId=${existingOrderId}`
      : `/dashboard/massschuhauftraege-deatils/2`;
    router.push(redirectUrl);
  };

  // Handle "NEIN, WEITER OHNE BODEN" - Create order without Bodenkonstruktion
  const handleOrderWithoutBoden = async () => {
    if (!validateCustomer()) return;

    setIsCreatingOrder(true);

    try {
      const customShaftData = prepareCustomShaftData();

      // Prepare form data for API
      const formData = await prepareStep1FormData(customShaftData as any);

      // Determine isCourierContact based on selection:
      // - Abholen selected (businessAddress exists) → isCourierContact = 'yes'
      // - Versenden selected (versendenData exists) → isCourierContact = 'no'
      const isAbholenSelected = !!(businessAddress && (businessAddress.companyName || businessAddress.address));
      const isVersendenSelected = !!versendenData;
      const isCourierContact = isAbholenSelected ? 'yes' : (isVersendenSelected ? 'no' : 'yes'); // Default to 'yes' if neither selected

      // Call appropriate API based on whether this is a new order or updating an existing order
      let response;
      if (existingOrderId) {
        // Update existing order (orderId exists in URL params)
        response = await sendMassschuheCustomShaftOrderToAdmin2(existingOrderId, formData, isCourierContact);
        toast.success(response.message || "Bestellung erfolgreich aktualisiert!", { id: "creating-order" });
      } else {
        // Create new order (no orderId)
        response = await createMassschuheWithoutOrderId(formData, isCourierContact);
        toast.success(response.message || "Bestellung erfolgreich erstellt!", { id: "creating-order" });
      }

      // Close modal and redirect to balance dashboard (order completed without Bodenkonstruktion)
      setShowConfirmationModal(false);
      router.push('/dashboard/balance-dashboard');
    } catch (error) {
      console.error('Error creating/updating order:', error);
      toast.error("Fehler beim Erstellen/Aktualisieren der Bestellung.", { id: "creating-order" });
    } finally {
      setIsCreatingOrder(false);
    }
  };

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
        hideCustomerSearch={false}
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
        orderId={null}
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
        <ProductImageUploadInfo
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          productDescription={productDescription}
          setProductDescription={setProductDescription}
          basePrice={customCategoryPrice || 0}
        />

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
          shoeImage={uploadedImage || null}
          onOrderComplete={() => setShowConfirmationModal(true)}
          category={customCategory}
          allowCategoryEdit={true}
          zipperImage={zipperImage}
          setZipperImage={setZipperImage}
          paintImage={paintImage}
          setPaintImage={setPaintImage}
          requireAbholenOrVersenden={isAbholung}
          isAbholenSelected={!!(businessAddress && (businessAddress.companyName || businessAddress.address))}
          isVersendenSelected={!!versendenData}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleOrderWithoutBoden}
        onSendToAdmin2={() => {
          // Admin2 function placeholder (not needed for custom orders)
        }}
        onBodenKonfigurieren={handleBodenKonfigurieren}
        orderPrice={orderPrice}
        passendenSchnursenkel={passendenSchnursenkel}
        osenEinsetzen={osenEinsetzen}
        zipperExtra={zipperExtra}
        selectedCustomer={selectedCustomer}
        otherCustomerNumber={otherCustomerNumber}
        shaftName={productDescription || 'Custom Made #1000'}
        isCreatingWithoutBoden={isCreatingOrder}
        orderId={existingOrderId}
      />
    </div>
  );
}

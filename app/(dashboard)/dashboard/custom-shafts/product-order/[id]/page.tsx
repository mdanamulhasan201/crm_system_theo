'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetSingleMassschuheOrder } from '@/hooks/massschuhe/useGetSingleMassschuheOrder';
import { useCustomShaftData } from '@/contexts/CustomShaftDataContext';
import { createMassschuheWithoutOrderId, createMassschuheWithoutOrderIdWithoutCustomModels } from '@/apis/MassschuheAddedApis';
import toast from 'react-hot-toast';

// Import separated components
import FileUploadSection from '@/components/CustomShafts/FileUploadSection';
import ProductImageUploadInfo from '@/components/CustomShafts/ProductImageUploadInfo';
import ProductConfiguration from '@/components/CustomShafts/ProductConfiguration';
import ConfirmationModal from '@/components/CustomShafts/ConfirmationModal';
import SuccessMessage from '@/components/CustomShafts/SuccessMessage';
import { LeatherColorAssignment } from '@/components/CustomShafts/LeatherColorSectionModal';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string;
  createdAt: string;
}

export default function OrderPage() {
  // Router for navigation
  const router = useRouter();
  
  // Custom shaft data context
  const { setCustomShaftData: setContextData } = useCustomShaftData();

  // State management
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [nahtfarbeOption, setNahtfarbeOption] = useState('default');
  const [customNahtfarbe, setCustomNahtfarbe] = useState('');
  const [lederType, setLederType] = useState('');
  const [lederfarbe, setLederfarbe] = useState('');
  const [innenfutter, setInnenfutter] = useState('');
  const [schafthohe, setSchafthohe] = useState('');
  const [schafthoheLinks, setSchafthoheLinks] = useState('');
  const [schafthoheRechts, setSchafthoheRechts] = useState('');
  const [umfangmasseLinks, setUmfangmasseLinks] = useState('');
  const [umfangmasseRechts, setUmfangmasseRechts] = useState('');
  const [linkerLeistenFileName, setLinkerLeistenFileName] = useState('');
  const [rechterLeistenFileName, setRechterLeistenFileName] = useState('');
  const [linkerLeistenFile, setLinkerLeistenFile] = useState<File | null>(null);
  const [rechterLeistenFile, setRechterLeistenFile] = useState<File | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [otherCustomerNumber, setOtherCustomerNumber] = useState<string>('');
  const [polsterung, setPolsterung] = useState<string[]>([]);
  const [verstarkungen, setVerstarkungen] = useState<string[]>([]);
  const [polsterungText, setPolsterungText] = useState('');
  const [verstarkungenText, setVerstarkungenText] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  // Add-ons
  const [passendenSchnursenkel, setPassendenSchnursenkel] = useState<boolean | undefined>(undefined);
  const [osenEinsetzen, setOsenEinsetzen] = useState<boolean | undefined>(undefined);
  const [zipperExtra, setZipperExtra] = useState<boolean | undefined>(undefined);

  // Closure type
  const [closureType, setClosureType] = useState<string>('');

  // CAD Modeling selection
  const [cadModeling, setCadModeling] = useState<'1x' | '2x'>('1x');

  // Leather color configuration
  // Default: no selection, UX will only show fields after user chooses a value
  const [numberOfLeatherColors, setNumberOfLeatherColors] = useState<string>('');
  const [leatherColorAssignments, setLeatherColorAssignments] = useState<LeatherColorAssignment[]>([]);
  const [leatherColors, setLeatherColors] = useState<string[]>([]);

  // Custom category & price
  const [customCategory, setCustomCategory] = useState<string>('');
  const [customCategoryPrice, setCustomCategoryPrice] = useState<number | null>(null);

  // Product info (user-entered)
  const [productDescription, setProductDescription] = useState<string>('');

  // Image states
  const [zipperImage, setZipperImage] = useState<string | null>(null);
  const [paintImage, setPaintImage] = useState<string | null>(null);

  // Business address for abholung
  interface BusinessAddressData {
    companyName: string;
    address: string;
    price: number;
    phone: string;
    email: string;
  }
  const [businessAddress, setBusinessAddress] = useState<BusinessAddressData | null>(null);

  // Get params and search params
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const type = searchParams.get('type'); // 'abholung' or null
  const isAbholung = type === 'abholung';

  // Fetch order data if orderId is present
  const { order: massschuheOrder } = useGetSingleMassschuheOrder(orderId);

  // Pre-fill customer when orderId is present
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

  // Reset business address when switching modes
  useEffect(() => {
    if (!isAbholung) {
      setBusinessAddress(null);
    }
  }, [isAbholung]);

  // Use custom category price when selected, otherwise use default base price
  const basePrice = customCategoryPrice || 0;

  const SCHNURSENKEL_PRICE = 4.49;
  const OSEN_EINSETZEN_PRICE = 8.99;
  const ZIPPER_EXTRA_PRICE = 9.99;
  const CAD_MODELING_2X_PRICE = 6.99;
  const ABHOLUNG_PRICE_DEFAULT = 0;

  const calculateTotalPrice = () => {
    let total = basePrice;

    // Add CAD modeling surcharge if 2x is selected
    if (cadModeling === '2x') {
      total += CAD_MODELING_2X_PRICE;
    }

    if (passendenSchnursenkel) {
      total += SCHNURSENKEL_PRICE;
    }

    if (osenEinsetzen) {
      total += OSEN_EINSETZEN_PRICE;
    }

    if (zipperExtra) {
      total += ZIPPER_EXTRA_PRICE;
    }

    // Add abholung price when business address is set
    if (isAbholung && businessAddress) {
      total += Number.isFinite(businessAddress.price)
        ? businessAddress.price
        : ABHOLUNG_PRICE_DEFAULT;
    }

    return total;
  };

  const orderPrice = calculateTotalPrice();

  // Handle Boden Konfigurieren - Store data and redirect to step 2
  const handleBodenKonfigurieren = async () => {
    // Validate customer selection if no orderId
    if (!orderId) {
      if (!selectedCustomer && !otherCustomerNumber.trim()) {
        toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
        return;
      }
    }
    
    // Prepare custom shaft data
    const customShaftData = {
      orderId,
      uploadedImage,
      zipperImage,
      paintImage,
      productDescription,
      cadModeling,
      cadModeling_2x_price: cadModeling === '2x' ? CAD_MODELING_2X_PRICE : null,
      customCategory,
      customCategoryPrice,
      lederfarbe: numberOfLeatherColors === '1' ? lederfarbe : null,
      numberOfLeatherColors,
      leatherColors: numberOfLeatherColors !== '1' ? leatherColors : [],
      leatherColorAssignments: numberOfLeatherColors !== '1' ? leatherColorAssignments : [],
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
      nahtfarbe: nahtfarbeOption === 'custom' ? customNahtfarbe : 'default',
      nahtfarbe_text: nahtfarbeOption === 'custom' ? customNahtfarbe : '',
      lederType,
      closureType,
      passenden_schnursenkel: passendenSchnursenkel === true,
      moechten_sie_passende_schnuersenkel_zum_schuh_price: passendenSchnursenkel === true ? '4.49' : null,
      osen_einsetzen: osenEinsetzen === true,
      moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: osenEinsetzen === true ? '8.99' : null,
      zipper_extra: zipperExtra === true,
      moechten_sie_einen_zusaetzlichen_reissverschluss_price: zipperExtra === true ? '9.99' : null,
      businessAddress: isAbholung ? businessAddress : null,
      isAbholung,
      totalPrice: orderPrice,
      // Store customer info for orders without orderId
      customerId: selectedCustomer?.id,
      other_customer_number: otherCustomerNumber.trim() || null,
      // Store file names for reference
      linkerLeistenFileName,
      rechterLeistenFileName,
    };

    // Store data in context (in-memory state)
    setContextData({
      ...customShaftData as any,
      hasImage3d_1: !!rechterLeistenFile,
      hasImage3d_2: !!linkerLeistenFile,
      hasUploadedImage: !!uploadedImage,
      hasZipperImage: !!zipperImage,
      hasPaintImage: !!paintImage,
    });

    setShowConfirmationModal(false);
    
    // Redirect to Bodenkonstruktion page (works with or without orderId)
    if (orderId) {
      router.push(`/dashboard/massschuhauftraege-deatils/2?orderId=${orderId}`);
    } else {
      router.push(`/dashboard/massschuhauftraege-deatils/2`);
    }
  };

  // Handle Order Confirmation - Create order with or without orderId
  const handleOrderConfirmation = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return;
    }

    setIsCreatingOrder(true);
    setShowConfirmationModal(false);
    
    try {
      const formData = new FormData();

      // Customer info
      if (selectedCustomer) {
        formData.append('customerId', selectedCustomer.id);
      } else if (otherCustomerNumber.trim()) {
        formData.append('other_customer_number', otherCustomerNumber.trim());
      }

      // Files
      if (rechterLeistenFile) {
        formData.append('image3d_1', rechterLeistenFile);
      }
      if (linkerLeistenFile) {
        formData.append('image3d_2', linkerLeistenFile);
      }

      // Detect if it's a custom order
      const isCustomOrder = !!uploadedImage;

      // Add custom models image and fields (only for custom orders)
      if (isCustomOrder && uploadedImage) {
        // Convert base64 to File
        const uploadedImageFile = await convertImageToFile(uploadedImage, 'custom_model.png');
        if (uploadedImageFile) {
          formData.append('custom_models_image', uploadedImageFile);
        }

        // Custom models fields
        if (customCategoryPrice !== null && customCategoryPrice !== undefined) {
          formData.append('custom_models_price', customCategoryPrice.toString());
        }
        if (closureType) {
          formData.append('custom_models_verschlussart', closureType);
        }
        if (productDescription) {
          formData.append('custom_models_description', productDescription);
          formData.append('custom_models_name', productDescription);
        }
      }

      // Add zipper and paint images if they exist
      if (zipperImage) {
        const zipperImageFile = await convertImageToFile(zipperImage, 'zipper_image.png');
        if (zipperImageFile) {
          formData.append('zipper_image', zipperImageFile);
        }
      }

      if (paintImage) {
        const paintImageFile = await convertImageToFile(paintImage, 'paint_image.png');
        if (paintImageFile) {
          formData.append('paintImage', paintImageFile);
        }
      }

      // CAD Modeling
      formData.append('cadModeling', cadModeling);
      if (cadModeling === '2x') {
        formData.append('cadModeling_2x_price', CAD_MODELING_2X_PRICE.toString());
      }

      // Custom category & price
      if (customCategory) {
        formData.append('custom_catagoary', customCategory);
      }
      if (customCategoryPrice !== null) {
        formData.append('custom_catagoary_price', customCategoryPrice.toString());
      }

      // Closure type
      if (closureType) {
        formData.append('closureType', closureType);
        formData.append('verschlussart', closureType);
      }

      // Leather color
      if (numberOfLeatherColors === '1') {
        formData.append('lederfarbe', lederfarbe);
      } else if (numberOfLeatherColors === '2' || numberOfLeatherColors === '3') {
        formData.append('numberOfLeatherColors', numberOfLeatherColors);
        leatherColors.forEach((color, index) => {
          formData.append(`leatherColor_${index + 1}`, color);
        });
        formData.append('leatherColorAssignments', JSON.stringify(leatherColorAssignments));
      }

      // Other config fields
      formData.append('lederType', lederType);
      formData.append('innenfutter', innenfutter);
      formData.append('nahtfarbe', nahtfarbeOption === 'custom' ? customNahtfarbe : 'default');
      formData.append('nahtfarbe_text', nahtfarbeOption === 'custom' ? customNahtfarbe : '');
      formData.append('schafthohe', schafthohe);
      if (schafthoheLinks) formData.append('schafthoheLinks', schafthoheLinks);
      if (schafthoheRechts) formData.append('schafthoheRechts', schafthoheRechts);
      if (umfangmasseLinks) formData.append('umfangmasseLinks', umfangmasseLinks);
      if (umfangmasseRechts) formData.append('umfangmasseRechts', umfangmasseRechts);
      formData.append('polsterung', polsterung.join(','));
      formData.append('vestarkungen', verstarkungen.join(','));
      formData.append('polsterung_text', polsterungText);
      formData.append('vestarkungen_text', verstarkungenText);

      // Add-on prices and flags
      if (passendenSchnursenkel === true) {
        formData.append('passenden_schnursenkel', 'true');
        formData.append('moechten_sie_passende_schnuersenkel_zum_schuh_price', '4.49');
      }
      if (osenEinsetzen === true) {
        formData.append('osen_einsetzen', 'true');
        formData.append('moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price', '8.99');
      }
      if (zipperExtra === true) {
        formData.append('zipper_extra', 'true');
        formData.append('moechten_sie_einen_zusaetzlichen_reissverschluss_price', '9.99');
      }

      // Zusatzfragen als eigene Felder
      if (passendenSchnursenkel !== undefined) {
        formData.append('moechten_sie_passende_schnuersenkel_zum_schuh', passendenSchnursenkel ? 'true' : 'false');
      }
      if (osenEinsetzen !== undefined) {
        formData.append('moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen', osenEinsetzen ? 'true' : 'false');
      }
      if (zipperExtra !== undefined) {
        formData.append('moechten_sie_einen_zusaetzlichen_reissverschluss', zipperExtra ? 'true' : 'false');
      }

      // Business address for abholung
      if (isAbholung && businessAddress) {
        formData.append('abholung', 'true');
        formData.append('abholung_price', String(Number.isFinite(businessAddress.price) ? businessAddress.price : ABHOLUNG_PRICE_DEFAULT));
        formData.append('business_companyName', businessAddress.companyName);
        formData.append('business_address', businessAddress.address);
        if (businessAddress.phone) formData.append('business_phone', businessAddress.phone);
        if (businessAddress.email) formData.append('business_email', businessAddress.email);
      }

      // Total price
      formData.append('totalPrice', orderPrice.toString());

      // Prepare Massschafterstellung_json1
      const massschafterstellungJson1 = {
        kategorie: customCategory || null,
        ledertyp: lederType || null,
        ledertypen_definieren: {},
        anzahl_der_ledertypen: numberOfLeatherColors || null,
        Innenfutter: innenfutter || null,
        lederfarbe: numberOfLeatherColors === '1' ? lederfarbe : null,
        schafthöhe: schafthohe || null,
        schafthoheLinks: schafthoheLinks || null,
        schafthoheRechts: schafthoheRechts || null,
        umfangmasseLinks: umfangmasseLinks || null,
        umfangmasseRechts: umfangmasseRechts || null,
        polsterung: polsterung.join(',') || null,
        verstärkungen: verstarkungen.join(',') || null,
        verschlussart: closureType || null,
        moechten_sie_passende_schnuersenkel_zum_schuh: passendenSchnursenkel || null,
        moechten_sie_passende_schnuersenkel_zum_schuh_price: passendenSchnursenkel === true ? '4.49' : null,
        moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen: osenEinsetzen || null,
        moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: osenEinsetzen === true ? '8.99' : null,
        moechten_sie_einen_zusaetzlichen_reissverschluss: zipperExtra || null,
        moechten_sie_einen_zusaetzlichen_reissverschluss_price: zipperExtra === true ? '9.99' : null,
      };

      // Add leather types definition if multiple colors
      if (numberOfLeatherColors === '2' || numberOfLeatherColors === '3') {
        const ledertypenDefinieren: any = {};
        leatherColors?.forEach((color: string, index: number) => {
          ledertypenDefinieren[`leatherColor_${index + 1}`] = color;
        });
        if (leatherColorAssignments) {
          ledertypenDefinieren.assignments = leatherColorAssignments;
        }
        massschafterstellungJson1.ledertypen_definieren = ledertypenDefinieren;
      }

      formData.append('Massschafterstellung_json1', JSON.stringify(massschafterstellungJson1));

      // Call appropriate API based on order type
      const response = isCustomOrder 
        ? await createMassschuheWithoutOrderId(formData)
        : await createMassschuheWithoutOrderIdWithoutCustomModels(formData);

      toast.success(response.message || "Bestellung erfolgreich erstellt!", { id: "creating-order" });
      
      // Navigate back
      router.push('/dashboard/custom-shafts');
    } catch (error) {
      toast.error("Fehler beim Erstellen der Bestellung.", { id: "creating-order" });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Helper function to convert base64/URL to File
  const convertImageToFile = async (imageString: string, fileName: string = 'image.png'): Promise<File | null> => {
    try {
      if (!imageString) return null;
      
      if (imageString.startsWith('data:')) {
        const response = await fetch(imageString);
        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
      }
      
      if (imageString.startsWith('http') || imageString.startsWith('/')) {
        const response = await fetch(imageString);
        if (response.ok) {
          const blob = await response.blob();
          return new File([blob], fileName, { type: blob.type });
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error converting image to file:', error);
      return null;
    }
  };

  // Handle Send to Admin2 - Just show message
  const handleSendToAdmin2 = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return;
    }

    setIsCreatingOrder(true);
    setShowConfirmationModal(false);
    
    // Simulate processing
    setTimeout(() => {
      setIsCreatingOrder(false);
      toast.success("An Admin2 gesendet - API wird hier implementiert");
    }, 1000);
  };

  return (
    <>
      <div className="px-2 md:px-6 py-8 w-full">
        {/* File Upload Section - Hide file uploads when type is 'abholung' */}
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
                price: Number.isFinite(data.price) ? data.price : ABHOLUNG_PRICE_DEFAULT,
                phone: data.phone || '',
                email: data.email || '',
              });
            }
          }}
          orderId={orderId}
        />

        <div className="flex flex-col border-2 border-gray-200 rounded-lg p-4 shadow-md">
          {/* Heading with separator */}
          <div className="text-left mb-6">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Massschaftkonfigurator</h1>
            <div className="w-full border-t border-gray-300"></div>
          </div>

          {/* Product Image and Info - Custom version for new orders */}
          <ProductImageUploadInfo
            uploadedImage={uploadedImage}
            setUploadedImage={setUploadedImage}
            productDescription={productDescription}
            setProductDescription={setProductDescription}
            basePrice={basePrice}
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
          />
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
          onSendToAdmin2={handleSendToAdmin2}
          onBodenKonfigurieren={handleBodenKonfigurieren}
          orderPrice={orderPrice}
          passendenSchnursenkel={passendenSchnursenkel}
          osenEinsetzen={osenEinsetzen}
          zipperExtra={zipperExtra}
          selectedCustomer={selectedCustomer}
          otherCustomerNumber={otherCustomerNumber}
          shaftName={productDescription || undefined}
          isCreatingOrder={isCreatingOrder}
          orderId={orderId}
        />
      </div>
    </>
  );
}

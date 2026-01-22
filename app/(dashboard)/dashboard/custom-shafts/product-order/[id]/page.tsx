'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetSingleMassschuheOrder } from '@/hooks/massschuhe/useGetSingleMassschuheOrder';
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
  // State management
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [nahtfarbeOption, setNahtfarbeOption] = useState('default');
  const [customNahtfarbe, setCustomNahtfarbe] = useState('');
  const [lederType, setLederType] = useState('');
  const [lederfarbe, setLederfarbe] = useState('');
  const [innenfutter, setInnenfutter] = useState('');
  const [schafthohe, setSchafthohe] = useState('');
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

  // Leather color configuration
  const [numberOfLeatherColors, setNumberOfLeatherColors] = useState<string>('1');
  const [leatherColorAssignments, setLeatherColorAssignments] = useState<LeatherColorAssignment[]>([]);
  const [leatherColors, setLeatherColors] = useState<string[]>([]);

  // Custom category & price
  const [customCategory, setCustomCategory] = useState<string>('');
  const [customCategoryPrice, setCustomCategoryPrice] = useState<number | null>(null);

  // Product info (user-entered)
  const [productDescription, setProductDescription] = useState<string>('');

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
  const ABHOLUNG_PRICE_DEFAULT = 13.0;

  const calculateTotalPrice = () => {
    let total = basePrice;

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

  // Handle Boden Konfigurieren - Just close modal and show message
  const handleBodenKonfigurieren = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return;
    }

    if (isAbholung && !businessAddress) {
      toast.error("Bitte geben Sie eine Geschäftsadresse für die Leistenabholung ein.");
      return;
    }

    setIsCreatingOrder(true);
    setShowConfirmationModal(false);
    
    // Simulate processing
    setTimeout(() => {
      setIsCreatingOrder(false);
      toast.success("Boden Konfigurieren - API wird hier implementiert");
    }, 1000);
  };

  // Handle Order Confirmation - Just show message
  const handleOrderConfirmation = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return;
    }

    if (isAbholung && !businessAddress) {
      toast.error("Bitte geben Sie eine Geschäftsadresse für die Leistenabholung ein.");
      return;
    }

    setIsCreatingOrder(true);
    setShowConfirmationModal(false);
    
    // Simulate processing
    setTimeout(() => {
      setIsCreatingOrder(false);
      toast.success("Bestellung bestätigt - API wird hier implementiert");
    }, 1000);
  };

  // Handle Send to Admin2 - Just show message
  const handleSendToAdmin2 = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return;
    }

    if (isAbholung && !businessAddress) {
      toast.error("Bitte geben Sie eine Geschäftsadresse für die Leistenabholung ein.");
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

            <div>
            <h2 className='font-bold text-lg mb-4'>CAD-Modellierung</h2>
          </div>

          {/* Product Configuration */}
          <ProductConfiguration
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

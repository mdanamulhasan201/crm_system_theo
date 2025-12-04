'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSingleCustomShaft } from '@/hooks/customShafts/useSingleCustomShaft';
import toast from 'react-hot-toast';
import CustomShaftDetailsShimmer from '@/components/ShimmerEffect/Maßschäfte/CustomShaftDetailsShimmer';
import { createCustomShaft } from '@/apis/customShaftsApis';

// Import separated components
import FileUploadSection from '@/components/CustomShafts/FileUploadSection';
import ProductImageInfo from '@/components/CustomShafts/ProductImageInfo';
import ProductConfiguration from '@/components/CustomShafts/ProductConfiguration';
import ConfirmationModal from '@/components/CustomShafts/ConfirmationModal';
import SuccessMessage from '@/components/CustomShafts/SuccessMessage';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

  // Get shaft data
  const params = useParams();
  const shaftId = params.id as string;
  const { data: apiData, loading, error } = useSingleCustomShaft(shaftId);
  const shaft = apiData?.data;

  useEffect(() => {
    if (shaft) {
      // Image loaded successfully
    }
  }, [shaftId, shaft]);

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

  // Function to clear all form data
  const clearFormData = () => {
    setUploadedImage(null);
    setNahtfarbeOption('default');
    setCustomNahtfarbe('');
    setLederType('');
    setLederfarbe('');
    setInnenfutter('');
    setSchafthohe('');
    setLinkerLeistenFileName('');
    setRechterLeistenFileName('');
    setLinkerLeistenFile(null);
    setRechterLeistenFile(null);
    setSelectedCustomer(null);
    setOtherCustomerNumber('');
    setPolsterung([]);
    setVerstarkungen([]);
    setPolsterungText('');
    setVerstarkungenText('');
  };

  const handleOrderConfirmation = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return;
    }

    setIsCreatingOrder(true);
    try {
      const formData = new FormData();

      // Use selected customer ID if available, otherwise use other_customer_number
      if (selectedCustomer) {
        formData.append('customerId', selectedCustomer.id);
      } else if (otherCustomerNumber.trim()) {
        formData.append('other_customer_number', otherCustomerNumber.trim());
      }

      if (rechterLeistenFile) {
        formData.append('image3d_1', rechterLeistenFile);
      }
      if (linkerLeistenFile) {
        formData.append('image3d_2', linkerLeistenFile);
      }

      formData.append('lederType', lederType);
      formData.append('lederfarbe', lederfarbe);
      formData.append('innenfutter', innenfutter);
      formData.append('nahtfarbe', nahtfarbeOption === 'custom' ? customNahtfarbe : 'default');
      formData.append('nahtfarbe_text', nahtfarbeOption === 'custom' ? customNahtfarbe : '');
      formData.append('schafthohe', schafthohe);
      formData.append('polsterung', polsterung.join(','));
      formData.append('vestarkungen', verstarkungen.join(','));

      formData.append('polsterung_text', polsterungText);
      formData.append('vestarkungen_text', verstarkungenText);
      if (passendenSchnursenkel === true) {
        formData.append('passenden_schnursenkel', 'true');

        formData.append('Passenden_schnursenkel_price', '4.49');
      }
      if (osenEinsetzen === true) {
        formData.append('osen_einsetzen', 'true');

        formData.append('osen_einsetzen_price', '8.99');
      }
      formData.append('mabschaftKollektionId', shaftId);
      formData.append('totalPrice', orderPrice.toString());
      const response = await createCustomShaft(formData);
      clearFormData();
      setShowSuccessMessage(true);
      setShowConfirmationModal(false);
      toast.success(response.message || "Bestellung erfolgreich erstellt!", { id: "creating-order" });

      // Navigate back to custom-shafts page after success
      setTimeout(() => {
        router.push('/dashboard/custom-shafts');
      }, 200);
    } catch (error) {
      toast.error("Fehler beim Erstellen der Bestellung.", { id: "creating-order" });
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
        <div className="text-red-500 text-lg font-medium mb-2">Fehler beim Laden der Daten</div>
        <div className="text-gray-400 text-sm text-center">
          {error}
        </div>
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
    <>
      {/* back button    */}
      <Button variant="outline" className="justify-start w-fit cursor-pointer text-base font-normal border border-black gap-3" onClick={() => router.back()}>
        <ArrowLeft className="w-5 h-5" />
        Zurück
      </Button>

      <div className="px-2 md:px-6 py-8 w-full">

        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-left">
          Massschaftkonfigurator
        </h1>

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
        />

        {/* Product Image and Info */}
        <ProductImageInfo
          shaft={shaft}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
        />

        {/* Product Configuration */}
        <ProductConfiguration
          nahtfarbeOption={nahtfarbeOption}
          setNahtfarbeOption={setNahtfarbeOption}
          customNahtfarbe={customNahtfarbe}
          setCustomNahtfarbe={setCustomNahtfarbe}
          passendenSchnursenkel={passendenSchnursenkel}
          setPassendenSchnursenkel={setPassendenSchnursenkel}
          osenEinsetzen={osenEinsetzen}
          setOsenEinsetzen={setOsenEinsetzen}
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
          onOrderComplete={() => setShowConfirmationModal(true)}
        />

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
          orderPrice={orderPrice}
          passendenSchnursenkel={passendenSchnursenkel}
          osenEinsetzen={osenEinsetzen}
          selectedCustomer={selectedCustomer}
          otherCustomerNumber={otherCustomerNumber}
          shaftName={shaft?.name}
          isCreatingOrder={isCreatingOrder}
        />
      </div>
    </>

  );
}
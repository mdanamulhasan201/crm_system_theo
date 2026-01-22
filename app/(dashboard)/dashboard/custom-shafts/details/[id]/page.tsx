'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSingleCustomShaft } from '@/hooks/customShafts/useSingleCustomShaft';
import { useGetSingleMassschuheOrder } from '@/hooks/massschuhe/useGetSingleMassschuheOrder';
import toast from 'react-hot-toast';
import CustomShaftDetailsShimmer from '@/components/ShimmerEffect/Maßschäfte/CustomShaftDetailsShimmer';
import { createCustomShaft } from '@/apis/customShaftsApis';
import { createMassschuheWithoutOrderId } from '@/apis/MassschuheAddedApis';
import { sendMassschuheOrderToAdmin2 } from '@/apis/MassschuheManagemantApis';

// Import separated components
import FileUploadSection from '@/components/CustomShafts/FileUploadSection';
import ProductImageInfo from '@/components/CustomShafts/ProductImageInfo';
import ProductConfiguration from '@/components/CustomShafts/ProductConfiguration';
import ConfirmationModal from '@/components/CustomShafts/ConfirmationModal';
import SuccessMessage from '@/components/CustomShafts/SuccessMessage';
import { LeatherColorAssignment } from '@/components/CustomShafts/LeatherColorSectionModal';

const CATEGORY_PRICE_MAP: Record<string, number> = {
  Halbschuhe: 209.99,
  Stiefel: 314.99,
  Knöchelhoch: 219.99,
  Sandalen: 189.99,
  Bergschuhe: 234.99,
  Businessschuhe: 224.99,
};

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
  const shaftId = params.id as string;
  const orderId = searchParams.get('orderId');
  const type = searchParams.get('type'); // 'abholung' or null
  const isAbholung = type === 'abholung';

  // Fetch order data if orderId is present
  const { order: massschuheOrder, loading: orderLoading } = useGetSingleMassschuheOrder(orderId);

  // Fetch shaft data
  const { data: apiData, loading: shaftLoading, error: shaftError } = useSingleCustomShaft(shaftId);
  const shaft = apiData?.data;

  const loading = orderLoading || shaftLoading;
  const error = shaftError;

  useEffect(() => {
    if (shaft) {
      // Image loaded successfully
    }
  }, [shaftId, shaft]);

  // Preselect category from API (shaft.catagoary) but allow user to change it
  useEffect(() => {
    if (!shaft) return;
    if (customCategory) return; // don't override user selection

    const initialCategory = shaft?.catagoary || '';
    if (initialCategory) {
      setCustomCategory(initialCategory);
      const mappedPrice = CATEGORY_PRICE_MAP[initialCategory];
      setCustomCategoryPrice(Number.isFinite(mappedPrice) ? mappedPrice : null);
    }
  }, [shaft, customCategory]);

  // Preselect closure type from API (shaft.verschlussart) but allow user to change it
  useEffect(() => {
    if (!shaft) return;
    if (closureType) return; // don't override user selection

    const initialClosureType = shaft?.verschlussart || '';
    if (initialClosureType) {
      setClosureType(initialClosureType);
    }
  }, [shaft, closureType]);

  // Reset business address when switching modes (no localStorage storage)
  useEffect(() => {
    if (!isAbholung) {
      // Clear business address when not in abholung mode
      setBusinessAddress(null);
    }
  }, [isAbholung]);

  // Pre-fill customer when orderId is present
  useEffect(() => {
    if (massschuheOrder) {
      // API returns customer object even though type doesn't include it
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
        // Fallback: use order data if customer object not available
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

  // Order handling
  // Use custom category price when selected, otherwise fall back to shaft base price
  const basePrice = (customCategoryPrice ?? shaft?.price) || 0;



  const SCHNURSENKEL_PRICE = 4.49;
  const OSEN_EINSETZEN_PRICE = 8.99;
  const ZIPPER_EXTRA_PRICE = 9.99;
  const ABHOLUNG_PRICE_DEFAULT = 13.0;

  // Helper to determine if images should be updated
  const shouldUpdateImage = !!(rechterLeistenFile || linkerLeistenFile);

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

  // Function to prepare form data for sendMassschuheOrderToAdmin2 API
  const prepareFormDataForAdmin2 = (): FormData => {
    const formData = new FormData();

    // Add files
    if (rechterLeistenFile) {
      formData.append('image3d_1', rechterLeistenFile);
    }
    if (linkerLeistenFile) {
      formData.append('image3d_2', linkerLeistenFile);
    }

    // Add mabschaftKollektionId
    formData.append('mabschaftKollektionId', shaftId);

    // Custom category & price
    if (customCategory) {
      formData.append('custom_catagoary', customCategory);
    }
    if (customCategoryPrice !== null) {
      formData.append('custom_catagoary_price', customCategoryPrice.toString());
    }

    // Add business address if abholung is selected
    if (isAbholung && businessAddress) {
      formData.append('abholung', 'true');
      formData.append(
        'abholung_price',
        String(
          Number.isFinite(businessAddress.price)
            ? businessAddress.price
            : ABHOLUNG_PRICE_DEFAULT
        )
      );
      formData.append('business_companyName', businessAddress.companyName);
      formData.append('business_address', businessAddress.address);
      if (businessAddress.phone) {
        formData.append('business_phone', businessAddress.phone);
      }
      if (businessAddress.email) {
        formData.append('business_email', businessAddress.email);
      }
      if (businessAddress.phone) {
        formData.append('business_phone', businessAddress.phone);
      }
      if (businessAddress.email) {
        formData.append('business_email', businessAddress.email);
      }
    }

    // Update image flag
    formData.append('update_image', shouldUpdateImage ? 'true' : 'false');

    // Verschlussart mapping
    if (closureType) {
      formData.append('closureType', closureType);
      formData.append('verschlussart', closureType);
    }

    // Add lederfarbe only if 1 color is selected
    if (numberOfLeatherColors === '1') {
      formData.append('lederfarbe', lederfarbe);
    } else if (numberOfLeatherColors === '2' || numberOfLeatherColors === '3') {
      // Add multiple leather colors
      formData.append('numberOfLeatherColors', numberOfLeatherColors);
      leatherColors.forEach((color, index) => {
        formData.append(`leatherColor_${index + 1}`, color);
      });
      // Add section assignments as JSON
      formData.append('leatherColorAssignments', JSON.stringify(leatherColorAssignments));
    }

    // Add other fields
    formData.append('innenfutter', innenfutter);
    formData.append('schafthohe', schafthohe);
    formData.append('polsterung', polsterung.join(','));
    formData.append('vestarkungen', verstarkungen.join(','));
    formData.append('polsterung_text', polsterungText);
    formData.append('vestarkungen_text', verstarkungenText);
    formData.append('nahtfarbe', nahtfarbeOption === 'custom' ? customNahtfarbe : 'default');
    formData.append('nahtfarbe_text', nahtfarbeOption === 'custom' ? customNahtfarbe : '');
    formData.append('lederType', lederType);
    // keep for backward compatibility (also added above when set)
    if (!formData.has('closureType') && closureType) {
      formData.append('closureType', closureType);
    }

    // Zusatzfragen als eigene Felder
    if (passendenSchnursenkel !== undefined) {
      formData.append(
        'moechten_sie_passende_schnuersenkel_zum_schuh',
        passendenSchnursenkel ? 'true' : 'false'
      );
    }
    if (osenEinsetzen !== undefined) {
      formData.append(
        'moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen',
        osenEinsetzen ? 'true' : 'false'
      );
    }
    if (zipperExtra !== undefined) {
      formData.append(
        'moechten_sie_einen_zusaetzlichen_reissverschluss',
        zipperExtra ? 'true' : 'false'
      );
    }

    // Add prices only if options are selected
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

    // Add business address if abholung is selected
    if (isAbholung && businessAddress) {
      formData.append('abholung', 'true');
      formData.append(
        'abholung_price',
        String(
          Number.isFinite(businessAddress.price)
            ? businessAddress.price
            : ABHOLUNG_PRICE_DEFAULT
        )
      );
      formData.append('business_companyName', businessAddress.companyName);
      formData.append('business_address', businessAddress.address);
    }

    // Add total price
    formData.append('totalPrice', orderPrice.toString());

    return formData;
  };

  // Handle Boden Konfigurieren
  const handleBodenKonfigurieren = async () => {
    // If we already have an orderId, keep existing behavior (store data and go to step 2)
    if (orderId) {
      const customShaftData = {
        image3d_1: rechterLeistenFile,
        image3d_2: linkerLeistenFile,
        mabschaftKollektionId: shaftId,
        lederfarbe: numberOfLeatherColors === '1' ? lederfarbe : null,
        numberOfLeatherColors,
        leatherColors: numberOfLeatherColors !== '1' ? leatherColors : [],
        leatherColorAssignments: numberOfLeatherColors !== '1' ? leatherColorAssignments : [],
        innenfutter,
        schafthohe,
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
        totalPrice: orderPrice,
        // Store file names for reference
        linkerLeistenFileName,
        rechterLeistenFileName,
      };

      sessionStorage.setItem(`customShaftData_${orderId}`, JSON.stringify({
        ...customShaftData,
        hasImage3d_1: !!rechterLeistenFile,
        hasImage3d_2: !!linkerLeistenFile,
      }));

      setShowConfirmationModal(false);
      router.push(`/dashboard/massschuhauftraege-deatils/2?orderId=${orderId}`);
      return;
    }

    // No orderId: create massschuhe directly via /custom_shafts/create with same payload
    setIsCreatingOrder(true);
    try {
      const formData = new FormData();

      // Customer info (optional)
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

      // Update image flag
      formData.append('update_image', shouldUpdateImage ? 'true' : 'false');

      // Base configuration
      formData.append('mabschaftKollektionId', shaftId);
      formData.append('lederType', lederType);

      // Custom category & price
      if (customCategory) {
        formData.append('custom_catagoary', customCategory);
      }
      if (customCategoryPrice !== null) {
        formData.append('custom_catagoary_price', customCategoryPrice.toString());
      }

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
      formData.append('innenfutter', innenfutter);
      formData.append('nahtfarbe', nahtfarbeOption === 'custom' ? customNahtfarbe : 'default');
      formData.append('nahtfarbe_text', nahtfarbeOption === 'custom' ? customNahtfarbe : '');
      formData.append('schafthohe', schafthohe);
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
        formData.append(
          'moechten_sie_passende_schnuersenkel_zum_schuh',
          passendenSchnursenkel ? 'true' : 'false'
        );
      }
      if (osenEinsetzen !== undefined) {
        formData.append(
          'moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen',
          osenEinsetzen ? 'true' : 'false'
        );
      }
      if (zipperExtra !== undefined) {
        formData.append(
          'moechten_sie_einen_zusaetzlichen_reissverschluss',
          zipperExtra ? 'true' : 'false'
        );
      }

      // Business address for abholung
      if (isAbholung && businessAddress) {
        formData.append('abholung', 'true');
        formData.append(
          'abholung_price',
          String(
            Number.isFinite(businessAddress.price)
              ? businessAddress.price
              : ABHOLUNG_PRICE_DEFAULT
          )
        );
        formData.append('business_companyName', businessAddress.companyName);
        formData.append('business_address', businessAddress.address);
      }

      // Total price
      formData.append('totalPrice', orderPrice.toString());

      const response = await createMassschuheWithoutOrderId(formData);

      clearFormData();
      setShowSuccessMessage(true);
      setShowConfirmationModal(false);
      toast.success(response.message || 'Bestellung erfolgreich erstellt!', {
        id: 'creating-order',
      });

      // After creating without order id, go back to custom shafts overview
      setTimeout(() => {
        router.push('/dashboard/custom-shafts');
      }, 200);
    } catch (error) {
      toast.error('Fehler beim Erstellen der Bestellung.', { id: 'creating-order' });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Function to clear all form data
  const clearFormData = () => {
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
    setNumberOfLeatherColors('1');
    setLeatherColorAssignments([]);
    setLeatherColors([]);
    setClosureType('');
    setPassendenSchnursenkel(undefined);
    setOsenEinsetzen(undefined);
    setZipperExtra(undefined);
    setCustomCategory('');
    setCustomCategoryPrice(null);
  };

  const handleOrderConfirmation = async () => {
    if (!selectedCustomer && !otherCustomerNumber.trim()) {
      toast.error("Bitte wählen Sie einen Kunden aus oder geben Sie einen Kundenname ein.");
      return;
    }

    // For abholung, validate business address is provided
    if (isAbholung && !businessAddress) {
      toast.error("Bitte geben Sie eine Geschäftsadresse für die Leistenabholung ein.");
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

      // Update image flag
      formData.append('update_image', shouldUpdateImage ? 'true' : 'false');

      formData.append('lederType', lederType);

      // Verschlussart mapping
      if (closureType) {
        formData.append('closureType', closureType);
        formData.append('verschlussart', closureType);
      }

      // Handle leather color based on number of colors
      if (numberOfLeatherColors === '1') {
        formData.append('lederfarbe', lederfarbe);
      } else if (numberOfLeatherColors === '2' || numberOfLeatherColors === '3') {
        // Add multiple leather colors
        formData.append('numberOfLeatherColors', numberOfLeatherColors);
        leatherColors.forEach((color, index) => {
          formData.append(`leatherColor_${index + 1}`, color);
        });
        // Add section assignments as JSON
        formData.append('leatherColorAssignments', JSON.stringify(leatherColorAssignments));
      }

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
      if (zipperExtra === true) {
        formData.append('zipper_extra', 'true');

        formData.append('zipper_extra_price', '9.99');
      }

      // Zusatzfragen als eigene Felder
      if (passendenSchnursenkel !== undefined) {
        formData.append(
          'moechten_sie_passende_schnuersenkel_zum_schuh',
          passendenSchnursenkel ? 'true' : 'false'
        );
      }
      if (osenEinsetzen !== undefined) {
        formData.append(
          'moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen',
          osenEinsetzen ? 'true' : 'false'
        );
      }
      if (zipperExtra !== undefined) {
        formData.append(
          'moechten_sie_einen_zusaetzlichen_reissverschluss',
          zipperExtra ? 'true' : 'false'
        );
      }
      formData.append('mabschaftKollektionId', shaftId);

      // Custom category & price
      if (customCategory) {
        formData.append('custom_catagoary', customCategory);
      }
      if (customCategoryPrice !== null) {
        formData.append('custom_catagoary_price', customCategoryPrice.toString());
      }
      formData.append('totalPrice', orderPrice.toString());

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
            // Set to null if both fields are empty, otherwise set the data
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

          {/* Product Image and Info */}
          <ProductImageInfo
            shaft={shaft}
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
            shoeImage={shaft?.image || null}
            onOrderComplete={() => setShowConfirmationModal(true)}
            category={shaft?.catagoary}
            allowCategoryEdit={false}
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
          onSendToAdmin2={async () => {
            if (!orderId) {
              toast.error("Order ID is required");
              return;
            }
            setIsCreatingOrder(true);
            try {
              const formData = prepareFormDataForAdmin2();
              const response = await sendMassschuheOrderToAdmin2(orderId, formData);
              clearFormData();
              setShowSuccessMessage(true);
              setShowConfirmationModal(false);
              toast.success(response.message || "Bestellung erfolgreich gesendet!", { id: "sending-order" });
              setTimeout(() => {
                router.push('/dashboard/custom-shafts');
              }, 200);
            } catch (error) {
              toast.error("Fehler beim Senden der Bestellung.", { id: "sending-order" });
            } finally {
              setIsCreatingOrder(false);
            }
          }}
          onBodenKonfigurieren={handleBodenKonfigurieren}
          orderPrice={orderPrice}
          passendenSchnursenkel={passendenSchnursenkel}
          osenEinsetzen={osenEinsetzen}
          zipperExtra={zipperExtra}
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
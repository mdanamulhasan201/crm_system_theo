/**
 * Helper functions for custom shoe order payload preparation
 */

interface BusinessAddress {
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

interface CustomShaftData {
  customerId?: string;
  other_customer_name?: string | null;
  customerName?: string;
  uploadedImage: string | null;
  zipperImage: string | null;
  paintImage: string | null;
  image3d_1_file?: File | null;
  image3d_2_file?: File | null;
  productDescription: string;
  customCategory: string;
  customCategoryPrice: number | null;
  mabschaftKollektionId?: string;
  cadModeling: '1x' | '2x';
  cadModeling_2x_price: number | null;
  lederType: string;
  lederfarbe: string;
  numberOfLeatherColors: string;
  leatherColors: string[];
  leatherColorAssignments: any[];
  innenfutter: string;
  schafthohe: string;
  schafthoheLinks: string;
  schafthoheRechts: string;
  umfangmasseLinks: string;
  umfangmasseRechts: string;
  polsterung: string[];
  verstarkungen: string[];
  polsterung_text: string;
  verstarkungen_text: string;
  nahtfarbe: string;
  nahtfarbe_text: string;
  closureType: string;
  passenden_schnursenkel: boolean;
  moechten_sie_passende_schnuersenkel_zum_schuh_price: string | null;
  osen_einsetzen: boolean;
  moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: string | null;
  zipper_extra: boolean;
  moechten_sie_einen_zusaetzlichen_reissverschluss_price: string | null;
  businessAddress: BusinessAddress | null;
  isAbholung: boolean;
  versendenData?: VersendenData | null;
  totalPrice: number;
  additionalNotes?: string | null;
}

/**
 * Convert base64 or URL image to File object
 */
export const convertImageToFile = async (
  imageString: string,
  fileName: string = 'image.png'
): Promise<File | null> => {
  try {
    if (!imageString) return null;

    // Handle base64 data URL
    if (imageString.startsWith('data:')) {
      const response = await fetch(imageString);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    }

    // Handle HTTP/HTTPS URL
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

/**
 * Prepare Massschafterstellung_json1 from custom shaft data
 */
export const prepareMassschafterstellungJson1 = (data: CustomShaftData) => {
  const json: any = {
    kategorie: data.customCategory || null,
    ledertyp: data.lederType || null,
    ledertypen_definieren: {},
    anzahl_der_ledertypen: data.numberOfLeatherColors || null,
    Innenfutter: data.innenfutter || null,
    lederfarbe: data.numberOfLeatherColors === '1' ? data.lederfarbe : null,
    schafthöhe: data.schafthohe || null,
    schafthoheLinks: data.schafthoheLinks || null,
    schafthoheRechts: data.schafthoheRechts || null,
    umfangmasseLinks: data.umfangmasseLinks || null,
    umfangmasseRechts: data.umfangmasseRechts || null,
    polsterung: data.polsterung?.join(',') || null,
    polsterung_text: data.polsterung_text || null,
    verstärkungen: data.verstarkungen?.join(',') || null,
    verstarkungen_text: data.verstarkungen_text || null,
    nahtfarbe: data.nahtfarbe || null,
    nahtfarbe_text: data.nahtfarbe_text || null,
    verschlussart: data.closureType || null,
    moechten_sie_passende_schnuersenkel_zum_schuh: data.passenden_schnursenkel || null,
    moechten_sie_passende_schnuersenkel_zum_schuh_price:
      data.moechten_sie_passende_schnuersenkel_zum_schuh_price || null,
    moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen: data.osen_einsetzen || null,
    moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price:
      data.moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price || null,
    moechten_sie_einen_zusaetzlichen_reissverschluss: data.zipper_extra || null,
    moechten_sie_einen_zusaetzlichen_reissverschluss_price:
      data.moechten_sie_einen_zusaetzlichen_reissverschluss_price || null,
    cadModeling: data.cadModeling || null,
    cadModeling_2x_price: data.cadModeling_2x_price || null,
    sonstige_notizen: data.additionalNotes || null,
  };

  // Add business address if present
  if (data.isAbholung && data.businessAddress) {
    json.courier_address = {
      courier_companyName: data.businessAddress.companyName,
      courier_phone: data.businessAddress.phone,
      courier_email: data.businessAddress.email,
      courier_price: data.businessAddress.price?.toString() || '13',
      courier_address: data.businessAddress.address,
    };
  }

  // Add leather types definition if multiple colors
  if (data.numberOfLeatherColors === '2' || data.numberOfLeatherColors === '3') {
    const ledertypenDefinieren: any = {};
    data.leatherColors?.forEach((color: string, index: number) => {
      ledertypenDefinieren[`leatherColor_${index + 1}`] = color;
    });
    if (data.leatherColorAssignments) {
      ledertypenDefinieren.assignments = data.leatherColorAssignments;
    }
    json.ledertypen_definieren = ledertypenDefinieren;
  }

  return json;
};

/**
 * Prepare FormData for Step 1 (Schafterstellung only)
 * This is used when user clicks "NEIN, WEITER OHNE BODEN"
 */
export const prepareStep1FormData = async (data: CustomShaftData): Promise<FormData> => {
  const formData = new FormData();

  // Customer info
  if (data.customerId) {
    formData.append('customerId', data.customerId);
  } else if (data.other_customer_name) {
    formData.append('other_customer_name', data.other_customer_name);
  }

  // 3D model files
  if (data.image3d_1_file) {
    formData.append('image3d_1', data.image3d_1_file);
  }
  if (data.image3d_2_file) {
    formData.append('image3d_2', data.image3d_2_file);
  }

  // Collection product ID (for collection-based orders, not custom uploads)
  if (data.mabschaftKollektionId) {
    formData.append('mabschaftKollektionId', data.mabschaftKollektionId);
  }

  // Custom models image (uploaded shoe image) - only for custom orders
  if (data.uploadedImage) {
    const customImageFile = await convertImageToFile(data.uploadedImage, 'custom_model.png');
    if (customImageFile) {
      formData.append('custom_models_image', customImageFile);
    }
  }

  // Custom models fields - only for custom orders
  if (data.uploadedImage) {
    if (data.customCategoryPrice !== null && data.customCategoryPrice !== undefined) {
      formData.append('custom_models_price', data.customCategoryPrice.toString());
    }
    
    // Only send custom_models_name if productDescription is provided (remove default "Custom Made #1000")
    if (data.productDescription && data.productDescription.trim()) {
      formData.append('custom_models_name', data.productDescription.trim());
    }
    
    if (data.closureType) {
      formData.append('custom_models_verschlussart', data.closureType);
    }
  }

  // Zipper and paint images
  if (data.zipperImage) {
    const zipperImageFile = await convertImageToFile(data.zipperImage, 'zipper_image.png');
    if (zipperImageFile) {
      formData.append('zipper_image', zipperImageFile);
    }
  }

  if (data.paintImage) {
    const paintImageFile = await convertImageToFile(data.paintImage, 'paint_image.png');
    if (paintImageFile) {
      formData.append('paintImage', paintImageFile);
    }
  }

  // Massschafterstellung_json1 (all shaft configuration)
  const massschafterstellungJson1 = prepareMassschafterstellungJson1(data);
  formData.append('Massschafterstellung_json1', JSON.stringify(massschafterstellungJson1));

  // Total price
  formData.append('totalPrice', data.totalPrice.toString());

  // Courier/Business address (if Abholung)
  if (data.isAbholung && data.businessAddress) {
    // Send individual fields
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

  // Additional notes
  if (data.additionalNotes && data.additionalNotes.trim()) {
    formData.append('additionalNotes', data.additionalNotes.trim());
  }

  return formData;
};

/**
 * Prepare FormData for Step 2 (Schafterstellung + Bodenkonstruktion)
 * This is used when user completes Bodenkonstruktion and clicks "Verbindlich bestellen"
 */
export const prepareStep2FormData = async (
  data: CustomShaftData,
  massschafterstellungJson2: any,
  staticImage: string | null,
  pdfBlob: Blob | null
): Promise<FormData> => {
  // Start with Step 1 data
  const formData = await prepareStep1FormData(data);

  // Add PDF invoices (both pages)
  if (pdfBlob) {
    formData.append('invoice', pdfBlob, 'invoice.pdf');      // 1st page (Step 1)
    formData.append('invoice2', pdfBlob, 'invoice2.pdf');    // 2nd page (Step 2)
  }

  // Add static image (sole image)
  if (staticImage) {
    const staticImageFile = await convertImageToFile(staticImage, 'sole_image.png');
    if (staticImageFile) {
      formData.append('staticImage', staticImageFile);
    } else {
      formData.append('staticImage', staticImage);
    }
  }

  // Add Massschafterstellung_json2 (Bodenkonstruktion data)
  formData.append('Massschafterstellung_json2', JSON.stringify(massschafterstellungJson2));

  return formData;
};

/**
 * Get order number (default 1000 for new orders)
 */
export const getOrderNumber = (): string => {
  return '1000';
};

/**
 * Get delivery date (14 days from today)
 */
export const getDeliveryDate = (): string => {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 14);
  
  return deliveryDate.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};


'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BusinessAddress {
  companyName: string;
  address: string;
  price: number;
  phone: string;
  email: string;
}

interface CustomShaftData {
  // Customer info
  customerId?: string;
  other_customer_name?: string | null;
  customerName?: string;
  
  // Images (base64 or URLs)
  uploadedImage: string | null;
  zipperImage: string | null;
  paintImage: string | null;
  
  // Files (for upload)
  image3d_1_file?: File | null;
  image3d_2_file?: File | null;
  
  // Product info
  productDescription: string;
  customCategory: string;
  customCategoryPrice: number | null;
  
  // Collection product ID (for non-custom orders)
  mabschaftKollektionId?: string;
  
  // CAD modeling
  cadModeling: '1x' | '2x';
  cadModeling_2x_price: number | null;
  
  // Leather configuration
  lederType: string;
  lederfarbe: string;
  numberOfLeatherColors: string;
  leatherColors: string[];
  leatherColorAssignments: any[];
  
  // Shaft configuration
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
  
  // Seam and closure
  nahtfarbe: string;
  nahtfarbe_text: string;
  closureType: string;
  
  // Add-ons
  passenden_schnursenkel: boolean;
  moechten_sie_passende_schnuersenkel_zum_schuh_price: string | null;
  osen_einsetzen: boolean;
  moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: string | null;
  zipper_extra: boolean;
  moechten_sie_einen_zusaetzlichen_reissverschluss_price: string | null;
  
  // Business address (for courier)
  businessAddress: BusinessAddress | null;
  isAbholung: boolean;
  
  // Pricing
  totalPrice: number;
  
  // PDF blob from shaft configuration (Step 1)
  shaftPdfBlob?: Blob | null;
}

interface CustomShaftDataContextType {
  customShaftData: CustomShaftData | null;
  setCustomShaftData: (data: CustomShaftData | null) => void;
  clearCustomShaftData: () => void;
}

const CustomShaftDataContext = createContext<CustomShaftDataContextType | undefined>(undefined);

export function CustomShaftDataProvider({ children }: { children: ReactNode }) {
  const [customShaftData, setCustomShaftDataState] = useState<CustomShaftData | null>(null);

  const setCustomShaftData = (data: CustomShaftData | null) => {
    setCustomShaftDataState(data);
  };

  const clearCustomShaftData = () => {
    setCustomShaftDataState(null);
  };

  return (
    <CustomShaftDataContext.Provider
      value={{
        customShaftData,
        setCustomShaftData,
        clearCustomShaftData,
      }}
    >
      {children}
    </CustomShaftDataContext.Provider>
  );
}

export function useCustomShaftData() {
  const context = useContext(CustomShaftDataContext);
  if (context === undefined) {
    throw new Error('useCustomShaftData must be used within a CustomShaftDataProvider');
  }
  return context;
}



'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CustomShaftData {
  orderId: string | null;
  uploadedImage: string | null;
  zipperImage: string | null;
  paintImage: string | null;
  productDescription: string;
  customCategory: string;
  customCategoryPrice: number | null;
  cadModeling: '1x' | '2x';
  lederType: string;
  lederfarbe: string;
  innenfutter: string;
  schafthohe: string;
  polsterung: string[];
  verstarkungen: string[];
  polsterung_text: string;
  verstarkungen_text: string;
  nahtfarbe: string;
  nahtfarbe_text: string;
  closureType: string;
  numberOfLeatherColors: string;
  leatherColors: string[];
  leatherColorAssignments: any[];
  passenden_schnursenkel: boolean;
  moechten_sie_passende_schnuersenkel_zum_schuh_price: string | null;
  osen_einsetzen: boolean;
  moechten_sie_den_schaft_bereits_mit_eingesetzten_oesen_price: string | null;
  zipper_extra: boolean;
  moechten_sie_einen_zusaetzlichen_reissverschluss_price: string | null;
  businessAddress: any;
  isAbholung: boolean;
  totalPrice: number;
  customerId?: string;
  other_customer_number?: string | null;
  mabschaftKollektionId?: string;
  linkerLeistenFileName?: string;
  rechterLeistenFileName?: string;
  cadModeling_2x_price: number | null;
  hasUploadedImage: boolean;
  hasZipperImage: boolean;
  hasPaintImage: boolean;
  hasImage3d_1: boolean;
  hasImage3d_2: boolean;
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



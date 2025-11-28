import React from 'react';
import { Product } from './types';

interface ProductHeaderProps {
  product: Product;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ product }) => {
  return (
    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">Produkt</span>
        <span className="font-semibold text-gray-900">{product.Produktname}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">Artikelnummer</span>
        <span className="font-semibold text-gray-900">{product.Produktkürzel}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">Hersteller</span>
        <span className="font-semibold text-gray-900">{product.Hersteller}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">Lagerort</span>
        <span className="font-semibold text-gray-900">{product.Lagerort}</span>
      </div>
    </div>
  );
};

export default ProductHeader;


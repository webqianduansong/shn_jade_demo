"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface ProductContextType {
  selectedProductId: string | null;
  isDetailModalOpen: boolean;
  openProductDetail: (productId: string) => void;
  closeProductDetail: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setIsDetailModalOpen(true);
  };

  const closeProductDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedProductId(null);
  };

  return (
    <ProductContext.Provider
      value={{
        selectedProductId,
        isDetailModalOpen,
        openProductDetail,
        closeProductDetail,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}

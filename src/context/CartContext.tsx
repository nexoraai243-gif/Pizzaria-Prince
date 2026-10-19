import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ServiceType } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cartId' | 'lineTotal'>) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  serviceType: ServiceType;
  setServiceType: (type: ServiceType) => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalItemsCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setDeliveryFeeAmount: (fee: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'pizzaria_prince_cart_v1';
const SERVICE_TYPE_KEY = 'pizzaria_prince_service_type';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [serviceType, setServiceTypeState] = useState<ServiceType>(() => {
    try {
      const saved = localStorage.getItem(SERVICE_TYPE_KEY);
      return (saved as ServiceType) || 'delivery';
    } catch {
      return 'delivery';
    }
  });

  const [deliveryFeeAmount, setDeliveryFeeAmount] = useState<number>(1500);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const setServiceType = (type: ServiceType) => {
    setServiceTypeState(type);
    try {
      localStorage.setItem(SERVICE_TYPE_KEY, type);
    } catch (e) {
      console.error('Failed to save service type', e);
    }
  };

  const addItem = (newItem: Omit<CartItem, 'cartId' | 'lineTotal'>) => {
    setItems((prevItems) => {
      // Find matching item by productId and sizeName
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === newItem.productId && i.sizeName === newItem.sizeName
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          lineTotal: newQty * existing.unitPrice,
          notes: newItem.notes || existing.notes,
        };
        return updated;
      } else {
        const cartId = `${newItem.productId}-${newItem.sizeName}-${Date.now()}`;
        return [
          ...prevItems,
          {
            ...newItem,
            cartId,
            lineTotal: newItem.quantity * newItem.unitPrice,
          },
        ];
      }
    });
  };

  const removeItem = (cartId: string) => {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.cartId === cartId) {
          return {
            ...item,
            quantity,
            lineTotal: quantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const deliveryFee = serviceType === 'delivery' && items.length > 0 ? deliveryFeeAmount : 0;
  const total = subtotal + deliveryFee;
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        serviceType,
        setServiceType,
        subtotal,
        deliveryFee,
        total,
        totalItemsCount,
        isCartOpen,
        openCart,
        closeCart,
        setDeliveryFeeAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

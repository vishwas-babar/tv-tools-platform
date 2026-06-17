"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export interface CartItem {
  toolId: string;
  toolName: string;
  planId: string;
  planName: string;
  price: number;
  durationDays: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (toolId: string, planId: string) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
  isInCart: (toolId: string, planId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Only one plan per tool — replace any existing entry for this tool
      const withoutTool = prev.filter((i) => i.toolId !== item.toolId);
      return [...withoutTool, item];
    });
  }, []);

  const removeItem = useCallback((toolId: string, planId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.toolId === toolId && i.planId === planId))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (toolId: string, planId: string) => {
      return items.some(
        (i) => i.toolId === toolId && i.planId === planId
      );
    },
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + i.price, 0),
    [items]
  );

  const itemCount = items.length;

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      totalAmount,
      itemCount,
      isInCart,
    }),
    [items, addItem, removeItem, clearCart, totalAmount, itemCount, isInCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

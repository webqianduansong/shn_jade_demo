"use client";
import {create} from 'zustand';

export type CartItem = {productId: string; quantity: number};

type CartState = {
  items: CartItem[];
  add: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (productId, quantity) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === productId ? {productId, quantity: i.quantity + quantity} : i
          ),
        };
      }
      return {items: [...state.items, {productId, quantity}]};
    }),
  remove: (productId) => set((state) => ({items: state.items.filter((i) => i.productId !== productId)})),
  clear: () => set({items: []}),
}));



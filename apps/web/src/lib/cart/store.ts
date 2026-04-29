// Cart store – Zustand, persisted to localStorage (logged-out) or Supabase (Phase 10).
// MVP: single-item cart (one artwork at a time, matches Lean Cart spec).
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  artworkId: string;
  slug: string;
  title: string;
  imageUrl?: string;
  priceCents: number;
  currency: "EUR";
  artistId: string;
}

interface CartState {
  item: CartItem | null;
  isOpen: boolean;
  setItem: (item: CartItem) => void;
  removeItem: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      item: null,
      isOpen: false,
      setItem: (item) => set({ item, isOpen: true }),
      removeItem: () => set({ item: null }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "elbtronika-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      ),
      // Only persist the item, not UI state
      partialize: (state) => ({ item: state.item }),
    },
  ),
);

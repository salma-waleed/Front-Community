import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  level: string;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  isInCart: (id: string) => boolean;
}

const COUPONS: Record<string, number> = {
  'SAVE10': 0.10,
  'SAVE20': 0.20,
  'WELCOME50': 0.50,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discount: 0,
      addItem: (item) => {
        if (!get().isInCart(item.id)) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },
      clearCart: () => {
        set({ items: [], couponCode: null, discount: 0 });
      },
      applyCoupon: (code) => {
        const discount = COUPONS[code.toUpperCase()];
        if (discount) {
          set({ couponCode: code.toUpperCase(), discount });
          return true;
        }
        return false;
      },
      removeCoupon: () => {
        set({ couponCode: null, discount: 0 });
      },
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price, 0);
      },
      getTotal: () => {
        const subtotal = get().getSubtotal();
        return subtotal - (subtotal * get().discount);
      },
      isInCart: (id) => {
        return get().items.some((item) => item.id === id);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

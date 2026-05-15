import { create } from 'zustand';
import api from '../api';

interface WishlistState {
  items: number[];
  toggle: (listingId: number) => Promise<void>;
  load: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  toggle: async (listingId) => {
    const { data } = await api.post('/wishlist', { listingId });
    if (data.saved) {
      set({ items: [...get().items, listingId] });
    } else {
      set({ items: get().items.filter((id) => id !== listingId) });
    }
  },

  load: async () => {
    try {
      const { data } = await api.get('/wishlist');
      set({ items: data.map((w: any) => w.listingId) });
    } catch {
      set({ items: [] });
    }
  },
}));


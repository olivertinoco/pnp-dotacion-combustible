import { create } from "zustand";

export const useSelectStore = create((set) => ({
  selectedItems: [],
  setSelectedItems: (items) => set({ selectedItems: items }),
}));

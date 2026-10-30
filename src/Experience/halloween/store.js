import { create } from "zustand";
import { CANDIES } from "./config";

export const TOTAL_CANDIES = CANDIES.length;

export const useTreats = create((set) => ({
  collected: {},
  lastCollectedAt: 0,
  collect: (id) =>
    set((state) =>
      state.collected[id]
        ? state
        : {
            collected: { ...state.collected, [id]: true },
            lastCollectedAt: performance.now(),
          }
    ),
  reset: () => set({ collected: {}, lastCollectedAt: 0 }),
}));

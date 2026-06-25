import { create } from 'zustand';
import type { SearchItem } from '@/types';

interface CommandState {
  query: string;
  results: SearchItem[];
  selectedIndex: number;

  setQuery: (query: string) => void;
  setResults: (results: SearchItem[]) => void;
  setSelectedIndex: (index: number) => void;
  selectNext: () => void;
  selectPrev: () => void;
  reset: () => void;
}

export const useCommandStore = create<CommandState>((set, get) => ({
  query: '',
  results: [],
  selectedIndex: 0,

  setQuery: (query) => set({ query }),

  setResults: (results) => set({ results, selectedIndex: 0 }),

  setSelectedIndex: (index) => set({ selectedIndex: index }),

  selectNext: () => {
    const { results, selectedIndex } = get();
    if (results.length === 0) return;
    set({ selectedIndex: Math.min(selectedIndex + 1, results.length - 1) });
  },

  selectPrev: () => {
    const { selectedIndex } = get();
    set({ selectedIndex: Math.max(selectedIndex - 1, 0) });
  },

  reset: () => set({ query: '', results: [], selectedIndex: 0 }),
}));

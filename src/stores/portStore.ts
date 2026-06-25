import { create } from 'zustand';
import type { PortInfo } from '@/types';

interface PortState {
  ports: PortInfo[];
  searchQuery: string;
  loading: boolean;
  error: string | null;

  setPorts: (ports: PortInfo[]) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getFilteredPorts: () => PortInfo[];
}

export const usePortStore = create<PortState>((set, get) => ({
  ports: [],
  searchQuery: '',
  loading: false,
  error: null,

  setPorts: (ports) => set({ ports, error: null }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  getFilteredPorts: () => {
    const { ports, searchQuery } = get();
    if (!searchQuery.trim()) return ports;
    const q = searchQuery.toLowerCase();
    return ports.filter(
      (p) =>
        p.port.toString().includes(q) ||
        p.pid.toString().includes(q) ||
        p.processName.toLowerCase().includes(q),
    );
  },
}));

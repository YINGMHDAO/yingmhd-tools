import { create } from 'zustand';

interface JsonState {
  input: string;
  output: string;
  error: string | null;

  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useJsonStore = create<JsonState>((set) => ({
  input: '',
  output: '',
  error: null,

  setInput: (input) => set({ input }),

  setOutput: (output) => set({ output, error: null }),

  setError: (error) => set({ error }),

  clear: () => set({ input: '', output: '', error: null }),
}));

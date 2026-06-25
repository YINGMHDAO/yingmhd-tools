import { create } from 'zustand';

interface PluginState {
  enabledPlugins: Record<string, boolean>;

  setPluginEnabled: (id: string, enabled: boolean) => void;
  getPluginEnabled: (id: string) => boolean;
}

export const usePluginStore = create<PluginState>((set, get) => ({
  enabledPlugins: {},

  setPluginEnabled: (id, enabled) =>
    set((state) => ({
      enabledPlugins: { ...state.enabledPlugins, [id]: enabled },
    })),

  getPluginEnabled: (id) => get().enabledPlugins[id] ?? true,
}));

import { createStore } from 'zustand/vanilla';

export type ThemeMode = 'light' | 'dark';

export type AppState = {
  sidebarCollapsed: boolean;
  themeMode: ThemeMode;
};

export type AppActions = {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

export type AppStore = AppState & AppActions;

export const defaultAppState: AppState = {
  sidebarCollapsed: false,
  themeMode: 'light',
};

export const createAppStore = (initState: Partial<AppState> = {}) => {
  return createStore<AppStore>()((set) => ({
    ...defaultAppState,
    ...initState,
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    toggleSidebar: () =>
      set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setThemeMode: (mode) => set({ themeMode: mode }),
  }));
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStoreState {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (val: boolean) => void;
}

export const useSidebarStore = create<SidebarStoreState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
    }),
    {
      name: 'arthora-sidebar-collapsed',
    },
  ),
);

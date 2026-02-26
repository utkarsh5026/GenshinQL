import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarStore {
  isPinned: boolean;
  togglePin: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isPinned: false,
      togglePin: () => set((s) => ({ isPinned: !s.isPinned })),
    }),
    { name: 'sidebar-pinned' }
  )
);

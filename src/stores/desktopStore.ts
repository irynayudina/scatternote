import { create } from 'zustand';
import type { Desktop } from '@/services/api';
import { apiService } from '@/services/api';
import { client } from '@/services/graphql-api';

interface DesktopState {
  desktops: Desktop[];
  currentDesktop: Desktop | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Actions
  setDesktops: (desktops: Desktop[]) => void;
  setCurrentDesktop: (desktop: Desktop | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data fetching
  fetchDesktops: (userId: number, forceRefresh?: boolean) => Promise<void>;
  fetchDesktop: (desktopId: number, userId: number, forceRefresh?: boolean) => Promise<Desktop | null>;
  
  // Mutations
  createDesktop: (desktopData: { name: string; description?: string }, userId: number) => Promise<Desktop | null>;
  updateDesktop: (desktopId: number, desktopData: Partial<{ name: string; description: string }>, userId: number) => Promise<Desktop | null>;
  deleteDesktop: (desktopId: number, userId: number) => Promise<boolean>;
  
  // Refresh mechanism
  refreshDesktops: (userId: number) => Promise<void>;
  invalidateCache: () => void;
}

const CACHE_DURATION = 30000; // 30 seconds

export const useDesktopStore = create<DesktopState>((set, get) => ({
  desktops: [],
  currentDesktop: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  setDesktops: (desktops) => set({ desktops, lastFetched: Date.now() }),
  setCurrentDesktop: (desktop) => set({ currentDesktop: desktop }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchDesktops: async (userId: number, forceRefresh = false) => {
    const state = get();
    
    // Check cache if not forcing refresh
    if (!forceRefresh && state.lastFetched) {
      const cacheAge = Date.now() - state.lastFetched;
      if (cacheAge < CACHE_DURATION) {
        return; // Use cached data
      }
    }

    set({ isLoading: true, error: null });
    try {
      const desktops = await apiService.getDesktops(userId);
      set({ desktops, lastFetched: Date.now(), isLoading: false });
      
      // Update Apollo cache
      client.cache.evict({ fieldName: 'desktops' });
      client.cache.gc();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch desktops';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchDesktop: async (desktopId: number, userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const desktop = await apiService.getDesktop(desktopId, userId);
      set({ currentDesktop: desktop, isLoading: false });
      
      // Update desktops list if desktop exists
      const state = get();
      const desktopIndex = state.desktops.findIndex(d => d.id === desktopId);
      if (desktopIndex >= 0) {
        const updatedDesktops = [...state.desktops];
        updatedDesktops[desktopIndex] = desktop;
        set({ desktops: updatedDesktops });
      }
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'desktop' });
      client.cache.gc();
      
      return desktop;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch desktop';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  createDesktop: async (desktopData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const newDesktop = await apiService.createDesktop(desktopData, userId);
      const state = get();
      set({ 
        desktops: [...state.desktops, newDesktop],
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'desktops' });
      client.cache.gc();
      
      return newDesktop;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create desktop';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateDesktop: async (desktopId, desktopData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDesktop = await apiService.updateDesktop(desktopId, desktopData, userId);
      const state = get();
      const updatedDesktops = state.desktops.map(d => 
        d.id === desktopId ? updatedDesktop : d
      );
      
      set({ 
        desktops: updatedDesktops,
        currentDesktop: state.currentDesktop?.id === desktopId ? updatedDesktop : state.currentDesktop,
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'desktop' });
      client.cache.evict({ fieldName: 'desktops' });
      client.cache.gc();
      
      return updatedDesktop;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update desktop';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteDesktop: async (desktopId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteDesktop(desktopId, userId);
      const state = get();
      set({ 
        desktops: state.desktops.filter(d => d.id !== desktopId),
        currentDesktop: state.currentDesktop?.id === desktopId ? null : state.currentDesktop,
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'desktop' });
      client.cache.evict({ fieldName: 'desktops' });
      client.cache.gc();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete desktop';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  refreshDesktops: async (userId) => {
    await get().fetchDesktops(userId, true);
  },

  invalidateCache: () => {
    set({ lastFetched: null });
    client.cache.evict({ fieldName: 'desktops' });
    client.cache.evict({ fieldName: 'desktop' });
    client.cache.gc();
  },
}));


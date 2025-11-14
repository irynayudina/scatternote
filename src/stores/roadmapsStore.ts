import { create } from 'zustand';
import type { Roadmap } from '@/services/api';
import { apiService } from '@/services/api';
import { client } from '@/services/graphql-api';

interface RoadmapsState {
  roadmaps: Roadmap[];
  currentRoadmap: Roadmap | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  currentDesktopId: number | null;
  
  // Actions
  setRoadmaps: (roadmaps: Roadmap[]) => void;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentDesktopId: (desktopId: number | null) => void;
  
  // Data fetching
  fetchRoadmaps: (userId: number, desktopId?: number, forceRefresh?: boolean) => Promise<void>;
  fetchRoadmap: (roadmapId: number, userId: number, forceRefresh?: boolean) => Promise<Roadmap | null>;
  
  // Mutations
  createRoadmap: (roadmapData: {
    title: string;
    description?: string;
    steps: Array<{
      title: string;
      description?: string;
      order: number;
      isCompleted?: boolean;
    }>;
  }, userId: number, desktopId: number) => Promise<Roadmap | null>;
  
  updateRoadmap: (roadmapId: number, roadmapData: Partial<{
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description?: string;
      order: number;
      isCompleted?: boolean;
    }>;
  }>, userId: number) => Promise<Roadmap | null>;
  
  deleteRoadmap: (roadmapId: number, userId: number) => Promise<boolean>;
  transferRoadmap: (roadmapId: number, targetDesktopId: number, userId: number) => Promise<Roadmap | null>;
  toggleStepCompletion: (stepId: number, userId: number) => Promise<Roadmap | null>;
  updateRoadmapStep: (stepId: number, stepData: Partial<{
    title: string;
    description: string;
    order: number;
    isCompleted: boolean;
  }>, userId: number) => Promise<Roadmap | null>;
  reorderSteps: (roadmapId: number, stepIds: number[], userId: number) => Promise<Roadmap | null>;
  
  // Refresh mechanism
  refreshRoadmaps: (userId: number, desktopId?: number) => Promise<void>;
  invalidateCache: () => void;
}

const CACHE_DURATION = 30000; // 30 seconds

export const useRoadmapsStore = create<RoadmapsState>((set, get) => ({
  roadmaps: [],
  currentRoadmap: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  currentDesktopId: null,

  setRoadmaps: (roadmaps) => set({ roadmaps, lastFetched: Date.now() }),
  setCurrentRoadmap: (roadmap) => set({ currentRoadmap: roadmap }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setCurrentDesktopId: (currentDesktopId) => set({ currentDesktopId }),

  fetchRoadmaps: async (userId: number, desktopId?: number, forceRefresh = false) => {
    const state = get();
    
    // Check cache if not forcing refresh
    if (!forceRefresh && state.lastFetched && state.currentDesktopId === desktopId) {
      const cacheAge = Date.now() - state.lastFetched;
      if (cacheAge < CACHE_DURATION) {
        return; // Use cached data
      }
    }

    set({ isLoading: true, error: null, currentDesktopId: desktopId || null });
    try {
      const roadmaps = await apiService.getRoadmaps(userId, desktopId);
      set({ roadmaps, isLoading: false, lastFetched: Date.now() });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roadmaps';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchRoadmap: async (roadmapId: number, userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const roadmap = await apiService.getRoadmap(roadmapId, userId);
      set({ currentRoadmap: roadmap, isLoading: false });
      
      // Update roadmaps list if roadmap exists
      const state = get();
      const roadmapIndex = state.roadmaps.findIndex(r => r.id === roadmapId);
      if (roadmapIndex >= 0) {
        const updatedRoadmaps = [...state.roadmaps];
        updatedRoadmaps[roadmapIndex] = roadmap;
        set({ roadmaps: updatedRoadmaps });
      }
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmap' });
      client.cache.gc();
      
      return roadmap;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roadmap';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  createRoadmap: async (roadmapData, userId, desktopId) => {
    set({ isLoading: true, error: null });
    try {
      const newRoadmap = await apiService.createRoadmap(roadmapData, userId, desktopId);
      const state = get();
      set({ 
        roadmaps: [...state.roadmaps, newRoadmap],
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
      
      return newRoadmap;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create roadmap';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateRoadmap: async (roadmapId, roadmapData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRoadmap = await apiService.updateRoadmap(roadmapId, roadmapData, userId);
      const state = get();
      const updatedRoadmaps = state.roadmaps.map(r => 
        r.id === roadmapId ? updatedRoadmap : r
      );
      
      set({ 
        roadmaps: updatedRoadmaps,
        currentRoadmap: state.currentRoadmap?.id === roadmapId ? updatedRoadmap : state.currentRoadmap,
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmap' });
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
      
      return updatedRoadmap;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update roadmap';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteRoadmap: async (roadmapId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteRoadmap(roadmapId, userId);
      const state = get();
      set({ 
        roadmaps: state.roadmaps.filter(r => r.id !== roadmapId),
        currentRoadmap: state.currentRoadmap?.id === roadmapId ? null : state.currentRoadmap,
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmap' });
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete roadmap';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  transferRoadmap: async (roadmapId, targetDesktopId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const transferredRoadmap = await apiService.transferRoadmap(roadmapId, targetDesktopId, userId);
      const state = get();
      
      // Remove roadmap from current desktop's roadmaps if it's in the current view
      if (state.currentDesktopId && transferredRoadmap.desktopId !== state.currentDesktopId) {
        set({ 
          roadmaps: state.roadmaps.filter(r => r.id !== roadmapId),
          isLoading: false 
        });
      } else {
        // Update roadmap in list
        const updatedRoadmaps = state.roadmaps.map(r => 
          r.id === roadmapId ? transferredRoadmap : r
        );
        set({ roadmaps: updatedRoadmaps, isLoading: false });
      }
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmap' });
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
      
      return transferredRoadmap;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer roadmap';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  toggleStepCompletion: async (stepId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRoadmap = await apiService.toggleStepCompletion(stepId, userId);
      const state = get();
      const updatedRoadmaps = state.roadmaps.map(r => 
        r.id === updatedRoadmap.id ? updatedRoadmap : r
      );
      
      set({ 
        roadmaps: updatedRoadmaps,
        currentRoadmap: state.currentRoadmap?.id === updatedRoadmap.id ? updatedRoadmap : state.currentRoadmap,
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmap' });
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
      
      return updatedRoadmap;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle step completion';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateRoadmapStep: async (stepId, stepData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRoadmap = await apiService.updateRoadmapStep(stepId, stepData, userId);
      const state = get();
      const updatedRoadmaps = state.roadmaps.map(r => 
        r.id === updatedRoadmap.id ? updatedRoadmap : r
      );
      
      set({ 
        roadmaps: updatedRoadmaps,
        currentRoadmap: state.currentRoadmap?.id === updatedRoadmap.id ? updatedRoadmap : state.currentRoadmap,
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmap' });
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
      
      return updatedRoadmap;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update roadmap step';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  reorderSteps: async (roadmapId, stepIds, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRoadmap = await apiService.reorderSteps(roadmapId, stepIds, userId);
      const state = get();
      const updatedRoadmaps = state.roadmaps.map(r => 
        r.id === roadmapId ? updatedRoadmap : r
      );
      
      set({ 
        roadmaps: updatedRoadmaps,
        currentRoadmap: state.currentRoadmap?.id === roadmapId ? updatedRoadmap : state.currentRoadmap,
        isLoading: false 
      });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'roadmap' });
      client.cache.evict({ fieldName: 'roadmaps' });
      client.cache.gc();
      
      return updatedRoadmap;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder steps';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  refreshRoadmaps: async (userId: number, desktopId?: number) => {
    await get().fetchRoadmaps(userId, desktopId, true);
  },

  invalidateCache: () => {
    set({ lastFetched: null });
    client.cache.evict({ fieldName: 'roadmaps' });
    client.cache.evict({ fieldName: 'roadmap' });
    client.cache.gc();
  },
}));


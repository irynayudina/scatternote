import { create } from 'zustand';
import { aiService } from '../services/ai-api';
import type { DailyGoal } from '../services/ai-api';

interface AIState {
  dailyGoals: DailyGoal[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchDailyGoals: (userId: number) => Promise<void>;
  clearGoals: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  dailyGoals: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchDailyGoals: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await aiService.getDailyGoals(userId);
      set({
        dailyGoals: response.goals,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch goals',
        isLoading: false,
      });
    }
  },

  clearGoals: () => set({ dailyGoals: [], lastFetched: null }),
}));
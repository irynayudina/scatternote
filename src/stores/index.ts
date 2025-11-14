// Central export for all stores
export { useUserStore } from './userStore';
export { useDesktopStore } from './desktopStore';
export { useNotesStore } from './notesStore';
export { useRoadmapsStore } from './roadmapsStore';
export { useUIStore } from './uiStore';

// Helper hook to refresh all data
import { useUserStore } from './userStore';
import { useDesktopStore } from './desktopStore';
import { useNotesStore } from './notesStore';
import { useRoadmapsStore } from './roadmapsStore';

export const useRefreshAllData = () => {
  const user = useUserStore((state) => state.user);
  const refreshDesktops = useDesktopStore((state) => state.refreshDesktops);
  const refreshNotes = useNotesStore((state) => state.refreshNotes);
  const refreshRoadmaps = useRoadmapsStore((state) => state.refreshRoadmaps);
  
  return async (desktopId?: number) => {
    if (!user) return;
    
    await Promise.all([
      refreshDesktops(user.id),
      refreshNotes(user.id, desktopId),
      refreshRoadmaps(user.id, desktopId),
    ]);
  };
};

// Helper hook to invalidate all caches
export const useInvalidateAllCaches = () => {
  const invalidateDesktopCache = useDesktopStore((state) => state.invalidateCache);
  const invalidateNotesCache = useNotesStore((state) => state.invalidateCache);
  const invalidateRoadmapsCache = useRoadmapsStore((state) => state.invalidateCache);
  
  return () => {
    invalidateDesktopCache();
    invalidateNotesCache();
    invalidateRoadmapsCache();
  };
};


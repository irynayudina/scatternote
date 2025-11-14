import { create } from 'zustand';

interface UIState {
  // View modes
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Modal states
  isCreateNoteModalOpen: boolean;
  isCreateDesktopModalOpen: boolean;
  isCreateRoadmapModalOpen: boolean;
  isEditDesktopsModalOpen: boolean;
  isFilterModalOpen: boolean;
  isNoteViewerOpen: boolean;
  isRoadmapViewerOpen: boolean;
  
  setCreateNoteModalOpen: (open: boolean) => void;
  setCreateDesktopModalOpen: (open: boolean) => void;
  setCreateRoadmapModalOpen: (open: boolean) => void;
  setEditDesktopsModalOpen: (open: boolean) => void;
  setFilterModalOpen: (open: boolean) => void;
  setNoteViewerOpen: (open: boolean) => void;
  setRoadmapViewerOpen: (open: boolean) => void;
  
  // Drag and drop
  draggedItem: { type: 'note' | 'roadmap', id: number, title: string } | null;
  isDragging: boolean;
  dragOverDesktop: number | null;
  isDragModeEnabled: boolean;
  
  setDraggedItem: (item: { type: 'note' | 'roadmap', id: number, title: string } | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  setDragOverDesktop: (desktopId: number | null) => void;
  setIsDragModeEnabled: (enabled: boolean) => void;
  
  // Carousel state
  isCarouselVisible: boolean;
  isMouseOverCarousel: boolean;
  
  setCarouselVisible: (visible: boolean) => void;
  setMouseOverCarousel: (over: boolean) => void;
  
  // Active desktop ID
  activeDesktopId: number | null;
  setActiveDesktopId: (id: number | null) => void;
  
  // Close all modals helper
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'grid',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  isCreateNoteModalOpen: false,
  isCreateDesktopModalOpen: false,
  isCreateRoadmapModalOpen: false,
  isEditDesktopsModalOpen: false,
  isFilterModalOpen: false,
  isNoteViewerOpen: false,
  isRoadmapViewerOpen: false,
  
  setCreateNoteModalOpen: (open) => set({ isCreateNoteModalOpen: open }),
  setCreateDesktopModalOpen: (open) => set({ isCreateDesktopModalOpen: open }),
  setCreateRoadmapModalOpen: (open) => set({ isCreateRoadmapModalOpen: open }),
  setEditDesktopsModalOpen: (open) => set({ isEditDesktopsModalOpen: open }),
  setFilterModalOpen: (open) => set({ isFilterModalOpen: open }),
  setNoteViewerOpen: (open) => set({ isNoteViewerOpen: open }),
  setRoadmapViewerOpen: (open) => set({ isRoadmapViewerOpen: open }),
  
  draggedItem: null,
  isDragging: false,
  dragOverDesktop: null,
  isDragModeEnabled: false,
  
  setDraggedItem: (item) => set({ draggedItem: item }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setDragOverDesktop: (desktopId) => set({ dragOverDesktop: desktopId }),
  setIsDragModeEnabled: (enabled) => set({ isDragModeEnabled: enabled }),
  
  isCarouselVisible: false,
  isMouseOverCarousel: false,
  
  setCarouselVisible: (visible) => set({ isCarouselVisible: visible }),
  setMouseOverCarousel: (over) => set({ isMouseOverCarousel: over }),
  
  activeDesktopId: null,
  setActiveDesktopId: (id) => set({ activeDesktopId: id }),
  
  closeAllModals: () => set({
    isCreateNoteModalOpen: false,
    isCreateDesktopModalOpen: false,
    isCreateRoadmapModalOpen: false,
    isEditDesktopsModalOpen: false,
    isFilterModalOpen: false,
    isNoteViewerOpen: false,
    isRoadmapViewerOpen: false,
  }),
}));


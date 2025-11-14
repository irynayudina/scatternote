import { create } from 'zustand';
import type { Note } from '@/services/api';
import { apiService } from '@/services/api';
import { client } from '@/services/graphql-api';
import type { FilterState } from '@/components/FilterModal';

interface NotesState {
  notes: Note[];
  allNotes: Note[]; // All notes for filtering
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  filters: FilterState;
  searchQuery: string;
  currentDesktopId: number | null;
  
  // Actions
  setNotes: (notes: Note[]) => void;
  setAllNotes: (notes: Note[]) => void;
  setCurrentNote: (note: Note | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: FilterState) => void;
  setSearchQuery: (query: string) => void;
  setCurrentDesktopId: (desktopId: number | null) => void;
  
  // Data fetching
  fetchNotes: (userId: number, desktopId?: number, forceRefresh?: boolean) => Promise<void>;
  fetchNote: (noteId: number, userId: number, forceRefresh?: boolean) => Promise<Note | null>;
  
  // Mutations
  createNote: (noteData: {
    title: string;
    content: string;
    desktopId: number;
    tags?: string[];
    isPinned?: boolean;
  }, userId: number) => Promise<Note | null>;
  
  updateNote: (noteId: number, noteData: Partial<{
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
  }>, userId: number) => Promise<Note | null>;
  
  deleteNote: (noteId: number, userId: number) => Promise<boolean>;
  toggleNotePin: (noteId: number, userId: number) => Promise<Note | null>;
  transferNote: (noteId: number, targetDesktopId: number, userId: number) => Promise<Note | null>;
  
  // Filtering
  applyFilters: () => void;
  clearFilters: () => void;
  
  // Refresh mechanism
  refreshNotes: (userId: number, desktopId?: number) => Promise<void>;
  invalidateCache: () => void;
}

const CACHE_DURATION = 30000; // 30 seconds

// Helper function to filter notes
const filterNotes = (notes: Note[], filters: FilterState, searchQuery: string): Note[] => {
  let filtered = [...notes];

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  }

  // Apply date range filter
  if (filters.dateRange.startDate || filters.dateRange.endDate) {
    filtered = filtered.filter(note => {
      const noteDate = new Date(note.createdAt);
      if (filters.dateRange.startDate) {
        const startDate = new Date(filters.dateRange.startDate);
        if (noteDate < startDate) return false;
      }
      if (filters.dateRange.endDate) {
        const endDate = new Date(filters.dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Include entire end date
        if (noteDate > endDate) return false;
      }
      return true;
    });
  }

  // Apply tag filter
  if (filters.selectedTags.length > 0) {
    filtered = filtered.filter(note => {
      const noteTags = note.tags?.map(t => t.tag.name.toLowerCase()) || [];
      return filters.selectedTags.some(tag => 
        noteTags.includes(tag.toLowerCase())
      );
    });
  }

  // Apply pinned filter
  if (filters.isPinned !== null) {
    filtered = filtered.filter(note => note.isPinned === filters.isPinned);
  }

  return filtered;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  allNotes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  filters: {
    dateRange: { startDate: '', endDate: '' },
    selectedTags: [],
    isPinned: null,
  },
  searchQuery: '',
  currentDesktopId: null,

  setNotes: (notes) => set({ notes, lastFetched: Date.now() }),
  setAllNotes: (allNotes) => {
    const state = get();
    set({ allNotes });
    // Automatically apply filters when allNotes changes
    const filtered = filterNotes(allNotes, state.filters, state.searchQuery);
    set({ notes: filtered });
  },
  setCurrentNote: (note) => set({ currentNote: note }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => {
    const state = get();
    set({ filters });
    // Apply filters to allNotes
    const filtered = filterNotes(state.allNotes, filters, state.searchQuery);
    set({ notes: filtered });
  },
  setSearchQuery: (searchQuery) => {
    const state = get();
    set({ searchQuery });
    // Apply search query
    const filtered = filterNotes(state.allNotes, state.filters, searchQuery);
    set({ notes: filtered });
  },
  setCurrentDesktopId: (currentDesktopId) => set({ currentDesktopId }),

  fetchNotes: async (userId: number, desktopId?: number, forceRefresh = false) => {
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
      const notes = await apiService.getNotes(userId, desktopId);
      set({ allNotes: notes, isLoading: false, lastFetched: Date.now() });
      
      // Apply filters
      const filtered = filterNotes(notes, state.filters, state.searchQuery);
      set({ notes: filtered });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'notes' });
      client.cache.gc();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notes';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchNote: async (noteId: number, userId: number, forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const note = await apiService.getNote(noteId, userId);
      set({ currentNote: note, isLoading: false });
      
      // Update notes list if note exists
      const state = get();
      const noteIndex = state.allNotes.findIndex(n => n.id === noteId);
      if (noteIndex >= 0) {
        const updatedAllNotes = [...state.allNotes];
        updatedAllNotes[noteIndex] = note;
        set({ allNotes: updatedAllNotes });
        
        // Re-apply filters
        const filtered = filterNotes(updatedAllNotes, state.filters, state.searchQuery);
        set({ notes: filtered });
      }
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'note' });
      client.cache.gc();
      
      return note;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch note';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  createNote: async (noteData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await apiService.createNote(noteData, userId);
      const state = get();
      const updatedAllNotes = [...state.allNotes, newNote];
      set({ allNotes: updatedAllNotes, isLoading: false });
      
      // Re-apply filters
      const filtered = filterNotes(updatedAllNotes, state.filters, state.searchQuery);
      set({ notes: filtered });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'notes' });
      client.cache.gc();
      
      return newNote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  updateNote: async (noteId, noteData, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await apiService.updateNote(noteId, noteData, userId);
      const state = get();
      const updatedAllNotes = state.allNotes.map(n => 
        n.id === noteId ? updatedNote : n
      );
      
      set({ 
        allNotes: updatedAllNotes,
        currentNote: state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        isLoading: false 
      });
      
      // Re-apply filters
      const filtered = filterNotes(updatedAllNotes, state.filters, state.searchQuery);
      set({ notes: filtered });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'note' });
      client.cache.evict({ fieldName: 'notes' });
      client.cache.gc();
      
      return updatedNote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  deleteNote: async (noteId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteNote(noteId, userId);
      const state = get();
      const updatedAllNotes = state.allNotes.filter(n => n.id !== noteId);
      set({ 
        allNotes: updatedAllNotes,
        currentNote: state.currentNote?.id === noteId ? null : state.currentNote,
        isLoading: false 
      });
      
      // Re-apply filters
      const filtered = filterNotes(updatedAllNotes, state.filters, state.searchQuery);
      set({ notes: filtered });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'note' });
      client.cache.evict({ fieldName: 'notes' });
      client.cache.gc();
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  toggleNotePin: async (noteId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await apiService.toggleNotePin(noteId, userId);
      const state = get();
      const updatedAllNotes = state.allNotes.map(n => 
        n.id === noteId ? updatedNote : n
      );
      
      set({ 
        allNotes: updatedAllNotes,
        currentNote: state.currentNote?.id === noteId ? updatedNote : state.currentNote,
        isLoading: false 
      });
      
      // Re-apply filters
      const filtered = filterNotes(updatedAllNotes, state.filters, state.searchQuery);
      set({ notes: filtered });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'note' });
      client.cache.evict({ fieldName: 'notes' });
      client.cache.gc();
      
      return updatedNote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle note pin';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  transferNote: async (noteId, targetDesktopId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const transferredNote = await apiService.transferNote(noteId, targetDesktopId, userId);
      const state = get();
      
      // Remove note from current desktop's notes if it's in the current view
      if (state.currentDesktopId && transferredNote.desktopId !== state.currentDesktopId) {
        const updatedAllNotes = state.allNotes.filter(n => n.id !== noteId);
        set({ allNotes: updatedAllNotes });
        
        // Re-apply filters
        const filtered = filterNotes(updatedAllNotes, state.filters, state.searchQuery);
        set({ notes: filtered });
      } else {
        // Update note in list
        const updatedAllNotes = state.allNotes.map(n => 
          n.id === noteId ? transferredNote : n
        );
        set({ allNotes: updatedAllNotes });
        
        // Re-apply filters
        const filtered = filterNotes(updatedAllNotes, state.filters, state.searchQuery);
        set({ notes: filtered });
      }
      
      set({ isLoading: false });
      
      // Invalidate Apollo cache
      client.cache.evict({ fieldName: 'note' });
      client.cache.evict({ fieldName: 'notes' });
      client.cache.gc();
      
      return transferredNote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transfer note';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },

  applyFilters: () => {
    const state = get();
    const filtered = filterNotes(state.allNotes, state.filters, state.searchQuery);
    set({ notes: filtered });
  },

  clearFilters: () => {
    const clearedFilters: FilterState = {
      dateRange: { startDate: '', endDate: '' },
      selectedTags: [],
      isPinned: null,
    };
    const state = get();
    set({ filters: clearedFilters });
    const filtered = filterNotes(state.allNotes, clearedFilters, state.searchQuery);
    set({ notes: filtered });
  },

  refreshNotes: async (userId: number, desktopId?: number) => {
    await get().fetchNotes(userId, desktopId, true);
  },

  invalidateCache: () => {
    set({ lastFetched: null });
    client.cache.evict({ fieldName: 'notes' });
    client.cache.evict({ fieldName: 'note' });
    client.cache.gc();
  },
}));


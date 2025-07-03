import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import CreateNoteModal from "./CreateNoteModal"
import CreateDesktopModal from "./CreateDesktopModal"
import CreateRoadmapModal from "./CreateRoadmapModal"
import NoteViewer from "./NoteViewer"
import RoadmapViewer from "./RoadmapViewer"
import FilterModal from "./FilterModal"
import DesktopCarousel from "./DesktopCarousel"
import RoadmapsSection from "./RoadmapsSection"
import NotesSection from "./NotesSection"
import DesktopToolbar from "./DesktopToolbar"
import EmptyDesktopState from "./EmptyDesktopState"
import type { FilterState } from "./FilterModal"
import { apiService } from "@/services/api"
import type { Note, Desktop as DesktopType, Roadmap } from "@/services/api"

interface UserData {
  id: number
  username: string
  email: string
  token: string
  role: string
  createdAt: string
}

const Desktop = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserData | null>(null)
  const [desktop, setDesktop] = useState<DesktopType | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDesktopId, setActiveDesktopId] = useState<number>(1)
  const [desktops, setDesktops] = useState<DesktopType[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateDesktopModalOpen, setIsCreateDesktopModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false)
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null)
  const [isRoadmapViewerOpen, setIsRoadmapViewerOpen] = useState(false)
  const [isCreateRoadmapModalOpen, setIsCreateRoadmapModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { startDate: '', endDate: '' },
    selectedTags: [],
    isPinned: null
  })
  const [allNotes, setAllNotes] = useState<Note[]>([]) // Store all notes for client-side filtering

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ type: 'note' | 'roadmap', id: number, title: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverDesktop, setDragOverDesktop] = useState<number | null>(null)
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = sessionStorage.getItem('user')
    const token = sessionStorage.getItem('token')

    if (!userData || !token) {
      navigate('/')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      loadDesktopData(parsedUser.id, parseInt(id || '1'))
      loadDesktops(parsedUser.id)
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }, [navigate, id])



  const loadDesktops = async (userId: number) => {
    try {
      setError(null)
      const desktopsData = await apiService.getDesktops(userId)
      setDesktops(desktopsData)
      
      // Set active desktop ID if not already set or if current desktop doesn't exist
      if (!activeDesktopId || !desktopsData.find(d => d.id === activeDesktopId)) {
        const defaultDesktopId = desktopsData.length > 0 ? desktopsData[0].id : 1
        setActiveDesktopId(defaultDesktopId)
      }
    } catch (error) {
      console.error('Error loading desktops:', error)
      setError('Failed to load desktops')
    }
  }

  const loadDesktopData = async (userId: number, desktopId: number) => {
    try {
      setError(null)
      const desktopData = await apiService.getDesktop(desktopId, userId)
      setDesktop(desktopData)
      
      // Load notes for this desktop
      const notesData = await apiService.getNotes(userId, desktopId)
      setAllNotes(notesData) // Store all notes for filtering
      setNotes(notesData)

      // Load roadmaps for this desktop
      const roadmapsData = await apiService.getRoadmaps(userId, desktopId)
      setRoadmaps(roadmapsData)
    } catch (error) {
      console.error('Error loading desktop data:', error)
      setError('Failed to load desktop data')
    }
  }

  const handleCreateNote = () => {
    setIsCreateModalOpen(true)
  }

  const handleNoteCreated = async () => {
    // Refresh notes after creation
    if (user) {
      await loadDesktopData(user.id, parseInt(id || '1'))
    }
  }

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
    setIsNoteViewerOpen(true)
  }

  const handleNoteUpdated = async () => {
    // Refresh notes after update
    if (user) {
      await loadDesktopData(user.id, parseInt(id || '1'))
    }
  }

  const handleNoteDeleted = async () => {
    // Refresh notes after deletion
    if (user) {
      await loadDesktopData(user.id, parseInt(id || '1'))
    }
  }

  const handleDesktopChange = async (desktopId: number) => {
    setActiveDesktopId(desktopId)
    // Reset filters when switching desktops
    const resetFilters: FilterState = {
      dateRange: { startDate: '', endDate: '' },
      selectedTags: [],
      isPinned: null
    }
    setFilters(resetFilters)
    navigate(`/desktop/${desktopId}`)
  }



  // Handle search with API
  const handleSearch = async (query: string) => {
    if (!user) return
    
    try {
      setError(null)
      if (query.trim()) {
        const searchResults = await apiService.searchNotes(user.id, query)
        setAllNotes(searchResults) // Store search results for filtering
        setNotes(searchResults)
      } else {
        // If search is empty, load notes for current desktop
        await loadDesktopData(user.id, parseInt(id || '1'))
      }
    } catch (error) {
      console.error('Error searching notes:', error)
      setError('Failed to search notes')
    }
  }

  // Apply filters to notes
  const applyFilters = (filterState: FilterState) => {
    setFilters(filterState)
    
    let filteredResults = [...allNotes]
    
    // Apply date range filter
    if (filterState.dateRange.startDate || filterState.dateRange.endDate) {
      filteredResults = filteredResults.filter(note => {
        const noteDate = new Date(note.updatedAt)
        const startDate = filterState.dateRange.startDate ? new Date(filterState.dateRange.startDate) : null
        const endDate = filterState.dateRange.endDate ? new Date(filterState.dateRange.endDate) : null
        
        if (startDate && noteDate < startDate) return false
        if (endDate && noteDate > endDate) return false
        return true
      })
    }
    
    // Apply tag filter
    if (filterState.selectedTags.length > 0) {
      filteredResults = filteredResults.filter(note => {
        if (!note.tags || note.tags.length === 0) return false
        return filterState.selectedTags.some(selectedTag => 
          note.tags!.some(noteTag => noteTag.tag.name === selectedTag)
        )
      })
    }
    
    // Apply pinned filter
    if (filterState.isPinned !== null) {
      filteredResults = filteredResults.filter(note => note.isPinned === filterState.isPinned)
    }
    
    setNotes(filteredResults)
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, user])

  // Apply filters when allNotes changes (after search or desktop change)
  useEffect(() => {
    if (allNotes.length > 0) {
      applyFilters(filters)
    }
  }, [allNotes])

  const filteredNotes = notes // Notes are already filtered by the API

  const handleCreateDesktop = () => {
    setIsCreateDesktopModalOpen(true)
  }

  const handleDesktopCreated = async () => {
    // Refresh desktops after creation
    if (user) {
      await loadDesktops(user.id)
      // If this was the first desktop, navigate to it
      const updatedDesktops = await apiService.getDesktops(user.id)
      if (updatedDesktops.length === 1) {
        navigate(`/desktop/${updatedDesktops[0].id}`)
      }
    }
  }

  const handleCreateRoadmap = () => {
    setIsCreateRoadmapModalOpen(true)
  }

  const handleRoadmapCreated = async () => {
    // Refresh roadmaps after creation
    if (user) {
      await loadDesktopData(user.id, parseInt(id || '1'))
    }
  }

  const handleRoadmapClick = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap)
    setIsRoadmapViewerOpen(true)
  }

  const handleRoadmapUpdated = async () => {
    // Refresh roadmaps after update
    if (user) {
      await loadDesktopData(user.id, parseInt(id || '1'))
    }
  }

  const handleRoadmapDeleted = async () => {
    // Refresh roadmaps after deletion
    if (user) {
      await loadDesktopData(user.id, parseInt(id || '1'))
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: { type: 'note' | 'roadmap', id: number, title: string }) => {
    if (!isDragModeEnabled) {
      e.preventDefault()
      return
    }
    setDraggedItem(item)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify(item))
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setIsDragging(false)
    setDragOverDesktop(null)
  }

  const handleDragOver = (e: React.DragEvent, desktopId: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDesktop(desktopId)
  }

  const handleDragLeave = () => {
    setDragOverDesktop(null)
  }

  const handleDrop = async (e: React.DragEvent, targetDesktopId: number) => {
    e.preventDefault()
    
    if (!draggedItem || !user) return

    try {
      setError(null)
      
      if (draggedItem.type === 'note') {
        await apiService.transferNote(draggedItem.id, targetDesktopId, user.id)
      } else if (draggedItem.type === 'roadmap') {
        await apiService.transferRoadmap(draggedItem.id, targetDesktopId, user.id)
      }

      // Refresh data after transfer
      await loadDesktopData(user.id, parseInt(id || '1'))
      
      // Show success message
      setError('✅ Item transferred successfully!')
      setTimeout(() => setError(null), 3000)
      
    } catch (error) {
      console.error('Error transferring item:', error)
      setError('Failed to transfer item. Please try again.')
    } finally {
      setDraggedItem(null)
      setIsDragging(false)
      setDragOverDesktop(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || !desktop) {
    return null
  }



  return (
    <div className="min-h-screen">
      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        desktopId={parseInt(id || '1')}
        userId={user?.id || 0}
        onNoteCreated={handleNoteCreated}
      />

      {/* Note Viewer Modal */}
      <NoteViewer
        note={selectedNote}
        isOpen={isNoteViewerOpen}
        onClose={() => {
          setIsNoteViewerOpen(false)
          setSelectedNote(null)
        }}
        onNoteUpdated={handleNoteUpdated}
        onNoteDeleted={handleNoteDeleted}
        userId={user?.id || 0}
      />

      {/* Create Desktop Modal */}
      <CreateDesktopModal
        isOpen={isCreateDesktopModalOpen}
        onClose={() => setIsCreateDesktopModalOpen(false)}
        userId={user?.id || 0}
        onDesktopCreated={handleDesktopCreated}
      />

      {/* Create Roadmap Modal */}
      <CreateRoadmapModal
        isOpen={isCreateRoadmapModalOpen}
        onClose={() => setIsCreateRoadmapModalOpen(false)}
        desktopId={parseInt(id || '1')}
        userId={user?.id || 0}
        onRoadmapCreated={handleRoadmapCreated}
      />

      {/* Roadmap Viewer Modal */}
      <RoadmapViewer
        roadmap={selectedRoadmap}
        isOpen={isRoadmapViewerOpen}
        onClose={() => {
          setIsRoadmapViewerOpen(false)
          setSelectedRoadmap(null)
        }}
        onRoadmapUpdated={handleRoadmapUpdated}
        onRoadmapDeleted={handleRoadmapDeleted}
        userId={user?.id || 0}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={applyFilters}
        currentFilters={filters}
      />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm z-10 border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text after:content-[''] after:block after:w-full after:h-[1px] after:bg-pink-200 before:content-[''] before:inline-block before:w-6 before:h-6 before:bg-gradient-to-r before:from-pink-400 before:to-purple-400 before:rounded-full before:mr-2">{desktop.name}</h1>
              <p className="text-gray-600">{desktop.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/knowledge-base')} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                Knowledge Base
              </Button>
              <Button onClick={() => navigate('/settings')} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                Settings
              </Button>
              <Button onClick={() => navigate('/home-board')} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                Go to Home Board
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error/Success Message */}
      {error && (
        <div className={`px-4 py-3 rounded-md mx-4 mt-4 ${
          error.includes('✅') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Empty Desktop State */}
      {!isLoading && desktops.length === 0 && (
        <EmptyDesktopState
          onCreateDesktop={handleCreateDesktop}
          onGoToHomeBoard={() => navigate('/home-board')}
        />
      )}

      {/* Desktop Carousel - Only show if there are desktops */}
      {desktops.length > 0 && (
        <DesktopCarousel
          desktops={desktops}
          activeDesktopId={activeDesktopId}
          onDesktopChange={handleDesktopChange}
          isDragModeEnabled={isDragModeEnabled}
          dragOverDesktop={dragOverDesktop}
          onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      )}

      {/* Main Content - Only show if there are desktops */}
      {desktops.length > 0 && (
        <main className="bg-white/60 min-h-[calc(100vh-271px)] max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Toolbar */}
            <DesktopToolbar
              onCreateNote={handleCreateNote}
              onCreateRoadmap={handleCreateRoadmap}
              isDragModeEnabled={isDragModeEnabled}
              onToggleDragMode={() => setIsDragModeEnabled(!isDragModeEnabled)}
              searchQuery={searchQuery}
              onSearchChange={(query) => setSearchQuery(query)}
              filters={filters}
              onOpenFilterModal={() => setIsFilterModalOpen(true)}
              viewMode={viewMode}
              onViewModeChange={(mode) => setViewMode(mode)}
            />

            {/* Roadmaps Section */}
            <RoadmapsSection
              roadmaps={roadmaps}
              onRoadmapClick={handleRoadmapClick}
              isDragModeEnabled={isDragModeEnabled}
              isDragging={isDragging}
              draggedItem={draggedItem}
              onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
            />

            {/* Notes Section */}
            <NotesSection
              notes={filteredNotes}
              viewMode={viewMode}
              searchQuery={searchQuery}
              filters={filters}
              isDragModeEnabled={isDragModeEnabled}
              isDragging={isDragging}
              draggedItem={draggedItem}
              onNoteClick={handleNoteClick}
              onCreateNote={handleCreateNote}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClearSearchAndFilters={() => {
                      setSearchQuery('')
                      const resetFilters: FilterState = {
                        dateRange: { startDate: '', endDate: '' },
                        selectedTags: [],
                        isPinned: null
                      }
                      setFilters(resetFilters)
                    }} 
            />
          </div>
        </main>
      )}
    </div>
  )
}

export default Desktop

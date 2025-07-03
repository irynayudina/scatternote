import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import CreateNoteModal from "./CreateNoteModal"
import CreateDesktopModal from "./CreateDesktopModal"
import CreateRoadmapModal from "./CreateRoadmapModal"
import NoteViewer from "./NoteViewer"
import RoadmapViewer from "./RoadmapViewer"
import FilterModal from "./FilterModal"
import DesktopCarouselItem from "./DesktopCarouselItem"
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

  // Carousel state
  const carouselRef = useRef<HTMLDivElement>(null)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

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

  // Carousel logic
  const getRearrangedDesktops = useCallback(() => {
    if (desktops.length === 0) return []
    
    const activeIndex = desktops.findIndex(d => d.id === activeDesktopId)
    if (activeIndex === -1) return desktops
    
    const middleIndex = Math.floor(desktops.length / 2)
    const shift = middleIndex - activeIndex
    
    const rearranged = [...desktops]
    if (shift > 0) {
      // Move active element forward
      for (let i = 0; i < shift; i++) {
        const last = rearranged.pop()!
        rearranged.unshift(last)
      }
    } else if (shift < 0) {
      // Move active element backward
      for (let i = 0; i < Math.abs(shift); i++) {
        const first = rearranged.shift()!
        rearranged.push(first)
      }
    }
    
    return rearranged
  }, [desktops, activeDesktopId])

  const goToNextDesktop = useCallback(() => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId)
    const nextIndex = (currentIndex + 1) % desktops.length
    const nextDesktop = desktops[nextIndex]
    if (nextDesktop) {
      handleDesktopChange(nextDesktop.id)
    }
  }, [desktops, activeDesktopId, handleDesktopChange])

  const goToPreviousDesktop = useCallback(() => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId)
    const prevIndex = currentIndex === 0 ? desktops.length - 1 : currentIndex - 1
    const prevDesktop = desktops[prevIndex]
    if (prevDesktop) {
      handleDesktopChange(prevDesktop.id)
    }
  }, [desktops, activeDesktopId, handleDesktopChange])

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
    setIsSwiping(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return

    const touchCurrentX = e.touches[0].clientX
    const touchCurrentY = e.touches[0].clientY
    
    const deltaX = touchStartX - touchCurrentX
    const deltaY = touchStartY - touchCurrentY
    
    // Determine if this is a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsSwiping(true)
      e.preventDefault() // Prevent default scrolling during horizontal swipe
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY || !isSwiping) return

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchStartX - touchEndX
    const minSwipeDistance = 50 // Minimum distance for a swipe

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left - go to next
        goToNextDesktop()
      } else {
        // Swiped right - go to previous
        goToPreviousDesktop()
      }
    }

    // Reset touch state
    setTouchStartX(0)
    setTouchStartY(0)
    setIsSwiping(false)
  }

  // Set up wheel event listener for carousel
  useEffect(() => {
    const carouselElement = carouselRef.current
    if (!carouselElement) return

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const threshold = 50
      if (Math.abs(e.deltaX) > threshold || Math.abs(e.deltaY) > threshold) {
        if (e.deltaX > 0 || e.deltaY > 0) {
          goToNextDesktop()
        } else {
          goToPreviousDesktop()
        }
      }
    }

    // Use passive: false to ensure preventDefault works
    carouselElement.addEventListener('wheel', wheelHandler, { passive: false })
    
    return () => {
      carouselElement.removeEventListener('wheel', wheelHandler)
    }
  }, [goToNextDesktop, goToPreviousDesktop])

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
        <div className="bg-white/60 backdrop-blur-sm border-b border-pink-200 pt-4 pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              ref={carouselRef}
              className="relative overflow-visible"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                height: '120px',
                zIndex: 10,
                overscrollBehavior: 'none',
                touchAction: 'pan-y pinch-zoom'
              }}
            >
              <div 
                className="flex justify-center items-center space-x-8 py-4 transition-all duration-300 ease-out"
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              >
                {getRearrangedDesktops().map((desktopItem) => (
                  <DesktopCarouselItem
                    key={desktopItem.id}
                    desktop={desktopItem}
                    isActive={desktopItem.id === activeDesktopId}
                    isDragModeEnabled={isDragModeEnabled}
                    isDragOver={dragOverDesktop === desktopItem.id}
                    onClick={() => handleDesktopChange(desktopItem.id)}
                    onDragOver={(e) => handleDragOver(e, desktopItem.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, desktopItem.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
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

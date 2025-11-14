import { useEffect, useRef, useCallback, useState } from "react"
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
import type { Note, Roadmap } from "@/services/api"
import { 
  useUserStore, 
  useDesktopStore, 
  useNotesStore, 
  useRoadmapsStore, 
  useUIStore 
} from "@/stores"

const Desktop = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  // User store
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)
  
  // Desktop store
  const desktops = useDesktopStore((state) => state.desktops)
  const desktop = useDesktopStore((state) => state.currentDesktop)
  const desktopLoading = useDesktopStore((state) => state.isLoading)
  const desktopError = useDesktopStore((state) => state.error)
  const fetchDesktops = useDesktopStore((state) => state.fetchDesktops)
  const fetchDesktop = useDesktopStore((state) => state.fetchDesktop)
  const refreshDesktops = useDesktopStore((state) => state.refreshDesktops)
  
  // Notes store
  const notes = useNotesStore((state) => state.notes)
  const selectedNote = useNotesStore((state) => state.currentNote)
  const notesLoading = useNotesStore((state) => state.isLoading)
  const notesError = useNotesStore((state) => state.error)
  const filters = useNotesStore((state) => state.filters)
  const searchQuery = useNotesStore((state) => state.searchQuery)
  const fetchNotes = useNotesStore((state) => state.fetchNotes)
  const setCurrentNote = useNotesStore((state) => state.setCurrentNote)
  const setFilters = useNotesStore((state) => state.setFilters)
  const setSearchQuery = useNotesStore((state) => state.setSearchQuery)
  const refreshNotes = useNotesStore((state) => state.refreshNotes)
  const clearFilters = useNotesStore((state) => state.clearFilters)
  const setCurrentDesktopId = useNotesStore((state) => state.setCurrentDesktopId)
  
  // Roadmaps store
  const roadmaps = useRoadmapsStore((state) => state.roadmaps)
  const selectedRoadmap = useRoadmapsStore((state) => state.currentRoadmap)
  const roadmapsLoading = useRoadmapsStore((state) => state.isLoading)
  const roadmapsError = useRoadmapsStore((state) => state.error)
  const fetchRoadmaps = useRoadmapsStore((state) => state.fetchRoadmaps)
  const setCurrentRoadmap = useRoadmapsStore((state) => state.setCurrentRoadmap)
  const refreshRoadmaps = useRoadmapsStore((state) => state.refreshRoadmaps)
  
  // UI store
  const viewMode = useUIStore((state) => state.viewMode)
  const activeDesktopId = useUIStore((state) => state.activeDesktopId)
  const isCreateNoteModalOpen = useUIStore((state) => state.isCreateNoteModalOpen)
  const isCreateDesktopModalOpen = useUIStore((state) => state.isCreateDesktopModalOpen)
  const isCreateRoadmapModalOpen = useUIStore((state) => state.isCreateRoadmapModalOpen)
  const isFilterModalOpen = useUIStore((state) => state.isFilterModalOpen)
  const isNoteViewerOpen = useUIStore((state) => state.isNoteViewerOpen)
  const isRoadmapViewerOpen = useUIStore((state) => state.isRoadmapViewerOpen)
  const draggedItem = useUIStore((state) => state.draggedItem)
  const isDragging = useUIStore((state) => state.isDragging)
  const dragOverDesktop = useUIStore((state) => state.dragOverDesktop)
  const isDragModeEnabled = useUIStore((state) => state.isDragModeEnabled)
  const isCarouselVisible = useUIStore((state) => state.isCarouselVisible)
  const setViewMode = useUIStore((state) => state.setViewMode)
  const setActiveDesktopId = useUIStore((state) => state.setActiveDesktopId)
  const setCreateNoteModalOpen = useUIStore((state) => state.setCreateNoteModalOpen)
  const setCreateDesktopModalOpen = useUIStore((state) => state.setCreateDesktopModalOpen)
  const setCreateRoadmapModalOpen = useUIStore((state) => state.setCreateRoadmapModalOpen)
  const setFilterModalOpen = useUIStore((state) => state.setFilterModalOpen)
  const setNoteViewerOpen = useUIStore((state) => state.setNoteViewerOpen)
  const setRoadmapViewerOpen = useUIStore((state) => state.setRoadmapViewerOpen)
  const setDraggedItem = useUIStore((state) => state.setDraggedItem)
  const setIsDragging = useUIStore((state) => state.setIsDragging)
  const setDragOverDesktop = useUIStore((state) => state.setDragOverDesktop)
  const setIsDragModeEnabled = useUIStore((state) => state.setIsDragModeEnabled)
  const setCarouselVisible = useUIStore((state) => state.setCarouselVisible)
  const setMouseOverCarousel = useUIStore((state) => state.setMouseOverCarousel)
  
  // Local state for touch/swipe
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  
  // Combined error state
  const error = desktopError || notesError || roadmapsError
  const isLoading = desktopLoading || notesLoading || roadmapsLoading
  
  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null)
  const hideCarouselTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced function to hide carousel
  const debouncedHideCarousel = useCallback(() => {
    // Clear any existing timeout
    if (hideCarouselTimeoutRef.current) {
      clearTimeout(hideCarouselTimeoutRef.current)
    }
    
    // Set new timeout to hide carousel after 500ms
    hideCarouselTimeoutRef.current = setTimeout(() => {
      if (!useUIStore.getState().isMouseOverCarousel) {
        setCarouselVisible(false)
      }
    }, 500)
  }, [setCarouselVisible])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideCarouselTimeoutRef.current) {
        clearTimeout(hideCarouselTimeoutRef.current)
      }
    }
  }, [])

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
      
      const desktopId = parseInt(id || '1')
      setActiveDesktopId(desktopId)
      
      // Load data using stores
      Promise.all([
        fetchDesktops(parsedUser.id),
        fetchDesktop(desktopId, parsedUser.id),
        fetchNotes(parsedUser.id, desktopId),
        fetchRoadmaps(parsedUser.id, desktopId),
      ]).then(() => {
        setCurrentDesktopId(desktopId)
      }).catch((error) => {
        console.error('Error loading data:', error)
        navigate('/')
      })
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/')
    }
  }, [navigate, id, setUser, fetchDesktops, fetchDesktop, fetchNotes, fetchRoadmaps, setActiveDesktopId, setCurrentDesktopId])



  // Load data handlers - now using stores

  const handleCreateNote = () => {
    setCreateNoteModalOpen(true)
  }

  const handleNoteCreated = async () => {
    // Refresh notes after creation - store handles cache invalidation
    if (user) {
      await refreshNotes(user.id, parseInt(id || '1'))
    }
  }

  const handleNoteClick = (note: Note) => {
    setCurrentNote(note)
    setNoteViewerOpen(true)
  }

  const handleNoteUpdated = async () => {
    // Refresh notes after update - store handles cache invalidation
    if (user) {
      await refreshNotes(user.id, parseInt(id || '1'))
    }
  }

  const handleNoteDeleted = async () => {
    // Refresh notes after deletion - store handles cache invalidation
    if (user) {
      await refreshNotes(user.id, parseInt(id || '1'))
    }
  }

  const handleDesktopChange = async (desktopId: number) => {
    if (!user) return
    
    setActiveDesktopId(desktopId)
    // Reset filters when switching desktops
    clearFilters()
    setSearchQuery('')
    setCurrentDesktopId(desktopId)
    
    // Load new desktop data
    await Promise.all([
      fetchDesktop(desktopId, user.id),
      fetchNotes(user.id, desktopId),
      fetchRoadmaps(user.id, desktopId),
    ])
    
    navigate(`/desktop/${desktopId}`)
  }



  // Handle search - store handles filtering automatically
  useEffect(() => {
    if (!user) return
    
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        // Search is handled by the store - it will apply filters automatically
        apiService.searchNotes(user.id, searchQuery).then((searchResults) => {
          // Store handles the filtering, but we need to update allNotes
          useNotesStore.getState().setAllNotes(searchResults)
        }).catch((error) => {
          console.error('Error searching notes:', error)
        })
      } else {
        // If search is empty, refresh notes for current desktop
        refreshNotes(user.id, parseInt(id || '1'))
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, user, id, refreshNotes])

  // Apply filters - store handles this automatically
  const applyFilters = (filterState: FilterState) => {
    setFilters(filterState)
  }

  const filteredNotes = notes // Notes are already filtered by the store

  const handleCreateDesktop = () => {
    setCreateDesktopModalOpen(true)
  }

  const handleDesktopCreated = async () => {
    // Refresh desktops after creation - store handles cache invalidation
    if (user) {
      await refreshDesktops(user.id)
      // If this was the first desktop, navigate to it
      const updatedDesktops = useDesktopStore.getState().desktops
      if (updatedDesktops.length === 1) {
        navigate(`/desktop/${updatedDesktops[0].id}`)
      }
    }
  }

  const handleCreateRoadmap = () => {
    setCreateRoadmapModalOpen(true)
  }

  const handleRoadmapCreated = async () => {
    // Refresh roadmaps after creation - store handles cache invalidation
    if (user) {
      await refreshRoadmaps(user.id, parseInt(id || '1'))
    }
  }

  const handleRoadmapClick = (roadmap: Roadmap) => {
    setCurrentRoadmap(roadmap)
    setRoadmapViewerOpen(true)
  }

  const handleRoadmapUpdated = async () => {
    // Refresh roadmaps after update - store handles cache invalidation
    if (user) {
      await refreshRoadmaps(user.id, parseInt(id || '1'))
    }
  }

  const handleRoadmapDeleted = async () => {
    // Refresh roadmaps after deletion - store handles cache invalidation
    if (user) {
      await refreshRoadmaps(user.id, parseInt(id || '1'))
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
      if (draggedItem.type === 'note') {
        await useNotesStore.getState().transferNote(draggedItem.id, targetDesktopId, user.id)
      } else if (draggedItem.type === 'roadmap') {
        await useRoadmapsStore.getState().transferRoadmap(draggedItem.id, targetDesktopId, user.id)
      }

      // Refresh data after transfer - stores handle cache invalidation
      await Promise.all([
        refreshNotes(user.id, parseInt(id || '1')),
        refreshRoadmaps(user.id, parseInt(id || '1')),
      ])
      
    } catch (error) {
      console.error('Error transferring item:', error)
      // Error is handled by stores
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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={isCreateNoteModalOpen}
        onClose={() => setCreateNoteModalOpen(false)}
        desktopId={parseInt(id || '1')}
        userId={user?.id || 0}
        onNoteCreated={handleNoteCreated}
      />

      {/* Note Viewer Modal */}
      <NoteViewer
        note={selectedNote}
        isOpen={isNoteViewerOpen}
        onClose={() => {
          setNoteViewerOpen(false)
          setCurrentNote(null)
        }}
        onNoteUpdated={handleNoteUpdated}
        onNoteDeleted={handleNoteDeleted}
        userId={user?.id || 0}
      />

      {/* Create Desktop Modal */}
      <CreateDesktopModal
        isOpen={isCreateDesktopModalOpen}
        onClose={() => setCreateDesktopModalOpen(false)}
        userId={user?.id || 0}
        onDesktopCreated={handleDesktopCreated}
      />

      {/* Create Roadmap Modal */}
      <CreateRoadmapModal
        isOpen={isCreateRoadmapModalOpen}
        onClose={() => setCreateRoadmapModalOpen(false)}
        desktopId={parseInt(id || '1')}
        userId={user?.id || 0}
        onRoadmapCreated={handleRoadmapCreated}
      />

      {/* Roadmap Viewer Modal */}
      <RoadmapViewer
        roadmap={selectedRoadmap}
        isOpen={isRoadmapViewerOpen}
        onClose={() => {
          setRoadmapViewerOpen(false)
          setCurrentRoadmap(null)
        }}
        onRoadmapUpdated={handleRoadmapUpdated}
        onRoadmapDeleted={handleRoadmapDeleted}
        userId={user?.id || 0}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={applyFilters}
        currentFilters={filters}
      />

      {/* Header */}
      <header 
        className="bg-white/90 backdrop-blur-md border-b border-pink-200/50 sticky top-0 z-20 flex-shrink-0"
        onMouseEnter={() => {
          // Clear any pending hide timeout
          if (hideCarouselTimeoutRef.current) {
            clearTimeout(hideCarouselTimeoutRef.current)
            hideCarouselTimeoutRef.current = null
          }
          setCarouselVisible(true)
        }}
        onMouseLeave={() => {
          debouncedHideCarousel()
        }}
      >
        <div className="max-w-10xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col min-[450px]:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4">
            {/* Desktop Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex-shrink-0"></div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text truncate">
                  {desktop.name}
                </h1>
              </div>
              {desktop.description && (
                <p className="text-sm text-gray-600 mt-1 truncate max-w-xs sm:max-w-md lg:max-w-lg text-left">
                  {desktop.description}
                </p>
              )}
            </div>

            {/* Carousel Toggle Button - Mobile Only */}
            <div className="flex items-center justify-center flex-1 sm:hidden">
              <button
                onClick={() => setCarouselVisible(!isCarouselVisible)}
                className="p-2 rounded-lg hover:bg-pink-50 transition-colors duration-200"
                title="Toggle Desktop Carousel"
              >
                <svg width="30" height="9" viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg" className="w-8 h-2.5">
                  {/* Line through center */}
                  <line x1="10" y1="15" x2="90" y2="15" stroke="currentColor" strokeWidth="2" className="text-gray-600" />
                  
                  {/* Left circle */}
                  <circle cx="30" cy="15" r="6" fill="currentColor" className="text-gray-600" />

                  {/* Middle (25% bigger) */}
                  <circle cx="50" cy="15" r="7.5" fill="currentColor" className="text-gray-600" />

                  {/* Right circle */}
                  <circle cx="70" cy="15" r="6" fill="currentColor" className="text-gray-600" />
                </svg>
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
              <Button 
                onClick={() => navigate('/knowledge-base')} 
                variant="outline" 
                size="sm"
                className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Knowledge Base</span>
                <span className="sm:hidden">KB</span>
              </Button>
              <Button 
                onClick={() => navigate('/settings')} 
                variant="outline" 
                size="sm"
                className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">⚙️</span>
              </Button>
              <Button 
                onClick={() => navigate('/home-board')} 
                variant="outline" 
                size="sm"
                className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 text-xs sm:text-sm px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Home Board</span>
                <span className="sm:hidden">🏠</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error/Success Message */}
      {error && (
        <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-md mx-3 sm:mx-4 mt-3 text-sm flex-shrink-0 ${
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

      {/* Desktop Carousel - Only show if there are desktops and carousel is visible */}
      {desktops.length > 0 && isCarouselVisible && (
        <div 
          className="relative bg-gradient-to-b from-white/95 via-white/90 to-white/85 backdrop-blur-md border-b border-pink-200/50 shadow-lg shadow-pink-100/30 flex-shrink-0"
          style={{
            animation: 'slideDown 0.4s ease-out',
          }}
          onMouseEnter={() => {
            setMouseOverCarousel(true)
            // Clear any pending hide timeout
            if (hideCarouselTimeoutRef.current) {
              clearTimeout(hideCarouselTimeoutRef.current)
              hideCarouselTimeoutRef.current = null
            }
          }}
          onMouseLeave={() => {
            setMouseOverCarousel(false)
            setCarouselVisible(false)
          }}
        >
          {/* Gradient Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-60" />
          
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(236, 72, 153) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative max-w-10xl mx-auto px-4 sm:px-8 lg:px-12">
            {/* Left Fade Gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white/90 to-transparent z-20 pointer-events-none" />

            {/* Right Fade Gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white/90 to-transparent z-20 pointer-events-none" />

            {/* Carousel Wrapper */}
            <div className="relative mx-auto overflow-hidden py-3 sm:py-4">
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
                  zIndex: 10,
                  overscrollBehavior: 'none',
                  touchAction: 'pan-y pinch-zoom'
                }}
              >
                <div 
                  className="flex justify-center items-center gap-2 sm:gap-3 lg:gap-4 px-2 transition-all duration-700 ease-out"
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
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

            {/* Subtle Bottom Border */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-200/50 to-transparent" />
          </div>
        </div>
      )}

      {/* Main Content - Only show if there are desktops */}
      {desktops.length > 0 && (
        <main className="bg-white/60 flex-1 overflow-y-auto max-w-10xl mx-auto w-full py-4 sm:py-6">
          <div className="px-3 sm:px-4 lg:px-6">
            {/* Toolbar */}
            <DesktopToolbar
              onCreateNote={handleCreateNote}
              onCreateRoadmap={handleCreateRoadmap}
              isDragModeEnabled={isDragModeEnabled}
              onToggleDragMode={() => setIsDragModeEnabled(!isDragModeEnabled)}
              searchQuery={searchQuery}
              onSearchChange={(query) => setSearchQuery(query)}
              filters={filters}
              onOpenFilterModal={() => setFilterModalOpen(true)}
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
                clearFilters()
              }} 
            />
          </div>
        </main>
      )}
    </div>
  )
}

export default Desktop

import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, Grid, List } from "lucide-react"
import CreateNoteModal from "./CreateNoteModal"
import NoteViewer from "./NoteViewer"
import { apiService } from "@/services/api"
import type { Note, Desktop as DesktopType } from "@/services/api"

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
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

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

  // Rearrange desktops to keep active one in the middle
  const getRearrangedDesktops = () => {
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
  }

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
      setNotes(notesData)
    } catch (error) {
      console.error('Error loading desktop data:', error)
      setError('Failed to load desktop data')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    navigate('/')
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
    navigate(`/desktop/${desktopId}`)
  }

  // Navigate to next desktop
  const goToNextDesktop = () => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId)
    const nextIndex = (currentIndex + 1) % desktops.length
    const nextDesktop = desktops[nextIndex]
    if (nextDesktop) {
      handleDesktopChange(nextDesktop.id)
    }
  }

  // Navigate to previous desktop
  const goToPreviousDesktop = () => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId)
    const prevIndex = currentIndex === 0 ? desktops.length - 1 : currentIndex - 1
    const prevDesktop = desktops[prevIndex]
    if (prevDesktop) {
      handleDesktopChange(prevDesktop.id)
    }
  }

  // Handle scroll wheel events
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    // Add a small delay to prevent rapid scrolling
    const threshold = 50 // Minimum scroll delta to trigger change
    
    if (Math.abs(e.deltaX) > threshold || Math.abs(e.deltaY) > threshold) {
      if (e.deltaX > 0 || e.deltaY > 0) {
        goToNextDesktop()
      } else {
        goToPreviousDesktop()
      }
    }
  }

  // Touch swipe handlers
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

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

  // Handle search with API
  const handleSearch = async (query: string) => {
    if (!user) return
    
    try {
      setError(null)
      if (query.trim()) {
        const searchResults = await apiService.searchNotes(user.id, query)
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

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, user])

  const filteredNotes = notes // Notes are already filtered by the API

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

  const rearrangedDesktops = getRearrangedDesktops();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
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

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 pt-8 z-10 border-b border-pink-200">
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
              <Button onClick={() => navigate('/home-board')} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                Go to Home Board
              </Button>
              <Button onClick={handleLogout} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mx-4 mt-4">
          {error}
        </div>
      )}

      {/* Desktop Carousel */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-pink-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            ref={carouselRef}
            className="relative overflow-visible"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              height: '120px',
              zIndex: 10
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
              {rearrangedDesktops.map((desktopItem) => {
                const isActive = desktopItem.id === activeDesktopId
                
                // Determine scale and styling based on state
                let scale = 1
                let bgColor = 'bg-gray-100 border-gray-300 text-gray-600'
                let textColor = 'text-gray-500'
                
                if (isActive) {
                  scale = 1.25
                  bgColor = 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-600 text-white'
                  textColor = 'text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text'
                }
                
                return (
                  <div
                    key={desktopItem.id}
                    className={`flex flex-col items-center transition-all duration-300 cursor-pointer ${
                      isActive ? 'scale-125' : 'scale-100 opacity-60 hover:opacity-80'
                    }`}
                    onClick={() => handleDesktopChange(desktopItem.id)}
                    style={{
                      transform: `scale(${scale})`,
                      opacity: isActive ? 1 : 0.6,
                      transition: 'all 0.3s ease-out',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      WebkitTouchCallout: 'none'
                    }}
                  >
                    <div
                      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${bgColor}`}
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                    >
                      <span 
                        className="text-sm font-semibold"
                        style={{
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none',
                          msUserSelect: 'none'
                        }}
                      >
                        {desktopItem.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span 
                      className={`text-xs mt-2 font-medium transition-all duration-300 ${textColor}`}
                      style={{
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                      }}
                    >
                      {desktopItem.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <Button onClick={handleCreateNote} className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0">
                <Plus className="h-4 w-4" />
                <span>Create Note</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-pink-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              {/* Filter */}
              <Button variant="outline" size="sm" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              {/* View Mode Toggle */}
              <div className="flex border border-pink-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-r-none ${viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0' : 'text-pink-600 hover:bg-pink-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-l-none ${viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0' : 'text-pink-600 hover:bg-pink-50'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notes Grid/List */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {searchQuery ? 'No notes found matching your search' : 'No notes found'}
              </div>
              {!searchQuery && (
                <Button onClick={handleCreateNote} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
                  Create your first note
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/80 backdrop-blur-sm border-pink-200 hover:border-pink-300 ${
                    note.isPinned ? 'ring-2 ring-pink-500' : ''
                  }`}
                  onClick={() => handleNoteClick(note)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold line-clamp-2 text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                        {note.title}
                      </CardTitle>
                      {note.isPinned && (
                        <div className="text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-xs font-medium">PINNED</div>
                      )}
                    </div>
                    <CardDescription className="text-sm text-gray-500">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 line-clamp-3 mb-3">
                      {note.content}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tagItem, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs px-2 py-1 rounded-full border border-pink-200"
                          >
                            {tagItem.tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Desktop

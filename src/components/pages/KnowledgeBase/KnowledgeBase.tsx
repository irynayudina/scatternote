import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Search, Monitor, Tag as TagIcon, LayoutGrid, List, ArrowUpDown, X, RotateCcw } from "lucide-react"
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '@/components/LogoutButton'
import { apiService } from '@/services/api'
import type { User, Note, Desktop } from '@/services/api'

interface Tag {
  id: number;
  name: string;
  color?: string;
}

interface NoteWithDesktop extends Note {
  desktop: {
    id: number;
    name: string;
  };
}

const KnowledgeBase = () => {
  const navigate = useNavigate()
  const { user: auth0User, isAuthenticated, isLoading: auth0Loading } = useAuth0()
  const [user, setUser] = useState<User | null>(null)
  const [notes, setNotes] = useState<NoteWithDesktop[]>([])
  const [desktops, setDesktops] = useState<Desktop[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDesktop, setSelectedDesktop] = useState<number | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'desktop'>('date')

  useEffect(() => {
    if (auth0Loading) return;

    if (!isAuthenticated || !auth0User) {
      navigate('/')
      return
    }

    // Get user data from session storage
    const userData = sessionStorage.getItem('user')
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        loadData(parsedUser.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        navigate('/home-board')
      }
    } else {
      navigate('/home-board')
    }
    
    setIsLoading(false)
  }, [auth0User, isAuthenticated, auth0Loading, navigate])

  const loadData = async (userId: number) => {
    try {
      // Load all notes across all desktops
      const allNotes = await apiService.getNotes(userId)
      const desktopsData = await apiService.getDesktops(userId)
      
      // Enrich notes with desktop information
      const notesWithDesktop: NoteWithDesktop[] = allNotes.map(note => ({
        ...note,
        desktop: desktopsData.find(desktop => desktop.id === note.desktopId) || {
          id: note.desktopId,
          name: 'Unknown Desktop'
        }
      }))
      
      setNotes(notesWithDesktop)
      setDesktops(desktopsData)
      
      // Extract unique tags from notes
      const uniqueTags = new Map<number, Tag>()
      allNotes.forEach(note => {
        note.tags?.forEach(tagRef => {
          if (!uniqueTags.has(tagRef.tag.id)) {
            uniqueTags.set(tagRef.tag.id, tagRef.tag)
          }
        })
      })
      setTags(Array.from(uniqueTags.values()))
    } catch (error) {
      console.error('Error loading knowledge base data:', error)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === "" || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDesktop = selectedDesktop === null || note.desktopId === selectedDesktop
    
    const matchesTag = selectedTag === null || 
      note.tags?.some(tagRef => tagRef.tag.name === selectedTag)
    
    return matchesSearch && matchesDesktop && matchesTag
  })

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'desktop':
        return a.desktop.name.localeCompare(b.desktop.name)
      case 'date':
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    }
  })

  const handleNoteClick = (note: NoteWithDesktop) => {
    navigate(`/desktop/${note.desktopId}?noteId=${note.id}`)
  }

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return
    
    try {
      const searchResults = await apiService.searchNotes(user.id, searchQuery)
      const notesWithDesktop: NoteWithDesktop[] = searchResults.map(note => ({
        ...note,
        desktop: desktops.find(desktop => desktop.id === note.desktopId) || {
          id: note.desktopId,
          name: 'Unknown Desktop'
        }
      }))
      setNotes(notesWithDesktop)
    } catch (error) {
      console.error('Error searching notes:', error)
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDesktop(null)
    setSelectedTag(null)
    if (user) {
      loadData(user.id)
    }
  }

  if (auth0Loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600 font-medium">Loading Knowledge Base...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-pink-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {user.picture && (
                <img 
                  src={user.picture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-pink-200"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">Knowledge Base</h1>
                <p className="text-gray-600">Discover and organize all your notes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/home-board')}
                className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                variant="outline"
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/settings')}
                className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                variant="outline"
              >
                Settings
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-pink-200 shadow-sm p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-6">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Search className="h-4 w-4 text-pink-500" />
              Search Notes
            </Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search notes by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 border-pink-300 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-sm"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* Desktop Filter */}
            <div className="space-y-2">
              <Label htmlFor="desktop-filter" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Monitor className="h-4 w-4 text-pink-500" />
                Desktop
              </Label>
              <div className="relative">
                <select
                  id="desktop-filter"
                  value={selectedDesktop || ""}
                  onChange={(e) => setSelectedDesktop(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 pl-10 pr-8 border border-pink-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none cursor-pointer transition-all hover:border-pink-400"
                >
                  <option value="">All Desktops</option>
                  {desktops.map(desktop => (
                    <option key={desktop.id} value={desktop.id}>
                      {desktop.name}
                    </option>
                  ))}
                </select>
                <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <Label htmlFor="tag-filter" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-pink-500" />
                Tag
              </Label>
              <div className="relative">
                <select
                  id="tag-filter"
                  value={selectedTag || ""}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="w-full px-3 py-2 pl-10 pr-8 border border-pink-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none cursor-pointer transition-all hover:border-pink-400"
                >
                  <option value="">All Tags</option>
                  {tags.map(tag => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <Label htmlFor="sort-filter" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-pink-500" />
                Sort By
              </Label>
              <div className="relative">
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'desktop')}
                  className="w-full px-3 py-2 pl-10 pr-8 border border-pink-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none cursor-pointer transition-all hover:border-pink-400"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="desktop">Desktop</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-pink-200">
            <div className="flex flex-wrap items-center gap-2">
              {(selectedDesktop || selectedTag || searchQuery) && (
                <>
                  <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                  {searchQuery && (
                    <div className="flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                      <span>Search: "{searchQuery}"</span>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ml-1 hover:text-pink-900 transition-colors"
                        aria-label="Remove search filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {selectedDesktop && (
                    <div className="flex items-center gap-1 bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                      <Monitor className="h-3 w-3" />
                      <span>{desktops.find(d => d.id === selectedDesktop)?.name}</span>
                      <button
                        onClick={() => setSelectedDesktop(null)}
                        className="ml-1 hover:text-pink-900 transition-colors"
                        aria-label="Remove desktop filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {selectedTag && (
                    <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      <TagIcon className="h-3 w-3" />
                      <span>{selectedTag}</span>
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="ml-1 hover:text-purple-900 transition-colors"
                        aria-label="Remove tag filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">View:</span>
              <div className="flex items-center border border-pink-300 rounded-md overflow-hidden">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className={`px-3 py-1.5 rounded-none border-0 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-pink-50'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <div className="w-px bg-pink-300"></div>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className={`px-3 py-1.5 rounded-none border-0 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-pink-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 w-fit mx-auto bg-pink-100 p-2 rounded-md">
            Found {sortedNotes.length} note{sortedNotes.length !== 1 ? 's' : ''} 
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedDesktop && ` in ${desktops.find(d => d.id === selectedDesktop)?.name}`}
            {selectedTag && ` tagged with "${selectedTag}"`}
          </p>
        </div>

        {/* Notes Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNotes.map(note => (
              <Card 
                key={note.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 cursor-pointer border-pink-200"
                onClick={() => handleNoteClick(note)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {note.title}
                    </CardTitle>
                    {note.isPinned && (
                      <span className="text-pink-500 text-sm">📌</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs">
                      {note.desktop.name}
                    </span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3 mb-3">
                    {note.content}
                  </p>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tagRef => (
                        <span 
                          key={tagRef.tag.id}
                          className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                        >
                          #{tagRef.tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map(note => (
              <Card 
                key={note.id} 
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200 cursor-pointer border-pink-200"
                onClick={() => handleNoteClick(note)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {note.title}
                        </h3>
                        {note.isPinned && (
                          <span className="text-pink-500">📌</span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {note.content}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                          {note.desktop.name}
                        </span>
                        <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-4">
                        {note.tags.map(tagRef => (
                          <span 
                            key={tagRef.tag.id}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                          >
                            #{tagRef.tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {sortedNotes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 w-fit mx-auto bg-pink-100 p-2 rounded-md">No notes found</h3>
            <p className="text-gray-600 mb-6 w-fit mx-auto bg-pink-100 p-2 rounded-md">
              {searchQuery || selectedDesktop || selectedTag 
                ? "Try adjusting your search criteria or filters."
                : "Create your first note to get started with your knowledge base."
              }
            </p>
            <Button 
              onClick={() => navigate('/home-board')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
            >
              Create Your First Note
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default KnowledgeBase 
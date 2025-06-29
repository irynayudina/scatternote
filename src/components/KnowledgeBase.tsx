import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton'
import { apiService } from '../services/api'
import type { User, Note, Desktop } from '../services/api'

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-pink-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search notes by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Desktop Filter */}
            <div>
              <select
                value={selectedDesktop || ""}
                onChange={(e) => setSelectedDesktop(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Desktops</option>
                {desktops.map(desktop => (
                  <option key={desktop.id} value={desktop.id}>
                    {desktop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <select
                value={selectedTag || ""}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* View Controls */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={clearFilters}
                className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'desktop')}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'border-pink-300 text-pink-600 hover:bg-pink-50'}`}
                variant={viewMode === 'grid' ? 'default' : 'outline'}
              >
                Grid
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'border-pink-300 text-pink-600 hover:bg-pink-50'}`}
                variant={viewMode === 'list' ? 'default' : 'outline'}
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-6">
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
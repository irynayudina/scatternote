import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Filter, Grid, List } from "lucide-react"

interface UserData {
  id: number
  username: string
  email: string
  token: string
  role: string
  createdAt: string
}

interface Note {
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
  desktopId: number
  tags?: string[]
  isPinned?: boolean
}

interface Desktop {
  id: number
  name: string
  description?: string
  userId: number
  createdAt: string
}

const Desktop = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserData | null>(null)
  const [desktop, setDesktop] = useState<Desktop | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

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
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }, [navigate, id])

  const loadDesktopData = async (userId: number, desktopId: number) => {
    try {
      // Mock desktop data - replace with actual API call
      const mockDesktop: Desktop = {
        id: desktopId,
        name: `Desktop ${desktopId}`,
        description: `This is desktop ${desktopId} for organizing your notes`,
        userId: userId,
        createdAt: new Date().toISOString()
      }
      setDesktop(mockDesktop)

      // Mock notes data - replace with actual API call
      const mockNotes: Note[] = [
        {
          id: 1,
          title: "Welcome Note",
          content: "Welcome to your new desktop! This is where you can organize your notes.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          desktopId: desktopId,
          tags: ["welcome", "getting-started"],
          isPinned: true
        },
        {
          id: 2,
          title: "Project Ideas",
          content: "A collection of project ideas and brainstorming notes.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          desktopId: desktopId,
          tags: ["projects", "ideas"]
        },
        {
          id: 3,
          title: "Meeting Notes",
          content: "Notes from today's team meeting about upcoming features.",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          desktopId: desktopId,
          tags: ["meeting", "team"]
        },
        {
          id: 4,
          title: "Shopping List",
          content: "Groceries and items to buy for the week.",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
          desktopId: desktopId,
          tags: ["shopping", "personal"]
        }
      ]
      setNotes(mockNotes)
    } catch (error) {
      console.error('Error loading desktop data:', error)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    navigate('/')
  }

  const handleCreateNote = () => {
    // Navigate to note creation page or open modal
    console.log('Create new note')
  }

  const handleViewAllNotes = () => {
    // Navigate to the first desktop
    navigate('/desktop/1')
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{desktop.name}</h1>
              <p className="text-gray-600">{desktop.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleViewAllNotes} variant="outline">
                View All Notes
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <Button onClick={handleCreateNote} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Note</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filter */}
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notes Grid/List */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No notes found</div>
              <Button onClick={handleCreateNote} variant="outline">
                Create your first note
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    note.isPinned ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {note.title}
                      </CardTitle>
                      {note.isPinned && (
                        <div className="text-blue-500 text-xs font-medium">PINNED</div>
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
                        {note.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
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

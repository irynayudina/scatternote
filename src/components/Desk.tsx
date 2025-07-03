import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth0 } from '@auth0/auth0-react';
import CreateDesktopModal from './CreateDesktopModal'
import CreateNoteModalWithDesktop from './CreateNoteModalWithDesktop'
import EditDesktopsModal from './EditDesktopsModal'
import LogoutButton from './LogoutButton'
import { apiService } from '../services/api'
import type { Desktop, User } from '../services/api'

const HomeBoard = () => {
  const navigate = useNavigate()
  const { user: auth0User, isAuthenticated, isLoading: auth0Loading } = useAuth0()
  const [user, setUser] = useState<User | null>(null)
  const [desktops, setDesktops] = useState<Desktop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false)
  const [isEditDesktopsModalOpen, setIsEditDesktopsModalOpen] = useState(false)

  useEffect(() => {
    if (auth0Loading) return;

    if (!isAuthenticated || !auth0User) {
      navigate('/')
      return
    }

    // Check if user data is in session storage
    const userData = sessionStorage.getItem('user')
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        loadDesktops(parsedUser.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        // If session data is corrupted, try to get user from backend
        fetchUserFromBackend()
      }
    } else {
      // No session data, try to get user from backend
      fetchUserFromBackend()
    }
    
    setIsLoading(false)
  }, [auth0User, isAuthenticated, auth0Loading, navigate])

  const fetchUserFromBackend = async () => {
    if (!auth0User) return;
    
    try {
      const userData = await apiService.createUser({
        sub: auth0User.sub!,
        email: auth0User.email!,
        email_verified: auth0User.email_verified!,
        name: auth0User.name!,
        nickname: auth0User.nickname!,
        picture: auth0User.picture!,
        updated_at: auth0User.updated_at!
      });
      
      sessionStorage.setItem('user', JSON.stringify(userData));
      if (auth0User.sub) {
        sessionStorage.setItem('token', auth0User.sub);
      }
      setUser(userData);
      loadDesktops(userData.id)
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  const loadDesktops = async (userId: number) => {
    try {
      const desktopsData = await apiService.getDesktops(userId)
      setDesktops(desktopsData)
    } catch (error) {
      console.error('Error loading desktops:', error)
    }
  }

  const handleCreateDesktop = () => {
    setIsCreateModalOpen(true)
  }

  const handleDesktopCreated = async () => {
    // Refresh desktop data after creation
    if (user) {
      await loadDesktops(user.id)
    }
    console.log('Desktop created successfully')
  }

  const handleCreateNote = () => {
    setIsCreateNoteModalOpen(true)
  }

  const handleNoteCreated = async () => {
    // Refresh desktop data after note creation
    if (user) {
      await loadDesktops(user.id)
    }
    console.log('Note created successfully')
  }

  const handleEditDesktops = () => {
    setIsEditDesktopsModalOpen(true)
  }

  const handleDesktopsUpdated = async () => {
    // Refresh desktop data after editing
    if (user) {
      await loadDesktops(user.id)
    }
    console.log('Desktops updated successfully')
  }

  if (auth0Loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-purple-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Create Desktop Modal */}
      <CreateDesktopModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user?.id || 0}
        onDesktopCreated={handleDesktopCreated}
      />

      {/* Create Note Modal */}
      <CreateNoteModalWithDesktop
        isOpen={isCreateNoteModalOpen}
        onClose={() => setIsCreateNoteModalOpen(false)}
        userId={user?.id || 0}
        desktops={desktops}
        onNoteCreated={handleNoteCreated}
      />

      {/* Edit Desktops Modal */}
      <EditDesktopsModal
        isOpen={isEditDesktopsModalOpen}
        onClose={() => setIsEditDesktopsModalOpen(false)}
        desktops={desktops}
        onDesktopsUpdated={handleDesktopsUpdated}
      />

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
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.username}!</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-pink-200 hover:shadow-xl transition-all duration-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-4">
                  User Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="text-sm text-gray-900">{user.username}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="text-sm text-gray-900 capitalize">{user.role}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-pink-200 hover:shadow-xl transition-all duration-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {desktops.length === 0 ? (
                    <>
                      <Button 
                        onClick={handleCreateDesktop}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                      >
                        Create Your First Desktop
                      </Button>
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 mb-2">No desktops yet</p>
                        <p className="text-xs text-gray-400">Create a desktop to start organizing your notes</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={handleCreateNote}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                      >
                        Create New Note
                      </Button>
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400" 
                          variant="outline" 
                          onClick={() => navigate(`/desktop/${desktops[0].id}`)}
                        >
                          Go to Desk
                        </Button>
                        <Button 
                          className="w-12 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400" 
                          variant="outline"
                          onClick={handleEditDesktops}
                          title="Edit Desktops"
                        >
                          ✏️
                        </Button>
                        <Button 
                          className="w-12 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400" 
                          variant="outline"
                          onClick={handleCreateDesktop}
                        >
                          +
                        </Button>
                      </div>
                    </>
                  )}
                  <Button className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400" variant="outline" onClick={() => navigate('/knowledge-base')}>
                    Knowledge Base
                  </Button>
                  <Button className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400" variant="outline" onClick={() => navigate('/settings')}>
                    Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-pink-200 hover:shadow-xl transition-all duration-200">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-4">
                  Statistics
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Desktops</dt>
                    <dd className="text-2xl font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">{desktops.length}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Notes</dt>
                    <dd className="text-2xl font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Storage Used</dt>
                    <dd className="text-2xl font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">0 MB</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-pink-200 hover:shadow-xl transition-all duration-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-2">
                {desktops.length === 0 ? 'Welcome to ScatterNote!' : 'Welcome back to ScatterNote!'}
              </h3>
              <p className="text-gray-600">
                {desktops.length === 0 
                  ? "This is your personal workspace where you can create, organize, and manage your notes. Get started by creating your first desktop to organize your notes into different workspaces."
                  : "This is your personal workspace where you can create, organize, and manage your notes. You have " + desktops.length + " desktop(s) ready for your notes."
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomeBoard 
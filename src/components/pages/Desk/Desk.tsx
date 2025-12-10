import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import CreateDesktopModal from '@/components/pages/Desk/CreateDesktopModal'
import CreateNoteModalWithDesktop from '@/components/CreateNoteModalWithDesktop'
import EditDesktopsModal from '@/components/EditDesktopsModal'
import LogoutButton from '@/components/LogoutButton'
import { useAuth } from '@/hooks/useAuth'
import { 
  useUserStore,
  useDesktopStore, 
  useUIStore 
} from '@/stores'
import { apiService } from '@/services/api'
import type { Utility } from '@/services/api'

const HomeBoard = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, isLoading: authLoading, syncUserProfile } = useAuth()

  // Utilities state
  const [utilities, setUtilities] = useState<Utility[]>([])
  const [utilitiesLoading, setUtilitiesLoading] = useState(false)
  const [utilitiesError, setUtilitiesError] = useState<string | null>(null)

  // Track any object URLs we create so we can revoke them on cleanup
  const [createdObjectUrls, setCreatedObjectUrls] = useState<string[]>([])

  // Helper: resolve possible URL/string/blob/typed-array into a browser-usable URL
  const resolveImageSource = useCallback((value: unknown): string | null => {
    if (!value) return null

    // If it's already a string URL or data URL, keep as-is
    if (typeof value === 'string') {
      const str = value.trim()
      if (str.length === 0) return null
      if (
        str.startsWith('http://') ||
        str.startsWith('https://') ||
        str.startsWith('/') ||
        str.startsWith('data:')
      ) {
        return str
      }
      // Non-URL strings fallback to rendering as emoji/char later
      return str
    }

    // If it's a Blob (or File), create an object URL
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      const url = URL.createObjectURL(value)
      setCreatedObjectUrls(prev => [...prev, url])
      return url
    }

    // If it's an ArrayBuffer
    if (value instanceof ArrayBuffer) {
      const blob = new Blob([value])
      const url = URL.createObjectURL(blob)
      setCreatedObjectUrls(prev => [...prev, url])
      return url
    }

    // If it's a typed array (e.g., Uint8Array)
    if (
      typeof value === 'object' &&
      value !== null &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (value as any).buffer instanceof ArrayBuffer
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const view = value as any
      const blob = new Blob([view])
      const url = URL.createObjectURL(blob)
      setCreatedObjectUrls(prev => [...prev, url])
      return url
    }

    // If it's an object like { data: <Uint8Array|ArrayBuffer|string>, contentType?: string }
    if (typeof value === 'object' && value !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybe = value as any
      if (maybe.data) {
        const contentType: string | undefined = typeof maybe.contentType === 'string' ? maybe.contentType : undefined
        // If data is already a string URL or data URL
        if (typeof maybe.data === 'string') {
          const str = maybe.data.trim()
          if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('data:')) {
            return str
          }
          // If it's base64 without data: prefix, attempt to wrap it
          try {
            // crude base64 detection; if it fails, fall back to text rendering
            const binary = atob(str)
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
            const blob = new Blob([bytes], { type: contentType })
            const url = URL.createObjectURL(blob)
            setCreatedObjectUrls(prev => [...prev, url])
            return url
          } catch {
            return str
          }
        }
        // If data is ArrayBuffer-like or typed array
        if (maybe.data instanceof ArrayBuffer || (maybe.data?.buffer instanceof ArrayBuffer)) {
          const blob = maybe.data instanceof ArrayBuffer ? new Blob([maybe.data], { type: contentType }) : new Blob([maybe.data], { type: contentType })
          const url = URL.createObjectURL(blob)
          setCreatedObjectUrls(prev => [...prev, url])
          return url
        }
      }
    }

    return null
  }, [])
  
  // Revoke any created object URLs on unmount
  useEffect(() => {
    return () => {
      // Clean up all created object URLs on unmount
      createdObjectUrls.forEach((u) => {
        try { URL.revokeObjectURL(u) } catch {}
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Desktop store
  const desktops = useDesktopStore((state) => state.desktops)
  const desktopLoading = useDesktopStore((state) => state.isLoading)
  const fetchDesktops = useDesktopStore((state) => state.fetchDesktops)
  const refreshDesktops = useDesktopStore((state) => state.refreshDesktops)
  
  // UI store
  const isCreateModalOpen = useUIStore((state) => state.isCreateDesktopModalOpen)
  const isCreateNoteModalOpen = useUIStore((state) => state.isCreateNoteModalOpen)
  const isEditDesktopsModalOpen = useUIStore((state) => state.isEditDesktopsModalOpen)
  const setCreateModalOpen = useUIStore((state) => state.setCreateDesktopModalOpen)
  const setCreateNoteModalOpen = useUIStore((state) => state.setCreateNoteModalOpen)
  const setEditDesktopsModalOpen = useUIStore((state) => state.setEditDesktopsModalOpen)
  
  const isLoading = desktopLoading || authLoading

  const fetchUtilities = useCallback(async () => {
    setUtilitiesLoading(true)
    setUtilitiesError(null)
    try {
      const data = await apiService.getUtilities()
      setUtilities(data)
    } catch (error) {
      console.error('Error fetching utilities:', error)
      setUtilitiesError(error instanceof Error ? error.message : 'Failed to fetch utilities')
    } finally {
      setUtilitiesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/', { replace: true })
      return
    }

    // If user exists, load desktops and utilities
    if (user) {
      fetchDesktops(user.id)
      fetchUtilities()
    } else {
      // Try to sync user profile
      syncUserProfile().then((userExists) => {
        const currentUser = useUserStore.getState().user
        if (userExists && currentUser) {
          fetchDesktops(currentUser.id)
          fetchUtilities()
        } else if (!userExists) {
          // User doesn't exist in backend, redirect to username selection
          navigate('/username-selection', { replace: true })
        }
      })
    }
  }, [isAuthenticated, user, authLoading, navigate, syncUserProfile, fetchDesktops, fetchUtilities])

  const handleCreateDesktop = () => {
    setCreateModalOpen(true)
  }

  const handleDesktopCreated = async () => {
    // Refresh desktop data after creation - store handles cache invalidation
    if (user) {
      await refreshDesktops(user.id)
    }
  }

  const handleCreateNote = () => {
    setCreateNoteModalOpen(true)
  }

  const handleNoteCreated = async () => {
    // Refresh desktop data after note creation - store handles cache invalidation
    if (user) {
      await refreshDesktops(user.id)
    }
  }

  const handleEditDesktops = () => {
    setEditDesktopsModalOpen(true)
  }

  const handleDesktopsUpdated = async () => {
    // Refresh desktop data after editing - store handles cache invalidation
    if (user) {
      await refreshDesktops(user.id)
    }
  }

  if (authLoading || isLoading) {
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
        onClose={() => setCreateModalOpen(false)}
        userId={user?.id || 0}
        onDesktopCreated={handleDesktopCreated}
      />

      {/* Create Note Modal */}
      <CreateNoteModalWithDesktop
        isOpen={isCreateNoteModalOpen}
        onClose={() => setCreateNoteModalOpen(false)}
        userId={user?.id || 0}
        desktops={desktops}
        onNoteCreated={handleNoteCreated}
      />

      {/* Edit Desktops Modal */}
      <EditDesktopsModal
        isOpen={isEditDesktopsModalOpen}
        onClose={() => setEditDesktopsModalOpen(false)}
        desktops={desktops}
        onDesktopsUpdated={handleDesktopsUpdated}
        userId={user.id}
      />

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
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.username}!</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto py-6 sm:px-6 lg:px-8">
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
                          ➕
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

          {/* Utilities Section */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-lg border border-pink-200 hover:shadow-xl transition-all duration-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-4">
                Useful Resources
              </h3>
              {utilitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="ml-3 text-gray-600">Loading utilities...</p>
                </div>
              ) : utilitiesError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-2">Error loading utilities</p>
                  <p className="text-sm text-gray-500">{utilitiesError}</p>
                  <Button 
                    onClick={fetchUtilities}
                    className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              ) : utilities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No utilities available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {utilities.map((utility, index) => {
                  // Use logical OR so empty strings fall through to the next field
                  const rawImage = (utility.picture as unknown) || (utility.image as unknown) || (utility.icon as unknown)
                  const imageUrl = resolveImageSource(rawImage) ?? undefined
                    return (
                      <a
                        key={utility.id || index}
                        href={utility.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center p-4 bg-white/60 rounded-lg border border-pink-200 hover:bg-white/80 hover:shadow-md transition-all duration-200 group"
                      >
                        {imageUrl ? (
                          <div className="w-16 h-16 mb-3 flex items-center justify-center">
                            {(typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('data:'))) ? (
                              <img 
                                src={imageUrl} 
                                alt={utility.name}
                                className="w-full h-full object-contain rounded-lg"
                                onError={(e) => {
                                  // Fallback to a default icon if image fails to load
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  if (target.parentElement) {
                                    target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🔗</div>'
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl">
                                {String(imageUrl)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-16 h-16 mb-3 flex items-center justify-center text-4xl bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg">
                            🔗
                          </div>
                        )}
                        <h4 className="text-sm font-medium text-gray-900 text-center group-hover:text-purple-600 transition-colors">
                          {utility.name}
                        </h4>
                        {utility.description && (
                          <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                            {utility.description}
                          </p>
                        )}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomeBoard 
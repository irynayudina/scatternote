import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface UserData {
  id: number
  username: string
  email: string
  token: string
  role: string
  createdAt: string
}

const HomeBoard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    } catch (error) {
      console.error('Error parsing user data:', error)
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.username}!</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
              Logout
            </Button>
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
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0" variant="outline">
                    Create New Note
                  </Button>
                  <Button className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400" variant="outline" onClick={() => navigate('/desktop/1')}>
                    Go to Desk
                  </Button>
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
                    <dt className="text-sm font-medium text-gray-500">Total Notes</dt>
                    <dd className="text-2xl font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">0</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">This Week</dt>
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
                Welcome to ScatterNote!
              </h3>
              <p className="text-gray-600">
                This is your personal workspace where you can create, organize, and manage your notes. 
                Get started by creating your first note or explore the features available to you.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomeBoard 
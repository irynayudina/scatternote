import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton'
import MarkdownTestComponent from './MarkdownTestComponent'
import { apiService } from '../services/api'
import type { User, UserSettings } from '../services/api'
import { BACKGROUND_IMAGES, getBackgroundImageById } from '../config/backgroundImages'
import { useBackground } from '../contexts/BackgroundContext'

const Settings = () => {
  const navigate = useNavigate()
  const { user: auth0User, isAuthenticated, isLoading: auth0Loading } = useAuth0()
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('coldarkCold')
  const [selectedBackground, setSelectedBackground] = useState<string>('none')
  const { refreshBackground } = useBackground()

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
        loadUserSettings(parsedUser.id)
      } catch (error) {
        console.error('Error parsing user data:', error)
        navigate('/')
      }
    } else {
      navigate('/')
    }
    
    setIsLoading(false)
  }, [auth0User, isAuthenticated, auth0Loading, navigate])

  const loadUserSettings = async (userId: number) => {
    try {
      const userSettings = await apiService.getUserSettings(userId)
      setSettings(userSettings)
      setSelectedTheme(userSettings.preferredTheme)
      setSelectedBackground(userSettings.desktopBackground || 'none')
    } catch (error) {
      console.error('Error loading user settings:', error)
      // Use default theme if settings can't be loaded
      setSelectedTheme('coldarkCold')
      setSelectedBackground('none')
    }
  }

  const handleThemeChange = async (newTheme: string) => {
    if (!user) return

    setSelectedTheme(newTheme)
    setIsSaving(true)

    try {
      const updatedSettings = await apiService.updateUserSettings(user.id, {
        preferredTheme: newTheme
      })
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating theme:', error)
      // Revert to previous theme if update fails
      setSelectedTheme(settings?.preferredTheme || 'coldarkCold')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackgroundChange = async (newBackground: string) => {
    if (!user) return

    setSelectedBackground(newBackground)
    setIsSaving(true)

    try {
      const updatedSettings = await apiService.updateUserSettings(user.id, {
        desktopBackground: newBackground === 'none' ? undefined : newBackground
      })
      setSettings(updatedSettings)
      refreshBackground()
    } catch (error) {
      console.error('Error updating background:', error)
      // Revert to previous background if update fails
      setSelectedBackground(settings?.desktopBackground || 'none')
    } finally {
      setIsSaving(false)
    }
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
                <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">Settings</h1>
                <p className="text-gray-600">Customize your experience</p>
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

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-pink-200">
                <CardHeader>
                  <CardTitle className="text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                    Editor Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Editor Theme
                    </label>
                    <select
                      value={selectedTheme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      disabled={isSaving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="a11yDark">A11y Dark</option>
                      <option value="atomDark">Atom Dark</option>
                      <option value="base16AteliersulphurpoolLight">Base16 Ateliersulphurpool Light</option>
                      <option value="cb">CB</option>
                      <option value="coldarkCold">Coldark Cold</option>
                      <option value="coldarkDark">Coldark Dark</option>
                      <option value="coyWithoutShadows">Coy Without Shadows</option>
                      <option value="coy">Coy</option>
                      <option value="darcula">Darcula</option>
                      <option value="dark">Dark</option>
                      <option value="dracula">Dracula</option>
                      <option value="duotoneDark">Duotone Dark</option>
                      <option value="duotoneEarth">Duotone Earth</option>
                      <option value="duotoneForest">Duotone Forest</option>
                      <option value="duotoneLight">Duotone Light</option>
                      <option value="duotoneSea">Duotone Sea</option>
                      <option value="duotoneSpace">Duotone Space</option>
                      <option value="funky">Funky</option>
                      <option value="ghcolors">GitHub Colors</option>
                      <option value="gruvboxDark">Gruvbox Dark</option>
                      <option value="gruvboxLight">Gruvbox Light</option>
                      <option value="holiTheme">Holi Theme</option>
                      <option value="hopscotch">Hopscotch</option>
                      <option value="lucario">Lucario</option>
                      <option value="materialDark">Material Dark</option>
                      <option value="materialLight">Material Light</option>
                      <option value="materialOceanic">Material Oceanic</option>
                      <option value="nightOwl">Night Owl</option>
                      <option value="nord">Nord</option>
                      <option value="okaidia">Okaidia</option>
                      <option value="oneDark">One Dark</option>
                      <option value="oneLight">One Light</option>
                      <option value="pojoaque">Pojoaque</option>
                      <option value="prism">Prism</option>
                      <option value="shadesOfPurple">Shades of Purple</option>
                      <option value="solarizedDarkAtom">Solarized Dark Atom</option>
                      <option value="solarizedlight">Solarized Light</option>
                      <option value="synthwave84">Synthwave84</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="twilight">Twilight</option>
                      <option value="vs">VS</option>
                      <option value="vscDarkPlus">VS Code Dark Plus</option>
                      <option value="xonokai">Xonokai</option>
                      <option value="zTouch">Z Touch</option>
                    </select>
                    {isSaving && (
                      <p className="text-sm text-pink-600 mt-1">Saving...</p>
                    )}
                  </div>

                  {/* Background Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desktop Background
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {BACKGROUND_IMAGES.map((bg) => (
                        <div
                          key={bg.id}
                          className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                            selectedBackground === bg.id
                              ? 'bg-pink-100 border-2 border-pink-300'
                              : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                          onClick={() => handleBackgroundChange(bg.id)}
                        >
                          <div className="flex-shrink-0 w-12 h-8 rounded overflow-hidden border border-gray-200">
                            {bg.id === 'none' ? (
                              <div className="w-full h-full bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center">
                                <span className="text-xs text-gray-500">None</span>
                              </div>
                            ) : (
                              <img
                                src={bg.filename}
                                alt={bg.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center"><span class="text-xs text-gray-500">Error</span></div>';
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {bg.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {bg.description}
                            </div>
                          </div>
                          {selectedBackground === bg.id && (
                            <div className="flex-shrink-0">
                              <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {isSaving && (
                      <p className="text-sm text-pink-600 mt-1">Saving...</p>
                    )}
                  </div>

                  {/* Current Settings Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Settings</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Theme:</span> {selectedTheme}</p>
                      <p><span className="font-medium">Background:</span> {getBackgroundImageById(selectedBackground)?.name || 'Default'}</p>
                      {settings && (
                        <p><span className="font-medium">Last Updated:</span> {new Date(settings.updatedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Theme Preview */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-pink-200">
                <CardHeader>
                  <CardTitle className="text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                    Theme Preview
                  </CardTitle>
                  <p className="text-gray-600">See how your selected theme looks with various code examples</p>
                </CardHeader>
                <CardContent className="text-left">
                  <MarkdownTestComponent 
                    theme={selectedTheme}
                    showThemeSelector={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings 
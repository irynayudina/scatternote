import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiService } from '../services/api'
import type { Desktop } from '../services/api'

interface EditDesktopsModalProps {
  isOpen: boolean
  onClose: () => void
  desktops: Desktop[]
  onDesktopsUpdated: () => void
}

const EditDesktopsModal = ({ isOpen, onClose, desktops, onDesktopsUpdated }: EditDesktopsModalProps) => {
  const [editingDesktop, setEditingDesktop] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleEdit = (desktop: Desktop) => {
    setEditingDesktop(desktop.id)
    setEditName(desktop.name)
  }

  const handleSave = async (desktopId: number) => {
    if (!editName.trim()) return

    setIsLoading(true)
    try {
      const userData = sessionStorage.getItem('user')
      if (!userData) {
        throw new Error('User not found')
      }
      const user = JSON.parse(userData)
      await apiService.updateDesktop(desktopId, { name: editName.trim() }, user.id)
      setEditingDesktop(null)
      setEditName('')
      onDesktopsUpdated()
    } catch (error) {
      console.error('Error updating desktop:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingDesktop(null)
    setEditName('')
  }

  const handleDelete = async (desktopId: number) => {
    if (!confirm('Are you sure you want to delete this desktop? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    try {
      const userData = sessionStorage.getItem('user')
      if (!userData) {
        throw new Error('User not found')
      }
      const user = JSON.parse(userData)
      await apiService.deleteDesktop(desktopId, user.id)
      onDesktopsUpdated()
    } catch (error) {
      console.error('Error deleting desktop:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
            Edit Desktops
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your desktop names and delete unwanted desktops
          </p>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {desktops.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No desktops to edit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {desktops.map((desktop) => (
                <div
                  key={desktop.id}
                  className="flex items-center justify-between p-3 border border-pink-200 rounded-lg hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200 bg-white"
                >
                  {editingDesktop === desktop.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 border-pink-300 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Desktop name"
                        disabled={isLoading}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(desktop.id)}
                        disabled={isLoading || !editName.trim()}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="border-pink-300 text-pink-600 hover:bg-pink-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-gray-900 flex-1">
                        {desktop.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(desktop)}
                          disabled={isLoading}
                          className="text-purple-600 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(desktop.id)}
                          disabled={isLoading}
                          className="text-pink-600 border-pink-300 hover:bg-pink-50 hover:border-pink-400"
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-pink-200 flex justify-end bg-gradient-to-r from-pink-50 to-purple-50">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 shadow-lg"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EditDesktopsModal 
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Edit, Tag, Pin, Trash2 } from "lucide-react"
import { apiService, type Note } from "@/services/api"

interface NoteViewerProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onNoteUpdated: () => void
  onNoteDeleted: () => void
  userId: number
}

const NoteViewer = ({ note, isOpen, onClose, onNoteUpdated, onNoteDeleted, userId }: NoteViewerProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setTags(note.tags?.map(tagItem => tagItem.tag.name) || [])
      setIsPinned(note.isPinned || false)
      setIsEditing(false)
      setError(null)
    }
  }, [note])

  const handleSave = async () => {
    if (!note) return

    setIsLoading(true)
    setError(null)

    try {
      await apiService.updateNote(note.id, {
        title: title.trim(),
        content: content.trim(),
        tags: tags.filter(tag => tag.trim()),
        isPinned
      }, userId)

      setIsEditing(false)
      onNoteUpdated()
    } catch (error) {
      console.error('Error updating note:', error)
      setError('Failed to update note. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!note) return

    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await apiService.deleteNote(note.id, userId)
      onClose()
      onNoteDeleted()
    } catch (error) {
      console.error('Error deleting note:', error)
      setError('Failed to delete note. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTogglePin = async () => {
    if (!note) return

    setIsLoading(true)
    setError(null)

    try {
      await apiService.toggleNotePin(note.id, userId)
      setIsPinned(!isPinned)
      onNoteUpdated()
    } catch (error) {
      console.error('Error toggling pin:', error)
      setError('Failed to toggle pin. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (!isOpen || !note) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-pink-200 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                    {isEditing ? "Edit Note" : "View Note"}
                  </CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    Created: {new Date(note.createdAt).toLocaleDateString()} | 
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                {isPinned && (
                  <div className="text-pink-600">
                    <Pin className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <Button
                      onClick={handleTogglePin}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                    >
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Title
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-pink-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-xl font-semibold text-gray-900">
                    {note.title}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Content
                </Label>
                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-pink-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 min-h-[200px] whitespace-pre-wrap text-gray-900">
                    {note.content}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag..."
                        className="border-pink-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <Button
                        onClick={addTag}
                        variant="outline"
                        size="sm"
                        className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                      >
                        Add
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-sm px-3 py-1 rounded-full border border-pink-200"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-pink-500 hover:text-pink-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {note.tags && note.tags.length > 0 ? (
                      note.tags.map((tagItem, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-sm px-3 py-1 rounded-full border border-pink-200"
                        >
                          {tagItem.tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No tags</span>
                    )}
                  </div>
                )}
              </div>

              {/* Pin Note (only in edit mode) */}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-pink-300 text-pink-600 focus:ring-pink-500"
                  />
                  <Label htmlFor="isPinned" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    Pin this note
                  </Label>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-pink-200">
                  <Button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !title.trim() || !content.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NoteViewer 
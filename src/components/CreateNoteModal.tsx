import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Plus, Tag, Pin, Edit, Eye } from "lucide-react"
import { apiService } from "@/services/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface CreateNoteModalProps {
  isOpen: boolean
  onClose: () => void
  desktopId: number
  userId: number
  onNoteCreated: () => void
}

const CreateNoteModal = ({ isOpen, onClose, desktopId, userId, onNoteCreated }: CreateNoteModalProps) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isPinned, setIsPinned] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("")
      setContent("")
      setTags([])
      setNewTag("")
      setIsPinned(false)
      setViewMode('edit')
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        desktopId,
        tags: tags.filter(tag => tag.trim()),
        isPinned
      }

      await apiService.createNote(noteData, userId)

      // Reset form
      setTitle("")
      setContent("")
      setTags([])
      setNewTag("")
      setIsPinned(false)

      // Close modal and refresh notes
      onClose()
      onNoteCreated()
    } catch (error) {
      console.error('Error creating note:', error)
      setError('Failed to create note. Please try again.')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-pink-200 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                  Create New Note
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  Add a new note to your desktop
                </CardDescription>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="border-pink-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                  Content *
                </Label>
                
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      viewMode === 'edit'
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Edit className="h-4 w-4 inline mr-2" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      viewMode === 'preview'
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Eye className="h-4 w-4 inline mr-2" />
                    Preview
                  </button>
                </div>

                {/* Content Area */}
                {viewMode === 'edit' ? (
                  <div className="space-y-2">
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your note content here... You can use markdown formatting like **bold**, *italic*, # headings, - lists, and more!"
                      rows={8}
                      className="w-full px-3 py-2 border border-pink-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                      required
                    />
                    <div className="text-xs text-gray-500">
                      💡 Tip: Use markdown formatting like **bold**, *italic*, # headings, - lists, `code`, and [links](url)
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 min-h-[200px] max-h-[400px] overflow-y-auto prose prose-sm max-w-none">
                    <div className="text-gray-900">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                      >
                        {content || "*No content to preview*"}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
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
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
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

              {/* Pin Note */}
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

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-pink-200">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || !content.trim()}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating..." : "Create Note"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CreateNoteModal 
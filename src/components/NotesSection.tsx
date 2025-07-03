import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GripVertical } from "lucide-react"
import type { Note } from "@/services/api"

interface NotesSectionProps {
  notes: Note[]
  viewMode: 'grid' | 'list'
  searchQuery: string
  filters: {
    dateRange: { startDate: string; endDate: string }
    selectedTags: string[]
    isPinned: boolean | null
  }
  isDragModeEnabled: boolean
  isDragging: boolean
  draggedItem: { type: 'note' | 'roadmap', id: number, title: string } | null
  onNoteClick: (note: Note) => void
  onCreateNote: () => void
  onDragStart: (e: React.DragEvent, item: { type: 'note' | 'roadmap', id: number, title: string }) => void
  onDragEnd: () => void
  onClearSearchAndFilters: () => void
}

const NotesSection = ({
  notes,
  viewMode,
  searchQuery,
  filters,
  isDragModeEnabled,
  isDragging,
  draggedItem,
  onNoteClick,
  onCreateNote,
  onDragStart,
  onDragEnd,
  onClearSearchAndFilters
}: NotesSectionProps) => {
  const hasActiveFilters = filters.dateRange.startDate || filters.dateRange.endDate || filters.selectedTags.length > 0 || filters.isPinned !== null

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-4">
        Notes
      </h3>

      {/* Notes Grid/List */}
      {notes.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-gray-500 text-lg mb-4 w-fit mx-auto bg-pink-100 p-2 rounded-md">
            {searchQuery 
              ? 'No notes found matching your search' 
              : hasActiveFilters
              ? 'No notes match your current filters'
              : 'No notes found'
            }
          </div>
          {!searchQuery && !hasActiveFilters && (
            <Button onClick={onCreateNote} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400">
              Create your first note
            </Button>
          )}
          {(searchQuery || hasActiveFilters) && (
            <Button 
              onClick={onClearSearchAndFilters} 
              variant="outline" 
              className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
            >
              Clear search and filters
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/80 backdrop-blur-sm border-pink-200 hover:border-pink-300 ${
                note.isPinned ? 'ring-2 ring-pink-500' : ''
              } ${isDragging && draggedItem?.id === note.id ? 'opacity-50' : ''} ${
                isDragModeEnabled ? 'hover:ring-2 hover:ring-pink-400' : ''
              }`}
              onClick={() => onNoteClick(note)}
              draggable={isDragModeEnabled}
              onDragStart={(e) => onDragStart(e, { type: 'note', id: note.id, title: note.title })}
              onDragEnd={onDragEnd}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start relative">
                  <div className="flex items-center space-x-2 flex-1">
                    {isDragModeEnabled && (
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                    )}
                    <CardTitle className="text-lg font-semibold line-clamp-2 text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                      {note.title}
                    </CardTitle>
                  </div>
                  {note.isPinned && (
                    <div className="absolute right-4 top-2 text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-xs font-medium">PINNED</div>
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
                    {note.tags.map((tagItem, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs px-2 py-1 rounded-full border border-pink-200"
                      >
                        {tagItem.tag.name}
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
  )
}

export default NotesSection 
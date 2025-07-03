import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Grid, List, Map, GripVertical } from "lucide-react"
import type { FilterState } from "./FilterModal"

interface DesktopToolbarProps {
  onCreateNote: () => void
  onCreateRoadmap: () => void
  isDragModeEnabled: boolean
  onToggleDragMode: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: FilterState
  onOpenFilterModal: () => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

const DesktopToolbar = ({
  onCreateNote,
  onCreateRoadmap,
  isDragModeEnabled,
  onToggleDragMode,
  searchQuery,
  onSearchChange,
  filters,
  onOpenFilterModal,
  viewMode,
  onViewModeChange
}: DesktopToolbarProps) => {
  const hasActiveFilters = filters.dateRange.startDate || filters.dateRange.endDate || filters.selectedTags.length > 0 || filters.isPinned !== null

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
      <div className="flex items-center space-x-4">
        <Button onClick={onCreateNote} className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0">
          <Plus className="h-4 w-4" />
          <span>Create Note</span>
        </Button>
        <Button onClick={onCreateRoadmap} className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
          <Map className="h-4 w-4" />
          <span>Create Roadmap</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDragMode}
          className={`border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 ${
            isDragModeEnabled ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-400' : ''
          }`}
        >
          <GripVertical className="h-3 w-3 mr-2" />
          {isDragModeEnabled ? 'Drag Mode On' : 'Drag Mode'}
        </Button>
        {isDragModeEnabled && (
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span>Drag items to transfer between desktops</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-pink-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
          />
        </div>
        
        {/* Filter */}
        <Button 
          variant="outline" 
          size="sm" 
          className={`border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 ${
            hasActiveFilters 
              ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-400' 
              : ''
          }`}
          onClick={onOpenFilterModal}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></span>
          )}
        </Button>
        
        {/* View Mode Toggle */}
        <div className="flex border border-pink-300 rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-r-none ${viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0' : 'text-pink-600 hover:bg-pink-50'}`}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`rounded-l-none ${viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0' : 'text-pink-600 hover:bg-pink-50'}`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DesktopToolbar 
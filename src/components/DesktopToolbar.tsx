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
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 lg:gap-4 mb-4 sm:mb-6">
      {/* Left side - Action buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
        <Button 
          onClick={onCreateNote} 
          size="sm"
          className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Create Note</span>
          <span className="sm:hidden">Note</span>
        </Button>
        
        <Button 
          onClick={onCreateRoadmap} 
          size="sm"
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 text-xs sm:text-sm px-2 sm:px-3"
        >
          <Map className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Create Roadmap</span>
          <span className="sm:hidden">Map</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleDragMode}
          className={`border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 text-xs sm:text-sm px-2 sm:px-3 ${
            isDragModeEnabled ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-400' : ''
          }`}
        >
          <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{isDragModeEnabled ? 'Drag Mode On' : 'Drag Mode'}</span>
          <span className="sm:hidden">{isDragModeEnabled ? 'On' : 'Drag'}</span>
        </Button>
        
        {isDragModeEnabled && (
          <div className="text-xs text-gray-500 flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-md">
            <span className="hidden sm:inline">Drag items to transfer between desktops</span>
            <span className="sm:hidden">Drag to transfer</span>
          </div>
        )}
      </div>
      
      {/* Right side - Search, Filter, View Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
        {/* Search */}
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-pink-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-48 lg:w-64 pl-7 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-pink-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
          />
        </div>
        
        {/* Filter */}
        <Button 
          variant="outline" 
          size="sm" 
          className={`border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 text-xs sm:text-sm px-2 sm:px-3 ${
            hasActiveFilters 
              ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-pink-400' 
              : ''
          }`}
          onClick={onOpenFilterModal}
        >
          <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Filter</span>
          <span className="sm:hidden">Filter</span>
          {hasActiveFilters && (
            <span className="ml-1 sm:ml-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></span>
          )}
        </Button>
        
        {/* View Mode Toggle */}
        <div className="flex border border-pink-300 rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-r-none px-2 sm:px-3 text-xs sm:text-sm ${viewMode === 'grid' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0' : 'text-pink-600 hover:bg-pink-50'}`}
          >
            <Grid className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`rounded-l-none px-2 sm:px-3 text-xs sm:text-sm ${viewMode === 'list' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0' : 'text-pink-600 hover:bg-pink-50'}`}
          >
            <List className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DesktopToolbar 
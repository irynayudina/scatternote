import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Calendar, Tag, Filter, RotateCcw } from "lucide-react"
import { apiService } from "@/services/api"
import type { Tag as TagType } from "@/services/api"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterState) => void
  currentFilters: FilterState
}

export interface FilterState {
  dateRange: {
    startDate: string
    endDate: string
  }
  selectedTags: string[]
  isPinned: boolean | null
}

const FilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters }: FilterModalProps) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters)
  const [availableTags, setAvailableTags] = useState<TagType[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTags()
    }
  }, [isOpen])

  const loadTags = async () => {
    try {
      setIsLoadingTags(true)
      const tags = await apiService.getAllTags()
      setAvailableTags(tags)
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setIsLoadingTags(false)
    }
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }))
  }

  const handleTagToggle = (tagName: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagName)
        ? prev.selectedTags.filter(tag => tag !== tagName)
        : [...prev.selectedTags, tagName]
    }))
  }

  const handlePinnedToggle = () => {
    setFilters(prev => ({
      ...prev,
      isPinned: prev.isPinned === null ? true : prev.isPinned === true ? false : null
    }))
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
    onClose()
  }

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      dateRange: { startDate: '', endDate: '' },
      selectedTags: [],
      isPinned: null
    }
    setFilters(clearedFilters)
    onApplyFilters(clearedFilters)
    onClose()
  }

  const getPinnedButtonText = () => {
    if (filters.isPinned === null) return "All Notes"
    if (filters.isPinned === true) return "Pinned Only"
    return "Not Pinned"
  }

  const getPinnedButtonVariant = () => {
    if (filters.isPinned === null) return "outline"
    if (filters.isPinned === true) return "default"
    return "secondary"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm border-pink-200 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Filter className="h-5 w-5 text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                    Filter Notes
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Refine your note search
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-500" />
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500">Start Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    className="border-pink-300 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">End Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    className="border-pink-300 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Pinned Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Pin Status
              </Label>
              <Button
                variant={getPinnedButtonVariant()}
                onClick={handlePinnedToggle}
                className={`w-full justify-start ${
                  filters.isPinned === true 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0' 
                    : filters.isPinned === false
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400'
                }`}
              >
                {getPinnedButtonText()}
              </Button>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-pink-500" />
                Tags
                {isLoadingTags && <span className="text-xs text-gray-400">Loading...</span>}
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {availableTags.length === 0 && !isLoadingTags ? (
                  <p className="text-sm text-gray-500">No tags available</p>
                ) : (
                  availableTags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                        filters.selectedTags.includes(tag.name)
                          ? 'bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-300'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleTagToggle(tag.name)}
                    >
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        filters.selectedTags.includes(tag.name)
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                          : 'bg-gray-300'
                      }`} />
                      <span className={`text-sm ${
                        filters.selectedTags.includes(tag.name)
                          ? 'text-pink-700 font-medium'
                          : 'text-gray-700'
                      }`}>
                        {tag.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
              >
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FilterModal 
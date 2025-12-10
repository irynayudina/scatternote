import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Edit3, Save, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import type { Roadmap, RoadmapStep } from '@/services/api'
import { useRoadmapsStore } from '@/stores/roadmapsStore'
import RoadmapStepComponent from './RoadmapStep'

interface RoadmapViewerProps {
  roadmap: Roadmap | null
  isOpen: boolean
  onClose: () => void
  onRoadmapUpdated: () => void
  onRoadmapDeleted: () => void
  userId: number
}

const RoadmapViewer = ({ 
  roadmap: roadmapProp, 
  isOpen, 
  onClose, 
  onRoadmapUpdated, 
  onRoadmapDeleted, 
  userId 
}: RoadmapViewerProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedSteps, setEditedSteps] = useState<RoadmapStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get the current roadmap from store to ensure it's always up-to-date
  const currentRoadmapFromStore = useRoadmapsStore((state) => state.currentRoadmap)
  const roadmap = currentRoadmapFromStore || roadmapProp
  
  const updateRoadmap = useRoadmapsStore((state) => state.updateRoadmap)
  const deleteRoadmap = useRoadmapsStore((state) => state.deleteRoadmap)

  // Initialize edit state when roadmap changes
  useEffect(() => {
    if (roadmap) {
      setEditedTitle(roadmap.title)
      setEditedDescription(roadmap.description || '')
      setEditedSteps([...roadmap.steps])
    }
  }, [roadmap])

  if (!roadmap || !isOpen) return null

  const completedSteps = roadmap.steps.filter(step => step.isCompleted).length
  const totalSteps = roadmap.steps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const handleSaveEdit = async () => {
    if (!roadmap) return
    if (!editedTitle.trim()) {
      setError('Title is required')
      return
    }

    if (editedSteps.some(step => !step.title.trim())) {
      setError('All steps must have a title')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const updated = await updateRoadmap(roadmap.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim() || undefined,
        steps: editedSteps.map(step => ({
          title: step.title.trim(),
          description: step.description || undefined,
          order: step.order,
          isCompleted: step.isCompleted
        }))
      }, userId)

      if (updated) {
        setIsEditing(false)
        onRoadmapUpdated()
      } else {
        setError('Failed to update roadmap. Please try again.')
      }
    } catch (error) {
      console.error('Error updating roadmap:', error)
      setError('Failed to update roadmap. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedTitle(roadmap.title)
    setEditedDescription(roadmap.description || '')
    setEditedSteps([...roadmap.steps])
    setIsEditing(false)
    setError(null)
  }

  const handleDeleteRoadmap = async () => {
    if (!roadmap) return
    if (!confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const success = await deleteRoadmap(roadmap.id, userId)
      if (success) {
        onRoadmapDeleted()
        onClose()
      } else {
        setError('Failed to delete roadmap. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      setError('Failed to delete roadmap. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const moveStep = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= editedSteps.length) return

    const newSteps = [...editedSteps]
    const [movedStep] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, movedStep)
    
    // Reorder all steps
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i + 1 }))
    setEditedSteps(reorderedSteps)
  }

  const updateStep = (index: number, field: keyof RoadmapStep, value: string) => {
    const newSteps = [...editedSteps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setEditedSteps(newSteps)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold border-pink-300 focus:border-pink-500"
                    disabled={isLoading}
                  />
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Enter description..."
                    className="border-pink-300 focus:border-pink-500"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
                    {roadmap.title}
                  </h2>
                  {roadmap.description && (
                    <p className="text-gray-600 mt-2">{roadmap.description}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    disabled={isLoading}
                    className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={handleDeleteRoadmap}
                    variant="outline"
                    disabled={isLoading}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress: {completedSteps} of {totalSteps} steps completed
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Steps</h3>
            {isEditing ? (
              <div className="space-y-3">
                {editedSteps.map((step, index) => (
                  <Card key={step.id} className="border-pink-200 bg-pink-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-600">Step {step.order}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(index, 'up')}
                              disabled={index === 0 || isLoading}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(index, 'down')}
                              disabled={index === editedSteps.length - 1 || isLoading}
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Input
                            value={step.title}
                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                            placeholder="Step title..."
                            className="border-pink-300 focus:border-pink-500"
                            disabled={isLoading}
                          />
                          
                          <Textarea
                            value={step.description || ''}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            placeholder="Step description (optional)..."
                            className="border-pink-300 focus:border-pink-500"
                            rows={2}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {roadmap.steps.map((step) => (
                  <RoadmapStepComponent
                    key={step.id}
                    step={step}
                    userId={userId}
                    onStepUpdated={onRoadmapUpdated}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoadmapViewer 
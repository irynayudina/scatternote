import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, GripVertical } from 'lucide-react'
import { apiService } from '@/services/api'
import type { Roadmap } from '@/services/api'

interface CreateRoadmapModalProps {
  isOpen: boolean
  onClose: () => void
  desktopId: number
  userId: number
  onRoadmapCreated: () => void
}

interface RoadmapStep {
  title: string
  description: string
  order: number
  isCompleted: boolean
}

const CreateRoadmapModal = ({ isOpen, onClose, desktopId, userId, onRoadmapCreated }: CreateRoadmapModalProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [steps, setSteps] = useState<RoadmapStep[]>([
    { title: '', description: '', order: 1, isCompleted: false }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addStep = () => {
    setSteps([...steps, { title: '', description: '', order: steps.length + 1, isCompleted: false }])
  }

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_, i) => i !== index)
      // Reorder remaining steps
      const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i + 1 }))
      setSteps(reorderedSteps)
    }
  }

  const updateStep = (index: number, field: keyof RoadmapStep, value: string | number | boolean) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length) return
    
    const newSteps = [...steps]
    const [movedStep] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, movedStep)
    
    // Reorder all steps
    const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i + 1 }))
    setSteps(reorderedSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (steps.some(step => !step.title.trim())) {
      setError('All steps must have a title')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await apiService.createRoadmap(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          steps: steps.map(step => ({
            title: step.title.trim(),
            description: step.description.trim() || undefined,
            order: step.order,
            isCompleted: step.isCompleted
          }))
        },
        userId,
        desktopId
      )

      // Reset form
      setTitle('')
      setDescription('')
      setSteps([{ title: '', description: '', order: 1, isCompleted: false }])
      
      onRoadmapCreated()
      onClose()
    } catch (error) {
      console.error('Error creating roadmap:', error)
      setError('Failed to create roadmap. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setTitle('')
      setDescription('')
      setSteps([{ title: '', description: '', order: 1, isCompleted: false }])
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text">
              Create New Roadmap
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Roadmap Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Roadmap Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter roadmap title..."
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter roadmap description..."
                  className="mt-1"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Roadmap Steps *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  disabled={isLoading}
                  className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <Card key={index} className="border-pink-200 bg-pink-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex flex-col space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <span className="text-sm font-medium text-gray-600">Step {step.order}</span>
                            {steps.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStep(index)}
                                disabled={isLoading}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          <Input
                            value={step.title}
                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                            placeholder="Step title..."
                            className="border-pink-300 focus:border-pink-500"
                            disabled={isLoading}
                          />
                          
                          <Textarea
                            value={step.description}
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
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
              >
                {isLoading ? 'Creating...' : 'Create Roadmap'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateRoadmapModal 
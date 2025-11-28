import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Circle } from 'lucide-react'
import { useRoadmapsStore } from '@/stores/roadmapsStore'
import type { RoadmapStep } from '@/services/api'

interface RoadmapStepProps {
  step: RoadmapStep
  userId: number
  onStepUpdated: () => void
  isLoading: boolean
}

const RoadmapStepComponent = ({ 
  step, 
  userId, 
  onStepUpdated, 
  isLoading 
}: RoadmapStepProps) => {
  const [isCompleted, setIsCompleted] = useState(step.isCompleted)
  const [isToggling, setIsToggling] = useState(false)
  
  const toggleStepCompletion = useRoadmapsStore((state) => state.toggleStepCompletion)

  // Update local state when step prop changes
  useEffect(() => {
    setIsCompleted(step.isCompleted)
  }, [step.isCompleted])

  const handleToggleStep = async () => {
    try {
      setIsToggling(true)
      // Optimistically update the UI
      setIsCompleted(!isCompleted)
      
      const updatedRoadmap = await toggleStepCompletion(step.id, userId)
      if (updatedRoadmap) {
        // Find the updated step in the roadmap
        const updatedStep = updatedRoadmap.steps.find(s => s.id === step.id)
        if (updatedStep) {
          setIsCompleted(updatedStep.isCompleted)
        }
        onStepUpdated()
      } else {
        // Revert the optimistic update on error
        setIsCompleted(step.isCompleted)
      }
    } catch (error) {
      console.error('Error toggling step:', error)
      // Revert the optimistic update on error
      setIsCompleted(step.isCompleted)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card 
      className={`border transition-all duration-200 ${
        isCompleted 
          ? 'border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50' 
          : 'border-pink-200 bg-pink-50/50'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleStep}
            disabled={isLoading || isToggling}
            className={`h-8 w-8 p-0 ${
              isCompleted 
                ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-600">Step {step.order}</span>
              {isCompleted && (
                <span className="text-xs font-medium text-purple-600 bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded-full">
                  COMPLETED
                </span>
              )}
            </div>
            
            <h4 className={`font-medium ${
              isCompleted ? 'text-purple-800' : 'text-gray-800'
            }`}>
              {step.title}
            </h4>
            
            {step.description && (
              <p className={`text-sm mt-1 ${
                isCompleted ? 'text-purple-600' : 'text-gray-600'
              }`}>
                {step.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoadmapStepComponent 
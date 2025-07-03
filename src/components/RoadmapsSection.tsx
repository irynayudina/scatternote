import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, GripVertical } from "lucide-react"
import type { Roadmap } from "@/services/api"

interface RoadmapsSectionProps {
  roadmaps: Roadmap[]
  onRoadmapClick: (roadmap: Roadmap) => void
  isDragModeEnabled: boolean
  isDragging: boolean
  draggedItem: { type: 'note' | 'roadmap', id: number, title: string } | null
  onDragStart: (e: React.DragEvent, item: { type: 'note' | 'roadmap', id: number, title: string }) => void
  onDragEnd: () => void
}

const RoadmapsSection = ({
  roadmaps,
  onRoadmapClick,
  isDragModeEnabled,
  isDragging,
  draggedItem,
  onDragStart,
  onDragEnd
}: RoadmapsSectionProps) => {
  if (!roadmaps || roadmaps.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-4">
        Roadmaps
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => {
          const completedSteps = roadmap.steps.filter(step => step.isCompleted).length
          const totalSteps = roadmap.steps.length
          const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

          return (
            <Card 
              key={roadmap.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-300 ${
                isDragging && draggedItem?.id === roadmap.id ? 'opacity-50' : ''
              } ${
                isDragModeEnabled ? 'hover:ring-2 hover:ring-purple-400' : ''
              }`}
              onClick={() => onRoadmapClick(roadmap)}
              draggable={isDragModeEnabled}
              onDragStart={(e) => onDragStart(e, { type: 'roadmap', id: roadmap.id, title: roadmap.title })}
              onDragEnd={onDragEnd}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2 flex-1">
                    {isDragModeEnabled && (
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                    )}
                    <CardTitle className="text-lg font-semibold line-clamp-2 text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                      {roadmap.title}
                    </CardTitle>
                  </div>
                  <Map className="h-5 w-5 text-purple-500" />
                </div>
                {roadmap.description && (
                  <CardDescription className="text-sm text-gray-500 line-clamp-2">
                    {roadmap.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-purple-600 font-medium">
                      {completedSteps}/{totalSteps} steps
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(progressPercentage)}% complete
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default RoadmapsSection 
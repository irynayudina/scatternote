import { Button } from "@/components/ui/button"
import { Monitor, ArrowLeft } from "lucide-react"

interface EmptyDesktopStateProps {
  onCreateDesktop: () => void
  onGoToHomeBoard: () => void
}

const EmptyDesktopState = ({ onCreateDesktop, onGoToHomeBoard }: EmptyDesktopStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-200 p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
            <Monitor className="h-10 w-10 text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text" />
          </div>
          
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text mb-4">
            Welcome to ScatterNote!
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            You don't have any desktops yet. Desktops help you organize your notes into different workspaces. 
            Create your first desktop to get started with note-taking.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={onCreateDesktop}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 py-3"
            >
              <Monitor className="h-5 w-5 mr-2" />
              Create Your First Desktop
            </Button>
            
            <Button 
              onClick={onGoToHomeBoard}
              variant="outline"
              className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home Board
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-pink-200">
            <p className="text-xs text-gray-500">
              💡 Tip: You can create multiple desktops for different projects or topics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmptyDesktopState 
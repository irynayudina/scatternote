import type { Desktop as DesktopType } from "@/services/api"

interface DesktopCarouselItemProps {
  desktop: DesktopType
  isActive: boolean
  isDragModeEnabled: boolean
  isDragOver: boolean
  onClick: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}

const DesktopCarouselItem = ({
  desktop,
  isActive,
  isDragModeEnabled,
  isDragOver,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop
}: DesktopCarouselItemProps) => {
  // Determine scale and styling based on state
  let scale = 1
  let bgColor = 'bg-gray-100 border-gray-300 text-gray-600'
  let textColor = 'text-gray-500 w-24 bg-pink-100 p-2 rounded-md truncate'
  
  if (isActive) {
    scale = 1.25
    bgColor = 'bg-gradient-radial from-pink-500 to-purple-500 border-pink-600 text-white'
    textColor = 'text-transparent w-24 mx-2 truncate bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text'
  }
  
  return (
    <div
      className={`flex flex-col items-center transition-all duration-300 cursor-pointer ${
        isActive ? 'scale-125' : 'scale-100 opacity-60 hover:opacity-80'
      } ${isDragOver ? 'ring-4 ring-pink-400 ring-opacity-50' : ''}`}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        transform: `scale(${scale})`,
        opacity: isActive ? 1 : 0.6,
        transition: 'all 0.3s ease-out',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <div
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${bgColor} ${
        isDragModeEnabled ? 'ring-2 ring-pink-300 ring-opacity-30' : ''
      }`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        <span 
          className="text-sm font-semibold"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          {desktop.name.charAt(0).toUpperCase()}
        </span>
      </div>
      <span 
        className={`text-xs mt-2 font-medium transition-all duration-300 ${textColor}`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {desktop.name}
      </span>
    </div>
  )
}

export default DesktopCarouselItem 
import type { Desktop as DesktopType } from "@/services/api"
import { useState } from "react"

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
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div
      className={`group flex flex-col items-center transition-all duration-500 ease-out cursor-pointer relative ${
        isActive 
          ? 'scale-110 sm:scale-125 z-20' 
          : 'scale-90 sm:scale-95 opacity-70 hover:opacity-100 hover:scale-100 sm:hover:scale-105 z-10'
      } ${isDragOver ? 'ring-4 ring-pink-400 ring-opacity-60 ring-offset-2' : ''}`}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {/* Card Container */}
      <div
        className={`
          relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
          rounded-xl sm:rounded-2xl
          flex items-center justify-center
          transition-all duration-500 ease-out
          ${isActive 
            ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-500 shadow-lg shadow-pink-500/50 border-2 border-pink-400' 
            : 'bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-pink-300'
          }
          ${isDragModeEnabled ? 'ring-2 ring-pink-300 ring-opacity-40' : ''}
          ${isHovered && !isActive ? 'bg-gradient-to-br from-pink-50 to-purple-50' : ''}
        `}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {/* Active Indicator Glow */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
        )}
        
        {/* Initial Letter */}
        <span 
          className={`
            relative z-10 text-lg sm:text-xl md:text-2xl font-bold
            transition-all duration-500
            ${isActive 
              ? 'text-white drop-shadow-md' 
              : 'text-gray-700 group-hover:text-pink-600'
            }
          `}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          {desktop.name.charAt(0).toUpperCase()}
        </span>
        
        {/* Active Badge Indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
      
      {/* Desktop Name Label */}
      <div
        className={`
          mt-2 px-2 py-1 rounded-md
          transition-all duration-300 ease-out
          ${isActive 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
          }
          ${isHovered || isActive ? 'block' : 'hidden sm:block'}
        `}
      >
        <span
          className={`
            text-xs sm:text-sm font-semibold
            transition-colors duration-300
            ${isActive 
              ? 'text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text' 
              : 'text-gray-600 group-hover:text-pink-600'
            }
            max-w-[80px] sm:max-w-[100px] truncate block
          `}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none'
          }}
        >
          {desktop.name}
        </span>
      </div>
      
      {/* Hover Tooltip for Inactive Items */}
      {isHovered && !isActive && (
        <div
          className="absolute bottom-full mb-2 px-3 py-1.5 rounded-lg bg-gray-900/90 backdrop-blur-sm text-white text-xs font-medium shadow-xl z-50 whitespace-nowrap"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none',
            animation: 'fadeInUp 0.2s ease-out'
          }}
        >
          {desktop.name}
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90" />
        </div>
      )}
    </div>
  )
}

export default DesktopCarouselItem 
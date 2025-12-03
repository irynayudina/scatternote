import type { Desktop as DesktopType } from "@/services/api"
import { useState } from "react"

interface DesktopCarouselItemProps {
  desktop: DesktopType
  isActive: boolean
  isPreview?: boolean
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
  isPreview = false,
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
          ? 'scale-110 sm:scale-115 z-20' 
          : isPreview
          ? 'scale-105 sm:scale-110 opacity-90 z-15'
          : 'scale-90 sm:scale-95 opacity-70 hover:opacity-100 hover:scale-100 sm:hover:scale-105 z-10'
      } ${isDragOver ? 'ring-2 ring-pink-400 ring-opacity-60 ring-offset-1' : ''}`}
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
          relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10
          rounded-lg sm:rounded-xl
          flex items-center justify-center
          transition-all duration-500 ease-out
          ${isActive 
            ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-500 shadow-md shadow-pink-500/50 border border-pink-400' 
            : isPreview
            ? 'bg-gradient-to-br from-pink-400 via-purple-400 to-pink-400 shadow-md shadow-pink-400/40 border border-pink-300'
            : 'bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-300'
          }
          ${isDragModeEnabled ? 'ring-1 ring-pink-300 ring-opacity-40' : ''}
          ${isHovered && !isActive && !isPreview ? 'bg-gradient-to-br from-pink-50 to-purple-50' : ''}
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
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
        )}
        
        {/* Preview Indicator Glow - subtle pulse */}
        {isPreview && (
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-pink-300/15 via-purple-300/15 to-pink-300/15" />
        )}
        
        {/* Initial Letter */}
        <span 
          className={`
            relative z-10 text-xs sm:text-sm md:text-base font-bold
            transition-all duration-500
            ${isActive 
              ? 'text-white drop-shadow-sm' 
              : isPreview
              ? 'text-white drop-shadow-sm opacity-90'
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
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full border border-white shadow-sm flex items-center justify-center">
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full" />
          </div>
        )}
        
        {/* Preview Badge Indicator - smaller and less prominent */}
        {isPreview && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full border border-white/80 shadow-sm flex items-center justify-center">
            <div className="w-0.5 h-0.5 sm:w-0.5 sm:h-0.5 bg-white rounded-full" />
          </div>
        )}
      </div>
      
      {/* Desktop Name Label */}
      <div
        className={`
          mt-1 px-1.5 py-0.5 rounded
          transition-all duration-300 ease-out
          ${isActive || isPreview
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0'
          }
          ${isHovered || isActive || isPreview ? 'block' : 'hidden sm:block'}
        `}
      >
        <span
          className={`
            text-[10px] sm:text-xs font-semibold
            transition-colors duration-300
            ${isActive 
              ? 'text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text' 
              : isPreview
              ? 'text-transparent bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text opacity-90'
              : 'text-gray-600 group-hover:text-pink-600'
            }
            max-w-[60px] sm:max-w-[80px] truncate block text-center
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
      {isHovered && !isActive && !isPreview && (
        <div
          className="absolute left-full ml-1.5 px-2 py-1 rounded-md bg-gray-900/90 backdrop-blur-sm text-white text-[10px] font-medium shadow-lg z-50 whitespace-nowrap"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none',
            animation: 'fadeInLeft 0.2s ease-out'
          }}
        >
          {desktop.name}
          {/* Tooltip Arrow */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-2 border-b-2 border-l-2 border-transparent border-l-gray-900/90" />
        </div>
      )}
    </div>
  )
}

export default DesktopCarouselItem 
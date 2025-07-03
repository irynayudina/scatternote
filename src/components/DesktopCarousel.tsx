import { useRef, useState } from "react"
import type { Desktop as DesktopType } from "@/services/api"

interface DesktopCarouselProps {
  desktops: DesktopType[]
  activeDesktopId: number
  onDesktopChange: (desktopId: number) => void
  isDragModeEnabled: boolean
  dragOverDesktop: number | null
  onDragOver: (e: React.DragEvent, desktopId: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, desktopId: number) => void
}

const DesktopCarousel = ({
  desktops,
  activeDesktopId,
  onDesktopChange,
  isDragModeEnabled,
  dragOverDesktop,
  onDragOver,
  onDragLeave,
  onDrop
}: DesktopCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // Touch swipe handlers
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)

  // Rearrange desktops to keep active one in the middle
  const getRearrangedDesktops = () => {
    if (desktops.length === 0) return []
    
    const activeIndex = desktops.findIndex(d => d.id === activeDesktopId)
    if (activeIndex === -1) return desktops
    
    const middleIndex = Math.floor(desktops.length / 2)
    const shift = middleIndex - activeIndex
    
    const rearranged = [...desktops]
    if (shift > 0) {
      // Move active element forward
      for (let i = 0; i < shift; i++) {
        const last = rearranged.pop()!
        rearranged.unshift(last)
      }
    } else if (shift < 0) {
      // Move active element backward
      for (let i = 0; i < Math.abs(shift); i++) {
        const first = rearranged.shift()!
        rearranged.push(first)
      }
    }
    
    return rearranged
  }

  // Navigate to next desktop
  const goToNextDesktop = () => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId)
    const nextIndex = (currentIndex + 1) % desktops.length
    const nextDesktop = desktops[nextIndex]
    if (nextDesktop) {
      onDesktopChange(nextDesktop.id)
    }
  }

  // Navigate to previous desktop
  const goToPreviousDesktop = () => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId)
    const prevIndex = currentIndex === 0 ? desktops.length - 1 : currentIndex - 1
    const prevDesktop = desktops[prevIndex]
    if (prevDesktop) {
      onDesktopChange(prevDesktop.id)
    }
  }

  // Handle scroll wheel events
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Add a small delay to prevent rapid scrolling
    const threshold = 50 // Minimum scroll delta to trigger change
    
    if (Math.abs(e.deltaX) > threshold || Math.abs(e.deltaY) > threshold) {
      if (e.deltaX > 0 || e.deltaY > 0) {
        goToNextDesktop()
      } else {
        goToPreviousDesktop()
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
    setIsSwiping(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return

    const touchCurrentX = e.touches[0].clientX
    const touchCurrentY = e.touches[0].clientY
    
    const deltaX = touchStartX - touchCurrentX
    const deltaY = touchStartY - touchCurrentY
    
    // Determine if this is a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsSwiping(true)
      e.preventDefault() // Prevent default scrolling during horizontal swipe
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY || !isSwiping) return

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchStartX - touchEndX
    const minSwipeDistance = 50 // Minimum distance for a swipe

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swiped left - go to next
        goToNextDesktop()
      } else {
        // Swiped right - go to previous
        goToPreviousDesktop()
      }
    }

    // Reset touch state
    setTouchStartX(0)
    setTouchStartY(0)
    setIsSwiping(false)
  }

  const rearrangedDesktops = getRearrangedDesktops()

  return (
    <div className="bg-white/60 backdrop-blur-sm border-b border-pink-200 pt-4 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={carouselRef}
          className="relative overflow-visible"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            height: '120px',
            zIndex: 10
          }}
        >
          <div 
            className="flex justify-center items-center space-x-8 py-4 transition-all duration-300 ease-out"
            style={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            {rearrangedDesktops.map((desktopItem) => {
              const isActive = desktopItem.id === activeDesktopId
              
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
                  key={desktopItem.id}
                  className={`flex flex-col items-center transition-all duration-300 cursor-pointer ${
                    isActive ? 'scale-125' : 'scale-100 opacity-60 hover:opacity-80'
                  } ${dragOverDesktop === desktopItem.id ? 'ring-4 ring-pink-400 ring-opacity-50' : ''}`}
                  onClick={() => onDesktopChange(desktopItem.id)}
                  onDragOver={(e) => onDragOver(e, desktopItem.id)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, desktopItem.id)}
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
                      {desktopItem.name.charAt(0).toUpperCase()}
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
                    {desktopItem.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesktopCarousel 
import { useCallback, useEffect, useState } from 'react'

export function useCardFlipPreview() {
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleCardFlip = useCallback(() => {
    if (!isMobile) setIsCardFlipped((prev) => !prev)
  }, [isMobile])

  return { isCardFlipped, isMobile, toggleCardFlip }
}

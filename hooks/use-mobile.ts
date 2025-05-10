"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect if the current viewport is mobile-sized
 * @returns boolean indicating if the viewport is mobile-sized
 */
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      // Initial check
      checkIfMobile()

      // Add event listener
      window.addEventListener("resize", checkIfMobile)

      // Clean up
      return () => window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  return isMobile
}

// Also export as default
export default useMobile

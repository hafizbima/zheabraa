import { useState, useEffect } from 'react'

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event) => setPrefersReducedMotion(event.matches)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(onChange)
      return () => mediaQuery.removeListener(onChange)
    }
  }, [])

  return prefersReducedMotion
}

export default usePrefersReducedMotion

import { useState, useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/**
 * Tween angka menggunakan requestAnimationFrame.
 * Skip saat initial mount dan saat prefers-reduced-motion aktif.
 *
 * @param {number} targetValue
 * @param {number} [duration=400]
 * @returns {number}
 */
export function useCountUp(targetValue, duration = 400) {
  const numericTarget = typeof targetValue === 'number' && !Number.isNaN(targetValue) ? targetValue : 0
  const [displayValue, setDisplayValue] = useState(numericTarget)
  const isMountedRef = useRef(false)
  const currentRef = useRef(numericTarget)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!isMountedRef.current || prefersReduced || duration <= 0) {
      isMountedRef.current = true
      currentRef.current = numericTarget
      setDisplayValue(numericTarget)
      return
    }

    const startValue = currentRef.current
    if (startValue === numericTarget) {
      return
    }

    let rafId
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Cubic ease-out (out-expo / out-cubic)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (numericTarget - startValue) * ease)

      currentRef.current = current
      setDisplayValue(current)

      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      } else {
        currentRef.current = numericTarget
        setDisplayValue(numericTarget)
      }
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [numericTarget, duration, prefersReduced])

  return displayValue
}

export default useCountUp

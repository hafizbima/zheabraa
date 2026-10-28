/**
 * Haptic feedback utility for mobile touch interactions using the HTML5 Vibration API.
 * Safely falls back to a no-op on desktop or unsupported browsers.
 */

export function canVibrate() {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

export function vibrate(pattern) {
  if (!canVibrate()) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}

export const haptic = {
  /** Crisp 10ms micro-tap for buttons, tabs, presets, and FAB */
  tap: () => vibrate(10),

  /** Ultra light 6ms tick for selections and pickers */
  selection: () => vibrate(6),

  /** Affirmative double-tick for successful transactions & saves */
  success: () => vibrate([10, 35, 12]),

  /** Warning vibration for deletion prompts */
  warning: () => vibrate(25),

  /** Distinct pulse for errors or invalid inputs */
  error: () => vibrate([20, 40, 20]),
}


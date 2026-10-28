import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { canVibrate, vibrate, haptic } from '../src/lib/haptics.js'

describe('haptics utility', () => {
  const originalVibrate = navigator.vibrate

  beforeEach(() => {
    navigator.vibrate = vi.fn().mockReturnValue(true)
  })

  afterEach(() => {
    navigator.vibrate = originalVibrate
  })

  it('detects when vibrate API is supported', () => {
    expect(canVibrate()).toBe(true)
  })

  it('triggers vibrate with given pattern', () => {
    vibrate(10)
    expect(navigator.vibrate).toHaveBeenCalledWith(10)
  })

  it('provides semantic helper methods', () => {
    haptic.tap()
    expect(navigator.vibrate).toHaveBeenCalledWith(10)

    haptic.selection()
    expect(navigator.vibrate).toHaveBeenCalledWith(6)

    haptic.success()
    expect(navigator.vibrate).toHaveBeenCalledWith([10, 35, 12])

    haptic.warning()
    expect(navigator.vibrate).toHaveBeenCalledWith(25)

    haptic.error()
    expect(navigator.vibrate).toHaveBeenCalledWith([20, 40, 20])
  })

  it('safely handles environments without navigator.vibrate', () => {
    navigator.vibrate = undefined
    expect(canVibrate()).toBe(false)
    expect(vibrate(10)).toBe(false)
  })

  it('safely catches errors thrown by navigator.vibrate', () => {
    navigator.vibrate = vi.fn().mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(vibrate(10)).toBe(false)
  })
})


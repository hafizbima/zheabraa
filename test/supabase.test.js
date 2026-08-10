import { describe, it, expect } from 'vitest'
import { channelName } from '../src/store/backends/supabase.js'

describe('supabase channel names', () => {
  const uid = 'u123'

  it('are unique per table and uid', () => {
    expect(channelName('wallets', uid)).toBe('gmm-wallets-u123')
    expect(channelName('months', uid)).toBe('gmm-months-u123')
    expect(channelName('categories', uid)).toBe('gmm-categories-u123')
    expect(channelName('transactions', uid)).toBe('gmm-transactions-u123')
  })

  it('include the month scope so two months never collide', () => {
    expect(channelName('categories', uid, '2026-08')).toBe('gmm-categories-u123-2026-08')
    expect(channelName('categories', uid, '2026-09')).toBe('gmm-categories-u123-2026-09')
    expect(channelName('transactions', uid, '2026-08')).toBe('gmm-transactions-u123-2026-08')
  })

  it('scope-less and scoped channels for the same table never collide', () => {
    const names = new Set([
      channelName('months', uid),
      channelName('categories', uid, '2026-08'),
      channelName('categories', uid, '2026-09'),
    ])
    expect(names.size).toBe(3)
  })
})

import { describe, expect, it } from 'vitest'
import { buildSpendingInsights } from '../src/lib/insights.js'

describe('spending insights', () => {
  it('finds the top category, monthly increase, and weekend pattern', () => {
    const months = {
      '2026-09': {
        categories: [{ id: 'food-old', key: 'food', name: 'Makan', color: '#f00' }],
        transactions: [
          { type: 'expense', categoryId: 'food-old', amount: 50000, date: '2026-09-05' },
          { type: 'expense', categoryId: 'food-old', amount: 30000, date: '2026-09-06' },
        ],
      },
      '2026-10': {
        categories: [
          { id: 'food-new', key: 'food', name: 'Makan', color: '#f00' },
          { id: 'travel', key: 'travel', name: 'Jalan-jalan', color: '#00f' },
        ],
        transactions: [
          { type: 'expense', categoryId: 'food-new', amount: 100000, date: '2026-10-03' },
          { type: 'expense', categoryId: 'travel', amount: 80000, date: '2026-10-04' },
          { type: 'expense', categoryId: 'travel', amount: 20000, date: '2026-10-12' },
        ],
      },
    }

    const insights = buildSpendingInsights(months, ['2026-09', '2026-10'])
    expect(insights[0]).toMatchObject({ type: 'top-category', key: 'food', amount: 180000 })
    expect(insights).toContainEqual(expect.objectContaining({ type: 'category-increase', key: 'travel', increase: 100000 }))
    expect(insights).toContainEqual(expect.objectContaining({ type: 'weekend-pattern' }))
  })
})

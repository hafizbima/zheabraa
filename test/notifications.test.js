import { describe, expect, it } from 'vitest'
import { notificationCandidates } from '../src/lib/notifications.js'

describe('notification candidates', () => {
  it('creates reminders for near-term bills and budget warnings', () => {
    const referenceDate = new Date(2026, 9, 20)
    const month = {
      id: '2026-10',
      categories: [{ id: 'food', name: 'Makan', budgetAmount: 100000, color: '#f00' }],
      transactions: [{ type: 'expense', categoryId: 'food', amount: 95000 }],
    }
    const candidates = notificationCandidates({
      month,
      referenceDate,
      templates: [
        { id: 'internet', type: 'bill', dayOfMonth: 21, amount: 50000, description: 'Internet', active: true },
        { id: 'later', type: 'bill', dayOfMonth: 28, amount: 50000, description: 'Sewa', active: true },
      ],
    })
    expect(candidates).toContainEqual(expect.objectContaining({ id: 'bill-2026-10-internet' }))
    expect(candidates).toContainEqual(expect.objectContaining({ id: 'budget-2026-10-food' }))
    expect(candidates.find((candidate) => candidate.id === 'bill-2026-10-later')).toBeUndefined()
  })
})

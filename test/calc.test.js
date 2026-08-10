import { describe, it, expect } from 'vitest'
import {
  categoryUsed,
  categoryLeft,
  categoryStatus,
  totalIncome,
  totalInflow,
  totalAllocated,
  freeMoneySpent,
  freePool,
  freeLeft,
  monthLeftTotal,
  walletBalance,
} from '../src/lib/calc.js'

const walletA = { id: 'w1', name: 'Cash', openingBalance: 100000 }
const walletB = { id: 'w2', name: 'Bank', openingBalance: 50000 }

describe('calc', () => {
  it('category used = expenses - refunds for the category', () => {
    const txs = [
      { categoryId: 'c1', type: 'expense', amount: 25000 },
      { categoryId: 'c1', type: 'refund', amount: 10000 },
      { categoryId: 'c2', type: 'expense', amount: 90000 },
      { categoryId: null, type: 'expense', amount: 5000 },
    ]
    expect(categoryUsed('c1', txs)).toBe(15000)
    expect(categoryLeft({ id: 'c1', budgetAmount: 100000 }, txs)).toBe(85000)
  })

  it('refund adds back to category left and free money (final balance)', () => {
    const txs = [
      { categoryId: 'c1', type: 'expense', amount: 40000 },
      { categoryId: 'c1', type: 'refund', amount: 15000 },
    ]
    expect(categoryUsed('c1', txs)).toBe(25000)
    expect(categoryLeft({ id: 'c1', budgetAmount: 100000 }, txs)).toBe(75000)

    const month = {
      incomes: [{ id: 'i1', amount: 100000 }],
      carryOver: 0,
      categories: [],
      transactions: [
        { categoryId: null, type: 'expense', amount: 30000 },
        { categoryId: null, type: 'refund', amount: 12000 },
      ],
    }
    expect(freeMoneySpent(month.transactions)).toBe(18000)
    expect(freeLeft(month)).toBe(82000)
    expect(monthLeftTotal(month)).toBe(82000)
  })

  it('refund larger than spend does not show negative used', () => {
    const txs = [
      { categoryId: 'c1', type: 'expense', amount: 10000 },
      { categoryId: 'c1', type: 'refund', amount: 40000 },
    ]
    expect(categoryLeft({ id: 'c1', budgetAmount: 100000 }, txs)).toBe(130000)
    const { used, pct } = categoryStatus({ id: 'c1', budgetAmount: 100000 }, txs)
    expect(used).toBe(0)
    expect(pct).toBe(0)
  })

  it('free money = inflow - allocated, reduced by free expenses', () => {
    const month = {
      incomes: [{ id: 'i1', amount: 3191000 }],
      carryOver: 51406,
      categories: [
        { id: 'c1', budgetAmount: 2650000 },
        { id: 'c2', budgetAmount: 0 },
      ],
      transactions: [
        { categoryId: null, type: 'expense', amount: 25000 },
        { categoryId: null, type: 'refund', amount: 10000 },
        { categoryId: 'c1', type: 'expense', amount: 50000 },
      ],
    }
    expect(totalIncome(month)).toBe(3191000)
    expect(totalInflow(month)).toBe(3242406)
    expect(totalAllocated(month)).toBe(2650000)
    expect(freePool(month)).toBe(592406)
    expect(freeMoneySpent(month.transactions)).toBe(15000)
    expect(freeLeft(month)).toBe(577406)
    expect(monthLeftTotal(month)).toBe(2600000 + 577406)
  })

  it('wallet balance = opening + refunds - expenses for that wallet only', () => {
    const txs = [
      { walletId: 'w1', type: 'expense', amount: 20000 },
      { walletId: 'w1', type: 'refund', amount: 5000 },
      { walletId: 'w2', type: 'expense', amount: 40000 },
      { walletId: null, type: 'expense', amount: 99999 },
    ]
    expect(walletBalance(walletA, txs)).toBe(100000 - 20000 + 5000)
    expect(walletBalance(walletB, txs)).toBe(50000 - 40000)
  })

  it('refund adds to wallet, does not touch other wallets', () => {
    const txs = [{ walletId: 'w2', type: 'refund', amount: 15000 }]
    expect(walletBalance(walletA, txs)).toBe(100000)
    expect(walletBalance(walletB, txs)).toBe(65000)
  })
})

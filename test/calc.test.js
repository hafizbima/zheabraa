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
  singleWalletBalance,
  goalSaved,
  carryOverAmount,
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

  it('transfer moves money between wallets (source out, dest in)', () => {
    const txs = [
      { walletId: 'w1', toWalletId: 'w2', type: 'transfer', amount: 30000 },
      { walletId: 'w1', type: 'expense', amount: 10000 },
    ]
    expect(walletBalance(walletA, txs)).toBe(100000 - 30000 - 10000)
    expect(walletBalance(walletB, txs)).toBe(50000 + 30000)
  })

  it('singleWalletBalance credits income and counts untracked (null walletId) txs', () => {
    const primary = { id: 'w1', name: 'Rekening Utama', openingBalance: 0 }
    const months = {
      '2026-08': {
        incomes: [{ id: 'i1', amount: 1000000 }],
        transactions: [{ walletId: 'w1', type: 'expense', amount: 200000 }],
      },
      '2026-09': {
        incomes: [{ id: 'i2', amount: 500000 }],
        transactions: [
          { walletId: null, type: 'expense', amount: 75000 },
          { walletId: 'w1', type: 'refund', amount: 10000 },
        ],
      },
    }
    // 1jt + 500rb income - 200rb - 75rb (untracked dianggap rekening) + 10rb refund
    expect(singleWalletBalance(primary, months)).toBe(1000000 + 500000 - 200000 - 75000 + 10000)
  })

  it('singleWalletBalance ignores wallets that are not the primary', () => {
    const primary = { id: 'w1', name: 'Rekening Utama', openingBalance: 100000 }
    const months = {
      '2026-08': {
        incomes: [],
        transactions: [
          { walletId: 'w2', type: 'expense', amount: 50000 },
          { walletId: 'w1', type: 'expense', amount: 10000 },
        ],
      },
    }
    expect(singleWalletBalance(primary, months)).toBe(100000 - 10000)
  })

  it('transfer does not affect pocket or free money', () => {
    const month = {
      incomes: [{ id: 'i1', amount: 100000 }],
      carryOver: 0,
      categories: [{ id: 'c1', budgetAmount: 50000 }],
      transactions: [
        { categoryId: null, type: 'transfer', amount: 30000, walletId: 'w1', toWalletId: 'w2' },
      ],
    }
    expect(freeMoneySpent(month.transactions)).toBe(0)
    expect(freeLeft(month)).toBe(50000)
    expect(categoryUsed('c1', month.transactions)).toBe(0)
    expect(categoryLeft({ id: 'c1', budgetAmount: 50000 }, month.transactions)).toBe(50000)
    expect(monthLeftTotal(month)).toBe(100000)
  })

  it('goalSaved = savedAmount + sisa budget bulan ini', () => {
    const cat = { id: 'c1', goalAmount: 1000000, savedAmount: 600000, budgetAmount: 200000 }
    const txs = [
      { categoryId: 'c1', type: 'expense', amount: 50000 },
      { categoryId: 'c1', type: 'expense', amount: 100000 },
      { categoryId: null, type: 'expense', amount: 99999 }, // uang bebas, bukan pocket
    ]
    const g = goalSaved(cat, txs)
    expect(g.saved).toBe(600000 + 50000) // sisa budget = 200k - 150k = 50k
    expect(g.goal).toBe(1000000)
    expect(g.done).toBe(false)
    // over target
    const g2 = goalSaved({ ...cat, savedAmount: 990000 }, txs)
    expect(g2.done).toBe(true)
  })

  it('goalSaved > goal tetap dilaporkan (terus menabung)', () => {
    const cat = { id: 'c1', goalAmount: 100000, savedAmount: 120000, budgetAmount: 0 }
    const g = goalSaved(cat, [])
    expect(g.saved).toBe(120000)
    expect(g.done).toBe(true)
    expect(g.pct).toBe(100)
  })

  it('carryOverAmount tidak menghitung kategori bertarget (tabungan dipisah)', () => {
    const month = {
      incomes: [{ id: 'i1', amount: 1000000 }],
      carryOver: 0,
      categories: [
        { id: 'c1', goalAmount: 1000000, budgetAmount: 500000 }, // tabungan — tidak masuk carry
        { id: 'c2', budgetAmount: 300000 },
      ],
      transactions: [
        { categoryId: 'c1', type: 'expense', amount: 100000 },
        { categoryId: 'c2', type: 'expense', amount: 50000 },
        { categoryId: null, type: 'expense', amount: 20000 },
      ],
    }
    // sisa c2 = 300k-50k = 250k; uang bebas = 1jt - 800k - 20k = 180k
    expect(carryOverAmount(month)).toBe(250000 + 180000)
    // bandingkan dengan monthLeftTotal (yang masih menghitung tabungan c1)
    expect(monthLeftTotal(month)).toBe(250000 + 400000 + 180000)
  })
})

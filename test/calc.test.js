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
  daysRemainingInMonth,
  plannedFreeBills,
  isRecurringBillPaid,
  safeDailySpend,
  goalPlan,
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
      carryOver: 0,
      categories: [],
      transactions: [
        { categoryId: null, type: 'income', amount: 100000, date: '2026-08-01' },
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
      carryOver: 51406,
      categories: [
        { id: 'c1', budgetAmount: 2650000 },
        { id: 'c2', budgetAmount: 0 },
      ],
      transactions: [
        { categoryId: null, type: 'income', amount: 3191000, date: '2026-08-01' },
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

  it('singleWalletBalance credits income (transaksi) and counts untracked (null walletId) txs', () => {
    const primary = { id: 'w1', name: 'Rekening Utama', openingBalance: 0 }
    const months = {
      '2026-08': {
        transactions: [
          { walletId: 'w1', type: 'income', amount: 1000000, date: '2026-08-01' },
          { walletId: 'w1', type: 'expense', amount: 200000 },
        ],
      },
      '2026-09': {
        transactions: [
          { walletId: null, type: 'income', amount: 500000, date: '2026-09-01' },
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
      carryOver: 0,
      categories: [{ id: 'c1', budgetAmount: 50000 }],
      transactions: [
        { categoryId: null, type: 'income', amount: 100000, date: '2026-08-01' },
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
      carryOver: 0,
      categories: [
        { id: 'c1', goalAmount: 1000000, budgetAmount: 500000 }, // tabungan — tidak masuk carry
        { id: 'c2', budgetAmount: 300000 },
      ],
      transactions: [
        { categoryId: null, type: 'income', amount: 1000000, date: '2026-08-01' },
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

  it('menghitung hari tersisa termasuk hari ini dan menangani bulan lampau/depan', () => {
    const reference = new Date(2026, 1, 10) // 10 Februari 2026
    expect(daysRemainingInMonth('2026-02', reference)).toBe(19)
    expect(daysRemainingInMonth('2026-01', reference)).toBe(0)
    expect(daysRemainingInMonth('2026-03', reference)).toBe(31)
  })

  it('menghitung batas aman uang bebas per hari tanpa menghasilkan angka negatif', () => {
    const month = {
      id: '2026-02',
      carryOver: 0,
      categories: [],
      transactions: [
        { type: 'income', amount: 190000, date: '2026-02-01' },
        { type: 'expense', amount: 10000, categoryId: null },
      ],
    }
    const plan = safeDailySpend(month, new Date(2026, 1, 10))
    expect(plan.left).toBe(180000)
    expect(plan.daysRemaining).toBe(19)
    expect(plan.amount).toBe(Math.floor(180000 / 19))

    const overdrawn = safeDailySpend({ ...month, transactions: [...month.transactions, { type: 'expense', amount: 200000, categoryId: null }] }, referenceDate())
    expect(overdrawn.amount).toBe(0)
  })

  it('menyisihkan tagihan Uang Bebas yang belum dibuat sebagai transaksi', () => {
    const month = {
      id: '2026-02',
      carryOver: 0,
      categories: [{ id: 'c1', budgetAmount: 100000 }],
      transactions: [
        { type: 'income', amount: 500000, date: '2026-02-01' },
        { type: 'expense', amount: 50000, categoryId: null },
        { id: 'recur-paid-2026-02-05', type: 'expense', amount: 25000, categoryId: null },
      ],
    }
    const templates = [
      { id: 'future', type: 'bill', amount: 75000, dayOfMonth: 20, categoryId: null, active: true },
      { id: 'paid', type: 'bill', amount: 25000, dayOfMonth: 5, categoryId: null, active: true },
      { id: 'pocket', type: 'bill', amount: 90000, dayOfMonth: 20, categoryId: 'c1', active: true },
      { id: 'skipped', type: 'bill', amount: 60000, dayOfMonth: 20, categoryId: null, active: true, skipMonths: ['2026-02'] },
    ]
    const reference = new Date(2026, 1, 10)

    expect(plannedFreeBills(month, templates, reference)).toBe(75000)
    const plan = safeDailySpend(month, templates, reference)
    expect(plan.left).toBe(325000)
    expect(plan.plannedBills).toBe(75000)
    expect(plan.discretionaryLeft).toBe(250000)
    expect(plan.amount).toBe(Math.floor(250000 / 19))
  })

  it('mengenali pembayaran tagihan yang ditautkan ke template', () => {
    const template = { id: 'bill-1', type: 'bill', dayOfMonth: 20, amount: 75000 }
    const month = {
      id: '2026-02',
      transactions: [{ id: 'tx-1', recurringTemplateId: 'bill-1', type: 'expense', amount: 75000 }],
    }
    expect(isRecurringBillPaid(month, template)).toBe(true)
    expect(isRecurringBillPaid({ ...month, transactions: [] }, template)).toBe(false)
  })

  it('menghitung kebutuhan tabungan bulanan sampai deadline', () => {
    const category = {
      id: 'trip',
      goalAmount: 1000000,
      savedAmount: 200000,
      budgetAmount: 100000,
      goalDeadline: '2026-12-15',
    }
    const plan = goalPlan(category, [], '2026-10', new Date(2026, 9, 27))
    expect(plan.saved).toBe(300000)
    expect(plan.needed).toBe(700000)
    expect(plan.monthsRemaining).toBe(3)
    expect(plan.monthlyAmount).toBe(233334)
    expect(plan.overdue).toBe(false)
  })
})

function referenceDate() {
  return new Date(2026, 1, 10)
}

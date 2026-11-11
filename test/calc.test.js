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
  savingsSummary,
  goalHistory,
  goalProjection,
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

  it('savingsSummary merangkum seluruh target tabungan dengan urutan yang tepat', () => {
    const months = {
      '2026-11': {
        categories: [
          { id: 'c1', key: 'laptop', name: 'Laptop Baru', goalAmount: 10000000, savedAmount: 4000000, budgetAmount: 1000000, goalDeadline: '2027-04-01' },
          { id: 'c2', key: 'liburan', name: 'Liburan Bali', goalAmount: 3000000, savedAmount: 3000000, budgetAmount: 0 },
          { id: 'c3', key: 'darurat', name: 'Dana Darurat', goalAmount: 5000000, savedAmount: 1000000, budgetAmount: 500000, goalDeadline: '2026-12-01' },
          { id: 'c4', key: 'makan', name: 'Makan', budgetAmount: 500000 },
        ],
        transactions: [
          { id: 't1', categoryId: 'c1', type: 'expense', amount: 200000 },
        ],
      },
    }

    const summary = savingsSummary(months, '2026-11')
    expect(summary.goals.length).toBe(3)
    // Dana Darurat (deadline 2026-12-01) should come before Laptop Baru (deadline 2027-04-01)
    expect(summary.goals[0].name).toBe('Dana Darurat')
    expect(summary.goals[1].name).toBe('Laptop Baru')
    // Liburan Bali is already reached (3jt / 3jt), so it comes last
    expect(summary.goals[2].name).toBe('Liburan Bali')
    expect(summary.reachedCount).toBe(1)
    // Saved: c1 = 4jt + (1jt - 200rb) = 4.8jt. c2 = 3jt. c3 = 1jt + 500rb = 1.5jt. Total = 9.3jt
    expect(summary.totalSaved).toBe(9300000)
    // Target: 10jt + 3jt + 5jt = 18jt
    expect(summary.totalTarget).toBe(18000000)
    expect(summary.pct).toBe(52)
  })

  it('goalHistory melacak riwayat setor dan tarik lintas bulan', () => {
    const months = {
      '2026-10': {
        categories: [{ id: 'c1', key: 'laptop', name: 'Laptop' }],
        transactions: [
          { id: 'tx-1', date: '2026-10-15', description: 'Menabung ke Laptop', amount: 500000, type: 'expense', categoryId: null },
        ],
      },
      '2026-11': {
        categories: [{ id: 'c1', key: 'laptop', name: 'Laptop' }],
        transactions: [
          { id: 'tx-2', date: '2026-11-02', description: '[goal:laptop] Setor rutin', amount: 1000000, type: 'expense', categoryId: null, goalType: 'deposit' },
          { id: 'tx-3', date: '2026-11-05', description: 'Pakai tabungan Laptop', amount: 300000, type: 'expense', categoryId: 'c1' },
        ],
      },
    }

    const hist = goalHistory('laptop', months)
    expect(hist.length).toBe(3)
    expect(hist[0].id).toBe('tx-3')
    expect(hist[0].type).toBe('withdraw')
    expect(hist[1].id).toBe('tx-2')
    expect(hist[1].type).toBe('deposit')
    expect(hist[2].id).toBe('tx-1')
    expect(hist[2].type).toBe('deposit')
  })

  it('goalProjection memproyeksikan estimasi bulan tercapai berdasarkan 3 bulan terakhir', () => {
    const months = {
      '2026-09': {
        categories: [{ id: 'c1', key: 'gadget', name: 'Gadget', goalAmount: 3000000, savedAmount: 0 }],
        transactions: [
          { id: 't1', date: '2026-09-10', description: 'Menabung ke Gadget', amount: 500000, type: 'expense' },
        ],
      },
      '2026-10': {
        categories: [{ id: 'c1', key: 'gadget', name: 'Gadget', goalAmount: 3000000, savedAmount: 500000 }],
        transactions: [
          { id: 't2', date: '2026-10-10', description: 'Menabung ke Gadget', amount: 500000, type: 'expense' },
        ],
      },
      '2026-11': {
        categories: [{ id: 'c1', key: 'gadget', name: 'Gadget', goalAmount: 3000000, savedAmount: 1000000, budgetAmount: 0 }],
        transactions: [
          { id: 't3', date: '2026-11-05', description: 'Menabung ke Gadget', amount: 500000, type: 'expense' },
        ],
      },
    }

    const proj = goalProjection('gadget', months, '2026-11')
    expect(proj).not.toBeNull()
    // Saved is 1000000 (savedAmount). Needed = 3000000 - 1000000 = 2000000.
    expect(proj.needed).toBe(2000000)
    // 3 months sum: 500rb + 500rb + 500rb = 1.5jt. Avg: 500rb/bln
    expect(proj.avgMonthlyDeposit).toBe(500000)
    // Needed: 2jt / 500rb = 4 months
    expect(proj.monthsNeeded).toBe(4)
    // 2026-11 + 4 months = 2027-03
    expect(proj.estimatedMonthId).toBe('2027-03')
  })

  it('categoryUsed tidak menganggap goalType deposit sebagai belanja pocket, dan freeMoneySpent menghitungnya', () => {
    const txs = [
      { id: 't1', categoryId: 'saving-1', type: 'expense', amount: 200000, goalType: 'deposit', walletId: 'w1' },
      { id: 't2', categoryId: 'saving-1', type: 'expense', amount: 50000, goalType: 'withdraw', walletId: 'w1' },
    ]
    expect(categoryUsed('saving-1', txs)).toBe(50000)
    expect(freeMoneySpent(txs)).toBe(200000)
  })

  it('savingsSummary menyertakan walletId pada setiap target tabungan', () => {
    const months = {
      '2026-11': {
        categories: [
          { id: 's1', name: 'Dana Darurat', goalAmount: 10000000, savedAmount: 2000000, walletId: 'w-mandiri', pocketType: 'saving' },
        ],
        transactions: [],
      },
    }
    const res = savingsSummary(months, '2026-11')
    expect(res.goals[0].walletId).toBe('w-mandiri')
  })
  it('freeMoneySpent tetap menghitung setoran tabungan meskipun goalType hilang (setelah sync DB)', () => {
    const txs = [
      { id: 't1', categoryId: 'saving-1', type: 'expense', amount: 300000, description: 'Menabung ke Dana Darurat' },
      { id: 't2', categoryId: 'saving-2', type: 'expense', amount: 200000, description: 'Setor bulanan [goal-deposit]' },
      { id: 't3', categoryId: 'belanja-1', type: 'expense', amount: 150000, description: 'Beli baju' },
    ]
    // t1 dan t2 adalah setoran tabungan (mengurangi uang bebas), t3 belanja pocket biasa
    expect(freeMoneySpent(txs)).toBe(500000)
    expect(categoryUsed('saving-1', txs)).toBe(0)
    expect(categoryUsed('belanja-1', txs)).toBe(150000)
  })

  it('walletBalance dan singleWalletBalance menambah saldo dompet saat penarikan tabungan (withdraw)', () => {
    const wallet = { id: 'w1', openingBalance: 1000000 }
    const txs = [
      { id: 't1', walletId: 'w1', type: 'expense', amount: 400000, description: 'Menabung ke Laptop [goal-deposit]' },
      { id: 't2', walletId: 'w1', type: 'expense', amount: 100000, description: 'Tarik tabungan Laptop [goal-withdraw]' },
    ]
    // Opening: 1jt. Setor: -400rb. Tarik: +100rb. Saldo akhir = 700rb
    expect(walletBalance(wallet, txs)).toBe(700000)

    const months = {
      '2026-11': { transactions: txs }
    }
    expect(singleWalletBalance(wallet, months)).toBe(700000)
  })
})

function referenceDate() {
  return new Date(2026, 1, 10)
}

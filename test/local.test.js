import { describe, it, expect, beforeEach } from 'vitest'
import * as local from '../src/store/backends/local.js'

function getDetail(mId) {
  let data = null
  const unsub = local.subscribeMonthDetail('u1', mId, (d) => {
    data = d
  })
  unsub()
  return data || { categories: [], transactions: [] }
}

beforeEach(() => {
  local.reset()
})

describe('recurring templates (local backend)', () => {
  it('generates recurring expense transactions for current and future months', async () => {
    local.ensureMonth('u1', '2026-08')
    await local.addTemplate('u1', {
      id: 't1',
      dayOfMonth: 5,
      amount: 50000,
      categoryId: null,
      walletId: null,
      description: 'Bayar Kos',
      active: true,
      createdAt: Date.now(),
    })
    await local.applyRecurring('u1', '2026-08')
    local.ensureMonth('u1', '2026-09')

    const aug = getDetail('2026-08').transactions
    const sep = getDetail('2026-09').transactions
    const a = aug.find((t) => t.id === 'recur-t1-2026-08-05')
    const s = sep.find((t) => t.id === 'recur-t1-2026-09-05')
    expect(a).toBeTruthy()
    expect(a.amount).toBe(50000)
    expect(a.type).toBe('expense')
    expect(a.description).toBe('Bayar Kos')
    expect(s).toBeTruthy()
    expect(s.date).toBe('2026-09-05')
  })

  it('skips inactive templates and clamps day to 1..28', async () => {
    local.ensureMonth('u1', '2026-09')
    await local.addTemplate('u1', {
      id: 't-off',
      dayOfMonth: 31,
      amount: 10000,
      description: 'Nonaktif',
      active: false,
      createdAt: Date.now(),
    })
    await local.addTemplate('u1', {
      id: 't-on',
      dayOfMonth: 31,
      amount: 20000,
      description: 'Clamp',
      active: true,
      createdAt: Date.now(),
    })
    await local.applyRecurring('u1', '2026-09')

    const txs = getDetail('2026-09').transactions
    expect(txs.find((t) => t.id.includes('t-off'))).toBeUndefined()
    const clamped = txs.find((t) => t.id.includes('t-on'))
    expect(clamped).toBeTruthy()
    expect(clamped.date).toBe('2026-09-28')
  })

  it('applyRecurring is idempotent (does not duplicate)', async () => {
    local.ensureMonth('u1', '2026-09')
    await local.addTemplate('u1', {
      id: 't1',
      dayOfMonth: 10,
      amount: 30000,
      description: 'Tagihan',
      active: true,
      createdAt: Date.now(),
    })
    await local.applyRecurring('u1', '2026-09')
    await local.applyRecurring('u1', '2026-09')

    const txs = getDetail('2026-09').transactions
    expect(txs.filter((t) => t.id === 'recur-t1-2026-09-10')).toHaveLength(1)
  })

  it('generates recurring for existing months when subscribed (not only at creation)', async () => {
    local.ensureMonth('u1', '2026-09')
    await local.addTemplate('u1', {
      id: 't1',
      dayOfMonth: 3,
      amount: 40000,
      description: 'Sewa',
      active: true,
      createdAt: Date.now(),
    })

    let detail = null
    const unsub = local.subscribeMonthDetail('u1', '2026-09', (d) => {
      detail = d
    })
    unsub()

    const rec = detail.transactions.find((t) => t.id === 'recur-t1-2026-09-03')
    expect(rec).toBeTruthy()
    expect(rec.amount).toBe(40000)
  })

  it('generates recurring income into month.incomes, idempotently', async () => {
    local.ensureMonth('u1', '2026-09')
    await local.addTemplate('u1', {
      id: 't-inc',
      type: 'income',
      dayOfMonth: 1,
      amount: 15000000,
      categoryId: null,
      walletId: null,
      description: 'Gaji',
      active: true,
      createdAt: Date.now(),
    })
    await local.applyRecurring('u1', '2026-09')
    await local.applyRecurring('u1', '2026-09')

    let months = null
    const unsub = local.subscribeMonths('u1', (ms) => {
      months = ms
    })
    unsub()
    const incs = months.find((m) => m.id === '2026-09').incomes.filter((i) => i.id === 'recur-t-inc-2026-09')
    expect(incs).toHaveLength(1)
    expect(incs[0].label).toBe('Gaji')
    expect(incs[0].amount).toBe(15000000)
    expect(getDetail('2026-09').transactions).toHaveLength(0)
  })

  it('generates recurring transfer transactions with from/to wallets', async () => {
    local.ensureMonth('u1', '2026-09')
    await local.addTemplate('u1', {
      id: 't-tr',
      type: 'transfer',
      dayOfMonth: 10,
      amount: 200000,
      categoryId: null,
      walletId: 'w1',
      toWalletId: 'w2',
      description: 'Tabungan',
      active: true,
      createdAt: Date.now(),
    })
    await local.applyRecurring('u1', '2026-09')
    const txs = getDetail('2026-09').transactions
    const t = txs.find((x) => x.id === 'recur-t-tr-2026-09-10')
    expect(t).toBeTruthy()
    expect(t.type).toBe('transfer')
    expect(t.walletId).toBe('w1')
    expect(t.toWalletId).toBe('w2')
    expect(t.amount).toBe(200000)
  })
})

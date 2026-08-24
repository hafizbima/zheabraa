export function categoryUsed(categoryId, transactions) {
  let expense = 0
  let refund = 0
  for (const t of transactions) {
    if (t.categoryId !== categoryId) continue
    if (t.type === 'refund') refund += t.amount || 0
    else if (t.type === 'expense') expense += t.amount || 0
  }
  return expense - refund
}

export function categoryLeft(category, transactions) {
  return (category.budgetAmount || 0) - categoryUsed(category.id, transactions)
}

export function totalIncome(month) {
  return (month.incomes || []).reduce((a, i) => a + (i.amount || 0), 0)
}

export function totalInflow(month) {
  return totalIncome(month) + (month.carryOver || 0)
}

export function totalAllocated(month) {
  return (month.categories || []).reduce((a, c) => a + (c.budgetAmount || 0), 0)
}

export function freeMoneySpent(transactions) {
  let expense = 0
  let refund = 0
  for (const t of transactions) {
    if (t.categoryId != null) continue
    if (t.type === 'refund') refund += t.amount || 0
    else if (t.type === 'expense') expense += t.amount || 0
  }
  return expense - refund
}

export function freePool(month) {
  return totalInflow(month) - totalAllocated(month)
}

export function freeLeft(month) {
  return freePool(month) - freeMoneySpent(month.transactions || [])
}

export function categorySpentTotal(transactions) {
  return transactions
    .filter((t) => t.categoryId != null && t.type === 'expense')
    .reduce((a, t) => a + (t.amount || 0), 0)
}

export function monthLeftTotal(month) {
  const txs = month.transactions || []
  const catLeft = (month.categories || []).reduce(
    (a, c) => a + categoryLeft(c, txs),
    0,
  )
  return catLeft + freeLeft(month)
}

export function walletBalance(wallet, allTransactions) {
  let inflow = 0
  let outflow = 0
  for (const tx of allTransactions) {
    if (tx.type === 'transfer') {
      if (tx.walletId === wallet.id) outflow += tx.amount || 0
      if (tx.toWalletId === wallet.id) inflow += tx.amount || 0
      continue
    }
    if (tx.walletId !== wallet.id) continue
    if (tx.type === 'refund') inflow += tx.amount || 0
    else outflow += tx.amount || 0
  }
  return (wallet.openingBalance || 0) + inflow - outflow
}

// ponytail: 1 rekening → transaksi tanpa walletId dianggap milik rekening utama (fallback untuk data lama)
export function walletBalanceSingle(wallet, allTransactions) {
  let inflow = 0
  let outflow = 0
  for (const tx of allTransactions) {
    if (tx.type === 'transfer') {
      // transfer di mode single praktis tidak ada, tapi tetap handle
      const from = tx.walletId ?? wallet.id
      const to = tx.toWalletId ?? wallet.id
      if (from === wallet.id) outflow += tx.amount || 0
      if (to === wallet.id) inflow += tx.amount || 0
      continue
    }
    const wid = tx.walletId ?? wallet.id
    if (wid !== wallet.id) continue
    if (tx.type === 'refund') inflow += tx.amount || 0
    else outflow += tx.amount || 0
  }
  return (wallet.openingBalance || 0) + inflow - outflow
}

export function allTransactions(months) {
  return Object.values(months).flatMap((m) => m.transactions || [])
}

export function categoryStatus(category, transactions) {
  const budget = category.budgetAmount || 0
  const used = Math.max(0, categoryUsed(category.id, transactions))
  if (budget <= 0) return { used, budget, status: 'none', pct: 0 }
  const pct = Math.max(0, Math.min(100, Math.round((used / budget) * 100)))
  const status = used > budget ? 'over' : used >= budget * 0.8 ? 'warn' : 'ok'
  return { used, budget, status, pct }
}

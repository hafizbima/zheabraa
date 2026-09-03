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

// carry-over bulan berikutnya: kategori biasa (bukan tabungan) + uang bebas
export function carryOverAmount(month) {
  const txs = month.transactions || []
  const catLeft = (month.categories || [])
    .filter((c) => !(c.goalAmount > 0))
    .reduce((a, c) => a + categoryLeft(c, txs), 0)
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

// Mode 1 rekening: semua uang ada di satu dompet → transaksi tanpa walletId,
// income bulan (month.incomes) ikut mengkredit saldo rekening.
export function singleWalletBalance(wallet, months) {
  let inflow = 0
  let outflow = 0
  for (const tx of allTransactions(months)) {
    if (tx.type === 'transfer') {
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
  const income = Object.values(months).reduce((a, m) => a + totalIncome(m), 0)
  return (wallet.openingBalance || 0) + inflow - outflow + income
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

// Tabungan: saldo terkumpul = savedAmount (bulan lalu) + (budget − used bulan ini)
export function goalSaved(category, transactions) {
  const saved = (category.savedAmount || 0) + Math.max(0, (category.budgetAmount || 0) - Math.max(0, categoryUsed(category.id, transactions)))
  const goal = category.goalAmount || 0
  return { saved, goal, pct: goal > 0 ? Math.min(100, Math.round((saved / goal) * 100)) : 0, done: goal > 0 && saved >= goal }
}

export function categoryUsed(categoryId, transactions) {
  return transactions
    .filter((t) => t.categoryId === categoryId && t.type === 'expense')
    .reduce((a, t) => a + (t.amount || 0), 0)
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
  return transactions
    .filter((t) => t.categoryId == null && t.type === 'expense')
    .reduce((a, t) => a + (t.amount || 0), 0)
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
    if (tx.walletId !== wallet.id) continue
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
  const used = categoryUsed(category.id, transactions)
  if (budget <= 0) return { used, budget, status: 'none', pct: 0 }
  const pct = Math.min(100, Math.round((used / budget) * 100))
  const status = used > budget ? 'over' : used >= budget * 0.8 ? 'warn' : 'ok'
  return { used, budget, status, pct }
}

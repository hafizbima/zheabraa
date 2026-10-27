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

// income = transaksi type='income' (satu sumber kebenaran, masuk Riwayat native)
export function totalIncome(month) {
  return (month.transactions || [])
    .filter((t) => t.type === 'income')
    .reduce((a, t) => a + (t.amount || 0), 0)
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

// Jumlah hari yang masih tersedia untuk membelanjakan uang bebas.
// Hari ini ikut dihitung karena freeLeft sudah mencerminkan transaksi hari ini.
export function daysRemainingInMonth(monthId, referenceDate = new Date()) {
  if (!monthId || !/^\d{4}-\d{2}$/.test(monthId)) return 0
  const [year, month] = monthId.split('-').map(Number)
  const currentId = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`

  if (monthId < currentId) return 0
  if (monthId > currentId) return new Date(year, month, 0).getDate()
  return new Date(year, month, 0).getDate() - referenceDate.getDate() + 1
}

function recurringDay(template) {
  return Math.min(28, Math.max(1, template.dayOfMonth || 1))
}

export function isRecurringBillPaid(month, template) {
  if (!month?.id || !template?.id) return false
  const day = recurringDay(template)
  const generatedId = `recur-${template.id}-${month.id}-${String(day).padStart(2, '0')}`
  return (month.transactions || []).some(
    (tx) => tx.id === generatedId || tx.recurringTemplateId === template.id,
  )
}

// Tagihan yang memakai Uang Bebas belum mengurangi freeLeft sebelum dibuat.
// Tagihan yang sudah digenerate sebagai transaksi tidak dihitung dua kali.
export function plannedFreeBills(month, templates = [], referenceDate = new Date()) {
  if (!month?.id) return 0
  const currentId = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, '0')}`

  return templates
    .filter((template) => template.type === 'bill' && template.active !== false && template.categoryId == null)
    .filter((template) => !(template.skipMonths || []).includes(month.id))
    .filter(() => month.id >= currentId)
    .filter((template) => !isRecurringBillPaid(month, template))
    .reduce((total, template) => total + (template.amount || 0), 0)
}

export function safeDailySpend(month, templates = [], referenceDate = new Date()) {
  // Backward-compatible form: safeDailySpend(month, referenceDate)
  if (templates instanceof Date) {
    referenceDate = templates
    templates = []
  }
  if (!Array.isArray(templates)) templates = []
  const daysRemaining = daysRemainingInMonth(month?.id, referenceDate)
  const left = freeLeft(month || {})
  const plannedBills = plannedFreeBills(month, templates, referenceDate)
  const discretionaryLeft = left - plannedBills
  return {
    amount: daysRemaining > 0 ? Math.max(0, Math.floor(discretionaryLeft / daysRemaining)) : 0,
    daysRemaining,
    left,
    plannedBills,
    discretionaryLeft,
  }
}

export function categorySpentTotal(transactions) {
  return transactions
    .filter((t) => t.categoryId != null && t.type === 'expense')
    .reduce((a, t) => a + (t.amount || 0), 0)
}

// total uang tersisa bulan ini: carry pocket biasa + sisa uang bebas + seluruh tabungan
// (tabungan tetap "uang kamu" — tidak hilang hanya karena dialokasikan ke target)
export function monthLeftTotal(month) {
  const txs = month.transactions || []
  const catLeft = (month.categories || [])
    .filter((c) => !(c.goalAmount > 0))
    .reduce((a, c) => a + categoryLeft(c, txs), 0)
  const savings = (month.categories || []).reduce((a, c) => a + (c.goalAmount > 0 ? goalSaved(c, txs).saved : 0), 0)
  return catLeft + freeLeft(month) + savings
}

// carry-over bulan berikutnya: kategori biasa (bukan tabungan) + uang bebas
// (tabungan dibawa terpisah lewat savedAmount, jadi tidak masuk sini)
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
    if (tx.type === 'refund' || tx.type === 'income') inflow += tx.amount || 0
    else outflow += tx.amount || 0
  }
  return (wallet.openingBalance || 0) + inflow - outflow
}

// Mode 1 rekening: semua uang ada di satu dompet → transaksi tanpa walletId
// dianggap milik rekening utama (income kini transaksi type='income', bukan jsonb)
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
    if (tx.type === 'refund' || tx.type === 'income') inflow += tx.amount || 0
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

// Tabungan: saldo terkumpul = savedAmount (bulan lalu) + (budget − used bulan ini)
export function goalSaved(category, transactions) {
  const saved = (category.savedAmount || 0) + Math.max(0, (category.budgetAmount || 0) - Math.max(0, categoryUsed(category.id, transactions)))
  const goal = category.goalAmount || 0
  return { saved, goal, pct: goal > 0 ? Math.min(100, Math.round((saved / goal) * 100)) : 0, done: goal > 0 && saved >= goal }
}

export function goalPlan(category, transactions, currentMonthId, referenceDate = new Date()) {
  const progress = goalSaved(category, transactions)
  if (!progress.goal || !category.goalDeadline || !currentMonthId) return null

  const match = String(category.goalDeadline).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const current = String(currentMonthId).match(/^(\d{4})-(\d{2})$/)
  if (!match || !current) return null

  const targetMonth = new Date(Number(match[1]), Number(match[2]) - 1, 1)
  const currentMonth = new Date(Number(current[1]), Number(current[2]) - 1, 1)
  const monthsRemaining = (targetMonth.getFullYear() - currentMonth.getFullYear()) * 12 + targetMonth.getMonth() - currentMonth.getMonth() + 1
  const needed = Math.max(0, progress.goal - progress.saved)
  return {
    ...progress,
    needed,
    monthsRemaining,
    monthlyAmount: monthsRemaining > 0 ? Math.ceil(needed / monthsRemaining) : needed,
    overdue: monthsRemaining <= 0 && needed > 0,
  }
}

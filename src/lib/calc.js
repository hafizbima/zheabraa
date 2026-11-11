export function isGoalDeposit(tx) {
  if (!tx) return false
  if (tx.goalType === 'deposit') return true
  const desc = tx.description || ''
  return (
    desc.includes('[goal-deposit]') ||
    desc.startsWith('Menabung ke ') ||
    desc.startsWith('Setor ke ')
  )
}

export function isGoalWithdraw(tx) {
  if (!tx) return false
  if (tx.goalType === 'withdraw') return true
  const desc = tx.description || ''
  return (
    desc.includes('[goal-withdraw]') ||
    desc.startsWith('Pakai tabungan ') ||
    desc.startsWith('Tarik tabungan ')
  )
}

export function categoryUsed(categoryId, transactions) {
  let expense = 0
  let refund = 0
  for (const t of transactions) {
    if (t.categoryId !== categoryId) continue
    if (isGoalDeposit(t)) continue
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
    if (t.categoryId != null && !isGoalDeposit(t)) continue
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
    if (tx.type === 'refund' || tx.type === 'income' || isGoalWithdraw(tx)) inflow += tx.amount || 0
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
    if (tx.type === 'refund' || tx.type === 'income' || isGoalWithdraw(tx)) inflow += tx.amount || 0
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

// Ringkasan tabungan seluruh pocket bertarget
export function savingsSummary(months, currentMonthId) {
  if (!months || !currentMonthId || !months[currentMonthId]) {
    return { totalSaved: 0, totalTarget: 0, pct: 0, reachedCount: 0, goals: [] }
  }
  const m = months[currentMonthId]
  const cats = m.categories || []
  const txs = m.transactions || []

  const rawGoals = cats.filter((c) => (c.goalAmount && c.goalAmount > 0) || c.pocketType === 'saving')

  const goals = rawGoals.map((c) => {
    const progress = goalSaved(c, txs)
    const plan = goalPlan(c, txs, currentMonthId)
    return {
      category: c,
      key: c.key || c.name || c.id,
      id: c.id,
      name: c.name,
      color: c.color,
      walletId: c.walletId || null,
      saved: progress.saved,
      goal: progress.goal,
      pct: progress.pct,
      done: progress.done,
      deadline: c.goalDeadline || null,
      plan,
    }
  })

  // Urutan: belum tercapai di atas (deadline terdekat dulu), lalu tercapai
  goals.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (!a.done) {
      if (a.deadline && b.deadline) {
        return a.deadline.localeCompare(b.deadline)
      }
      if (a.deadline) return -1
      if (b.deadline) return 1
      return (b.goal || 0) - (a.goal || 0)
    }
    return (b.saved || 0) - (a.saved || 0)
  })

  const totalSaved = goals.reduce((sum, g) => sum + (g.saved || 0), 0)
  const totalTarget = goals.reduce((sum, g) => sum + (g.goal || 0), 0)
  const pct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0
  const reachedCount = goals.filter((g) => g.done).length

  return { totalSaved, totalTarget, pct, reachedCount, goals }
}

// Riwayat setor/tarik suatu target lintas bulan
export function goalHistory(goalKey, months) {
  if (!goalKey || !months) return []
  const history = []

  const monthIds = Object.keys(months)

  for (const mId of monthIds) {
    const m = months[mId]
    if (!m) continue
    const txs = m.transactions || []
    const cats = m.categories || []

    const targetCat = cats.find(
      (c) => (c.key && c.key === goalKey) || c.name === goalKey || c.id === goalKey,
    )
    const catId = targetCat ? targetCat.id : null
    const catName = targetCat ? targetCat.name : goalKey

    for (const tx of txs) {
      const matchesGoalId = tx.goalId === goalKey || (catId && tx.goalId === catId)
      const matchesTag =
        tx.description &&
        (tx.description.includes(`[goal:${goalKey}]`) || (catId && tx.description.includes(`[goal:${catId}]`)))
      const isDepositByText =
        tx.description &&
        (tx.description.startsWith(`Menabung ke ${catName}`) ||
          tx.description.startsWith(`Menabung ke ${goalKey}`))
      const isWithdrawByText =
        tx.description &&
        (tx.description.startsWith(`Pakai tabungan ${catName}`) ||
          tx.description.startsWith(`Pakai tabungan ${goalKey}`))
      const isGoalDeposit = tx.goalType === 'deposit' && (tx.categoryId === catId || matchesGoalId)
      const isGoalWithdraw = tx.goalType === 'withdraw' && (tx.categoryId === catId || matchesGoalId)
      const isCategoryUsage = catId && tx.categoryId === catId && tx.type === 'expense'

      if (matchesGoalId || matchesTag || isDepositByText || isWithdrawByText || isGoalDeposit || isGoalWithdraw || isCategoryUsage) {
        let type = 'deposit'
        if (isGoalDeposit || isDepositByText) {
          type = 'deposit'
        } else if (isGoalWithdraw || isWithdrawByText || isCategoryUsage) {
          type = 'withdraw'
        }

        const cleanDesc = (tx.description || '').replace(/\[goal:[^\]]+\]\s*/g, '').trim()

        history.push({
          id: tx.id,
          date: tx.date,
          monthId: mId,
          type,
          amount: tx.amount,
          description: cleanDesc || (type === 'deposit' ? `Setoran ke ${catName}` : `Penarikan dari ${catName}`),
          walletId: tx.walletId || null,
          categoryId: tx.categoryId || catId || null,
        })
      }
    }
  }

  history.sort((a, b) => {
    const diff = (b.date || '').localeCompare(a.date || '')
    if (diff !== 0) return diff
    return (b.id || '').localeCompare(a.id || '')
  })

  return history
}

// Proyeksi tanggal tercapai berdasarkan rata-rata setoran 3 bulan terakhir
export function goalProjection(goalKey, months, currentMonthId) {
  if (!goalKey || !months || !currentMonthId || !months[currentMonthId]) return null

  const m = months[currentMonthId]
  const cats = m.categories || []
  const cat = cats.find((c) => (c.key && c.key === goalKey) || c.name === goalKey || c.id === goalKey)
  if (!cat || !cat.goalAmount) return null

  const savedInfo = goalSaved(cat, m.transactions || [])
  const needed = Math.max(0, (cat.goalAmount || 0) - (savedInfo.saved || 0))
  if (needed <= 0) {
    return {
      needed: 0,
      avgMonthlyDeposit: 0,
      monthsNeeded: 0,
      estimatedMonthId: currentMonthId,
      reached: true,
    }
  }

  const match = String(currentMonthId).match(/^(\d{4})-(\d{2})$/)
  if (!match) return null

  const curYear = Number(match[1])
  const curMonth = Number(match[2])

  const targetMonthIds = []
  for (let i = 0; i < 3; i++) {
    const d = new Date(curYear, curMonth - 1 - i, 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    targetMonthIds.push(`${yyyy}-${mm}`)
  }

  const hist = goalHistory(goalKey, months)
  const depositsInWindow = hist.filter(
    (h) => h.type === 'deposit' && targetMonthIds.includes(h.monthId),
  )
  const totalDeposited = depositsInWindow.reduce((s, h) => s + (h.amount || 0), 0)

  const existingMonthsCount = targetMonthIds.filter((id) => !!months[id]).length || 1
  const avgMonthlyDeposit = Math.round(totalDeposited / existingMonthsCount)

  if (avgMonthlyDeposit <= 0) {
    return {
      needed,
      avgMonthlyDeposit: 0,
      monthsNeeded: null,
      estimatedMonthId: null,
      reached: false,
    }
  }

  const monthsNeeded = Math.ceil(needed / avgMonthlyDeposit)
  const targetDate = new Date(curYear, curMonth - 1 + monthsNeeded, 1)
  const estYear = targetDate.getFullYear()
  const estMonth = String(targetDate.getMonth() + 1).padStart(2, '0')
  const estimatedMonthId = `${estYear}-${estMonth}`

  return {
    needed,
    avgMonthlyDeposit,
    monthsNeeded,
    estimatedMonthId,
    reached: false,
  }
}

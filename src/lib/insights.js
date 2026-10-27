function categoryKey(category) {
  return category?.key || category?.name || ''
}

function categorySpending(month) {
  const categories = month?.categories || []
  const byId = new Map(categories.map((category) => [category.id, category]))
  const result = new Map()

  for (const tx of month?.transactions || []) {
    if (tx.type !== 'expense' && tx.type !== 'refund') continue
    const category = byId.get(tx.categoryId)
    if (!category) continue
    const key = categoryKey(category)
    const current = result.get(key) || { key, name: category.name, color: category.color, amount: 0 }
    current.amount += tx.type === 'refund' ? -(tx.amount || 0) : tx.amount || 0
    result.set(key, current)
  }
  return [...result.values()].filter((item) => item.amount > 0)
}

export function buildSpendingInsights(months, monthIds = Object.keys(months || {}).sort()) {
  const ids = monthIds.filter((id) => months[id])
  const insights = []
  const totals = new Map()
  let totalSpending = 0
  let weekendSpending = 0

  for (const id of ids) {
    const month = months[id]
    for (const item of categorySpending(month)) {
      const current = totals.get(item.key) || { ...item, amount: 0 }
      current.amount += item.amount
      totals.set(item.key, current)
    }
    for (const tx of month.transactions || []) {
      if (tx.type !== 'expense' || !tx.date) continue
      const amount = tx.amount || 0
      totalSpending += amount
      const [year, monthNumber, day] = tx.date.split('-').map(Number)
      const weekday = new Date(year, monthNumber - 1, day).getDay()
      if (weekday === 0 || weekday === 6) weekendSpending += amount
    }
  }

  const top = [...totals.values()].sort((a, b) => b.amount - a.amount)[0]
  if (top) insights.push({ type: 'top-category', ...top })

  if (ids.length >= 2) {
    const previous = categorySpending(months[ids[ids.length - 2]])
    const current = categorySpending(months[ids[ids.length - 1]])
    const previousByKey = new Map(previous.map((item) => [item.key, item]))
    const increases = current
      .map((item) => ({
        ...item,
        previousAmount: previousByKey.get(item.key)?.amount || 0,
        increase: item.amount - (previousByKey.get(item.key)?.amount || 0),
      }))
      .filter((item) => item.increase > 0)
      .sort((a, b) => b.increase - a.increase)
    if (increases[0]) insights.push({ type: 'category-increase', ...increases[0] })
  }

  const weekendShare = totalSpending > 0 ? weekendSpending / totalSpending : 0
  if (weekendShare >= 0.4 && totalSpending > 0) {
    insights.push({ type: 'weekend-pattern', weekendShare, weekendSpending, totalSpending })
  }

  return insights.slice(0, 3)
}

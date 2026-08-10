export function monthIdOf(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function addMonths(mId, delta) {
  const [y, m] = mId.split('-').map(Number)
  return monthIdOf(new Date(y, m - 1 + delta, 1))
}

export function labelOf(mId) {
  const [y, m] = mId.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

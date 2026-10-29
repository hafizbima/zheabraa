export function formatRupiah(n) {
  const v = Math.round(Number(n) || 0)
  return 'Rp ' + v.toLocaleString('id-ID')
}

export function formatNumber(n) {
  return Math.round(Number(n) || 0).toLocaleString('id-ID')
}

export function formatNumberInput(val) {
  if (val === null || val === undefined || val === '') return ''
  const digits = String(val).replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

export function toInt(n) {
  if (typeof n === 'number') return Math.round(n)
  const cleaned = String(n || '').replace(/[^\d-]/g, '')
  const v = Math.round(Number(cleaned))
  return Number.isFinite(v) ? v : 0
}

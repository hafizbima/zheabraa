export function formatRupiah(n) {
  const v = Math.round(Number(n) || 0)
  return 'Rp ' + v.toLocaleString('id-ID')
}

export function formatNumber(n) {
  return (Math.round(Number(n) || 0)).toLocaleString('id-ID')
}

export function toInt(n) {
  const v = Math.round(Number(n))
  return Number.isFinite(v) ? v : 0
}

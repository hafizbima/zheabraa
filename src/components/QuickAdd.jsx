import { useState } from 'react'

const INCOME_KEYWORDS = [
  'gaji',
  'bonus',
  'pemasukan',
  'income',
  'thr',
  'komisi',
  'dividen',
  'freelance',
  'inflow',
  'hadiah',
  'reimburse',
  'reimbursement',
]

// parse teks quick-add: "makan 35k" | "makan 35k skincare" | "makan 35k ke skincare" | "gaji 5jt"
// return { description, amount, categoryId, type } atau null
export function parseQuick(text, categories = []) {
  const q = String(text || '').trim()
  if (!q) return null

  // Pola: <deskripsi> <nominal [k/rb/ribu/jt/juta]> [ke] [kategori]
  const m = q.match(/^(.+?)\s+(\d+(?:[.,]\d+)?\s*(?:k|rb|ribu|jt|juta)?)(?:\s+(?:ke\s+)?(.+))?$/i)

  if (m) {
    let rawNumStr = m[2].trim().toLowerCase()
    let multiplier = 1

    if (rawNumStr.endsWith('juta')) {
      multiplier = 1000000
      rawNumStr = rawNumStr.slice(0, -4).trim()
    } else if (rawNumStr.endsWith('jt')) {
      multiplier = 1000000
      rawNumStr = rawNumStr.slice(0, -2).trim()
    } else if (rawNumStr.endsWith('ribu')) {
      multiplier = 1000
      rawNumStr = rawNumStr.slice(0, -4).trim()
    } else if (rawNumStr.endsWith('rb')) {
      multiplier = 1000
      rawNumStr = rawNumStr.slice(0, -2).trim()
    } else if (rawNumStr.endsWith('k')) {
      multiplier = 1000
      rawNumStr = rawNumStr.slice(0, -1).trim()
    }

    rawNumStr = rawNumStr.replace(/,/g, '.')
    let numVal = Number(rawNumStr)

    // Jika tanpa suffix dan memakai titik pemisah ribuan (mis. 50.000)
    if (multiplier === 1 && rawNumStr.includes('.')) {
      const cleaned = rawNumStr.replace(/\./g, '')
      if (!isNaN(cleaned)) numVal = Number(cleaned)
    }

    const calculatedAmount = Math.round((isNaN(numVal) ? 0 : numVal) * multiplier)
    const desc = m[1].trim()
    const rawCatName = m[3]?.trim()

    let cat = null
    if (rawCatName) {
      cat = categories.find((c) => c.name.toLowerCase() === rawCatName.toLowerCase()) || null
    }

    const isIncome = INCOME_KEYWORDS.some((kw) => desc.toLowerCase().includes(kw))

    return {
      description: desc,
      amount: calculatedAmount > 0 ? calculatedAmount : '',
      categoryId: cat ? cat.id : undefined,
      type: isIncome ? 'income' : 'expense',
    }
  }

  // Fallback: Jika pengguna mengetik tanpa nominal (mis. "makan siang" atau "bayar wifi"),
  // tetap buka form dengan deskripsi terisi agar input pengguna tidak hilang diam-diam
  const isIncome = INCOME_KEYWORDS.some((kw) => q.toLowerCase().includes(kw))
  return {
    description: q,
    amount: '',
    categoryId: undefined,
    type: isIncome ? 'income' : 'expense',
  }
}

export default function QuickAdd({ categories, onPick }) {
  const [quick, setQuick] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const prefill = parseQuick(quick, categories)
    setQuick('')
    if (!prefill) return
    onPick(prefill)
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-tactile-sm transition-all focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:shadow-tactile dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          className="flex-1 bg-transparent font-sans text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          placeholder='Cepat: "makan 35k skincare" atau "gaji 5jt"'
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          aria-label="Catat cepat"
        />
        <span className="hidden font-sans text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:inline">Enter untuk buka form</span>
      </div>
    </form>
  )
}

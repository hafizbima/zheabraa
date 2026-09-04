import { useState } from 'react'

// parse teks quick-add: "makan 35k" | "makan 35000 skincare" | "gaji 5jt"
// return { description, amount, categoryId } atau null
export function parseQuick(text, categories = []) {
  const q = String(text || '').trim()
  if (!q) return null
  const m = q.match(/^(.+?)\s+(\d[\d.]*(?:k|rb|jt|juta)?)\s*(?:ke\s*(.+))?$/i)
  if (!m) return null
  let amount = Number(m[2].replace(/[.,]/g, ''))
  const suf = (m[2].toLowerCase().match(/(k|rb|jt|juta)$/) || [])[1]
  if (suf === 'k' || suf === 'rb') amount *= 1000
  else if (suf === 'jt' || suf === 'juta') amount *= 1000000
  const catName = m[3]?.trim()
  const cat = catName ? categories.find((c) => c.name.toLowerCase() === catName.toLowerCase()) : null
  return { description: m[1].trim(), amount: Math.round(amount), categoryId: cat ? cat.id : undefined }
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
    <form onSubmit={submit} className="rounded-2xl border-2 border-carbon bg-paper p-3 dark:border-white/30 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          className="flex-1 bg-transparent text-sm text-carbon outline-none placeholder:text-slate-400 dark:text-white"
          placeholder='Cepat: "makan 35k skincare" atau "gaji 5jt"'
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          aria-label="Catat cepat"
        />
        <span className="hidden text-[10px] text-slate-400 sm:inline">Enter untuk buka form</span>
      </div>
    </form>
  )
}

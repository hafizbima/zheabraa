import { useState } from 'react'
import Modal from './Modal.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt } from '../lib/money.js'
import { categoryLeft } from '../lib/calc.js'
import { btn } from '../lib/buttons.js'

export default function ReallocateForm({ onClose }) {
  const { currentMonth: month, currentMonthId, updateCategory } = useStore()
  const cats = month?.categories || []
  const txs = month?.transactions || []

  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const fromCat = cats.find((c) => c.id === fromId)
  const toCat = cats.find((c) => c.id === toId)
  const fromLeft = fromCat ? categoryLeft(fromCat, txs) : 0
  const amt = toInt(amount)

  const input =
    'w-full rounded-xl border-2 border-black/20 bg-paper px-3 py-2.5 text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

  const submit = async (e) => {
    e.preventDefault()
    if (amt <= 0) return setError('Nominal harus lebih dari 0')
    if (!fromId) return setError('Pilih pocket sumber')
    if (!toId) return setError('Pilih pocket tujuan')
    if (fromId === toId) return setError('Pocket sumber dan tujuan tidak boleh sama')

    await updateCategory(currentMonthId, fromId, { budgetAmount: (fromCat.budgetAmount || 0) - amt })
    await updateCategory(currentMonthId, toId, { budgetAmount: (toCat.budgetAmount || 0) + amt })
    onClose()
  }

  const targetCats = cats.filter((c) => c.id !== fromId)

  return (
    <Modal
      title="Re-alokasi Budget"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={btn.neutral}>Batal</button>
          <button type="submit" form="realloc-form" className={btn.primary}>Pindahkan</button>
        </div>
      }
    >
      <form id="realloc-form" onSubmit={submit} className="space-y-4">
        <p className="rounded-xl border border-carbon bg-sky px-3 py-2 text-xs text-carbon dark:border-white/20 dark:bg-white/5 dark:text-white">
          Geser sebagian budget dari satu pocket ke pocket lain dalam satu langkah.
        </p>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Dari pocket</label>
          <select className={input} value={fromId} onChange={(e) => { setFromId(e.target.value); if (e.target.value === toId) setToId('') }}>
            <option value="">— Pilih pocket —</option>
            {cats.map((c) => {
              const left = categoryLeft(c, txs)
              return (
                <option key={c.id} value={c.id}>
                  {c.name} — sisa {formatRupiah(left)}
                </option>
              )
            })}
          </select>
          {fromCat && (
            <p className={`mt-1 text-xs ${fromLeft < 0 ? 'text-ember font-medium' : 'text-slate-400'}`}>
              Budget saat ini {formatRupiah(fromCat.budgetAmount || 0)} → setelah re-alokasi {formatRupiah((fromCat.budgetAmount || 0) - amt)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nominal (Rp)</label>
          <input type="text" inputMode="numeric" className={input} placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          {amt > 0 && <p className="mt-1 text-xs text-slate-400">{formatRupiah(amt)}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Ke pocket</label>
          <select className={input} value={toId} onChange={(e) => setToId(e.target.value)}>
            <option value="">— Pilih pocket —</option>
            {targetCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — budget {formatRupiah(c.budgetAmount || 0)}
              </option>
            ))}
          </select>
          {toCat && (
            <p className="mt-1 text-xs text-slate-400">
              Budget saat ini {formatRupiah(toCat.budgetAmount || 0)} → setelah {formatRupiah((toCat.budgetAmount || 0) + amt)}
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">{error}</div>
        )}
      </form>
    </Modal>
  )
}
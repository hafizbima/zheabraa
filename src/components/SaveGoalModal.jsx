import { useState } from 'react'
import { formatRupiah, toInt } from '../lib/money.js'
import { btn } from '../lib/buttons.js'

// mode: 'nabung' (uang bebas → tabungan) | 'pakai' (tabungan → belanja)
export default function SaveGoalModal({ cat, mode = 'nabung', available = 0, onSubmit, onClose }) {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const isUse = mode === 'pakai'
  const amt = toInt(amount)
  const over = isUse && amt > available

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={onClose} />
      <div className="modal-panel relative z-10 w-full max-w-sm rounded-3xl border border-slate-200/80 bg-white p-6 shadow-tactile dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">
          {isUse ? 'Pakai tabungan ' : 'Simpan ke '}{cat.name}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {isUse
            ? `Uang diambil dari tabungan (tersedia ${formatRupiah(available)}) untuk belanja.`
            : 'Uang akan dikeluarkan dari Uang Bebas dan ditambahkan ke tabungan.'}
        </p>
        <div className="mt-4 space-y-2.5">
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            type="text"
            inputMode="numeric"
            placeholder="Nominal (Rp)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
          {amount && amt > 0 && <p className="font-sans text-xs font-semibold text-teal-600 dark:text-teal-400">{formatRupiah(amt)}</p>}
          {isUse && (
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              type="text"
              placeholder="Untuk apa? (mis. Beli laptop)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          )}
        </div>
        {over && <p className="mt-2 text-xs font-medium text-rose-500">Melebihi tabungan tersedia ({formatRupiah(available)}).</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className={btn.neutral}>Batal</button>
          <button
            onClick={() => {
              if (amt <= 0 || over) return
              onSubmit(amt, desc.trim())
              onClose()
            }}
            disabled={!amount || amt <= 0 || over}
            className={btn.primary}
          >
            {isUse ? 'Pakai' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

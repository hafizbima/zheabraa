import { useState } from 'react'
import { formatRupiah, toInt } from '../lib/money.js'
import { btn } from '../lib/buttons.js'

export default function SaveGoalModal({ cat, onSubmit, onClose }) {
  const [amount, setAmount] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-carbon/60 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-panel relative z-10 w-full max-w-sm rounded-2xl border-2 border-carbon bg-paper p-5 dark:border-white/30 dark:bg-slate-900">
        <h3 className="text-lg font-bold text-carbon dark:text-white">Simpan ke {cat.name}</h3>
        <p className="mt-1 text-xs text-slate-400">Uang akan dikeluarkan dari Uang Bebas dan ditambahkan ke tabungan.</p>
        <div className="mt-3">
          <input
            className="w-full rounded-xl border-2 border-black/20 bg-paper px-3 py-2 text-sm text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white"
            type="text"
            inputMode="numeric"
            placeholder="Nominal (Rp)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
          {amount && toInt(amount) > 0 && (
            <p className="mt-1 text-xs text-slate-400">{formatRupiah(toInt(amount))}</p>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className={btn.neutral}>Batal</button>
          <button
            onClick={() => {
              const amt = toInt(amount)
              if (amt <= 0) return
              onSubmit(amt)
              onClose()
            }}
            disabled={!amount || toInt(amount) <= 0}
            className={btn.primary}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

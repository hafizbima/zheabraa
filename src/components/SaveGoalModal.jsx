import { useState } from 'react'
import Modal from './Modal.jsx'
import { formatRupiah, toInt, formatNumberInput } from '../lib/money.js'
import { btn } from '../lib/buttons.js'

// mode: 'nabung' (uang bebas → tabungan) | 'pakai' (tabungan → belanja)
export default function SaveGoalModal({ cat, mode = 'nabung', available = 0, onSubmit, onClose }) {
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const isUse = mode === 'pakai'
  const amt = toInt(amount)
  const over = isUse && amt > available

  return (
    <Modal
      title={isUse ? `Pakai tabungan ${cat.name}` : `Simpan ke ${cat.name}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
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
      }
    >
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {isUse
          ? `Uang diambil dari tabungan (tersedia ${formatRupiah(available)}) untuk belanja.`
          : 'Uang akan dikeluarkan dari Uang Bebas dan ditambahkan ke tabungan.'}
      </p>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nominal (Rp)</label>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(formatNumberInput(e.target.value))}
            autoFocus
          />
          {amount && amt > 0 && <p className="mt-1 font-sans text-xs font-semibold text-teal-600 dark:text-teal-400">{formatRupiah(amt)}</p>}
        </div>
        {isUse && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Keperluan</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              type="text"
              placeholder="Untuk apa? (mis. Beli laptop)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        )}
      </div>
      {over && <p className="mt-3 text-xs font-medium text-rose-500">Melebihi tabungan tersedia ({formatRupiah(available)}).</p>}
    </Modal>
  )
}

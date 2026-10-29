import { useState } from 'react'
import Modal from './Modal.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt, formatNumberInput } from '../lib/money.js'
import { todayISO } from '../lib/dates.js'
import { walletBalance, allTransactions } from '../lib/calc.js'
import { haptic } from '../lib/haptics.js'
import { btn } from '../lib/buttons.js'

export default function TransferForm({ monthId, onClose }) {
  const { months, wallets, addTransaction } = useStore()
  const all = allTransactions(months)
  const bal = (id) => {
    const w = wallets.find((x) => x.id === id)
    return w ? walletBalance(w, all) : 0
  }

  const [date, setDate] = useState(todayISO())
  const [amount, setAmount] = useState('')
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const input =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-sans text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  const amt = toInt(amount)
  const fromOver = fromId && amt > 0 && amt > bal(fromId)

  const swap = () => {
    setFromId(toId)
    setToId(fromId)
  }

  const submit = (e) => {
    e.preventDefault()
    if (amt <= 0) return setError('Nominal harus lebih dari 0')
    if (!date) return setError('Tanggal wajib diisi')
    if (!fromId) return setError('Pilih dompet asal')
    if (!toId) return setError('Pilih dompet tujuan')
    if (fromId === toId) return setError('Dompet asal dan tujuan tidak boleh sama')
    if (amt > bal(fromId)) return setError(`Melebihi saldo ${formatRupiah(bal(fromId))}, transfer dibatalkan`)

    addTransaction(monthId, {
      date,
      type,
      amount: amt,
      categoryId: null,
      walletId: fromId,
      toWalletId: toId,
      description: description.trim(),
    })
    haptic.success()
    onClose()
  }

  return (
    <Modal
      title="Transfer Antar Dompet"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={btn.neutral}>
            Batal
          </button>
          <button type="submit" form="transfer-form" className={btn.primary}>
            Simpan Transfer
          </button>
        </div>
      }
    >
      <form id="transfer-form" onSubmit={submit} className="space-y-4">
        <p className="rounded-xl border border-teal-200/80 bg-teal-50/60 px-3.5 py-2 text-xs text-teal-800 dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-200">
          Memindahkan uang antar dompet tanpa memengaruhi pocket atau uang bebas.
        </p>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Nominal (Rp)</label>
          <input
            type="text"
            inputMode="numeric"
            className={input}
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(formatNumberInput(e.target.value))}
            autoFocus
          />
          {amt > 0 && <p className="mt-1 text-xs text-slate-400">{formatRupiah(amt)}</p>}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Dari dompet</label>
            <select
              className={input}
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value)
                if (e.target.value === toId) setToId('')
              }}
            >
              <option value="">(Pilih dompet)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {fromId && (
              <p className={`mt-1 text-xs ${fromOver ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {fromOver ? 'Melebihi saldo: ' : 'Saldo: '}
                {formatRupiah(bal(fromId))}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swap}
              disabled={!fromId && !toId}
              aria-label="Tukar arah transfer"
              className="rounded-full p-2 text-slate-900 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-slate-800"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4M7 4L3 8M7 4l4 4" />
                <path d="M17 8v12M17 20l4-4M17 20l-4-4" />
              </svg>
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Ke dompet</label>
            <select
              className={input}
              value={toId}
              onChange={(e) => {
                setToId(e.target.value)
                if (e.target.value === fromId) setFromId('')
              }}
            >
              <option value="">(Pilih dompet)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {toId && <p className="mt-1 text-xs text-slate-400">Saldo {formatRupiah(bal(toId))}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tanggal</label>
          <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Keterangan (opsional)</label>
          <input
            className={input}
            placeholder="mis. pindah saldo ke rekening"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {wallets.length < 2 && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
            Butuh minimal 2 dompet untuk transfer. Tambahkan lewat menu "Dompet".
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</div>
        )}
      </form>
    </Modal>
  )
}
import { useState } from 'react'
import Modal from './Modal.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt } from '../lib/money.js'
import { todayISO } from '../lib/dates.js'
import { walletBalance, allTransactions } from '../lib/calc.js'
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
    'w-full rounded-xl border-2 border-black/20 bg-paper px-3 py-2.5 text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

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
    if (amt > bal(fromId)) return setError(`Melebihi saldo ${formatRupiah(bal(fromId))} — transfer dibatalkan`)

    addTransaction(monthId, {
      date,
      type: 'transfer',
      amount: amt,
      categoryId: null,
      walletId: fromId,
      toWalletId: toId,
      description: description.trim(),
    })
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
        <p className="rounded-xl border border-carbon bg-sky px-3 py-2 text-xs text-carbon dark:border-white/20 dark:bg-white/5 dark:text-white">
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
            onChange={(e) => setAmount(e.target.value)}
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
              <option value="">— Pilih dompet —</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {fromId && (
              <p className={`mt-1 text-xs ${fromOver ? 'font-medium text-ember' : 'text-slate-400'}`}>
                {fromOver ? 'Melebihi saldo — ' : 'Saldo '}
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
              className="rounded-full p-2 text-carbon transition hover:bg-mist active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white dark:hover:bg-slate-700"
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
              <option value="">— Pilih dompet —</option>
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
          <p className="rounded-xl border border-carbon bg-sunburst/40 px-3 py-2 text-sm text-carbon dark:border-white/20 dark:bg-white/5">
            Butuh minimal 2 dompet untuk transfer. Tambahkan lewat menu "Dompet".
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">{error}</div>
        )}
      </form>
    </Modal>
  )
}
import { useState, useEffect } from 'react'
import Modal from './Modal.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt } from '../lib/money.js'
import { todayISO } from '../lib/dates.js'
import { btn } from '../lib/buttons.js'

export default function TransactionForm({ monthId, transaction, prefill, onClose }) {
  const { currentMonth: month, months, wallets, addTransaction, updateTransaction } = useStore()

  const [date, setDate] = useState(transaction?.date || todayISO())
  const [type, setType] = useState(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction ? String(transaction.amount || '') : '')
  const [categoryId, setCategoryId] = useState(
    transaction ? transaction.categoryId || 'free' : prefill?.categoryId || 'free',
  )
  const [walletId, setWalletId] = useState(transaction?.walletId || '')
  const [toWalletId, setToWalletId] = useState(transaction?.toWalletId || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [error, setError] = useState('')
  const isSingle = wallets.length === 1
  const primary = wallets[0] || null

  useEffect(() => {
    if (!transaction && isSingle && primary && !walletId) setWalletId(primary.id)
  }, [isSingle, primary, transaction, walletId])

  const isTransfer = transaction?.type === 'transfer' || type === 'transfer'
  const isFree = !isTransfer && categoryId === 'free'
  const targetMonth = date ? date.slice(0, 7) : monthId
  const monthMismatch = targetMonth !== monthId
  const categorySourceMonth = months[targetMonth] || month
  const input =
    'w-full rounded-xl border-2 border-black/20 bg-paper px-3 py-2.5 text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

  const submit = (e) => {
    e.preventDefault()
    const amt = toInt(amount)
    if (amt <= 0) return setError('Nominal harus lebih dari 0')
    if (!date) return setError('Tanggal wajib diisi')
    if (isTransfer) {
      if (!walletId) return setError('Pilih dompet asal')
      if (!toWalletId) return setError('Pilih dompet tujuan')
      if (walletId === toWalletId) return setError('Dompet asal dan tujuan tidak boleh sama')
    } else if (isFree && !description.trim()) {
      return setError('Keterangan wajib diisi untuk Uang Bebas')
    }

    const payload = {
      date,
      type,
      amount: amt,
      categoryId: isTransfer ? null : isFree ? null : categoryId,
      walletId: isTransfer ? walletId : walletId || (isSingle ? primary?.id : null),
      toWalletId: isTransfer ? toWalletId : null,
      description: description.trim(),
    }

    if (transaction) updateTransaction(monthId, transaction.id, payload)
    else addTransaction(monthId, payload)
    onClose()
  }

  const typeButton = (key, label, active) => (
    <button
      type="button"
      onClick={() => setType(key)}
      className={`rounded-xl border-2 px-3 py-2 text-sm font-medium transition ${
        active
          ? key === 'refund'
            ? 'border-carbon bg-mint/50 text-carbon'
            : 'border-carbon bg-ember/15 text-ember'
          : 'border-black/20 bg-paper text-slate-500 hover:bg-mist dark:border-white/20 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {key === 'refund' ? 'Refund / Koreksi' : 'Pengeluaran'}
    </button>
  )

  return (
    <Modal
      title={transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={btn.neutral}>
            Batal
          </button>
          <button
            type="submit"
            form="tx-form"
            className={btn.primary}
          >
            {transaction ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>
      }
    >
      <form id="tx-form" onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tanggal</label>
          <input type="date" className={input} value={date} onChange={(e) => setDate(e.target.value)} />
          {monthMismatch && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
              Tanggal ini akan tercatat di <strong>{targetMonth}</strong>, bukan di bulan yang sedang dibuka. Pocket yang kepotong adalah pocket bulan {targetMonth}.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tipe</label>
          {isTransfer ? (
            <p className="rounded-xl border border-carbon bg-sky px-3 py-2 text-sm text-carbon dark:border-white/20 dark:bg-white/5 dark:text-white">
              Ini transaksi transfer antar dompet. Edit dari sini tidak disarankan — gunakan menu "Transfer".&nbsp; Nominal tidak mengubah pocket/uang bebas.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {typeButton('expense', 'Pengeluaran', type === 'expense')}
                {typeButton('refund', 'Refund / Koreksi', type === 'refund')}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {type === 'refund'
                  ? 'Refund menambah sisa (uang kembali ke pocket/uang bebas).'
                  : 'Pengeluaran mengurangi sisa pocket/uang bebas.'}
              </p>
            </>
          )}
        </div>

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
          {amount && toInt(amount) > 0 && (
            <p className="mt-1 text-xs text-slate-400">{formatRupiah(toInt(amount))}</p>
          )}
        </div>

        {isTransfer ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Dompet asal</label>
              <select className={input} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                <option value="">— Pilih dompet —</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Dompet tujuan</label>
              <select className={input} value={toWalletId} onChange={(e) => setToWalletId(e.target.value)}>
                <option value="">— Pilih dompet —</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Kategori / Pocket {monthMismatch && `— pocket bulan ${targetMonth}`}</label>
            <select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="free">Uang Bebas (tidak dari pocket)</option>
              {(categorySourceMonth?.categories || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isTransfer && (
          isSingle ? (
            <p className="rounded-xl border border-black/10 bg-sky/20 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Tercatat di <strong>{primary?.name}</strong> — pocket adalah sekat virtual dari rekening ini.
            </p>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Dompet (opsional)</label>
              <select className={input} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                <option value="">— Tidak dilacak —</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Keterangan {isFree && <span className="text-ember">*</span>}
          </label>
          <input
            className={input}
            placeholder={
              isTransfer
                ? 'Opsional, mis. pindah saldo ke rekening'
                : isFree
                  ? 'Wajib diisi untuk uang bebas'
                  : 'Contoh: bensin, makan siang'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">{error}</div>
        )}
      </form>
    </Modal>
  )
}

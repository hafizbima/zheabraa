import { useState, useEffect } from 'react'
import Modal from './Modal.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt } from '../lib/money.js'
import { todayISO } from '../lib/dates.js'
import { categoryLeft, goalSaved } from '../lib/calc.js'
import { haptic } from '../lib/haptics.js'
import { btn } from '../lib/buttons.js'

export default function TransactionForm({ monthId, transaction, prefill, onClose }) {
  const { currentMonth: month, months, wallets, addTransaction, updateTransaction } = useStore()

  const [date, setDate] = useState(transaction?.date || prefill?.date || todayISO())
  const [type, setType] = useState(transaction?.type || 'expense')
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount || '') : prefill?.amount ? String(prefill.amount) : '',
  )
  const [categoryId, setCategoryId] = useState(
    transaction ? transaction.categoryId || 'free' : prefill?.categoryId || 'free',
  )
  const [walletId, setWalletId] = useState(transaction?.walletId || '')
  const [toWalletId, setToWalletId] = useState(transaction?.toWalletId || '')
  const [description, setDescription] = useState(transaction?.description || prefill?.description || '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isSingle = wallets.length === 1
  const primary = wallets[0] || null

  useEffect(() => {
    if (!transaction && isSingle && primary && !walletId) setWalletId(primary.id)
  }, [isSingle, primary, transaction, walletId])

  const isTransfer = transaction?.type === 'transfer' || type === 'transfer'
  const isIncome = transaction?.type === 'income' || type === 'income'
  const isFree = !isTransfer && !isIncome && categoryId === 'free'
  const targetMonth = date ? date.slice(0, 7) : monthId
  const monthMismatch = targetMonth !== monthId
  const categorySourceMonth = months[targetMonth] || month
  // sisa dana pocket yang dipilih (di bulan tujuan):
  // pocket tabungan (bertarget) → saldo tabungan; pocket biasa → sisa budget
  const selectedCat = !isTransfer && !isIncome && !isFree
    ? (categorySourceMonth?.categories || []).find((c) => c.id === categoryId)
    : null
  const catSisa = selectedCat
    ? (selectedCat.goalAmount > 0
        ? goalSaved(selectedCat, categorySourceMonth?.transactions || []).saved
        : categoryLeft(selectedCat, categorySourceMonth?.transactions || []))
    : null
  const amt = toInt(amount)
  const overPocket = selectedCat && amt > 0 && amt > catSisa
  const input =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-sans text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  const submit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    const amt = toInt(amount)
    if (amt <= 0) return setError('Nominal harus lebih dari 0')
    if (!date) return setError('Tanggal wajib diisi')
    if (isTransfer) {
      if (!walletId) return setError('Pilih dompet asal')
      if (!toWalletId) return setError('Pilih dompet tujuan')
      if (walletId === toWalletId) return setError('Dompet asal dan tujuan tidak boleh sama')
    } else if (isFree && !description.trim()) {
      return setError('Keterangan wajib diisi untuk Uang Bebas')
    } else if (isIncome && !description.trim()) {
      return setError('Keterangan wajib diisi untuk Pemasukan (mis. Gaji, Bonus)')
    }

    const payload = {
      date,
      type,
      amount: amt,
      categoryId: isTransfer || isIncome ? null : isFree ? null : categoryId,
      walletId: isTransfer ? walletId : walletId || (isSingle ? primary?.id : null),
      toWalletId: isTransfer ? toWalletId : null,
      recurringTemplateId: transaction?.recurringTemplateId || prefill?.recurringTemplateId || null,
      description: description.trim() || (isIncome ? 'Pemasukan' : ''),
    }

    if (transaction) updateTransaction(monthId, transaction.id, payload)
    else addTransaction(monthId, payload)
    haptic.success()
    onClose()
  }

  const typeButton = (key, label, active) => (
    <button
      type="button"
      onClick={() => {
        haptic.selection()
        setType(key)
      }}
      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
        active
          ? key === 'income'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
            : key === 'refund'
              ? 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300'
              : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <Modal
      title={transaction ? (isIncome ? 'Edit Pemasukan' : 'Edit Transaksi') : (isIncome ? 'Tambah Pemasukan' : 'Tambah Transaksi')}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className={btn.neutral}>
            Batal
          </button>
          <button
            type="submit"
            form="tx-form"
            disabled={submitting}
            className={btn.primary}
          >
            {submitting ? 'Menyimpan…' : transaction ? 'Simpan Perubahan' : 'Simpan'}
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
            <p className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
              Ini transaksi transfer antar dompet. Edit dari sini tidak disarankan, gunakan menu "Transfer".&nbsp; Nominal tidak mengubah pocket/uang bebas.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {typeButton('expense', 'Pengeluaran', type === 'expense')}
                {typeButton('income', 'Pemasukan', type === 'income')}
                {typeButton('refund', 'Refund / Koreksi', type === 'refund')}
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {type === 'income'
                  ? 'Pemasukan menambah saldo dompet dan total uang bebas bulan ini.'
                  : type === 'refund'
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
                <option value="">(Pilih dompet)</option>
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
                <option value="">(Pilih dompet)</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : isIncome ? (
          <div>
            <p className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              Pemasukan tidak memerlukan pocket. Dana akan langsung menambah saldo dompet dan total Uang Bebas bulan ini.
            </p>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Kategori / Pocket {monthMismatch && `(pocket bulan ${targetMonth})`}</label>
            <select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="free">Uang Bebas (tidak dari pocket)</option>
              {(categorySourceMonth?.categories || []).map((c) => {
                const sisa = c.goalAmount > 0
                  ? goalSaved(c, categorySourceMonth?.transactions || []).saved
                  : categoryLeft(c, categorySourceMonth?.transactions || [])
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}: sisa {formatRupiah(sisa)}
                  </option>
                )
              })}
            </select>
            {isFree ? (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Sweep/pindah dana di myBCA tidak perlu dicatat, cukup pilih pocket asal dananya di sini.
              </p>
            ) : selectedCat && (
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {selectedCat.goalAmount > 0
                  ? <>Pocket tabungan: uang keluar dari tabungan ini. Sisa tabungan: <strong>{formatRupiah(catSisa)}</strong>.</>
                  : <>Tidak perlu sweep ke rekening utama dulu, cukup pilih pocket ini & nominal. Sisa: <strong>{formatRupiah(catSisa)}</strong>.</>}
              </p>
            )}
            {overPocket && (
              <p className="mt-1 rounded-xl border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-300">
                Nominal melebihi sisa pocket ({formatRupiah(catSisa)}), masih bisa disimpan, sisa pocket akan minus.
              </p>
            )}
          </div>
        )}

        {!isTransfer && (
          isSingle ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
              Tercatat di <strong>{primary?.name}</strong>{isIncome ? ' (saldo dompet bertambah)' : ': pocket adalah sekat virtual dari rekening ini'}.
            </p>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">{isIncome ? 'Dompet Penerima' : 'Dompet (opsional)'}</label>
              <select className={input} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                <option value="">(Tidak dilacak)</option>
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
            {isIncome ? 'Keterangan Pemasukan' : 'Keterangan'} {(isFree || isIncome) && <span className="text-rose-500">*</span>}
          </label>
          <input
            className={input}
            placeholder={
              isTransfer
                ? 'Opsional, mis. pindah saldo ke rekening'
                : isIncome
                  ? 'Contoh: Gaji, Bonus, Freelance'
                  : isFree
                    ? 'Wajib diisi untuk uang bebas'
                    : 'Contoh: bensin, makan siang'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">{error}</div>
        )}
      </form>
    </Modal>
  )
}

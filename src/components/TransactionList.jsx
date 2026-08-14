import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { formatDate } from '../lib/dates.js'
import Confirm from './Confirm.jsx'
import { btn } from '../lib/buttons.js'

export default function TransactionList({ onEditTx }) {
  const { currentMonth: month, currentMonthId, removeTransaction } = useStore()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterWallet, setFilterWallet] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const txs = month?.transactions || []
  const categories = month?.categories || []
  const { wallets } = useStore()

  const catName = (t) =>
    t.type === 'transfer'
      ? 'Transfer Dompet'
      : t.categoryId == null
        ? 'Uang Bebas'
        : categories.find((c) => c.id === t.categoryId)?.name || '—'
  const catColor = (t) =>
    t.type === 'transfer'
      ? '#0ea5e9'
      : t.categoryId == null
        ? '#64748b'
        : categories.find((c) => c.id === t.categoryId)?.color || '#64748b'
  const walletName = (id) => (id ? wallets.find((w) => w.id === id)?.name || '—' : null)

  const hasFilter =
    filterCategory !== 'all' ||
    filterWallet !== 'all' ||
    !!fromDate ||
    !!toDate ||
    search.trim() !== ''

  const resetFilters = () => {
    setSearch('')
    setFilterCategory('all')
    setFilterWallet('all')
    setFromDate('')
    setToDate('')
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return txs
      .filter((t) => {
        if (
          filterCategory === 'free'
            ? t.categoryId != null || t.type === 'transfer'
            : filterCategory !== 'all' && t.categoryId !== filterCategory
        ) {
          return false
        }
        if (
          filterWallet === ''
            ? t.walletId != null
            : filterWallet !== 'all' && t.walletId !== filterWallet && t.toWalletId !== filterWallet
        )
          return false
        if (fromDate && t.date < fromDate) return false
        if (toDate && t.date > toDate) return false
        if (q && !(t.description || '').toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1))
  }, [txs, filterCategory, filterWallet, fromDate, toDate, search])

  const spent = filtered
    .filter((t) => t.type === 'expense')
    .reduce((a, t) => a + t.amount, 0)
  const refunded = filtered
    .filter((t) => t.type === 'refund')
    .reduce((a, t) => a + t.amount, 0)

  const input =
    'w-full rounded-xl border-2 border-black/20 bg-paper px-3 py-2 text-sm text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

  const group = {}
  for (const t of filtered) {
    ;(group[t.date] = group[t.date] || []).push(t)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={input}
            placeholder="Cari keterangan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={input} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Semua kategori</option>
            <option value="free">Uang Bebas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className={input} value={filterWallet} onChange={(e) => setFilterWallet(e.target.value)}>
            <option value="all">Semua dompet</option>
            <option value="">Tanpa dompet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={input} value={fromDate} onChange={(e) => setFromDate(e.target.value)} title="Dari tanggal" />
            <input type="date" className={input} value={toDate} onChange={(e) => setToDate(e.target.value)} title="Sampai tanggal" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-ember">{formatRupiah(spent)}</span> keluar
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-mint">{formatRupiah(refunded)}</span> refund
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-carbon dark:text-white">{filtered.length}</span> transaksi
          </span>
        </div>
      </section>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black/30 bg-paper p-8 text-center dark:border-white/20 dark:bg-slate-900">
          <p className="text-sm text-slate-400">
            {hasFilter ? 'Tidak ada transaksi yang cocok dengan filter.' : 'Belum ada transaksi di bulan ini.'}
          </p>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className={`${btn.ghost} mt-3`}
            >
              Reset filter
            </button>
          )}
        </div>
      ) : (
        Object.entries(group).map(([date, items]) => (
          <section key={date}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {formatDate(date)}
            </p>
            <div className="space-y-2">
              {items.map((t) => {
                const isTransfer = t.type === 'transfer'
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-carbon bg-paper p-3 dark:border-white/20 dark:bg-slate-900"
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: catColor(t) }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-carbon dark:text-white">{catName(t)}</p>
                      <p className="truncate text-xs text-slate-400">
                        {isTransfer
                          ? `${walletName(t.walletId) || '—'} → ${walletName(t.toWalletId) || '—'}${t.description ? ` • ${t.description}` : ''}`
                          : `${t.description || '—'}${walletName(t.walletId) ? ` • ${walletName(t.walletId)}` : ''}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${isTransfer ? 'text-violet dark:text-lavender' : t.type === 'refund' ? 'text-mint' : 'text-ember'}`}>
                        {isTransfer ? '⇄ ' : t.type === 'refund' ? '+' : '−'}{formatRupiah(t.amount)}
                      </p>
                      <div className="mt-0.5 flex justify-end gap-1">
                        <button onClick={() => onEditTx(currentMonthId, t)} className={btn.subtle}>
                          Ubah
                        </button>
                        <button onClick={() => setConfirmId(t.id)} className={btn.subtleDanger}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}

      {confirmId && (
        <Confirm
          title="Hapus transaksi"
          message="Transaksi ini akan dihapus permanen. Lanjutkan?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            removeTransaction(currentMonthId, confirmId)
            setConfirmId(null)
          }}
        />
      )}
    </div>
  )
}
